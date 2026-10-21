#!/usr/bin/env Rscript

# ============================================
# Add 'supervisor' role to users_role_check
# Run this file in R / RStudio:
#   source("add_supervisor_role.R")
# ============================================

# Load global config (DB connection helpers)
source("global.R")

con <- get_db_connection()
on.exit(close_db_connection(con))

cat("Updating users_role_check constraint to include 'supervisor'...\n")

tryCatch({
  # Drop existing check constraint if it exists
  DBI::dbExecute(con, "
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  ")
  
  # Recreate constraint with 'supervisor' included
  DBI::dbExecute(con, "
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN ('admin', 'manager', 'supervisor', 'barber'));
  ")
  
  cat("✓ Constraint updated successfully. You can now create supervisor users.\n")
}, error = function(e) {
  cat("✗ Failed to update constraint:\n", e$message, "\n")
  cat("If the constraint has a different name, run this in SQL to find it:\n")
  cat("  SELECT conname FROM pg_constraint WHERE conrelid = 'users'::regclass AND contype = 'c';\n")
})

