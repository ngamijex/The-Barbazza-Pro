import { pool } from "./db";

/** Ensure public booking / ratings tables exist (safe to run on every boot). */
export async function ensurePublicSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_bookings (
        booking_id SERIAL PRIMARY KEY,
        barber_id INTEGER NOT NULL REFERENCES barbers(barber_id),
        service_id INTEGER REFERENCES services(service_id),
        client_name VARCHAR(120) NOT NULL,
        client_phone VARCHAR(40) NOT NULL,
        client_email VARCHAR(160),
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS barber_ratings (
        rating_id SERIAL PRIMARY KEY,
        barber_id INTEGER NOT NULL REFERENCES barbers(barber_id),
        client_name VARCHAR(120) NOT NULL,
        score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_bookings_barber_date
        ON client_bookings (barber_id, booking_date);

      CREATE INDEX IF NOT EXISTS idx_ratings_barber
        ON barber_ratings (barber_id);
    `);
  } finally {
    client.release();
  }
}
