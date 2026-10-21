# ============================================
# BARBAZZA BARBERSHOP MANAGEMENT SYSTEM
# Main Application File
# ============================================

# Load global configuration first
source("global.R")

# UI Definition
ui <- fluidPage(
  useShinyjs(),
  tags$head(
    tags$meta(name = "viewport", content = "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover"),
    tags$meta(name = "mobile-web-app-capable", content = "yes"),
    tags$meta(name = "apple-mobile-web-app-capable", content = "yes"),
    tags$meta(name = "apple-mobile-web-app-status-bar-style", content = "black-translucent"),
    tags$link(rel = "stylesheet", type = "text/css", href = "styles.css"),
    tags$script(src = "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"),
    tags$script(src = "app.js"),
    tags$style(HTML("
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--barbazza-black);
        padding: var(--space-4);
      }
      .login-box {
        background: var(--barbazza-charcoal);
        border: 2px solid var(--barbazza-gold);
        border-radius: var(--radius-xl);
        padding: var(--space-6);
        max-width: 350px;
        width: 100%;
        box-shadow: var(--shadow-2xl), var(--glow-gold-strong);
      }
      .login-logo {
        text-align: center;
        margin-bottom: var(--space-5);
      }
      .login-logo img {
        max-width: 150px;
        height: auto;
      }
      .login-title {
        font-family: var(--font-primary);
        font-size: var(--text-2xl);
        color: var(--barbazza-gold);
        text-align: center;
        margin-bottom: var(--space-4);
        letter-spacing: var(--tracking-wide);
      }
      .form-group {
        margin-bottom: var(--space-4);
      }
      .form-label {
        display: block;
        color: var(--barbazza-cream);
        margin-bottom: var(--space-2);
        font-weight: var(--weight-medium);
      }
      .form-control-wrapper input, .form-control-wrapper textarea {
        width: 100%;
        padding: var(--space-3) var(--space-4);
        background: var(--barbazza-slate);
        border: 1px solid var(--barbazza-graphite);
        border-radius: var(--radius-md);
        color: var(--barbazza-white);
        font-size: var(--text-base);
        transition: all var(--transition-base);
      }
      .form-control-wrapper input:focus, .form-control-wrapper textarea:focus {
        outline: none;
        border-color: var(--barbazza-gold);
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
      }
      .form-control, input.form-control, textarea.form-control {
        width: 100%;
        padding: var(--space-3) var(--space-4);
        background: var(--barbazza-slate);
        border: 1px solid var(--barbazza-graphite);
        border-radius: var(--radius-md);
        color: var(--barbazza-white);
        font-size: var(--text-base);
        transition: all var(--transition-base);
      }
      .form-control:focus, input.form-control:focus, textarea.form-control:focus {
        outline: none;
        border-color: var(--barbazza-gold);
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
      }
      .btn-primary {
        width: 100%;
        padding: var(--space-4);
        background: var(--gradient-gold);
        border: none;
        border-radius: var(--radius-md);
        color: var(--barbazza-black);
        font-weight: var(--weight-semibold);
        font-size: var(--text-lg);
        cursor: pointer;
        transition: all var(--transition-base);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg), var(--glow-gold);
      }
      .btn-primary:active {
        transform: translateY(0);
      }
      .alert {
        padding: var(--space-4);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-4);
        border-left: 4px solid;
      }
      .alert-danger {
        background: rgba(107, 31, 31, 0.2);
        border-color: var(--barbazza-error);
        color: var(--barbazza-cream);
      }
      .main-header {
        background: var(--barbazza-charcoal);
        border-bottom: 2px solid var(--barbazza-gold);
        padding: var(--space-4) var(--space-6);
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: var(--shadow-md);
      }
      .header-logo {
        display: flex;
        align-items: center;
        gap: var(--space-4);
      }
      .header-logo img {
        height: 50px;
      }
      .header-title {
        font-family: var(--font-primary);
        font-size: var(--text-2xl);
        color: var(--barbazza-gold);
        margin: 0;
      }
      .header-user {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        color: var(--barbazza-cream);
      }
      .btn-logout {
        padding: var(--space-2) var(--space-4);
        background: var(--barbazza-burgundy);
        border: 1px solid var(--barbazza-burgundy-light);
        border-radius: var(--radius-md);
        color: var(--barbazza-white);
        cursor: pointer;
        transition: all var(--transition-base);
      }
      .btn-logout:hover {
        background: var(--barbazza-burgundy-light);
      }
    "))
  ),
  
  # Main UI - Show login immediately, then switch based on auth
  div(
    id = "login_container",
    class = "login-container",
    div(
      class = "login-box",
      div(
        class = "login-logo",
        tags$img(src = "logo.png", alt = "Barbazza Logo")
      ),
      h2(style = "text-align: center; color: var(--barbazza-cream); font-size: var(--text-lg); margin-bottom: var(--space-6);", 
         "Barbershop Management System"),
      uiOutput("login_error"),
      div(
        class = "form-group",
        tags$label(class = "form-label", "Username"),
        textInput("username", label = NULL, value = "", placeholder = "Enter your username")
      ),
      div(
        class = "form-group",
        tags$label(class = "form-label", "Password"),
        passwordInput("password", label = NULL, value = "", placeholder = "Enter your password")
      ),
      div(
        class = "form-group",
        actionButton("login_btn", "Login", class = "btn-primary")
      )
    )
  ),
  
  # Authenticated UI (hidden by default)
  hidden(
    div(
      id = "main_container",
      uiOutput("main_ui")
    )
  )
)

# Server Logic
server <- function(input, output, session) {
  
  # Reactive values for session
  session_data <- reactiveValues(
    user = NULL,
    authenticated = FALSE,
    login_error = NULL
  )
  
  # Main authenticated UI
  output$main_ui <- renderUI({
    if (!session_data$authenticated) {
      return(NULL)
    }
    
    # Determine which module to show based on user role
    user_role <- session_data$user$role
    
    div(
      # Header
      div(
        class = "main-header",
        div(
          class = "header-logo",
          tags$img(src = "logo.png", alt = "Barbazza Logo"),
          h1(class = "header-title", "BARBAZZA")
        ),
        div(
          class = "header-user",
          span(paste("Welcome,", session_data$user$full_name)),
          span(style = "color: var(--barbazza-gold);", paste("(", toupper(user_role), ")")),
          actionButton("logout_btn", "Logout", class = "btn-logout")
        )
      ),
      
      # Content based on role
      if (user_role == "admin") {
        admin_ui("admin")
      } else if (user_role == "manager") {
        manager_ui("manager")
      } else if (user_role == "supervisor") {
        supervisor_ui("supervisor")
      } else if (user_role == "barber") {
        barber_ui("barber")
      }
    )
  })
  
  # Login error message
  output$login_error <- renderUI({
    if (is.null(session_data$login_error) || session_data$login_error == "") {
      return(NULL)
    }
    div(
      class = "alert alert-danger",
      session_data$login_error
    )
  })
  
  # Handle login
  observeEvent(input$login_btn, {
    # Get credentials
    username <- input$username
    password <- input$password
    
    # Validate input fields first (before showing processing)
    if (is.null(username) || username == "" || is.null(password) || password == "") {
      session_data$login_error <- "Please enter both username and password"
      return()
    }
    
    # Clear any previous error
    session_data$login_error <- NULL
    
    # IMMEDIATELY show processing state (this updates the UI right away)
    updateActionButton(session, "login_btn", label = "Processing...")
    shinyjs::disable("login_btn")
    shinyjs::disable("username")
    shinyjs::disable("password")
    
    # Use delay to allow UI to update before blocking operation
    shinyjs::delay(100, {
      # Verify credentials (this is the blocking operation)
      user <- tryCatch({
        verify_user(username, password)
      }, error = function(e) {
        session_data$login_error <- paste("Login error:", e$message)
        NULL
      })
      
      if (is.null(user)) {
        # Login failed
        if (is.null(session_data$login_error) || session_data$login_error == "") {
          session_data$login_error <- "Invalid username or password"
        }
        
        # Reset button and inputs after short delay
        shinyjs::delay(300, {
          updateActionButton(session, "login_btn", label = "Login")
          shinyjs::enable("login_btn")
          shinyjs::enable("username")
          shinyjs::enable("password")
        })
      } else {
        # Login successful
        session_data$user <- user
        session_data$authenticated <- TRUE
        session_data$login_error <- NULL
        
        # Smooth transition with delay
        shinyjs::delay(200, {
          # Hide login, show main UI
          shinyjs::hide("login_container", anim = TRUE, animType = "fade")
          shinyjs::show("main_container", anim = TRUE, animType = "fade")
          
          # Reset login form for next time (after hiding)
          shinyjs::delay(500, {
            updateActionButton(session, "login_btn", label = "Login")
            shinyjs::enable("login_btn")
            shinyjs::enable("username")
            shinyjs::enable("password")
          })
        })
      }
    })
  })
  
  # Handle logout
  observeEvent(input$logout_btn, {
    # Clear session data
    session_data$user <- NULL
    session_data$authenticated <- FALSE
    session_data$login_error <- NULL
    
    # Hide main UI, show login with animation
    shinyjs::hide("main_container", anim = TRUE, animType = "fade")
    shinyjs::show("login_container", anim = TRUE, animType = "fade")
    
    # Clear login form
    updateTextInput(session, "username", value = "")
    updateTextInput(session, "password", value = "")
    
    # Ensure inputs and button are enabled
    shinyjs::enable("login_btn")
    shinyjs::enable("username")
    shinyjs::enable("password")
  })
  
  # Admin module server
  admin_server("admin", session_data)
  
  # Manager module server
  manager_server("manager", session_data)
  
  # Supervisor module server
  supervisor_server("supervisor", session_data)
  
  # Barber module server
  barber_server("barber", session_data)
}

# Run the application
shinyApp(ui = ui, server = server)

