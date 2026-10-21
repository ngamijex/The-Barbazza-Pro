# Manager Module
# Daily operations management
# Note: Database connection functions are defined in global.R

# Manager UI
manager_ui <- function(id) {
  ns <- NS(id)
  
  div(
    style = "padding: var(--space-6);",
    
    div(
      class = "manager-tabs",
      tabsetPanel(
        id = ns("manager_tabs"),
        type = "tabs",
        
        # Daily Operations Tab
      tabPanel(
        "Daily Operations",
        value = "operations",
        div(
          class = "manager-card",
          h3("Today's Summary"),
          div(
            class = "daily-summary",
            div(class = "summary-card",
              div(class = "summary-label", "Total Income"),
              div(class = "summary-value", textOutput(ns("daily_income")))
            ),
            div(class = "summary-card",
              div(class = "summary-label", "Total Customers"),
              div(class = "summary-value", textOutput(ns("daily_customers")))
            ),
            div(class = "summary-card",
              div(class = "summary-label", "Total Expenses"),
              div(class = "summary-value", textOutput(ns("daily_expenses")))
            ),
            div(class = "summary-card",
              div(class = "summary-label", "Net Profit"),
              div(class = "summary-value", textOutput(ns("daily_profit")))
            )
          )
        ),
        
        # Monthly Summary
        div(
          class = "manager-card",
          h3("This Month's Summary"),
          p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);", 
            paste("Month of", format(Sys.Date(), "%B %Y"))),
          div(
            class = "daily-summary",
            div(class = "summary-card",
              div(class = "summary-label", "Total Income"),
              div(class = "summary-value", textOutput(ns("monthly_income")))
            ),
            div(class = "summary-card",
              div(class = "summary-label", "Total Customers"),
              div(class = "summary-value", textOutput(ns("monthly_customers")))
            ),
            div(class = "summary-card",
              div(class = "summary-label", "Total Expenses"),
              div(class = "summary-value", textOutput(ns("monthly_expenses")))
            ),
            div(class = "summary-card",
              div(class = "summary-label", "Net Profit"),
              div(class = "summary-value", style = "color: var(--barbazza-gold);", textOutput(ns("monthly_profit")))
            ),
            div(class = "summary-card",
              div(class = "summary-label", "Total Services"),
              div(class = "summary-value", textOutput(ns("monthly_services")))
            ),
            div(class = "summary-card",
              div(class = "summary-label", "Average Daily Income"),
              div(class = "summary-value", textOutput(ns("monthly_avg_daily")))
            )
          )
        ),
        
        # Income Trend Chart
        div(
          class = "manager-card",
          h3("Income Trend - This Month"),
          p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);", 
            "Total barbershop income performance this month"),
          div(
            style = "height: 300px; position: relative;",
            tags$canvas(id = ns("income_chart"), style = "max-height: 300px;")
          )
        ),
        
        # Add Service Section
        div(
          class = "manager-card",
          h3("Add Service Transaction"),
          div(
            class = "service-form",
            fluidRow(
              column(4,
                selectInput(ns("service_barber"), "Select Barber *", 
                           choices = c("Loading..." = ""))
              ),
              column(4,
                selectInput(ns("service_service"), "Select Service *", 
                           choices = c("Loading..." = ""))
              ),
              column(4,
                div(
                  numericInput(ns("service_amount"), "Amount (RWF) *", value = 0, min = 0, step = 100),
                  tags$small(id = ns("base_price_info"), style = "color: var(--barbazza-gold); display: none;", 
                            "Base Price: 0 RWF")
                )
              )
            ),
            fluidRow(
              column(6,
                textInput(ns("service_customer"), "Customer Name (Optional)", value = "")
              ),
              column(6,
                div(id = ns("discount_reason_container"), style = "display: none;",
                  textAreaInput(ns("discount_reason"), "Discount Reason *", 
                               value = "", rows = 2, 
                               placeholder = "Required when price is less than base price")
                )
              )
            ),
            fluidRow(
              column(12,
                textAreaInput(ns("service_notes"), "Notes (Optional)", value = "", rows = 2)
              )
            ),
            actionButton(ns("add_service_btn"), "Add Service", 
                        style = "background: var(--barbazza-gold); color: var(--barbazza-black); border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-weight: var(--weight-semibold);")
          )
        ),
        
        # Today's Transactions
        div(
          class = "manager-card",
          h3("Today's Transactions"),
          DT::dataTableOutput(ns("today_transactions"))
        )
      ),
      
      # Expenses Tab
      tabPanel(
        "Expenses",
        value = "expenses",
        div(
          class = "manager-card",
          h3("Record Expense"),
          div(
            class = "service-form",
            fluidRow(
              column(3,
                dateInput(ns("expense_date"), "Date", value = Sys.Date())
              ),
              column(3,
                selectInput(ns("expense_category"), "Category", choices = NULL)
              ),
              column(3,
                selectInput(ns("expense_type"), "Type", 
                           choices = list("Shop" = "shop", "Barber" = "barber"))
              ),
              column(3,
                selectInput(ns("expense_barber"), "Barber (if applicable)", choices = NULL)
              )
            ),
            fluidRow(
              column(6,
                textInput(ns("expense_description"), "Description", value = "")
              ),
              column(3,
                numericInput(ns("expense_amount"), "Amount (RWF)", value = 0, min = 0, step = 100)
              ),
              column(3,
                textInput(ns("expense_receipt"), "Receipt Number (Optional)", value = "")
              )
            ),
            actionButton(ns("add_expense_btn"), "Record Expense", 
                        style = "background: var(--barbazza-gold); color: var(--barbazza-black); border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-weight: var(--weight-semibold);")
          )
        ),
        
        div(
          class = "manager-card",
          h3("Today's Expenses"),
          DT::dataTableOutput(ns("today_expenses"))
        )
      ),
      
      # Barbers Tab
      tabPanel(
        "Barbers",
        value = "barbers",
        div(
          class = "manager-card",
          h3("Barber Performance - Today"),
          DT::dataTableOutput(ns("barber_performance"))
        )
      ),
      
      # Daily Report Tab
      tabPanel(
        "Daily Report",
        value = "report",
        
        # Report Generation Section
        div(
          class = "manager-card",
          h3("📊 Generate Daily Report"),
          p(style = "color: var(--barbazza-cream); margin-bottom: var(--space-4);",
            "Generate professional daily report and automatically upload to Google Drive"),
          
          fluidRow(
            column(3,
              dateInput(ns("report_date"), "Report Date", 
                       value = Sys.Date(),
                       max = Sys.Date())
            ),
            column(3,
              selectInput(ns("report_format"), "Report Format",
                         choices = c(
                           "Both (Excel + Google Sheets)" = "both",
                           "Excel Only" = "excel",
                           "Google Sheets Only" = "sheets"
                         ),
                         selected = "both")
            ),
            column(6,
              div(style = "margin-top: var(--space-6);",
                actionButton(ns("generate_report_btn"), 
                            "📤 Generate & Upload Report", 
                            style = "background: var(--barbazza-gold); color: var(--barbazza-black); border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-weight: var(--weight-semibold); width: 100%; min-height: 44px;")
              )
            )
          ),
          
          # Report Status
          div(id = ns("report_status"), 
              style = "margin-top: var(--space-4); padding: var(--space-4); border-radius: var(--radius-md); background: rgba(255,255,255,0.05); display: none;")
        ),
        
        # Google Drive Info
        div(
          class = "manager-card",
          h3("☁️ Google Drive Integration"),
          p(style = "color: var(--barbazza-cream); margin-bottom: var(--space-3);",
            "Reports are automatically uploaded to your Google Drive folder:"),
          div(
            style = "background: rgba(255,255,255,0.05); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-3);",
            p(style = "margin: 0; font-family: monospace; color: var(--barbazza-gold);",
              "📁 Folder ID: 1VFRjOtnY-wm-UCAjV34yS9MpNRfAxC3I")
          ),
          tags$a(
            href = "https://drive.google.com/drive/folders/1VFRjOtnY-wm-UCAjV34yS9MpNRfAxC3I",
            target = "_blank",
            style = "display: inline-block; background: var(--barbazza-gold); color: var(--barbazza-black); padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); text-decoration: none; font-weight: var(--weight-semibold);",
            "🔗 Open Google Drive Folder"
          )
        ),
        
        # Report Preview
        div(
          class = "manager-card",
          h3("📋 Report Preview - Selected Date"),
          uiOutput(ns("report_preview"))
        ),
        
        # Recent Reports
        div(
          class = "manager-card",
          h3("📂 Recent Generated Reports"),
          DT::dataTableOutput(ns("recent_reports_table"))
        )
      ),
      
      # Credit Approvals Tab
      tabPanel(
        "Credit Approvals",
        value = "credits",
        
        # Pending Requests
        div(
          class = "manager-card",
          h3("Pending Credit Requests"),
          p("Review and approve/reject barber credit requests"),
          DT::dataTableOutput(ns("pending_credits_table"))
        ),
        
        # Active Credits
        div(
          class = "manager-card",
          h3("Active Credits"),
          p("Credits that have been approved and are being deducted"),
          DT::dataTableOutput(ns("active_credits_table"))
        ),
        
        # All Credits History
        div(
          class = "manager-card",
          h3("Credit History"),
          DT::dataTableOutput(ns("credit_history_table"))
        )
      ),
      
      # Daily Records Tab
      tabPanel(
        "Daily Records",
        value = "daily_records",
        
        div(
          class = "manager-card",
          h3("View Specific Day Records"),
          p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);", 
            "Select any day from this month to view detailed records"),
          div(
            style = "max-width: 300px; margin-bottom: var(--space-6);",
            dateInput(ns("records_date"), "Select Date:", 
                     value = Sys.Date(),
                     min = as.Date(format(Sys.Date(), "%Y-%m-01")),
                     max = Sys.Date(),
                     format = "yyyy-mm-dd")
          ),
          
          # Daily Summary for Selected Date
          div(
            style = "margin-bottom: var(--space-6);",
            h4("Summary for Selected Day"),
            div(
              class = "daily-summary",
              div(class = "summary-card",
                div(class = "summary-label", "Total Income"),
                div(class = "summary-value", textOutput(ns("records_income")))
              ),
              div(class = "summary-card",
                div(class = "summary-label", "Total Customers"),
                div(class = "summary-value", textOutput(ns("records_customers")))
              ),
              div(class = "summary-card",
                div(class = "summary-label", "Total Expenses"),
                div(class = "summary-value", textOutput(ns("records_expenses")))
              ),
              div(class = "summary-card",
                div(class = "summary-label", "Net Profit"),
                div(class = "summary-value", style = "color: var(--barbazza-gold);", textOutput(ns("records_profit")))
              )
            )
          )
        ),
        
        # Transactions for Selected Date
        div(
          class = "manager-card",
          h4("Transactions"),
          DT::dataTableOutput(ns("records_transactions_table"))
        ),
        
        # Expenses for Selected Date
        div(
          class = "manager-card",
          h4("Expenses"),
          DT::dataTableOutput(ns("records_expenses_table"))
        ),
        
        # Barber Performance for Selected Date
        div(
          class = "manager-card",
          h4("Barber Performance"),
          DT::dataTableOutput(ns("records_barber_performance"))
        )
      ),
      
      # Monthly Closing Tab
      tabPanel(
        "Monthly Closing",
        value = "monthly_closing",
        
        div(
          class = "manager-card",
          h3("Close Month & Process Payments"),
          p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);", 
            "Calculate and pay barber salaries for the month"),
          
          # Month selector
          div(
            style = "max-width: 300px; margin-bottom: var(--space-6);",
            selectInput(ns("closing_month"), "Select Month to Close:", 
                       choices = NULL)
          ),
          
          # Warning message
          div(
            style = "background: var(--barbazza-warning); color: var(--barbazza-charcoal); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-6);",
            h4(style = "margin: 0 0 var(--space-2) 0;", "Important"),
            p(style = "margin: 0;", "Closing a month will:"),
            tags$ul(
              tags$li("Calculate final salaries for all barbers"),
              tags$li("Deduct recruitment advances"),
              tags$li("Deduct approved credit balances"),
              tags$li("Update recruitment balance (reduce by monthly deduction)"),
              tags$li("Record payment in monthly_salaries table"),
              tags$li("Lock the month (cannot be modified)")
            )
          )
        ),
        
        # Barbers Payment Summary
        div(
          class = "manager-card",
          h4("Barbers Payment Summary"),
          DT::dataTableOutput(ns("closing_barbers_summary"))
        ),
        
        # Process Payment Button
        div(
          class = "manager-card",
          style = "text-align: center;",
          actionButton(ns("process_monthly_payment_btn"), 
                      "Process All Payments & Close Month",
                      style = "background: var(--barbazza-gold); color: white; border: none; padding: var(--space-5) var(--space-8); border-radius: var(--radius-md); font-weight: bold; font-size: var(--text-xl); cursor: pointer;")
        ),
        
        # Payment History
        div(
          class = "manager-card",
          h4("Payment History"),
          DT::dataTableOutput(ns("payment_history_table"))
        )
      )
      )
    )
  )
}

# Manager Server
manager_server <- function(id, session_data) {
  moduleServer(id, function(input, output, session) {
    
    # Reactive values for refresh control
    rv <- reactiveValues(
      refresh_data = 0,
      service_prices = list(),  # Store service prices
      edit_transaction_id = NULL,
      delete_transaction_id = NULL
    )
    
    # Load active barbers
    load_barbers <- function() {
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
        cat("Error querying barbers:", e$message, "\n")
        return(data.frame(barber_id = integer(), barber_code = character(), full_name = character()))
      })
      
      if (nrow(barbers) == 0) {
        return(c("No active barbers" = ""))
      }
      
      choices <- setNames(barbers$barber_id, 
                         ifelse(is.na(barbers$full_name) | barbers$full_name == "",
                                barbers$barber_code,
                                paste0(barbers$full_name, " (", barbers$barber_code, ")")))
      return(choices)
    }
    
    # Load services
    load_services <- function() {
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      services <- tryCatch({
        dbGetQuery(con, "
          SELECT service_id, service_name, base_price
          FROM services
          WHERE is_active = TRUE
          ORDER BY service_name
        ")
      }, error = function(e) {
        cat("Error querying services:", e$message, "\n")
        return(data.frame(service_id = integer(), service_name = character(), base_price = numeric()))
      })
      
      if (nrow(services) == 0) {
        isolate({ rv$service_prices <- list() })
        return(c("No active services" = ""))
      }
      
      # Store prices in reactive values (isolated to prevent reactivity)
      prices_list <- setNames(as.list(services$base_price), as.character(services$service_id))
      isolate({ rv$service_prices <- prices_list })
      
      # Format each price individually
      formatted_prices <- character(nrow(services))
      for (i in 1:nrow(services)) {
        formatted_prices[i] <- format_currency(services$base_price[i])
      }
      
      choices <- setNames(services$service_id, 
                         paste0(services$service_name, " - ", formatted_prices))
      return(choices)
    }
    
    # Load expense categories
    load_expense_categories <- function() {
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      categories <- tryCatch({
        dbGetQuery(con, "
          SELECT category_id, category_name
          FROM expense_categories
          WHERE is_active = TRUE
          ORDER BY category_name
        ")
      }, error = function(e) {
        cat("Error querying categories:", e$message, "\n")
        return(data.frame(category_id = integer(), category_name = character()))
      })
      
      if (nrow(categories) == 0) {
        return(c("No categories" = ""))
      }
      
      choices <- setNames(categories$category_id, categories$category_name)
      return(choices)
    }
    
    # Track if dropdowns have been loaded
    dropdowns_loaded <- reactiveVal(FALSE)
    
    # Load dropdowns when manager tabs input exists (UI is rendered)
    observe({
      # Wait for the manager_tabs input to exist (means UI is rendered)
      req(input$manager_tabs)
      req(session_data$authenticated)
      req(session_data$user$role == "manager")
      
      # Load only once
      if (!dropdowns_loaded()) {
        cat("Manager UI detected - loading dropdowns...\n")
        
        # Load data immediately
        barber_choices <- load_barbers()
        cat("Barbers loaded:", length(barber_choices), "\n")
        
        service_choices <- load_services()
        cat("Services loaded:", length(service_choices), "\n")
        
        category_choices <- load_expense_categories()
        cat("Categories loaded:", length(category_choices), "\n")
        
        # Use delay to update UI after it's fully rendered
        shinyjs::delay(100, {
          cat("Updating dropdowns...\n")
          
          tryCatch({
            updateSelectInput(session, "service_barber", choices = barber_choices)
            updateSelectInput(session, "service_service", choices = service_choices)
            updateSelectInput(session, "expense_category", choices = category_choices)
            updateSelectInput(session, "expense_barber", choices = c("None" = "", barber_choices))
            
            cat("All manager dropdowns updated successfully!\n")
            dropdowns_loaded(TRUE)
          }, error = function(e) {
            cat("ERROR updating dropdowns:", e$message, "\n")
            print(e)
            showNotification(paste("Error:", e$message), type = "error", duration = 10)
          })
        })
      }
    }, priority = 100)
    
    # Auto-populate price when service is selected
    observeEvent(input$service_service, {
      # Safe check for service selection
      if (!is.null(input$service_service) && !is.na(input$service_service) && input$service_service != "") {
        service_id <- as.character(input$service_service)
        
        if (service_id %in% names(rv$service_prices)) {
          base_price <- rv$service_prices[[service_id]]
          
          if (!is.null(base_price) && !is.na(base_price)) {
            # Update price field
            updateNumericInput(session, "service_amount", value = base_price)
            
            # Show base price info
            shinyjs::html("base_price_info", paste("Base Price:", format_currency(base_price)))
            shinyjs::show("base_price_info")
          }
        }
      } else {
        shinyjs::hide("base_price_info")
      }
    })
    
    # Show/hide discount reason field based on price comparison
    observeEvent(input$service_amount, {
      # Check all conditions safely
      has_service <- !is.null(input$service_service) && !is.na(input$service_service) && input$service_service != ""
      has_amount <- !is.null(input$service_amount) && !is.na(input$service_amount)
      amount_valid <- has_amount && input$service_amount > 0
      
      if (has_service && amount_valid) {
        service_id <- as.character(input$service_service)
        
        if (service_id %in% names(rv$service_prices)) {
          base_price <- rv$service_prices[[service_id]]
          
          # Safe comparison
          if (!is.null(base_price) && !is.na(base_price) && input$service_amount < base_price) {
            # Show discount reason field
            shinyjs::show("discount_reason_container")
          } else {
            # Hide discount reason field
            shinyjs::hide("discount_reason_container")
            updateTextAreaInput(session, "discount_reason", value = "")
          }
        }
      } else {
        # Hide if conditions not met
        shinyjs::hide("discount_reason_container")
      }
    })
    
    # Load daily summary
    load_daily_summary <- function() {
      today <- Sys.Date()
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Daily income
      income <- dbGetQuery(con, paste0("
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE transaction_date = '", today, "'
      "))$total
      
      # Daily customers (count of transactions)
      customers <- dbGetQuery(con, paste0("
        SELECT COUNT(*) as count
        FROM transactions
        WHERE transaction_date = '", today, "'
      "))$count
      
      # Ensure it's an integer
      customers <- as.integer(customers)
      
      # Daily expenses
      expenses <- dbGetQuery(con, paste0("
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses
        WHERE expense_date = '", today, "'
      "))$total
      
      profit <- income - expenses
      
      return(list(
        income = income,
        customers = customers,
        expenses = expenses,
        profit = profit
      ))
    }
    
    # Daily summary outputs - refresh only on data change
    daily_summary <- reactive({
      rv$refresh_data  # Depend on this reactive value
      load_daily_summary()
    })
    
    # Load monthly summary
    load_monthly_summary <- function() {
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Current month date range
      current_month_start <- as.Date(format(Sys.Date(), "%Y-%m-01"))
      
      # Monthly income
      income <- dbGetQuery(con, "
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE transaction_date >= $1
        AND transaction_date < $1 + INTERVAL '1 month'
      ", params = list(current_month_start))$total
      
      # Monthly customers (count of transactions)
      customers <- dbGetQuery(con, "
        SELECT COUNT(*) as count
        FROM transactions
        WHERE transaction_date >= $1
        AND transaction_date < $1 + INTERVAL '1 month'
      ", params = list(current_month_start))$count
      
      customers <- as.integer(as.numeric(customers))
      
      # Monthly services count
      services <- dbGetQuery(con, "
        SELECT COUNT(*) as count
        FROM transactions
        WHERE transaction_date >= $1
        AND transaction_date < $1 + INTERVAL '1 month'
      ", params = list(current_month_start))$count
      
      services <- as.integer(as.numeric(services))
      
      # Monthly expenses
      expenses <- dbGetQuery(con, "
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses
        WHERE expense_date >= $1
        AND expense_date < $1 + INTERVAL '1 month'
      ", params = list(current_month_start))$total
      
      # Calculate profit
      profit <- income - expenses
      
      # Calculate average daily income (divide by days worked)
      days_worked <- dbGetQuery(con, "
        SELECT COUNT(DISTINCT transaction_date) as days
        FROM transactions
        WHERE transaction_date >= $1
        AND transaction_date < $1 + INTERVAL '1 month'
      ", params = list(current_month_start))$days
      
      days_count <- if(days_worked > 0) as.integer(days_worked) else 1
      avg_daily <- income / days_count
      
      return(list(
        income = income,
        customers = customers,
        services = services,
        expenses = expenses,
        profit = profit,
        avg_daily = avg_daily
      ))
    }
    
    # Monthly summary outputs
    monthly_summary <- reactive({
      rv$refresh_data  # Depend on this reactive value
      load_monthly_summary()
    })
    
    output$daily_income <- renderText({ format_currency(daily_summary()$income) })
    output$daily_customers <- renderText({ 
      as.character(as.integer(daily_summary()$customers))
    })
    output$daily_expenses <- renderText({ format_currency(daily_summary()$expenses) })
    output$daily_profit <- renderText({ format_currency(daily_summary()$profit) })
    
    # Monthly summary outputs
    output$monthly_income <- renderText({ format_currency(monthly_summary()$income) })
    output$monthly_customers <- renderText({ as.character(monthly_summary()$customers) })
    output$monthly_services <- renderText({ as.character(monthly_summary()$services) })
    output$monthly_expenses <- renderText({ format_currency(monthly_summary()$expenses) })
    output$monthly_profit <- renderText({ format_currency(monthly_summary()$profit) })
    output$monthly_avg_daily <- renderText({ format_currency(monthly_summary()$avg_daily) })
    
    # Income trend chart for manager
    observe({
      rv$refresh_data  # React to data changes
      
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
          if (window.managerIncomeChart) {
            window.managerIncomeChart.destroy();
          }
          
          ctx = ctx.getContext('2d');
          window.managerIncomeChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: %s,
              datasets: [{
                label: 'Total Income',
                data: %s,
                borderColor: '#0a0a0a',
                backgroundColor: 'rgba(10, 10, 10, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 7,
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
    
    # Add service transaction
    observeEvent(input$add_service_btn, {
      # Validation with NA checks
      if (is.null(input$service_barber) || is.na(input$service_barber) || input$service_barber == "") {
        showNotification("Please select a barber", type = "error", duration = 3)
        return()
      }
      
      if (is.null(input$service_service) || is.na(input$service_service) || input$service_service == "") {
        showNotification("Please select a service", type = "error", duration = 3)
        return()
      }
      
      if (is.null(input$service_amount) || is.na(input$service_amount) || input$service_amount <= 0) {
        showNotification("Please enter a valid amount", type = "error", duration = 3)
        return()
      }
      
      # Check if discount was given and reason is required
      service_id <- as.character(input$service_service)
      if (service_id %in% names(rv$service_prices)) {
        base_price <- rv$service_prices[[service_id]]
        
        # Safe comparison with NA check
        if (!is.null(base_price) && !is.na(base_price) && 
            !is.null(input$service_amount) && !is.na(input$service_amount) &&
            input$service_amount < base_price) {
          # Discount given - require reason
          if (is.null(input$discount_reason) || is.na(input$discount_reason) || 
              trimws(input$discount_reason) == "") {
            showNotification("Please provide a reason for the discount", type = "error", duration = 4)
            return()
          }
        }
      }
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        # Get service name
        service_name <- get_service_name(as.integer(input$service_service))
        
        # Build notes with discount reason if applicable
        final_notes <- input$service_notes
        if (!is.null(input$discount_reason) && trimws(input$discount_reason) != "") {
          service_id <- as.character(input$service_service)
          base_price <- rv$service_prices[[service_id]]
          discount_amount <- base_price - input$service_amount
          
          discount_info <- paste0(
            "DISCOUNT: ", format_currency(discount_amount), 
            " (Base: ", format_currency(base_price), 
            " → Final: ", format_currency(input$service_amount), ")\n",
            "REASON: ", input$discount_reason
          )
          
          if (trimws(final_notes) != "") {
            final_notes <- paste0(discount_info, "\n---\n", final_notes)
          } else {
            final_notes <- discount_info
          }
        }
        
        # Insert transaction
        query <- "
          INSERT INTO transactions (transaction_date, barber_id, service_id, service_name, amount, customer_name, notes, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "
        
        dbExecute(con, query, params = list(
          Sys.Date(),
          as.integer(input$service_barber),
          as.integer(input$service_service),
          service_name,
          as.numeric(input$service_amount),
          ifelse(is.null(input$service_customer) || input$service_customer == "", NA, input$service_customer),
          ifelse(trimws(final_notes) == "", NA, final_notes),
          session_data$user$user_id
        ))
        
        # Reset form
        updateSelectInput(session, "service_barber", selected = "")
        updateSelectInput(session, "service_service", selected = "")
        updateNumericInput(session, "service_amount", value = 0)
        updateTextInput(session, "service_customer", value = "")
        updateTextAreaInput(session, "service_notes", value = "")
        updateTextAreaInput(session, "discount_reason", value = "")
        shinyjs::hide("discount_reason_container")
        shinyjs::hide("base_price_info")
        
        # Trigger refresh
        rv$refresh_data <- rv$refresh_data + 1
        
        showNotification("Service transaction added successfully!", type = "message", duration = 3)
      }, error = function(e) {
        showNotification(paste("Error adding transaction:", e$message), type = "error", duration = 5)
      })
    })
    
    # Today's transactions table - refresh only on data change
    output$today_transactions <- DT::renderDataTable({
      rv$refresh_data  # Depend on this reactive value
      
      today <- Sys.Date()
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      transactions <- dbGetQuery(con, paste0("
        SELECT 
          t.transaction_id,
          t.barber_id,
          t.service_id,
          b.barber_code,
          t.service_name,
          t.amount,
          t.customer_name,
          t.notes,
          t.created_at,
          EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at)) / 3600 as hours_ago
        FROM transactions t
        JOIN barbers b ON t.barber_id = b.barber_id
        WHERE t.transaction_date = '", today, "'
        ORDER BY t.created_at DESC
      "))
      
      if (nrow(transactions) > 0) {
        # Create namespaced IDs outside sapply
        edit_id <- session$ns("edit_transaction_action")
        delete_id <- session$ns("delete_transaction_action")
        
        # Format for display
        transactions_display <- data.frame(
          ID = transactions$transaction_id,
          Barber = transactions$barber_code,
          Service = transactions$service_name,
          Amount = sapply(transactions$amount, format_currency),
          Customer = ifelse(is.na(transactions$customer_name), "-", transactions$customer_name),
          Time = sapply(transactions$created_at, format_datetime),
          Actions = sapply(1:nrow(transactions), function(i) {
            trans_id <- transactions$transaction_id[i]
            hours_ago <- transactions$hours_ago[i]
            
            # Only allow edit/delete within 1 hour
            if (hours_ago <= 1) {
              sprintf(
                '<button class="btn-action" onclick="Shiny.setInputValue(\'%s\', %d, {priority: \'event\'})">Edit</button>
                 <button class="btn-action" style="background: var(--barbazza-gold-dark);" onclick="Shiny.setInputValue(\'%s\', %d, {priority: \'event\'})">Delete</button>',
                edit_id, trans_id,
                delete_id, trans_id
              )
            } else {
              '<span style="color: var(--barbazza-slate);">Locked</span>'
            }
          }),
          check.names = FALSE
        )
      } else {
        transactions_display <- data.frame(
          ID = integer(), Barber = character(), Service = character(),
          Amount = character(), Customer = character(), Time = character(), Actions = character(),
          check.names = FALSE
        )
      }
      
      DT::datatable(
        transactions_display,
        options = list(
          pageLength = 15,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE,
        escape = FALSE,
        selection = 'none'
      )
    })
    
    # Edit transaction
    observeEvent(input$edit_transaction_action, {
      trans_id <- input$edit_transaction_action
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Get transaction details
      trans <- dbGetQuery(con, "
        SELECT t.*, 
               EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at)) / 3600 as hours_ago
        FROM transactions t
        WHERE t.transaction_id = $1
      ", params = list(trans_id))
      
      if (nrow(trans) > 0 && trans$hours_ago <= 1) {
        # Show edit modal
        showModal(
          modalDialog(
            title = "Edit Transaction",
            size = "m",
            
            selectInput(session$ns("edit_trans_barber"), "Barber *", 
                       choices = load_barbers(), selected = trans$barber_id),
            selectInput(session$ns("edit_trans_service"), "Service *", 
                       choices = load_services(), selected = trans$service_id),
            numericInput(session$ns("edit_trans_amount"), "Amount (RWF) *", 
                        value = trans$amount, min = 0, step = 100),
            textInput(session$ns("edit_trans_customer"), "Customer Name", 
                     value = ifelse(is.na(trans$customer_name), "", trans$customer_name)),
            textAreaInput(session$ns("edit_trans_notes"), "Notes", 
                         value = ifelse(is.na(trans$notes), "", trans$notes), rows = 3),
            
            footer = tagList(
              modalButton("Cancel"),
              actionButton(session$ns("save_edit_transaction"), "Update Transaction", 
                          style = "background: var(--barbazza-gold); color: white; border: none;")
            )
          )
        )
        
        rv$edit_transaction_id <- trans_id
      } else {
        showNotification("Transaction can only be edited within 1 hour of creation", 
                        type = "error", duration = 4)
      }
    })
    
    # Save edited transaction
    observeEvent(input$save_edit_transaction, {
      req(rv$edit_transaction_id)
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        # Check time window again
        trans <- dbGetQuery(con, "
          SELECT EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 3600 as hours_ago
          FROM transactions
          WHERE transaction_id = $1
        ", params = list(rv$edit_transaction_id))
        
        if (nrow(trans) == 0 || trans$hours_ago > 1) {
          showNotification("Transaction can no longer be edited (1 hour limit)", 
                          type = "error", duration = 4)
          return()
        }
        
        # Get service name
        service_name <- get_service_name(as.integer(input$edit_trans_service))
        
        # Update transaction
        dbExecute(con, "
          UPDATE transactions
          SET barber_id = $1, service_id = $2, service_name = $3, 
              amount = $4, customer_name = $5, notes = $6
          WHERE transaction_id = $7
        ", params = list(
          as.integer(input$edit_trans_barber),
          as.integer(input$edit_trans_service),
          service_name,
          as.numeric(input$edit_trans_amount),
          ifelse(input$edit_trans_customer == "", NA, input$edit_trans_customer),
          ifelse(input$edit_trans_notes == "", NA, input$edit_trans_notes),
          rv$edit_transaction_id
        ))
        
        rv$refresh_data <- rv$refresh_data + 1
        removeModal()
        showNotification("Transaction updated successfully!", type = "message", duration = 3)
      }, error = function(e) {
        showNotification(paste("Error updating transaction:", e$message), type = "error", duration = 5)
      })
    })
    
    # Delete transaction
    observeEvent(input$delete_transaction_action, {
      trans_id <- input$delete_transaction_action
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Get transaction details and check time
      trans <- dbGetQuery(con, "
        SELECT t.service_name, t.amount, t.customer_name,
               EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at)) / 3600 as hours_ago
        FROM transactions t
        WHERE t.transaction_id = $1
      ", params = list(trans_id))
      
      if (nrow(trans) > 0 && trans$hours_ago <= 1) {
        showModal(
          modalDialog(
            title = "Delete Transaction",
            size = "s",
            
            p(paste("Are you sure you want to delete this transaction?")),
            tags$ul(
              tags$li(strong("Service: "), trans$service_name),
              tags$li(strong("Amount: "), format_currency(trans$amount)),
              tags$li(strong("Customer: "), ifelse(is.na(trans$customer_name), "N/A", trans$customer_name))
            ),
            p(style = "color: var(--barbazza-gold-dark);", 
              "Warning: This action cannot be undone."),
            
            footer = tagList(
              modalButton("Cancel"),
              actionButton(session$ns("confirm_delete_transaction"), "Delete", 
                          style = "background: var(--barbazza-gold-dark); color: white; border: none;")
            )
          )
        )
        
        rv$delete_transaction_id <- trans_id
      } else {
        showNotification("Transaction can only be deleted within 1 hour of creation", 
                        type = "error", duration = 4)
      }
    })
    
    # Confirm delete transaction
    observeEvent(input$confirm_delete_transaction, {
      req(rv$delete_transaction_id)
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        # Check time window again
        trans <- dbGetQuery(con, "
          SELECT EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 3600 as hours_ago
          FROM transactions
          WHERE transaction_id = $1
        ", params = list(rv$delete_transaction_id))
        
        if (nrow(trans) == 0 || trans$hours_ago > 1) {
          showNotification("Transaction can no longer be deleted (1 hour limit)", 
                          type = "error", duration = 4)
          return()
        }
        
        # Delete transaction
        dbExecute(con, "DELETE FROM transactions WHERE transaction_id = $1", 
                 params = list(rv$delete_transaction_id))
        
        rv$refresh_data <- rv$refresh_data + 1
        removeModal()
        showNotification("Transaction deleted successfully!", type = "message", duration = 3)
      }, error = function(e) {
        showNotification(paste("Error deleting transaction:", e$message), type = "error", duration = 5)
      })
    })
    
    # Add expense
    observeEvent(input$add_expense_btn, {
      if (is.null(input$expense_category) || input$expense_category == "") {
        showNotification("Please select a category", type = "error")
        return()
      }
      
      if (is.null(input$expense_amount) || input$expense_amount <= 0) {
        showNotification("Please enter a valid amount", type = "error")
        return()
      }
      
      if (input$expense_description == "") {
        showNotification("Please enter a description", type = "error")
        return()
      }
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        query <- "
          INSERT INTO expenses (expense_date, category_id, expense_type, barber_id, description, amount, receipt_number, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "
        
        barber_id <- if (input$expense_type == "barber" && input$expense_barber != "") {
          as.integer(input$expense_barber)
        } else {
          NA
        }
        
        dbExecute(con, query, params = list(
          input$expense_date,
          as.integer(input$expense_category),
          input$expense_type,
          barber_id,
          input$expense_description,
          as.numeric(input$expense_amount),
          ifelse(input$expense_receipt == "", NA, input$expense_receipt),
          session_data$user$user_id
        ))
        
        # Reset form
        updateDateInput(session, "expense_date", value = Sys.Date())
        updateSelectInput(session, "expense_category", selected = "")
        updateSelectInput(session, "expense_type", selected = "shop")
        updateSelectInput(session, "expense_barber", selected = "")
        updateTextInput(session, "expense_description", value = "")
        updateNumericInput(session, "expense_amount", value = 0)
        updateTextInput(session, "expense_receipt", value = "")
        
        # Trigger refresh
        rv$refresh_data <- rv$refresh_data + 1
        
        showNotification("Expense recorded successfully!", type = "message")
      }, error = function(e) {
        showNotification(paste("Error recording expense:", e$message), type = "error")
      })
    })
    
    # Today's expenses table - refresh only on data change
    output$today_expenses <- DT::renderDataTable({
      rv$refresh_data  # Depend on this reactive value
      
      today <- Sys.Date()
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      expenses <- dbGetQuery(con, paste0("
        SELECT 
          e.expense_id,
          ec.category_name,
          e.expense_type,
          e.description,
          e.amount,
          e.receipt_number,
          e.created_at
        FROM expenses e
        JOIN expense_categories ec ON e.category_id = ec.category_id
        WHERE e.expense_date = '", today, "'
        ORDER BY e.created_at DESC
      "))
      
      if (nrow(expenses) > 0) {
        expenses$amount <- format_currency(expenses$amount)
        expenses$created_at <- format_datetime(expenses$created_at)
      }
      
      DT::datatable(
        expenses,
        options = list(
          pageLength = 15,
          scrollX = TRUE
        ),
        rownames = FALSE
      )
    })
    
    # Barber performance table - refresh only on data change
    output$barber_performance <- DT::renderDataTable({
      rv$refresh_data  # Depend on this reactive value
      
      today <- Sys.Date()
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      performance <- dbGetQuery(con, paste0("
        SELECT 
          b.barber_code,
          COUNT(t.transaction_id) as services_count,
          COALESCE(SUM(t.amount), 0) as total_income
        FROM barbers b
        LEFT JOIN transactions t ON b.barber_id = t.barber_id AND t.transaction_date = '", today, "'
        WHERE b.is_active = TRUE
        GROUP BY b.barber_id, b.barber_code
        ORDER BY total_income DESC
      "))
      
      if (nrow(performance) > 0) {
        performance$total_income <- format_currency(performance$total_income)
      }
      
      DT::datatable(
        performance,
        options = list(
          pageLength = 15,
          scrollX = TRUE
        ),
        rownames = FALSE,
        colnames = c("Barber Code", "Services", "Total Income")
      )
    })
    
    # Generate daily report
    observeEvent(input$generate_daily_report_btn, {
      today <- Sys.Date()
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        # Get summary data
        summary <- load_daily_summary()
        
        # Get barber breakdown
        barber_breakdown <- dbGetQuery(con, paste0("
          SELECT 
            b.barber_code,
            COUNT(t.transaction_id) as services_count,
            COALESCE(SUM(t.amount), 0) as total_income
          FROM barbers b
          LEFT JOIN transactions t ON b.barber_id = t.barber_id AND t.transaction_date = '", today, "'
          WHERE b.is_active = TRUE
          GROUP BY b.barber_id, b.barber_code
          ORDER BY total_income DESC
        "))
        
        # Check if report already exists
        existing <- dbGetQuery(con, paste0("
          SELECT report_id FROM daily_reports WHERE report_date = '", today, "'
        "))
        
        if (nrow(existing) > 0) {
          # Update existing report
          dbExecute(con, paste0("
            UPDATE daily_reports
            SET total_customers = ", summary$customers, ",
                total_income = ", summary$income, ",
                total_expenses = ", summary$expenses, ",
                net_profit = ", summary$profit, "
            WHERE report_date = '", today, "'
          "))
        } else {
          # Create new report
          dbExecute(con, paste0("
            INSERT INTO daily_reports (report_date, total_customers, total_income, total_expenses, net_profit, created_by)
            VALUES ('", today, "', ", summary$customers, ", ", summary$income, ", ", summary$expenses, ", ", summary$profit, ", ", session_data$user$user_id, ")
          "))
        }
        
        # Generate report HTML
        report_html <- paste0("
          <div style='background: var(--barbazza-slate); padding: var(--space-6); border-radius: var(--radius-md);'>
            <h3 style='color: var(--barbazza-gold); margin-bottom: var(--space-4);'>Daily Report - ", format_date(today), "</h3>
            <div style='display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); margin-bottom: var(--space-6);'>
              <div><strong>Total Customers:</strong> ", summary$customers, "</div>
              <div><strong>Total Income:</strong> ", format_currency(summary$income), "</div>
              <div><strong>Total Expenses:</strong> ", format_currency(summary$expenses), "</div>
              <div><strong>Net Profit:</strong> ", format_currency(summary$profit), "</div>
            </div>
            <h4 style='color: var(--barbazza-gold); margin-bottom: var(--space-3);'>Barber Performance</h4>
            <table style='width: 100%; border-collapse: collapse;'>
              <thead>
                <tr style='border-bottom: 1px solid var(--barbazza-graphite);'>
                  <th style='padding: var(--space-2); text-align: left;'>Barber</th>
                  <th style='padding: var(--space-2); text-align: right;'>Services</th>
                  <th style='padding: var(--space-2); text-align: right;'>Income</th>
                </tr>
              </thead>
              <tbody>
        ")
        
        for (i in 1:nrow(barber_breakdown)) {
          report_html <- paste0(report_html, "
            <tr style='border-bottom: 1px solid var(--barbazza-graphite);'>
              <td style='padding: var(--space-2);'>", barber_breakdown$barber_code[i], "</td>
              <td style='padding: var(--space-2); text-align: right;'>", barber_breakdown$services_count[i], "</td>
              <td style='padding: var(--space-2); text-align: right;'>", format_currency(barber_breakdown$total_income[i]), "</td>
            </tr>
          ")
        }
        
        report_html <- paste0(report_html, "
              </tbody>
            </table>
          </div>
        ")
        
        output$daily_report_content <- renderUI({
          HTML(report_html)
        })
        
        showNotification("Daily report generated successfully!", type = "message")
      }, error = function(e) {
        showNotification(paste("Error generating report:", e$message), type = "error")
      })
    })
    
    # ==========================================================================
    # CREDIT APPROVAL SYSTEM
    # ==========================================================================
    
    # Reactive value for credit refresh
    rv$refresh_credits <- 0
    
    # Pending credits table
    output$pending_credits_table <- DT::renderDataTable({
      rv$refresh_credits  # React to changes
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      credits <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            c.credit_id,
            b.barber_code,
            u.full_name as barber_name,
            c.request_date,
            c.amount,
            c.reason
          FROM barber_credits c
          JOIN barbers b ON c.barber_id = b.barber_id
          LEFT JOIN users u ON b.user_id = u.user_id
          WHERE c.status = 'pending'
          ORDER BY c.request_date DESC
        ")
      }, error = function(e) {
        data.frame()
      })
      
      if (nrow(credits) == 0) {
        return(DT::datatable(
          data.frame(Message = "No pending credit requests"),
          options = list(dom = 't'),
          rownames = FALSE
        ))
      }
      
      # Format data
      credits$request_date <- format(as.Date(credits$request_date), "%b %d, %Y")
      credits$amount <- sapply(credits$amount, format_currency)
      
      # Add action buttons
      approve_id <- session$ns("approve_credit_action")
      reject_id <- session$ns("reject_credit_action")
      
      credits$Actions <- sapply(1:nrow(credits), function(i) {
        sprintf(
          '<button onclick="Shiny.setInputValue(\'%s\', %d, {priority: \'event\'})" class="btn-action" style="background: var(--barbazza-gold); color: white; margin-right: 5px;">Approve</button>
           <button onclick="Shiny.setInputValue(\'%s\', %d, {priority: \'event\'})" class="btn-action" style="background: var(--barbazza-gold-dark); color: white;">Reject</button>',
          approve_id, credits$credit_id[i],
          reject_id, credits$credit_id[i]
        )
      })
      
      DT::datatable(
        credits[, c("barber_code", "barber_name", "request_date", "amount", "reason", "Actions")],
        options = list(
          pageLength = 10,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE,
        colnames = c("Barber Code", "Barber Name", "Request Date", "Amount", "Reason", "Actions"),
        escape = FALSE
      )
    })
    
    # Approve credit
    observeEvent(input$approve_credit_action, {
      credit_id <- input$approve_credit_action
      
      showModal(modalDialog(
        title = "Approve Credit Request",
        numericInput(session$ns("approve_monthly_deduction"), "Monthly Deduction Amount (RWF)", 
                    value = 0, min = 0, step = 1000),
        textAreaInput(session$ns("approve_notes"), "Notes (Optional)", value = "", rows = 3),
        footer = tagList(
          actionButton(session$ns("confirm_approve_credit"), "Approve Credit",
                      style = "background: var(--barbazza-gold); color: white;"),
          modalButton("Cancel")
        )
      ))
      
      rv$current_credit_id <- credit_id
    })
    
    # Confirm approval
    observeEvent(input$confirm_approve_credit, {
      req(rv$current_credit_id)
      
      monthly_deduction <- input$approve_monthly_deduction
      notes <- trimws(input$approve_notes)
      
      if (is.null(monthly_deduction) || is.na(monthly_deduction) || monthly_deduction <= 0) {
        showNotification("Please enter a valid monthly deduction amount", type = "error")
        return()
      }
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        # Update credit status
        dbExecute(con, "
          UPDATE barber_credits 
          SET status = 'approved',
              approved_by = $1,
              approved_date = CURRENT_TIMESTAMP,
              monthly_deduction = $2,
              notes = $3
          WHERE credit_id = $4
        ", params = list(
          session_data$user$user_id,
          monthly_deduction,
          notes,
          rv$current_credit_id
        ))
        
        log_info("MANAGER", paste("Credit", rv$current_credit_id, "approved by", session_data$user$username))
        
        showNotification("Credit request approved successfully!", type = "message")
        removeModal()
        rv$refresh_credits <- rv$refresh_credits + 1
        rv$current_credit_id <- NULL
        
      }, error = function(e) {
        log_error("MANAGER", paste("Error approving credit:", e$message))
        showNotification("Failed to approve credit. Please try again.", type = "error")
      })
    })
    
    # Reject credit
    observeEvent(input$reject_credit_action, {
      credit_id <- input$reject_credit_action
      
      showModal(modalDialog(
        title = "Reject Credit Request",
        p("Are you sure you want to reject this credit request?"),
        textAreaInput(session$ns("reject_reason"), "Reason for Rejection", value = "", rows = 3),
        footer = tagList(
          actionButton(session$ns("confirm_reject_credit"), "Reject Credit",
                      style = "background: var(--barbazza-gold-dark); color: white;"),
          modalButton("Cancel")
        )
      ))
      
      rv$current_credit_id <- credit_id
    })
    
    # Confirm rejection
    observeEvent(input$confirm_reject_credit, {
      req(rv$current_credit_id)
      
      reason <- trimws(input$reject_reason)
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        dbExecute(con, "
          UPDATE barber_credits 
          SET status = 'rejected',
              approved_by = $1,
              approved_date = CURRENT_TIMESTAMP,
              notes = $2
          WHERE credit_id = $3
        ", params = list(
          session_data$user$user_id,
          reason,
          rv$current_credit_id
        ))
        
        log_info("MANAGER", paste("Credit", rv$current_credit_id, "rejected by", session_data$user$username))
        
        showNotification("Credit request rejected", type = "message")
        removeModal()
        rv$refresh_credits <- rv$refresh_credits + 1
        rv$current_credit_id <- NULL
        
      }, error = function(e) {
        log_error("MANAGER", paste("Error rejecting credit:", e$message))
        showNotification("Failed to reject credit. Please try again.", type = "error")
      })
    })
    
    # Active credits table
    output$active_credits_table <- DT::renderDataTable({
      rv$refresh_credits
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      credits <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            b.barber_code,
            u.full_name as barber_name,
            c.request_date,
            c.amount as original_amount,
            c.monthly_deduction,
            c.remaining_balance,
            c.approved_date
          FROM barber_credits c
          JOIN barbers b ON c.barber_id = b.barber_id
          LEFT JOIN users u ON b.user_id = u.user_id
          WHERE c.status = 'approved' AND c.remaining_balance > 0
          ORDER BY c.approved_date DESC
        ")
      }, error = function(e) {
        data.frame()
      })
      
      if (nrow(credits) == 0) {
        return(DT::datatable(
          data.frame(Message = "No active credits"),
          options = list(dom = 't'),
          rownames = FALSE
        ))
      }
      
      # Format data
      credits$request_date <- format(as.Date(credits$request_date), "%b %d, %Y")
      credits$approved_date <- format(as.POSIXct(credits$approved_date), "%b %d, %Y")
      credits$original_amount <- sapply(credits$original_amount, format_currency)
      credits$monthly_deduction <- sapply(credits$monthly_deduction, format_currency)
      credits$remaining_balance <- sapply(credits$remaining_balance, format_currency)
      
      DT::datatable(
        credits,
        options = list(
          pageLength = 10,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE,
        colnames = c("Barber Code", "Barber Name", "Request Date", "Original Amount", 
                    "Monthly Deduction", "Remaining Balance", "Approved Date")
      )
    })
    
    # Credit history table
    output$credit_history_table <- DT::renderDataTable({
      rv$refresh_credits
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      credits <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            b.barber_code,
            u.full_name as barber_name,
            c.request_date,
            c.amount,
            c.status,
            c.approved_date,
            u2.full_name as approved_by
          FROM barber_credits c
          JOIN barbers b ON c.barber_id = b.barber_id
          LEFT JOIN users u ON b.user_id = u.user_id
          LEFT JOIN users u2 ON c.approved_by = u2.user_id
          ORDER BY c.request_date DESC
          LIMIT 50
        ")
      }, error = function(e) {
        data.frame()
      })
      
      if (nrow(credits) == 0) {
        return(DT::datatable(
          data.frame(Message = "No credit history"),
          options = list(dom = 't'),
          rownames = FALSE
        ))
      }
      
      # Format data
      credits$request_date <- format(as.Date(credits$request_date), "%b %d, %Y")
      credits$amount <- sapply(credits$amount, format_currency)
      credits$status <- sapply(credits$status, function(s) {
        switch(s,
          "pending" = "Pending",
          "approved" = "Approved",
          "rejected" = "Rejected",
          s
        )
      })
      credits$approved_date <- ifelse(
        is.na(credits$approved_date),
        "",
        format(as.POSIXct(credits$approved_date), "%b %d, %Y")
      )
      credits$approved_by <- ifelse(is.na(credits$approved_by), "", credits$approved_by)
      
      DT::datatable(
        credits,
        options = list(
          pageLength = 20,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE,
        colnames = c("Barber Code", "Barber Name", "Request Date", "Amount", "Status", "Approved Date", "Approved By")
      )
    })
    
    # Daily records for selected date
    records_date_data <- reactive({
      req(input$records_date)
      
      selected_date <- input$records_date
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
    
    # Records date outputs
    output$records_income <- renderText({ format_currency(records_date_data()$income) })
    output$records_customers <- renderText({ as.character(records_date_data()$customers) })
    output$records_expenses <- renderText({ format_currency(records_date_data()$expenses) })
    output$records_profit <- renderText({ format_currency(records_date_data()$profit) })
    
    # Transactions table for selected date
    output$records_transactions_table <- DT::renderDataTable({
      req(input$records_date)
      
      selected_date <- input$records_date
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      transactions <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            b.barber_code as \"Barber\",
            t.service_name as \"Service\",
            t.customer_name as \"Customer\",
            t.amount as \"Amount\",
            TO_CHAR(t.created_at, 'HH24:MI') as \"Time\"
          FROM transactions t
          LEFT JOIN barbers b ON t.barber_id = b.barber_id
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
          pageLength = 10,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE
      )
    })
    
    # Expenses table for selected date
    output$records_expenses_table <- DT::renderDataTable({
      req(input$records_date)
      
      selected_date <- input$records_date
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      expenses <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            c.category_name as \"Category\",
            e.description as \"Description\",
            e.amount as \"Amount\",
            TO_CHAR(e.created_at, 'HH24:MI') as \"Time\"
          FROM expenses e
          LEFT JOIN expense_categories c ON e.category_id = c.category_id
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
          pageLength = 10,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE
      )
    })
    
    # Barber performance for selected date
    output$records_barber_performance <- DT::renderDataTable({
      req(input$records_date)
      
      selected_date <- input$records_date
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      performance <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            b.barber_code as \"Barber Code\",
            u.full_name as \"Barber Name\",
            COUNT(t.transaction_id) as \"Services\",
            COUNT(t.transaction_id) as \"Customers\",
            COALESCE(SUM(t.amount), 0) as \"Total Income\"
          FROM barbers b
          LEFT JOIN users u ON b.user_id = u.user_id
          LEFT JOIN transactions t ON b.barber_id = t.barber_id AND t.transaction_date = $1
          WHERE b.is_active = TRUE
          GROUP BY b.barber_id, b.barber_code, u.full_name
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
      performance$`Total Income` <- sapply(performance$`Total Income`, format_currency)
      
      DT::datatable(
        performance,
        options = list(
          pageLength = 10,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE
      )
    })
    
    # ===== MONTHLY CLOSING & PAYMENTS =====
    
    # Load available months for closing - trigger when tab is accessed
    observeEvent(input$manager_tabs, {
      req(input$manager_tabs == "monthly_closing")
      
      cat("=== LOADING MONTHS FOR DROPDOWN ===\n")
      cat("Manager tabs value:", input$manager_tabs, "\n")
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Get months that have transactions - excluding already paid months
      months <- tryCatch({
        cat("Executing query...\n")
        result <- dbGetQuery(con, "
          SELECT DISTINCT 
            TO_CHAR(transaction_date, 'YYYY-MM') as month_key,
            TO_CHAR(transaction_date, 'Month YYYY') as month_label
          FROM transactions
          WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
          AND TO_CHAR(transaction_date, 'YYYY-MM') NOT IN (
            SELECT DISTINCT 
              LPAD(year::text, 4, '0') || '-' || LPAD(month::text, 2, '0')
            FROM monthly_salaries
            WHERE status = 'paid'
          )
          ORDER BY month_key DESC
        ")
        cat("Query successful! Rows returned:", nrow(result), "\n")
        if (nrow(result) > 0) {
          cat("Months found:\n")
          print(result)
        }
        result
      }, error = function(e) {
        cat("Error loading months:", e$message, "\n")
        # If error (e.g., monthly_salaries doesn't exist), show all months
        cat("Falling back to showing all months...\n")
        tryCatch({
          dbGetQuery(con, "
            SELECT DISTINCT 
              TO_CHAR(transaction_date, 'YYYY-MM') as month_key,
              TO_CHAR(transaction_date, 'Month YYYY') as month_label
            FROM transactions
            WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
            ORDER BY month_key DESC
          ")
        }, error = function(e2) {
          cat("Fallback query also failed:", e2$message, "\n")
          data.frame(month_key = character(), month_label = character())
        })
      })
      
      if (nrow(months) > 0) {
        choices <- setNames(months$month_key, months$month_label)
        cat("Updating dropdown with", length(choices), "choices\n")
        cat("Choices:\n")
        print(choices)
        updateSelectInput(session, "closing_month", choices = choices)
        cat("Dropdown updated successfully!\n")
      } else {
        cat("No months found - setting 'No months available' message\n")
        updateSelectInput(session, "closing_month", 
                         choices = c("No months available to close" = ""))
      }
      cat("=== DROPDOWN LOADING COMPLETE ===\n\n")
    })
    
    # Calculate payment summary for selected month
    closing_summary <- reactive({
      req(input$closing_month, input$closing_month != "")
      
      # Parse month
      month_parts <- strsplit(input$closing_month, "-")[[1]]
      year <- as.integer(month_parts[1])
      month <- as.integer(month_parts[2])
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Get all active barbers with their financial data
      barbers_data <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            b.barber_id,
            b.barber_code,
            u.full_name,
            b.commission_rate,
            COALESCE(b.advance_monthly_deduction, 0) as recruitment_deduction,
            COALESCE(b.advance_remaining, 0) as recruitment_balance,
            COALESCE(
              (SELECT SUM(amount) 
               FROM transactions 
               WHERE barber_id = b.barber_id 
               AND EXTRACT(YEAR FROM transaction_date) = $1
               AND EXTRACT(MONTH FROM transaction_date) = $2), 
              0
            ) as gross_income,
            COALESCE(
              (SELECT SUM(monthly_deduction)
               FROM barber_credits
               WHERE barber_id = b.barber_id
               AND status = 'approved'
               AND remaining_balance > 0),
              0
            ) as credit_deduction
          FROM barbers b
          LEFT JOIN users u ON b.user_id = u.user_id
          WHERE b.is_active = TRUE
          ORDER BY b.barber_code
        ", params = list(year, month))
      }, error = function(e) {
        data.frame()
      })
      
      if (nrow(barbers_data) == 0) {
        return(data.frame())
      }
      
      # Calculate salaries
      barbers_data$commission_earned <- barbers_data$gross_income * (barbers_data$commission_rate / 100)
      barbers_data$total_deductions <- barbers_data$recruitment_deduction + barbers_data$credit_deduction
      barbers_data$net_salary <- barbers_data$commission_earned - barbers_data$total_deductions
      
      # Ensure net salary is not negative
      barbers_data$net_salary <- pmax(barbers_data$net_salary, 0)
      
      return(barbers_data)
    })
    
    # Display payment summary table
    output$closing_barbers_summary <- DT::renderDataTable({
      summary_data <- closing_summary()
      
      if (nrow(summary_data) == 0) {
        return(DT::datatable(
          data.frame(Message = "No barber data for selected month"),
          options = list(dom = 't'),
          rownames = FALSE
        ))
      }
      
      # Format for display
      display_data <- data.frame(
        "Barber Code" = summary_data$barber_code,
        "Barber Name" = summary_data$full_name,
        "Gross Income" = sapply(summary_data$gross_income, format_currency),
        "Commission Rate" = paste0(summary_data$commission_rate, "%"),
        "Commission Earned" = sapply(summary_data$commission_earned, format_currency),
        "Recruitment Deduction" = sapply(summary_data$recruitment_deduction, format_currency),
        "Credit Deduction" = sapply(summary_data$credit_deduction, format_currency),
        "Total Deductions" = sapply(summary_data$total_deductions, format_currency),
        "Net Salary" = sapply(summary_data$net_salary, format_currency),
        check.names = FALSE
      )
      
      DT::datatable(
        display_data,
        options = list(
          pageLength = 20,
          scrollX = TRUE,
          dom = 't',
          searching = FALSE
        ),
        rownames = FALSE
      )
    })
    
    # Payment history
    output$payment_history_table <- DT::renderDataTable({
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      history <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            b.barber_code as \"Barber Code\",
            u.full_name as \"Barber Name\",
            ms.month as \"Month\",
            ms.year as \"Year\",
            ms.gross_income as \"Gross Income\",
            ms.commission_earned as \"Commission\",
            ms.recruitment_deduction as \"Recruitment Ded.\",
            ms.credit_deduction as \"Credit Ded.\",
            ms.net_salary as \"Net Salary\",
            TO_CHAR(ms.paid_date, 'YYYY-MM-DD HH24:MI') as \"Payment Date\",
            ms.status as \"Status\"
          FROM monthly_salaries ms
          JOIN barbers b ON ms.barber_id = b.barber_id
          LEFT JOIN users u ON b.user_id = u.user_id
          ORDER BY ms.year DESC, ms.month DESC, b.barber_code
          LIMIT 100
        ")
      }, error = function(e) {
        data.frame()
      })
      
      if (nrow(history) == 0) {
        return(DT::datatable(
          data.frame(Message = "No payment history"),
          options = list(dom = 't'),
          rownames = FALSE
        ))
      }
      
      # Format currency columns
      history$`Gross Income` <- sapply(history$`Gross Income`, format_currency)
      history$Commission <- sapply(history$Commission, format_currency)
      history$`Recruitment Ded.` <- sapply(history$`Recruitment Ded.`, format_currency)
      history$`Credit Ded.` <- sapply(history$`Credit Ded.`, format_currency)
      history$`Net Salary` <- sapply(history$`Net Salary`, format_currency)
      
      DT::datatable(
        history,
        options = list(
          pageLength = 15,
          scrollX = TRUE,
          dom = 'ftp'
        ),
        rownames = FALSE
      )
    })
    
    # Process monthly payment
    observeEvent(input$process_monthly_payment_btn, {
      req(input$closing_month, input$closing_month != "")
      
      summary_data <- closing_summary()
      
      if (nrow(summary_data) == 0) {
        showNotification("No barber data to process", type = "error", duration = 5)
        return()
      }
      
      # Parse month/year
      month_parts <- strsplit(input$closing_month, "-")[[1]]
      year <- as.integer(month_parts[1])
      month <- as.integer(month_parts[2])
      
      # Confirmation dialog
      showModal(modalDialog(
        title = "Confirm Monthly Payment Processing",
        size = "l",
        easyClose = FALSE,
        
        div(
          h4("You are about to close the month and process payments for:"),
          tags$strong(format(as.Date(paste0(year, "-", month, "-01")), "%B %Y")),
          br(), br(),
          
          h5("Summary:"),
          tags$ul(
            tags$li(paste("Total Barbers:", nrow(summary_data))),
            tags$li(paste("Total Gross Income:", format_currency(sum(summary_data$gross_income)))),
            tags$li(paste("Total Commission:", format_currency(sum(summary_data$commission_earned)))),
            tags$li(paste("Total Deductions:", format_currency(sum(summary_data$total_deductions)))),
            tags$li(paste("Total Net Salary:", format_currency(sum(summary_data$net_salary))))
          ),
          br(),
          
          div(
            style = "background: var(--barbazza-warning); padding: var(--space-4); border-radius: var(--radius-md);",
            tags$strong("Warning:"),
            tags$ul(
              tags$li("This action will record all payments in the database"),
              tags$li("Recruitment balances will be reduced by monthly deduction amounts"),
              tags$li("Credit balances will be reduced by deduction amounts"),
              tags$li("This action cannot be undone"),
              tags$li("The month will be marked as closed")
            )
          )
        ),
        
        footer = tagList(
          actionButton(session$ns("cancel_payment"), "Cancel", 
                      style = "background: var(--barbazza-error); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md);"),
          actionButton(session$ns("confirm_payment"), "Confirm & Process Payments",
                      style = "background: var(--barbazza-success); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-weight: bold;")
        )
      ))
    })
    
    # Cancel payment
    observeEvent(input$cancel_payment, {
      removeModal()
    })
    
    # Confirm and process payment
    observeEvent(input$confirm_payment, {
      req(input$closing_month, input$closing_month != "")
      
      summary_data <- closing_summary()
      
      # Parse month/year
      month_parts <- strsplit(input$closing_month, "-")[[1]]
      year <- as.integer(month_parts[1])
      month <- as.integer(month_parts[2])
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        # Start transaction
        dbBegin(con)
        
        # Process each barber
        for (i in 1:nrow(summary_data)) {
          barber <- summary_data[i, ]
          
          # Insert payment record
          dbExecute(con, "
            INSERT INTO monthly_salaries (
              barber_id, month, year, gross_income, commission_earned,
              recruitment_deduction, credit_deduction, net_salary,
              paid_date, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'paid')
          ", params = list(
            as.integer(barber$barber_id),
            as.integer(month),
            as.integer(year),
            as.numeric(barber$gross_income),
            as.numeric(barber$commission_earned),
            as.numeric(barber$recruitment_deduction),
            as.numeric(barber$credit_deduction),
            as.numeric(barber$net_salary)
          ))
          
          # Update recruitment balance (reduce by monthly deduction)
          new_recruitment_balance <- pmax(as.numeric(barber$recruitment_balance) - as.numeric(barber$recruitment_deduction), 0)
          
          dbExecute(con, "
            UPDATE barbers
            SET advance_remaining = $1
            WHERE barber_id = $2
          ", params = list(as.numeric(new_recruitment_balance), as.integer(barber$barber_id)))
          
          # Update credit balances (reduce by credit deduction amount)
          if (as.numeric(barber$credit_deduction) > 0) {
            # Get all approved credits with remaining balance
            credits <- tryCatch({
              dbGetQuery(con, "
                SELECT credit_id, monthly_deduction, remaining_balance
                FROM barber_credits
                WHERE barber_id = $1 
                AND status = 'approved'
                AND remaining_balance > 0
                ORDER BY credit_id
              ", params = list(as.integer(barber$barber_id)))
            }, error = function(e) {
              # If barber_credits table doesn't exist, skip credit update
              cat("Skipping credit update:", e$message, "\n")
              data.frame()
            })
            
            if (nrow(credits) > 0) {
              for (j in 1:nrow(credits)) {
                credit <- credits[j, ]
                
                # Deduct the monthly amount
                new_balance <- pmax(as.numeric(credit$remaining_balance) - as.numeric(credit$monthly_deduction), 0)
                
                dbExecute(con, "
                  UPDATE barber_credits
                  SET remaining_balance = $1
                  WHERE credit_id = $2
                ", params = list(as.numeric(new_balance), as.integer(credit$credit_id)))
              }
            }
          }
        }
        
        # Commit transaction
        dbCommit(con)
        
        # Close modal
        removeModal()
        
        # Show success message
        showNotification(
          paste("Successfully processed", nrow(summary_data), "payments for", 
                format(as.Date(paste0(year, "-", month, "-01")), "%B %Y")),
          type = "message",
          duration = 5
        )
        
        # Refresh data
        rv$refresh_data <- rv$refresh_data + 1
        
      }, error = function(e) {
        # Rollback on error
        dbRollback(con)
        removeModal()
        showNotification(
          paste("Error processing payments:", e$message),
          type = "error",
          duration = 10
        )
      })
    })
    
    # ==================== DAILY REPORT GENERATION ====================
    
    # Report Preview
    output$report_preview <- renderUI({
      req(input$report_date)
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      formatted_date <- format(as.Date(input$report_date), "%Y-%m-%d")
      
      # Get summary for selected date
      summary <- dbGetQuery(con, "
        SELECT 
          COALESCE(SUM(t.amount), 0) as total_income,
          COALESCE(COUNT(*), 0) as total_customers,
          COALESCE((SELECT SUM(amount) FROM expenses WHERE DATE(expense_date) = $1), 0) as total_expenses
        FROM transactions t
        WHERE DATE(t.transaction_date) = $1
      ", params = list(formatted_date))
      
      net_profit <- as.numeric(summary$total_income[1]) - as.numeric(summary$total_expenses[1])
      
      div(
        div(
          class = "daily-summary",
          div(class = "summary-card",
            div(class = "summary-label", "Total Income"),
            div(class = "summary-value", format_currency(as.numeric(summary$total_income[1])))
          ),
          div(class = "summary-card",
            div(class = "summary-label", "Total Customers"),
            div(class = "summary-value", as.character(as.integer(summary$total_customers[1])))
          ),
          div(class = "summary-card",
            div(class = "summary-label", "Total Expenses"),
            div(class = "summary-value", format_currency(as.numeric(summary$total_expenses[1])))
          ),
          div(class = "summary-card",
            div(class = "summary-label", "Net Profit"),
            div(class = "summary-value", format_currency(net_profit),
                style = paste0("color: ", if(net_profit >= 0) "var(--barbazza-gold)" else "var(--barbazza-error)"))
          )
        )
      )
    })
    
    # Generate and upload report
    observeEvent(input$generate_report_btn, {
      req(input$report_date, input$report_format)
      
      report_date <- as.Date(input$report_date)
      
      # Show loading status
      shinyjs::html("report_status", "
        <div style='text-align: center; padding: var(--space-4);'>
          <div class='spinner'></div>
          <p style='margin-top: var(--space-3); color: var(--barbazza-gold);'>
            ⏳ Generating report and uploading to Google Drive...
          </p>
        </div>
      ")
      shinyjs::show("report_status")
      
      # Generate and upload report
      result <- tryCatch({
        generate_and_upload_report(
          report_date = report_date,
          folder_id = "1VFRjOtnY-wm-UCAjV34yS9MpNRfAxC3I",
          format = input$report_format
        )
      }, error = function(e) {
        list(
          overall_success = FALSE,
          error = e$message
        )
      })
      
      # Update status based on result
      if (result$overall_success) {
        # Build success message
        success_html <- paste0("
          <div style='background: var(--barbazza-success); padding: var(--space-4); border-radius: var(--radius-md);'>
            <h4 style='color: white; margin: 0 0 var(--space-3) 0;'>✅ Report Generated Successfully!</h4>
            <p style='color: white; margin-bottom: var(--space-3);'>
              Report for ", format(report_date, "%B %d, %Y"), " has been uploaded to Google Drive.
            </p>
        ")
        
        # Add Excel link if generated
        if (!is.null(result$excel) && result$excel$success) {
          success_html <- paste0(success_html, "
            <div style='margin-bottom: var(--space-2);'>
              <strong style='color: white;'>📊 Excel Report:</strong><br>
              <a href='", result$excel$web_link, "' target='_blank' 
                 style='color: var(--barbazza-gold); text-decoration: underline;'>
                ", result$excel$filename, "
              </a>
            </div>
          ")
        }
        
        # Add Google Sheets link if generated
        if (!is.null(result$sheets) && result$sheets$success) {
          success_html <- paste0(success_html, "
            <div style='margin-bottom: var(--space-2);'>
              <strong style='color: white;'>📈 Google Sheets Report:</strong><br>
              <a href='", result$sheets$web_link, "' target='_blank' 
                 style='color: var(--barbazza-gold); text-decoration: underline;'>
                ", result$sheets$sheet_name, "
              </a>
            </div>
          ")
        }
        
        # Add summary
        if (!is.null(result$excel) && !is.null(result$excel$summary)) {
          summary <- result$excel$summary
          success_html <- paste0(success_html, "
            <div style='margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid rgba(255,255,255,0.2);'>
              <strong style='color: white;'>Report Summary:</strong><br>
              <span style='color: white;'>
                Income: ", format_currency(summary$total_income), " | 
                Customers: ", summary$total_customers, " | 
                Expenses: ", format_currency(summary$total_expenses), " | 
                Net: ", format_currency(summary$net_profit), "
              </span>
            </div>
          ")
        }
        
        success_html <- paste0(success_html, "</div>")
        shinyjs::html("report_status", success_html)
        
        showNotification("Report generated and uploaded successfully!", type = "message", duration = 5)
        log_user_action(session_data$user$user_id, "GENERATE_DAILY_REPORT", format(report_date, "%Y-%m-%d"))
        
        # Refresh recent reports table
        rv$refresh_data <- rv$refresh_data + 1
        
      } else {
        # Show error
        error_msg <- if (!is.null(result$error)) result$error else "Unknown error occurred"
        shinyjs::html("report_status", paste0("
          <div style='background: var(--barbazza-error); padding: var(--space-4); border-radius: var(--radius-md);'>
            <h4 style='color: white; margin: 0 0 var(--space-3) 0;'>❌ Error Generating Report</h4>
            <p style='color: white; margin: 0;'>", error_msg, "</p>
          </div>
        "))
        
        showNotification(paste("Error generating report:", error_msg), type = "error", duration = 10)
      }
    })
    
    # Recent reports table
    output$recent_reports_table <- DT::renderDataTable({
      rv$refresh_data  # Dependency for refresh
      
      # List recent reports from reports folder
      if (dir.exists("reports")) {
        files <- list.files("reports", pattern = "\\.xlsx$", full.names = FALSE)
        
        if (length(files) > 0) {
          # Extract dates from filenames
          report_data <- data.frame(
            "Report File" = files,
            "Date Generated" = sapply(files, function(f) {
              # Extract date from filename (e.g., Barbazza_Daily_Report_20260107.xlsx)
              date_str <- sub(".*_(\\d{8})\\.xlsx$", "\\1", f)
              if (nchar(date_str) == 8) {
                format(as.Date(date_str, "%Y%m%d"), "%B %d, %Y")
              } else {
                "Unknown"
              }
            }),
            stringsAsFactors = FALSE,
            check.names = FALSE
          )
          
          # Sort by filename (most recent first)
          report_data <- report_data[order(report_data$"Report File", decreasing = TRUE), ]
          
          DT::datatable(
            report_data,
            options = list(
              pageLength = 10,
              searching = TRUE,
              ordering = TRUE,
              dom = 'frtip'
            ),
            rownames = FALSE,
            selection = 'none'
          )
        } else {
          DT::datatable(
            data.frame("No reports found" = character(0), check.names = FALSE),
            options = list(dom = 't'),
            rownames = FALSE
          )
        }
      } else {
        DT::datatable(
          data.frame("Reports folder not found" = character(0), check.names = FALSE),
          options = list(dom = 't'),
          rownames = FALSE
        )
      }
    })

  })
}

