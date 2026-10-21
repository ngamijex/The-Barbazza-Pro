# Quick Start Guide

## First Time Setup

### 1. Install R Packages

Open R or RStudio and run:

```r
source("install_packages.R")
```

This will install all required packages:
- shiny
- shinyjs
- DT
- RPostgres
- DBI
- digest

### 2. Setup Database Extension

The database needs the `pgcrypto` extension for password verification. Run this SQL in your Neon database console:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Or use the provided script:
```bash
psql 'postgresql://neondb_owner:npg_RBWT5yV4LGsJ@ep-sparkling-pond-agk40clv-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' -f setup_db.sql
```

### 3. Run the Application

In R or RStudio:

```r
shiny::runApp("app.R")
```

Or:

```r
source("app.R")
```

The application will open in your default web browser.

## Default Login

- **Username:** admin
- **Password:** (Check with database administrator or reset if needed)

## Testing the Connection

To test if the database connection works:

```r
source("utils/db_connection.R")
con <- get_db_connection()
tables <- dbListTables(con)
print(tables)
close_db_connection(con)
```

## Troubleshooting

### "Package not found" error
- Run `install_packages.R` again
- Make sure you have internet connection
- Update R to latest version

### "Database connection failed" error
- Check internet connection
- Verify database credentials in `utils/db_connection.R`
- Ensure SSL is properly configured

### "Password verification failed" error
- Run the SQL command to enable pgcrypto extension
- Check that password hashes in database are valid

### Application won't start
- Check R console for error messages
- Ensure all files are in the correct directories
- Verify file permissions

## Next Steps

1. **Create Users:** Login as admin and create manager/barber accounts
2. **Add Services:** Configure services and prices in admin panel
3. **Add Barbers:** Create barber profiles linked to user accounts
4. **Start Operations:** Managers can start recording daily transactions

## Support

For issues, check the main README.md file or contact the system administrator.


