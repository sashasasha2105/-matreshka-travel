/**
 * НЕРЕАЛЬНЫЕ УЛУЧШЕНИЯ МАТРЕШКА
 * Микро-взаимодействия и современные эффекты
 */

(function() {
    'use strict';

    // ========================================
    // ПАРАЛЛАКС ЭФФЕКТ ДЛЯ HERO СЕКЦИИ
    // ========================================
    function initParallax() {
        const heroSection = document.querySelector('.hero-section');
        const heroOverlay = document.querySelector('.hero-overlay');

        if (!heroSection || !heroOverlay) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const rate = scrolled * 0.5;

                    if (heroOverlay) {
                        heroOverlay.style.transform = `translateY(${rate}px)`;
                    }

                    ticking = false;
                });

                ticking = true;
            }
        }, { passive: true });

        console.log('✨ Параллакс эффект активирован');
    }

    // ========================================
    // RIPPLE ЭФФЕКТ ПРИ КЛИКЕ
    // ========================================
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();

        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');

        const existingRipple = button.querySelector('.ripple-effect');
        if (existingRipple) {
            existingRipple.remove();
        }

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    function initRippleEffect() {
        // Добавляем CSS для ripple
        const style = document.createElement('style');
        style.textContent = `
            .ripple-container {
                position: relative;
                overflow: hidden;
            }
            .ripple-effect {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            }
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Применяем к кнопкам
        const buttons = document.querySelectorAll('.region-card, .package-card, .nav-item, button');
        buttons.forEach(button => {
            if (!button.classList.contains('ripple-container')) {
                button.classList.add('ripple-container');
                button.addEventListener('click', createRipple);
            }
        });

        console.log('✨ Ripple эффект активирован');
    }

    // ========================================
    // INTERSECTION OBSERVER ДЛЯ АНИМАЦИЙ
    // ========================================
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Наблюдаем за карточками
        const cards = document.querySelectorAll('.region-card, .package-card, .feed-post');
        cards.forEach(card => observer.observe(card));

        console.log('✨ Scroll анимации активированы');
    }

    // ========================================
    // SMOOTH SCROLL ДЛЯ ЯКОРНЫХ ССЫЛОК
    // ========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        console.log('✨ Smooth scroll активирован');
    }

    // ========================================
    // УМНЫЙ ХЕДЕР (ПОКАЗЫВАТЬ/СКРЫВАТЬ ПРИ СКРОЛЛЕ)
    // ========================================
    function initSmartHeader() {
        const bottomNav = document.querySelector('.bottom-nav');
        if (!bottomNav) return;

        let lastScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScroll = window.pageYOffset;

                    if (currentScroll > lastScroll && currentScroll > 100) {
                        // Скролл вниз - скрываем
                        bottomNav.style.transform = 'translateY(100%)';
                    } else {
                        // Скролл вверх - показываем
                        bottomNav.style.transform = 'translateY(0)';
                    }

                    lastScroll = currentScroll;
                    ticking = false;
                });

                ticking = true;
            }
        }, { passive: true });

        // Добавляем transition
        bottomNav.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

        console.log('✨ Умный хедер активирован');
    }

    // ========================================
    // КУРСОР ЧАСТИЦЫ (ДЛЯ ДЕСКТОПА)
    // ========================================
    function initCursorParticles() {
        if ('ontouchstart' in window) return; // Только для десктопа

        const particles = [];
        const maxParticles = 20;

        document.addEventListener('mousemove', (e) => {
            if (Math.random() > 0.8) { // 20% шанс создать частицу
                createParticle(e.clientX, e.clientY);
            }
        });

        function createParticle(x, y) {
            if (particles.length >= maxParticles) {
                const oldParticle = particles.shift();
                oldParticle.remove();
            }

            const particle = document.createElement('div');
            particle.className = 'cursor-particle';
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, rgba(255, 204, 0, 0.8), transparent);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${x}px;
                top: ${y}px;
                animation: particleFade 1s ease-out forwards;
            `;

            document.body.appendChild(particle);
            particles.push(particle);

            setTimeout(() => {
                particle.remove();
                const index = particles.indexOf(particle);
                if (index > -1) particles.splice(index, 1);
            }, 1000);
        }

        // Добавляем CSS анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFade {
                0% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: scale(0) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);

        console.log('✨ Cursor particles активированы');
    }

    // ========================================
    // HAPTIC FEEDBACK ДЛЯ TELEGRAM
    // ========================================
    function initHapticFeedback() {
        const tg = window.Telegram?.WebApp;
        if (!tg || !tg.HapticFeedback) return;

        // Добавляем haptic для кнопок
        const interactiveElements = document.querySelectorAll(
            'button, .region-card, .package-card, .nav-item, a'
        );

        interactiveElements.forEach(element => {
            element.addEventListener('click', () => {
                tg.HapticFeedback.impactOccurred('light');
            }, { passive: true });
        });

        console.log('✨ Haptic feedback активирован');
    }

    // ========================================
    // LAZY LOADING ДЛЯ ИЗОБРАЖЕНИЙ
    // ========================================
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => imageObserver.observe(img));

            console.log('✨ Lazy loading активирован');
        }
    }

    // ========================================
    // ПРОГРЕСС БАР СКРОЛЛА
    // ========================================
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #ffcc00, #ff8e53, #ff6b6b);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const scrolled = (window.pageYOffset / windowHeight) * 100;
                    progressBar.style.width = scrolled + '%';
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        console.log('✨ Scroll progress активирован');
    }

    // ========================================
    // УЛУЧШЕННЫЙ TOAST С АНИМАЦИЕЙ
    // ========================================
    window.showToastEnhanced = function(message, duration = 3000, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast-enhanced';

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const colors = {
            success: 'linear-gradient(135deg, #4caf50, #45a049)',
            error: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
            warning: 'linear-gradient(135deg, #ffcc00, #ff8e53)',
            info: 'linear-gradient(135deg, #2196F3, #1976D2)'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
        `;

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%) translateY(100px)',
            background: colors[type],
            color: 'white',
            padding: '16px 24px',
            borderRadius: '16px',
            fontWeight: '600',
            fontSize: '0.95rem',
            zIndex: '10001',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '200px',
            maxWidth: '90%',
            opacity: '0',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        });

        document.body.appendChild(toast);

        // Анимация появления
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        // Анимация исчезновения
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-50px)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    };

    // ========================================
    // ИНИЦИАЛИЗАЦИЯ ВСЕХ УЛУЧШЕНИЙ
    // ========================================
    function init() {
        console.log('🚀 Инициализация нереальных улучшений...');

        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAll);
        } else {
            initAll();
        }

        function initAll() {
            initParallax();
            initRippleEffect();
            initScrollAnimations();
            initSmoothScroll();
            initSmartHeader();
            initCursorParticles();
            initHapticFeedback();
            initLazyLoading();
            initScrollProgress();

            console.log('✅ Все улучшения активированы!');

            // Показываем уведомление
            setTimeout(() => {
                if (window.showToastEnhanced) {
                    showToastEnhanced('🎨 Нереальный дизайн загружен!', 2000, 'info');
                }
            }, 1000);
        }
    }

    // Запускаем
    init();

    // Экспортируем в глобальный объект
    window.matryoshkaEnhancements = {
        initParallax,
        initRippleEffect,
        initScrollAnimations,
        initSmoothScroll,
        initSmartHeader,
        initCursorParticles,
        initHapticFeedback,
        initLazyLoading,
        initScrollProgress
    };

})();
