# Admin Module
# Full system control and management
# Note: Database connection functions are defined in global.R

# Admin UI
admin_ui <- function(id) {
  ns <- NS(id)
  
  div(
    style = "padding: var(--space-4);",
    
    div(
      class = "admin-tabs",
      tabsetPanel(
        id = ns("admin_tabs"),
        type = "tabs",
        
        # Dashboard Tab
        tabPanel(
          "Dashboard",
          value = "dashboard",
          
          # Key Metrics
          div(
            class = "admin-card",
            h3("System Overview"),
            fluidRow(
              column(3, div(class = "stat-card", 
                div(class = "stat-label", "Total Users"),
                div(class = "stat-value", textOutput(ns("total_users")))
              )),
              column(3, div(class = "stat-card",
                div(class = "stat-label", "Active Barbers"),
                div(class = "stat-value", textOutput(ns("active_barbers")))
              )),
              column(3, div(class = "stat-card",
                div(class = "stat-label", "Today's Income"),
                div(class = "stat-value", textOutput(ns("today_income")))
              )),
              column(3, div(class = "stat-card",
                div(class = "stat-label", "Today's Customers"),
                div(class = "stat-value", textOutput(ns("today_customers")))
              ))
            )
          ),
          
          # Weekly Summary
          div(
            class = "admin-card",
            h3("This Week Performance"),
            fluidRow(
              column(3, div(class = "stat-card",
                div(class = "stat-label", "Weekly Income"),
                div(class = "stat-value", textOutput(ns("week_income")))
              )),
              column(3, div(class = "stat-card",
                div(class = "stat-label", "Weekly Customers"),
                div(class = "stat-value", textOutput(ns("week_customers")))
              )),
              column(3, div(class = "stat-card",
                div(class = "stat-label", "Weekly Expenses"),
                div(class = "stat-value", textOutput(ns("week_expenses")))
              )),
              column(3, div(class = "stat-card",
                div(class = "stat-label", "Net Profit"),
                div(class = "stat-value", textOutput(ns("week_profit")))
              ))
            )
          ),
          
          # Monthly Summary
          div(
            class = "admin-card",
            h3("This Month Performance"),
            p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);", 
              paste("Month of", format(Sys.Date(), "%B %Y"))),
            fluidRow(
              column(2, div(class = "stat-card",
                div(class = "stat-label", "Monthly Income"),
                div(class = "stat-value", textOutput(ns("month_income")))
              )),
              column(2, div(class = "stat-card",
                div(class = "stat-label", "Monthly Customers"),
                div(class = "stat-value", textOutput(ns("month_customers")))
              )),
              column(2, div(class = "stat-card",
                div(class = "stat-label", "Total Services"),
                div(class = "stat-value", textOutput(ns("month_services")))
              )),
              column(2, div(class = "stat-card",
                div(class = "stat-label", "Monthly Expenses"),
                div(class = "stat-value", textOutput(ns("month_expenses")))
              )),
              column(2, div(class = "stat-card",
                div(class = "stat-label", "Net Profit"),
                div(class = "stat-value", style = "color: var(--barbazza-gold);", textOutput(ns("month_profit")))
              )),
              column(2, div(class = "stat-card",
                div(class = "stat-label", "Avg Daily Income"),
                div(class = "stat-value", textOutput(ns("month_avg_daily")))
              ))
            )
          ),
          
          # Income Trend Chart
          div(
            class = "admin-card",
            h3("Income Trend - This Month"),
            p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);", 
              "Total system income performance this month"),
            div(
              style = "height: 350px; position: relative;",
              tags$canvas(id = ns("income_chart"), style = "max-height: 350px;")
            )
          ),
          
          # Top Barbers
          div(
            class = "admin-card",
            h3("Top Performing Barbers (This Month)"),
            DT::dataTableOutput(ns("top_barbers"))
          ),
          
          # Recent Activity
          div(
            class = "admin-card",
            h3("Recent System Activity"),
            DT::dataTableOutput(ns("recent_activity"))
          )
        ),
        
        # Performance Dashboard Tab (Monthly analytics - Barbershop & Barber views)
        tabPanel(
          "Performance Dashboard",
          value = "performance_dashboard",
          
          div(
            class = "admin-card",
            h3("Monthly Performance Analytics"),
            p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);",
              "Select a month and switch between barbershop overview and a specific barber's monthly performance."),
            fluidRow(
              column(4,
                selectInput(ns("perf_month"), "Select Month",
                           choices = local({
                             months_seq <- seq(as.Date(format(Sys.Date(), "%Y-%m-01")), by = "-1 month", length.out = 24)
                             setNames(format(months_seq, "%Y-%m-01"), format(months_seq, "%B %Y"))
                           }),
                           selected = format(Sys.Date(), "%Y-%m-01"))
              ),
              column(4,
                div(
                  class = "perf-view-toggle",
                  style = "margin-top: 24px;",
                  radioButtons(ns("perf_view"), "View",
                               choices = c(
                                 "Barbershop" = "salon",
                                 "Barber" = "barber"
                               ),
                               selected = "salon",
                               inline = TRUE)
                )
              )
            )
          ),
          
          # Barbershop view (salon performance)
          conditionalPanel(
            condition = "input.perf_view == 'salon'",
            ns = ns,
            div(
              class = "admin-card",
              h3("Barbershop Performance"),
              p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);",
                textOutput(ns("perf_salon_month_label"))),
              fluidRow(
                column(2, div(class = "stat-card",
                  div(class = "stat-label", "Total Customers"),
                  div(class = "stat-value", textOutput(ns("perf_salon_customers")))
                )),
                column(2, div(class = "stat-card",
                  div(class = "stat-label", "Total Income"),
                  div(class = "stat-value", textOutput(ns("perf_salon_income")))
                )),
                column(2, div(class = "stat-card",
                  div(class = "stat-label", "Total Expenses"),
                  div(class = "stat-value", textOutput(ns("perf_salon_expenses")))
                )),
                column(2, div(class = "stat-card",
                  div(class = "stat-label", "Net Profit"),
                  div(class = "stat-value", style = "color: var(--barbazza-gold);", textOutput(ns("perf_salon_profit")))
                )),
                column(2, div(class = "stat-card",
                  div(class = "stat-label", "Days Worked"),
                  div(class = "stat-value", textOutput(ns("perf_salon_days")))
                )),
                column(2, div(class = "stat-card",
                  div(class = "stat-label", "Avg Daily Income"),
                  div(class = "stat-value", textOutput(ns("perf_salon_avg_daily")))
                ))
              ),
              div(
                class = "admin-card",
                style = "margin-top: var(--space-6);",
                h4("Income Trend - Selected Month"),
                div(
                  style = "height: 320px; position: relative;",
                  tags$canvas(id = ns("perf_salon_chart"), style = "max-height: 320px;")
                )
              ),
              div(
                class = "admin-card",
                style = "margin-top: var(--space-6);",
                h4("Barber Rankings - Selected Month"),
                p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);",
                  "Ranking by earnings with share of total barbershop income and customer count."),
                DT::dataTableOutput(ns("perf_salon_barber_ranking"))
              )
            )
          ),
          
          # Barber view (select a barber, see their monthly performance)
          conditionalPanel(
            condition = "input.perf_view == 'barber'",
            ns = ns,
            div(
              class = "admin-card",
              h3("Barber Monthly Performance"),
              p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);",
                "Select a barber to see their performance for the selected month."),
              fluidRow(
                column(4,
                  selectInput(ns("perf_barber"), "Select Barber",
                             choices = c("Select a barber..." = ""), selected = "")
                )
              ),
              p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-top: var(--space-2); margin-bottom: var(--space-4);",
                textOutput(ns("perf_barber_month_label"))),
              fluidRow(
                column(2, div(class = "stat-card",
                  div(class = "stat-label", "Customers (Services)"),
                  div(class = "stat-value", textOutput(ns("perf_barber_customers")))
                )),
                column(2, div(class = "stat-card",
                  div(class = "stat-label", "Total Earned"),
                  div(class = "stat-value", textOutput(ns("perf_barber_total_earned")))
                )),
                column(2, div(class = "stat-card",
                  div(class = "stat-label", "Avg per Service"),
                  div(class = "stat-value", textOutput(ns("perf_barber_avg_service")))
                )),
                column(2, div(class = "stat-card",
                  div(class = "stat-label", "Days Worked"),
                  div(class = "stat-value", textOutput(ns("perf_barber_days_worked")))
                ))
              ),
              div(
                class = "admin-card",
                style = "margin-top: var(--space-6);",
                h4("Daily Income - Selected Month"),
                div(
                  style = "height: 320px; position: relative;",
                  tags$canvas(id = ns("perf_barber_chart"), style = "max-height: 320px;")
                )
              )
            )
          )
        ),
      
        # User Management Tab
        tabPanel(
          "User Management",
          value = "users",
          div(
            class = "admin-card",
            h3("Manage System Users"),
            div(
              style = "margin-bottom: var(--space-4);",
              actionButton(ns("add_user_btn"), "Add New User", 
                          style = "background: var(--barbazza-gold); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-weight: bold;"),
              actionButton(ns("refresh_users_btn"), "Refresh", 
                          style = "background: var(--barbazza-slate); color: var(--barbazza-cream); border: 1px solid var(--barbazza-gold); padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); margin-left: var(--space-2);"),
              actionButton(ns("recover_advance_btn"), "Recover Advance Balances", 
                          style = "background: var(--barbazza-slate); color: var(--barbazza-cream); border: 1px solid var(--barbazza-gold); padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); margin-left: var(--space-2);",
                          title = "Rebuild balance remaining from monthly salary recruitment deductions")
            ),
            p(style = "font-size: 0.8rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);",
              "If a barber's balance was reset after editing recruitment advance, use Recover to restore amount already paid from monthly closing history."),
            DT::dataTableOutput(ns("users_table"))
          ),
          
        ),
        
        # Service Management Tab
        tabPanel(
          "Service Management",
          value = "services",
          div(
            class = "admin-card",
            h3("Manage Services & Pricing"),
            div(
              style = "margin-bottom: var(--space-4);",
              actionButton(ns("add_service_btn"), "Add New Service", 
                          style = "background: var(--barbazza-gold); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-weight: bold;"),
              actionButton(ns("refresh_services_btn"), "Refresh", 
                          style = "background: var(--barbazza-slate); color: var(--barbazza-cream); border: 1px solid var(--barbazza-gold); padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); margin-left: var(--space-2);")
            ),
            DT::dataTableOutput(ns("services_table"))
          ),
          
        ),
        
        # Expense Categories Tab
        tabPanel(
          "Expense Categories",
          value = "expense_categories",
          div(
            class = "admin-card",
            h3("Manage Expense Categories"),
            div(
              style = "margin-bottom: var(--space-4);",
              actionButton(ns("add_category_btn"), "Add New Category", 
                          style = "background: var(--barbazza-gold); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-weight: bold;"),
              actionButton(ns("refresh_categories_btn"), "Refresh", 
                          style = "background: var(--barbazza-slate); color: var(--barbazza-cream); border: 1px solid var(--barbazza-gold); padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); margin-left: var(--space-2);")
            ),
            DT::dataTableOutput(ns("categories_table"))
          ),
          
        ),
      
        # Reports Tab
        tabPanel(
          "Reports & Analytics",
          value = "reports",
          div(
            class = "admin-card",
            h3("Daily Reports"),
            fluidRow(
              column(3,
                dateInput(ns("report_start_date"), "Start Date", value = Sys.Date() - 30)
              ),
              column(3,
                dateInput(ns("report_end_date"), "End Date", value = Sys.Date())
              ),
              column(3,
                br(),
                actionButton(ns("generate_report_btn"), "Generate Report",
                            style = "background: var(--barbazza-gold); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); width: 100%; font-weight: bold;")
              ),
              column(3,
                br(),
                downloadButton(ns("download_report_btn"), "Download CSV",
                              style = "background: var(--barbazza-slate); color: var(--barbazza-cream); border: 1px solid var(--barbazza-gold); padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); width: 100%;")
              )
            ),
            br(),
            DT::dataTableOutput(ns("reports_table"))
          ),
          
          # Financial Summary
          div(
            class = "admin-card",
            h3("Financial Summary"),
            uiOutput(ns("financial_summary"))
          )
        ),
        
        # Audit Logs Tab
        tabPanel(
          "Audit Logs",
          value = "audit",
          div(
            class = "admin-card",
            h3("System Audit Logs"),
            fluidRow(
              column(3,
                selectInput(ns("log_action_filter"), "Action Type", 
                           choices = c("All" = "", "CREATE", "UPDATE", "DELETE", "LOGIN"),
                           selected = "")
              ),
              column(3,
                dateInput(ns("log_start_date"), "Start Date", value = Sys.Date() - 7)
              ),
              column(3,
                dateInput(ns("log_end_date"), "End Date", value = Sys.Date())
              ),
              column(3,
                br(),
                actionButton(ns("filter_logs_btn"), "Filter Logs",
                            style = "background: var(--barbazza-gold); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); width: 100%; font-weight: bold;")
              )
            ),
            br(),
            DT::dataTableOutput(ns("audit_logs_table"))
          )
        ),
        
        # Settings Tab
        tabPanel(
          "System Settings",
          value = "settings",
          div(
            class = "admin-card",
            h3("Application Settings"),
            fluidRow(
              column(6,
                textInput(ns("shop_name"), "Shop Name", value = "", placeholder = "The Barbazza"),
                textInput(ns("shop_address"), "Shop Address", value = "", placeholder = "Kigali, Rwanda"),
                textInput(ns("shop_phone"), "Shop Phone", value = "", placeholder = "+250 XXX XXX XXX"),
                textInput(ns("shop_email"), "Shop Email", value = "", placeholder = "info@barbazza.rw")
              ),
              column(6,
                textInput(ns("currency"), "Currency", value = "RWF"),
                textInput(ns("timezone"), "Timezone", value = "Africa/Kigali"),
                numericInput(ns("tax_rate"), "Tax Rate (%)", value = 18, min = 0, max = 100),
                numericInput(ns("commission_rate"), "Default Commission Rate (%)", value = 40, min = 0, max = 100)
              )
            ),
            br(),
            actionButton(ns("save_settings_btn"), "Save Settings",
                        style = "background: var(--barbazza-gold); color: white; border: none; padding: var(--space-4) var(--space-6); border-radius: var(--radius-md); font-weight: bold; font-size: var(--text-lg);")
          ),
          
          # Day Locking
          div(
            class = "admin-card",
            h3("Day Locking & Management"),
            p("Lock days to prevent further modifications to transactions and reports."),
            fluidRow(
              column(4,
                dateInput(ns("lock_date"), "Select Date to Lock/Unlock", value = Sys.Date() - 1)
              ),
              column(4,
                br(),
                actionButton(ns("lock_day_btn"), "Lock Day",
                            style = "background: var(--barbazza-error); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); width: 100%; font-weight: bold;")
              ),
              column(4,
                br(),
                actionButton(ns("unlock_day_btn"), "Unlock Day",
                            style = "background: var(--barbazza-success); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); width: 100%; font-weight: bold;")
              )
            ),
            br(),
            h4("Locked Days"),
            DT::dataTableOutput(ns("locked_days_table"))
          )
        ),
        
        # Daily Records Tab
        tabPanel(
          "Daily Records",
          value = "daily_records",
          
          div(
            class = "admin-card",
            h3("View Specific Day Records"),
            p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);", 
              "Select any day from this month to view detailed system records"),
            div(
              style = "max-width: 300px; margin-bottom: var(--space-6);",
              dateInput(ns("admin_records_date"), "Select Date:", 
                       value = Sys.Date(),
                       min = as.Date(format(Sys.Date(), "%Y-%m-01")),
                       max = Sys.Date(),
                       format = "yyyy-mm-dd")
            ),
            
            # Daily Summary for Selected Date
            div(
              style = "margin-bottom: var(--space-6);",
              h4("System Summary for Selected Day"),
              fluidRow(
                column(3, div(class = "stat-card",
                  div(class = "stat-label", "Total Income"),
                  div(class = "stat-value", textOutput(ns("admin_records_income")))
                )),
                column(3, div(class = "stat-card",
                  div(class = "stat-label", "Total Customers"),
                  div(class = "stat-value", textOutput(ns("admin_records_customers")))
                )),
                column(3, div(class = "stat-card",
                  div(class = "stat-label", "Total Expenses"),
                  div(class = "stat-value", textOutput(ns("admin_records_expenses")))
                )),
                column(3, div(class = "stat-card",
                  div(class = "stat-label", "Net Profit"),
                  div(class = "stat-value", style = "color: var(--barbazza-gold);", textOutput(ns("admin_records_profit")))
                ))
              )
            )
          ),
          
          # Transactions for Selected Date
          div(
            class = "admin-card",
            h4("All Transactions"),
            DT::dataTableOutput(ns("admin_records_transactions_table"))
          ),
          
          # Barber Performance for Selected Date
          div(
            class = "admin-card",
            h4("Barber Performance"),
            DT::dataTableOutput(ns("admin_records_barber_performance"))
          ),
          
          # Expenses for Selected Date
          div(
            class = "admin-card",
            h4("All Expenses"),
            DT::dataTableOutput(ns("admin_records_expenses_table"))
          )
        )
      )
    )
  )
}

# Admin Server
admin_server <- function(id, session_data) {
  moduleServer(id, function(input, output, session) {
    
    ns <- session$ns
    
    # Reactive values for data refresh
    rv <- reactiveValues(
      refresh_users = 0,
      refresh_services = 0,
      refresh_categories = 0,
      edit_user_id = NULL,
      edit_service_id = NULL,
      delete_service_id = NULL,
      edit_category_id = NULL,
      current_credit_id = NULL
    )
    
    # ===== DASHBOARD STATISTICS =====
    
    load_dashboard_stats <- function() {
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Total users
      total_users <- tryCatch({
        dbGetQuery(con, "SELECT COUNT(*) as count FROM users")$count
      }, error = function(e) 0)
      
      # Active barbers
      active_barbers <- tryCatch({
        dbGetQuery(con, "SELECT COUNT(*) as count FROM barbers WHERE is_active = TRUE")$count
      }, error = function(e) 0)
      
      # Today's income
      today_income <- tryCatch({
        dbGetQuery(con, "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE transaction_date = CURRENT_DATE")$total
      }, error = function(e) 0)
      
      # Today's customers
      today_customers <- tryCatch({
        dbGetQuery(con, "SELECT COUNT(*) as count FROM transactions WHERE transaction_date = CURRENT_DATE")$count
      }, error = function(e) 0)
      
      # Week stats
      week_income <- tryCatch({
        dbGetQuery(con, "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days'")$total
      }, error = function(e) 0)
      
      week_customers <- tryCatch({
        dbGetQuery(con, "SELECT COUNT(*) as count FROM transactions WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days'")$count
      }, error = function(e) 0)
      
      week_expenses <- tryCatch({
        dbGetQuery(con, "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE expense_date >= CURRENT_DATE - INTERVAL '7 days'")$total
      }, error = function(e) 0)
      
      week_profit <- week_income - week_expenses
      
      return(list(
        total_users = total_users,
        active_barbers = active_barbers,
        today_income = today_income,
        today_customers = today_customers,
        week_income = week_income,
        week_customers = week_customers,
        week_expenses = week_expenses,
        week_profit = week_profit
      ))
    }
    
    # Load monthly statistics
    load_monthly_stats <- function() {
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Current month date range
      current_month_start <- as.Date(format(Sys.Date(), "%Y-%m-01"))
      
      # Monthly income
      month_income <- tryCatch({
        dbGetQuery(con, "
          SELECT COALESCE(SUM(amount), 0) as total
          FROM transactions
          WHERE transaction_date >= $1
          AND transaction_date < $1 + INTERVAL '1 month'
        ", params = list(current_month_start))$total
      }, error = function(e) 0)
      
      # Monthly customers
      month_customers <- tryCatch({
        dbGetQuery(con, "
          SELECT COUNT(*) as count
          FROM transactions
          WHERE transaction_date >= $1
          AND transaction_date < $1 + INTERVAL '1 month'
        ", params = list(current_month_start))$count
      }, error = function(e) 0)
      
      month_customers <- as.integer(as.numeric(month_customers))
      
      # Monthly services
      month_services <- tryCatch({
        dbGetQuery(con, "
          SELECT COUNT(*) as count
          FROM transactions
          WHERE transaction_date >= $1
          AND transaction_date < $1 + INTERVAL '1 month'
        ", params = list(current_month_start))$count
      }, error = function(e) 0)
      
      month_services <- as.integer(as.numeric(month_services))
      
      # Monthly expenses
      month_expenses <- tryCatch({
        dbGetQuery(con, "
          SELECT COALESCE(SUM(amount), 0) as total
          FROM expenses
          WHERE expense_date >= $1
          AND expense_date < $1 + INTERVAL '1 month'
        ", params = list(current_month_start))$total
      }, error = function(e) 0)
      
      # Calculate profit
      month_profit <- month_income - month_expenses
      
      # Calculate average daily income
      days_worked <- tryCatch({
        dbGetQuery(con, "
          SELECT COUNT(DISTINCT transaction_date) as days
          FROM transactions
          WHERE transaction_date >= $1
          AND transaction_date < $1 + INTERVAL '1 month'
        ", params = list(current_month_start))$days
      }, error = function(e) 0)
      
      days_count <- if(days_worked > 0) as.integer(days_worked) else 1
      month_avg_daily <- month_income / days_count
      
      return(list(
        month_income = month_income,
        month_customers = month_customers,
        month_services = month_services,
        month_expenses = month_expenses,
        month_profit = month_profit,
        month_avg_daily = month_avg_daily
      ))
    }
    
    # Dashboard outputs - refresh only on demand
    stats <- reactive({
      # Trigger refresh when any data changes
      rv$refresh_users
      rv$refresh_services
      rv$refresh_categories
      
      load_dashboard_stats()
    })
    
    # Monthly stats reactive
    monthly_stats <- reactive({
      rv$refresh_users
      rv$refresh_services
      rv$refresh_categories
      
      load_monthly_stats()
    })
    
    output$total_users <- renderText({ as.character(stats()$total_users) })
    output$active_barbers <- renderText({ as.character(stats()$active_barbers) })
    output$today_income <- renderText({ format_currency(stats()$today_income) })
    output$today_customers <- renderText({ as.character(stats()$today_customers) })
    output$week_income <- renderText({ format_currency(stats()$week_income) })
    output$week_customers <- renderText({ as.character(stats()$week_customers) })
    output$week_expenses <- renderText({ format_currency(stats()$week_expenses) })
    output$week_profit <- renderText({ format_currency(stats()$week_profit) })
    
    # Monthly stats outputs
    output$month_income <- renderText({ format_currency(monthly_stats()$month_income) })
    output$month_customers <- renderText({ as.character(monthly_stats()$month_customers) })
    output$month_services <- renderText({ as.character(monthly_stats()$month_services) })
    output$month_expenses <- renderText({ format_currency(monthly_stats()$month_expenses) })
    output$month_profit <- renderText({ format_currency(monthly_stats()$month_profit) })
    output$month_avg_daily <- renderText({ format_currency(monthly_stats()$month_avg_daily) })
    
    # Income trend chart for admin
    observe({
      rv$refresh_users  # React to data changes
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Get current month's date range
      current_month_start <- as.Date(format(Sys.Date(), "%Y-%m-01"))
      current_month_end <- as.Date(format(Sys.Date() + 32, "%Y-%m-01")) - 1
      
      # Get daily total income for the current month (all barbers)
      daily_income <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            transaction_date,
            COALESCE(SUM(amount), 0) as daily_total
          FROM transactions
          WHERE transaction_date >= $1
          AND transaction_date <= $2
          GROUP BY transaction_date
          ORDER BY transaction_date
        ", params = list(current_month_start, current_month_end))
      }, error = function(e) {
        data.frame(transaction_date = character(), daily_total = numeric())
      })
      
      # Create a complete date sequence for the month
      all_dates <- seq(current_month_start, current_month_end, by = "day")
      
      # Merge with actual data (fill missing days with 0)
      complete_data <- data.frame(date = all_dates)
      if (nrow(daily_income) > 0) {
        daily_income$transaction_date <- as.Date(daily_income$transaction_date)
        complete_data <- merge(complete_data, daily_income, 
                              by.x = "date", by.y = "transaction_date", 
                              all.x = TRUE)
        complete_data$daily_total[is.na(complete_data$daily_total)] <- 0
      } else {
        complete_data$daily_total <- 0
      }
      
      # Format dates for display
      complete_data$label <- format(complete_data$date, "%b %d")
      
      # Prepare data for Chart.js
      labels_json <- jsonlite::toJSON(complete_data$label)
      values_json <- jsonlite::toJSON(complete_data$daily_total)
      
      # Generate Chart.js code
      chart_js <- sprintf("
        var ctx = document.getElementById('%s');
        if (ctx) {
          // Destroy existing chart if it exists
          if (window.adminIncomeChart) {
            window.adminIncomeChart.destroy();
          }
          
          ctx = ctx.getContext('2d');
          window.adminIncomeChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: %s,
              datasets: [{
                label: 'Daily Income',
                data: %s,
                borderColor: '#0a0a0a',
                backgroundColor: 'rgba(10, 10, 10, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: '#0a0a0a',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return 'Income: ' + context.parsed.y.toLocaleString() + ' RWF';
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return value.toLocaleString() + ' RWF';
                    }
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              }
            }
          });
        }
      ", session$ns("income_chart"), labels_json, values_json)
      
      # Execute JavaScript
      shinyjs::runjs(chart_js)
    })
    
    # Top barbers this month - refresh on user changes (includes barbers)
    output$top_barbers <- DT::renderDataTable({
      rv$refresh_users  # Trigger refresh when users/barbers change
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      top_barbers <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            b.full_name as \"Barber\",
            COUNT(t.transaction_id) as \"Services\",
            SUM(t.amount) as \"Total Income\",
            ROUND(AVG(t.amount), 2) as \"Avg Service\"
          FROM barbers b
          LEFT JOIN transactions t ON b.barber_id = t.barber_id 
            AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
          WHERE b.is_active = TRUE
          GROUP BY b.barber_id, b.full_name
          ORDER BY SUM(t.amount) DESC NULLS LAST
          LIMIT 10
        ")
      }, error = function(e) {
        data.frame(Barber = character(), Services = integer(), 
                  "Total Income" = numeric(), "Avg Service" = numeric())
      })
      
      if (nrow(top_barbers) > 0) {
        top_barbers$`Total Income` <- sapply(top_barbers$`Total Income`, function(x) {
          if (is.na(x)) "RWF 0.00" else format_currency(x)
        })
        top_barbers$`Avg Service` <- sapply(top_barbers$`Avg Service`, function(x) {
          if (is.na(x)) "RWF 0.00" else format_currency(x)
        })
      }
      
      DT::datatable(
        top_barbers,
        options = list(
          pageLength = 10,
          scrollX = TRUE,
          dom = 't'
        ),
        rownames = FALSE
      )
    })
    
    # Recent activity - refresh on any action
    output$recent_activity <- DT::renderDataTable({
      rv$refresh_users
      rv$refresh_services
      rv$refresh_categories
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      activity <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            action_type as \"Action\",
            table_name as \"Table\",
            TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as \"Timestamp\"
          FROM audit_logs
          ORDER BY created_at DESC
          LIMIT 20
        ")
      }, error = function(e) {
        data.frame(Action = character(), Table = character(), Timestamp = character())
      })
      
      DT::datatable(
        activity,
        options = list(
          pageLength = 10,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE
      )
    })
    
    # ===== PERFORMANCE DASHBOARD (Monthly analytics) =====
    
    # Selected month as first day (for queries) - fallback to current month so data always shows
    selected_perf_month <- reactive({
      month_val <- input$perf_month
      if (is.null(month_val) || month_val == "") {
        return(as.Date(format(Sys.Date(), "%Y-%m-01")))
      }
      as.Date(paste0(month_val, "-01"))
    })
    
    # Barbershop (salon) stats for selected month
    load_perf_salon_stats <- function(month_start) {
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      month_end <- as.Date(format(month_start + 32, "%Y-%m-01")) - 1
      
      customers <- tryCatch({
        dbGetQuery(con, "
          SELECT COUNT(*) as count FROM transactions
          WHERE transaction_date >= $1 AND transaction_date <= $2
        ", params = list(month_start, month_end))$count
      }, error = function(e) 0)
      customers <- as.integer(as.numeric(customers))
      
      income <- tryCatch({
        dbGetQuery(con, "
          SELECT COALESCE(SUM(amount), 0) as total FROM transactions
          WHERE transaction_date >= $1 AND transaction_date <= $2
        ", params = list(month_start, month_end))$total
      }, error = function(e) 0)
      
      expenses <- tryCatch({
        dbGetQuery(con, "
          SELECT COALESCE(SUM(amount), 0) as total FROM expenses
          WHERE expense_date >= $1 AND expense_date <= $2
        ", params = list(month_start, month_end))$total
      }, error = function(e) 0)
      
      profit <- income - expenses
      days_worked <- tryCatch({
        dbGetQuery(con, "
          SELECT COUNT(DISTINCT transaction_date) as days FROM transactions
          WHERE transaction_date >= $1 AND transaction_date <= $2
        ", params = list(month_start, month_end))$days
      }, error = function(e) 0)
      days_count <- max(1, as.integer(days_worked))
      avg_daily <- income / days_count
      
      list(
        customers = customers,
        income = income,
        expenses = expenses,
        profit = profit,
        days_worked = as.integer(days_worked),
        avg_daily = avg_daily
      )
    }
    
    perf_salon_stats <- reactive({
      load_perf_salon_stats(selected_perf_month())
    })
    
    output$perf_salon_month_label <- renderText({
      paste("Performance for", format(selected_perf_month(), "%B %Y"))
    })
    output$perf_salon_customers <- renderText({ as.character(perf_salon_stats()$customers) })
    output$perf_salon_income <- renderText({ format_currency(perf_salon_stats()$income) })
    output$perf_salon_expenses <- renderText({ format_currency(perf_salon_stats()$expenses) })
    output$perf_salon_profit <- renderText({ format_currency(perf_salon_stats()$profit) })
    output$perf_salon_days <- renderText({ as.character(perf_salon_stats()$days_worked) })
    output$perf_salon_avg_daily <- renderText({ format_currency(perf_salon_stats()$avg_daily) })
    
    # Barber rankings for Barbershop view (earnings, % of total income, customers)
    perf_salon_barber_ranking_data <- reactive({
      month_start <- selected_perf_month()
      month_end <- as.Date(format(month_start + 32, "%Y-%m-01")) - 1
      salon_income <- perf_salon_stats()$income
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      ranking <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            b.barber_id,
            b.barber_code,
            u.full_name,
            COUNT(t.transaction_id) as services_count,
            COALESCE(SUM(t.amount), 0) as total_earned
          FROM barbers b
          LEFT JOIN users u ON b.user_id = u.user_id
          LEFT JOIN transactions t ON b.barber_id = t.barber_id
            AND t.transaction_date >= $1 AND t.transaction_date <= $2
          WHERE b.is_active = TRUE
          GROUP BY b.barber_id, b.barber_code, u.full_name
          ORDER BY total_earned DESC NULLS LAST
        ", params = list(month_start, month_end))
      }, error = function(e) {
        data.frame(barber_id = integer(), barber_code = character(), full_name = character(),
                   services_count = integer(), total_earned = numeric())
      })
      if (nrow(ranking) == 0) {
        return(data.frame(Rank = integer(), Barber = character(), "Total Earned" = character(),
                          "% of Total Income" = character(), Customers = integer(), check.names = FALSE))
      }
      ranking$services_count <- as.integer(as.numeric(ranking$services_count))
      ranking$rank <- seq_len(nrow(ranking))
      total <- max(1e-10, as.numeric(salon_income))
      pct <- round(100 * as.numeric(ranking$total_earned) / total, 1)
      data.frame(
        Rank = ranking$rank,
        Barber = ifelse(is.na(ranking$full_name) | ranking$full_name == "", ranking$barber_code, ranking$full_name),
        "Total Earned" = sapply(ranking$total_earned, format_currency),
        "% of Total Income" = paste0(pct, "%"),
        Customers = ranking$services_count,
        check.names = FALSE
      )
    })
    
    output$perf_salon_barber_ranking <- DT::renderDataTable({
      DT::datatable(
        perf_salon_barber_ranking_data(),
        options = list(pageLength = 15, scrollX = TRUE, dom = 'tp'),
        rownames = FALSE
      )
    })
    
    # Load barbers list for Performance Dashboard barber selector
    load_perf_barbers <- function() {
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      barbers <- tryCatch({
        dbGetQuery(con, "
          SELECT b.barber_id, b.barber_code, u.full_name
          FROM barbers b
          LEFT JOIN users u ON b.user_id = u.user_id
          WHERE b.is_active = TRUE
          ORDER BY b.barber_code
        ")
      }, error = function(e) {
        data.frame(barber_id = integer(), barber_code = character(), full_name = character())
      })
      if (nrow(barbers) == 0) {
        return(c("No active barbers" = ""))
      }
      labels <- ifelse(is.na(barbers$full_name) | barbers$full_name == "",
                       barbers$barber_code,
                       paste0(barbers$full_name, " (", barbers$barber_code, ")"))
      setNames(as.character(barbers$barber_id), labels)
    }
    
    observe({
      input$perf_view  # re-run when user switches to Barber view so dropdown exists in DOM
      barber_choices <- load_perf_barbers()
      current <- isolate(input$perf_barber)
      keep <- !is.null(current) && current != "" && current %in% barber_choices
      updateSelectInput(session, "perf_barber", choices = barber_choices,
                       selected = if (keep) current else "")
    })
    
    # Single barber's monthly performance (when a barber is selected)
    perf_barber_stats <- reactive({
      barber_id <- input$perf_barber
      if (is.null(barber_id) || barber_id == "") {
        return(list(customers = 0L, total_earned = 0, avg_per_service = 0, days_worked = 0L, barber_name = ""))
      }
      month_start <- selected_perf_month()
      month_end <- as.Date(format(month_start + 32, "%Y-%m-01")) - 1
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      barber_id <- as.integer(barber_id)
      res <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            u.full_name,
            b.barber_code,
            COUNT(t.transaction_id) as services_count,
            COALESCE(SUM(t.amount), 0) as total_earned,
            ROUND(AVG(t.amount), 2) as avg_per_service,
            COUNT(DISTINCT t.transaction_date) as days_worked
          FROM barbers b
          LEFT JOIN users u ON b.user_id = u.user_id
          LEFT JOIN transactions t ON b.barber_id = t.barber_id
            AND t.transaction_date >= $1 AND t.transaction_date <= $2
          WHERE b.barber_id = $3
          GROUP BY b.barber_id, b.barber_code, u.full_name
        ", params = list(month_start, month_end, barber_id))
      }, error = function(e) {
        data.frame(full_name = character(), barber_code = character(),
                   services_count = integer(0), total_earned = 0, avg_per_service = 0, days_worked = 0)
      })
      if (nrow(res) == 0) {
        return(list(customers = 0L, total_earned = 0, avg_per_service = 0, days_worked = 0L, barber_name = "Unknown"))
      }
      name <- if (is.na(res$full_name) || res$full_name == "") res$barber_code else res$full_name
      list(
        customers = as.integer(res$services_count),
        total_earned = as.numeric(res$total_earned),
        avg_per_service = as.numeric(if (is.na(res$avg_per_service)) 0 else res$avg_per_service),
        days_worked = as.integer(res$days_worked),
        barber_name = name
      )
    })
    
    output$perf_barber_month_label <- renderText({
      bn <- perf_barber_stats()$barber_name
      if (bn == "" || bn == "Unknown") {
        return(paste("Select a barber to see performance for", format(selected_perf_month(), "%B %Y")))
      }
      paste("Performance for", bn, "-", format(selected_perf_month(), "%B %Y"))
    })
    output$perf_barber_customers <- renderText({ as.character(perf_barber_stats()$customers) })
    output$perf_barber_total_earned <- renderText({ format_currency(perf_barber_stats()$total_earned) })
    output$perf_barber_avg_service <- renderText({ format_currency(perf_barber_stats()$avg_per_service) })
    output$perf_barber_days_worked <- renderText({ as.character(perf_barber_stats()$days_worked) })
    
    # Salon income trend chart (selected month)
    observe({
      req(input$perf_view == "salon", selected_perf_month())
      month_start <- selected_perf_month()
      month_end <- as.Date(format(month_start + 32, "%Y-%m-01")) - 1
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      daily_income <- tryCatch({
        dbGetQuery(con, "
          SELECT transaction_date, COALESCE(SUM(amount), 0) as daily_total
          FROM transactions
          WHERE transaction_date >= $1 AND transaction_date <= $2
          GROUP BY transaction_date
          ORDER BY transaction_date
        ", params = list(month_start, month_end))
      }, error = function(e) data.frame(transaction_date = character(), daily_total = numeric()))
      
      all_dates <- seq(month_start, month_end, by = "day")
      complete_data <- data.frame(date = all_dates)
      if (nrow(daily_income) > 0) {
        daily_income$transaction_date <- as.Date(daily_income$transaction_date)
        complete_data <- merge(complete_data, daily_income,
                              by.x = "date", by.y = "transaction_date",
                              all.x = TRUE)
        complete_data$daily_total[is.na(complete_data$daily_total)] <- 0
      } else {
        complete_data$daily_total <- 0
      }
      complete_data$label <- format(complete_data$date, "%b %d")
      labels_json <- jsonlite::toJSON(complete_data$label)
      values_json <- jsonlite::toJSON(complete_data$daily_total)
      
      chart_js <- sprintf("
        var ctx = document.getElementById('%s');
        if (ctx) {
          if (window.perfSalonChart) { window.perfSalonChart.destroy(); }
          ctx = ctx.getContext('2d');
          window.perfSalonChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: %s,
              datasets: [{
                label: 'Daily Income',
                data: %s,
                borderColor: '#0a0a0a',
                backgroundColor: 'rgba(10, 10, 10, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(ctx) { return 'Income: ' + ctx.parsed.y.toLocaleString() + ' RWF'; }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { callback: function(v) { return v.toLocaleString() + ' RWF'; } },
                  grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                  grid: { display: false },
                  ticks: { maxRotation: 45, minRotation: 45 }
                }
              }
            }
          });
        }
      ", session$ns("perf_salon_chart"), labels_json, values_json)
      shinyjs::runjs(chart_js)
    })
    
    # Barber daily income line chart (selected barber, selected month)
    observe({
      req(input$perf_view == "barber", selected_perf_month())
      barber_id <- input$perf_barber
      if (is.null(barber_id) || barber_id == "") return()
      
      month_start <- selected_perf_month()
      month_end <- as.Date(format(month_start + 32, "%Y-%m-01")) - 1
      barber_id <- as.integer(barber_id)
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      daily_income <- tryCatch({
        dbGetQuery(con, "
          SELECT transaction_date, COALESCE(SUM(amount), 0) as daily_total
          FROM transactions
          WHERE barber_id = $1
            AND transaction_date >= $2 AND transaction_date <= $3
          GROUP BY transaction_date
          ORDER BY transaction_date
        ", params = list(barber_id, month_start, month_end))
      }, error = function(e) data.frame(transaction_date = character(), daily_total = numeric()))
      
      all_dates <- seq(month_start, month_end, by = "day")
      complete_data <- data.frame(date = all_dates)
      if (nrow(daily_income) > 0) {
        daily_income$transaction_date <- as.Date(daily_income$transaction_date)
        complete_data <- merge(complete_data, daily_income,
                              by.x = "date", by.y = "transaction_date",
                              all.x = TRUE)
        complete_data$daily_total[is.na(complete_data$daily_total)] <- 0
      } else {
        complete_data$daily_total <- 0
      }
      complete_data$label <- format(complete_data$date, "%b %d")
      labels_json <- jsonlite::toJSON(complete_data$label)
      values_json <- jsonlite::toJSON(complete_data$daily_total)
      
      chart_js <- sprintf("
        var ctx = document.getElementById('%s');
        if (ctx) {
          if (window.perfBarberChart) { window.perfBarberChart.destroy(); }
          ctx = ctx.getContext('2d');
          window.perfBarberChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: %s,
              datasets: [{
                label: 'Daily Income',
                data: %s,
                borderColor: '#0a0a0a',
                backgroundColor: 'rgba(10, 10, 10, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(ctx) { return 'Income: ' + ctx.parsed.y.toLocaleString() + ' RWF'; }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { callback: function(v) { return v.toLocaleString() + ' RWF'; } },
                  grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                  grid: { display: false },
                  ticks: { maxRotation: 45, minRotation: 45 }
                }
              }
            }
          });
        }
      ", session$ns("perf_barber_chart"), labels_json, values_json)
      shinyjs::runjs(chart_js)
    })
    
    # ===== USER MANAGEMENT =====
    
    # Users table with refresh (role-aware)
    output$users_table <- DT::renderDataTable({
      rv$refresh_users  # Trigger refresh
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      users <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            u.user_id,
            u.username,
            u.full_name,
            u.role,
            u.email,
            u.phone,
            CASE WHEN u.is_active THEN 'Active' ELSE 'Inactive' END as status,
            u.is_active,
            TO_CHAR(u.created_at, 'YYYY-MM-DD') as created,
            b.barber_code,
            COALESCE(b.commission_rate, 0) as commission_rate,
            COALESCE(b.recruitment_advance, 0) as recruitment_advance,
            COALESCE(b.advance_remaining, 0) as advance_remaining
          FROM users u
          LEFT JOIN barbers b ON u.user_id = b.user_id
          ORDER BY u.created_at DESC
        ")
      }, error = function(e) {
        data.frame(user_id = integer(), username = character(), full_name = character(),
                  role = character(), email = character(), phone = character(),
                  status = character(), is_active = logical(), created = character(),
                  barber_code = character(), commission_rate = numeric(),
                  recruitment_advance = numeric(), advance_remaining = numeric())
      })
      
      if (nrow(users) > 0) {
        # Add action buttons
        users$Actions <- sprintf(
          '<button class="btn-action-edit" onclick="Shiny.setInputValue(\'%s\', %d, {priority: \'event\'})">Edit</button>
           <button class="btn-action-delete" onclick="Shiny.setInputValue(\'%s\', %d, {priority: \'event\'})">Delete</button>',
          ns("edit_user_action"), users$user_id,
          ns("delete_user_action"), users$user_id
        )
        
        # Create role-aware display with conditional columns
        users_display <- data.frame(
          ID = users$user_id,
          Username = users$username,
          "Full Name" = users$full_name,
          Role = users$role,
          Email = ifelse(is.na(users$email), "", users$email),
          Phone = ifelse(is.na(users$phone), "", users$phone),
          Status = users$status,
          "Barber Code" = ifelse(users$role == "barber" & !is.na(users$barber_code), users$barber_code, ""),
          "Commission %" = ifelse(users$role == "barber", users$commission_rate, ""),
          "Recruitment Advance" = ifelse(users$role == "barber", format_currency(users$recruitment_advance), ""),
          "Balance Remaining" = ifelse(users$role == "barber", format_currency(users$advance_remaining), ""),
          Created = users$created,
          Actions = users$Actions,
          check.names = FALSE,
          stringsAsFactors = FALSE
        )
      } else {
        users_display <- data.frame(
          ID = integer(), Username = character(), "Full Name" = character(),
          Role = character(), Email = character(), Phone = character(),
          Status = character(), "Barber Code" = character(),
          "Commission %" = character(), "Recruitment Advance" = character(),
          "Balance Remaining" = character(), Created = character(), Actions = character(),
          check.names = FALSE,
          stringsAsFactors = FALSE
        )
      }
      
      DT::datatable(
        users_display,
        options = list(
          pageLength = 15,
          scrollX = TRUE,
          dom = 'Bfrtip',
          buttons = c('copy', 'csv', 'excel'),
          columnDefs = list(
            list(targets = c(7, 8, 9, 10), visible = TRUE)  # Show barber columns
          )
        ),
        rownames = FALSE,
        escape = FALSE,  # Allow HTML in Actions column
        selection = 'none'
      )
    })
    
    # Add user button
    observeEvent(input$add_user_btn, {
      rv$edit_user_id <- NULL
      
      showModal(
        modalDialog(
          title = "Add New User",
          size = "m",
          
          h4("Basic Information"),
          textInput(session$ns("user_username"), "Username *", value = "", placeholder = "e.g., john.doe"),
          textInput(session$ns("user_fullname"), "Full Name *", value = "", placeholder = "e.g., John Doe"),
          textInput(session$ns("user_email"), "Email", value = "", placeholder = "e.g., john@barbazza.rw"),
          textInput(session$ns("user_phone"), "Phone", value = "", placeholder = "e.g., +250 XXX XXX XXX"),
          selectInput(session$ns("user_role"), "Role *", 
                     choices = c("admin", "manager", "supervisor", "barber"),
                     selected = "manager"),
          passwordInput(session$ns("user_password"), "Password *", value = "", placeholder = "Minimum 6 characters"),
          checkboxInput(session$ns("user_active"), "Active", value = TRUE),
          
          # Barber-specific fields (hidden by default)
          div(
            id = session$ns("barber_fields_container"),
            style = "display: none; margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--barbazza-graphite);",
            h4("Barber-Specific Information"),
            p(style = "font-size: 0.8rem; color: var(--barbazza-graphite);", 
              "These fields are specific to barbers and affect their commission and advances."),
            numericInput(session$ns("user_commission"), "Commission Rate (%)", 
                        value = 40, min = 0, max = 100, step = 5),
            hr(),
            h5("Recruitment Advance (Optional)"),
            p(style = "font-size: 0.75rem; color: var(--barbazza-graphite);", 
              "If this barber received an advance during recruitment, enter the details below."),
            numericInput(session$ns("user_recruitment_advance"), "Recruitment Advance Amount (RWF)", 
                        value = 0, min = 0, step = 1000),
            numericInput(session$ns("user_monthly_deduction"), "Monthly Deduction (RWF)", 
                        value = 0, min = 0, step = 1000)
          ),
          
          footer = tagList(
            modalButton("Cancel"),
            actionButton(session$ns("save_user_btn"), "Save User", 
                        style = "background: var(--barbazza-gold); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-weight: bold;")
          )
        )
      )
    })
    
    # Show/hide barber-specific fields based on role selection
    observeEvent(input$user_role, {
      if (!is.null(input$user_role) && input$user_role == "barber") {
        shinyjs::show("barber_fields_container")
      } else {
        shinyjs::hide("barber_fields_container")
      }
    })
    
    # Edit user button (from table action)
    observeEvent(input$edit_user_action, {
      user_id <- input$edit_user_action
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      user_data <- tryCatch({
        dbGetQuery(con, "SELECT * FROM users WHERE user_id = $1", params = list(user_id))
      }, error = function(e) NULL)
      
      # Load barber-specific data if user is a barber
      barber_data <- NULL
      if (!is.null(user_data) && nrow(user_data) > 0 && user_data$role == "barber") {
        barber_data <- tryCatch({
          dbGetQuery(con, "
            SELECT commission_rate, recruitment_advance, advance_monthly_deduction, advance_remaining
            FROM barbers 
            WHERE user_id = $1
          ", params = list(user_id))
        }, error = function(e) NULL)
      }
      
      if (!is.null(user_data) && nrow(user_data) > 0) {
        rv$edit_user_id <- user_id
        
        # Determine if barber fields should be shown
        show_barber_fields <- user_data$role == "barber"
        
        showModal(
          modalDialog(
            title = paste("Edit User:", user_data$username),
            size = "m",
            
            h4("Basic Information"),
            p(style = "color: var(--barbazza-gold); font-weight: bold;", 
              paste("User ID:", user_id)),
            textInput(session$ns("user_username"), "Username *", 
                     value = user_data$username, 
                     placeholder = "Username cannot be changed"),
            textInput(session$ns("user_fullname"), "Full Name *", 
                     value = user_data$full_name),
            textInput(session$ns("user_email"), "Email", 
                     value = ifelse(is.na(user_data$email), "", user_data$email)),
            textInput(session$ns("user_phone"), "Phone", 
                     value = ifelse(is.na(user_data$phone), "", user_data$phone)),
            selectInput(session$ns("user_role"), "Role *", 
                       choices = c("admin", "manager", "supervisor", "barber"),
                       selected = user_data$role),
            checkboxInput(session$ns("user_active"), "Active", 
                         value = user_data$is_active),
            hr(),
            p(style = "color: var(--barbazza-cream); font-size: var(--text-sm);", 
              "Note: Leave password fields empty to keep current password"),
            passwordInput(session$ns("user_new_password"), "New Password (optional)", value = ""),
            passwordInput(session$ns("user_confirm_password"), "Confirm New Password", value = ""),
            
            # Barber-specific fields
            div(
              id = session$ns("barber_fields_container"),
              style = if(show_barber_fields) "margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--barbazza-graphite);" else "display: none;",
              h4("Barber-Specific Information"),
              numericInput(session$ns("user_commission"), "Commission Rate (%)", 
                          value = if(!is.null(barber_data) && nrow(barber_data) > 0) barber_data$commission_rate else 40,
                          min = 0, max = 100, step = 5),
              hr(),
              h5("Recruitment Advance"),
              p(style = "font-size: 0.75rem; color: var(--barbazza-graphite);", 
                if(!is.null(barber_data) && nrow(barber_data) > 0) {
                  paid <- max(0, as.numeric(barber_data$recruitment_advance) - as.numeric(barber_data$advance_remaining))
                  paste0(
                    "Balance remaining: ", format_currency(barber_data$advance_remaining),
                    " | Already paid: ", format_currency(paid),
                    ". Changing the advance amount keeps the amount already paid."
                  )
                } else "No recruitment advance set"),
              numericInput(session$ns("user_recruitment_advance"), "Recruitment Advance Amount (RWF)", 
                          value = if(!is.null(barber_data) && nrow(barber_data) > 0) barber_data$recruitment_advance else 0,
                          min = 0, step = 1000),
              numericInput(session$ns("user_monthly_deduction"), "Monthly Deduction (RWF)", 
                          value = if(!is.null(barber_data) && nrow(barber_data) > 0) barber_data$advance_monthly_deduction else 0,
                          min = 0, step = 1000)
            ),
            
            footer = tagList(
              modalButton("Cancel"),
              actionButton(ns("save_user_btn"), "Update User", 
                          style = "background: var(--barbazza-gold); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-weight: bold;")
            )
          )
        )
      }
    })
    
    # Delete user button (from table action)
    observeEvent(input$delete_user_action, {
      user_id <- input$delete_user_action
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      user_data <- tryCatch({
        dbGetQuery(con, "SELECT username, full_name FROM users WHERE user_id = $1", params = list(user_id))
      }, error = function(e) NULL)
      
      if (!is.null(user_data) && nrow(user_data) > 0) {
        showModal(
          modalDialog(
            title = "Confirm Delete User",
            size = "m",
            
            div(
              style = "padding: var(--space-4);",
              h4(style = "color: var(--barbazza-error);", "Warning: This action cannot be undone!"),
              p("Are you sure you want to delete this user?"),
              p(style = "font-weight: bold;", paste("Username:", user_data$username)),
              p(style = "font-weight: bold;", paste("Full Name:", user_data$full_name)),
              p(style = "font-weight: bold;", paste("User ID:", user_id)),
              br(),
              p(style = "color: var(--barbazza-cream); font-size: var(--text-sm);", 
                "Recommendation: Consider deactivating the user instead of deleting.")
            ),
            
            footer = tagList(
              modalButton("Cancel"),
              actionButton(ns("confirm_delete_user"), "Delete User", 
                          `data-user-id` = user_id,
                          style = "background: var(--barbazza-error); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-weight: bold;")
            )
          )
        )
      }
    })
    
    # Manual refresh buttons
    observeEvent(input$refresh_users_btn, {
      rv$refresh_users <- rv$refresh_users + 1
      showNotification("Users table refreshed", type = "message", duration = 2)
    })
    
    # Recover advance_remaining from monthly_salaries recruitment deductions
    observeEvent(input$recover_advance_btn, {
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        report <- dbGetQuery(con, "
          SELECT 
            b.barber_id,
            b.barber_code,
            COALESCE(b.recruitment_advance, 0) as recruitment_advance,
            COALESCE(b.advance_remaining, 0) as current_remaining,
            COALESCE(SUM(ms.recruitment_deduction), 0) as total_paid_from_salaries,
            GREATEST(
              0,
              COALESCE(b.recruitment_advance, 0) - COALESCE(SUM(ms.recruitment_deduction), 0)
            ) as correct_remaining
          FROM barbers b
          LEFT JOIN monthly_salaries ms ON b.barber_id = ms.barber_id
          WHERE COALESCE(b.recruitment_advance, 0) > 0
             OR COALESCE(b.advance_remaining, 0) > 0
             OR EXISTS (
               SELECT 1 FROM monthly_salaries ms2
               WHERE ms2.barber_id = b.barber_id
                 AND COALESCE(ms2.recruitment_deduction, 0) > 0
             )
          GROUP BY b.barber_id, b.barber_code, b.recruitment_advance, b.advance_remaining
        ")
        
        if (nrow(report) == 0) {
          showNotification("No barbers with recruitment advance data found.", type = "warning", duration = 4)
          return()
        }
        
        report$needs_fix <- abs(report$current_remaining - report$correct_remaining) > 0.01
        to_fix <- report[report$needs_fix, , drop = FALSE]
        
        if (nrow(to_fix) == 0) {
          showNotification("All balances already match payment history. Nothing to recover.", type = "message", duration = 4)
          return()
        }
        
        updated <- 0
        for (i in seq_len(nrow(to_fix))) {
          row <- to_fix[i, ]
          dbExecute(con, "
            UPDATE barbers SET advance_remaining = $1 WHERE barber_id = $2
          ", params = list(as.numeric(row$correct_remaining), as.integer(row$barber_id)))
          updated <- updated + 1
        }
        
        rv$refresh_users <- rv$refresh_users + 1
        showNotification(
          paste("Recovered balances for", updated, "barber(s) from monthly salary payment history."),
          type = "message",
          duration = 5
        )
        log_user_action(session_data$user$user_id, "RECOVER_ADVANCE_BALANCES", paste(updated, "barbers"))
      }, error = function(e) {
        showNotification(paste("Recovery failed:", e$message), type = "error", duration = 6)
        log_error(paste("Advance balance recovery failed:", e$message), "ADMIN")
      })
    })
    
    observeEvent(input$refresh_services_btn, {
      rv$refresh_services <- rv$refresh_services + 1
      showNotification("Services table refreshed", type = "message", duration = 2)
    })
    
    observeEvent(input$refresh_categories_btn, {
      rv$refresh_categories <- rv$refresh_categories + 1
      showNotification("Categories table refreshed", type = "message", duration = 2)
    })
    
    # Confirm delete user
    observeEvent(input$confirm_delete_user, {
      # Get user_id from the button that was clicked
      user_id <- input$delete_user_action
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        # Check if user is a barber
        user_role <- dbGetQuery(con, "SELECT role FROM users WHERE user_id = $1", 
                               params = list(user_id))
        
        if (nrow(user_role) > 0 && user_role$role == "barber") {
          # Delete barber profile first (if exists)
          dbExecute(con, "DELETE FROM barbers WHERE user_id = $1", params = list(user_id))
        }
        
        # Delete user
        dbExecute(con, "DELETE FROM users WHERE user_id = $1", params = list(user_id))
        
        showNotification("User deleted successfully!", type = "message", duration = 3)
        log_user_action(session_data$user$user_id, "DELETE_USER", user_id)
        
        rv$refresh_users <- rv$refresh_users + 1
        removeModal()
      }, error = function(e) {
        showNotification(paste("Error deleting user:", e$message), type = "error", duration = 5)
      })
    })
    
    # Save user
    observeEvent(input$save_user_btn, {
      req(input$user_username, input$user_fullname, input$user_role)
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        if (is.null(rv$edit_user_id)) {
          # CREATE NEW USER
          req(input$user_password)
          
          # Validate password length
          if (nchar(input$user_password) < 6) {
            showNotification("Password must be at least 6 characters long!", type = "error")
            return()
          }
          
          # Check if username already exists
          existing_user <- dbGetQuery(con, "SELECT user_id FROM users WHERE username = $1", 
                                     params = list(input$user_username))
          
          if (nrow(existing_user) > 0) {
            showNotification("Username already exists! Please choose a different username.", type = "error")
            return()
          }
          
          # Create new user
          dbExecute(con, "
            INSERT INTO users (username, password_hash, full_name, email, phone, role, is_active)
            VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6, $7)
          ", params = list(
            input$user_username,
            input$user_password,
            input$user_fullname,
            ifelse(input$user_email == "", NA, input$user_email),
            ifelse(input$user_phone == "", NA, input$user_phone),
            input$user_role,
            input$user_active
          ))
          
          # If role is barber, automatically create barber profile
          if (input$user_role == "barber") {
            # Get the newly created user_id
            new_user <- dbGetQuery(con, "SELECT user_id FROM users WHERE username = $1", 
                                  params = list(input$user_username))
            
            if (nrow(new_user) > 0) {
              # Generate unique barber code
              barber_count <- dbGetQuery(con, "SELECT COUNT(*) as cnt FROM barbers")
              barber_code <- paste0("B", sprintf("%03d", as.integer(barber_count$cnt) + 1))
              
              # Get barber-specific input values
              commission_rate <- ifelse(is.null(input$user_commission) || is.na(input$user_commission), 40, input$user_commission)
              recruitment_advance <- ifelse(is.null(input$user_recruitment_advance) || is.na(input$user_recruitment_advance), 0, input$user_recruitment_advance)
              monthly_deduction <- ifelse(is.null(input$user_monthly_deduction) || is.na(input$user_monthly_deduction), 0, input$user_monthly_deduction)
              
              # Create barber profile
              dbExecute(con, "
                INSERT INTO barbers (
                  user_id, barber_code, commission_rate, is_active, hire_date,
                  recruitment_advance, advance_monthly_deduction, advance_remaining
                )
                VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $5)
              ", params = list(
                new_user$user_id,
                barber_code,
                commission_rate,
                input$user_active,
                recruitment_advance,
                monthly_deduction
              ))
              
              showNotification(paste("User", input$user_username, "created successfully with barber profile!"), 
                              type = "message", duration = 3)
            }
          } else {
            showNotification(paste("User", input$user_username, "created successfully!"), 
                            type = "message", duration = 3)
          }
          
          log_user_action(session_data$user$user_id, "CREATE_USER", input$user_username)
          
        } else {
          # UPDATE EXISTING USER
          
          # Get current user role
          current_user <- dbGetQuery(con, "SELECT role FROM users WHERE user_id = $1", 
                                    params = list(rv$edit_user_id))
          old_role <- current_user$role
          
          # Update user details
          dbExecute(con, "
            UPDATE users 
            SET full_name = $1, email = $2, phone = $3, role = $4, is_active = $5
            WHERE user_id = $6
          ", params = list(
            input$user_fullname,
            ifelse(input$user_email == "", NA, input$user_email),
            ifelse(input$user_phone == "", NA, input$user_phone),
            input$user_role,
            input$user_active,
            rv$edit_user_id
          ))
          
          # Handle role change to/from barber
          if (old_role != "barber" && input$user_role == "barber") {
            # User role changed TO barber - create barber profile if doesn't exist
            existing_barber <- dbGetQuery(con, "SELECT barber_id FROM barbers WHERE user_id = $1", 
                                         params = list(rv$edit_user_id))
            
            if (nrow(existing_barber) == 0) {
              # Generate unique barber code
              barber_count <- dbGetQuery(con, "SELECT COUNT(*) as cnt FROM barbers")
              barber_code <- paste0("B", sprintf("%03d", as.integer(barber_count$cnt) + 1))
              
              # Get barber-specific input values
              commission_rate <- ifelse(is.null(input$user_commission) || is.na(input$user_commission), 40, input$user_commission)
              recruitment_advance <- ifelse(is.null(input$user_recruitment_advance) || is.na(input$user_recruitment_advance), 0, input$user_recruitment_advance)
              monthly_deduction <- ifelse(is.null(input$user_monthly_deduction) || is.na(input$user_monthly_deduction), 0, input$user_monthly_deduction)
              
              dbExecute(con, "
                INSERT INTO barbers (
                  user_id, barber_code, commission_rate, is_active, hire_date,
                  recruitment_advance, advance_monthly_deduction, advance_remaining
                )
                VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $5)
              ", params = list(
                rv$edit_user_id,
                barber_code,
                commission_rate,
                input$user_active,
                recruitment_advance,
                monthly_deduction
              ))
              
              showNotification("User updated and barber profile created!", type = "message", duration = 3)
            }
          } else if (old_role == "barber" && input$user_role == "barber") {
            # Still a barber - update barber profile with all barber-specific fields
            commission_rate <- ifelse(is.null(input$user_commission) || is.na(input$user_commission), 40, input$user_commission)
            recruitment_advance <- ifelse(is.null(input$user_recruitment_advance) || is.na(input$user_recruitment_advance), 0, input$user_recruitment_advance)
            monthly_deduction <- ifelse(is.null(input$user_monthly_deduction) || is.na(input$user_monthly_deduction), 0, input$user_monthly_deduction)
            
            # Keep amount already paid when recruitment advance is changed
            current_barber <- tryCatch({
              dbGetQuery(con, "
                SELECT recruitment_advance, advance_remaining
                FROM barbers WHERE user_id = $1
              ", params = list(rv$edit_user_id))
            }, error = function(e) NULL)
            
            if (!is.null(current_barber) && nrow(current_barber) > 0) {
              old_advance <- as.numeric(current_barber$recruitment_advance)
              old_remaining <- as.numeric(current_barber$advance_remaining)
              amount_paid <- max(0, old_advance - old_remaining)
              advance_remaining <- max(0, recruitment_advance - amount_paid)
            } else {
              advance_remaining <- recruitment_advance
            }
            
            dbExecute(con, "
              UPDATE barbers 
              SET is_active = $1, 
                  commission_rate = $2,
                  recruitment_advance = $3,
                  advance_monthly_deduction = $4,
                  advance_remaining = $5
              WHERE user_id = $6
            ", params = list(
              input$user_active,
              commission_rate,
              recruitment_advance,
              monthly_deduction,
              advance_remaining,
              rv$edit_user_id
            ))
          }
          
          # Update password if provided
          if (!is.null(input$user_new_password) && input$user_new_password != "") {
            # Validate password
            if (nchar(input$user_new_password) < 6) {
              showNotification("New password must be at least 6 characters long!", type = "error")
              return()
            }
            
            # Check password confirmation
            if (input$user_new_password != input$user_confirm_password) {
              showNotification("Passwords do not match!", type = "error")
              return()
            }
            
            # Update password
            dbExecute(con, "
              UPDATE users 
              SET password_hash = crypt($1, gen_salt('bf'))
              WHERE user_id = $2
            ", params = list(input$user_new_password, rv$edit_user_id))
            
            showNotification("User updated successfully (including password)!", 
                            type = "message", duration = 3)
          } else {
            showNotification("User updated successfully!", type = "message", duration = 3)
          }
          
          log_user_action(session_data$user$user_id, "UPDATE_USER", rv$edit_user_id)
        }
        
        rv$refresh_users <- rv$refresh_users + 1
        rv$edit_user_id <- NULL
        removeModal()
        
      }, error = function(e) {
        showNotification(paste("Error:", e$message), type = "error", duration = 5)
      })
    })
    
    # ===== BARBER MANAGEMENT =====
    
    # ===== BARBER MANAGEMENT (CONSOLIDATED INTO USER MANAGEMENT) =====
    # Barber-specific logic is now handled in the role-aware user management above
    
    # ===== SERVICE MANAGEMENT =====
    
    output$services_table <- DT::renderDataTable({
      rv$refresh_services
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      services <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            service_id,
            service_name,
            base_price,
            service_description,
            CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END as status
          FROM services
          ORDER BY service_name
        ")
      }, error = function(e) {
        data.frame(service_id = integer(), service_name = character(), base_price = numeric(),
                  service_description = character(), status = character())
      })
      
      if (nrow(services) > 0) {
        # Format prices
        services_display <- data.frame(
          ID = services$service_id,
          "Service Name" = services$service_name,
          Price = sapply(services$base_price, format_currency),
          Description = ifelse(is.na(services$service_description), "", services$service_description),
          Status = services$status,
          Actions = sprintf(
            '<button class="btn-action" onclick="Shiny.setInputValue(\'%s\', %d, {priority: \'event\'})">Edit</button>
             <button class="btn-action" style="background: var(--barbazza-gold-dark);" onclick="Shiny.setInputValue(\'%s\', %d, {priority: \'event\'})">Delete</button>',
            ns("edit_service_action"), services$service_id,
            ns("delete_service_action"), services$service_id
          ),
          check.names = FALSE
        )
      } else {
        services_display <- data.frame(
          ID = integer(), "Service Name" = character(), Price = character(),
          Description = character(), Status = character(), Actions = character(),
          check.names = FALSE
        )
      }
      
      DT::datatable(
        services_display,
        options = list(pageLength = 15, scrollX = TRUE, dom = 'tp'),
        rownames = FALSE,
        escape = FALSE,
        selection = 'none'
      )
    })
    
    observeEvent(input$add_service_btn, {
      rv$edit_service_id <- NULL
      
      showModal(
        modalDialog(
          title = "Add New Service",
          size = "m",
          
          textInput(ns("service_name"), "Service Name *", value = ""),
          numericInput(ns("service_price"), "Default Price (RWF) *", 
                      value = 0, min = 0),
          textAreaInput(ns("service_description"), "Description", 
                       value = "", rows = 3),
          checkboxInput(ns("service_active"), "Active", value = TRUE),
          
          footer = tagList(
            modalButton("Cancel"),
            actionButton(ns("save_service_btn"), "Save", 
                        style = "background: var(--barbazza-gold); color: white; border: none;")
          )
        )
      )
    })
    
    observeEvent(input$save_service_btn, {
      req(input$service_name, input$service_price)
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        if (is.null(rv$edit_service_id)) {
          dbExecute(con, "
            INSERT INTO services (service_name, base_price, service_description, is_active, created_by)
            VALUES ($1, $2, $3, $4, $5)
          ", params = list(
            input$service_name,
            input$service_price,
            ifelse(input$service_description == "", NA, input$service_description),
            input$service_active,
            session_data$user$user_id
          ))
          showNotification("Service added successfully!", type = "message", duration = 3)
        } else {
          dbExecute(con, "
            UPDATE services 
            SET service_name = $1, base_price = $2, service_description = $3, is_active = $4
            WHERE service_id = $5
          ", params = list(
            input$service_name,
            input$service_price,
            ifelse(input$service_description == "", NA, input$service_description),
            input$service_active,
            rv$edit_service_id
          ))
          showNotification("Service updated successfully!", type = "message", duration = 3)
        }
        
        rv$refresh_services <- rv$refresh_services + 1
        removeModal()
      }, error = function(e) {
        showNotification(paste("Error:", e$message), type = "error", duration = 5)
      })
    })
    
    # Edit service
    observeEvent(input$edit_service_action, {
      service_id <- input$edit_service_action
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      service <- dbGetQuery(con, "
        SELECT * FROM services WHERE service_id = $1
      ", params = list(service_id))
      
      if (nrow(service) > 0) {
        rv$edit_service_id <- service_id
        
        showModal(
          modalDialog(
            title = "Edit Service",
            size = "m",
            
            textInput(ns("service_name"), "Service Name *", value = service$service_name),
            numericInput(ns("service_price"), "Price (RWF) *", 
                        value = service$base_price, min = 0),
            textAreaInput(ns("service_description"), "Description", 
                         value = ifelse(is.na(service$service_description), "", service$service_description), 
                         rows = 3),
            checkboxInput(ns("service_active"), "Active", value = service$is_active),
            
            footer = tagList(
              modalButton("Cancel"),
              actionButton(ns("save_service_btn"), "Update", 
                          style = "background: var(--barbazza-gold); color: white; border: none;")
            )
          )
        )
      }
    })
    
    # Delete service
    observeEvent(input$delete_service_action, {
      service_id <- input$delete_service_action
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      service <- dbGetQuery(con, "
        SELECT service_name FROM services WHERE service_id = $1
      ", params = list(service_id))
      
      if (nrow(service) > 0) {
        showModal(
          modalDialog(
            title = "Delete Service",
            size = "s",
            
            p(paste("Are you sure you want to delete the service:", service$service_name, "?")),
            p(style = "color: var(--barbazza-gold-dark);", 
              "Warning: This action cannot be undone."),
            
            footer = tagList(
              modalButton("Cancel"),
              actionButton(ns("confirm_delete_service"), "Delete", 
                          style = "background: var(--barbazza-gold-dark); color: white; border: none;")
            )
          )
        )
        
        rv$delete_service_id <- service_id
      }
    })
    
    # Confirm delete service
    observeEvent(input$confirm_delete_service, {
      service_id <- rv$delete_service_id
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        dbExecute(con, "DELETE FROM services WHERE service_id = $1", params = list(service_id))
        
        showNotification("Service deleted successfully!", type = "message", duration = 3)
        log_user_action(session_data$user$user_id, "DELETE_SERVICE", service_id)
        
        rv$refresh_services <- rv$refresh_services + 1
        removeModal()
      }, error = function(e) {
        showNotification(paste("Error deleting service:", e$message), type = "error", duration = 5)
      })
    })
    
    # ===== EXPENSE CATEGORIES =====
    
    output$categories_table <- DT::renderDataTable({
      rv$refresh_categories
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      categories <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            category_id as \"ID\",
            category_name as \"Category Name\",
            description as \"Description\",
            CASE WHEN is_active THEN '✓ Active' ELSE '✗ Inactive' END as \"Status\"
          FROM expense_categories
          ORDER BY category_name
        ")
      }, error = function(e) {
        data.frame(ID = integer(), "Category Name" = character(), 
                  Description = character(), Status = character())
      })
      
      DT::datatable(
        categories,
        options = list(pageLength = 15, scrollX = TRUE),
        rownames = FALSE,
        selection = 'single'
      )
    })
    
    observeEvent(input$add_category_btn, {
      rv$edit_category_id <- NULL
      
      showModal(
        modalDialog(
          title = "Add New Category",
          size = "m",
          
          textInput(ns("category_name"), "Category Name *", value = ""),
          textAreaInput(ns("category_description"), "Description", 
                       value = "", rows = 3),
          checkboxInput(ns("category_active"), "Active", value = TRUE),
          
          footer = tagList(
            modalButton("Cancel"),
            actionButton(ns("save_category_btn"), "Save", 
                        style = "background: var(--barbazza-gold); color: white; border: none;")
          )
        )
      )
    })
    
    observeEvent(input$save_category_btn, {
      req(input$category_name)
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        if (is.null(rv$edit_category_id)) {
          dbExecute(con, "
            INSERT INTO expense_categories (category_name, description, is_active)
            VALUES ($1, $2, $3)
          ", params = list(
            input$category_name,
            input$category_description,
            input$category_active
          ))
          showNotification("Category added successfully!", type = "message")
        } else {
          dbExecute(con, "
            UPDATE expense_categories 
            SET category_name = $1, description = $2, is_active = $3
            WHERE category_id = $4
          ", params = list(
            input$category_name,
            input$category_description,
            input$category_active,
            rv$edit_category_id
          ))
          showNotification("Category updated successfully!", type = "message")
        }
        
        rv$refresh_categories <- rv$refresh_categories + 1
        removeModal()
      }, error = function(e) {
        showNotification(paste("Error:", e$message), type = "error")
      })
    })
    
    # ===== REPORTS & ANALYTICS =====
    
    output$reports_table <- DT::renderDataTable({
      input$generate_report_btn
      
      isolate({
        start_date <- input$report_start_date
        end_date <- input$report_end_date
        
        con <- get_db_connection()
        on.exit(close_db_connection(con))
        
        reports <- tryCatch({
          dbGetQuery(con, "
            SELECT 
              TO_CHAR(report_date, 'YYYY-MM-DD') as \"Date\",
              total_customers as \"Customers\",
              total_income as \"Income\",
              total_expenses as \"Expenses\",
              net_profit as \"Net Profit\",
              CASE WHEN is_locked THEN 'Locked' ELSE 'Open' END as \"Status\"
            FROM daily_reports
            WHERE report_date BETWEEN $1 AND $2
            ORDER BY report_date DESC
          ", params = list(start_date, end_date))
        }, error = function(e) {
          data.frame(Date = character(), Customers = integer(), Income = numeric(),
                    Expenses = numeric(), "Net Profit" = numeric(), Status = character())
        })
        
        if (nrow(reports) > 0) {
          reports$Income <- sapply(reports$Income, format_currency)
          reports$Expenses <- sapply(reports$Expenses, format_currency)
          reports$`Net Profit` <- sapply(reports$`Net Profit`, format_currency)
        }
        
        DT::datatable(
          reports,
          options = list(
            pageLength = 20,
            scrollX = TRUE,
            dom = 'Bfrtip',
            buttons = c('copy', 'csv', 'excel')
          ),
          rownames = FALSE
        )
      })
    })
    
    # Financial summary
    output$financial_summary <- renderUI({
      input$generate_report_btn
      
      isolate({
        start_date <- input$report_start_date
        end_date <- input$report_end_date
        
        con <- get_db_connection()
        on.exit(close_db_connection(con))
        
        summary <- tryCatch({
          dbGetQuery(con, "
            SELECT 
              COALESCE(SUM(total_income), 0) as total_income,
              COALESCE(SUM(total_expenses), 0) as total_expenses,
              COALESCE(SUM(net_profit), 0) as net_profit,
              COALESCE(SUM(total_customers), 0) as total_customers
            FROM daily_reports
            WHERE report_date BETWEEN $1 AND $2
          ", params = list(start_date, end_date))
        }, error = function(e) {
          data.frame(total_income = 0, total_expenses = 0, net_profit = 0, total_customers = 0)
        })
        
        fluidRow(
          column(3, div(class = "stat-card",
            div(class = "stat-label", "Total Income"),
            div(class = "stat-value", style = "color: var(--barbazza-success);", 
                format_currency(summary$total_income))
          )),
          column(3, div(class = "stat-card",
            div(class = "stat-label", "Total Expenses"),
            div(class = "stat-value", style = "color: var(--barbazza-error);", 
                format_currency(summary$total_expenses))
          )),
          column(3, div(class = "stat-card",
            div(class = "stat-label", "Net Profit"),
            div(class = "stat-value", style = "color: var(--barbazza-gold);", 
                format_currency(summary$net_profit))
          )),
          column(3, div(class = "stat-card",
            div(class = "stat-label", "Total Customers"),
            div(class = "stat-value", as.character(summary$total_customers))
          ))
        )
      })
    })
    
    # ===== AUDIT LOGS =====
    
    output$audit_logs_table <- DT::renderDataTable({
      input$filter_logs_btn
      
      isolate({
        action_filter <- input$log_action_filter
        start_date <- input$log_start_date
        end_date <- input$log_end_date
        
        con <- get_db_connection()
        on.exit(close_db_connection(con))
        
        query <- "
          SELECT 
            TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as \"Timestamp\",
            action_type as \"Action\",
            table_name as \"Table\",
            record_id as \"Record ID\",
            performed_by as \"User ID\"
          FROM audit_logs
          WHERE DATE(created_at) BETWEEN $1 AND $2
        "
        
        params <- list(start_date, end_date)
        
        if (action_filter != "") {
          query <- paste0(query, " AND action_type = $3")
          params <- c(params, action_filter)
        }
        
        query <- paste0(query, " ORDER BY created_at DESC LIMIT 500")
        
        logs <- tryCatch({
          dbGetQuery(con, query, params = params)
        }, error = function(e) {
          data.frame(Timestamp = character(), Action = character(), 
                    Table = character(), "Record ID" = integer(), "User ID" = integer())
        })
        
        DT::datatable(
          logs,
          options = list(
            pageLength = 25,
            scrollX = TRUE,
            dom = 'Bfrtip',
            buttons = c('copy', 'csv')
          ),
          rownames = FALSE
        )
      })
    })
    
    # ===== SETTINGS MANAGEMENT =====
    
    # Load settings on startup
    observe({
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      settings <- tryCatch({
        dbGetQuery(con, "SELECT setting_key, setting_value FROM system_settings")
      }, error = function(e) data.frame(setting_key = character(), setting_value = character()))
      
      if (nrow(settings) > 0) {
        for (i in 1:nrow(settings)) {
          key <- settings$setting_key[i]
          value <- settings$setting_value[i]
          
          if (key == "shop_name") {
            updateTextInput(session, "shop_name", value = value)
          } else if (key == "shop_address") {
            updateTextInput(session, "shop_address", value = value)
          } else if (key == "shop_phone") {
            updateTextInput(session, "shop_phone", value = value)
          } else if (key == "shop_email") {
            updateTextInput(session, "shop_email", value = value)
          } else if (key == "currency") {
            updateTextInput(session, "currency", value = value)
          } else if (key == "timezone") {
            updateTextInput(session, "timezone", value = value)
          } else if (key == "tax_rate") {
            updateNumericInput(session, "tax_rate", value = as.numeric(value))
          } else if (key == "commission_rate") {
            updateNumericInput(session, "commission_rate", value = as.numeric(value))
          }
        }
      }
    })
    
    # Save settings
    observeEvent(input$save_settings_btn, {
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        settings_to_update <- list(
          shop_name = input$shop_name,
          shop_address = input$shop_address,
          shop_phone = input$shop_phone,
          shop_email = input$shop_email,
          currency = input$currency,
          timezone = input$timezone,
          tax_rate = as.character(input$tax_rate),
          commission_rate = as.character(input$commission_rate)
        )
        
        for (key in names(settings_to_update)) {
          value <- settings_to_update[[key]]
          
          # Check if setting exists
          exists_check <- dbGetQuery(con, "SELECT COUNT(*) as count FROM system_settings WHERE setting_key = $1", 
                                    params = list(key))
          
          if (exists_check$count > 0) {
            # Update
            dbExecute(con, "
              UPDATE system_settings 
              SET setting_value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
              WHERE setting_key = $3
            ", params = list(value, session_data$user$user_id, key))
          } else {
            # Insert
            dbExecute(con, "
              INSERT INTO system_settings (setting_key, setting_value, updated_by)
              VALUES ($1, $2, $3)
            ", params = list(key, value, session_data$user$user_id))
          }
        }
        
        showNotification("Settings saved successfully!", type = "message", duration = 3)
        log_user_action(session_data$user$user_id, "UPDATE_SETTINGS", "System settings updated")
      }, error = function(e) {
        showNotification(paste("Error saving settings:", e$message), type = "error", duration = 5)
        log_error(paste("Settings save error:", e$message), "ADMIN")
      })
    })
    
    # ===== DAY LOCKING =====
    
    # Locked days table
    output$locked_days_table <- DT::renderDataTable({
      input$lock_day_btn
      input$unlock_day_btn
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      locked_days <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            TO_CHAR(report_date, 'YYYY-MM-DD') as \"Date\",
            total_income as \"Income\",
            total_expenses as \"Expenses\",
            net_profit as \"Profit\",
            'Locked' as \"Status\"
          FROM daily_reports
          WHERE is_locked = TRUE
          ORDER BY report_date DESC
          LIMIT 30
        ")
      }, error = function(e) {
        data.frame(Date = character(), Income = numeric(), 
                  Expenses = numeric(), Profit = numeric(), Status = character())
      })
      
      if (nrow(locked_days) > 0) {
        locked_days$Income <- sapply(locked_days$Income, format_currency)
        locked_days$Expenses <- sapply(locked_days$Expenses, format_currency)
        locked_days$Profit <- sapply(locked_days$Profit, format_currency)
      }
      
      DT::datatable(
        locked_days,
        options = list(
          pageLength = 10,
          scrollX = TRUE,
          dom = 't'
        ),
        rownames = FALSE
      )
    })
    
    # Lock day
    observeEvent(input$lock_day_btn, {
      req(input$lock_date)
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        # Check if report exists
        report_check <- dbGetQuery(con, "
          SELECT is_locked FROM daily_reports WHERE report_date = $1
        ", params = list(input$lock_date))
        
        if (nrow(report_check) == 0) {
          showNotification("No report exists for this date. Close the day first in Manager portal.", 
                          type = "warning", duration = 5)
          return()
        }
        
        if (report_check$is_locked) {
          showNotification("This day is already locked!", type = "warning", duration = 3)
          return()
        }
        
        # Lock the day
        dbExecute(con, "
          UPDATE daily_reports 
          SET is_locked = TRUE, locked_by = $1, locked_at = CURRENT_TIMESTAMP
          WHERE report_date = $2
        ", params = list(session_data$user$user_id, input$lock_date))
        
        showNotification(paste("Day", input$lock_date, "has been locked successfully!"), 
                        type = "message", duration = 3)
        log_user_action(session_data$user$user_id, "LOCK_DAY", input$lock_date)
      }, error = function(e) {
        showNotification(paste("Error locking day:", e$message), type = "error", duration = 5)
      })
    })
    
    # Unlock day
    observeEvent(input$unlock_day_btn, {
      req(input$lock_date)
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        # Check if report exists and is locked
        report_check <- dbGetQuery(con, "
          SELECT is_locked FROM daily_reports WHERE report_date = $1
        ", params = list(input$lock_date))
        
        if (nrow(report_check) == 0) {
          showNotification("No report exists for this date.", type = "warning", duration = 3)
          return()
        }
        
        if (!report_check$is_locked) {
          showNotification("This day is not locked!", type = "warning", duration = 3)
          return()
        }
        
        # Unlock the day
        dbExecute(con, "
          UPDATE daily_reports 
          SET is_locked = FALSE, locked_by = NULL, locked_at = NULL
          WHERE report_date = $1
        ", params = list(input$lock_date))
        
        showNotification(paste("Day", input$lock_date, "has been unlocked successfully!"), 
                        type = "message", duration = 3)
        log_user_action(session_data$user$user_id, "UNLOCK_DAY", input$lock_date)
      }, error = function(e) {
        showNotification(paste("Error unlocking day:", e$message), type = "error", duration = 5)
      })
    })
    
    # Daily records for selected date (Admin)
    admin_records_date_data <- reactive({
      req(input$admin_records_date)
      
      selected_date <- input$admin_records_date
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Daily income
      income <- dbGetQuery(con, "
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE transaction_date = $1
      ", params = list(selected_date))$total
      
      # Daily customers
      customers <- dbGetQuery(con, "
        SELECT COUNT(*) as count
        FROM transactions
        WHERE transaction_date = $1
      ", params = list(selected_date))$count
      
      customers <- as.integer(as.numeric(customers))
      
      # Daily expenses
      expenses <- dbGetQuery(con, "
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses
        WHERE expense_date = $1
      ", params = list(selected_date))$total
      
      profit <- income - expenses
      
      return(list(
        income = income,
        customers = customers,
        expenses = expenses,
        profit = profit
      ))
    })
    
    # Admin records date outputs
    output$admin_records_income <- renderText({ format_currency(admin_records_date_data()$income) })
    output$admin_records_customers <- renderText({ as.character(admin_records_date_data()$customers) })
    output$admin_records_expenses <- renderText({ format_currency(admin_records_date_data()$expenses) })
    output$admin_records_profit <- renderText({ format_currency(admin_records_date_data()$profit) })
    
    # Transactions table for selected date (Admin)
    output$admin_records_transactions_table <- DT::renderDataTable({
      req(input$admin_records_date)
      
      selected_date <- input$admin_records_date
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      transactions <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            b.barber_code as \"Barber\",
            u.full_name as \"Barber Name\",
            t.service_name as \"Service\",
            t.customer_name as \"Customer\",
            t.amount as \"Amount\",
            TO_CHAR(t.created_at, 'HH24:MI') as \"Time\",
            u2.username as \"Added By\"
          FROM transactions t
          LEFT JOIN barbers b ON t.barber_id = b.barber_id
          LEFT JOIN users u ON b.user_id = u.user_id
          LEFT JOIN users u2 ON t.added_by = u2.user_id
          WHERE t.transaction_date = $1
          ORDER BY t.created_at DESC
        ", params = list(selected_date))
      }, error = function(e) {
        data.frame()
      })
      
      if (nrow(transactions) == 0) {
        return(DT::datatable(
          data.frame(Message = "No transactions for this date"),
          options = list(dom = 't'),
          rownames = FALSE
        ))
      }
      
      transactions$Amount <- sapply(transactions$Amount, format_currency)
      transactions$Customer[is.na(transactions$Customer) | transactions$Customer == ""] <- "Walk-in"
      
      DT::datatable(
        transactions,
        options = list(
          pageLength = 15,
          scrollX = TRUE,
          dom = 'ftp'
        ),
        rownames = FALSE
      )
    })
    
    # Barber performance for selected date (Admin)
    output$admin_records_barber_performance <- DT::renderDataTable({
      req(input$admin_records_date)
      
      selected_date <- input$admin_records_date
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      performance <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            b.barber_code as \"Barber Code\",
            u.full_name as \"Barber Name\",
            COUNT(t.transaction_id) as \"Services\",
            COUNT(t.transaction_id) as \"Customers\",
            COALESCE(SUM(t.amount), 0) as \"Total Income\",
            b.commission_rate as \"Commission Rate\",
            COALESCE(SUM(t.amount) * (b.commission_rate / 100.0), 0) as \"Commission Earned\"
          FROM barbers b
          LEFT JOIN users u ON b.user_id = u.user_id
          LEFT JOIN transactions t ON b.barber_id = t.barber_id AND t.transaction_date = $1
          WHERE b.is_active = TRUE
          GROUP BY b.barber_id, b.barber_code, u.full_name, b.commission_rate
          ORDER BY \"Total Income\" DESC
        ", params = list(selected_date))
      }, error = function(e) {
        data.frame()
      })
      
      if (nrow(performance) == 0) {
        return(DT::datatable(
          data.frame(Message = "No barber data available"),
          options = list(dom = 't'),
          rownames = FALSE
        ))
      }
      
      performance$Services <- as.integer(as.numeric(performance$Services))
      performance$Customers <- as.integer(as.numeric(performance$Customers))
      performance$`Commission Rate` <- paste0(performance$`Commission Rate`, "%")
      performance$`Total Income` <- sapply(performance$`Total Income`, format_currency)
      performance$`Commission Earned` <- sapply(performance$`Commission Earned`, format_currency)
      
      DT::datatable(
        performance,
        options = list(
          pageLength = 15,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE
      )
    })
    
    # Expenses table for selected date (Admin)
    output$admin_records_expenses_table <- DT::renderDataTable({
      req(input$admin_records_date)
      
      selected_date <- input$admin_records_date
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      expenses <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            c.category_name as \"Category\",
            e.description as \"Description\",
            e.amount as \"Amount\",
            TO_CHAR(e.created_at, 'HH24:MI') as \"Time\",
            u.username as \"Added By\"
          FROM expenses e
          LEFT JOIN expense_categories c ON e.category_id = c.category_id
          LEFT JOIN users u ON e.added_by = u.user_id
          WHERE e.expense_date = $1
          ORDER BY e.created_at DESC
        ", params = list(selected_date))
      }, error = function(e) {
        data.frame()
      })
      
      if (nrow(expenses) == 0) {
        return(DT::datatable(
          data.frame(Message = "No expenses for this date"),
          options = list(dom = 't'),
          rownames = FALSE
        ))
      }
      
      expenses$Amount <- sapply(expenses$Amount, format_currency)
      
      DT::datatable(
        expenses,
        options = list(
          pageLength = 15,
          scrollX = TRUE,
          dom = 'ftp'
        ),
        rownames = FALSE
      )
    })

  })
}


