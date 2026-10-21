# ============================================
# BARBAZZA BARBERSHOP MANAGEMENT SYSTEM
# Global Configuration
# ============================================

# Load required libraries
library(shiny)
library(shinyjs)
library(DT)
library(RPostgres)
library(DBI)
library(digest)

# Database Configuration (Single Source of Truth)
DB_CONFIG <- list(
  host = "ep-sparkling-pond-agk40clv-pooler.c-2.eu-central-1.aws.neon.tech",
  dbname = "neondb",
  user = "neondb_owner",
  password = "npg_RBWT5yV4LGsJ",
  port = 5432,
  sslmode = "require"
)

# Database connection functions
get_db_connection <- function() {
  tryCatch({
    con <- dbConnect(
      RPostgres::Postgres(),
      host = DB_CONFIG$host,
      dbname = DB_CONFIG$dbname,
      user = DB_CONFIG$user,
      password = DB_CONFIG$password,
      port = DB_CONFIG$port,
      sslmode = DB_CONFIG$sslmode
    )
    log_debug("Database connection established", "DB")
    return(con)
  }, error = function(e) {
    log_error(paste("Database connection failed:", e$message), "DB")
    stop(paste("Database connection failed:", e$message))
  })
}

close_db_connection <- function(con) {
  if (!is.null(con) && dbIsValid(con)) {
    dbDisconnect(con)
    log_debug("Database connection closed", "DB")
  }
}

# Execute query with error handling
execute_query <- function(query, params = NULL) {
  con <- get_db_connection()
  on.exit(close_db_connection(con))
  
  tryCatch({
    if (is.null(params)) {
      result <- dbGetQuery(con, query)
    } else {
      result <- dbGetQuery(con, query, params)
    }
    log_debug("Query executed successfully", "DB")
    return(result)
  }, error = function(e) {
    log_error(paste("Query execution failed:", e$message), "DB")
    stop(paste("Query execution failed:", e$message))
  })
}

# Execute write operation
execute_write <- function(query, params = NULL) {
  con <- get_db_connection()
  on.exit(close_db_connection(con))
  
  tryCatch({
    if (is.null(params)) {
      dbExecute(con, query)
    } else {
      dbExecute(con, query, params)
    }
    log_debug("Write operation executed successfully", "DB")
    return(TRUE)
  }, error = function(e) {
    log_error(paste("Write operation failed:", e$message), "DB")
    stop(paste("Write operation failed:", e$message))
  })
}

# Source utility files
source("utils/logger.R")
source("utils/helpers.R")
source("utils/auth.R")
source("utils/google_drive.R")
source("utils/report_generator.R")

# Source module files
source("modules/admin_module.R")
source("modules/manager_module.R")
source("modules/supervisor_module.R")
source("modules/barber_module.R")

