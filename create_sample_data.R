# Sample Data Creation Script
# This script creates sample data for testing the system
# Run this after setting up the database

library(RPostgres)
library(DBI)

source("utils/db_connection.R")

con <- get_db_connection()

cat("Creating sample data...\n\n")

# Create a test manager user (if not exists)
cat("1. Creating test manager user...\n")
manager_exists <- dbGetQuery(con, "SELECT COUNT(*) as count FROM users WHERE username = 'manager'")$count

if (manager_exists == 0) {
  # Note: In production, use proper bcrypt hashing
  # For now, you'll need to set password manually or use a password reset function
  dbExecute(con, "
    INSERT INTO users (username, password_hash, full_name, role, email, is_active)
    VALUES ('manager', '$2a$12$GhUxa.kcryvAENHc1ADLl.uVxGyLMz/NPa49d.Y.xutD8iPZm9Tae', 
            'Test Manager', 'manager', 'manager@barbazza.com', TRUE)
  ")
  cat("   Manager user created (password: same as admin)\n")
} else {
  cat("   Manager user already exists\n")
}

# Create a test barber user (if not exists)
cat("2. Creating test barber user...\n")
barber_user_exists <- dbGetQuery(con, "SELECT COUNT(*) as count FROM users WHERE username = 'barber1'")$count

if (barber_user_exists == 0) {
  dbExecute(con, "
    INSERT INTO users (username, password_hash, full_name, role, email, is_active)
    VALUES ('barber1', '$2a$12$GhUxa.kcryvAENHc1ADLl.uVxGyLMz/NPa49d.Y.xutD8iPZm9Tae', 
            'John Barber', 'barber', 'barber1@barbazza.com', TRUE)
  ")
  
  # Get the user_id
  barber_user_id <- dbGetQuery(con, "SELECT user_id FROM users WHERE username = 'barber1'")$user_id
  
  # Create barber profile
  barber_exists <- dbGetQuery(con, paste0("SELECT COUNT(*) as count FROM barbers WHERE user_id = ", barber_user_id))$count
  
  if (barber_exists == 0) {
    dbExecute(con, paste0("
      INSERT INTO barbers (user_id, barber_code, commission_rate, is_active)
      VALUES (", barber_user_id, ", 'BAR001', 0.50, TRUE)
    "))
    cat("   Barber user and profile created (password: same as admin)\n")
  }
} else {
  cat("   Barber user already exists\n")
}

# Verify services exist
cat("3. Checking services...\n")
services_count <- dbGetQuery(con, "SELECT COUNT(*) as count FROM services")$count
cat("   Services in database:", services_count, "\n")

# Verify expense categories exist
cat("4. Checking expense categories...\n")
categories_count <- dbGetQuery(con, "SELECT COUNT(*) as count FROM expense_categories")$count
cat("   Expense categories in database:", categories_count, "\n")

cat("\nSample data setup complete!\n")
cat("\nTest Users:\n")
cat("  - Admin: username='admin', password=(check database)\n")
cat("  - Manager: username='manager', password=(same as admin)\n")
cat("  - Barber: username='barber1', password=(same as admin)\n")
cat("\nNote: You may need to reset passwords using proper bcrypt hashing.\n")

dbDisconnect(con)


