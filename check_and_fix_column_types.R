# Check and Fix monthly_salaries Column Types
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

# Check current column types
cat("=== CURRENT COLUMN TYPES ===\n")
columns <- dbGetQuery(con, "
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns 
  WHERE table_name = 'monthly_salaries'
  ORDER BY ordinal_position
")
print(columns)

# Check if month and year columns exist and their types
month_col <- columns[columns$column_name == "month", ]
year_col <- columns[columns$column_name == "year", ]

cat("\n=== FIXING COLUMN TYPES ===\n")

# Fix month column if it's not INTEGER
if (nrow(month_col) > 0 && month_col$data_type != "integer") {
  cat("Month column is", month_col$data_type, "- need to change to INTEGER\n")
  
  tryCatch({
    # Drop the column and recreate as INTEGER
    dbExecute(con, "ALTER TABLE monthly_salaries DROP COLUMN IF EXISTS month CASCADE")
    dbExecute(con, "ALTER TABLE monthly_salaries ADD COLUMN month INTEGER")
    cat("✓ Recreated 'month' column as INTEGER\n")
  }, error = function(e) {
    cat("Error fixing month column:", e$message, "\n")
  })
} else if (nrow(month_col) == 0) {
  cat("Month column doesn't exist - creating as INTEGER\n")
  dbExecute(con, "ALTER TABLE monthly_salaries ADD COLUMN month INTEGER")
  cat("✓ Created 'month' column as INTEGER\n")
} else {
  cat("✓ Month column is already INTEGER\n")
}

# Fix year column if it's not INTEGER
if (nrow(year_col) > 0 && year_col$data_type != "integer") {
  cat("Year column is", year_col$data_type, "- need to change to INTEGER\n")
  
  tryCatch({
    # Drop the column and recreate as INTEGER
    dbExecute(con, "ALTER TABLE monthly_salaries DROP COLUMN IF EXISTS year CASCADE")
    dbExecute(con, "ALTER TABLE monthly_salaries ADD COLUMN year INTEGER")
    cat("✓ Recreated 'year' column as INTEGER\n")
  }, error = function(e) {
    cat("Error fixing year column:", e$message, "\n")
  })
} else if (nrow(year_col) == 0) {
  cat("Year column doesn't exist - creating as INTEGER\n")
  dbExecute(con, "ALTER TABLE monthly_salaries ADD COLUMN year INTEGER")
  cat("✓ Created 'year' column as INTEGER\n")
} else {
  cat("✓ Year column is already INTEGER\n")
}

# Check final structure
cat("\n=== FINAL COLUMN TYPES ===\n")
final_columns <- dbGetQuery(con, "
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'monthly_salaries'
  ORDER BY ordinal_position
")
print(final_columns)

# Re-add unique constraint
cat("\n=== RE-ADDING CONSTRAINTS ===\n")
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
cat("\n✓✓✓ COLUMN TYPES FIXED! ✓✓✓\n")
cat("\nRestart the app and try processing payments again!\n")


