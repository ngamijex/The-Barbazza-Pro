# Barber Module
# Personal performance and earnings view
# Note: Database connection functions are defined in global.R

# Barber UI
barber_ui <- function(id) {
  ns <- NS(id)
  
  div(
    style = "padding: var(--space-6);",
    
    tabsetPanel(
      id = ns("barber_tabs"),
      type = "tabs",
      
      # Dashboard Tab
      tabPanel(
        "Dashboard",
        
        # Financial Summary
        div(
          class = "barber-card",
          h3("Today's Financial Summary"),
          div(
            class = "earnings-grid",
            div(class = "earnings-card",
              div(class = "earnings-label", "Gross Income (100%)"),
              div(class = "earnings-value", textOutput(ns("today_gross")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Your Commission (40%)"),
              div(class = "earnings-value", style = "color: var(--barbazza-gold);", textOutput(ns("today_commission")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Shop Share (60%)"),
              div(class = "earnings-value", textOutput(ns("today_shop_share")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Customers Served"),
              div(class = "earnings-value", textOutput(ns("today_customers")))
            )
          )
        ),
        
        # Monthly Performance Summary
        div(
          class = "barber-card",
          h3("This Month's Performance"),
          p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);", 
            paste("Month of", format(Sys.Date(), "%B %Y"))),
          div(
            class = "earnings-grid",
            div(class = "earnings-card",
              div(class = "earnings-label", "Total Services"),
              div(class = "earnings-value", textOutput(ns("monthly_services")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Total Customers"),
              div(class = "earnings-value", textOutput(ns("monthly_customers")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Gross Income"),
              div(class = "earnings-value", textOutput(ns("monthly_gross")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Your Commission (40%)"),
              div(class = "earnings-value", style = "color: var(--barbazza-gold);", textOutput(ns("monthly_commission_display")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Average Daily Income"),
              div(class = "earnings-value", textOutput(ns("monthly_avg_daily")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Best Day Income"),
              div(class = "earnings-value", style = "color: var(--barbazza-gold);", textOutput(ns("monthly_best_day")))
            )
          )
        ),
        
        # Monthly Expected Income
        div(
          class = "barber-card",
          style = "background: linear-gradient(135deg, var(--barbazza-charcoal) 0%, var(--barbazza-slate) 100%); border: 2px solid var(--barbazza-gold);",
          h3(style = "color: var(--barbazza-gold);", "Expected Monthly Income"),
          p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);", 
            "Your estimated take-home salary at month end"),
          div(
            class = "earnings-grid",
            div(class = "earnings-card",
              div(class = "earnings-label", "Monthly Commission (40%)"),
              div(class = "earnings-value", textOutput(ns("monthly_commission")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Recruitment Deduction"),
              div(class = "earnings-value", style = "color: var(--barbazza-burgundy);", textOutput(ns("monthly_recruitment_deduction")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Credit Deductions"),
              div(class = "earnings-value", style = "color: var(--barbazza-burgundy);", textOutput(ns("monthly_credit_deductions")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Expected Net Income"),
              div(class = "earnings-value", style = "color: var(--barbazza-gold); font-size: 1.8rem; font-weight: bold;", textOutput(ns("expected_net_income")))
            )
          )
        ),
        
        # Monthly Deductions Summary
        div(
          class = "barber-card",
          h3("Outstanding Balances"),
          div(
            class = "earnings-grid",
            div(class = "earnings-card",
              div(class = "earnings-label", "Recruitment Balance"),
              div(class = "earnings-value", textOutput(ns("recruitment_balance")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Monthly Deduction"),
              div(class = "earnings-value", textOutput(ns("recruitment_deduction")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Credit Balance"),
              div(class = "earnings-value", textOutput(ns("credit_balance")))
            ),
            div(class = "earnings-card",
              div(class = "earnings-label", "Total Pending"),
              div(class = "earnings-value", style = "color: var(--barbazza-gold-dark);", textOutput(ns("total_deductions")))
            )
          )
        ),
        
        # Income Trend Chart
        div(
          class = "barber-card",
          h3("Income Trend - This Month"),
          p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);", 
            "Your daily income performance this month"),
          div(
            style = "height: 300px; position: relative;",
            tags$canvas(id = ns("income_chart"), style = "max-height: 300px;")
          )
        ),
        
        # Today's Services
        div(
          class = "barber-card",
          h3("Today's Services"),
          DT::dataTableOutput(ns("today_services_table"))
        )
      ),
      
      # History Tab
      tabPanel(
        "History",
        # Period Summary
        div(
          class = "barber-card",
          h3("Performance History"),
          div(
            class = "period-selector",
            actionButton(ns("period_today"), "Today", class = "period-btn active"),
            actionButton(ns("period_week"), "This Week", class = "period-btn"),
            actionButton(ns("period_month"), "This Month", class = "period-btn")
          ),
          DT::dataTableOutput(ns("performance_history"))
        ),
        
        # Daily Records Viewer
        div(
          class = "barber-card",
          h3("View Specific Day Records"),
          p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);", 
            "Select any day from this month to view detailed records"),
          div(
            style = "max-width: 300px; margin-bottom: var(--space-6);",
            dateInput(ns("history_date"), "Select Date:", 
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
              class = "earnings-grid",
              div(class = "earnings-card",
                div(class = "earnings-label", "Services Performed"),
                div(class = "earnings-value", textOutput(ns("history_services")))
              ),
              div(class = "earnings-card",
                div(class = "earnings-label", "Customers Served"),
                div(class = "earnings-value", textOutput(ns("history_customers")))
              ),
              div(class = "earnings-card",
                div(class = "earnings-label", "Gross Income"),
                div(class = "earnings-value", textOutput(ns("history_income")))
              ),
              div(class = "earnings-card",
                div(class = "earnings-label", "Your Commission (40%)"),
                div(class = "earnings-value", style = "color: var(--barbazza-gold);", textOutput(ns("history_commission")))
              )
            )
          ),
          
          # Services Table for Selected Date
          h4("Services Performed"),
          DT::dataTableOutput(ns("history_services_table"))
        )
      ),
      
      # Credit Request Tab
      tabPanel(
        "Request Credit",
        div(
          class = "barber-card",
          h3("Request Emergency Credit"),
          p("You can request an advance for emergencies. Manager approval required."),
          div(
            style = "max-width: 500px;",
            numericInput(ns("credit_amount"), "Amount Needed (RWF)", value = 0, min = 0, step = 1000),
            textAreaInput(ns("credit_reason"), "Reason for Credit Request", 
                         value = "", rows = 4,
                         placeholder = "Explain why you need this advance..."),
            actionButton(ns("submit_credit_btn"), "Submit Request",
                        style = "background: var(--barbazza-gold); color: white; border: none; padding: var(--space-3) var(--space-5); border-radius: var(--radius-md);")
          )
        ),
        
        div(
          class = "barber-card",
          h3("My Credit Requests"),
          DT::dataTableOutput(ns("my_credits_table"))
        )
      )
    )
  )
}

# Barber Server
barber_server <- function(id, session_data) {
  moduleServer(id, function(input, output, session) {
    
    # Get barber ID from user
    barber_id <- reactive({
      req(session_data$user)
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      barber <- tryCatch({
        dbGetQuery(con, "
          SELECT barber_id FROM barbers WHERE user_id = $1
        ", params = list(session_data$user$user_id))
      }, error = function(e) {
        data.frame(barber_id = integer())
      })
      
      if (nrow(barber) == 0) {
        return(NULL)
      }
      
      return(barber$barber_id[1])
    })
    
    # Period selection
    selected_period <- reactiveVal("today")
    
    observeEvent(input$period_today, {
      selected_period("today")
      updateActionButton(session, "period_today", class = "period-btn active")
      updateActionButton(session, "period_week", class = "period-btn")
      updateActionButton(session, "period_month", class = "period-btn")
    })
    
    observeEvent(input$period_week, {
      selected_period("week")
      updateActionButton(session, "period_today", class = "period-btn")
      updateActionButton(session, "period_week", class = "period-btn active")
      updateActionButton(session, "period_month", class = "period-btn")
    })
    
    observeEvent(input$period_month, {
      selected_period("month")
      updateActionButton(session, "period_today", class = "period-btn")
      updateActionButton(session, "period_week", class = "period-btn")
      updateActionButton(session, "period_month", class = "period-btn active")
    })
    
    # Reactive value for refresh
    rv <- reactiveValues(
      refresh_credits = 0
    )
    
    # Load today's performance with commission calculation
    load_today_performance <- function() {
      if (is.null(barber_id())) {
        return(list(
          gross = 0, 
          commission = 0, 
          shop_share = 0, 
          customers = 0, 
          services = 0,
          commission_rate = 40
        ))
      }
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Get barber's commission rate
      barber_info <- dbGetQuery(con, "
        SELECT commission_rate FROM barbers WHERE barber_id = $1
      ", params = list(barber_id()))
      
      commission_rate <- if(nrow(barber_info) > 0) barber_info$commission_rate else 40
      
      # Get today's performance
      performance <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            COUNT(*) as services_count,
            COUNT(*) as customers_count,
            COALESCE(SUM(amount), 0) as total_income
          FROM transactions
          WHERE barber_id = $1 AND transaction_date = CURRENT_DATE
        ", params = list(barber_id()))
      }, error = function(e) {
        data.frame(services_count = 0, customers_count = 0, total_income = 0)
      })
      
      # Safely extract values with fallback to 0
      # Note: COUNT(*) returns integer64, need to convert to regular integer
      gross_income <- if(nrow(performance) > 0 && !is.na(performance$total_income[1])) {
        as.numeric(performance$total_income[1])
      } else {
        0
      }
      
      customers_count <- if(nrow(performance) > 0 && !is.na(performance$customers_count[1])) {
        as.integer(as.numeric(performance$customers_count[1]))
      } else {
        0
      }
      
      services_count <- if(nrow(performance) > 0 && !is.na(performance$services_count[1])) {
        as.integer(as.numeric(performance$services_count[1]))
      } else {
        0
      }
      
      commission <- gross_income * (commission_rate / 100)
      shop_share <- gross_income - commission
      
      return(list(
        gross = gross_income,
        commission = commission,
        shop_share = shop_share,
        customers = customers_count,
        services = services_count,
        commission_rate = commission_rate
      ))
    }
    
    # Load deduction information
    load_deductions <- function() {
      if (is.null(barber_id())) {
        return(list(
          recruitment_balance = 0,
          recruitment_deduction = 0,
          credit_balance = 0,
          total_deductions = 0
        ))
      }
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Get recruitment advance info
      barber_info <- dbGetQuery(con, "
        SELECT 
          COALESCE(advance_remaining, 0) as recruitment_balance,
          COALESCE(advance_monthly_deduction, 0) as monthly_deduction
        FROM barbers 
        WHERE barber_id = $1
      ", params = list(barber_id()))
      
      # Get total credit balance
      credits <- dbGetQuery(con, "
        SELECT COALESCE(SUM(remaining_balance), 0) as credit_balance
        FROM barber_credits
        WHERE barber_id = $1 AND status = 'approved' AND remaining_balance > 0
      ", params = list(barber_id()))
      
      recruitment_balance <- if(nrow(barber_info) > 0) barber_info$recruitment_balance else 0
      recruitment_deduction <- if(nrow(barber_info) > 0) barber_info$monthly_deduction else 0
      credit_balance <- if(nrow(credits) > 0) credits$credit_balance else 0
      
      # Total monthly deductions (would be calculated at month end)
      total_deductions <- recruitment_balance + credit_balance
      
      return(list(
        recruitment_balance = recruitment_balance,
        recruitment_deduction = recruitment_deduction,
        credit_balance = credit_balance,
        total_deductions = total_deductions
      ))
    }
    
    # Load monthly expected income
    load_monthly_income <- function() {
      if (is.null(barber_id())) {
        return(list(
          monthly_commission = 0,
          recruitment_deduction = 0,
          credit_deductions = 0,
          expected_net = 0
        ))
      }
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Get current month's date range
      current_month_start <- as.Date(format(Sys.Date(), "%Y-%m-01"))
      
      # Get barber's commission rate and recruitment deduction
      barber_info <- dbGetQuery(con, "
        SELECT 
          commission_rate,
          COALESCE(advance_monthly_deduction, 0) as recruitment_deduction
        FROM barbers 
        WHERE barber_id = $1
      ", params = list(barber_id()))
      
      commission_rate <- if(nrow(barber_info) > 0) barber_info$commission_rate else 40
      recruitment_deduction <- if(nrow(barber_info) > 0) as.numeric(barber_info$recruitment_deduction) else 0
      
      # Get this month's gross income
      monthly_gross <- dbGetQuery(con, "
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE barber_id = $1 
        AND transaction_date >= $2
        AND transaction_date < $2 + INTERVAL '1 month'
      ", params = list(barber_id(), current_month_start))
      
      monthly_gross_income <- if(nrow(monthly_gross) > 0) as.numeric(monthly_gross$total) else 0
      
      # Calculate monthly commission (40%)
      monthly_commission <- monthly_gross_income * (commission_rate / 100)
      
      # Get total monthly credit deductions (sum of all approved credits' monthly deductions)
      credit_deductions <- dbGetQuery(con, "
        SELECT COALESCE(SUM(monthly_deduction), 0) as total
        FROM barber_credits
        WHERE barber_id = $1 
        AND status = 'approved' 
        AND remaining_balance > 0
      ", params = list(barber_id()))
      
      monthly_credit_deductions <- if(nrow(credit_deductions) > 0) as.numeric(credit_deductions$total) else 0
      
      # Calculate expected net income
      expected_net <- monthly_commission - recruitment_deduction - monthly_credit_deductions
      
      return(list(
        monthly_commission = monthly_commission,
        recruitment_deduction = recruitment_deduction,
        credit_deductions = monthly_credit_deductions,
        expected_net = expected_net
      ))
    }
    
    # Load monthly performance metrics
    load_monthly_performance <- function() {
      if (is.null(barber_id())) {
        return(list(
          services = 0,
          customers = 0,
          gross = 0,
          commission = 0,
          avg_daily = 0,
          best_day = 0
        ))
      }
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Get current month's date range
      current_month_start <- as.Date(format(Sys.Date(), "%Y-%m-01"))
      
      # Get barber's commission rate
      barber_info <- dbGetQuery(con, "
        SELECT commission_rate
        FROM barbers 
        WHERE barber_id = $1
      ", params = list(barber_id()))
      
      commission_rate <- if(nrow(barber_info) > 0) barber_info$commission_rate else 40
      
      # Get monthly statistics
      monthly_stats <- dbGetQuery(con, "
        SELECT 
          COUNT(*) as services_count,
          COUNT(*) as customers_count,
          COALESCE(SUM(amount), 0) as total_income,
          COALESCE(MAX(amount), 0) as best_day_income,
          COALESCE(AVG(amount), 0) as avg_income
        FROM transactions
        WHERE barber_id = $1 
        AND transaction_date >= $2
        AND transaction_date < $2 + INTERVAL '1 month'
      ", params = list(barber_id(), current_month_start))
      
      services_count <- if(nrow(monthly_stats) > 0) as.integer(as.numeric(monthly_stats$services_count)) else 0
      customers_count <- if(nrow(monthly_stats) > 0) as.integer(as.numeric(monthly_stats$customers_count)) else 0
      gross_income <- if(nrow(monthly_stats) > 0) as.numeric(monthly_stats$total_income) else 0
      best_day <- if(nrow(monthly_stats) > 0) as.numeric(monthly_stats$best_day_income) else 0
      
      # Calculate commission
      commission <- gross_income * (commission_rate / 100)
      
      # Calculate average daily income (divide by days worked, not total days)
      days_worked <- dbGetQuery(con, "
        SELECT COUNT(DISTINCT transaction_date) as days
        FROM transactions
        WHERE barber_id = $1 
        AND transaction_date >= $2
        AND transaction_date < $2 + INTERVAL '1 month'
      ", params = list(barber_id(), current_month_start))
      
      days_count <- if(nrow(days_worked) > 0 && days_worked$days > 0) as.integer(days_worked$days) else 1
      avg_daily <- gross_income / days_count
      
      return(list(
        services = services_count,
        customers = customers_count,
        gross = gross_income,
        commission = commission,
        avg_daily = avg_daily,
        best_day = best_day
      ))
    }
    
    # Today's performance outputs
    today_perf <- reactive({
      barber_id()
      load_today_performance()
    })
    
    deductions_info <- reactive({
      barber_id()
      rv$refresh_credits  # Refresh when credits change
      load_deductions()
    })
    
    # Financial outputs
    output$today_gross <- renderText({ format_currency(today_perf()$gross) })
    output$today_commission <- renderText({ format_currency(today_perf()$commission) })
    output$today_shop_share <- renderText({ format_currency(today_perf()$shop_share) })
    output$today_customers <- renderText({ as.character(as.integer(today_perf()$customers)) })
    
    # Deduction outputs
    output$recruitment_balance <- renderText({ format_currency(deductions_info()$recruitment_balance) })
    output$recruitment_deduction <- renderText({ 
      paste(format_currency(deductions_info()$recruitment_deduction), "/ month")
    })
    output$credit_balance <- renderText({ format_currency(deductions_info()$credit_balance) })
    output$total_deductions <- renderText({ format_currency(deductions_info()$total_deductions) })
    
    # Monthly income outputs
    monthly_income <- reactive({
      barber_id()
      rv$refresh_credits  # Refresh when credits change
      load_monthly_income()
    })
    
    output$monthly_commission <- renderText({ format_currency(monthly_income()$monthly_commission) })
    output$monthly_recruitment_deduction <- renderText({ 
      paste("-", format_currency(monthly_income()$recruitment_deduction))
    })
    output$monthly_credit_deductions <- renderText({ 
      paste("-", format_currency(monthly_income()$credit_deductions))
    })
    output$expected_net_income <- renderText({ format_currency(monthly_income()$expected_net) })
    
    # Monthly performance outputs
    monthly_perf <- reactive({
      barber_id()
      rv$refresh_credits  # Refresh when data changes
      load_monthly_performance()
    })
    
    output$monthly_services <- renderText({ as.character(monthly_perf()$services) })
    output$monthly_customers <- renderText({ as.character(monthly_perf()$customers) })
    output$monthly_gross <- renderText({ format_currency(monthly_perf()$gross) })
    output$monthly_commission_display <- renderText({ format_currency(monthly_perf()$commission) })
    output$monthly_avg_daily <- renderText({ format_currency(monthly_perf()$avg_daily) })
    output$monthly_best_day <- renderText({ format_currency(monthly_perf()$best_day) })
    
    # Income trend chart
    observe({
      req(barber_id())
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Get current month's date range
      current_month_start <- as.Date(format(Sys.Date(), "%Y-%m-01"))
      current_month_end <- as.Date(format(Sys.Date() + 32, "%Y-%m-01")) - 1
      
      # Get daily income for the current month
      daily_income <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            transaction_date,
            COALESCE(SUM(amount), 0) as daily_total
          FROM transactions
          WHERE barber_id = $1
          AND transaction_date >= $2
          AND transaction_date <= $3
          GROUP BY transaction_date
          ORDER BY transaction_date
        ", params = list(barber_id(), current_month_start, current_month_end))
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
          if (window.barberIncomeChart) {
            window.barberIncomeChart.destroy();
          }
          
          ctx = ctx.getContext('2d');
          window.barberIncomeChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: %s,
              datasets: [{
                label: 'Daily Income',
                data: %s,
                borderColor: '#0a0a0a',
                backgroundColor: 'rgba(10, 10, 10, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
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
    
    # Today's services table - no auto-refresh
    output$today_services_table <- DT::renderDataTable({
      if (is.null(barber_id())) {
        return(DT::datatable(data.frame(Message = "No barber profile found")))
      }
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      services <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            service_name,
            amount,
            customer_name,
            created_at
          FROM transactions
          WHERE barber_id = $1 AND transaction_date = CURRENT_DATE
          ORDER BY created_at DESC
        ", params = list(barber_id()))
      }, error = function(e) {
        data.frame(service_name = character(), amount = numeric(), 
                  customer_name = character(), created_at = character())
      })
      
      if (nrow(services) > 0) {
        services$amount <- sapply(services$amount, format_currency)
        services$created_at <- sapply(services$created_at, format_datetime)
      }
      
      DT::datatable(
        services,
        options = list(
          pageLength = 10,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE,
        colnames = c("Service", "Amount", "Customer", "Time")
      )
    })
    
    # Performance history - refresh only on period change
    output$performance_history <- DT::renderDataTable({
      if (is.null(barber_id())) {
        return(DT::datatable(data.frame(Message = "No barber profile found")))
      }
      
      period <- selected_period()
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      if (period == "today") {
        start_date <- Sys.Date()
        end_date <- Sys.Date()
      } else if (period == "week") {
        start_date <- Sys.Date() - 6
        end_date <- Sys.Date()
      } else {
        start_date <- as.Date(paste0(format(Sys.Date(), "%Y-%m"), "-01"))
        end_date <- Sys.Date()
      }
      
      history <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            transaction_date,
            COUNT(*) as services_count,
            COALESCE(SUM(amount), 0) as daily_income
          FROM transactions
          WHERE barber_id = $1
            AND transaction_date BETWEEN $2 AND $3
          GROUP BY transaction_date
          ORDER BY transaction_date DESC
        ", params = list(barber_id(), start_date, end_date))
      }, error = function(e) {
        data.frame(transaction_date = character(), services_count = integer(), daily_income = numeric())
      })
      
      if (nrow(history) > 0) {
        history$transaction_date <- sapply(history$transaction_date, format_date)
        history$daily_income <- sapply(history$daily_income, format_currency)
      }
      
      DT::datatable(
        history,
        options = list(
          pageLength = 15,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE,
        colnames = c("Date", "Services", "Income")
      )
    })
    
    # Daily history for selected date
    history_date_data <- reactive({
      req(input$history_date, barber_id())
      
      selected_date <- input$history_date
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      # Get barber's commission rate
      barber_info <- dbGetQuery(con, "
        SELECT commission_rate
        FROM barbers 
        WHERE barber_id = $1
      ", params = list(barber_id()))
      
      commission_rate <- if(nrow(barber_info) > 0) barber_info$commission_rate else 40
      
      # Get summary for selected date
      summary <- dbGetQuery(con, "
        SELECT 
          COUNT(*) as services_count,
          COUNT(*) as customers_count,
          COALESCE(SUM(amount), 0) as total_income
        FROM transactions
        WHERE barber_id = $1 AND transaction_date = $2
      ", params = list(barber_id(), selected_date))
      
      services_count <- if(nrow(summary) > 0) as.integer(as.numeric(summary$services_count)) else 0
      customers_count <- if(nrow(summary) > 0) as.integer(as.numeric(summary$customers_count)) else 0
      gross_income <- if(nrow(summary) > 0) as.numeric(summary$total_income) else 0
      commission <- gross_income * (commission_rate / 100)
      
      return(list(
        services = services_count,
        customers = customers_count,
        gross = gross_income,
        commission = commission
      ))
    })
    
    # History date outputs
    output$history_services <- renderText({ as.character(history_date_data()$services) })
    output$history_customers <- renderText({ as.character(history_date_data()$customers) })
    output$history_income <- renderText({ format_currency(history_date_data()$gross) })
    output$history_commission <- renderText({ format_currency(history_date_data()$commission) })
    
    # History services table for selected date
    output$history_services_table <- DT::renderDataTable({
      req(input$history_date, barber_id())
      
      selected_date <- input$history_date
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      services <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            service_name as \"Service\",
            amount as \"Amount\",
            customer_name as \"Customer\",
            TO_CHAR(created_at, 'HH24:MI') as \"Time\"
          FROM transactions
          WHERE barber_id = $1 AND transaction_date = $2
          ORDER BY created_at DESC
        ", params = list(barber_id(), selected_date))
      }, error = function(e) {
        data.frame(Service = character(), Amount = numeric(), Customer = character(), Time = character())
      })
      
      if (nrow(services) > 0) {
        services$Amount <- sapply(services$Amount, format_currency)
        services$Customer[is.na(services$Customer) | services$Customer == ""] <- "Walk-in"
      }
      
      DT::datatable(
        services,
        options = list(
          pageLength = 10,
          scrollX = TRUE,
          dom = 'tp',
          searching = FALSE
        ),
        rownames = FALSE
      )
    })
    
    # Credit request submission
    observeEvent(input$submit_credit_btn, {
      req(barber_id())
      
      amount <- input$credit_amount
      reason <- trimws(input$credit_reason)
      
      # Validation
      if (is.null(amount) || is.na(amount) || amount <= 0) {
        showNotification("Please enter a valid amount", type = "error")
        return()
      }
      
      if (reason == "") {
        showNotification("Please provide a reason for this credit request", type = "error")
        return()
      }
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      tryCatch({
        dbExecute(con, "
          INSERT INTO barber_credits 
          (barber_id, amount, reason, status, remaining_balance)
          VALUES ($1, $2, $3, 'pending', $2)
        ", params = list(barber_id(), amount, reason))
        
        log_info("BARBER", paste("Credit request submitted by barber", barber_id(), "for", amount))
        
        showNotification("Credit request submitted successfully! Waiting for manager approval.", type = "message", duration = 5)
        
        # Clear form
        updateNumericInput(session, "credit_amount", value = 0)
        updateTextAreaInput(session, "credit_reason", value = "")
        
        # Refresh credit table
        rv$refresh_credits <- rv$refresh_credits + 1
        
      }, error = function(e) {
        log_error("BARBER", paste("Error submitting credit request:", e$message))
        showNotification("Failed to submit credit request. Please try again.", type = "error")
      })
    })
    
    # My credits table
    output$my_credits_table <- DT::renderDataTable({
      req(barber_id())
      rv$refresh_credits  # React to changes
      
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      credits <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            c.request_date,
            c.amount,
            c.reason,
            c.status,
            COALESCE(c.remaining_balance, 0) as remaining,
            COALESCE(u.full_name, 'Pending') as approved_by,
            c.approved_date
          FROM barber_credits c
          LEFT JOIN users u ON c.approved_by = u.user_id
          WHERE c.barber_id = $1
          ORDER BY c.request_date DESC
        ", params = list(barber_id()))
      }, error = function(e) {
        data.frame()
      })
      
      if (nrow(credits) == 0) {
        return(DT::datatable(
          data.frame(Message = "No credit requests yet"),
          options = list(dom = 't'),
          rownames = FALSE
        ))
      }
      
      # Format data
      credits$request_date <- format(as.Date(credits$request_date), "%b %d, %Y")
      credits$amount <- sapply(credits$amount, format_currency)
      credits$remaining <- sapply(credits$remaining, format_currency)
      
      # Format status
      credits$status <- sapply(credits$status, function(s) {
        switch(s,
          "pending" = "Pending",
          "approved" = "Approved",
          "rejected" = "Rejected",
          s
        )
      })
      
      # Format approved date
      credits$approved_date <- ifelse(
        is.na(credits$approved_date),
        "",
        format(as.POSIXct(credits$approved_date), "%b %d, %Y")
      )
      
      DT::datatable(
        credits,
        options = list(
          pageLength = 10,
          scrollX = TRUE,
          dom = 'tp'
        ),
        rownames = FALSE,
        colnames = c("Request Date", "Amount", "Reason", "Status", "Remaining", "Approved By", "Approved Date")
      )
    })
  })
}

