# Authentication Utilities
# Handles user authentication and session management
# Note: Database connection functions are defined in global.R

# Verify user credentials
verify_user <- function(username, password) {
  con <- get_db_connection()
  on.exit(close_db_connection(con))
  
  tryCatch({
    query <- "SELECT user_id, username, password_hash, full_name, role, is_active 
              FROM users 
              WHERE username = $1 AND is_active = TRUE"
    
    user <- dbGetQuery(con, query, params = list(username))
    
    if (nrow(user) == 0) {
      log_auth_attempt(username, FALSE, "User not found or inactive")
      return(NULL)
    }
    
    # Verify password using PostgreSQL's crypt function (requires pgcrypto extension)
    # The password_hash in database is bcrypt hash
    tryCatch({
      # Use PostgreSQL's crypt function to verify bcrypt password
      verify_query <- "SELECT (crypt($1, $2) = $2) as verified"
      result <- dbGetQuery(con, verify_query, params = list(
        password,
        user$password_hash
      ))
      
      if (nrow(result) > 0 && result$verified) {
        # Update last login
        update_query <- "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1"
        dbExecute(con, update_query, params = list(user$user_id))
        
        log_auth_attempt(username, TRUE)
        
        return(list(
          user_id = user$user_id,
          username = user$username,
          full_name = user$full_name,
          role = user$role
        ))
      } else {
        log_auth_attempt(username, FALSE, "Invalid password")
      }
    }, error = function(e) {
      # If pgcrypto is not available, log error and return NULL
      # This ensures security - password verification must work
      log_error(paste("Password verification failed:", e$message), "AUTH")
      log_error("Ensure pgcrypto extension is installed in your database", "AUTH")
      log_auth_attempt(username, FALSE, "Password verification error")
      return(NULL)
    })
    
    return(NULL)
  }, error = function(e) {
    log_error(paste("Authentication error:", e$message), "AUTH")
    return(NULL)
  })
}

# Get user info by ID
get_user_info <- function(user_id) {
  con <- get_db_connection()
  on.exit(close_db_connection(con))
  
  tryCatch({
    query <- "SELECT user_id, username, full_name, role, email, phone, is_active 
              FROM users 
              WHERE user_id = $1"
    
    user <- dbGetQuery(con, query, params = list(user_id))
    
    if (nrow(user) == 0) {
      return(NULL)
    }
    
    return(user)
  }, error = function(e) {
    return(NULL)
  })
}

# Check if user has permission
has_permission <- function(user_role, required_role) {
  role_hierarchy <- list(
    admin = c("admin", "manager", "barber"),
    manager = c("manager", "barber"),
    barber = c("barber")
  )
  
  if (is.null(role_hierarchy[[user_role]])) {
    return(FALSE)
  }
  
  return(required_role %in% role_hierarchy[[user_role]])
}

