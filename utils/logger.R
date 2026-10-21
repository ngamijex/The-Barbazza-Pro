# Logging Utilities
# Provides consistent logging across the application

# Log levels
LOG_LEVELS <- list(
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3
)

# Current log level (set to INFO by default)
CURRENT_LOG_LEVEL <- LOG_LEVELS$INFO

# Log message with timestamp
log_message <- function(level, message, context = NULL) {
  if (LOG_LEVELS[[level]] < CURRENT_LOG_LEVEL) {
    return(invisible(NULL))
  }
  
  timestamp <- format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  level_str <- sprintf("[%-7s]", level)
  
  if (!is.null(context)) {
    context_str <- paste0(" [", context, "]")
  } else {
    context_str <- ""
  }
  
  log_entry <- paste0(timestamp, " ", level_str, context_str, " ", message)
  
  # Print to console
  cat(log_entry, "\n")
  
  # Optionally write to file (uncomment to enable)
  # write(log_entry, file = "logs/app.log", append = TRUE)
  
  invisible(NULL)
}

# Convenience functions
log_debug <- function(message, context = NULL) {
  log_message("DEBUG", message, context)
}

log_info <- function(message, context = NULL) {
  log_message("INFO", message, context)
}

log_warning <- function(message, context = NULL) {
  log_message("WARNING", message, context)
}

log_error <- function(message, context = NULL) {
  log_message("ERROR", message, context)
}

# Log database operations
log_db_operation <- function(operation, success, message = NULL) {
  if (success) {
    log_info(paste("Database operation successful:", operation), "DATABASE")
  } else {
    log_error(paste("Database operation failed:", operation, "-", message), "DATABASE")
  }
}

# Log authentication attempts
log_auth_attempt <- function(username, success, reason = NULL) {
  if (success) {
    log_info(paste("User logged in:", username), "AUTH")
  } else {
    log_warning(paste("Failed login attempt:", username, "-", reason), "AUTH")
  }
}

# Log user actions
log_user_action <- function(user_id, action, details = NULL) {
  message <- paste("User", user_id, "-", action)
  if (!is.null(details)) {
    message <- paste(message, "-", details)
  }
  log_info(message, "ACTION")
}


