# Database Setup Script
# Run this script to set up required database extensions
# This ensures the pgcrypto extension is available for password verification

library(RPostgres)
library(DBI)

source("utils/db_connection.R")

cat("========================================\n")
cat("BARBAZZA - Database Setup\n")
cat("========================================\n\n")

# Connect to database
cat("Connecting to database...\n")
con <- get_db_connection()

tryCatch({
  # Check if pgcrypto extension exists
  cat("Checking for pgcrypto extension...\n")
  ext_check <- dbGetQuery(con, "SELECT * FROM pg_extension WHERE extname = 'pgcrypto'")
  
  if (nrow(ext_check) > 0) {
    cat("✓ pgcrypto extension is already installed.\n")
  } else {
    cat("Installing pgcrypto extension...\n")
    
    # Create the extension
    dbExecute(con, "CREATE EXTENSION IF NOT EXISTS pgcrypto")
    
    # Verify installation
    ext_check <- dbGetQuery(con, "SELECT * FROM pg_extension WHERE extname = 'pgcrypto'")
    
    if (nrow(ext_check) > 0) {
      cat("✓ pgcrypto extension installed successfully!\n")
    } else {
      cat("✗ Warning: Extension installation may have failed. Please check manually.\n")
    }
  }
  
  # Display extension information
  cat("\nExtension Details:\n")
  ext_info <- dbGetQuery(con, "
    SELECT extname, extversion, nspname as schema_name
    FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE extname = 'pgcrypto'
  ")
  
  if (nrow(ext_info) > 0) {
    print(ext_info)
  }
  
  cat("\n========================================\n")
  cat("Database setup complete!\n")
  cat("========================================\n")
  
}, error = function(e) {
  cat("\n✗ Error during setup:\n")
  cat("  ", e$message, "\n")
  cat("\nPlease ensure you have the necessary permissions to create extensions.\n")
  cat("You may need to run this as a database superuser.\n")
}, finally = {
  close_db_connection(con)
  cat("\nConnection closed.\n")
})


