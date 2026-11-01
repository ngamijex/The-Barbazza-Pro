import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { allow, AuthUser, requireAuth, signToken } from "./auth";
import { pool, isoDate, num, query, cacheGet, cacheSet, cacheDel } from "./db";
import { ensurePublicSchema } from "./publicSchema";
import { publicApi } from "./publicApi";
import { profileRoutes } from "./profileRoutes";
import { UPLOAD_DIR, ensureUploadDir } from "./uploads";

const app = express();
app.disable("x-powered-by");
app.set("etag", false);
const corsOrigins = new Set(
  [
    "http://localhost:3000",
    "https://thebarbazza.com",
    "https://www.thebarbazza.com",
    process.env.CORS_ORIGIN,
    ...(process.env.CORS_ORIGINS || "").split(","),
  ]
    .map((v) => (v || "").trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || corsOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "8mb" }));
ensureUploadDir();
app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/api/public", publicApi);
app.use("/api", profileRoutes);

/** Mark short-lived API GETs as privately cacheable on the client */
function fastGetHeaders(res: import("express").Response, seconds = 10) {
  res.setHeader("Cache-Control", `private, max-age=${seconds}`);
}

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
    // One round-trip: verify password + resolve barber id together
    const rows = await query<{
      user_id: number;
      username: string;
      full_name: string;
      role: AuthUser["role"];
      verified: boolean;
      barber_id: number | null;
    }>(
      `SELECT u.user_id, u.username, u.full_name, u.role,
              (crypt($2, u.password_hash) = u.password_hash) AS verified,
              b.barber_id
       FROM users u
       LEFT JOIN barbers b ON b.user_id = u.user_id AND b.is_active = TRUE
       WHERE u.username = $1 AND u.is_active = TRUE
       LIMIT 1`,
      [parsed.data.username, parsed.data.password]
    );
    const user = rows[0];
    if (!user || !user.verified) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    const authUser: AuthUser = {
      userId: Number(user.user_id),
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      barberId: user.barber_id != null ? Number(user.barber_id) : null,
    };
    // Respond first — side effects must not delay login
    res.json({ token: signToken(authUser), user: authUser });
    void query(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1`, [user.user_id]).catch(() => undefined);
    void query(
      `INSERT INTO audit_logs (action_type, table_name, record_id, performed_by, created_at)
       VALUES ('LOGIN', 'users', $1, $1, CURRENT_TIMESTAMP)`,
      [user.user_id]
    ).catch(() => undefined);
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
    const [trend, topBarbers, recentActivity] = await Promise.all([
      query<{ day: string; total: string }>(
        `SELECT transaction_date AS day, COALESCE(SUM(amount),0) AS total
         FROM transactions
         WHERE transaction_date >= date_trunc('month', CURRENT_DATE)
         GROUP BY transaction_date ORDER BY transaction_date`
      ),
      query<{ barber_code: string; full_name: string | null; customers: string; earned: string }>(
        `SELECT b.barber_code, u.full_name,
                COUNT(t.transaction_id)::int AS customers,
                COALESCE(SUM(t.amount),0) AS earned
         FROM barbers b
         LEFT JOIN users u ON b.user_id = u.user_id
         LEFT JOIN transactions t
           ON b.barber_id = t.barber_id
          AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
         WHERE b.is_active = TRUE
         GROUP BY b.barber_id, b.barber_code, u.full_name
         ORDER BY earned DESC NULLS LAST
         LIMIT 10`
      ),
      query<{ action_type: string | null; table_name: string | null; created_at: string }>(
        `SELECT action_type, table_name, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
         FROM audit_logs
         ORDER BY created_at DESC
         LIMIT 20`
      ).catch(async () =>
        query<{ action_type: string | null; table_name: string | null; created_at: string }>(
          `SELECT action AS action_type, details AS table_name, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
           FROM audit_logs
           ORDER BY created_at DESC
           LIMIT 20`
        ).catch(() => [])
      ),
    ]);
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
      topBarbers: topBarbers.map((row) => ({
        code: row.barber_code,
        name: row.full_name || row.barber_code,
        customers: num(row.customers),
        earned: num(row.earned),
        avg: num(row.customers) > 0 ? num(row.earned) / num(row.customers) : 0,
      })),
      recentActivity: recentActivity.map((row) => ({
        action: row.action_type || "-",
        table: row.table_name || "-",
        time: row.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load overview" });
  }
});

app.get("/api/dashboard/performance", requireAuth, allow("admin", "manager"), async (req, res) => {
  const month = String(req.query.month || new Date().toISOString().slice(0, 7));
  const { start, end } = monthBounds(month);
  try {
    const cacheKey = `perf:${month}`;
    const cached = cacheGet<unknown>(cacheKey);
    if (cached) {
      fastGetHeaders(res, 15);
      res.json(cached);
      return;
    }
    const [salon, ranking, trend] = await Promise.all([
      query<{ income: string; customers: string; expenses: string; days: string }>(
        `SELECT
           (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE transaction_date BETWEEN $1 AND $2) AS income,
           (SELECT COUNT(*)::int FROM transactions WHERE transaction_date BETWEEN $1 AND $2) AS customers,
           (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE expense_date BETWEEN $1 AND $2) AS expenses,
           (SELECT COUNT(DISTINCT transaction_date)::int FROM transactions WHERE transaction_date BETWEEN $1 AND $2) AS days`,
        [start, end]
      ),
      query<{
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
      ),
      query<{ day: string; total: string }>(
        `SELECT transaction_date AS day, COALESCE(SUM(amount),0) AS total
         FROM transactions WHERE transaction_date BETWEEN $1 AND $2
         GROUP BY transaction_date ORDER BY transaction_date`,
        [start, end]
      ),
    ]);
    const income = num(salon[0]?.income);
    const expenses = num(salon[0]?.expenses);
    const days = num(salon[0]?.days);
    const payload = {
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
    };
    cacheSet(cacheKey, payload, 20_000);
    fastGetHeaders(res, 15);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load performance" });
  }
});

app.get("/api/barbers", requireAuth, async (_req, res) => {
  try {
    const cached = cacheGet<unknown[]>("barbers");
    if (cached) {
      fastGetHeaders(res, 15);
      res.json(cached);
      return;
    }
    const rows = await query<{ barber_id: number; barber_code: string; full_name: string | null; commission_rate: string }>(
      `SELECT b.barber_id, b.barber_code, u.full_name, b.commission_rate
       FROM barbers b
       LEFT JOIN users u ON b.user_id = u.user_id
       WHERE b.is_active = TRUE
       ORDER BY b.barber_code`
    );
    const payload = rows.map((row) => ({
      id: Number(row.barber_id),
      code: row.barber_code,
      name: row.full_name || row.barber_code,
      commissionRate: num(row.commission_rate),
    }));
    cacheSet("barbers", payload, 20_000);
    fastGetHeaders(res, 15);
    res.json(payload);
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
  const cached = cacheGet<ReturnType<typeof Object>>(`day:${date}`);
  if (cached) return cached as Awaited<ReturnType<typeof daySnapshotUncached>>;
  const result = await daySnapshotUncached(date);
  cacheSet(`day:${date}`, result, 8_000);
  return result;
}

async function daySnapshotUncached(date: string) {
  const [summary, barbers, expenses] = await Promise.all([
    query<{ income: string; customers: string; expenses: string }>(
      `SELECT
         (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE transaction_date = $1) AS income,
         (SELECT COUNT(*)::int FROM transactions WHERE transaction_date = $1) AS customers,
         (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE expense_date = $1) AS expenses`,
      [date]
    ),
    query<{
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
    ),
    query<{
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
    ),
  ]);
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
    fastGetHeaders(res, 5);
    res.json(await daySnapshot(date));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load day" });
  }
});

app.get("/api/services", requireAuth, async (_req, res) => {
  try {
    const cached = cacheGet<unknown[]>("services");
    if (cached) {
      fastGetHeaders(res, 20);
      res.json(cached);
      return;
    }
    const rows = await query<{
      service_id: number;
      service_name: string;
      base_price: string;
      service_description: string | null;
      is_active: boolean;
    }>(`SELECT service_id, service_name, base_price, service_description, is_active FROM services ORDER BY service_name`);
    const payload = rows.map((row) => ({
      id: Number(row.service_id),
      name: row.service_name,
      price: num(row.base_price),
      description: row.service_description || "",
      active: row.is_active,
    }));
    cacheSet("services", payload, 30_000);
    fastGetHeaders(res, 20);
    res.json(payload);
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
    cacheDel("services");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not save service" });
  }
});

app.put("/api/services/:id", requireAuth, allow("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = z
    .object({
      name: z.string().min(1),
      price: z.number().min(0),
      description: z.string().optional(),
      active: z.boolean(),
    })
    .safeParse(req.body);
  if (!id || !parsed.success) {
    res.status(400).json({ error: "Invalid service update" });
    return;
  }
  try {
    await query(
      `UPDATE services
       SET service_name = $1, base_price = $2, service_description = $3, is_active = $4
       WHERE service_id = $5`,
      [parsed.data.name, parsed.data.price, parsed.data.description || null, parsed.data.active, id]
    );
    cacheDel("services");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not update service" });
  }
});

app.delete("/api/services/:id", requireAuth, allow("admin"), async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid service" });
    return;
  }
  try {
    await query(`UPDATE services SET is_active = FALSE WHERE service_id = $1`, [id]);
    cacheDel("services");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not delete service" });
  }
});

app.get("/api/categories", requireAuth, async (_req, res) => {
  try {
    const cached = cacheGet<unknown[]>("categories");
    if (cached) {
      fastGetHeaders(res, 20);
      res.json(cached);
      return;
    }
    const rows = await query<{ category_id: number; category_name: string; description: string | null; is_active: boolean }>(
      `SELECT category_id, category_name, description, is_active FROM expense_categories ORDER BY category_name`
    );
    const payload = rows.map((row) => ({
      id: Number(row.category_id),
      name: row.category_name,
      description: row.description || "",
      active: row.is_active,
    }));
    cacheSet("categories", payload, 30_000);
    fastGetHeaders(res, 20);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load categories" });
  }
});

app.post("/api/categories", requireAuth, allow("admin"), async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(1),
      description: z.string().optional(),
      active: z.boolean().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Category name is required" });
    return;
  }
  try {
    await query(
      `INSERT INTO expense_categories (category_name, description, is_active)
       VALUES ($1, $2, $3)`,
      [parsed.data.name, parsed.data.description || null, parsed.data.active ?? true]
    );
    cacheDel("categories");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not create category" });
  }
});

app.put("/api/categories/:id", requireAuth, allow("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = z
    .object({
      name: z.string().min(1),
      description: z.string().optional(),
      active: z.boolean(),
    })
    .safeParse(req.body);
  if (!id || !parsed.success) {
    res.status(400).json({ error: "Invalid category update" });
    return;
  }
  try {
    await query(
      `UPDATE expense_categories
       SET category_name = $1, description = $2, is_active = $3
       WHERE category_id = $4`,
      [parsed.data.name, parsed.data.description || null, parsed.data.active, id]
    );
    cacheDel("categories");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not update category" });
  }
});

app.delete("/api/categories/:id", requireAuth, allow("admin"), async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }
  try {
    await query(`UPDATE expense_categories SET is_active = FALSE WHERE category_id = $1`, [id]);
    cacheDel("categories");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not delete category" });
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
      discountReason: z.string().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Barber, service, and amount are required" });
    return;
  }
  try {
    const service = await query<{ service_name: string; base_price: string }>(
      `SELECT service_name, base_price FROM services WHERE service_id = $1`,
      [parsed.data.serviceId]
    );
    const base = num(service[0]?.base_price);
    if (parsed.data.amount < base && !(parsed.data.discountReason || "").trim()) {
      res.status(400).json({ error: "Discount reason is required when amount is below base price" });
      return;
    }
    const notesParts = [parsed.data.notes || "", parsed.data.discountReason ? `Discount: ${parsed.data.discountReason}` : ""].filter(
      Boolean
    );
    await query(
      `INSERT INTO transactions (transaction_date, barber_id, service_id, service_name, amount, customer_name, notes, created_by)
       VALUES (CURRENT_DATE, $1, $2, $3, $4, $5, $6, $7)`,
      [
        parsed.data.barberId,
        parsed.data.serviceId,
        service[0]?.service_name || "Service",
        parsed.data.amount,
        parsed.data.customerName || null,
        notesParts.join(" | ") || null,
        req.user!.userId,
      ]
    );
    cacheDel("day:");
    cacheDel("operations");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not add service" });
  }
});

app.put("/api/transactions/:id", requireAuth, allow("manager", "admin"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = z
    .object({
      barberId: z.number().int(),
      serviceId: z.number().int(),
      amount: z.number().positive(),
      customerName: z.string().optional(),
      notes: z.string().optional(),
      discountReason: z.string().optional(),
    })
    .safeParse(req.body);
  if (!id || !parsed.success) {
    res.status(400).json({ error: "Invalid transaction update" });
    return;
  }
  try {
    const service = await query<{ service_name: string; base_price: string }>(
      `SELECT service_name, base_price FROM services WHERE service_id = $1`,
      [parsed.data.serviceId]
    );
    const base = num(service[0]?.base_price);
    if (parsed.data.amount < base && !(parsed.data.discountReason || "").trim()) {
      res.status(400).json({ error: "Discount reason is required when amount is below base price" });
      return;
    }
    const notesParts = [parsed.data.notes || "", parsed.data.discountReason ? `Discount: ${parsed.data.discountReason}` : ""].filter(
      Boolean
    );
    await query(
      `UPDATE transactions
       SET barber_id = $1, service_id = $2, service_name = $3, amount = $4, customer_name = $5, notes = $6
       WHERE transaction_id = $7`,
      [
        parsed.data.barberId,
        parsed.data.serviceId,
        service[0]?.service_name || "Service",
        parsed.data.amount,
        parsed.data.customerName || null,
        notesParts.join(" | ") || null,
        id,
      ]
    );
    cacheDel("day:");
    cacheDel("operations");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not update transaction" });
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
    cacheDel("day:");
    cacheDel("operations");
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
      monthly_salary: string | null;
    }>(
      `SELECT u.user_id, u.username, u.full_name, u.role, u.email, u.phone, u.is_active,
              b.barber_code, b.commission_rate, b.recruitment_advance, b.advance_remaining, b.advance_monthly_deduction,
              sp.monthly_salary
       FROM users u
       LEFT JOIN barbers b ON u.user_id = b.user_id
       LEFT JOIN staff_profiles sp ON sp.user_id = u.user_id
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
          monthlySalary: num(row.monthly_salary),
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
      role: z.enum(["admin", "manager", "supervisor", "barber", "cleaner"]),
      email: z.string().optional(),
      phone: z.string().optional(),
      active: z.boolean().optional(),
      commissionRate: z.number().optional(),
      recruitmentAdvance: z.number().optional(),
      monthlyDeduction: z.number().optional(),
      monthlySalary: z.number().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the user details. Password must be at least 6 characters." });
    return;
  }
  if (
    (parsed.data.role === "manager" || parsed.data.role === "cleaner") &&
    !(Number(parsed.data.monthlySalary) > 0)
  ) {
    res.status(400).json({ error: "Monthly salary is required for managers and cleaners" });
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
    if (parsed.data.role === "manager" || parsed.data.role === "cleaner") {
      await query(
        `INSERT INTO staff_profiles (user_id, monthly_salary, updated_at, updated_by)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
         ON CONFLICT (user_id) DO UPDATE
           SET monthly_salary = EXCLUDED.monthly_salary,
               updated_at = CURRENT_TIMESTAMP,
               updated_by = EXCLUDED.updated_by`,
        [created[0].user_id, parsed.data.monthlySalary || 0, req.user!.userId]
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
      role: z.enum(["admin", "manager", "supervisor", "barber", "cleaner"]),
      email: z.string().optional(),
      phone: z.string().optional(),
      active: z.boolean(),
      password: z.string().optional(),
      commissionRate: z.number().optional(),
      recruitmentAdvance: z.number().optional(),
      monthlyDeduction: z.number().optional(),
      monthlySalary: z.number().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid user details" });
    return;
  }
  if (
    (parsed.data.role === "manager" || parsed.data.role === "cleaner") &&
    parsed.data.monthlySalary !== undefined &&
    !(Number(parsed.data.monthlySalary) >= 0)
  ) {
    res.status(400).json({ error: "Monthly salary must be a valid amount" });
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
    if (parsed.data.role === "manager" || parsed.data.role === "cleaner") {
      await query(
        `INSERT INTO staff_profiles (user_id, monthly_salary, updated_at, updated_by)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
         ON CONFLICT (user_id) DO UPDATE
           SET monthly_salary = EXCLUDED.monthly_salary,
               updated_at = CURRENT_TIMESTAMP,
               updated_by = EXCLUDED.updated_by`,
        [userId, parsed.data.monthlySalary ?? 0, req.user!.userId]
      );
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not update user" });
  }
});

app.delete("/api/users/:id", requireAuth, allow("admin"), async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }
  if (userId === req.user!.userId) {
    res.status(400).json({ error: "You cannot delete your own account" });
    return;
  }
  try {
    await query(`UPDATE barbers SET is_active = FALSE WHERE user_id = $1`, [userId]);
    await query(`UPDATE users SET is_active = FALSE WHERE user_id = $1`, [userId]);
    void query(
      `INSERT INTO audit_logs (action_type, table_name, record_id, performed_by, created_at)
       VALUES ('DELETE', 'users', $1, $2, CURRENT_TIMESTAMP)`,
      [userId, req.user!.userId]
    ).catch(() => undefined);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not delete user" });
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
    const [profile, today, weekIncome, monthIncome, best, credits, trend, services] = await Promise.all([
      query<{ commission_rate: string; advance_remaining: string; advance_monthly_deduction: string }>(
        `SELECT commission_rate, advance_remaining, advance_monthly_deduction FROM barbers WHERE barber_id = $1`,
        [barberId]
      ),
      query<{ income: string; customers: string }>(
        `SELECT COALESCE(SUM(amount),0) AS income, COUNT(*)::int AS customers
         FROM transactions WHERE barber_id = $1 AND transaction_date = CURRENT_DATE`,
        [barberId]
      ),
      query<{ income: string; customers: string }>(
        `SELECT COALESCE(SUM(amount),0) AS income, COUNT(*)::int AS customers
         FROM transactions
         WHERE barber_id = $1 AND transaction_date >= date_trunc('week', CURRENT_DATE)`,
        [barberId]
      ),
      query<{ income: string; customers: string; services: string }>(
        `SELECT COALESCE(SUM(amount),0) AS income, COUNT(*)::int AS customers, COUNT(*)::int AS services
         FROM transactions
         WHERE barber_id = $1 AND transaction_date >= date_trunc('month', CURRENT_DATE)`,
        [barberId]
      ),
      query<{ best: string }>(
        `SELECT COALESCE(MAX(daily),0) AS best FROM (
           SELECT SUM(amount) AS daily
           FROM transactions
           WHERE barber_id = $1 AND transaction_date >= date_trunc('month', CURRENT_DATE)
           GROUP BY transaction_date
         ) d`,
        [barberId]
      ),
      query<{ remaining: string; month_deduction: string }>(
        `SELECT COALESCE(SUM(remaining_balance),0) AS remaining,
                COALESCE(SUM(monthly_deduction),0) AS month_deduction
         FROM barber_credits
         WHERE barber_id = $1 AND status = 'approved' AND remaining_balance > 0`,
        [barberId]
      ).catch(() => [{ remaining: "0", month_deduction: "0" }]),
      query<{ day: string; total: string }>(
        `SELECT transaction_date AS day, COALESCE(SUM(amount),0) AS total
         FROM transactions
         WHERE barber_id = $1 AND transaction_date >= date_trunc('month', CURRENT_DATE)
         GROUP BY transaction_date ORDER BY transaction_date`,
        [barberId]
      ),
      query<{ service_name: string; amount: string; customer_name: string | null; created_at: string }>(
        `SELECT service_name, amount, customer_name, TO_CHAR(created_at, 'HH24:MI') AS created_at
         FROM transactions WHERE barber_id = $1 AND transaction_date = CURRENT_DATE
         ORDER BY created_at DESC`,
        [barberId]
      ),
    ]);
    const rate = num(profile[0]?.commission_rate) > 1 ? num(profile[0]?.commission_rate) / 100 : num(profile[0]?.commission_rate);
    const grossToday = num(today[0]?.income);
    const grossWeek = num(weekIncome[0]?.income);
    const grossMonth = num(monthIncome[0]?.income);
    const recruitmentBalance = Math.max(0, num(profile[0]?.advance_remaining));
    // Never deduct recruitment when balance/configured amount is zero
    const recruitmentDeduction = Math.min(
      Math.max(0, num(profile[0]?.advance_monthly_deduction)),
      recruitmentBalance
    );
    const creditBalance = num(credits[0]?.remaining);
    const creditDeduction = Math.min(Math.max(0, num(credits[0]?.month_deduction)), Math.max(0, creditBalance));
    const commission = grossMonth * rate;
    res.json({
      commissionRate: Math.round(rate * 100),
      today: {
        gross: grossToday,
        commission: grossToday * rate,
        shop: grossToday * (1 - rate),
        customers: num(today[0]?.customers),
      },
      week: {
        gross: grossWeek,
        commission: grossWeek * rate,
        customers: num(weekIncome[0]?.customers),
      },
      month: {
        gross: grossMonth,
        commission,
        customers: num(monthIncome[0]?.customers),
        services: num(monthIncome[0]?.services),
        bestDay: num(best[0]?.best),
        avgDaily: commission / Math.max(1, new Date().getDate()),
        recruitmentDeduction,
        recruitmentBalance,
        creditBalance,
        creditDeduction,
        expectedNet: commission - recruitmentDeduction - creditDeduction,
      },
      trend: trend.map((row) => ({ date: isoDate(row.day), total: num(row.total) })),
      todayServices: services.map((s) => ({
        service: s.service_name,
        amount: num(s.amount),
        customer: s.customer_name || "Walk-in",
        time: s.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load barber home" });
  }
});

app.get("/api/transactions", requireAuth, allow("admin", "manager", "supervisor"), async (req, res) => {
  const date = String(req.query.date || new Date().toISOString().slice(0, 10));
  try {
    const rows = await query<{
      transaction_id: number;
      service_name: string;
      amount: string;
      customer_name: string | null;
      notes: string | null;
      barber_code: string;
      full_name: string | null;
      created_at: string;
    }>(
      `SELECT t.transaction_id, t.service_name, t.amount, t.customer_name, t.notes,
              b.barber_code, u.full_name, TO_CHAR(t.created_at, 'HH24:MI') AS created_at
       FROM transactions t
       JOIN barbers b ON t.barber_id = b.barber_id
       LEFT JOIN users u ON b.user_id = u.user_id
       WHERE t.transaction_date = $1
       ORDER BY t.created_at DESC`,
      [date]
    );
    res.json(
      rows.map((row) => ({
        id: Number(row.transaction_id),
        service: row.service_name,
        amount: num(row.amount),
        customer: row.customer_name || "",
        notes: row.notes || "",
        barberCode: row.barber_code,
        barberName: row.full_name || row.barber_code,
        time: row.created_at,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load transactions" });
  }
});

app.delete("/api/transactions/:id", requireAuth, allow("manager", "admin"), async (req, res) => {
  try {
    await query(`DELETE FROM transactions WHERE transaction_id = $1`, [Number(req.params.id)]);
    cacheDel("day:");
    cacheDel("operations");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not delete transaction" });
  }
});

app.get("/api/operations", requireAuth, allow("admin", "manager"), async (_req, res) => {
  try {
    const cached = cacheGet<unknown>("operations");
    if (cached) {
      fastGetHeaders(res, 5);
      res.json(cached);
      return;
    }
    const [today, month, trend, tx] = await Promise.all([
      query<{ income: string; customers: string; expenses: string }>(
        `SELECT
           (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE transaction_date = CURRENT_DATE) AS income,
           (SELECT COUNT(*)::int FROM transactions WHERE transaction_date = CURRENT_DATE) AS customers,
           (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE expense_date = CURRENT_DATE) AS expenses`
      ),
      query<{ income: string; customers: string; expenses: string; services: string; days: string }>(
        `SELECT
           (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE transaction_date >= date_trunc('month', CURRENT_DATE)) AS income,
           (SELECT COUNT(*)::int FROM transactions WHERE transaction_date >= date_trunc('month', CURRENT_DATE)) AS customers,
           (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE expense_date >= date_trunc('month', CURRENT_DATE)) AS expenses,
           (SELECT COUNT(*)::int FROM transactions WHERE transaction_date >= date_trunc('month', CURRENT_DATE)) AS services,
           (SELECT COUNT(DISTINCT transaction_date)::int FROM transactions WHERE transaction_date >= date_trunc('month', CURRENT_DATE)) AS days`
      ),
      query<{ day: string; total: string }>(
        `SELECT transaction_date AS day, COALESCE(SUM(amount),0) AS total
         FROM transactions
         WHERE transaction_date >= date_trunc('month', CURRENT_DATE)
         GROUP BY transaction_date ORDER BY transaction_date`
      ),
      query<{
        transaction_id: number;
        barber_id: number;
        service_id: number | null;
        service_name: string;
        amount: string;
        customer_name: string | null;
        notes: string | null;
        barber_code: string;
        full_name: string | null;
        created_at: string;
      }>(
        `SELECT t.transaction_id, t.barber_id, t.service_id, t.service_name, t.amount, t.customer_name, t.notes,
                b.barber_code, u.full_name, TO_CHAR(t.created_at, 'HH24:MI') AS created_at
         FROM transactions t
         JOIN barbers b ON t.barber_id = b.barber_id
         LEFT JOIN users u ON b.user_id = u.user_id
         WHERE t.transaction_date = CURRENT_DATE
         ORDER BY t.created_at DESC`
      ),
    ]);
    const mIncome = num(month[0]?.income);
    const mExpenses = num(month[0]?.expenses);
    const days = Math.max(1, num(month[0]?.days));
    const tIncome = num(today[0]?.income);
    const tExpenses = num(today[0]?.expenses);
    const payload = {
      today: {
        income: tIncome,
        customers: num(today[0]?.customers),
        expenses: tExpenses,
        profit: tIncome - tExpenses,
      },
      month: {
        income: mIncome,
        customers: num(month[0]?.customers),
        expenses: mExpenses,
        profit: mIncome - mExpenses,
        services: num(month[0]?.services),
        avgDaily: mIncome / days,
        label: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
      },
      trend: trend.map((row) => ({ date: isoDate(row.day), total: num(row.total) })),
      transactions: tx.map((row) => ({
        id: Number(row.transaction_id),
        barberId: Number(row.barber_id),
        serviceId: row.service_id == null ? null : Number(row.service_id),
        notes: row.notes || "",
        service: row.service_name,
        amount: num(row.amount),
        customer: row.customer_name || "",
        barberCode: row.barber_code,
        barberName: row.full_name || row.barber_code,
        time: row.created_at,
      })),
    };
    cacheSet("operations", payload, 8_000);
    fastGetHeaders(res, 5);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load operations" });
  }
});

app.get("/api/staff/home", requireAuth, allow("manager", "cleaner"), async (req, res) => {
  try {
    const [profile, credits] = await Promise.all([
      query<{ monthly_salary: string }>(
        `SELECT monthly_salary FROM staff_profiles WHERE user_id = $1`,
        [req.user!.userId]
      ),
      query<{ remaining: string; month_deduction: string }>(
        `SELECT COALESCE(SUM(remaining_balance),0) AS remaining,
                COALESCE(SUM(monthly_deduction),0) AS month_deduction
         FROM staff_credits
         WHERE user_id = $1 AND status = 'approved' AND remaining_balance > 0`,
        [req.user!.userId]
      ),
    ]);
    const salary = num(profile[0]?.monthly_salary);
    const creditBalance = num(credits[0]?.remaining);
    const creditDeduction = Math.min(salary, num(credits[0]?.month_deduction) || creditBalance);
    res.json({
      role: req.user!.role,
      fullName: req.user!.fullName,
      monthlySalary: salary,
      creditBalance,
      creditDeduction,
      expectedNet: Math.max(0, salary - creditDeduction),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load staff home" });
  }
});

app.get("/api/credits", requireAuth, allow("admin", "manager", "barber", "cleaner"), async (req, res) => {
  const status = String(req.query.status || "all");
  const mineOnly = String(req.query.mine || "") === "1";
  const role = req.user!.role;
  try {
    type CreditRow = {
      kind: "barber" | "staff";
      credit_id: number;
      amount: string;
      reason: string | null;
      status: string;
      remaining_balance: string | null;
      person_code: string;
      person_name: string | null;
      person_role: string;
      request_date: string;
      approved_by_name: string | null;
    };

    const barberParams: unknown[] = [];
    let barberWhere = "WHERE 1=1";
    const staffParams: unknown[] = [];
    let staffWhere = "WHERE 1=1";

    if (role === "barber" || mineOnly) {
      if (role === "barber") {
        barberParams.push(req.user!.barberId);
        barberWhere += ` AND c.barber_id = $${barberParams.length}`;
        staffWhere += " AND FALSE";
      } else {
        staffParams.push(req.user!.userId);
        staffWhere += ` AND c.user_id = $${staffParams.length}`;
        barberWhere += " AND FALSE";
      }
    } else if (role === "cleaner") {
      staffParams.push(req.user!.userId);
      staffWhere += ` AND c.user_id = $${staffParams.length}`;
      barberWhere += " AND FALSE";
    } else if (role === "manager") {
      // Barber + cleaner requests they can approve, plus own staff requests
      staffParams.push(req.user!.userId);
      staffWhere += ` AND (u.role = 'cleaner' OR c.user_id = $${staffParams.length})`;
    } else if (role === "admin") {
      // Manager staff credits (for approval) + all barber credits (visibility)
      staffWhere += " AND u.role = 'manager'";
    }

    if (status !== "all") {
      barberParams.push(status);
      barberWhere += ` AND c.status = $${barberParams.length}`;
      staffParams.push(status);
      staffWhere += ` AND c.status = $${staffParams.length}`;
    }

    const [barberRows, staffRows] = await Promise.all([
      query<CreditRow>(
        `SELECT 'barber'::text AS kind, c.credit_id, c.amount, c.reason, c.status, c.remaining_balance,
                b.barber_code AS person_code, u.full_name AS person_name, 'barber'::text AS person_role,
                TO_CHAR(c.request_date, 'YYYY-MM-DD') AS request_date,
                u2.full_name AS approved_by_name
         FROM barber_credits c
         JOIN barbers b ON c.barber_id = b.barber_id
         LEFT JOIN users u ON b.user_id = u.user_id
         LEFT JOIN users u2 ON c.approved_by = u2.user_id
         ${barberWhere}
         ORDER BY c.request_date DESC`,
        barberParams
      ).catch(() => [] as CreditRow[]),
      query<CreditRow>(
        `SELECT 'staff'::text AS kind, c.credit_id, c.amount, c.reason, c.status, c.remaining_balance,
                UPPER(u.role) AS person_code, u.full_name AS person_name, u.role AS person_role,
                TO_CHAR(c.request_date, 'YYYY-MM-DD') AS request_date,
                u2.full_name AS approved_by_name
         FROM staff_credits c
         JOIN users u ON c.user_id = u.user_id
         LEFT JOIN users u2 ON c.approved_by = u2.user_id
         ${staffWhere}
         ORDER BY c.request_date DESC`,
        staffParams
      ).catch(() => [] as CreditRow[]),
    ]);

    const rows = [...barberRows, ...staffRows].sort((a, b) => String(b.request_date).localeCompare(String(a.request_date)));
    res.json(
      rows.map((row) => ({
        id: Number(row.credit_id),
        kind: row.kind,
        amount: num(row.amount),
        reason: row.reason || "",
        status: row.status,
        remaining: num(row.remaining_balance),
        barberCode: row.person_code,
        barberName: row.person_name || row.person_code,
        personRole: row.person_role,
        requestedAt: row.request_date,
        approvedBy: row.approved_by_name || "",
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load credits" });
  }
});

app.post("/api/credits", requireAuth, allow("barber", "manager", "cleaner"), async (req, res) => {
  const parsed = z
    .object({ amount: z.number().positive(), reason: z.string().min(1) })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Amount and reason are required" });
    return;
  }
  try {
    if (req.user!.role === "barber") {
      if (!req.user!.barberId) {
        res.status(400).json({ error: "No barber profile linked" });
        return;
      }
      await query(
        `INSERT INTO barber_credits (barber_id, amount, reason, status, remaining_balance, monthly_deduction)
         VALUES ($1, $2, $3, 'pending', $2, $2)`,
        [req.user!.barberId, parsed.data.amount, parsed.data.reason]
      );
    } else {
      await query(
        `INSERT INTO staff_credits (user_id, amount, reason, status, remaining_balance, monthly_deduction)
         VALUES ($1, $2, $3, 'pending', $2, $2)`,
        [req.user!.userId, parsed.data.amount, parsed.data.reason]
      );
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not submit credit request" });
  }
});

app.post("/api/credits/:id/decide", requireAuth, allow("manager", "admin"), async (req, res) => {
  const parsed = z
    .object({
      decision: z.enum(["approved", "rejected"]),
      kind: z.enum(["barber", "staff"]).default("barber"),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Decision required" });
    return;
  }
  const creditId = Number(req.params.id);
  const { decision, kind } = parsed.data;
  try {
    if (kind === "barber") {
      if (req.user!.role !== "manager" && req.user!.role !== "admin") {
        res.status(403).json({ error: "Managers approve barber credits" });
        return;
      }
      await query(
        `UPDATE barber_credits
         SET status = $1, approved_by = $2, approved_date = CURRENT_TIMESTAMP,
             monthly_deduction = CASE WHEN COALESCE(monthly_deduction,0) = 0 THEN amount ELSE monthly_deduction END
         WHERE credit_id = $3 AND status = 'pending'`,
        [decision, req.user!.userId, creditId]
      );
    } else {
      const rows = await query<{ role: string }>(
        `SELECT u.role
         FROM staff_credits c
         JOIN users u ON c.user_id = u.user_id
         WHERE c.credit_id = $1 AND c.status = 'pending'`,
        [creditId]
      );
      if (!rows[0]) {
        res.status(404).json({ error: "Credit request not found" });
        return;
      }
      const requesterRole = rows[0].role;
      if (requesterRole === "cleaner" && req.user!.role !== "manager" && req.user!.role !== "admin") {
        res.status(403).json({ error: "Managers approve cleaner credits" });
        return;
      }
      if (requesterRole === "manager" && req.user!.role !== "admin") {
        res.status(403).json({ error: "Only admin can approve manager credits" });
        return;
      }
      await query(
        `UPDATE staff_credits
         SET status = $1, approved_by = $2, approved_date = CURRENT_TIMESTAMP,
             monthly_deduction = CASE WHEN COALESCE(monthly_deduction,0) = 0 THEN amount ELSE monthly_deduction END,
             updated_at = CURRENT_TIMESTAMP
         WHERE credit_id = $3 AND status = 'pending'`,
        [decision, req.user!.userId, creditId]
      );
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not update credit" });
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

type ClosingRow = {
  barberId: number;
  barberCode: string;
  fullName: string;
  commissionRate: number;
  recruitmentDeduction: number;
  recruitmentBalance: number;
  grossIncome: number;
  creditDeduction: number;
  commissionEarned: number;
  totalDeductions: number;
  netSalary: number;
};

async function closingSummary(monthKey: string): Promise<ClosingRow[]> {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const rows = await query<{
    barber_id: number;
    barber_code: string;
    full_name: string | null;
    commission_rate: string;
    recruitment_deduction: string;
    recruitment_balance: string;
    gross_income: string;
    credit_deduction: string;
  }>(
    `SELECT
       b.barber_id,
       b.barber_code,
       u.full_name,
       b.commission_rate,
       COALESCE(b.advance_monthly_deduction, 0) AS recruitment_deduction,
       COALESCE(b.advance_remaining, 0) AS recruitment_balance,
       COALESCE(
         (SELECT SUM(amount)
          FROM transactions
          WHERE barber_id = b.barber_id
            AND EXTRACT(YEAR FROM transaction_date) = $1
            AND EXTRACT(MONTH FROM transaction_date) = $2),
         0
       ) AS gross_income,
       COALESCE(
         (SELECT SUM(monthly_deduction)
          FROM barber_credits
          WHERE barber_id = b.barber_id
            AND status = 'approved'
            AND remaining_balance > 0),
         0
       ) AS credit_deduction
     FROM barbers b
     LEFT JOIN users u ON b.user_id = u.user_id
     WHERE b.is_active = TRUE
     ORDER BY b.barber_code`,
    [year, month]
  );

  return rows.map((row) => {
    const rateRaw = num(row.commission_rate);
    const ratePct = rateRaw > 0 && rateRaw <= 1 ? rateRaw * 100 : rateRaw;
    const grossIncome = num(row.gross_income);
    const recruitmentBalance = Math.max(0, num(row.recruitment_balance));
    // If remaining advance is 0 (or monthly reduction is 0), do not deduct recruitment
    const recruitmentDeduction = Math.min(Math.max(0, num(row.recruitment_deduction)), recruitmentBalance);
    const creditDeduction = Math.max(0, num(row.credit_deduction));
    const commissionEarned = grossIncome * (ratePct / 100);
    const totalDeductions = recruitmentDeduction + creditDeduction;
    // Allow negative net when deductions exceed commission (barber owes the shop)
    const netSalary = commissionEarned - totalDeductions;
    return {
      barberId: Number(row.barber_id),
      barberCode: row.barber_code,
      fullName: row.full_name || row.barber_code,
      commissionRate: ratePct,
      recruitmentDeduction,
      recruitmentBalance,
      grossIncome,
      creditDeduction,
      commissionEarned,
      totalDeductions,
      netSalary,
    };
  });
}

app.get("/api/monthly-closing/months", requireAuth, allow("admin"), async (_req, res) => {
  try {
    const rows = await query<{ month_key: string; month_label: string }>(
      `SELECT DISTINCT
         TO_CHAR(transaction_date, 'YYYY-MM') AS month_key,
         TO_CHAR(transaction_date, 'Month YYYY') AS month_label
       FROM transactions
       WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
         AND TO_CHAR(transaction_date, 'YYYY-MM') NOT IN (
           SELECT DISTINCT
             LPAD(year::text, 4, '0') || '-' || LPAD(month::text, 2, '0')
           FROM monthly_salaries
           WHERE status = 'paid'
         )
       ORDER BY month_key DESC`
    );
    res.json(
      rows.map((row) => ({
        key: row.month_key,
        label: row.month_label.trim(),
      }))
    );
  } catch (error) {
    try {
      const fallback = await query<{ month_key: string; month_label: string }>(
        `SELECT DISTINCT
           TO_CHAR(transaction_date, 'YYYY-MM') AS month_key,
           TO_CHAR(transaction_date, 'Month YYYY') AS month_label
         FROM transactions
         WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
         ORDER BY month_key DESC`
      );
      res.json(fallback.map((row) => ({ key: row.month_key, label: row.month_label.trim() })));
    } catch (fallbackError) {
      res.status(500).json({
        error: fallbackError instanceof Error ? fallbackError.message : "Failed to load months",
      });
    }
  }
});

app.get("/api/monthly-closing/summary", requireAuth, allow("admin"), async (req, res) => {
  const month = String(req.query.month || "");
  if (!/^\d{4}-\d{2}$/.test(month)) {
    res.status(400).json({ error: "Select a month" });
    return;
  }
  try {
    res.json(await closingSummary(month));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load closing summary" });
  }
});

app.get("/api/monthly-closing/history", requireAuth, allow("admin"), async (_req, res) => {
  try {
    const rows = await query<{
      barber_code: string;
      full_name: string | null;
      month: number;
      year: number;
      gross_income: string;
      commission_earned: string;
      recruitment_deduction: string;
      credit_deduction: string;
      net_salary: string;
      paid_date: string | null;
      status: string;
    }>(
      `SELECT
         b.barber_code,
         u.full_name,
         ms.month,
         ms.year,
         ms.gross_income,
         ms.commission_earned,
         ms.recruitment_deduction,
         ms.credit_deduction,
         ms.net_salary,
         TO_CHAR(ms.paid_date, 'YYYY-MM-DD HH24:MI') AS paid_date,
         ms.status
       FROM monthly_salaries ms
       JOIN barbers b ON ms.barber_id = b.barber_id
       LEFT JOIN users u ON b.user_id = u.user_id
       ORDER BY ms.year DESC, ms.month DESC, b.barber_code
       LIMIT 100`
    );
    res.json(
      rows.map((row) => ({
        barberCode: row.barber_code,
        barberName: row.full_name || row.barber_code,
        month: Number(row.month),
        year: Number(row.year),
        grossIncome: num(row.gross_income),
        commission: num(row.commission_earned),
        recruitmentDeduction: num(row.recruitment_deduction),
        creditDeduction: num(row.credit_deduction),
        netSalary: num(row.net_salary),
        paidDate: row.paid_date || "",
        status: row.status,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load payment history" });
  }
});

app.post("/api/monthly-closing/process", requireAuth, allow("admin"), async (req, res) => {
  const parsed = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Month is required" });
    return;
  }
  const monthKey = parsed.data.month;
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (monthKey >= currentKey) {
    res.status(400).json({
      error: "This month has not ended yet. Payments can only be processed after the calendar month is complete.",
    });
    return;
  }
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const client = await pool.connect();
  try {
    const summary = await closingSummary(monthKey);
    if (summary.length === 0) {
      res.status(400).json({ error: "No barber data to process" });
      return;
    }
    await client.query("BEGIN");
    for (const barber of summary) {
      await client.query(
        `INSERT INTO monthly_salaries (
           barber_id, month, year, gross_income, commission_earned,
           recruitment_deduction, credit_deduction, net_salary,
           paid_date, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'paid')`,
        [
          barber.barberId,
          month,
          year,
          barber.grossIncome,
          barber.commissionEarned,
          barber.recruitmentDeduction,
          barber.creditDeduction,
          barber.netSalary,
        ]
      );
      const newRecruitmentBalance = Math.max(barber.recruitmentBalance - barber.recruitmentDeduction, 0);
      await client.query(`UPDATE barbers SET advance_remaining = $1 WHERE barber_id = $2`, [
        newRecruitmentBalance,
        barber.barberId,
      ]);
      if (barber.creditDeduction > 0) {
        const credits = await client.query<{
          credit_id: number;
          monthly_deduction: string;
          remaining_balance: string;
        }>(
          `SELECT credit_id, monthly_deduction, remaining_balance
           FROM barber_credits
           WHERE barber_id = $1 AND status = 'approved' AND remaining_balance > 0
           ORDER BY credit_id`,
          [barber.barberId]
        );
        for (const credit of credits.rows) {
          const newBalance = Math.max(num(credit.remaining_balance) - num(credit.monthly_deduction), 0);
          await client.query(`UPDATE barber_credits SET remaining_balance = $1 WHERE credit_id = $2`, [
            newBalance,
            credit.credit_id,
          ]);
        }
      }
    }
    await client.query("COMMIT");
    res.json({
      ok: true,
      processed: summary.length,
      totals: {
        barbers: summary.length,
        grossIncome: summary.reduce((s, r) => s + r.grossIncome, 0),
        commission: summary.reduce((s, r) => s + r.commissionEarned, 0),
        deductions: summary.reduce((s, r) => s + r.totalDeductions, 0),
        netSalary: summary.reduce((s, r) => s + r.netSalary, 0),
      },
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* ignore */
    }
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to process monthly payments" });
  } finally {
    client.release();
  }
});

/** Barber history for a specific day (Shiny History tab) */
app.get("/api/barber/day", requireAuth, allow("barber"), async (req, res) => {
  const barberId = req.user!.barberId;
  const date = String(req.query.date || new Date().toISOString().slice(0, 10));
  if (!barberId) {
    res.status(404).json({ error: "No barber profile is linked to this account" });
    return;
  }
  try {
    const [profile, summary, services] = await Promise.all([
      query<{ commission_rate: string }>(`SELECT commission_rate FROM barbers WHERE barber_id = $1`, [barberId]),
      query<{ income: string; customers: string }>(
        `SELECT COALESCE(SUM(amount),0) AS income, COUNT(*)::int AS customers
         FROM transactions WHERE barber_id = $1 AND transaction_date = $2`,
        [barberId, date]
      ),
      query<{ service_name: string; amount: string; customer_name: string | null; created_at: string }>(
        `SELECT service_name, amount, customer_name, TO_CHAR(created_at, 'HH24:MI') AS created_at
         FROM transactions WHERE barber_id = $1 AND transaction_date = $2
         ORDER BY created_at`,
        [barberId, date]
      ),
    ]);
    const rate = num(profile[0]?.commission_rate) > 1 ? num(profile[0]?.commission_rate) / 100 : num(profile[0]?.commission_rate);
    const gross = num(summary[0]?.income);
    res.json({
      date,
      servicesCount: services.length,
      customers: num(summary[0]?.customers),
      gross,
      commission: gross * rate,
      services: services.map((s) => ({
        service: s.service_name,
        amount: num(s.amount),
        customer: s.customer_name || "Walk-in",
        time: s.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load day history" });
  }
});

app.get("/api/audit", requireAuth, allow("admin"), async (req, res) => {
  const action = String(req.query.action || "");
  const from = String(req.query.from || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const to = String(req.query.to || new Date().toISOString().slice(0, 10));
  try {
    const params: unknown[] = [from, to];
    let sql = `
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
             action_type, table_name, record_id, performed_by
      FROM audit_logs
      WHERE DATE(created_at) BETWEEN $1 AND $2`;
    if (action) {
      params.push(action);
      sql += ` AND action_type = $${params.length}`;
    }
    sql += ` ORDER BY created_at DESC LIMIT 500`;
    const rows = await query<{
      created_at: string;
      action_type: string | null;
      table_name: string | null;
      record_id: number | null;
      performed_by: number | null;
    }>(sql, params);
    res.json(
      rows.map((r) => ({
        timestamp: r.created_at,
        action: r.action_type || "",
        table: r.table_name || "",
        recordId: r.record_id == null ? null : Number(r.record_id),
        userId: r.performed_by == null ? null : Number(r.performed_by),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load audit logs" });
  }
});

const SETTING_KEYS = [
  "shop_name",
  "shop_address",
  "shop_phone",
  "shop_email",
  "shop_maps_url",
  "shop_whatsapp",
  "currency",
  "timezone",
  "tax_rate",
  "commission_rate",
] as const;

app.get("/api/settings", requireAuth, allow("admin"), async (_req, res) => {
  try {
    const rows = await query<{ setting_key: string; setting_value: string | null }>(
      `SELECT setting_key, setting_value FROM system_settings`
    );
    const map: Record<string, string> = {
      shop_name: "The Barbazza",
      shop_address: "186 KK 31 Ave, Ubutare, Kigali, Rwanda",
      shop_phone: "+250 791 345 455",
      shop_email: "",
      shop_maps_url: "https://maps.google.com/?q=-1.974001,30.076725",
      shop_whatsapp: "https://wa.me/250791345455",
      currency: "RWF",
      timezone: "Africa/Kigali",
      tax_rate: "18",
      commission_rate: "40",
    };
    for (const row of rows) {
      if (row.setting_key in map) map[row.setting_key] = row.setting_value || "";
    }
    res.json(map);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load settings" });
  }
});

app.put("/api/settings", requireAuth, allow("admin"), async (req, res) => {
  const parsed = z
    .object({
      shop_name: z.string().max(160).optional(),
      shop_address: z.string().max(240).optional(),
      shop_phone: z.string().max(60).optional(),
      shop_email: z.string().max(160).optional(),
      shop_maps_url: z.string().max(400).optional(),
      shop_whatsapp: z.string().max(240).optional(),
      currency: z.string().max(20).optional(),
      timezone: z.string().max(60).optional(),
      tax_rate: z.union([z.string(), z.number()]).optional(),
      commission_rate: z.union([z.string(), z.number()]).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid settings payload" });
    return;
  }
  try {
    for (const key of SETTING_KEYS) {
      if (parsed.data[key] === undefined) continue;
      const value = String(parsed.data[key] ?? "");
      const exists = await query<{ count: string }>(
        `SELECT COUNT(*)::int AS count FROM system_settings WHERE setting_key = $1`,
        [key]
      );
      if (num(exists[0]?.count) > 0) {
        await query(
          `UPDATE system_settings
           SET setting_value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
           WHERE setting_key = $3`,
          [value, req.user!.userId, key]
        );
      } else {
        await query(
          `INSERT INTO system_settings (setting_key, setting_value, updated_by, updated_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
          [key, value, req.user!.userId]
        );
      }
    }
    void query(
      `INSERT INTO audit_logs (action_type, table_name, record_id, performed_by, created_at)
       VALUES ('UPDATE', 'system_settings', NULL, $1, CURRENT_TIMESTAMP)`,
      [req.user!.userId]
    ).catch(() => undefined);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not save settings" });
  }
});

app.get("/api/locked-days", requireAuth, allow("admin"), async (_req, res) => {
  try {
    const rows = await query<{
      report_date: string;
      total_income: string;
      total_expenses: string;
      net_profit: string;
    }>(
      `SELECT TO_CHAR(report_date, 'YYYY-MM-DD') AS report_date,
              total_income, total_expenses, net_profit
       FROM daily_reports
       WHERE is_locked = TRUE
       ORDER BY report_date DESC
       LIMIT 30`
    );
    res.json(
      rows.map((r) => ({
        date: r.report_date,
        income: num(r.total_income),
        expenses: num(r.total_expenses),
        profit: num(r.net_profit),
        status: "Locked",
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load locked days" });
  }
});

app.post("/api/days/lock", requireAuth, allow("admin"), async (req, res) => {
  const date = String(req.body?.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "Valid date required" });
    return;
  }
  try {
    const existing = await query<{ is_locked: boolean }>(`SELECT is_locked FROM daily_reports WHERE report_date = $1`, [date]);
    if (!existing[0]) {
      res.status(400).json({ error: "No report exists for this date. Close the day first in Manager portal." });
      return;
    }
    if (existing[0].is_locked) {
      res.status(400).json({ error: "This day is already locked" });
      return;
    }
    await query(
      `UPDATE daily_reports
       SET is_locked = TRUE, locked_by = $1, locked_at = CURRENT_TIMESTAMP
       WHERE report_date = $2`,
      [req.user!.userId, date]
    );
    void query(
      `INSERT INTO audit_logs (action_type, table_name, record_id, performed_by, created_at)
       VALUES ('LOCK_DAY', 'daily_reports', NULL, $1, CURRENT_TIMESTAMP)`,
      [req.user!.userId]
    ).catch(() => undefined);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not lock day" });
  }
});

app.post("/api/days/unlock", requireAuth, allow("admin"), async (req, res) => {
  const date = String(req.body?.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "Valid date required" });
    return;
  }
  try {
    const existing = await query<{ is_locked: boolean }>(`SELECT is_locked FROM daily_reports WHERE report_date = $1`, [date]);
    if (!existing[0]) {
      res.status(400).json({ error: "No report exists for this date" });
      return;
    }
    if (!existing[0].is_locked) {
      res.status(400).json({ error: "This day is not locked" });
      return;
    }
    await query(
      `UPDATE daily_reports
       SET is_locked = FALSE, locked_by = NULL, locked_at = NULL
       WHERE report_date = $1`,
      [date]
    );
    void query(
      `INSERT INTO audit_logs (action_type, table_name, record_id, performed_by, created_at)
       VALUES ('UNLOCK_DAY', 'daily_reports', NULL, $1, CURRENT_TIMESTAMP)`,
      [req.user!.userId]
    ).catch(() => undefined);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not unlock day" });
  }
});

/** Daily report snapshot — creates/updates daily_reports like Shiny close-day / generate */
app.post("/api/reports/generate", requireAuth, allow("admin", "manager"), async (req, res) => {
  const date = String(req.body?.date || new Date().toISOString().slice(0, 10));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "Valid date required" });
    return;
  }
  try {
    const locked = await query<{ is_locked: boolean }>(`SELECT is_locked FROM daily_reports WHERE report_date = $1`, [date]);
    if (locked[0]?.is_locked) {
      res.status(400).json({ error: "This day is locked and cannot be regenerated" });
      return;
    }
    const [income, expenses] = await Promise.all([
      query<{ income: string; customers: string }>(
        `SELECT COALESCE(SUM(amount),0) AS income, COUNT(*)::int AS customers
         FROM transactions WHERE transaction_date = $1`,
        [date]
      ),
      query<{ expenses: string }>(
        `SELECT COALESCE(SUM(amount),0) AS expenses FROM expenses WHERE expense_date = $1`,
        [date]
      ),
    ]);
    const totalIncome = num(income[0]?.income);
    const totalCustomers = num(income[0]?.customers);
    const totalExpenses = num(expenses[0]?.expenses);
    const netProfit = totalIncome - totalExpenses;
    if (locked[0]) {
      await query(
        `UPDATE daily_reports
         SET total_customers = $2, total_income = $3, total_expenses = $4, net_profit = $5
         WHERE report_date = $1 AND is_locked = FALSE`,
        [date, totalCustomers, totalIncome, totalExpenses, netProfit]
      );
    } else {
      await query(
        `INSERT INTO daily_reports (report_date, total_customers, total_income, total_expenses, net_profit, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [date, totalCustomers, totalIncome, totalExpenses, netProfit, req.user!.userId]
      );
    }
    const day = await query<{
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
       ORDER BY earned DESC`,
      [date]
    );
    res.json({
      ok: true,
      date,
      customers: totalCustomers,
      income: totalIncome,
      expenses: totalExpenses,
      profit: netProfit,
      barbers: day.map((r) => ({
        code: r.barber_code,
        name: r.full_name || r.barber_code,
        clients: num(r.clients),
        earned: num(r.earned),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not generate report" });
  }
});

const port = Number(process.env.PORT || 4000);

async function boot() {
  // Warm one DB connection before accepting traffic (cuts first-request latency).
  await pool.query("SELECT 1");
  await ensurePublicSchema();
  app.listen(port, "0.0.0.0", () => {
    console.log(`Barbazza API listening on ${port}`);
  });
}

boot().catch((error) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
