# Package Installation Script
# Run this script to install all required packages

required_packages <- c(
  "shiny",
  "shinyjs",
  "DT",
  "RPostgres",
  "DBI",
  "digest",
  "openxlsx",
  "googledrive",
  "googlesheets4"
)

# Function to install packages if not already installed
install_if_missing <- function(packages) {
  new_packages <- packages[!(packages %in% installed.packages()[,"Package"])]
  
  if (length(new_packages) > 0) {
    cat("Installing missing packages:", paste(new_packages, collapse = ", "), "\n")
    install.packages(new_packages, dependencies = TRUE)
  } else {
    cat("All required packages are already installed.\n")
  }
}

# Install packages
cat("Checking and installing required packages...\n")
install_if_missing(required_packages)

# Verify installations
cat("\nVerifying package installations...\n")
for (pkg in required_packages) {
  if (requireNamespace(pkg, quietly = TRUE)) {
    cat("✓", pkg, "is installed\n")
  } else {
    cat("✗", pkg, "failed to install\n")
  }
}

cat("\nPackage installation complete!\n")

