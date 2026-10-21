# Test Authentication Script
# This script helps test the authentication with the database

library(RPostgres)
library(DBI)

# Connect to database
con <- dbConnect(
  RPostgres::Postgres(),
  host = "ep-sparkling-pond-agk40clv-pooler.c-2.eu-central-1.aws.neon.tech",
  dbname = "neondb",
  user = "neondb_owner",
  password = "npg_RBWT5yV4LGsJ",
  port = 5432,
  sslmode = "require"
)

# Get admin user info
admin_user <- dbGetQuery(con, "SELECT username, password_hash FROM users WHERE username = 'admin' LIMIT 1")
print("Admin user password hash:")
print(admin_user$password_hash)

# Test password verification using PostgreSQL crypt function
# Note: This requires pgcrypto extension
test_password <- "admin123"  # Change this to the actual password

# Check if pgcrypto extension exists
ext_check <- dbGetQuery(con, "SELECT * FROM pg_extension WHERE extname = 'pgcrypto'")
if (nrow(ext_check) > 0) {
  cat("pgcrypto extension is available\n")
  
  # Try to verify password
  verify_query <- paste0("SELECT (crypt('", test_password, "', '", admin_user$password_hash, "') = '", admin_user$password_hash, "') as verified")
  result <- dbGetQuery(con, verify_query)
  print("Password verification result:")
  print(result)
} else {
  cat("pgcrypto extension is not available\n")
  cat("You may need to install it: CREATE EXTENSION IF NOT EXISTS pgcrypto;\n")
}

dbDisconnect(con)


