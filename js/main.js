/**
 * Kostr Powered by Deas AS - Main JavaScript
 * Professional Electrical Services in Moss, Norway
 */

(function() {
    'use strict';

    // =====================================================
    // DOM Elements
    // =====================================================
    const header = document.querySelector('.header');
    const navToggle = document.querySelector('.nav-toggle');
    const navMobile = document.querySelector('.nav-mobile');
    const contactForm = document.getElementById('contact-form');

    // =====================================================
    // Mobile Navigation
    // =====================================================
    function initMobileNav() {
        if (!navToggle || !navMobile) return;

        navToggle.addEventListener('click', function() {
            const isActive = navMobile.classList.contains('active');

            navToggle.classList.toggle('active');
            navMobile.classList.toggle('active');

            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? '' : 'hidden';

            // Update ARIA
            navToggle.setAttribute('aria-expanded', !isActive);
        });

        // Close menu when clicking on a link
        const navLinks = navMobile.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMobile.classList.remove('active');
                document.body.style.overflow = '';
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMobile.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMobile.classList.remove('active');
                document.body.style.overflow = '';
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // =====================================================
    // Header Scroll Effect
    // =====================================================
    function initHeaderScroll() {
        if (!header) return;

        let lastScroll = 0;

        function handleScroll() {
            const currentScroll = window.pageYOffset;

            // Add/remove scrolled class
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }

        // Throttle scroll event
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initial check
        handleScroll();
    }

    // =====================================================
    // Contact Form Handling
    // =====================================================
    function initContactForm() {
        if (!contactForm) return;

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const messageContainer = contactForm.querySelector('.form-message');
            const originalBtnText = submitBtn.innerHTML;

            // Check honeypot (anti-spam)
            const honeypot = contactForm.querySelector('input[name="website"]');
            if (honeypot && honeypot.value) {
                // Bot detected, silently fail
                showMessage(messageContainer, 'success', 'Takk for din henvendelse! Vi kontakter deg snart.');
                contactForm.reset();
                return;
            }

            // Validate form
            if (!validateForm(contactForm)) {
                return;
            }

            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pulse"><circle cx="12" cy="12" r="10"/></svg> Sender...';

            // Collect form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Remove honeypot field from data
            delete data.website;

            try {
                // In production, this would send to an API endpoint
                // For now, we simulate a successful submission
                await simulateFormSubmission(data);

                showMessage(messageContainer, 'success', 'Takk for din henvendelse! Vi kontakter deg innen 24 timer.');
                contactForm.reset();

                // Scroll to message
                messageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } catch (error) {
                showMessage(messageContainer, 'error', 'Beklager, noe gikk galt. Vennligst prøv igjen eller ring oss direkte.');
                console.error('Form submission error:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });

        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                // Clear error state on input
                this.classList.remove('error');
                const errorMsg = this.parentElement.querySelector('.field-error');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });
        });
    }

    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const name = field.name;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        field.classList.remove('error');
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Required check
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'Dette feltet er påkrevd';
        }

        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Vennligst oppgi en gyldig e-postadresse';
            }
        }

        // Phone validation (Norwegian format)
        if (name === 'phone' && value) {
            const phoneRegex = /^(\+47)?[\s-]?[2-9]\d{7}$/;
            const cleanPhone = value.replace(/[\s-]/g, '');
            if (!phoneRegex.test(cleanPhone) && cleanPhone.length < 8) {
                isValid = false;
                errorMessage = 'Vennligst oppgi et gyldig telefonnummer';
            }
        }

        // Show error if invalid
        if (!isValid) {
            field.classList.add('error');
            field.style.borderColor = 'var(--color-error)';
            const errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            errorEl.textContent = errorMessage;
            errorEl.style.color = 'var(--color-error)';
            errorEl.style.fontSize = '0.875rem';
            errorEl.style.marginTop = '0.25rem';
            errorEl.style.display = 'block';
            field.parentElement.appendChild(errorEl);
        } else {
            field.style.borderColor = '';
        }

        return isValid;
    }

    function showMessage(container, type, message) {
        if (!container) return;

        container.className = 'form-message ' + type;
        container.textContent = message;
        container.style.display = 'block';

        // Hide message after 10 seconds
        setTimeout(() => {
            container.style.display = 'none';
        }, 10000);
    }

    function simulateFormSubmission(data) {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                // Log form data (for development)
                console.log('Form submission:', data);

                // Simulate success (90% of the time) or failure
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Simulated error'));
                }
            }, 1500);
        });
    }

    // =====================================================
    // Smooth Scroll for Anchor Links
    // =====================================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');

                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();

                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // =====================================================
    // Intersection Observer for Animations
    // =====================================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.service-card, .value-card, .project-card, .testimonial-card, .why-item, .process-step, .cert-item, .timeline-item');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            animatedElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            animatedElements.forEach(el => {
                el.classList.add('fade-in');
            });
        }
    }

    // =====================================================
    // Active Navigation State
    // =====================================================
    function initActiveNav() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-desktop a, .nav-mobile a');

        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');

            // Check if current path matches link
            if (currentPath.endsWith(linkPath) ||
                (linkPath === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')))) {
                link.classList.add('active');
            }
        });
    }

    // =====================================================
    // Click-to-Call Tracking
    // =====================================================
    function initPhoneTracking() {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

        phoneLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Track phone call (for analytics integration)
                if (typeof gtag === 'function') {
                    gtag('event', 'phone_call', {
                        'event_category': 'Contact',
                        'event_label': this.href
                    });
                }
                console.log('Phone call initiated:', this.href);
            });
        });
    }

    // =====================================================
    // Lazy Loading Images
    // =====================================================
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                        }
                        img.removeAttribute('data-src');
                        img.removeAttribute('data-srcset');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
            });
        }
    }

    // =====================================================
    // Counter Animation for Stats
    // =====================================================
    function initCounterAnimation() {
        const counters = document.querySelectorAll('.heritage-stat .number');

        if ('IntersectionObserver' in window && counters.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const counter = entry.target;
                        const target = parseInt(counter.textContent);
                        const suffix = counter.textContent.replace(/\d+/, '');
                        animateCounter(counter, target, suffix);
                        observer.unobserve(counter);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));
        }
    }

    function animateCounter(element, target, suffix) {
        let current = 0;
        const increment = target / 50;
        const duration = 1500;
        const stepTime = duration / 50;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + suffix;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + suffix;
            }
        }, stepTime);
    }

    // =====================================================
    // Accessibility Improvements
    // =====================================================
    function initAccessibility() {
        // Add keyboard navigation support for custom elements
        const clickableElements = document.querySelectorAll('.service-card, .project-card, .value-card');

        clickableElements.forEach(el => {
            const link = el.querySelector('a');
            if (link) {
                el.setAttribute('tabindex', '0');
                el.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        link.click();
                    }
                });
            }
        });

        // Focus trap for mobile navigation
        if (navMobile) {
            const focusableElements = navMobile.querySelectorAll('a, button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            navMobile.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
    }

    // =====================================================
    // Performance Monitoring
    // =====================================================
    function initPerformanceMonitoring() {
        // Log performance metrics (for development)
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', function() {
                setTimeout(function() {
                    const timing = performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;

                    console.log('Page load metrics:');
                    console.log('- DOM Ready:', domReady + 'ms');
                    console.log('- Full Load:', loadTime + 'ms');
                }, 0);
            });
        }
    }

    // =====================================================
    // Emergency Contact Highlight
    // =====================================================
    function initEmergencyHighlight() {
        const emergencyLinks = document.querySelectorAll('.emergency-bar a, [data-emergency="true"]');

        emergencyLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Track emergency contact click
                if (typeof gtag === 'function') {
                    gtag('event', 'emergency_contact', {
                        'event_category': 'Contact',
                        'event_label': 'Emergency Call'
                    });
                }
                console.log('Emergency contact clicked');
            });
        });
    }

    // =====================================================
    // Utility Functions
    // =====================================================
    function debounce(func, wait) {
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

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // =====================================================
    // Initialize All Functions
    // =====================================================
    function init() {
        initMobileNav();
        initHeaderScroll();
        initContactForm();
        initSmoothScroll();
        initScrollAnimations();
        initActiveNav();
        initPhoneTracking();
        initLazyLoading();
        initCounterAnimation();
        initAccessibility();
        initEmergencyHighlight();

        // Development only
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            initPerformanceMonitoring();
        }

        console.log('Kostr Powered by Deas AS website initialized');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
