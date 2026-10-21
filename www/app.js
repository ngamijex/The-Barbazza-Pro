// Barbazza Management System - JavaScript
// Enhanced interactivity and UX

document.addEventListener('DOMContentLoaded', function() {
  // NOTE: Login flow is fully handled in Shiny (no JS involvement)
  // JS is only used for visual enhancements below.
  
  // Enable Enter key to submit login form
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('login_btn');
  
  if (usernameInput && passwordInput && loginBtn) {
    const submitOnEnter = function(event) {
      if (event.key === 'Enter' && !loginBtn.disabled) {
        event.preventDefault();
        loginBtn.click();
      }
    };
    
    usernameInput.addEventListener('keypress', submitOnEnter);
    passwordInput.addEventListener('keypress', submitOnEnter);
    
    // Add immediate visual feedback when button is clicked
    loginBtn.addEventListener('click', function() {
      if (!this.disabled) {
        // Add visual processing class immediately
        this.classList.add('btn-processing');
      }
    });
  }
  
  // Remove processing class when button is re-enabled (via MutationObserver)
  if (loginBtn) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'disabled') {
          if (!loginBtn.disabled) {
            loginBtn.classList.remove('btn-processing');
          }
        }
      });
    });
    
    observer.observe(loginBtn, {
      attributes: true,
      attributeFilter: ['disabled']
    });
  }
  
  // Add smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Add fade-in animation to cards
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.premium-card, .admin-card, .manager-card, .barber-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
  
  // Format currency on page
  document.querySelectorAll('[data-currency]').forEach(el => {
    const amount = parseFloat(el.getAttribute('data-currency'));
    if (!isNaN(amount)) {
      el.textContent = formatCurrency(amount);
    }
  });
  
  // Currency formatter
  function formatCurrency(amount) {
    return 'RWF ' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  // Add tooltips
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', function() {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = this.getAttribute('data-tooltip');
      tooltip.style.cssText = `
        position: absolute;
        background: var(--barbazza-charcoal);
        color: var(--barbazza-cream);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--barbazza-gold);
        z-index: 1000;
        pointer-events: none;
        font-size: var(--text-sm);
      `;
      document.body.appendChild(tooltip);
      
      const rect = this.getBoundingClientRect();
      tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
      tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    });
    
    el.addEventListener('mouseleave', function() {
      const tooltip = document.querySelector('.tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });
  });
  
});

