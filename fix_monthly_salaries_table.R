# Quick Fix: Add missing columns to monthly_salaries table
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

cat("Connected to database\n\n")

# Check current structure
cat("=== CHECKING CURRENT TABLE STRUCTURE ===\n")
current_columns <- tryCatch({
  dbGetQuery(con, "
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'monthly_salaries'
    ORDER BY ordinal_position
  ")
}, error = function(e) {
  cat("Table doesn't exist or error:", e$message, "\n")
  data.frame()
})

if (nrow(current_columns) > 0) {
  cat("Current columns:\n")
  print(current_columns)
  cat("\n")
}

# Add missing columns
cat("=== ADDING MISSING COLUMNS ===\n")

# Add month column
tryCatch({
  dbExecute(con, "
    ALTER TABLE monthly_salaries 
    ADD COLUMN IF NOT EXISTS month INTEGER
  ")
  cat("✓ Added 'month' column\n")
}, error = function(e) {
  cat("month column:", e$message, "\n")
})

# Add year column
tryCatch({
  dbExecute(con, "
    ALTER TABLE monthly_salaries 
    ADD COLUMN IF NOT EXISTS year INTEGER
  ")
  cat("✓ Added 'year' column\n")
}, error = function(e) {
  cat("year column:", e$message, "\n")
})

# Add other missing columns
tryCatch({
  dbExecute(con, "
    ALTER TABLE monthly_salaries 
    ADD COLUMN IF NOT EXISTS gross_income DECIMAL(10,2) DEFAULT 0
  ")
  cat("✓ Added 'gross_income' column\n")
}, error = function(e) {
  cat("gross_income column:", e$message, "\n")
})

tryCatch({
  dbExecute(con, "
    ALTER TABLE monthly_salaries 
    ADD COLUMN IF NOT EXISTS commission_earned DECIMAL(10,2) DEFAULT 0
  ")
  cat("✓ Added 'commission_earned' column\n")
}, error = function(e) {
  cat("commission_earned column:", e$message, "\n")
})

tryCatch({
  dbExecute(con, "
    ALTER TABLE monthly_salaries 
    ADD COLUMN IF NOT EXISTS recruitment_deduction DECIMAL(10,2) DEFAULT 0
  ")
  cat("✓ Added 'recruitment_deduction' column\n")
}, error = function(e) {
  cat("recruitment_deduction column:", e$message, "\n")
})

tryCatch({
  dbExecute(con, "
    ALTER TABLE monthly_salaries 
    ADD COLUMN IF NOT EXISTS credit_deduction DECIMAL(10,2) DEFAULT 0
  ")
  cat("✓ Added 'credit_deduction' column\n")
}, error = function(e) {
  cat("credit_deduction column:", e$message, "\n")
})

tryCatch({
  dbExecute(con, "
    ALTER TABLE monthly_salaries 
    ADD COLUMN IF NOT EXISTS net_salary DECIMAL(10,2) DEFAULT 0
  ")
  cat("✓ Added 'net_salary' column\n")
}, error = function(e) {
  cat("net_salary column:", e$message, "\n")
})

tryCatch({
  dbExecute(con, "
    ALTER TABLE monthly_salaries 
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'paid'
  ")
  cat("✓ Added 'status' column\n")
}, error = function(e) {
  cat("status column:", e$message, "\n")
})

tryCatch({
  dbExecute(con, "
    ALTER TABLE monthly_salaries 
    ADD COLUMN IF NOT EXISTS paid_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ")
  cat("✓ Added 'paid_date' column\n")
}, error = function(e) {
  cat("paid_date column:", e$message, "\n")
})

# Check final structure
cat("\n=== FINAL TABLE STRUCTURE ===\n")
final_columns <- dbGetQuery(con, "
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'monthly_salaries'
  ORDER BY ordinal_position
")
print(final_columns)

# Add unique constraint if not exists
cat("\n=== ADDING UNIQUE CONSTRAINT ===\n")
tryCatch({
  dbExecute(con, "
    ALTER TABLE monthly_salaries 
    DROP CONSTRAINT IF EXISTS monthly_salaries_barber_month_year_key
  ")
  dbExecute(con, "
    ALTER TABLE monthly_salaries 
    ADD CONSTRAINT monthly_salaries_barber_month_year_key 
    UNIQUE (barber_id, month, year)
  ")
  cat("✓ Added unique constraint on (barber_id, month, year)\n")
}, error = function(e) {
  cat("Constraint:", e$message, "\n")
})

# Close connection
dbDisconnect(con)
cat("\n✓✓✓ TABLE STRUCTURE FIXED! ✓✓✓\n")
cat("\nYou can now process monthly payments!\n")


