/**
 * GoedUitje SEO/GEO Analysis - Main JavaScript
 * Interactive features, charts, and data visualization
 */

// Global configuration
const CONFIG = {
  chartColors: {
    primary: '#2E7D5E',
    primaryLight: '#4A9B7A',
    primaryDark: '#1E5A42',
    secondary: '#F4A261',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    gray: '#6B7280'
  },
  transitions: {
    fast: 150,
    normal: 300,
    slow: 500
  }
};

// Note: Chart data removed - requires actual analytics data collection before implementation
// Charts will be populated once Google Analytics, Search Console, and actual performance data is gathered

/**
 * DOM Content Loaded Event Handler
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
  try {
    setupThemeToggle();
    setupNavigation();
    setupSmoothScrolling();
    initializeCharts();
    setupInteractiveElements();
    updateCurrentDate();
    setupPrintFunctionality();
    
    console.log('GoedUitje SEO/GEO Analysis app initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

/**
 * Theme Toggle Functionality
 */
function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  // Set initial theme
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
  
  // Animate the toggle
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.style.transform = 'scale(0.8)';
    setTimeout(() => {
      toggle.style.transform = 'scale(1)';
    }, 150);
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/**
 * Navigation Setup
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');
  
  // Handle navigation clicks
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        // Update active navigation
        navLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Smooth scroll to section
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Handle scroll-based navigation highlighting
  window.addEventListener('scroll', throttle(() => {
    let currentSection = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        currentSection = section.id;
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }, 100));
}

/**
 * Smooth Scrolling Setup
 */
function setupSmoothScrolling() {
  // Add smooth scrolling to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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
}

/**
 * Initialize Charts
 */
function initializeCharts() {
  initializeTrafficChart();
  initializeROIChart();
}

/**
 * Traffic Growth Chart
 */
function initializeTrafficChart() {
  const ctx = document.getElementById('trafficChart');
  if (!ctx) return;
  
  // Chart disabled - requires actual analytics data
  // Replace canvas with message about needing actual data
  const canvas = ctx;
  const container = canvas.parentElement;
  
  const message = document.createElement('div');
  message.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 300px; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; color: #6c757d; text-align: center; padding: 2rem;';
  message.innerHTML = `
    <div>
      <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 1rem; color: #adb5bd;"></i>
      <h4>Awaiting Real Analytics Data</h4>
      <p>Traffic projections will be based on actual Google Analytics and Search Console data collection</p>
    </div>
  `;
  
  container.replaceChild(message, canvas);
  return;
  
  /* DISABLED - fabricated data removed
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: TRAFFIC_DATA.months,
      datasets: [
        {
          label: 'Huidige Baseline',
          data: TRAFFIC_DATA.baseline,
          borderColor: CONFIG.chartColors.gray,
          backgroundColor: CONFIG.chartColors.gray + '20',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.1
        },
        {
          label: 'Conservative Projectie',
          data: TRAFFIC_DATA.conservative,
          borderColor: CONFIG.chartColors.primary,
          backgroundColor: CONFIG.chartColors.primary + '20',
          borderWidth: 3,
          fill: false,
          tension: 0.4
        },
        {
          label: 'Optimistische Projectie',
          data: TRAFFIC_DATA.optimistic,
          borderColor: CONFIG.chartColors.success,
          backgroundColor: CONFIG.chartColors.success + '20',
          borderWidth: 3,
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14,
            weight: '600'
          },
          bodyFont: {
            size: 13
          },
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toLocaleString('nl-NL')} bezoekers`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            maxRotation: 45,
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            callback: function(value) {
              return value >= 1000 ? (value / 1000) + 'K' : value;
            },
            font: {
              size: 11
            }
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutCubic'
      }
    }
  });
}

/**
 * ROI & Revenue Chart
 */
function initializeROIChart() {
  const ctx = document.getElementById('roiChart');
  if (!ctx) return;
  
  // Chart disabled - requires actual financial data
  // Replace canvas with message about needing actual data
  const canvas = ctx;
  const container = canvas.parentElement;
  
  const message = document.createElement('div');
  message.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 300px; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; color: #6c757d; text-align: center; padding: 2rem;';
  message.innerHTML = `
    <div>
      <i class="fas fa-euro-sign" style="font-size: 2rem; margin-bottom: 1rem; color: #adb5bd;"></i>
      <h4>Financial Analysis Requires Real Data</h4>
      <p>Performance tracking will be based on actual conversion data and business metrics</p>
    </div>
  `;
  
  container.replaceChild(message, canvas);
  return;
  
  /* DISABLED - fabricated financial data removed
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ROI_DATA.months.filter((_, index) => index % 3 === 0), // Show every 3rd month
      datasets: [
        {
          label: 'Investering (Cumulatief)',
          data: ROI_DATA.investment.filter((_, index) => index % 3 === 0),
          backgroundColor: CONFIG.chartColors.error + '80',
          borderColor: CONFIG.chartColors.error,
          borderWidth: 1,
          type: 'bar'
        },
        {
          label: 'Revenue Conservative',
          data: ROI_DATA.revenueConservative.filter((_, index) => index % 3 === 0),
          backgroundColor: CONFIG.chartColors.primary + '80',
          borderColor: CONFIG.chartColors.primary,
          borderWidth: 2,
          type: 'line',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Revenue Optimistisch',
          data: ROI_DATA.revenueOptimistic.filter((_, index) => index % 3 === 0),
          backgroundColor: CONFIG.chartColors.success + '80',
          borderColor: CONFIG.chartColors.success,
          borderWidth: 2,
          type: 'line',
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14,
            weight: '600'
          },
          bodyFont: {
            size: 13
          },
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: €${context.parsed.y.toLocaleString('nl-NL')}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            callback: function(value) {
              return '€' + (value >= 1000 ? (value / 1000) + 'K' : value);
            },
            font: {
              size: 11
            }
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutCubic'
      }
    }
  });
}

/**
 * Interactive Elements Setup
 */
function setupInteractiveElements() {
  // Animate metric cards on scroll
  const metricCards = document.querySelectorAll('.metric-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'translateY(20px)';
        setTimeout(() => {
          entry.target.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, entry.target.dataset.delay || 0);
      }
    });
  }, { threshold: 0.1 });
  
  metricCards.forEach((card, index) => {
    card.dataset.delay = index * 100;
    observer.observe(card);
  });
  
  // Add hover effects to nav cards
  const navCards = document.querySelectorAll('.nav-card');
  navCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Priority quadrant interactions
  const priorityQuadrants = document.querySelectorAll('.priority-quadrant');
  priorityQuadrants.forEach(quadrant => {
    quadrant.addEventListener('click', function() {
      // Toggle expanded state
      this.classList.toggle('expanded');
      
      // Add/remove detailed view
      if (this.classList.contains('expanded')) {
        const details = document.createElement('div');
        details.className = 'quadrant-details';
        details.innerHTML = '<p><em>Klik nogmaals om te minimaliseren</em></p>';
        this.appendChild(details);
      } else {
        const details = this.querySelector('.quadrant-details');
        if (details) details.remove();
      }
    });
  });
}

/**
 * Update current date in footer
 */
function updateCurrentDate() {
  const dateElement = document.getElementById('currentDate');
  if (dateElement) {
    const now = new Date();
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    dateElement.textContent = now.toLocaleDateString('nl-NL', options);
  }
}

/**
 * Print Functionality
 */
function setupPrintFunctionality() {
  // Add print styles dynamically
  const printStyles = `
    @media print {
      .no-print, .theme-toggle, .main-nav, .section-actions, .footer-actions {
        display: none !important;
      }
      .section {
        page-break-inside: avoid;
        margin-bottom: 40px;
      }
      .chart-container {
        page-break-inside: avoid;
        height: 300px !important;
      }
      body {
        font-size: 12px;
        line-height: 1.4;
      }
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = printStyles;
  document.head.appendChild(style);
}

/**
 * Print specific section
 */
function printSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  
  const printWindow = window.open('', '_blank');
  const sectionHTML = section.outerHTML;
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('');
      } catch (e) {
        return '';
      }
    })
    .join('');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GoedUitje SEO Analysis - ${section.querySelector('.section-title')?.textContent || 'Section'}</title>
      <style>${styles}</style>
      <style>
        body { font-family: Inter, sans-serif; margin: 40px; }
        .theme-toggle, .main-nav { display: none; }
      </style>
    </head>
    <body>
      ${sectionHTML}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}

/**
 * Print entire presentation
 */
function printPresentation() {
  window.print();
}

/**
 * Export to PDF (simulated - would need server-side implementation)
 */
function exportToPDF(sectionId) {
  // This would typically call a server-side PDF generation service
  alert('PDF export functionaliteit zou worden geïmplementeerd met server-side PDF generatie (bijv. Puppeteer, wkhtmltopdf)');
}

/**
 * Export full report
 */
function exportFullReport() {
  // This would typically generate a comprehensive PDF report
  alert('Volledige rapport export zou worden geïmplementeerd met uitgebreide PDF generatie inclusief alle secties en data');
}

/**
 * Utility Functions
 */

/**
 * Throttle function calls
 */
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Debounce function calls
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Format numbers for display
 */
function formatNumber(num, locale = 'nl-NL') {
  return num.toLocaleString(locale);
}

/**
 * Format currency for display
 */
function formatCurrency(amount, currency = 'EUR', locale = 'nl-NL') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Generate random data for demo purposes
 */
function generateRandomData(length, min, max) {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

/**
 * Error handling
 */
window.addEventListener('error', function(e) {
  console.error('JavaScript Error:', e.error);
  // In production, this would send error reports to analytics
});

/**
 * Performance monitoring
 */
window.addEventListener('load', function() {
  // Monitor page load performance
  if ('performance' in window) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page load time: ${loadTime}ms`);
  }
});

/**
 * Accessibility enhancements
 */
document.addEventListener('keydown', function(e) {
  // Escape key closes expanded elements
  if (e.key === 'Escape') {
    const expanded = document.querySelectorAll('.expanded');
    expanded.forEach(el => el.classList.remove('expanded'));
  }
  
  // Enter key activates clickable elements
  if (e.key === 'Enter' && e.target.classList.contains('nav-card')) {
    e.target.click();
  }
});

// Export functions for global access
window.GoedUitjeAnalysis = {
  printSection,
  printPresentation,
  exportToPDF,
  exportFullReport,
  formatNumber,
  formatCurrency
};