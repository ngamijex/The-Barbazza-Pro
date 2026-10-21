# 📊 Daily Report Feature - Complete Guide

## Overview

The Daily Report feature allows managers to generate comprehensive end-of-day reports and automatically upload them to Google Drive. Reports are generated in both **Excel** and **Google Sheets** formats with professional formatting.

---

## 🎯 Features

### Report Contents

Each daily report includes:

1. **Summary Sheet**
   - Total Income
   - Total Customers
   - Total Expenses
   - Net Profit
   - Generation timestamp

2. **Barber Performance Sheet**
   - Barber code and name
   - Commission rate
   - Total customers served
   - Gross income
   - Barber commission earned
   - Shop share

3. **Transactions Sheet**
   - All transactions for the day
   - Barber details
   - Customer names
   - Services provided
   - Amounts
   - Time of service
   - Notes

4. **Expenses Sheet**
   - All expenses for the day
   - Categories
   - Descriptions
   - Amounts
   - Time recorded
   - Person who recorded

### Report Formats

- **Excel (.xlsx)**: Professional formatted workbook with multiple sheets, styling, formulas
- **Google Sheets**: Cloud-based spreadsheet with same data structure

---

## 🔧 Setup

### 1. Google Cloud Service Account

The application uses a service account for authentication:

- **JSON File**: `the-barbazza-38f63345b759.json`
- **Service Account**: `barbazzius@the-barbazza.iam.gserviceaccount.com`
- **Project**: `the-barbazza`

✅ This file is already configured and in your project root.

### 2. Google Drive Folder

Reports are uploaded to:
- **Folder ID**: `1VFRjOtnY-wm-UCAjV34yS9MpNRfAxC3I`
- **Access**: [Open Folder](https://drive.google.com/drive/folders/1VFRjOtnY-wm-UCAjV34yS9MpNRfAxC3I)

Make sure the service account has **Editor** permissions on this folder.

### 3. Required R Packages

```r
# Install required packages
source("install_packages.R")

# Or manually:
install.packages(c("googledrive", "googlesheets4", "openxlsx"))
```

### 4. Test the Integration

Before using in production, run the test script:

```r
source("test_google_drive.R")
```

This will:
- ✓ Verify authentication
- ✓ Check folder access
- ✓ Generate a test report
- ✓ Upload to Google Drive
- ✓ Create a Google Sheet

---

## 📖 How to Use

### In the Manager Portal

1. **Login** as a manager

2. Navigate to **"Daily Report"** tab

3. **Select Report Date**
   - Default: Today
   - Can select any past date

4. **Choose Report Format**
   - **Both** (Excel + Google Sheets) - Recommended
   - **Excel Only**
   - **Google Sheets Only**

5. **Generate Report**
   - Click "📤 Generate & Upload Report"
   - Wait for processing (usually 5-15 seconds)
   - Status will show success/error

6. **Access Report**
   - Links to view online will be provided
   - Reports are also saved locally in `/reports` folder

### Report Preview

The preview section shows a summary for the selected date before generating:
- Total Income
- Total Customers
- Total Expenses
- Net Profit (color-coded: gold if positive, red if negative)

### Recent Reports

The bottom table shows all locally generated reports with dates.

---

## 🗂️ File Structure

```
the_barbazza/
├── the-barbazza-38f63345b759.json      # Service account credentials
├── utils/
│   ├── google_drive.R                   # Google Drive functions
│   └── report_generator.R               # Report generation functions
├── reports/                             # Local report storage
│   ├── Barbazza_Daily_Report_20260107.xlsx
│   └── ...
├── modules/
│   └── manager_module.R                 # Manager UI with report tab
├── test_google_drive.R                  # Test script
└── DAILY_REPORT_FEATURE.md             # This file
```

---

## 🔄 Workflow

```
1. Manager selects date + format
         ↓
2. System queries database
   - Transactions
   - Expenses
   - Barber performance
         ↓
3. Generate Excel report
   - Create workbook
   - Format sheets
   - Save locally
         ↓
4. Prepare Google Sheets data
   - Format data frames
   - Structure for sheets
         ↓
5. Authenticate with Google
   - Use service account JSON
   - Get access token
         ↓
6. Upload Excel to Drive
   - Upload to specified folder
   - Get shareable link
         ↓
7. Create Google Sheet
   - Create new sheet
   - Populate with data
   - Move to folder
         ↓
8. Return results to manager
   - Show success message
   - Provide links
   - Update recent reports table
```

---

## 🎨 Professional Features

### Excel Report Styling

- **Title styling**: Bold, large font, centered
- **Header styling**: Dark background, white text, borders
- **Currency formatting**: Proper number format with decimals
- **Auto-width columns**: Readable column widths
- **Formula totals**: Automatic sum formulas
- **Multiple sheets**: Organized data in separate tabs

### Google Sheets Features

- **Cloud accessible**: View from anywhere
- **Shareable links**: Easy to share with stakeholders
- **Multiple sheets**: Same structure as Excel
- **Real-time collaboration**: Can be edited if needed

---

## 🛡️ Security

- **Service Account**: Isolated credentials, no user access required
- **Local storage**: Reports saved locally for backup
- **Secure upload**: HTTPS connection to Google Drive
- **Access control**: Only managers can generate reports
- **Audit logging**: All report generations are logged

---

## 🐛 Troubleshooting

### "Authentication Failed"

**Problem**: Cannot connect to Google Drive

**Solution**:
1. Verify JSON file exists: `the-barbazza-38f63345b759.json`
2. Check file permissions
3. Run `source("test_google_drive.R")` to diagnose

### "Folder Access Denied"

**Problem**: Cannot access Google Drive folder

**Solution**:
1. Verify folder ID: `1VFRjOtnY-wm-UCAjV34yS9MpNRfAxC3I`
2. Check service account has Editor permissions
3. Try accessing folder manually: [Link](https://drive.google.com/drive/folders/1VFRjOtnY-wm-UCAjV34yS9MpNRfAxC3I)

### "No Data in Report"

**Problem**: Report generated but has no transactions

**Solution**:
- This is normal if no transactions occurred on selected date
- Verify transactions exist in database for that date
- Check date filter in queries

### "Package Installation Failed"

**Problem**: googledrive or googlesheets4 won't install

**Solution**:
```r
# Try installing dependencies first
install.packages("httr")
install.packages("jsonlite")
install.packages("gargle")

# Then install Google packages
install.packages("googledrive")
install.packages("googlesheets4")
```

### "Report Generated but Not Uploaded"

**Problem**: Local Excel created but upload failed

**Solution**:
- Check internet connection
- Verify Google Drive API is enabled
- Check service account permissions
- Look at console error messages

---

## 📊 Database Queries

The report uses these main queries:

### Transactions Query
```sql
SELECT 
  b.barber_code,
  u.full_name as barber_name,
  s.service_name,
  t.amount,
  t.service_notes,
  TO_CHAR(t.created_at, 'HH24:MI') as time,
  t.customer_name
FROM transactions t
JOIN barbers b ON t.barber_id = b.barber_id
JOIN users u ON b.user_id = u.user_id
LEFT JOIN services s ON t.service_id = s.service_id
WHERE DATE(t.transaction_date) = $1
ORDER BY b.barber_code, t.created_at
```

### Barber Performance Query
```sql
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
```

### Expenses Query
```sql
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
```

---

## 🎯 Best Practices

1. **Generate reports daily** - End of each business day
2. **Review before generating** - Check preview section first
3. **Use "Both" format** - Provides Excel backup + cloud access
4. **Regular backups** - `/reports` folder should be backed up
5. **Verify uploads** - Check Google Drive folder periodically
6. **Clean old reports** - Archive old local reports monthly

---

## 📞 Support

If you encounter issues:

1. **Run test script**: `source("test_google_drive.R")`
2. **Check logs**: Look at console output
3. **Verify credentials**: Ensure JSON file is correct
4. **Test manually**: Try uploading a test file to folder

---

## 🔄 Future Enhancements

Potential improvements:

- [ ] Email reports automatically
- [ ] Schedule automatic generation
- [ ] Monthly summary reports
- [ ] Custom report templates
- [ ] PDF export option
- [ ] Chart visualizations
- [ ] Comparison with previous periods
- [ ] Export to other cloud services

---

## ✅ Checklist

Before using in production:

- [x] JSON credentials file in place
- [x] Service account has folder access
- [ ] Run `source("install_packages.R")`
- [ ] Run `source("test_google_drive.R")`
- [ ] Test report generation
- [ ] Verify upload to Google Drive
- [ ] Check Google Sheets creation
- [ ] Train managers on usage

---

## 📝 Notes

- Reports use **RWF** (Rwandan Franc) currency format
- Times are in **24-hour format** (HH:MM)
- Dates are in **YYYY-MM-DD** format in database
- Report filenames: `Barbazza_Daily_Report_YYYYMMDD.xlsx`
- Google Sheet names: `Barbazza_Daily_Report_YYYYMMDD`

---

**Feature Created**: January 7, 2025  
**Last Updated**: January 7, 2025  
**Version**: 1.0.0


