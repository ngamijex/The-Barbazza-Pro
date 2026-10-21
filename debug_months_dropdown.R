# Debug: Check for transactions in database
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

# Check transactions
cat("=== CHECKING TRANSACTIONS ===\n")
transactions <- dbGetQuery(con, "
  SELECT COUNT(*) as count FROM transactions
")
cat("Total transactions:", transactions$count, "\n\n")

if (transactions$count > 0) {
  # Get date range
  date_range <- dbGetQuery(con, "
    SELECT 
      MIN(transaction_date) as first_date,
      MAX(transaction_date) as last_date
    FROM transactions
  ")
  cat("Date range:\n")
  cat("  First transaction:", as.character(date_range$first_date), "\n")
  cat("  Last transaction:", as.character(date_range$last_date), "\n\n")
  
  # Get distinct months
  months <- dbGetQuery(con, "
    SELECT DISTINCT 
      TO_CHAR(transaction_date, 'YYYY-MM') as month_key,
      TO_CHAR(transaction_date, 'Month YYYY') as month_label,
      COUNT(*) as transaction_count
    FROM transactions
    GROUP BY month_key, month_label
    ORDER BY month_key DESC
  ")
  
  cat("Available months with transactions:\n")
  print(months)
  cat("\n")
  
  # Test the exact query from the app
  cat("=== TESTING APP QUERY ===\n")
  test_query <- dbGetQuery(con, "
    SELECT DISTINCT 
      TO_CHAR(transaction_date, 'YYYY-MM') as month_key,
      TO_CHAR(transaction_date, 'Month YYYY') as month_label
    FROM transactions
    WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
    ORDER BY month_key DESC
  ")
  
  cat("Months from last 12 months:\n")
  print(test_query)
  cat("\n")
  
  if (nrow(test_query) > 0) {
    cat("✓ Query returns", nrow(test_query), "month(s)\n")
    cat("These should appear in the dropdown!\n")
  } else {
    cat("✗ No months found in last 12 months\n")
    cat("All transactions are older than 12 months\n")
  }
} else {
  cat("✗ NO TRANSACTIONS FOUND IN DATABASE!\n")
  cat("You need to add some transactions first.\n")
}

# Close connection
dbDisconnect(con)
cat("\n=== DEBUG COMPLETE ===\n")


