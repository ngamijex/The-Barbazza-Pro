import { pool } from "./db";
import { SHOP_DEFAULTS } from "./shop";

/** Ensure public booking / ratings / profile tables exist (safe to run on every boot). */
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

      CREATE TABLE IF NOT EXISTS barber_profiles (
        barber_id INTEGER PRIMARY KEY REFERENCES barbers(barber_id) ON DELETE CASCADE,
        public_name VARCHAR(120),
        slogan VARCHAR(200),
        bio TEXT,
        actions TEXT,
        avatar_url TEXT,
        cover_url TEXT,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER REFERENCES users(user_id)
      );

      ALTER TABLE barber_profiles
        ADD COLUMN IF NOT EXISTS public_name VARCHAR(120);

      CREATE TABLE IF NOT EXISTS barber_portfolio (
        item_id SERIAL PRIMARY KEY,
        barber_id INTEGER NOT NULL REFERENCES barbers(barber_id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        caption VARCHAR(240),
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(user_id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        notification_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        title VARCHAR(160) NOT NULL,
        body TEXT,
        link VARCHAR(240),
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_bookings_barber_date
        ON client_bookings (barber_id, booking_date);

      CREATE INDEX IF NOT EXISTS idx_ratings_barber
        ON barber_ratings (barber_id);

      CREATE INDEX IF NOT EXISTS idx_portfolio_barber
        ON barber_portfolio (barber_id, sort_order, item_id);

      CREATE INDEX IF NOT EXISTS idx_notifications_user
        ON notifications (user_id, is_read, created_at DESC);

      CREATE TABLE IF NOT EXISTS staff_profiles (
        user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
        monthly_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER REFERENCES users(user_id)
      );

      CREATE TABLE IF NOT EXISTS staff_credits (
        credit_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        amount NUMERIC(12,2) NOT NULL,
        reason TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        remaining_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
        monthly_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
        request_date DATE NOT NULL DEFAULT CURRENT_DATE,
        approved_by INTEGER REFERENCES users(user_id),
        approved_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_staff_credits_user
        ON staff_credits (user_id, status, request_date DESC);
    `);

    // Allow cleaner role on users.role check constraint.
    await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`);
    await client.query(`
      ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role::text = ANY (ARRAY['admin','manager','supervisor','barber','cleaner']::text[]))
    `);

    // Seed shop contact from Google Business if settings rows are missing/empty.
    for (const [key, value] of Object.entries(SHOP_DEFAULTS)) {
      await client.query(
        `INSERT INTO system_settings (setting_key, setting_value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (setting_key) DO UPDATE
           SET setting_value = EXCLUDED.setting_value,
               updated_at = CURRENT_TIMESTAMP
         WHERE system_settings.setting_value IS NULL
            OR TRIM(system_settings.setting_value) = ''
            OR (system_settings.setting_key = 'shop_address'
                AND system_settings.setting_value IN ('Kigali, Rwanda', 'Kigali'))`,
        [key, value]
      );
    }
  } finally {
    client.release();
  }
}
