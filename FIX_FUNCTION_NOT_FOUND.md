# Fix: "could not find function" Error

## The Problem

You're seeing this error:
```
Error in admin_server: could not find function "admin_server"
```

This happens because the module functions defined in `global.R` aren't loaded into your R session.

## The Solution (Choose One)

### Option 1: Restart R Session (Recommended) ✅

**In RStudio:**
1. Go to: `Session` → `Restart R`
2. Then run: `shiny::runApp("app.R")`

**Why this works:** Shiny automatically loads `global.R` when it exists in the app directory. Restarting R ensures a clean environment.

### Option 2: Test Loading Script

Run this to verify everything loads correctly:

```r
source("test_loading.R")
```

This will check:
- ✓ All files are present
- ✓ global.R loads successfully
- ✓ All functions are defined
- ✓ Database connection works

### Option 3: Manual Source (If Above Fails)

If restarting doesn't work, manually source global.R before running:

```r
source("global.R")
shiny::runApp("app.R")
```

## Why This Happens

### How Shiny Loads Files

1. **global.R** (if exists) - Loaded automatically, runs once
2. **ui.R / app.R** - Defines UI
3. **server.R / app.R** - Defines server logic

### What We Did in Refactoring

We created `global.R` to centralize:
- Library loading
- Database configuration
- Utility functions
- Module definitions

This means **everything must be loaded from global.R first**.

## Verification Steps

After restarting R, run this to check:

```r
# Check if functions exist
exists("admin_server")     # Should return TRUE
exists("manager_server")   # Should return TRUE
exists("barber_server")    # Should return TRUE
exists("get_db_connection") # Should return TRUE
```

If any return `FALSE`, run:

```r
source("global.R")
```

Then check again.

## Common Issues & Solutions

### Issue 1: "Error loading global.R"

**Cause:** A syntax error or missing dependency in global.R

**Solution:**
1. Check R console for specific error
2. Verify all required packages are installed:
   ```r
   source("install_packages.R")
   ```

### Issue 2: "Logger functions not found"

**Cause:** utils/logger.R not sourced properly

**Solution:**
```r
source("utils/logger.R")
```

### Issue 3: "Database connection functions not found"

**Cause:** global.R not fully loaded

**Solution:**
```r
source("global.R")
```

### Issue 4: Still getting errors after restart

**Solution:** Check working directory
```r
getwd()  # Should show: .../the_barbazza

# If not, set it:
setwd("C:/Users/USER/Desktop/My Projects/The_Barbazza/the_barbazza")
```

## Best Practices Going Forward

### Always Do This:

1. ✅ **Start fresh:** Restart R session when opening project
2. ✅ **Verify loading:** Run `test_loading.R` if unsure
3. ✅ **Check directory:** Make sure you're in project root

### Never Do This:

1. ❌ Source individual module files manually
2. ❌ Copy-paste function definitions into console
3. ❌ Modify functions in the console (always edit source files)

## Quick Command Reference

```r
# 1. Restart R Session
# In RStudio: Session → Restart R
# Then:

# 2. Test that everything loads
source("test_loading.R")

# 3. Run the app
shiny::runApp("app.R")

# Alternative: If restart doesn't work
source("global.R")
shiny::runApp("app.R")
```

## Understanding the Flow

```
Start RStudio Project
        ↓
    Restart R
        ↓
  Shiny loads global.R automatically
        ↓
  global.R loads:
    - Libraries
    - Database config
    - Logger (utils/logger.R)
    - Helpers (utils/helpers.R)
    - Auth (utils/auth.R)
    - Admin module (modules/admin_module.R)
    - Manager module (modules/manager_module.R)
    - Barber module (modules/barber_module.R)
        ↓
  All functions now available
        ↓
   Run app.R successfully!
```

## Still Having Issues?

### Debug Steps:

1. **Check what's loaded:**
   ```r
   ls()  # List all objects in environment
   ```
   
   Should include:
   - `admin_server`, `admin_ui`
   - `manager_server`, `manager_ui`
   - `barber_server`, `barber_ui`
   - `get_db_connection`, `close_db_connection`
   - `verify_user`, `format_currency`, etc.

2. **Check global.R exists:**
   ```r
   file.exists("global.R")  # Should be TRUE
   ```

3. **Check modules exist:**
   ```r
   file.exists("modules/admin_module.R")    # Should be TRUE
   file.exists("modules/manager_module.R")  # Should be TRUE
   file.exists("modules/barber_module.R")   # Should be TRUE
   ```

4. **Manually load and check:**
   ```r
   source("global.R")
   exists("admin_server")  # Should be TRUE now
   ```

## Prevention

To avoid this issue in the future:

1. **Always use RStudio projects** - Open `the_barbazza.Rproj`
2. **Always restart R** when starting work - `Session → Restart R`
3. **Use the test script** - Run `source("test_loading.R")` to verify

## Summary

The error happens because R doesn't have the module functions loaded. 

**Quick Fix:**
1. Restart R session (`Session → Restart R` in RStudio)
2. Run `shiny::runApp("app.R")`

That's it! Shiny will automatically load `global.R` which loads everything else.

---

**Need more help?** Check `ARCHITECTURE.md` for system design details.


