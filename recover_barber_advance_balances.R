#!/usr/bin/env Rscript

# ============================================
# Recover barber recruitment "already paid" balances
#
# When recruitment advance was edited in Admin, advance_remaining
# was wrongly reset to the full advance. This script rebuilds
# advance_remaining from monthly_salaries recruitment_deduction history.
#
# Run in RStudio:
#   source("recover_barber_advance_balances.R")
#
# Set APPLY_RECOVERY <- TRUE to write fixes to the database.
# ============================================

source("global.R")

APPLY_RECOVERY <- FALSE  # change to TRUE to update the database

con <- get_db_connection()
on.exit(close_db_connection(con))

cat("\n========================================\n")
cat("  Recover Barber Advance Balances\n")
cat("========================================\n\n")

report <- tryCatch({
  dbGetQuery(con, "
    SELECT 
      b.barber_id,
      b.barber_code,
      COALESCE(u.full_name, b.barber_code) as barber_name,
      COALESCE(b.recruitment_advance, 0) as recruitment_advance,
      COALESCE(b.advance_remaining, 0) as current_remaining,
      COALESCE(SUM(ms.recruitment_deduction), 0) as total_paid_from_salaries,
      GREATEST(
        0,
        COALESCE(b.recruitment_advance, 0) - COALESCE(SUM(ms.recruitment_deduction), 0)
      ) as correct_remaining
    FROM barbers b
    LEFT JOIN users u ON b.user_id = u.user_id
    LEFT JOIN monthly_salaries ms ON b.barber_id = ms.barber_id
    WHERE COALESCE(b.recruitment_advance, 0) > 0
       OR COALESCE(b.advance_remaining, 0) > 0
       OR EXISTS (
         SELECT 1 FROM monthly_salaries ms2
         WHERE ms2.barber_id = b.barber_id
           AND COALESCE(ms2.recruitment_deduction, 0) > 0
       )
    GROUP BY b.barber_id, b.barber_code, u.full_name,
             b.recruitment_advance, b.advance_remaining
    ORDER BY b.barber_code
  ")
}, error = function(e) {
  cat("Error loading data:", e$message, "\n")
  cat("Ensure table monthly_salaries exists and has recruitment_deduction.\n")
  NULL
})

if (is.null(report) || nrow(report) == 0) {
  cat("No barbers with recruitment advance data found.\n")
  quit(save = "no", status = 0)
}

report$needs_fix <- abs(report$current_remaining - report$correct_remaining) > 0.01

cat("Barber recruitment balance report:\n\n")
print(report[, c("barber_code", "barber_name", "recruitment_advance",
                 "total_paid_from_salaries", "current_remaining", "correct_remaining", "needs_fix")])

n_fix <- sum(report$needs_fix)
cat("\n")
cat("Barbers needing correction:", n_fix, "of", nrow(report), "\n")

if (n_fix == 0) {
  cat("All balances already match payment history. Nothing to do.\n")
  quit(save = "no", status = 0)
}

if (!APPLY_RECOVERY) {
  cat("\nDRY RUN only — no database changes.\n")
  cat("To apply fixes, edit this file and set:\n")
  cat("  APPLY_RECOVERY <- TRUE\n")
  cat("Then run source(\"recover_barber_advance_balances.R\") again.\n\n")
  quit(save = "no", status = 0)
}

cat("\nApplying recovery to database...\n")

updated <- 0
for (i in which(report$needs_fix)) {
  row <- report[i, ]
  dbExecute(con, "
    UPDATE barbers
    SET advance_remaining = $1
    WHERE barber_id = $2
  ", params = list(as.numeric(row$correct_remaining), as.integer(row$barber_id)))
  updated <- updated + 1
  cat(sprintf(
    "  Updated %s (%s): remaining %s -> %s (paid from salaries: %s)\n",
    row$barber_code,
    row$barber_name,
    format(round(row$current_remaining, 2), big.mark = ","),
    format(round(row$correct_remaining, 2), big.mark = ","),
    format(round(row$total_paid_from_salaries, 2), big.mark = ",")
  ))
}

cat("\nDone. Updated", updated, "barber(s).\n\n")
