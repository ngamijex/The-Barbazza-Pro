# TROUBLESHOOTING: Month Dropdown Not Showing

## Issue
The "Select Month to Close" dropdown is empty.

## Debug Steps

### Step 1: Check Database Transactions
Run this in RStudio console:
```r
source('debug_months_dropdown.R')
```

This will tell you:
- ✓ If transactions exist
- ✓ Date range of transactions
- ✓ Which months should appear
- ✓ If the query works

### Step 2: Check Console Logs
1. Restart the Shiny app
2. Login as **Manager**
3. Go to **Monthly Closing** tab
4. Look at the RStudio console

**You should see:**
```
=== LOADING MONTHS FOR DROPDOWN ===
Executing query...
Query successful! Rows returned: X
Months found:
  month_key   month_label
  2025-01     January 2025
Updating dropdown with X choices
Dropdown updated successfully!
=== DROPDOWN LOADING COMPLETE ===
```

### Step 3: Common Issues & Solutions

#### Issue 1: No Transactions in Database
**Symptoms:**
- Debug script shows: "NO TRANSACTIONS FOUND"
- Console shows: "Rows returned: 0"

**Solution:**
Add some transactions first!
- Go to Manager Portal → Daily Operations
- Add a service transaction

#### Issue 2: Transactions Too Old
**Symptoms:**
- Debug script shows transactions but dates are > 12 months ago
- Console shows: "No months found in last 12 months"

**Solution Option A** - Add recent transaction
**Solution Option B** - Change query interval

Edit `modules/manager_module.R` line ~1925:
```r
# Change from:
WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')

# To:
WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '24 months')
```

#### Issue 3: Observer Not Triggering
**Symptoms:**
- No console output when visiting Monthly Closing tab
- No "=== LOADING MONTHS ===" message

**Solution:**
The observe block might not be triggering. Try adding a dependency:

Edit `modules/manager_module.R`:
```r
observe({
  req(session_data$authenticated)  # Add this line
  req(session_data$user$role == "manager")  # Add this line
  
  cat("=== LOADING MONTHS FOR DROPDOWN ===\n")
  # ... rest of code
})
```

#### Issue 4: Database Connection Error
**Symptoms:**
- Console shows connection error
- Query fails

**Solution:**
Check `global.R` - ensure `get_db_connection()` is defined.

### Step 4: Manual Test
If nothing works, test manually in R console:

```r
source("global.R")
con <- get_db_connection()

# Test query
months <- dbGetQuery(con, "
  SELECT DISTINCT 
    TO_CHAR(transaction_date, 'YYYY-MM') as month_key,
    TO_CHAR(transaction_date, 'Month YYYY') as month_label
  FROM transactions
  WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
  ORDER BY month_key DESC
")

print(months)

close_db_connection(con)
```

If this returns data, the query works!

### Step 5: Report Results
After running debug script, report:
1. Total transactions: _____
2. Date range: _____ to _____
3. Months found: _____
4. Console log output: _____

This will help identify the exact issue!

## Quick Fix: Show ALL Months (No Time Limit)

If you just want to see the dropdown working, remove the date filter:

Edit `modules/manager_module.R` line ~1930:
```r
# Change from:
SELECT DISTINCT 
  TO_CHAR(transaction_date, 'YYYY-MM') as month_key,
  TO_CHAR(transaction_date, 'Month YYYY') as month_label
FROM transactions
WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
ORDER BY month_key DESC

# To:
SELECT DISTINCT 
  TO_CHAR(transaction_date, 'YYYY-MM') as month_key,
  TO_CHAR(transaction_date, 'Month YYYY') as month_label
FROM transactions
ORDER BY month_key DESC
```

This will show ALL months with any transactions, regardless of date.


