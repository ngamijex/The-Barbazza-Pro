import { Router } from "express";
import { z } from "zod";
import { allow, requireAuth } from "./auth";
import { cacheDel, isoDate, num, query } from "./db";
import { mediaUrl, saveImageDataUrl } from "./uploads";

export const profileRoutes = Router();

const FALLBACKS = ["/public-art/hero-shop.jpg", "/public-art/barber-craft.jpg", "/public-art/tools.jpg"];

function hostOf(req: { headers: { host?: string } }) {
  return req.headers.host || "localhost:4000";
}

function parseActions(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,|/]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

async function resolveTargetBarberId(req: import("express").Request, requested?: number | null) {
  const user = req.user!;
  if (user.role === "admin") {
    if (requested) return requested;
  }
  if (user.role === "barber" && user.barberId) return user.barberId;
  if (requested && user.role === "admin") return requested;
  return user.barberId;
}

profileRoutes.get("/profiles", requireAuth, allow("admin"), async (req, res) => {
  try {
    const rows = await query<{
      barber_id: number;
      barber_code: string;
      full_name: string | null;
      public_name: string | null;
      slogan: string | null;
      avatar_url: string | null;
    }>(
      `SELECT b.barber_id, b.barber_code, u.full_name, p.public_name, p.slogan, p.avatar_url
       FROM barbers b
       LEFT JOIN users u ON b.user_id = u.user_id
       LEFT JOIN barber_profiles p ON p.barber_id = b.barber_id
       WHERE b.is_active = TRUE
       ORDER BY u.full_name NULLS LAST, b.barber_code`
    );
    res.json(
      rows.map((row, i) => {
        const publicName = (row.public_name || "").trim();
        return {
          id: Number(row.barber_id),
          code: row.barber_code,
          realName: row.full_name || row.barber_code,
          name: publicName || row.full_name || row.barber_code,
          publicName: publicName || "",
          slogan: row.slogan || "",
          avatarUrl: mediaUrl(hostOf(req), row.avatar_url, FALLBACKS[i % FALLBACKS.length]),
        };
      })
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to list profiles" });
  }
});

profileRoutes.get("/profile", requireAuth, allow("admin", "barber"), async (req, res) => {
  const requested = req.query.barberId ? Number(req.query.barberId) : null;
  const barberId = await resolveTargetBarberId(req, requested);
  if (!barberId) {
    res.status(400).json({ error: "No barber selected" });
    return;
  }
  try {
    const [barber, portfolio, rating] = await Promise.all([
      query<{
        barber_id: number;
        barber_code: string;
        full_name: string | null;
        public_name: string | null;
        slogan: string | null;
        bio: string | null;
        actions: string | null;
        avatar_url: string | null;
        cover_url: string | null;
      }>(
        `SELECT b.barber_id, b.barber_code, u.full_name, p.public_name,
                p.slogan, p.bio, p.actions, p.avatar_url, p.cover_url
         FROM barbers b
         LEFT JOIN users u ON b.user_id = u.user_id
         LEFT JOIN barber_profiles p ON p.barber_id = b.barber_id
         WHERE b.barber_id = $1`,
        [barberId]
      ),
      query<{ item_id: number; image_url: string; caption: string | null; sort_order: number }>(
        `SELECT item_id, image_url, caption, sort_order
         FROM barber_portfolio WHERE barber_id = $1
         ORDER BY sort_order, item_id DESC`,
        [barberId]
      ),
      query<{ avg: string | null; count: string }>(
        `SELECT AVG(score)::float AS avg, COUNT(*)::int AS count
         FROM barber_ratings WHERE barber_id = $1`,
        [barberId]
      ),
    ]);
    if (!barber[0]) {
      res.status(404).json({ error: "Barber not found" });
      return;
    }
    const row = barber[0];
    const publicName = (row.public_name || "").trim();
    res.json({
      id: Number(row.barber_id),
      code: row.barber_code,
      realName: row.full_name || row.barber_code,
      name: publicName || row.full_name || row.barber_code,
      publicName,
      slogan: row.slogan || "",
      bio: row.bio || "",
      actions: parseActions(row.actions),
      actionsRaw: row.actions || "",
      avatarUrl: mediaUrl(hostOf(req), row.avatar_url, FALLBACKS[Number(row.barber_id) % FALLBACKS.length]),
      coverUrl: mediaUrl(hostOf(req), row.cover_url, FALLBACKS[(Number(row.barber_id) + 1) % FALLBACKS.length]),
      rating: rating[0]?.avg ? Math.round(num(rating[0].avg) * 10) / 10 : null,
      reviews: num(rating[0]?.count || 0),
      portfolio: portfolio.map((item) => ({
        id: Number(item.item_id),
        imageUrl: mediaUrl(hostOf(req), item.image_url, FALLBACKS[0]),
        caption: item.caption || "",
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load profile" });
  }
});

profileRoutes.put("/profile", requireAuth, allow("admin", "barber"), async (req, res) => {
  const parsed = z
    .object({
      barberId: z.number().int().optional().nullable(),
      publicName: z.string().max(120).optional(),
      slogan: z.string().max(200).optional(),
      bio: z.string().max(2000).optional(),
      actions: z.string().max(400).optional(),
      avatarDataUrl: z.string().optional().nullable(),
      coverDataUrl: z.string().optional().nullable(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid profile payload" });
    return;
  }
  const barberId = await resolveTargetBarberId(req, parsed.data.barberId);
  if (!barberId) {
    res.status(400).json({ error: "No barber selected" });
    return;
  }
  if (req.user!.role === "barber" && req.user!.barberId !== barberId) {
    res.status(403).json({ error: "You can only edit your own profile" });
    return;
  }
  try {
    let avatarUrl: string | undefined;
    let coverUrl: string | undefined;
    if (parsed.data.avatarDataUrl) avatarUrl = saveImageDataUrl(parsed.data.avatarDataUrl, `avatar-${barberId}`);
    if (parsed.data.coverDataUrl) coverUrl = saveImageDataUrl(parsed.data.coverDataUrl, `cover-${barberId}`);

    const publicName =
      parsed.data.publicName !== undefined ? parsed.data.publicName.trim().slice(0, 120) || null : null;

    await query(
      `INSERT INTO barber_profiles (barber_id, public_name, slogan, bio, actions, avatar_url, cover_url, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8)
       ON CONFLICT (barber_id) DO UPDATE SET
         public_name = CASE WHEN $9 THEN $2 ELSE barber_profiles.public_name END,
         slogan = COALESCE($3, barber_profiles.slogan),
         bio = COALESCE($4, barber_profiles.bio),
         actions = COALESCE($5, barber_profiles.actions),
         avatar_url = COALESCE($6, barber_profiles.avatar_url),
         cover_url = COALESCE($7, barber_profiles.cover_url),
         updated_at = CURRENT_TIMESTAMP,
         updated_by = $8`,
      [
        barberId,
        publicName,
        parsed.data.slogan ?? null,
        parsed.data.bio ?? null,
        parsed.data.actions ?? null,
        avatarUrl || null,
        coverUrl || null,
        req.user!.userId,
        parsed.data.publicName !== undefined,
      ]
    );
    cacheDel("public:");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not save profile" });
  }
});

profileRoutes.post("/portfolio", requireAuth, allow("admin", "barber"), async (req, res) => {
  const parsed = z
    .object({
      barberId: z.number().int().optional().nullable(),
      caption: z.string().max(240).optional(),
      imageDataUrl: z.string().min(40),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Image is required" });
    return;
  }
  const barberId = await resolveTargetBarberId(req, parsed.data.barberId);
  if (!barberId) {
    res.status(400).json({ error: "No barber selected" });
    return;
  }
  if (req.user!.role === "barber" && req.user!.barberId !== barberId) {
    res.status(403).json({ error: "You can only edit your own portfolio" });
    return;
  }
  try {
    const imageUrl = saveImageDataUrl(parsed.data.imageDataUrl, `work-${barberId}`);
    const inserted = await query<{ item_id: number }>(
      `INSERT INTO barber_portfolio (barber_id, image_url, caption, created_by)
       VALUES ($1, $2, $3, $4) RETURNING item_id`,
      [barberId, imageUrl, parsed.data.caption || null, req.user!.userId]
    );
    cacheDel("public:");
    res.json({
      ok: true,
      item: {
        id: Number(inserted[0].item_id),
        imageUrl: mediaUrl(hostOf(req), imageUrl, FALLBACKS[0]),
        caption: parsed.data.caption || "",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not add work photo" });
  }
});

profileRoutes.delete("/portfolio/:id", requireAuth, allow("admin", "barber"), async (req, res) => {
  const itemId = Number(req.params.id);
  if (!itemId) {
    res.status(400).json({ error: "Invalid item" });
    return;
  }
  try {
    const rows = await query<{ barber_id: number }>(`SELECT barber_id FROM barber_portfolio WHERE item_id = $1`, [itemId]);
    if (!rows[0]) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (req.user!.role === "barber" && req.user!.barberId !== Number(rows[0].barber_id)) {
      res.status(403).json({ error: "Not allowed" });
      return;
    }
    await query(`DELETE FROM barber_portfolio WHERE item_id = $1`, [itemId]);
    cacheDel("public:");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not delete" });
  }
});

profileRoutes.get("/barber/bookings", requireAuth, allow("barber", "admin", "manager"), async (req, res) => {
  const month = String(req.query.month || new Date().toISOString().slice(0, 7));
  const requested = req.query.barberId ? Number(req.query.barberId) : null;
  const barberId = await resolveTargetBarberId(req, requested);
  if (!barberId) {
    res.status(400).json({ error: "No barber selected" });
    return;
  }
  const start = `${month.slice(0, 7)}-01`;
  const [y, m] = start.split("-").map(Number);
  const end = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  try {
    const rows = await query<{
      booking_id: number;
      client_name: string;
      client_phone: string;
      booking_date: string;
      booking_time: string;
      status: string;
      service_name: string | null;
      notes: string | null;
    }>(
      `SELECT b.booking_id, b.client_name, b.client_phone, b.status, b.notes,
              TO_CHAR(b.booking_date, 'YYYY-MM-DD') AS booking_date,
              TO_CHAR(b.booking_time, 'HH24:MI') AS booking_time,
              s.service_name
       FROM client_bookings b
       LEFT JOIN services s ON b.service_id = s.service_id
       WHERE b.barber_id = $1 AND b.booking_date BETWEEN $2 AND $3
       ORDER BY b.booking_date, b.booking_time`,
      [barberId, start, end]
    );
    const ratings = await query<{
      rating_id: number;
      client_name: string;
      score: number;
      comment: string | null;
      created_at: string;
    }>(
      `SELECT rating_id, client_name, score, comment,
              TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at
       FROM barber_ratings WHERE barber_id = $1
       ORDER BY created_at DESC LIMIT 30`,
      [barberId]
    );
    res.json({
      month: month.slice(0, 7),
      bookings: rows.map((r) => ({
        id: Number(r.booking_id),
        clientName: r.client_name,
        phone: r.client_phone,
        date: r.booking_date,
        time: r.booking_time,
        status: r.status,
        service: r.service_name || "",
        notes: r.notes || "",
      })),
      ratings: ratings.map((r) => ({
        id: Number(r.rating_id),
        name: r.client_name,
        score: Number(r.score),
        comment: r.comment || "",
        date: r.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load bookings" });
  }
});

profileRoutes.patch("/barber/bookings/:id", requireAuth, allow("barber", "admin", "manager"), async (req, res) => {
  const bookingId = Number(req.params.id);
  const parsed = z.object({ status: z.enum(["pending", "confirmed", "completed", "cancelled"]) }).safeParse(req.body);
  if (!bookingId || !parsed.success) {
    res.status(400).json({ error: "Invalid status update" });
    return;
  }
  try {
    const rows = await query<{ barber_id: number }>(`SELECT barber_id FROM client_bookings WHERE booking_id = $1`, [bookingId]);
    if (!rows[0]) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    if (req.user!.role === "barber" && req.user!.barberId !== Number(rows[0].barber_id)) {
      res.status(403).json({ error: "Not allowed" });
      return;
    }
    await query(`UPDATE client_bookings SET status = $1 WHERE booking_id = $2`, [parsed.data.status, bookingId]);
    cacheDel("public:");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not update booking" });
  }
});

profileRoutes.get("/notifications", requireAuth, async (req, res) => {
  try {
    const rows = await query<{
      notification_id: number;
      title: string;
      body: string | null;
      link: string | null;
      is_read: boolean;
      created_at: string;
    }>(
      `SELECT notification_id, title, body, link, is_read,
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 40`,
      [req.user!.userId]
    );
    res.json(
      rows.map((r) => ({
        id: Number(r.notification_id),
        title: r.title,
        body: r.body || "",
        link: r.link || "",
        read: Boolean(r.is_read),
        createdAt: r.created_at,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load notifications" });
  }
});

profileRoutes.post("/notifications/read", requireAuth, async (req, res) => {
  const id = req.body?.id ? Number(req.body.id) : null;
  try {
    if (id) {
      await query(`UPDATE notifications SET is_read = TRUE WHERE notification_id = $1 AND user_id = $2`, [
        id,
        req.user!.userId,
      ]);
    } else {
      await query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1`, [req.user!.userId]);
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Could not update notifications" });
  }
});

export async function notifyBarberUser(barberId: number, title: string, body: string, link: string) {
  const users = await query<{ user_id: number }>(`SELECT user_id FROM barbers WHERE barber_id = $1`, [barberId]);
  if (!users[0]?.user_id) return;
  await query(`INSERT INTO notifications (user_id, title, body, link) VALUES ($1, $2, $3, $4)`, [
    users[0].user_id,
    title,
    body,
    link,
  ]);
}

export { parseActions, FALLBACKS, hostOf, mediaUrl };
