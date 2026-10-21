# Daily Report Generation
# Functions for generating daily reports for The Barbazza

# Generate daily Excel report
generate_daily_report <- function(report_date = Sys.Date(), manager_name = NULL) {
  tryCatch({
    # Load required libraries
    if (!require("openxlsx", quietly = TRUE)) {
      cat("Installing openxlsx package...\n")
      install.packages("openxlsx", repos = "https://cloud.r-project.org/")
      library(openxlsx)
    } else {
      library(openxlsx)
    }
    
    # Database connection
    con <- get_db_connection()
    on.exit(close_db_connection(con), add = TRUE)
    
    # Format date
    formatted_date <- format(as.Date(report_date), "%Y-%m-%d")
    report_title_date <- format(as.Date(report_date), "%B %d, %Y")
    
    # ==================== 1. FETCH DATA ====================
    
    # Get barber transactions
    barber_transactions <- dbGetQuery(con, "
      SELECT 
        b.barber_code,
        u.full_name as barber_name,
        s.service_name,
        t.amount,
        t.notes as service_notes,
        TO_CHAR(t.created_at, 'HH24:MI') as time,
        t.customer_name
      FROM transactions t
      JOIN barbers b ON t.barber_id = b.barber_id
      JOIN users u ON b.user_id = u.user_id
      LEFT JOIN services s ON t.service_id = s.service_id
      WHERE DATE(t.transaction_date) = $1
      ORDER BY b.barber_code, t.created_at
    ", params = list(formatted_date))
    
    # Get barber summaries
    barber_summary <- dbGetQuery(con, "
      SELECT 
        b.barber_code,
        u.full_name as barber_name,
        b.commission_rate,
        COUNT(*) as total_customers,
        SUM(t.amount) as gross_income,
        ROUND(SUM(t.amount) * b.commission_rate / 100, 2) as barber_commission,
        ROUND(SUM(t.amount) * (100 - b.commission_rate) / 100, 2) as shop_share
      FROM transactions t
      JOIN barbers b ON t.barber_id = b.barber_id
      JOIN users u ON b.user_id = u.user_id
      WHERE DATE(t.transaction_date) = $1
      GROUP BY b.barber_code, u.full_name, b.commission_rate
      ORDER BY b.barber_code
    ", params = list(formatted_date))
    
    # Get expenses
    expenses <- dbGetQuery(con, "
      SELECT 
        ec.category_name,
        e.description,
        e.amount,
        TO_CHAR(e.created_at, 'HH24:MI') as time,
        u.full_name as recorded_by
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.category_id
      JOIN users u ON e.created_by = u.user_id
      WHERE DATE(e.expense_date) = $1
      ORDER BY e.created_at
    ", params = list(formatted_date))
    
    # Get daily summary
    daily_summary <- dbGetQuery(con, "
      SELECT 
        COALESCE(SUM(t.amount), 0) as total_income,
        COALESCE(COUNT(*), 0) as total_customers,
        COALESCE((SELECT SUM(amount) FROM expenses WHERE DATE(expense_date) = $1), 0) as total_expenses
      FROM transactions t
      WHERE DATE(t.transaction_date) = $1
    ", params = list(formatted_date))
    
    # Calculate net profit
    net_profit <- as.numeric(daily_summary$total_income[1]) - as.numeric(daily_summary$total_expenses[1])
    
    # ==================== 2. CREATE EXCEL WORKBOOK ====================
    
    wb <- createWorkbook()
    
    # Define styles
    title_style <- createStyle(fontSize = 16, textDecoration = "bold", halign = "center")
    header_style <- createStyle(fontSize = 12, textDecoration = "bold", fgFill = "#000000", 
                                fontColour = "#FFFFFF", border = "TopBottomLeftRight")
    summary_style <- createStyle(fontSize = 11, textDecoration = "bold", fgFill = "#F0F0F0",
                                 border = "TopBottomLeftRight")
    currency_style <- createStyle(numFmt = "COMMA")
    total_style <- createStyle(fontSize = 11, textDecoration = "bold", 
                              border = "TopBottom", numFmt = "COMMA")
    
    # ==================== SHEET 1: SUMMARY ====================
    
    addWorksheet(wb, "Daily Summary")
    
    # Title
    writeData(wb, "Daily Summary", "THE BARBAZZA - DAILY REPORT", startRow = 1, startCol = 1)
    mergeCells(wb, "Daily Summary", cols = 1:4, rows = 1)
    addStyle(wb, "Daily Summary", title_style, rows = 1, cols = 1:4)
    
    # Date
    writeData(wb, "Daily Summary", report_title_date, startRow = 2, startCol = 1)
    mergeCells(wb, "Daily Summary", cols = 1:4, rows = 2)
    addStyle(wb, "Daily Summary", createStyle(fontSize = 12, halign = "center"), rows = 2, cols = 1:4)
    
    # Summary section
    current_row <- 4
    
    writeData(wb, "Daily Summary", "DAILY SUMMARY", startRow = current_row, startCol = 1)
    addStyle(wb, "Daily Summary", createStyle(fontSize = 12, textDecoration = "bold"), 
             rows = current_row, cols = 1)
    
    current_row <- current_row + 1
    summary_data <- data.frame(
      Metric = c("Total Income", "Total Customers", "Total Expenses", "Net Profit"),
      Value = c(
        as.numeric(daily_summary$total_income[1]),
        as.integer(daily_summary$total_customers[1]),
        as.numeric(daily_summary$total_expenses[1]),
        net_profit
      ),
      stringsAsFactors = FALSE
    )
    
    writeData(wb, "Daily Summary", summary_data, startRow = current_row, startCol = 1)
    addStyle(wb, "Daily Summary", header_style, rows = current_row, cols = 1:2)
    addStyle(wb, "Daily Summary", currency_style, rows = (current_row + 1):(current_row + nrow(summary_data)), 
             cols = 2, gridExpand = TRUE)
    
    # Barber Performance section
    current_row <- current_row + nrow(summary_data) + 2
    
    writeData(wb, "Daily Summary", "BARBER PERFORMANCE", startRow = current_row, startCol = 1)
    addStyle(wb, "Daily Summary", createStyle(fontSize = 12, textDecoration = "bold"), 
             rows = current_row, cols = 1)
    
    current_row <- current_row + 1
    
    if (nrow(barber_summary) > 0) {
      # Convert numeric types
      barber_summary$total_customers <- as.integer(barber_summary$total_customers)
      barber_summary$gross_income <- as.numeric(barber_summary$gross_income)
      barber_summary$barber_commission <- as.numeric(barber_summary$barber_commission)
      barber_summary$shop_share <- as.numeric(barber_summary$shop_share)
      
      writeData(wb, "Daily Summary", barber_summary, startRow = current_row, startCol = 1)
      addStyle(wb, "Daily Summary", header_style, rows = current_row, cols = 1:ncol(barber_summary))
      addStyle(wb, "Daily Summary", currency_style, 
               rows = (current_row + 1):(current_row + nrow(barber_summary)), 
               cols = 4:7, gridExpand = TRUE)
    } else {
      writeData(wb, "Daily Summary", "No transactions recorded", startRow = current_row, startCol = 1)
    }
    
    # Set column widths
    setColWidths(wb, "Daily Summary", cols = 1:7, widths = c(15, 20, 15, 15, 18, 18, 15))
    
    # ==================== SHEET 2: TRANSACTIONS ====================
    
    addWorksheet(wb, "Transactions")
    
    # Title
    writeData(wb, "Transactions", paste("TRANSACTIONS -", report_title_date), startRow = 1, startCol = 1)
    mergeCells(wb, "Transactions", cols = 1:7, rows = 1)
    addStyle(wb, "Transactions", title_style, rows = 1, cols = 1:7)
    
    current_row <- 3
    
    if (nrow(barber_transactions) > 0) {
      # Convert amount to numeric
      barber_transactions$amount <- as.numeric(barber_transactions$amount)
      
      writeData(wb, "Transactions", barber_transactions, startRow = current_row, startCol = 1)
      addStyle(wb, "Transactions", header_style, rows = current_row, cols = 1:ncol(barber_transactions))
      addStyle(wb, "Transactions", currency_style, 
               rows = (current_row + 1):(current_row + nrow(barber_transactions)), 
               cols = 4, gridExpand = TRUE)
      
      # Add total row
      total_row <- current_row + nrow(barber_transactions) + 1
      writeData(wb, "Transactions", "TOTAL", startRow = total_row, startCol = 3)
      writeFormula(wb, "Transactions", 
                   startRow = total_row, startCol = 4,
                   x = paste0("SUM(D", current_row + 1, ":D", current_row + nrow(barber_transactions), ")"))
      addStyle(wb, "Transactions", total_style, rows = total_row, cols = 3:4)
    } else {
      writeData(wb, "Transactions", "No transactions recorded", startRow = current_row, startCol = 1)
    }
    
    # Set column widths
    setColWidths(wb, "Transactions", cols = 1:7, widths = c(12, 20, 18, 12, 25, 10, 18))
    
    # ==================== SHEET 3: EXPENSES ====================
    
    addWorksheet(wb, "Expenses")
    
    # Title
    writeData(wb, "Expenses", paste("EXPENSES -", report_title_date), startRow = 1, startCol = 1)
    mergeCells(wb, "Expenses", cols = 1:5, rows = 1)
    addStyle(wb, "Expenses", title_style, rows = 1, cols = 1:5)
    
    current_row <- 3
    
    if (nrow(expenses) > 0) {
      # Convert amount to numeric
      expenses$amount <- as.numeric(expenses$amount)
      
      writeData(wb, "Expenses", expenses, startRow = current_row, startCol = 1)
      addStyle(wb, "Expenses", header_style, rows = current_row, cols = 1:ncol(expenses))
      addStyle(wb, "Expenses", currency_style, 
               rows = (current_row + 1):(current_row + nrow(expenses)), 
               cols = 3, gridExpand = TRUE)
      
      # Add total row
      total_row <- current_row + nrow(expenses) + 1
      writeData(wb, "Expenses", "TOTAL", startRow = total_row, startCol = 2)
      writeFormula(wb, "Expenses", 
                   startRow = total_row, startCol = 3,
                   x = paste0("SUM(C", current_row + 1, ":C", current_row + nrow(expenses), ")"))
      addStyle(wb, "Expenses", total_style, rows = total_row, cols = 2:3)
    } else {
      writeData(wb, "Expenses", "No expenses recorded", startRow = current_row, startCol = 1)
    }
    
    # Set column widths
    setColWidths(wb, "Expenses", cols = 1:5, widths = c(20, 30, 15, 10, 20))
    
    # ==================== 3. SAVE WORKBOOK ====================
    
    # Create reports directory if it doesn't exist
    if (!dir.exists("reports")) {
      dir.create("reports")
    }
    
    # Generate filename
    filename <- paste0("reports/Barbazza_Daily_Report_", format(as.Date(report_date), "%Y%m%d"), ".xlsx")
    
    # Save workbook
    saveWorkbook(wb, filename, overwrite = TRUE)
    
    cat("✓ Report generated successfully:", filename, "\n")
    
    return(list(
      success = TRUE,
      filename = filename,
      date = formatted_date,
      summary = list(
        total_income = as.numeric(daily_summary$total_income[1]),
        total_customers = as.integer(daily_summary$total_customers[1]),
        total_expenses = as.numeric(daily_summary$total_expenses[1]),
        net_profit = net_profit
      )
    ))
    
  }, error = function(e) {
    cat("Error generating report:", e$message, "\n")
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}

# Prepare data for Google Sheets
prepare_google_sheet_data <- function(report_date = Sys.Date()) {
  tryCatch({
    # Database connection
    con <- get_db_connection()
    on.exit(close_db_connection(con), add = TRUE)
    
    # Format date
    formatted_date <- format(as.Date(report_date), "%Y-%m-%d")
    report_title_date <- format(as.Date(report_date), "%B %d, %Y")
    
    # Get barber transactions
    barber_transactions <- dbGetQuery(con, "
      SELECT 
        b.barber_code as \"Barber Code\",
        u.full_name as \"Barber Name\",
        t.customer_name as \"Customer\",
        s.service_name as \"Service\",
        t.amount as \"Amount\",
        TO_CHAR(t.created_at, 'HH24:MI') as \"Time\",
        t.notes as \"Notes\"
      FROM transactions t
      JOIN barbers b ON t.barber_id = b.barber_id
      JOIN users u ON b.user_id = u.user_id
      LEFT JOIN services s ON t.service_id = s.service_id
      WHERE DATE(t.transaction_date) = $1
      ORDER BY b.barber_code, t.created_at
    ", params = list(formatted_date))
    
    # Get barber performance
    barber_performance <- dbGetQuery(con, "
      SELECT 
        b.barber_code as \"Barber Code\",
        u.full_name as \"Barber Name\",
        b.commission_rate as \"Commission %\",
        COUNT(*) as \"Total Customers\",
        SUM(t.amount) as \"Gross Income\",
        ROUND(SUM(t.amount) * b.commission_rate / 100, 2) as \"Barber Commission\",
        ROUND(SUM(t.amount) * (100 - b.commission_rate) / 100, 2) as \"Shop Share\"
      FROM transactions t
      JOIN barbers b ON t.barber_id = b.barber_id
      JOIN users u ON b.user_id = u.user_id
      WHERE DATE(t.transaction_date) = $1
      GROUP BY b.barber_code, u.full_name, b.commission_rate
      ORDER BY b.barber_code
    ", params = list(formatted_date))
    
    # Get expenses
    expenses <- dbGetQuery(con, "
      SELECT 
        ec.category_name as \"Category\",
        e.description as \"Description\",
        e.amount as \"Amount\",
        TO_CHAR(e.created_at, 'HH24:MI') as \"Time\",
        u.full_name as \"Recorded By\"
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.category_id
      JOIN users u ON e.created_by = u.user_id
      WHERE DATE(e.expense_date) = $1
      ORDER BY e.created_at
    ", params = list(formatted_date))
    
    # Get daily summary
    daily_summary <- dbGetQuery(con, "
      SELECT 
        COALESCE(SUM(t.amount), 0) as total_income,
        COALESCE(COUNT(*), 0) as total_customers,
        COALESCE((SELECT SUM(amount) FROM expenses WHERE DATE(expense_date) = $1), 0) as total_expenses
      FROM transactions t
      WHERE DATE(t.transaction_date) = $1
    ", params = list(formatted_date))
    
    # Calculate net profit
    net_profit <- as.numeric(daily_summary$total_income[1]) - as.numeric(daily_summary$total_expenses[1])
    
    # Create summary sheet
    summary_sheet <- data.frame(
      " " = c(
        "THE BARBAZZA - DAILY REPORT",
        report_title_date,
        "",
        "FINANCIAL SUMMARY",
        "Total Income",
        "Total Customers",
        "Total Expenses",
        "Net Profit",
        "",
        paste0("Generated: ", format(Sys.time(), "%Y-%m-%d %H:%M:%S"))
      ),
      Value = c(
        "",
        "",
        "",
        "",
        sprintf("%.2f", as.numeric(daily_summary$total_income[1])),
        as.character(as.integer(daily_summary$total_customers[1])),
        sprintf("%.2f", as.numeric(daily_summary$total_expenses[1])),
        sprintf("%.2f", net_profit),
        "",
        ""
      ),
      stringsAsFactors = FALSE,
      check.names = FALSE
    )
    
    return(list(
      success = TRUE,
      summary_sheet = summary_sheet,
      transactions_sheet = if(nrow(barber_transactions) > 0) barber_transactions else data.frame("No transactions recorded" = character(0)),
      expenses_sheet = if(nrow(expenses) > 0) expenses else data.frame("No expenses recorded" = character(0)),
      barber_performance_sheet = if(nrow(barber_performance) > 0) barber_performance else data.frame("No data available" = character(0)),
      summary = list(
        total_income = as.numeric(daily_summary$total_income[1]),
        total_customers = as.integer(daily_summary$total_customers[1]),
        total_expenses = as.numeric(daily_summary$total_expenses[1]),
        net_profit = net_profit
      )
    ))
    
  }, error = function(e) {
    cat("Error preparing Google Sheet data:", e$message, "\n")
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}

# Generate and upload daily report to Google Drive (Excel format)
generate_and_upload_excel_report <- function(report_date = Sys.Date(), folder_id = NULL) {
  # Generate Excel report
  report_result <- generate_daily_report(report_date)
  
  if (!report_result$success) {
    return(report_result)
  }
  
  # Upload to Google Drive
  upload_result <- upload_to_drive(report_result$filename, folder_id = folder_id, overwrite = TRUE)
  
  if (upload_result$success) {
    return(list(
      success = TRUE,
      format = "Excel",
      filename = report_result$filename,
      file_id = upload_result$file_id,
      web_link = upload_result$web_link,
      summary = report_result$summary
    ))
  } else {
    return(list(
      success = FALSE,
      error = upload_result$error,
      report_generated = TRUE,
      filename = report_result$filename
    ))
  }
}

# Generate and upload daily report to Google Drive (Google Sheets format)
generate_and_upload_google_sheet <- function(report_date = Sys.Date(), folder_id = NULL) {
  # Prepare data
  report_data <- prepare_google_sheet_data(report_date)
  
  if (!report_data$success) {
    return(report_data)
  }
  
  # Create and upload Google Sheet
  sheet_result <- create_google_sheet_report(report_data, report_date, folder_id)
  
  if (sheet_result$success) {
    return(list(
      success = TRUE,
      format = "Google Sheets",
      sheet_id = sheet_result$sheet_id,
      sheet_name = sheet_result$sheet_name,
      web_link = sheet_result$web_link,
      summary = report_data$summary
    ))
  } else {
    return(sheet_result)
  }
}

# Main function to generate and upload report (both formats)
generate_and_upload_report <- function(report_date = Sys.Date(), folder_id = NULL, format = "both") {
  results <- list()
  
  if (format %in% c("excel", "both")) {
    cat("Generating Excel report...\n")
    excel_result <- generate_and_upload_excel_report(report_date, folder_id)
    results$excel <- excel_result
  }
  
  if (format %in% c("sheets", "both")) {
    cat("Generating Google Sheets report...\n")
    sheets_result <- generate_and_upload_google_sheet(report_date, folder_id)
    results$sheets <- sheets_result
  }
  
  # Check if at least one succeeded
  success <- FALSE
  if (!is.null(results$excel) && results$excel$success) success <- TRUE
  if (!is.null(results$sheets) && results$sheets$success) success <- TRUE
  
  results$overall_success <- success
  return(results)
}

