# Barbazza Barbershop Management System - Architecture

## Overview

The Barbazza system is a professional barbershop management application built with R Shiny, designed with best practices for maintainability, security, and performance.

## Architecture Principles

### 1. Single Source of Truth
- **Database configuration** is defined once in `global.R`
- All modules and utilities reference the same configuration
- No hardcoded credentials in module files

### 2. Separation of Concerns
- **UI Layer**: Defined in module files (`*_ui` functions)
- **Business Logic**: Implemented in module servers (`*_server` functions)
- **Data Access**: Handled through utility functions in `utils/`
- **Styling**: All CSS in external stylesheet (`www/styles.css`)

### 3. Security First
- Parameterized database queries prevent SQL injection
- Password verification using PostgreSQL's bcrypt (pgcrypto extension)
- Role-based access control (RBAC)
- Session-based authentication

### 4. Error Handling & Logging
- Comprehensive error handling throughout the application
- Structured logging system (`utils/logger.R`)
- Database operation logging
- Authentication attempt tracking

## File Structure

```
the_barbazza/
├── global.R                    # Global configuration & initialization
├── app.R                       # Main application file
├── modules/
│   ├── admin_module.R          # Admin portal (full control)
│   ├── manager_module.R        # Manager portal (daily operations)
│   └── barber_module.R         # Barber portal (personal performance)
├── utils/
│   ├── auth.R                  # Authentication & authorization
│   ├── helpers.R               # Helper functions (formatting, validation)
│   └── logger.R                # Logging utilities
├── www/
│   ├── styles.css              # All application styles
│   ├── app.js                  # Client-side JavaScript
│   └── logo.png                # Application logo
└── [Documentation files]
```

## Key Components

### 1. Global Configuration (`global.R`)

**Purpose**: Single entry point for loading all dependencies and configurations

**Responsibilities**:
- Load required R packages
- Define database configuration
- Define database connection functions
- Source all utility files
- Source all module files

**Benefits**:
- Ensures proper initialization order
- Prevents "function not found" errors
- Makes testing and deployment easier

### 2. Main Application (`app.R`)

**Purpose**: Application entry point and authentication controller

**Responsibilities**:
- Define UI structure
- Handle login/logout flow
- Manage user session
- Route users to appropriate module based on role

**Key Features**:
- Static login UI (no render delay)
- Dynamic main UI based on user role
- Session management with `reactiveValues`
- Clean separation between authentication and modules

### 3. Modules

Each module follows a consistent pattern:

```r
# UI function
module_ui <- function(id) {
  ns <- NS(id)
  # Return UI elements
}

# Server function
module_server <- function(id, session_data) {
  moduleServer(id, function(input, output, session) {
    # Server logic
  })
}
```

**Admin Module**:
- User management (create, edit, activate/deactivate)
- Service and pricing management
- Global reporting
- System configuration

**Manager Module**:
- Daily service transactions
- Expense recording
- Daily reports and summaries
- End-of-day closing

**Barber Module**:
- Personal performance dashboard
- Today's earnings and statistics
- Historical earnings view
- Read-only access

### 4. Utilities

**Authentication (`utils/auth.R`)**:
- `verify_user()`: Validates credentials and returns user info
- `get_user_info()`: Retrieves user details by ID
- `has_permission()`: Checks role-based permissions

**Helpers (`utils/helpers.R`)**:
- Formatting functions (currency, date, datetime)
- Validation functions
- Notification helpers
- Data retrieval helpers

**Logger (`utils/logger.R`)**:
- Structured logging with levels (DEBUG, INFO, WARNING, ERROR)
- Context-aware logging
- Specialized loggers for database and authentication

### 5. Database Layer

**Connection Management**:
```r
get_db_connection()        # Opens connection
close_db_connection(con)   # Closes connection
execute_query(query, params)  # Read operations
execute_write(query, params)  # Write operations
```

**Best Practices**:
- Always use parameterized queries
- Use `on.exit()` to ensure connections are closed
- Wrap operations in `tryCatch()` for error handling
- Log all database operations

## Data Flow

### Authentication Flow
1. User enters credentials
2. `verify_user()` queries database
3. Password verified using PostgreSQL's crypt function
4. User info stored in session
5. Role-based UI rendered

### Transaction Flow (Manager)
1. Manager selects barber and service
2. Transaction recorded in database
3. Reactive values updated
4. UI refreshes automatically
5. All changes logged

### Reporting Flow
1. Module requests data from database
2. Helper functions format data
3. DT tables render data
4. Auto-refresh keeps data current

## Security Considerations

### 1. Password Security
- Passwords hashed using bcrypt
- Verification done in PostgreSQL (server-side)
- No plaintext passwords stored or transmitted

### 2. SQL Injection Prevention
- All queries use parameterized statements
- User input sanitized before use
- Database library handles escaping

### 3. Role-Based Access
- Permission checks at module level
- UI elements hidden based on role
- Server-side validation of permissions

### 4. Session Management
- Session data stored server-side only
- Automatic logout on session end
- Clear session on logout

## Performance Optimization

### 1. Reactive Programming
- Minimize reactive dependencies
- Use `isolate()` when appropriate
- Debounce user inputs where needed

### 2. Database Operations
- Connection pooling via Neon DB
- Efficient queries with proper indexes
- Limit result sets for large tables

### 3. UI Rendering
- Static UI where possible
- Lazy loading of data tables
- CSS animations for perceived performance

## Styling System

### CSS Variables
All colors, spacing, and typography defined as CSS variables for:
- Consistent design system
- Easy theme customization
- Better maintainability

### Component Classes
- `.admin-*`: Admin module styles
- `.manager-*`: Manager module styles
- `.barber-*`: Barber module styles
- Reusable utility classes

### Design Philosophy
- Professional, classic aesthetic
- Light theme with black accents
- Responsive design
- Smooth transitions

## Error Handling Strategy

### Levels of Error Handling

1. **Database Level**: Connection and query errors
2. **Authentication Level**: Login failures
3. **Module Level**: User action errors
4. **UI Level**: User-friendly error messages

### Error Logging

All errors are logged with:
- Timestamp
- Error level
- Context (where it occurred)
- Error message
- User identification (when applicable)

## Testing Recommendations

1. **Unit Testing**: Test individual helper functions
2. **Integration Testing**: Test database operations
3. **UI Testing**: Test user workflows
4. **Security Testing**: Test authentication and authorization
5. **Performance Testing**: Test with realistic data volumes

## Deployment Checklist

- [ ] Set production database credentials
- [ ] Enable pgcrypto extension in database
- [ ] Configure logging to file
- [ ] Set appropriate log levels
- [ ] Test all user roles
- [ ] Verify security settings
- [ ] Load initial data
- [ ] Configure backups
- [ ] Set up monitoring

## Maintenance Guidelines

### Regular Tasks
- Review logs for errors
- Monitor database performance
- Update user permissions
- Backup database regularly

### Code Updates
- Test in development first
- Update documentation
- Review security implications
- Maintain changelog

### Database Maintenance
- Regular backups
- Index optimization
- Query performance review
- Data archival strategy

## Future Enhancements

### Planned Features
1. Multiple branch support
2. Commission calculation system
3. Appointment scheduling
4. Customer relationship management
5. Inventory management
6. Mobile app
7. Email notifications
8. Advanced reporting and analytics

### Scalability Considerations
- Database partitioning for large datasets
- Caching layer for frequently accessed data
- Load balancing for multiple users
- API for external integrations

## Support & Troubleshooting

### Common Issues

**Problem**: "Function not found" error
**Solution**: Ensure `global.R` is loaded first, restart R session

**Problem**: Login fails with "password verification error"
**Solution**: Ensure pgcrypto extension is installed: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`

**Problem**: Database connection timeout
**Solution**: Check network connectivity, verify Neon DB credentials

**Problem**: Slow performance
**Solution**: Check database query performance, review reactive dependencies

### Debug Mode

To enable detailed logging, set in `utils/logger.R`:
```r
CURRENT_LOG_LEVEL <- LOG_LEVELS$DEBUG
```

## License & Credits

**Application**: Barbazza Barbershop Management System
**Framework**: R Shiny
**Database**: PostgreSQL (Neon DB)
**Built with**: Professional best practices and attention to detail

---

*This architecture document should be updated as the system evolves.*


