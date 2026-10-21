# Barbazza Barbershop Management System

A comprehensive daily-operations-focused barbershop management system built with R Shiny.

## Features

### User Roles

1. **Admin** - Full system control
   - User management (create/manage managers & barbers)
   - View global reports (daily, weekly, monthly)
   - Manage services & prices
   - System settings
   - Audit logs

2. **Manager** - Daily operations
   - Add daily service transactions
   - Record expenses (shop & barber-specific)
   - View daily income & profit summaries
   - Generate daily reports
   - Close the day

3. **Barber** - Personal performance
   - View today's income (real-time)
   - See number of clients served
   - View performance history (daily/weekly/monthly)
   - Track personal earnings

## Installation

### 1. Install Required R Packages

Run the package installation script:

```r
source("install_packages.R")
```

Or manually install:

```r
install.packages(c("shiny", "shinyjs", "DT", "RPostgres", "DBI", "digest"))
```

### 2. Database Setup

The database is already configured. To ensure password verification works properly, run:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

You can run this in your Neon database console or use the provided `setup_db.sql` file.

### 3. Run the Application

```r
shiny::runApp("app.R")
```

Or simply:

```r
source("app.R")
```

## Database Connection

The system connects to a Neon PostgreSQL database. Connection details are configured in `utils/db_connection.R`.

**Connection String:**
```
postgresql://neondb_owner:npg_RBWT5yV4LGsJ@ep-sparkling-pond-agk40clv-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Project Structure

```
the_barbazza/
├── app.R                    # Main application file
├── install_packages.R        # Package installation script
├── setup_db.sql             # Database setup script
├── check_db.R               # Database structure checker
├── utils/
│   ├── db_connection.R      # Database connection utilities
│   ├── auth.R               # Authentication functions
│   └── helpers.R            # Helper functions
├── modules/
│   ├── admin_module.R       # Admin portal
│   ├── manager_module.R     # Manager portal
│   └── barber_module.R       # Barber portal
└── www/
    ├── styles.css           # Custom CSS styles
    ├── app.js               # JavaScript for interactivity
    └── logo.png             # Barbazza logo
```

## Default Login

The system comes with a default admin user:
- **Username:** admin
- **Password:** (check database or contact system administrator)

## Key Features

### Daily Operations
- Real-time transaction tracking
- Automatic income calculation
- Expense management
- Daily profit calculation

### Reports
- Daily summaries
- Barber performance tracking
- Income/expense reports
- Historical data analysis

### Security
- Role-based access control
- Password hashing (bcrypt)
- Audit logging
- Session management

## Development Notes

- The system uses Shiny (not shinydashboard) for a custom UI
- CSS follows the Barbazza design system (dark theme with gold accents)
- JavaScript enhances user experience with animations and interactivity
- All database operations use parameterized queries for security

## Troubleshooting

### Authentication Issues
If you encounter password verification errors:
1. Ensure `pgcrypto` extension is installed in your database
2. Run `setup_db.sql` to enable the extension
3. Check that password hashes in the database are valid bcrypt hashes

### Database Connection Issues
1. Verify your internet connection
2. Check that the database credentials in `utils/db_connection.R` are correct
3. Ensure SSL is properly configured

### Package Installation Issues
1. Update R to the latest version
2. Install packages from CRAN
3. For RPostgres, you may need to install system dependencies (libpq-dev on Linux)

## License

This is a proprietary system for Barbazza Barbershop.

## Support

For issues or questions, contact the system administrator.


