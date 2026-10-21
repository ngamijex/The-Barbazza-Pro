# Supervisor Module
# View-only: Daily barber performance (amount earned, clients served)
# Note: Database connection functions are defined in global.R

# Supervisor UI
supervisor_ui <- function(id) {
  ns <- NS(id)
  
  div(
    style = "padding: var(--space-6);",
    
    div(
      class = "supervisor-card",
      h3("Today's Barber Performance"),
      p(style = "font-size: 0.9rem; color: var(--barbazza-cream); margin-bottom: var(--space-4);",
        "Select a date to view barber performance and expenses."),
      
      div(
        style = "max-width: 320px; margin-bottom: var(--space-5);",
        dateInput(ns("perf_date"), "Select Date", value = Sys.Date(), format = "yyyy-mm-dd")
      ),
      
      # Summary cards
      div(
        class = "daily-summary",
        style = "display: flex; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-6);",
        div(class = "summary-card",
          div(class = "summary-label", "Total Income Today"),
          div(class = "summary-value", textOutput(ns("today_total_income")))
        ),
        div(class = "summary-card",
          div(class = "summary-label", "Total Clients Today"),
          div(class = "summary-value", textOutput(ns("today_total_clients")))
        ),
        div(class = "summary-card",
          div(class = "summary-label", "Total Expenses Today"),
          div(class = "summary-value", textOutput(ns("today_total_expenses")))
        ),
        div(class = "summary-card",
          div(class = "summary-label", "Net Profit Today"),
          div(class = "summary-value", style = "color: var(--barbazza-gold);", textOutput(ns("today_net_profit")))
        )
      ),
      
      # Barber performance table
      h4(style = "color: var(--barbazza-gold); margin-bottom: var(--space-4);", "Barber Breakdown"),
      DT::dataTableOutput(ns("barber_performance_table")),
      
      # Expenses table
      div(style = "margin-top: var(--space-6);"),
      h4(style = "color: var(--barbazza-gold); margin-bottom: var(--space-4);", "Today's Expenses"),
      DT::dataTableOutput(ns("expenses_table"))
    )
  )
}

# Supervisor Server
supervisor_server <- function(id, session_data) {
  moduleServer(id, function(input, output, session) {
    
    ns <- session$ns
    
    selected_date <- reactive({
      if (is.null(input$perf_date) || is.na(input$perf_date)) {
        return(Sys.Date())
      }
      as.Date(input$perf_date)
    })
    
    # Daily summary (income, clients, expenses, profit)
    day_summary <- reactive({
      day <- selected_date()
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      income <- tryCatch({
        dbGetQuery(con, "
          SELECT COALESCE(SUM(amount), 0) as total
          FROM transactions
          WHERE transaction_date = $1
        ", params = list(day))$total
      }, error = function(e) 0)
      
      clients <- tryCatch({
        dbGetQuery(con, "
          SELECT COUNT(*) as count
          FROM transactions
          WHERE transaction_date = $1
        ", params = list(day))$count
      }, error = function(e) 0)
      clients <- as.integer(as.numeric(clients))
      
      expenses <- tryCatch({
        dbGetQuery(con, "
          SELECT COALESCE(SUM(amount), 0) as total
          FROM expenses
          WHERE expense_date = $1
        ", params = list(day))$total
      }, error = function(e) 0)
      
      profit <- as.numeric(income) - as.numeric(expenses)
      
      list(income = income, clients = clients, expenses = expenses, profit = profit)
    })
    
    output$today_total_income <- renderText({ format_currency(day_summary()$income) })
    output$today_total_clients <- renderText({ as.character(day_summary()$clients) })
    output$today_total_expenses <- renderText({ format_currency(day_summary()$expenses) })
    output$today_net_profit <- renderText({ format_currency(day_summary()$profit) })
    
    # Barber performance table (amount earned, clients for selected day)
    output$barber_performance_table <- DT::renderDataTable({
      day <- selected_date()
      con <- get_db_connection()
      on.exit(close_db_connection(con))
      
      performance <- tryCatch({
        dbGetQuery(con, "
          SELECT 
            b.barber_code as \"Barber Code\",
            u.full_name as \"Barber Name\",
            COUNT(t.transaction_id) as \"Clients\",
            COALESCE(SUM(t.amount), 0) as \"Amount Earned\"
          FROM barbers b
          LEFT JOIN users u ON b.user_id = u.user_id
          LEFT JOIN transactions t ON b.barber_id = t.barber_id AND t.transaction_date = $1
          WHERE b.is_active = TRUE
          GROUP BY b.barber_id, b.barber_code, u.full_name
          ORDER BY 4 DESC NULLS LAST
        ", params = list(day))
      }, error = function(e) {
        data.frame("Barber Code" = character(), "Barber Name" = character(),
                   "Clients" = integer(), "Amount Earned" = numeric())
      })
      
      if (nrow(performance) > 0) {
        performance$Clients <- as.integer(as.numeric(performance$Clients))
        performance$`Amount Earned` <- sapply(performance$`Amount Earned`, format_currency)
        performance$`Barber Name` <- ifelse(is.na(performance$`Barber Name`) | performance$`Barber Name` == "",
                                            "-", performance$`Barber Name`)
      }
      
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
    
    # Expenses table (details for selected day)
    output$expenses_table <- DT::renderDataTable({
      day <- selected_date()
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
          LEFT JOIN users u ON e.created_by = u.user_id
          WHERE e.expense_date = $1
          ORDER BY e.created_at DESC
        ", params = list(day))
      }, error = function(e) {
        # Surface the DB error in the UI (instead of hiding it)
        data.frame(Message = paste("Error loading expenses:", e$message), check.names = FALSE)
      })
      
      # If we returned an error row, show it as-is
      if ("Message" %in% names(expenses)) {
        return(DT::datatable(
          expenses,
          options = list(dom = "t"),
          rownames = FALSE
        ))
      }
      
      if (nrow(expenses) == 0) {
        return(DT::datatable(
          data.frame(Message = paste("No expenses recorded for", format(day, "%Y-%m-%d"))),
          options = list(dom = "t"),
          rownames = FALSE
        ))
      }
      
      expenses$Amount <- sapply(expenses$Amount, format_currency)
      expenses$Category[is.na(expenses$Category) | expenses$Category == ""] <- "-"
      expenses$Description[is.na(expenses$Description) | expenses$Description == ""] <- "-"
      expenses$`Added By`[is.na(expenses$`Added By`) | expenses$`Added By` == ""] <- "-"
      
      DT::datatable(
        expenses,
        options = list(
          pageLength = 15,
          scrollX = TRUE,
          dom = "tp"
        ),
        rownames = FALSE
      )
    })
  })
}
