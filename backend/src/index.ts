import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { allow, AuthUser, requireAuth, signToken } from "./auth";
import { isoDate, num, query } from "./db";

const app = express();
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
        return;
      }
      callback(null, process.env.CORS_ORIGIN || false);
    },
    credentials: true,
  })
);
app.use(express.json());

function monthBounds(month: string) {
  const start = `${month.slice(0, 7)}-01`;
  const [y, m] = start.split("-").map(Number);
  const endDate = new Date(Date.UTC(y, m, 0));
  return { start, end: endDate.toISOString().slice(0, 10) };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "barbazza-api" });
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = z.object({ username: z.string().min(1), password: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }
  try {
    const rows = await query<{
      user_id: number;
      username: string;
      full_name: string;
      role: AuthUser["role"];
      verified: boolean;
    }>(
      `SELECT user_id, username, full_name, role,
              (crypt($2, password_hash) = password_hash) AS verified
       FROM users
       WHERE username = $1 AND is_active = TRUE`,
      [parsed.data.username, parsed.data.password]
    );
    const user = rows[0];
    if (!user || !user.verified) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    await query(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1`, [user.user_id]);
    const barber = await query<{ barber_id: number }>(
      `SELECT barber_id FROM barbers WHERE user_id = $1 LIMIT 1`,
      [user.user_id]
    );
    const authUser: AuthUser = {
      userId: Number(user.user_id),
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      barberId: barber[0] ? Number(barber[0].barber_id) : null,
    };
    res.json({ token: signToken(authUser), user: authUser });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Login failed" });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/dashboard/overview", requireAuth, allow("admin"), async (_req, res) => {
  try {
    const [users, barbers, today, week, month] = await Promise.all([
      query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM users`),
      query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM barbers WHERE is_active = TRUE`),
      query<{ income: string; customers: string }>(
        `SELECT COALESCE(SUM(amount),0) AS income, COUNT(*)::int AS customers
         FROM transactions WHERE transaction_date = CURRENT_DATE`
      ),
      query<{ income: string; customers: string; expenses: string }>(
        `SELECT
           (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days') AS income,
           (SELECT COUNT(*)::int FROM transactions WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days') AS customers,
           (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE expense_date >= CURRENT_DATE - INTERVAL '7 days') AS expenses`
      ),
      query<{ income: string; customers: string; expenses: string; days: string }>(
        `SELECT
           (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE transaction_date >= date_trunc('month', CURRENT_DATE)) AS income,
           (SELECT COUNT(*)::int FROM transactions WHERE transaction_date >= date_trunc('month', CURRENT_DATE)) AS customers,
           (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE expense_date >= date_trunc('month', CURRENT_DATE)) AS expenses,
           (SELECT COUNT(DISTINCT transaction_date)::int FROM transactions WHERE transaction_date >= date_trunc('month', CURRENT_DATE)) AS days`
      ),
    ]);
    const income = num(month[0]?.income);
    const expenses = num(month[0]?.expenses);
    const days = Math.max(1, num(month[0]?.days));
    const trend = await query<{ day: string; total: string }>(
      `SELECT transaction_date AS day, COALESCE(SUM(amount),0) AS total
       FROM transactions
       WHERE transaction_date >= date_trunc('month', CURRENT_DATE)
       GROUP BY transaction_date ORDER BY transaction_date`
    );
    res.json({
      totalUsers: num(users[0]?.count),
      activeBarbers: num(barbers[0]?.count),
      today: { income: num(today[0]?.income), customers: num(today[0]?.customers) },
      week: {
        income: num(week[0]?.income),
        customers: num(week[0]?.customers),
        expenses: num(week[0]?.expenses),
        profit: num(week[0]?.income) - num(week[0]?.expenses),
      },
      month: {
        income,
        customers: num(month[0]?.customers),
        expenses,
        profit: income - expenses,
        avgDaily: income / days,
      },
      trend: trend.map((row) => ({ date: isoDate(row.day), total: num(row.total) })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load overview" });
  }
});

app.get("/api/dashboard/performance", requireAuth, allow("admin"), async (req, res) => {
  const month = String(req.query.month || new Date().toISOString().slice(0, 7));
  const { start, end } = monthBounds(month);
  try {
    const salon = await query<{ income: string; customers: string; expenses: string; days: string }>(
      `SELECT
         (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE transaction_date BETWEEN $1 AND $2) AS income,
         (SELECT COUNT(*)::int FROM transactions WHERE transaction_date BETWEEN $1 AND $2) AS customers,
         (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE expense_date BETWEEN $1 AND $2) AS expenses,
         (SELECT COUNT(DISTINCT transaction_date)::int FROM transactions WHERE transaction_date BETWEEN $1 AND $2) AS days`,
      [start, end]
    );
    const income = num(salon[0]?.income);
    const expenses = num(salon[0]?.expenses);
    const days = num(salon[0]?.days);
    const ranking = await query<{
      barber_id: number;
      barber_code: string;
      full_name: string | null;
      customers: string;
      earned: string;
    }>(
      `SELECT b.barber_id, b.barber_code, u.full_name,
              COUNT(t.transaction_id)::int AS customers,
              COALESCE(SUM(t.amount),0) AS earned
       FROM barbers b
       LEFT JOIN users u ON b.user_id = u.user_id
       LEFT JOIN transactions t ON b.barber_id = t.barber_id
         AND t.transaction_date BETWEEN $1 AND $2
       WHERE b.is_active = TRUE
       GROUP BY b.barber_id, b.barber_code, u.full_name
       ORDER BY earned DESC NULLS LAST`,
      [start, end]
    );
    const trend = await query<{ day: string; total: string }>(
      `SELECT transaction_date AS day, COALESCE(SUM(amount),0) AS total
       FROM transactions WHERE transaction_date BETWEEN $1 AND $2
       GROUP BY transaction_date ORDER BY transaction_date`,
      [start, end]
    );
    res.json({
      month: start.slice(0, 7),
      salon: {
        income,
        customers: num(salon[0]?.customers),
        expenses,
        profit: income - expenses,
        days,
        avgDaily: income / Math.max(1, days),
      },
      ranking: ranking.map((row, index) => ({
        rank: index + 1,
        barberId: Number(row.barber_id),
        code: row.barber_code,
        name: row.full_name || row.barber_code,
        customers: num(row.customers),
        earned: num(row.earned),
        share: income > 0 ? Math.round((num(row.earned) / income) * 1000) / 10 : 0,
      })),
      trend: trend.map((row) => ({ date: isoDate(row.day), total: num(row.total) })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load performance" });
  }
});

app.get("/api/barbers", requireAuth, async (_req, res) => {
  try {
    const rows = await query<{ barber_id: number; barber_code: string; full_name: string | null; commission_rate: string }>(
      `SELECT b.barber_id, b.barber_code, u.full_name, b.commission_rate
       FROM barbers b
       LEFT JOIN users u ON b.user_id = u.user_id
       WHERE b.is_active = TRUE
       ORDER BY b.barber_code`
    );
    res.json(
      rows.map((row) => ({
        id: Number(row.barber_id),
        code: row.barber_code,
        name: row.full_name || row.barber_code,
        commissionRate: num(row.commission_rate),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load barbers" });
  }
});

app.get("/api/dashboard/barber", requireAuth, allow("admin"), async (req, res) => {
  const month = String(req.query.month || new Date().toISOString().slice(0, 7));
  const barberId = Number(req.query.barberId);
  if (!barberId) {
    res.status(400).json({ error: "Select a barber" });
    return;
  }
  const { start, end } = monthBounds(month);
  try {
    const rows = await query<{
      full_name: string | null;
      barber_code: string;
      customers: string;
      earned: string;
      avg: string;
      days: string;
    }>(
      `SELECT u.full_name, b.barber_code,
              COUNT(t.transaction_id)::int AS customers,
              COALESCE(SUM(t.amount),0) AS earned,
              COALESCE(AVG(t.amount),0) AS avg,
              COUNT(DISTINCT t.transaction_date)::int AS days
       FROM barbers b
       LEFT JOIN users u ON b.user_id = u.user_id
       LEFT JOIN transactions t ON b.barber_id = t.barber_id
         AND t.transaction_date BETWEEN $1 AND $2
       WHERE b.barber_id = $3
       GROUP BY b.barber_id, b.barber_code, u.full_name`,
      [start, end, barberId]
    );
    const trend = await query<{ day: string; total: string }>(
      `SELECT transaction_date AS day, COALESCE(SUM(amount),0) AS total
       FROM transactions
       WHERE barber_id = $1 AND transaction_date BETWEEN $2 AND $3
       GROUP BY transaction_date ORDER BY transaction_date`,
      [barberId, start, end]
    );
    const row = rows[0];
    res.json({
      name: row?.full_name || row?.barber_code || "Barber",
      code: row?.barber_code || "",
      customers: num(row?.customers),
      earned: num(row?.earned),
      avg: num(row?.avg),
      days: num(row?.days),
      trend: trend.map((item) => ({ date: isoDate(item.day), total: num(item.total) })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load barber" });
  }
});

async function daySnapshot(date: string) {
  const summary = await query<{ income: string; customers: string; expenses: string }>(
    `SELECT
       (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE transaction_date = $1) AS income,
       (SELECT COUNT(*)::int FROM transactions WHERE transaction_date = $1) AS customers,
       (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE expense_date = $1) AS expenses`,
    [date]
  );
  const barbers = await query<{
    barber_code: string;
    full_name: string | null;
    clients: string;
    earned: string;
  }>(
    `SELECT b.barber_code, u.full_name,
            COUNT(t.transaction_id)::int AS clients,
            COALESCE(SUM(t.amount),0) AS earned
     FROM barbers b
     LEFT JOIN users u ON b.user_id = u.user_id
     LEFT JOIN transactions t ON b.barber_id = t.barber_id AND t.transaction_date = $1
     WHERE b.is_active = TRUE
     GROUP BY b.barber_id, b.barber_code, u.full_name
     ORDER BY earned DESC NULLS LAST`,
    [date]
  );
  const expenses = await query<{
    category: string | null;
    description: string | null;
    amount: string;
    time: string | null;
    added_by: string | null;
  }>(
    `SELECT c.category_name AS category, e.description, e.amount,
            TO_CHAR(e.created_at, 'HH24:MI') AS time, u.username AS added_by
     FROM expenses e
     LEFT JOIN expense_categories c ON e.category_id = c.category_id
     LEFT JOIN users u ON e.created_by = u.user_id
     WHERE e.expense_date = $1
     ORDER BY e.created_at DESC`,
    [date]
  );
  const income = num(summary[0]?.income);
  const expenseTotal = num(summary[0]?.expenses);
  return {
    date,
    income,
    customers: num(summary[0]?.customers),
    expenses: expenseTotal,
    profit: income - expenseTotal,
    barbers: barbers.map((row) => ({
      code: row.barber_code,
      name: row.full_name || row.barber_code,
      clients: num(row.clients),
      earned: num(row.earned),
    })),
    expenseRows: expenses.map((row) => ({
      category: row.category || "-",
      description: row.description || "-",
      amount: num(row.amount),
      time: row.time || "",
      addedBy: row.added_by || "-",
    })),
  };
}

app.get("/api/day", requireAuth, allow("admin", "manager", "supervisor"), async (req, res) => {
  const date = String(req.query.date || new Date().toISOString().slice(0, 10));
  try {
    res.json(await daySnapshot(date));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load day" });
  }
});

app.get("/api/services", requireAuth, async (_req, res) => {
  try {
    const rows = await query<{
      service_id: number;
      service_name: string;
      base_price: string;
      service_description: string | null;
      is_active: boolean;
    }>(`SELECT service_id, service_name, base_price, service_description, is_active FROM services ORDER BY service_name`);
    res.json(
      rows.map((row) => ({
        id: Number(row.service_id),
        name: row.service_name,
        price: num(row.base_price),
        description: row.service_description || "",
        active: row.is_active,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load services" });
  }
});

app.post("/api/services", requireAuth, allow("admin"), async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(1),
      price: z.number().min(0),
      description: z.string().optional(),
      active: z.boolean().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Service name and price are required" });
    return;
  }
  try {
    await query(
      `INSERT INTO services (service_name, base_price, service_description, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [parsed.data.name, parsed.data.price, parsed.data.description || null, parsed.data.active ?? true, req.user!.userId]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not save service" });
  }
});

app.get("/api/categories", requireAuth, async (_req, res) => {
  try {
    const rows = await query<{ category_id: number; category_name: string; description: string | null; is_active: boolean }>(
      `SELECT category_id, category_name, description, is_active FROM expense_categories ORDER BY category_name`
    );
    res.json(
      rows.map((row) => ({
        id: Number(row.category_id),
        name: row.category_name,
        description: row.description || "",
        active: row.is_active,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load categories" });
  }
});

app.post("/api/transactions", requireAuth, allow("manager", "admin"), async (req, res) => {
  const parsed = z
    .object({
      barberId: z.number().int(),
      serviceId: z.number().int(),
      amount: z.number().positive(),
      customerName: z.string().optional(),
      notes: z.string().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Barber, service, and amount are required" });
    return;
  }
  try {
    const service = await query<{ service_name: string }>(`SELECT service_name FROM services WHERE service_id = $1`, [
      parsed.data.serviceId,
    ]);
    await query(
      `INSERT INTO transactions (transaction_date, barber_id, service_id, service_name, amount, customer_name, notes, created_by)
       VALUES (CURRENT_DATE, $1, $2, $3, $4, $5, $6, $7)`,
      [
        parsed.data.barberId,
        parsed.data.serviceId,
        service[0]?.service_name || "Service",
        parsed.data.amount,
        parsed.data.customerName || null,
        parsed.data.notes || null,
        req.user!.userId,
      ]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not add service" });
  }
});

app.post("/api/expenses", requireAuth, allow("manager", "admin"), async (req, res) => {
  const parsed = z
    .object({
      categoryId: z.number().int(),
      amount: z.number().positive(),
      description: z.string().min(1),
      expenseType: z.enum(["shop", "barber"]).default("shop"),
      barberId: z.number().int().optional().nullable(),
      date: z.string().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Category, amount, and description are required" });
    return;
  }
  try {
    await query(
      `INSERT INTO expenses (expense_date, category_id, expense_type, barber_id, description, amount, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        parsed.data.date || new Date().toISOString().slice(0, 10),
        parsed.data.categoryId,
        parsed.data.expenseType,
        parsed.data.expenseType === "barber" ? parsed.data.barberId ?? null : null,
        parsed.data.description,
        parsed.data.amount,
        req.user!.userId,
      ]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not add expense" });
  }
});

app.get("/api/users", requireAuth, allow("admin"), async (_req, res) => {
  try {
    const rows = await query<{
      user_id: number;
      username: string;
      full_name: string;
      role: string;
      email: string | null;
      phone: string | null;
      is_active: boolean;
      barber_code: string | null;
      commission_rate: string | null;
      recruitment_advance: string | null;
      advance_remaining: string | null;
      advance_monthly_deduction: string | null;
    }>(
      `SELECT u.user_id, u.username, u.full_name, u.role, u.email, u.phone, u.is_active,
              b.barber_code, b.commission_rate, b.recruitment_advance, b.advance_remaining, b.advance_monthly_deduction
       FROM users u
       LEFT JOIN barbers b ON u.user_id = b.user_id
       ORDER BY u.created_at DESC`
    );
    res.json(
      rows.map((row) => {
        const advance = num(row.recruitment_advance);
        const remaining = num(row.advance_remaining);
        return {
          id: Number(row.user_id),
          username: row.username,
          fullName: row.full_name,
          role: row.role,
          email: row.email || "",
          phone: row.phone || "",
          active: row.is_active,
          barberCode: row.barber_code || "",
          commissionRate: num(row.commission_rate),
          recruitmentAdvance: advance,
          advanceRemaining: remaining,
          alreadyPaid: Math.max(0, advance - remaining),
          monthlyDeduction: num(row.advance_monthly_deduction),
        };
      })
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load users" });
  }
});

app.post("/api/users", requireAuth, allow("admin"), async (req, res) => {
  const parsed = z
    .object({
      username: z.string().min(2),
      fullName: z.string().min(2),
      password: z.string().min(6),
      role: z.enum(["admin", "manager", "supervisor", "barber"]),
      email: z.string().optional(),
      phone: z.string().optional(),
      active: z.boolean().optional(),
      commissionRate: z.number().optional(),
      recruitmentAdvance: z.number().optional(),
      monthlyDeduction: z.number().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the user details. Password must be at least 6 characters." });
    return;
  }
  try {
    const created = await query<{ user_id: number }>(
      `INSERT INTO users (username, password_hash, full_name, email, phone, role, is_active)
       VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6, $7)
       RETURNING user_id`,
      [
        parsed.data.username,
        parsed.data.password,
        parsed.data.fullName,
        parsed.data.email || null,
        parsed.data.phone || null,
        parsed.data.role,
        parsed.data.active ?? true,
      ]
    );
    if (parsed.data.role === "barber") {
      const count = await query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM barbers`);
      const code = `B${String(num(count[0]?.count) + 1).padStart(3, "0")}`;
      const advance = parsed.data.recruitmentAdvance || 0;
      await query(
        `INSERT INTO barbers (user_id, barber_code, commission_rate, is_active, hire_date, recruitment_advance, advance_monthly_deduction, advance_remaining)
         VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $5)`,
        [created[0].user_id, code, parsed.data.commissionRate ?? 40, parsed.data.active ?? true, advance, parsed.data.monthlyDeduction || 0]
      );
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not create user" });
  }
});

app.put("/api/users/:id", requireAuth, allow("admin"), async (req, res) => {
  const userId = Number(req.params.id);
  const parsed = z
    .object({
      fullName: z.string().min(2),
      role: z.enum(["admin", "manager", "supervisor", "barber"]),
      email: z.string().optional(),
      phone: z.string().optional(),
      active: z.boolean(),
      password: z.string().optional(),
      commissionRate: z.number().optional(),
      recruitmentAdvance: z.number().optional(),
      monthlyDeduction: z.number().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid user details" });
    return;
  }
  try {
    await query(
      `UPDATE users SET full_name = $1, email = $2, phone = $3, role = $4, is_active = $5 WHERE user_id = $6`,
      [parsed.data.fullName, parsed.data.email || null, parsed.data.phone || null, parsed.data.role, parsed.data.active, userId]
    );
    if (parsed.data.password && parsed.data.password.length >= 6) {
      await query(`UPDATE users SET password_hash = crypt($1, gen_salt('bf')) WHERE user_id = $2`, [
        parsed.data.password,
        userId,
      ]);
    }
    if (parsed.data.role === "barber") {
      const existing = await query<{ recruitment_advance: string; advance_remaining: string; barber_id: number }>(
        `SELECT barber_id, recruitment_advance, advance_remaining FROM barbers WHERE user_id = $1`,
        [userId]
      );
      const advance = parsed.data.recruitmentAdvance ?? 0;
      const deduction = parsed.data.monthlyDeduction ?? 0;
      const rate = parsed.data.commissionRate ?? 40;
      if (existing[0]) {
        const paid = Math.max(0, num(existing[0].recruitment_advance) - num(existing[0].advance_remaining));
        const remaining = Math.max(0, advance - paid);
        await query(
          `UPDATE barbers
           SET is_active = $1, commission_rate = $2, recruitment_advance = $3,
               advance_monthly_deduction = $4, advance_remaining = $5
           WHERE user_id = $6`,
          [parsed.data.active, rate, advance, deduction, remaining, userId]
        );
      } else {
        const count = await query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM barbers`);
        const code = `B${String(num(count[0]?.count) + 1).padStart(3, "0")}`;
        await query(
          `INSERT INTO barbers (user_id, barber_code, commission_rate, is_active, hire_date, recruitment_advance, advance_monthly_deduction, advance_remaining)
           VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $5)`,
          [userId, code, rate, parsed.data.active, advance, deduction]
        );
      }
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not update user" });
  }
});

app.post("/api/users/recover-advances", requireAuth, allow("admin"), async (_req, res) => {
  try {
    const report = await query<{ barber_id: number; current_remaining: string; correct_remaining: string }>(
      `SELECT b.barber_id,
              COALESCE(b.advance_remaining, 0) AS current_remaining,
              GREATEST(0, COALESCE(b.recruitment_advance, 0) - COALESCE(SUM(ms.recruitment_deduction), 0)) AS correct_remaining
       FROM barbers b
       LEFT JOIN monthly_salaries ms ON b.barber_id = ms.barber_id
       GROUP BY b.barber_id, b.recruitment_advance, b.advance_remaining`
    );
    let updated = 0;
    for (const row of report) {
      if (Math.abs(num(row.current_remaining) - num(row.correct_remaining)) > 0.01) {
        await query(`UPDATE barbers SET advance_remaining = $1 WHERE barber_id = $2`, [
          num(row.correct_remaining),
          row.barber_id,
        ]);
        updated += 1;
      }
    }
    res.json({ updated });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Recovery failed" });
  }
});

app.get("/api/barber/home", requireAuth, allow("barber"), async (req, res) => {
  const barberId = req.user!.barberId;
  if (!barberId) {
    res.status(404).json({ error: "No barber profile is linked to this account" });
    return;
  }
  try {
    const profile = await query<{ commission_rate: string; advance_remaining: string; advance_monthly_deduction: string }>(
      `SELECT commission_rate, advance_remaining, advance_monthly_deduction FROM barbers WHERE barber_id = $1`,
      [barberId]
    );
    const rate = num(profile[0]?.commission_rate) > 1 ? num(profile[0]?.commission_rate) / 100 : num(profile[0]?.commission_rate);
    const today = await query<{ income: string; customers: string }>(
      `SELECT COALESCE(SUM(amount),0) AS income, COUNT(*)::int AS customers
       FROM transactions WHERE barber_id = $1 AND transaction_date = CURRENT_DATE`,
      [barberId]
    );
    const monthIncome = await query<{ income: string; customers: string }>(
      `SELECT COALESCE(SUM(amount),0) AS income, COUNT(*)::int AS customers
       FROM transactions
       WHERE barber_id = $1 AND transaction_date >= date_trunc('month', CURRENT_DATE)`,
      [barberId]
    );
    const best = await query<{ best: string }>(
      `SELECT COALESCE(MAX(daily),0) AS best FROM (
         SELECT SUM(amount) AS daily
         FROM transactions
         WHERE barber_id = $1 AND transaction_date >= date_trunc('month', CURRENT_DATE)
         GROUP BY transaction_date
       ) d`,
      [barberId]
    );
    const grossToday = num(today[0]?.income);
    const grossMonth = num(monthIncome[0]?.income);
    res.json({
      commissionRate: Math.round(rate * 100),
      today: {
        gross: grossToday,
        commission: grossToday * rate,
        shop: grossToday * (1 - rate),
        customers: num(today[0]?.customers),
      },
      month: {
        gross: grossMonth,
        commission: grossMonth * rate,
        customers: num(monthIncome[0]?.customers),
        bestDay: num(best[0]?.best),
        recruitmentDeduction: num(profile[0]?.advance_monthly_deduction),
        recruitmentBalance: num(profile[0]?.advance_remaining),
        expectedNet: grossMonth * rate - num(profile[0]?.advance_monthly_deduction),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load barber home" });
  }
});

app.get("/api/reports", requireAuth, allow("admin", "manager"), async (req, res) => {
  const from = String(req.query.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const to = String(req.query.to || new Date().toISOString().slice(0, 10));
  try {
    const rows = await query<{
      report_date: string;
      total_customers: string;
      total_income: string;
      total_expenses: string;
      net_profit: string;
      is_locked: boolean;
    }>(
      `SELECT report_date, total_customers, total_income, total_expenses, net_profit, is_locked
       FROM daily_reports
       WHERE report_date BETWEEN $1 AND $2
       ORDER BY report_date DESC`,
      [from, to]
    );
    res.json(
      rows.map((row) => ({
        date: isoDate(row.report_date),
        customers: num(row.total_customers),
        income: num(row.total_income),
        expenses: num(row.total_expenses),
        profit: num(row.net_profit),
        locked: row.is_locked,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load reports" });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Barbazza API listening on ${port}`);
});
