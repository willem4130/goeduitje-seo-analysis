// Main JavaScript for SEO/GEO Analysis Presentation
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize theme
    initTheme();
    
    // Initialize charts
    initCharts();
    
    // Set current date
    setCurrentDate();
    
    // Add fade-in animations
    animateElements();
    
    // Initialize interactive features
    initInteractiveFeatures();
});

// Theme Management
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#themeToggle i');
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Chart Initialization
function initCharts() {
    initTrafficChart();
    initROIChart();
}

function initTrafficChart() {
    const ctx = document.getElementById('trafficChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Huidige Status', 'Maand 1', 'Maand 3', 'Maand 6', 'Maand 12', 'Maand 24'],
            datasets: [{
                label: 'Website Traffic',
                data: [800, 1200, 2500, 8000, 24000, 56000],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' bezoekers';
                        }
                    }
                }
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            }
        }
    });
}

function initROIChart() {
    const ctx = document.getElementById('roiChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Quick Wins\n(3 mnd)', 'Medium-term\n(12 mnd)', 'Long-term\n(24 mnd)'],
            datasets: [{
                label: 'ROI Percentage',
                data: [2460, 13229, 39154],
                backgroundColor: [
                    'rgba(39, 174, 96, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ],
                borderColor: [
                    '#27ae60',
                    '#3498db',
                    '#e74c3c'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + '%';
                        }
                    }
                }
            }
        }
    });
}

// Date Management
function setCurrentDate() {
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

// Animation Management
function animateElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fadeIn');
            }
        });
    });
    
    document.querySelectorAll('.metric-card, .nav-card, .action-card, .social-card').forEach(el => {
        observer.observe(el);
    });
}

// Interactive Features
function initInteractiveFeatures() {
    // Card hover effects with data
    initCardHovers();
    
    // Progress tracking
    initProgressTracking();
    
    // Export functionality
    initExportFeatures();
}

function initCardHovers() {
    // Add hover tooltips for metric cards
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Navigation card interactions
    const navCards = document.querySelectorAll('.nav-card');
    navCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

function initProgressTracking() {
    // Track which sections have been visited
    const visitedSections = JSON.parse(localStorage.getItem('visitedSections') || '[]');
    
    visitedSections.forEach(sectionId => {
        const card = document.querySelector(`[href*="${sectionId}"]`);
        if (card) {
            card.classList.add('visited');
        }
    });
}

function initExportFeatures() {
    // Add print button functionality
    const printButton = document.createElement('button');
    printButton.innerHTML = '<i class="fas fa-print"></i> Print Rapport';
    printButton.className = 'print-btn';
    printButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #3498db;
        color: white;
        border: none;
        padding: 15px 20px;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        font-weight: 600;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    printButton.addEventListener('click', function() {
        window.print();
    });
    
    printButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 6px 16px rgba(52, 152, 219, 0.4)';
    });
    
    printButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
    });
    
    document.body.appendChild(printButton);
}

// Utility Functions
function formatNumber(num) {
    return new Intl.NumberFormat('nl-NL').format(num);
}

function formatPercentage(num) {
    return new Intl.NumberFormat('nl-NL', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(num / 100);
}

function formatCurrency(num) {
    return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

// Advanced Interactive Features
function createDataVisualization(containerId, data, type = 'bar') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: type,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Performance Monitoring
function trackPagePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page loaded in ${loadTime}ms`);
            
            // Store performance data for analytics
            if (loadTime > 3000) {
                console.warn('Page load time exceeds 3 seconds');
            }
        });
    }
}

// Initialize performance tracking
trackPagePerformance();

// Smooth scrolling for internal links
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

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC to toggle theme
    if (e.key === 'Escape') {
        document.getElementById('themeToggle').click();
    }
    
    // P to print
    if (e.key === 'p' && e.ctrlKey) {
        e.preventDefault();
        window.print();
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Export for use in other files
window.SEOAnalysis = {
    formatNumber,
    formatPercentage,
    formatCurrency,
    createDataVisualization
};