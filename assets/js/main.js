// ThinkBit Edge Corp - Main JavaScript File
// Modern AI & Data Engineering Website

'use strict';

// Global variables
let chartInstances = {};
let isLoading = true;
let currentTheme = localStorage.getItem('theme') || 'light';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
function initializeApp() {
    // Set theme before any animations
    setTheme(currentTheme);
    
    // Initialize loading sequence
    initializeLoading();
    
    // Initialize components after loading
    setTimeout(() => {
        initializeNavigation();
        initializeAnimations();
        initializeInteractions();
        initializeDataVisualizations();
        initializeFormHandling();
        initializeLazyLoading();
        isLoading = false;
    }, 3000);
}

// Loading Screen Management
function initializeLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.querySelector('.loading-progress');
    
    // Simulate loading progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Hide loading screen with fade effect
            setTimeout(() => {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 500);
        }
        progressBar.style.width = progress + '%';
    }, 150);
}

// Navigation Management
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Active link highlighting based on scroll position
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
    
    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Mobile menu toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }
}

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(currentTheme);
            localStorage.setItem('theme', currentTheme);
        });
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
}

// Initialize AOS Animations
function initializeAnimations() {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100,
            delay: 0
        });
    }
    
    // Initialize counter animations
    initializeCounters();
    
    // Initialize theme after AOS
    initializeTheme();
}

// Counter Animation for Statistics
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const duration = 2000;
    const stepTime = duration / 100;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, stepTime);
}

// Interactive Features
function initializeInteractions() {
    initializeLabTabs();
    initializeModalHandlers();
    initializeParallaxEffects();
    initializeCursorEffects();
}

// Lab Section Tab Management
function initializeLabTabs() {
    const tabs = document.querySelectorAll('.lab-tab');
    const panels = document.querySelectorAll('.lab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPanel = tab.getAttribute('data-tab') + '-panel';
            
            // Remove active class from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            tab.classList.add('active');
            const panel = document.getElementById(targetPanel);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
}

// Modal Handlers
function initializeModalHandlers() {
    const modal = document.getElementById('demo-modal');
    const closeBtn = document.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDemoVideo);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeDemoVideo();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeDemoVideo();
        }
    });
}

// Demo Video Functions
function playDemoVideo() {
    const modal = document.getElementById('demo-modal');
    const video = document.getElementById('demo-video');
    
    if (modal && video) {
        // Replace with actual demo video URL
        video.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeDemoVideo() {
    const modal = document.getElementById('demo-modal');
    const video = document.getElementById('demo-video');
    
    if (modal && video) {
        modal.classList.remove('show');
        video.src = '';
        document.body.style.overflow = 'auto';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Parallax Effects
function initializeParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.hero-background');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const rate = scrolled * -0.5;
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Cursor Effects (for desktop)
function initializeCursorEffects() {
    if (window.innerWidth > 768) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        // Hover effects for interactive elements
        const interactiveElements = document.querySelectorAll('button, a, .feature-card, .research-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
    }
}

// Data Visualizations
function initializeDataVisualizations() {
    initializeMetricsCharts();
    initializeRealTimeUpdates();
}

// Metrics Charts for Data Center Dashboard
function initializeMetricsCharts() {
    const chartConfigs = [
        { id: 'cpu-chart', type: 'line', color: '#6366f1', data: generateTimeSeriesData() },
        { id: 'memory-chart', type: 'line', color: '#8b5cf6', data: generateTimeSeriesData() },
        { id: 'network-chart', type: 'line', color: '#06b6d4', data: generateTimeSeriesData() },
        { id: 'storage-chart', type: 'line', color: '#10b981', data: generateTimeSeriesData() }
    ];
    
    chartConfigs.forEach(config => {
        const canvas = document.getElementById(config.id);
        if (canvas) {
            createMiniChart(canvas, config);
        }
    });
}

// Create mini charts for metrics
function createMiniChart(canvas, config) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const data = config.data;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, config.color + '40');
    gradient.addColorStop(1, config.color + '00');
    
    // Draw area chart
    ctx.fillStyle = gradient;
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    
    const stepX = width / (data.length - 1);
    
    data.forEach((value, index) => {
        const x = index * stepX;
        const y = height - (value / 100 * height * 0.8) - height * 0.1;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    // Complete the area
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // Draw the line
    ctx.beginPath();
    data.forEach((value, index) => {
        const x = index * stepX;
        const y = height - (value / 100 * height * 0.8) - height * 0.1;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Store chart instance for updates
    chartInstances[config.id] = {
        canvas: canvas,
        ctx: ctx,
        config: config,
        data: data
    };
}

// Generate sample time series data
function generateTimeSeriesData(points = 20) {
    const data = [];
    let lastValue = 50;
    
    for (let i = 0; i < points; i++) {
        // Random walk with bounds
        lastValue += (Math.random() - 0.5) * 10;
        lastValue = Math.max(20, Math.min(80, lastValue));
        data.push(lastValue);
    }
    
    return data;
}

// Real-time data updates
function initializeRealTimeUpdates() {
    // Update metrics every 3 seconds
    setInterval(() => {
        updateMetricsData();
        updateCharts();
    }, 3000);
}

function updateMetricsData() {
    const metrics = [
        { id: 'cpu-usage', min: 60, max: 85, suffix: '%' },
        { id: 'memory-usage', min: 55, max: 75, suffix: '%' },
        { id: 'network-io', min: 1.8, max: 3.2, suffix: ' GB/s' },
        { id: 'storage-usage', min: 40, max: 45, suffix: '%' }
    ];
    
    metrics.forEach(metric => {
        const element = document.getElementById(metric.id);
        if (element) {
            const value = (Math.random() * (metric.max - metric.min) + metric.min);
            const displayValue = metric.suffix === ' GB/s' ? value.toFixed(1) : Math.round(value);
            element.textContent = displayValue + metric.suffix;
        }
    });
}

function updateCharts() {
    Object.values(chartInstances).forEach(instance => {
        // Add new data point
        const newValue = instance.data[instance.data.length - 1] + (Math.random() - 0.5) * 10;
        const boundedValue = Math.max(20, Math.min(80, newValue));
        
        instance.data.shift();
        instance.data.push(boundedValue);
        
        // Redraw chart
        createMiniChart(instance.canvas, {
            ...instance.config,
            data: instance.data
        });
    });
}

// Form Handling
function initializeFormHandling() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Add form validation
    const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('.submit-button');
    
    // Show loading state
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span>Sending...</span>';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        // Show success message
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        
        // Reset form
        form.reset();
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    clearFieldError(e);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    return true;
}

function clearFieldError(e) {
    const field = e.target;
    const errorElement = field.parentNode.querySelector('.field-error');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    field.classList.remove('error');
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--error-color)';
    errorElement.style.fontSize = '0.75rem';
    errorElement.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorElement);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? 'var(--success-color)' : 'var(--primary-color)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        boxShadow: 'var(--shadow-xl)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '400px'
    });
    
    document.body.appendChild(notification);
    
    // Close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    // Auto remove after 5 seconds
    setTimeout(() => removeNotification(notification), 5000);
}

function removeNotification(notification) {
    notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Lazy Loading
function initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Performance Monitoring
function initializePerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        new PerformanceObserver((entryList) => {
            let clsValue = 0;
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }
}

// Accessibility Enhancements
function initializeAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        transition: top 0.3s;
        z-index: 10000;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Keyboard navigation for custom elements
    const interactiveElements = document.querySelectorAll('.lab-tab, .nav-link');
    
    interactiveElements.forEach(element => {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
    });
}

// Initialize performance monitoring and accessibility
document.addEventListener('DOMContentLoaded', () => {
    initializePerformanceMonitoring();
    initializeAccessibility();
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// CSS animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .custom-cursor {
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid var(--primary-color);
        border-radius: 50%;
        pointer-events: none;
        transition: transform 0.1s ease;
        z-index: 9999;
        mix-blend-mode: difference;
    }
    
    .custom-cursor.hover {
        transform: scale(1.5);
        background: var(--primary-color);
    }
    
    .skip-link:focus {
        top: 6px !important;
    }
    
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: var(--error-color);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
`;

document.head.appendChild(notificationStyles);

// Export functions for global access
window.playDemoVideo = playDemoVideo;
window.closeDemoVideo = closeDemoVideo;

// Debug mode
if (localStorage.getItem('debug') === 'true') {
    console.log('ThinkBit Edge Corp - Debug Mode Enabled');
    window.thinkbitDebug = {
        chartInstances,
        currentTheme,
        isLoading,
        showNotification,
        updateMetricsData,
        updateCharts
    };
}