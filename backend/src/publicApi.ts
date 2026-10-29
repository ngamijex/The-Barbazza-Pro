import { Router } from "express";
import { z } from "zod";
import { isoDate, num, query, cacheGet, cacheSet, cacheDel } from "./db";

export const publicApi = Router();

function publicCache(res: import("express").Response, seconds = 20) {
  res.setHeader("Cache-Control", `public, max-age=${seconds}`);
}

publicApi.get("/barbers", async (_req, res) => {
  try {
    const cached = cacheGet<unknown>("public:barbers");
    if (cached) {
      publicCache(res, 30);
      res.json(cached);
      return;
    }
    const rows = await query<{
      barber_id: number;
      barber_code: string;
      full_name: string | null;
      commission_rate: string;
      clients: string;
      earned: string;
      avg_rating: string | null;
      rating_count: string;
    }>(
      `SELECT b.barber_id, b.barber_code, u.full_name, b.commission_rate,
              COUNT(DISTINCT t.transaction_id)::int AS clients,
              COALESCE(SUM(t.amount), 0) AS earned,
              AVG(r.score)::float AS avg_rating,
              COUNT(DISTINCT r.rating_id)::int AS rating_count
       FROM barbers b
       LEFT JOIN users u ON b.user_id = u.user_id
       LEFT JOIN transactions t
         ON b.barber_id = t.barber_id
        AND t.transaction_date >= CURRENT_DATE - INTERVAL '90 days'
       LEFT JOIN barber_ratings r ON b.barber_id = r.barber_id
       WHERE b.is_active = TRUE
       GROUP BY b.barber_id, b.barber_code, u.full_name, b.commission_rate
       ORDER BY avg_rating DESC NULLS LAST, clients DESC`
    );
    const payload = rows.map((row, index) => ({
      id: Number(row.barber_id),
      code: row.barber_code,
      name: row.full_name || row.barber_code,
      specialty: index % 3 === 0 ? "Precision cuts" : index % 3 === 1 ? "Classic fades" : "Beard & finish",
      clients90d: num(row.clients),
      rating: row.avg_rating ? Math.round(num(row.avg_rating) * 10) / 10 : null,
      reviews: num(row.rating_count),
    }));
    cacheSet("public:barbers", payload, 30_000);
    publicCache(res, 30);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load barbers" });
  }
});

publicApi.get("/barbers/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid barber" });
    return;
  }
  try {
    const [barber, ratings, services, recent] = await Promise.all([
      query<{
        barber_id: number;
        barber_code: string;
        full_name: string | null;
        clients: string;
        earned: string;
        days: string;
      }>(
        `SELECT b.barber_id, b.barber_code, u.full_name,
                COUNT(t.transaction_id)::int AS clients,
                COALESCE(SUM(t.amount),0) AS earned,
                COUNT(DISTINCT t.transaction_date)::int AS days
         FROM barbers b
         LEFT JOIN users u ON b.user_id = u.user_id
         LEFT JOIN transactions t
           ON b.barber_id = t.barber_id
          AND t.transaction_date >= CURRENT_DATE - INTERVAL '90 days'
         WHERE b.barber_id = $1 AND b.is_active = TRUE
         GROUP BY b.barber_id, b.barber_code, u.full_name`,
        [id]
      ),
      query<{
        rating_id: number;
        client_name: string;
        score: number;
        comment: string | null;
        created_at: string;
      }>(
        `SELECT rating_id, client_name, score, comment,
                TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at
         FROM barber_ratings
         WHERE barber_id = $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [id]
      ),
      query<{ service_id: number; service_name: string; base_price: string }>(
        `SELECT service_id, service_name, base_price
         FROM services WHERE is_active = TRUE
         ORDER BY service_name`
      ),
      query<{ day: string; total: string }>(
        `SELECT transaction_date AS day, COUNT(*)::int AS total
         FROM transactions
         WHERE barber_id = $1 AND transaction_date >= CURRENT_DATE - INTERVAL '14 days'
         GROUP BY transaction_date
         ORDER BY transaction_date`,
        [id]
      ),
    ]);
    if (!barber[0]) {
      res.status(404).json({ error: "Barber not found" });
      return;
    }
    const avg =
      ratings.length > 0 ? Math.round((ratings.reduce((s, r) => s + Number(r.score), 0) / ratings.length) * 10) / 10 : null;
    res.json({
      id: Number(barber[0].barber_id),
      code: barber[0].barber_code,
      name: barber[0].full_name || barber[0].barber_code,
      clients90d: num(barber[0].clients),
      daysActive: num(barber[0].days),
      rating: avg,
      reviews: ratings.length,
      ratings: ratings.map((r) => ({
        id: Number(r.rating_id),
        name: r.client_name,
        score: Number(r.score),
        comment: r.comment || "",
        date: r.created_at,
      })),
      services: services.map((s) => ({
        id: Number(s.service_id),
        name: s.service_name,
        price: num(s.base_price),
      })),
      activity: recent.map((r) => ({ date: isoDate(r.day), cuts: num(r.total) })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load profile" });
  }
});

publicApi.get("/services", async (_req, res) => {
  try {
    const rows = await query<{ service_id: number; service_name: string; base_price: string; service_description: string | null }>(
      `SELECT service_id, service_name, base_price, service_description
       FROM services WHERE is_active = TRUE ORDER BY service_name`
    );
    publicCache(res, 60);
    res.json(
      rows.map((row) => ({
        id: Number(row.service_id),
        name: row.service_name,
        price: num(row.base_price),
        description: row.service_description || "",
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load services" });
  }
});

publicApi.get("/slots", async (req, res) => {
  const barberId = Number(req.query.barberId);
  const date = String(req.query.date || "");
  if (!barberId || !/^\d{4}-\d{2}$|^\d{4}-\d{2}-\d{2}$/.test(date.slice(0, 10))) {
    res.status(400).json({ error: "Barber and date are required" });
    return;
  }
  const day = date.slice(0, 10);
  try {
    const taken = await query<{ booking_time: string }>(
      `SELECT TO_CHAR(booking_time, 'HH24:MI') AS booking_time
       FROM client_bookings
       WHERE barber_id = $1 AND booking_date = $2 AND status IN ('pending', 'confirmed')`,
      [barberId, day]
    );
    const busy = new Set(taken.map((t) => t.booking_time));
    const slots: string[] = [];
    for (let hour = 9; hour <= 19; hour++) {
      for (const min of ["00", "30"]) {
        if (hour === 19 && min === "30") continue;
        const label = `${String(hour).padStart(2, "0")}:${min}`;
        if (!busy.has(label)) slots.push(label);
      }
    }
    res.json({ date: day, slots });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load slots" });
  }
});

publicApi.post("/bookings", async (req, res) => {
  const parsed = z
    .object({
      barberId: z.number().int(),
      serviceId: z.number().int().optional().nullable(),
      clientName: z.string().min(2).max(120),
      clientPhone: z.string().min(7).max(40),
      clientEmail: z.string().email().optional().or(z.literal("")),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      time: z.string().regex(/^\d{2}:\d{2}$/),
      notes: z.string().max(500).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all required booking details" });
    return;
  }
  const data = parsed.data;
  const today = new Date().toISOString().slice(0, 10);
  if (data.date < today) {
    res.status(400).json({ error: "Choose a future date" });
    return;
  }
  try {
    const clash = await query<{ booking_id: number }>(
      `SELECT booking_id FROM client_bookings
       WHERE barber_id = $1 AND booking_date = $2 AND TO_CHAR(booking_time, 'HH24:MI') = $3
         AND status IN ('pending', 'confirmed')
       LIMIT 1`,
      [data.barberId, data.date, data.time]
    );
    if (clash[0]) {
      res.status(409).json({ error: "That time was just taken. Pick another slot." });
      return;
    }
    const inserted = await query<{ booking_id: number }>(
      `INSERT INTO client_bookings
         (barber_id, service_id, client_name, client_phone, client_email, booking_date, booking_time, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7::time, $8, 'pending')
       RETURNING booking_id`,
      [
        data.barberId,
        data.serviceId || null,
        data.clientName,
        data.clientPhone,
        data.clientEmail || null,
        data.date,
        data.time,
        data.notes || null,
      ]
    );
    cacheDel("public:");
    res.json({ ok: true, bookingId: Number(inserted[0]?.booking_id) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not create booking" });
  }
});

publicApi.post("/ratings", async (req, res) => {
  const parsed = z
    .object({
      barberId: z.number().int(),
      clientName: z.string().min(2).max(120),
      score: z.number().int().min(1).max(5),
      comment: z.string().max(800).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Name and a 1–5 rating are required" });
    return;
  }
  try {
    await query(
      `INSERT INTO barber_ratings (barber_id, client_name, score, comment)
       VALUES ($1, $2, $3, $4)`,
      [parsed.data.barberId, parsed.data.clientName, parsed.data.score, parsed.data.comment || null]
    );
    cacheDel("public:");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not save rating" });
  }
});
