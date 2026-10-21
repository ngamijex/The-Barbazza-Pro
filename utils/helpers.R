# Helper Functions
# Utility functions used across the application

# Format currency (vectorized)
format_currency <- function(amount, currency = "RWF") {
  # Handle NULL
  if (is.null(amount)) {
    return(paste0(currency, " 0"))
  }
  
  # Handle vectors
  if (length(amount) > 1) {
    result <- character(length(amount))
    for (i in seq_along(amount)) {
      if (is.na(amount[i])) {
        result[i] <- paste0(currency, " 0")
      } else {
        formatted <- format(round(amount[i], 2), big.mark = ",", scientific = FALSE)
        result[i] <- paste0(currency, " ", formatted)
      }
    }
    return(result)
  }
  
  # Handle single value
  if (is.na(amount)) {
    return(paste0(currency, " 0"))
  }
  
  formatted <- format(round(amount, 2), big.mark = ",", scientific = FALSE)
  return(paste0(currency, " ", formatted))
}

# Format date
format_date <- function(date) {
  if (is.null(date)) {
    return("")
  }
  
  # Handle vectors
  if (length(date) > 1) {
    result <- character(length(date))
    for (i in seq_along(date)) {
      if (is.na(date[i])) {
        result[i] <- ""
      } else {
        result[i] <- format(as.Date(date[i]), "%B %d, %Y")
      }
    }
    return(result)
  }
  
  # Handle single value
  if (is.na(date)) {
    return("")
  }
  return(format(as.Date(date), "%B %d, %Y"))
}

# Format datetime
format_datetime <- function(datetime) {
  if (is.null(datetime)) {
    return("")
  }
  
  # Handle vectors
  if (length(datetime) > 1) {
    result <- character(length(datetime))
    for (i in seq_along(datetime)) {
      if (is.na(datetime[i])) {
        result[i] <- ""
      } else {
        result[i] <- format(datetime[i], "%B %d, %Y %I:%M %p")
      }
    }
    return(result)
  }
  
  # Handle single value
  if (is.na(datetime)) {
    return("")
  }
  return(format(datetime, "%B %d, %Y %I:%M %p"))
}

# Get today's date
get_today <- function() {
  return(Sys.Date())
}

# Get current date time
get_now <- function() {
  return(Sys.time())
}

# Validate amount
validate_amount <- function(amount) {
  if (is.null(amount)) {
    return(FALSE)
  }
  if (is.na(amount)) {
    return(FALSE)
  }
  amount_num <- as.numeric(amount)
  if (is.na(amount_num)) {
    return(FALSE)
  }
  if (amount_num <= 0) {
    return(FALSE)
  }
  return(TRUE)
}

# Sanitize input
sanitize_input <- function(input) {
  if (is.null(input)) {
    return("")
  }
  # Remove HTML tags and trim whitespace
  cleaned <- gsub("<[^>]+>", "", as.character(input))
  cleaned <- trimws(cleaned)
  return(cleaned)
}

# Show notification (for use with shinyjs)
show_notification <- function(message, type = "info") {
  # This will be handled by JavaScript
  return(list(message = message, type = type))
}

# Get barber name by ID
get_barber_name <- function(barber_id) {
  con <- get_db_connection()
  on.exit(close_db_connection(con))
  
  tryCatch({
    query <- "SELECT b.barber_code, u.full_name 
              FROM barbers b
              LEFT JOIN users u ON b.user_id = u.user_id
              WHERE b.barber_id = $1"
    
    result <- dbGetQuery(con, query, params = list(barber_id))
    
    if (nrow(result) == 0) {
      return("Unknown")
    }
    
    if (!is.na(result$full_name) && result$full_name != "") {
      return(paste0(result$full_name, " (", result$barber_code, ")"))
    }
    
    return(result$barber_code)
  }, error = function(e) {
    return("Unknown")
  })
}

# Get service name by ID
get_service_name <- function(service_id) {
  con <- get_db_connection()
  on.exit(close_db_connection(con))
  
  tryCatch({
    query <- "SELECT service_name FROM services WHERE service_id = $1"
    result <- dbGetQuery(con, query, params = list(service_id))
    
    if (nrow(result) == 0) {
      return("Unknown Service")
    }
    
    return(result$service_name)
  }, error = function(e) {
    return("Unknown Service")
  })
}

