# ============================================
# BARBAZZA - RUN APP SCRIPT
# ============================================
# Use this script to run the app with proper initialization
# This ensures global.R is loaded before running the app

cat("\n")
cat("========================================\n")
cat("  BARBAZZA BARBERSHOP MANAGEMENT\n")
cat("========================================\n")
cat("\n")

# Clear environment (optional, uncomment if needed)
# rm(list = ls())

# Load global configuration
cat("Loading global configuration... ")
source("global.R")
cat("✓ Done\n")

# Verify critical functions
cat("Verifying functions... ")
if (!exists("admin_server")) stop("admin_server not found!")
if (!exists("manager_server")) stop("manager_server not found!")
if (!exists("supervisor_server")) stop("supervisor_server not found!")
if (!exists("barber_server")) stop("barber_server not found!")
if (!exists("get_db_connection")) stop("get_db_connection not found!")
cat("✓ All functions loaded\n")

cat("\n")
cat("Starting Barbazza application...\n")
cat("\n")

# Run the app
shiny::runApp("app.R")


