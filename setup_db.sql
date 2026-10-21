-- Setup Database Script
-- Run this in your PostgreSQL/Neon database to ensure required extensions are available

-- Enable pgcrypto extension for password verification
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify extension is installed
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- Note: The database already has the necessary tables and structure
-- This script only ensures the pgcrypto extension is available for password verification


