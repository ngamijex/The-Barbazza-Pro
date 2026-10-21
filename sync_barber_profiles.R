# =============================================================================
# SYNC BARBER PROFILES
# =============================================================================
# This script creates barber profiles for all users with role = 'barber'
# Run this ONCE to fix existing data
# =============================================================================

library(DBI)
library(RPostgres)

# Source global config
source("global.R")

cat("\n========================================\n")
cat("SYNCING BARBER PROFILES\n")
cat("========================================\n\n")

# Connect to database
con <- get_db_connection()

tryCatch({
  # Find all users with role 'barber'
  barber_users <- dbGetQuery(con, "
    SELECT user_id, username, full_name, email, phone, is_active
    FROM users
    WHERE role = 'barber'
  ")
  
  cat("Found", nrow(barber_users), "users with role 'barber'\n\n")
  
  if (nrow(barber_users) == 0) {
    cat("No barber users found. Nothing to sync.\n")
  } else {
    # Check which ones already have barber profiles
    existing_barbers <- dbGetQuery(con, "
      SELECT user_id FROM barbers
    ")
    
    synced_count <- 0
    skipped_count <- 0
    
    for (i in 1:nrow(barber_users)) {
      user <- barber_users[i, ]
      
      # Check if barber profile already exists
      if (user$user_id %in% existing_barbers$user_id) {
        cat("  [SKIP] User:", user$username, "- Already has barber profile\n")
        skipped_count <- skipped_count + 1
      } else {
        # Generate unique barber code
        barber_code <- paste0("B", sprintf("%03d", i))
        
        # Create barber profile
        dbExecute(con, "
          INSERT INTO barbers (user_id, barber_code, commission_rate, is_active, hire_date)
          VALUES ($1, $2, $3, $4, CURRENT_DATE)
        ", params = list(
          user$user_id,
          barber_code,
          40,  # Default commission rate
          user$is_active
        ))
        
        cat("  [CREATED] User:", user$username, "→ Barber profile created (", barber_code, ")\n")
        synced_count <- synced_count + 1
      }
    }
    
    cat("\n========================================\n")
    cat("SYNC COMPLETE!\n")
    cat("========================================\n")
    cat("Total barber users:", nrow(barber_users), "\n")
    cat("Profiles created:", synced_count, "\n")
    cat("Already existed:", skipped_count, "\n")
    cat("\n✓ All barber users now have profiles!\n\n")
  }
  
}, error = function(e) {
  cat("\n✗ ERROR:", e$message, "\n\n")
}, finally = {
  close_db_connection(con)
})

cat("You can now refresh the Admin portal to see all barbers!\n\n")

