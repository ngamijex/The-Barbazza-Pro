# Test Google Drive Integration
# Run this script to test Google Drive authentication and report generation

cat("=== GOOGLE DRIVE INTEGRATION TEST ===\n\n")

# Load required packages
cat("1. Loading required packages...\n")
required_packages <- c("googledrive", "googlesheets4", "openxlsx")

for (pkg in required_packages) {
  if (!require(pkg, quietly = TRUE, character.only = TRUE)) {
    cat("   Installing", pkg, "...\n")
    install.packages(pkg, repos = "https://cloud.r-project.org/")
    library(pkg, character.only = TRUE)
  }
}
cat("✓ All packages loaded\n\n")

# Load global configuration
cat("2. Loading global configuration...\n")
source("global.R")
cat("✓ Configuration loaded\n\n")

# Test 1: Check JSON file exists
cat("3. Checking service account JSON file...\n")
json_file <- "the-barbazza-38f63345b759.json"
if (file.exists(json_file)) {
  cat("✓ JSON file found:", json_file, "\n")
} else {
  cat("✗ JSON file NOT found:", json_file, "\n")
  stop("Please ensure the JSON file is in the project root directory")
}
cat("\n")

# Test 2: Authenticate with Google Drive
cat("4. Testing Google Drive authentication...\n")
auth_result <- tryCatch({
  authenticate_google_drive()
  TRUE
}, error = function(e) {
  cat("✗ Authentication failed:", e$message, "\n")
  FALSE
})

if (!auth_result) {
  stop("Google Drive authentication failed. Please check your credentials.")
}
cat("\n")

# Test 3: List files in target folder
cat("5. Testing access to Google Drive folder...\n")
folder_id <- "1VFRjOtnY-wm-UCAjV34yS9MpNRfAxC3I"
cat("   Folder ID:", folder_id, "\n")

files <- tryCatch({
  list_drive_folder(folder_id)
}, error = function(e) {
  cat("✗ Error accessing folder:", e$message, "\n")
  NULL
})

if (!is.null(files)) {
  cat("✓ Successfully accessed folder\n")
  if (nrow(files) > 0) {
    cat("   Found", nrow(files), "file(s) in folder:\n")
    for (i in 1:min(5, nrow(files))) {
      cat("   -", files$name[i], "\n")
    }
    if (nrow(files) > 5) {
      cat("   ... and", nrow(files) - 5, "more\n")
    }
  } else {
    cat("   Folder is empty\n")
  }
} else {
  cat("✗ Could not access folder\n")
}
cat("\n")

# Test 4: Generate a test report
cat("6. Testing report generation...\n")
cat("   Generating report for today:", format(Sys.Date(), "%Y-%m-%d"), "\n")

report_result <- tryCatch({
  generate_daily_report(report_date = Sys.Date())
}, error = function(e) {
  cat("✗ Error generating report:", e$message, "\n")
  list(success = FALSE, error = e$message)
})

if (report_result$success) {
  cat("✓ Excel report generated successfully\n")
  cat("   File:", report_result$filename, "\n")
  cat("   Total Income:", sprintf("%.2f RWF", report_result$summary$total_income), "\n")
  cat("   Total Customers:", report_result$summary$total_customers, "\n")
  cat("   Total Expenses:", sprintf("%.2f RWF", report_result$summary$total_expenses), "\n")
  cat("   Net Profit:", sprintf("%.2f RWF", report_result$summary$net_profit), "\n")
} else {
  cat("✗ Report generation failed\n")
}
cat("\n")

# Test 5: Upload test report to Google Drive
if (report_result$success) {
  cat("7. Testing report upload to Google Drive...\n")
  
  upload_result <- tryCatch({
    upload_to_drive(report_result$filename, folder_id = folder_id, overwrite = TRUE)
  }, error = function(e) {
    cat("✗ Error uploading report:", e$message, "\n")
    list(success = FALSE, error = e$message)
  })
  
  if (upload_result$success) {
    cat("✓ Report uploaded successfully!\n")
    cat("   File ID:", upload_result$file_id, "\n")
    cat("   View online:", upload_result$web_link, "\n")
  } else {
    cat("✗ Upload failed\n")
  }
  cat("\n")
} else {
  cat("7. Skipping upload test (report generation failed)\n\n")
}

# Test 6: Test Google Sheets creation
cat("8. Testing Google Sheets report generation...\n")

sheets_data <- tryCatch({
  prepare_google_sheet_data(report_date = Sys.Date())
}, error = function(e) {
  cat("✗ Error preparing Google Sheets data:", e$message, "\n")
  list(success = FALSE, error = e$message)
})

if (sheets_data$success) {
  cat("✓ Google Sheets data prepared successfully\n")
  cat("   Summary sheet:", nrow(sheets_data$summary_sheet), "rows\n")
  cat("   Transactions:", nrow(sheets_data$transactions_sheet), "rows\n")
  cat("   Expenses:", nrow(sheets_data$expenses_sheet), "rows\n")
  
  # Try to create the sheet
  cat("   Creating Google Sheet...\n")
  sheet_result <- tryCatch({
    create_google_sheet_report(sheets_data, Sys.Date(), folder_id)
  }, error = function(e) {
    cat("✗ Error creating Google Sheet:", e$message, "\n")
    list(success = FALSE, error = e$message)
  })
  
  if (sheet_result$success) {
    cat("✓ Google Sheet created successfully!\n")
    cat("   Sheet ID:", sheet_result$sheet_id, "\n")
    cat("   View online:", sheet_result$web_link, "\n")
  } else {
    cat("✗ Google Sheet creation failed\n")
  }
} else {
  cat("✗ Failed to prepare Google Sheets data\n")
}
cat("\n")

# Summary
cat("=== TEST SUMMARY ===\n")
cat("Google Drive Integration:", if(auth_result) "✓ WORKING" else "✗ FAILED", "\n")
cat("Excel Report Generation:", if(report_result$success) "✓ WORKING" else "✗ FAILED", "\n")
if (report_result$success) {
  cat("Report Upload:", if(exists("upload_result") && upload_result$success) "✓ WORKING" else "✗ FAILED", "\n")
}
cat("Google Sheets Generation:", if(sheets_data$success && exists("sheet_result") && sheet_result$success) "✓ WORKING" else "✗ FAILED", "\n")
cat("\n")

if (auth_result && report_result$success) {
  cat("✓✓✓ ALL TESTS PASSED! ✓✓✓\n")
  cat("\nYou can now use the Daily Report feature in the Manager portal!\n")
  cat("\nTo generate reports:\n")
  cat("1. Login as Manager\n")
  cat("2. Go to 'Daily Report' tab\n")
  cat("3. Select date and format\n")
  cat("4. Click 'Generate & Upload Report'\n")
  cat("5. Report will be automatically uploaded to Google Drive\n")
  cat("\nGoogle Drive Folder: https://drive.google.com/drive/folders/", folder_id, "\n", sep = "")
} else {
  cat("⚠️ SOME TESTS FAILED ⚠️\n")
  cat("Please review the errors above and fix them before using the feature.\n")
}

cat("\n")


