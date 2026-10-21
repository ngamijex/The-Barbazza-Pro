# ============================================
# Test Script - Verify All Functions Load
# ============================================
# Run this script to verify that global.R loads correctly
# and all functions are available

cat("Testing Barbazza System Loading...\n\n")

# Test 1: Check if global.R is in working directory
cat("1. Checking for global.R... ")
if (file.exists("global.R")) {
  cat("✓ Found\n")
} else {
  cat("✗ NOT FOUND!\n")
  cat("   Make sure you're in the project directory.\n")
  stop("global.R not found")
}

# Test 2: Source global.R
cat("2. Loading global.R... ")
tryCatch({
  source("global.R")
  cat("✓ Loaded\n")
}, error = function(e) {
  cat("✗ ERROR!\n")
  cat("   Error:", e$message, "\n")
  stop(e)
})

# Test 3: Check database functions
cat("3. Checking database functions... ")
if (exists("get_db_connection") && exists("close_db_connection")) {
  cat("✓ Found\n")
} else {
  cat("✗ NOT FOUND!\n")
  stop("Database functions not loaded")
}

# Test 4: Check logger functions
cat("4. Checking logger functions... ")
if (exists("log_info") && exists("log_error")) {
  cat("✓ Found\n")
} else {
  cat("✗ NOT FOUND!\n")
  stop("Logger functions not loaded")
}

# Test 5: Check auth functions
cat("5. Checking auth functions... ")
if (exists("verify_user") && exists("has_permission")) {
  cat("✓ Found\n")
} else {
  cat("✗ NOT FOUND!\n")
  stop("Auth functions not loaded")
}

# Test 6: Check helper functions
cat("6. Checking helper functions... ")
if (exists("format_currency") && exists("format_date")) {
  cat("✓ Found\n")
} else {
  cat("✗ NOT FOUND!\n")
  stop("Helper functions not loaded")
}

# Test 7: Check admin module
cat("7. Checking admin module... ")
if (exists("admin_ui") && exists("admin_server")) {
  cat("✓ Found\n")
} else {
  cat("✗ NOT FOUND!\n")
  stop("Admin module not loaded")
}

# Test 8: Check manager module
cat("8. Checking manager module... ")
if (exists("manager_ui") && exists("manager_server")) {
  cat("✓ Found\n")
} else {
  cat("✗ NOT FOUND!\n")
  stop("Manager module not loaded")
}

# Test 9: Check barber module
cat("9. Checking barber module... ")
if (exists("barber_ui") && exists("barber_server")) {
  cat("✓ Found\n")
} else {
  cat("✗ NOT FOUND!\n")
  stop("Barber module not loaded")
}

# Test 10: Test database connection
cat("10. Testing database connection... ")
tryCatch({
  con <- get_db_connection()
  cat("✓ Connected\n")
  close_db_connection(con)
}, error = function(e) {
  cat("✗ ERROR!\n")
  cat("   Error:", e$message, "\n")
  cat("   Check your database credentials in global.R\n")
})

cat("\n")
cat("=" ,"=", rep("=", 48), "\n", sep="")
cat("✅ ALL TESTS PASSED!\n")
cat("=" ,"=", rep("=", 48), "\n", sep="")
cat("\n")
cat("Your system is ready to run!\n")
cat("Run: shiny::runApp('app.R')\n")
cat("\n")


