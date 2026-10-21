# Google Drive Utility
# Functions for authenticating with Google Drive and uploading files

# Authenticate with Google Drive using service account
authenticate_google_drive <- function() {
  tryCatch({
    # Load required libraries
    if (!require("googledrive", quietly = TRUE)) {
      cat("Installing googledrive package...\n")
      install.packages("googledrive", repos = "https://cloud.r-project.org/")
      library(googledrive)
    } else {
      library(googledrive)
    }
    
    # Path to service account JSON file
    json_path <- "the-barbazza-38f63345b759.json"
    
    if (!file.exists(json_path)) {
      stop("Service account JSON file not found: ", json_path)
    }
    
    # Authenticate using service account
    googledrive::drive_auth(path = json_path)
    
    cat("✓ Authenticated with Google Drive\n")
    return(TRUE)
    
  }, error = function(e) {
    cat("Error authenticating with Google Drive:", e$message, "\n")
    return(FALSE)
  })
}

# Upload file to Google Drive
upload_to_drive <- function(file_path, folder_id = NULL, overwrite = TRUE) {
  tryCatch({
    if (!file.exists(file_path)) {
      stop("File not found: ", file_path)
    }
    
    # Authenticate first
    auth_success <- authenticate_google_drive()
    if (!auth_success) {
      stop("Authentication failed")
    }
    
    # Upload file
    if (!is.null(folder_id) && nchar(folder_id) > 0) {
      # Upload to specific folder
      uploaded_file <- googledrive::drive_upload(
        media = file_path,
        path = googledrive::as_id(folder_id),
        overwrite = overwrite
      )
    } else {
      # Upload to root
      uploaded_file <- googledrive::drive_upload(
        media = file_path,
        overwrite = overwrite
      )
    }
    
    cat("✓ File uploaded successfully\n")
    cat("  File ID:", uploaded_file$id, "\n")
    cat("  File name:", uploaded_file$name, "\n")
    
    return(list(
      success = TRUE,
      file_id = uploaded_file$id,
      file_name = uploaded_file$name,
      web_link = paste0("https://drive.google.com/file/d/", uploaded_file$id, "/view")
    ))
    
  }, error = function(e) {
    cat("Error uploading to Google Drive:", e$message, "\n")
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}

# List files in Google Drive folder
list_drive_folder <- function(folder_id = NULL) {
  tryCatch({
    # Authenticate first
    auth_success <- authenticate_google_drive()
    if (!auth_success) {
      stop("Authentication failed")
    }
    
    if (!is.null(folder_id) && nchar(folder_id) > 0) {
      # List files in specific folder
      files <- googledrive::drive_ls(googledrive::as_id(folder_id))
    } else {
      # List files in root
      files <- googledrive::drive_ls()
    }
    
    return(files)
    
  }, error = function(e) {
    cat("Error listing files:", e$message, "\n")
    return(NULL)
  })
}

# Create Google Sheet and upload to Drive
create_google_sheet_report <- function(report_data, report_date, folder_id = NULL) {
  tryCatch({
    # Load required libraries
    if (!require("googlesheets4", quietly = TRUE)) {
      cat("Installing googlesheets4 package...\n")
      install.packages("googlesheets4", repos = "https://cloud.r-project.org/")
      library(googlesheets4)
    } else {
      library(googlesheets4)
    }
    
    if (!require("googledrive", quietly = TRUE)) {
      cat("Installing googledrive package...\n")
      install.packages("googledrive", repos = "https://cloud.r-project.org/")
      library(googledrive)
    } else {
      library(googledrive)
    }
    
    # Path to service account JSON file
    json_path <- "the-barbazza-38f63345b759.json"
    
    if (!file.exists(json_path)) {
      stop("Service account JSON file not found: ", json_path)
    }
    
    # Authenticate both services
    googledrive::drive_auth(path = json_path)
    googlesheets4::gs4_auth(path = json_path)
    
    # Generate sheet name
    formatted_date <- format(as.Date(report_date), "%Y%m%d")
    sheet_name <- paste0("Barbazza_Daily_Report_", formatted_date)
    
    # Create new Google Sheet
    ss <- googlesheets4::gs4_create(
      name = sheet_name,
      sheets = list(
        "Summary" = report_data$summary_sheet,
        "Transactions" = report_data$transactions_sheet,
        "Expenses" = report_data$expenses_sheet,
        "Barber Performance" = report_data$barber_performance_sheet
      )
    )
    
    cat("✓ Google Sheet created:", ss$name, "\n")
    
    # Move to specified folder if folder_id provided
    if (!is.null(folder_id) && nchar(folder_id) > 0) {
      googledrive::drive_mv(
        file = googledrive::as_id(ss$spreadsheet_id),
        path = googledrive::as_id(folder_id)
      )
      cat("✓ Sheet moved to specified folder\n")
    }
    
    # Make sheet accessible (optional - depends on your sharing preferences)
    # googledrive::drive_share(googledrive::as_id(ss$spreadsheet_id), role = "reader", type = "anyone")
    
    return(list(
      success = TRUE,
      sheet_id = ss$spreadsheet_id,
      sheet_name = ss$name,
      web_link = ss$spreadsheet_url
    ))
    
  }, error = function(e) {
    cat("Error creating Google Sheet:", e$message, "\n")
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}

