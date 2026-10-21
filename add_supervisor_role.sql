-- Add 'supervisor' to allowed user roles
-- Run this in your Neon/PostgreSQL database (e.g. SQL Editor) if you get:
--   ERROR: new row for relation "users" violates check constraint "users_role_check"

-- Drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Re-add the constraint including 'supervisor'
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'manager', 'supervisor', 'barber'));

-- If the above fails (e.g. different constraint name), find it with:
--   SELECT conname FROM pg_constraint WHERE conrelid = 'users'::regclass AND contype = 'c';
-- Then: ALTER TABLE users DROP CONSTRAINT <conname>;
-- Then run the ADD CONSTRAINT above.
