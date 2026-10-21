# Create Monthly Salaries Table
# Run this script to create the table for tracking monthly payments

library(RPostgres)
library(DBI)

# Database configuration
DB_CONFIG <- list(
  host = "ep-sparkling-pond-agk40clv-pooler.c-2.eu-central-1.aws.neon.tech",
  dbname = "neondb",
  user = "neondb_owner",
  password = "npg_RBWT5yV4LGsJ",
  port = 5432,
  sslmode = "require"
)

# Connect to database
con <- dbConnect(
  RPostgres::Postgres(),
  host = DB_CONFIG$host,
  dbname = DB_CONFIG$dbname,
  user = DB_CONFIG$user,
  password = DB_CONFIG$password,
  port = DB_CONFIG$port,
  sslmode = DB_CONFIG$sslmode
)

cat("Connected to database\n")

# Create monthly_salaries table
tryCatch({
  dbExecute(con, "
    CREATE TABLE IF NOT EXISTS monthly_salaries (
      salary_id SERIAL PRIMARY KEY,
      barber_id INTEGER REFERENCES barbers(barber_id),
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      gross_income DECIMAL(10,2) NOT NULL DEFAULT 0,
      commission_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
      recruitment_deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
      credit_deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
      net_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
      paid_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'paid',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(barber_id, month, year)
    )
  ")
  cat("✓ monthly_salaries table created successfully\n")
}, error = function(e) {
  cat("Error creating table:", e$message, "\n")
})

# Create index for faster queries
tryCatch({
  dbExecute(con, "
    CREATE INDEX IF NOT EXISTS idx_monthly_salaries_barber 
    ON monthly_salaries(barber_id)
  ")
  cat("✓ Index created on barber_id\n")
}, error = function(e) {
  cat("Error creating index:", e$message, "\n")
})

tryCatch({
  dbExecute(con, "
    CREATE INDEX IF NOT EXISTS idx_monthly_salaries_date 
    ON monthly_salaries(year, month)
  ")
  cat("✓ Index created on year, month\n")
}, error = function(e) {
  cat("Error creating index:", e$message, "\n")
})

# Add columns to barbers table if they don't exist
tryCatch({
  dbExecute(con, "
    ALTER TABLE barbers 
    ADD COLUMN IF NOT EXISTS recruitment_advance DECIMAL(10,2) DEFAULT 0
  ")
  cat("✓ recruitment_advance column added to barbers\n")
}, error = function(e) {
  cat("recruitment_advance column:", e$message, "\n")
})

tryCatch({
  dbExecute(con, "
    ALTER TABLE barbers 
    ADD COLUMN IF NOT EXISTS advance_monthly_deduction DECIMAL(10,2) DEFAULT 0
  ")
  cat("✓ advance_monthly_deduction column added to barbers\n")
}, error = function(e) {
  cat("advance_monthly_deduction column:", e$message, "\n")
})

tryCatch({
  dbExecute(con, "
    ALTER TABLE barbers 
    ADD COLUMN IF NOT EXISTS advance_remaining DECIMAL(10,2) DEFAULT 0
  ")
  cat("✓ advance_remaining column added to barbers\n")
}, error = function(e) {
  cat("advance_remaining column:", e$message, "\n")
})

# Create barber_credits table if doesn't exist
tryCatch({
  dbExecute(con, "
    CREATE TABLE IF NOT EXISTS barber_credits (
      credit_id SERIAL PRIMARY KEY,
      barber_id INTEGER REFERENCES barbers(barber_id),
      amount DECIMAL(10,2) NOT NULL,
      reason TEXT NOT NULL,
      request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'pending',
      approved_by INTEGER REFERENCES users(user_id),
      approval_date TIMESTAMP,
      monthly_deduction DECIMAL(10,2) DEFAULT 0,
      remaining_balance DECIMAL(10,2) DEFAULT 0,
      notes TEXT
    )
  ")
  cat("✓ barber_credits table created successfully\n")
}, error = function(e) {
  cat("barber_credits table:", e$message, "\n")
})

# Create index on barber_credits
tryCatch({
  dbExecute(con, "
    CREATE INDEX IF NOT EXISTS idx_barber_credits_barber 
    ON barber_credits(barber_id)
  ")
  cat("✓ Index created on barber_credits.barber_id\n")
}, error = function(e) {
  cat("Error creating barber_credits index:", e$message, "\n")
})

# Close connection
dbDisconnect(con)
cat("\n✓ All database updates completed!\n")
cat("\nYou can now use the Monthly Closing feature.\n")


