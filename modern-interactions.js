/**
 * СОВРЕМЕННЫЕ ВЗАИМОДЕЙСТВИЯ v1.0
 * Легковесные улучшения UX без библиотек
 * Vanilla JS для максимальной производительности
 */

(function() {
    'use strict';

    // ========================================
    // INTERSECTION OBSERVER ДЛЯ SCROLL ANIMATIONS
    // ========================================

    function initScrollAnimations() {
        // Проверяем поддержку
        if (!('IntersectionObserver' in window)) {
            console.log('IntersectionObserver не поддерживается');
            return;
        }

        const animatedElements = document.querySelectorAll('[data-animate]');

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Добавляем delay для stagger эффекта
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, index * 100);

                    // Отключаем наблюдение после анимации
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    // ========================================
    // АВТОМАТИЧЕСКАЯ АНИМАЦИЯ ДЛЯ НОВЫХ ЭЛЕМЕНТОВ
    // ========================================

    function animateNewElements() {
        // Наблюдаем за изменениями в DOM
        const targetNode = document.getElementById('regionsGrid');
        const packagesNode = document.getElementById('packagesGrid');
        const feedNode = document.getElementById('travelFeed');

        if (!targetNode && !packagesNode && !feedNode) return;

        const observerConfig = {
            childList: true,
            subtree: true
        };

        const mutationCallback = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node, index) => {
                        if (node.nodeType === 1) { // Element node
                            // Добавляем stagger delay
                            node.style.setProperty('--delay', `${index * 0.1}s`);
                            node.setAttribute('data-animate', '');

                            // Триггерим анимацию
                            setTimeout(() => {
                                node.classList.add('animated');
                            }, index * 100);
                        }
                    });
                }
            }
        };

        const observer = new MutationObserver(mutationCallback);

        if (targetNode) observer.observe(targetNode, observerConfig);
        if (packagesNode) observer.observe(packagesNode, observerConfig);
        if (feedNode) observer.observe(feedNode, observerConfig);
    }

    // ========================================
    // RIPPLE EFFECT ДЛЯ КНОПОК
    // ========================================

    function initRippleEffect() {
        const buttons = document.querySelectorAll('button, .btn, .region-card, .package-card');

        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                    transform: scale(0);
                    animation: ripple-animation 0.6s ease-out;
                `;

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // Добавляем CSS для ripple анимации
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple-animation {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);

    // ========================================
    // PARALLAX ЭФФЕКТ ДЛЯ HERO
    // ========================================

    function initParallax() {
        const heroModel = document.querySelector('.hero-model-container');
        if (!heroModel) return;

        let ticking = false;

        function updateParallax(scrollPos) {
            const offset = scrollPos * 0.3; // Parallax коэффициент
            heroModel.style.transform = `translateY(${offset}px)`;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            // ЗАЩИТА: Проверяем готовность приложения
            if (!window.appReady) return;

            const scrollPos = window.pageYOffset;

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateParallax(scrollPos);
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ========================================
    // LAZY LOADING ДЛЯ ИЗОБРАЖЕНИЙ
    // ========================================

    function initLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // Браузер поддерживает нативный lazy loading
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        } else {
            // Fallback для старых браузеров
            const images = document.querySelectorAll('img[data-src]');

            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // ========================================
    // SMOOTH SCROLL ДЛЯ ЯКОРЕЙ
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
    }

    // ========================================
    // УЛУЧШЕННЫЙ LOADER С ПРОГРЕССОМ
    // ========================================

    function enhanceLoader() {
        const loader = document.getElementById('loader');
        if (!loader) return;

        // Добавляем прогресс бар
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 4px;
            background: rgba(255, 204, 0, 0.2);
            border-radius: 2px;
            overflow: hidden;
        `;

        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #ffcc00, #ff9500);
            width: 0%;
            transition: width 0.3s ease;
            border-radius: 2px;
        `;

        progressBar.appendChild(progressFill);
        loader.appendChild(progressBar);

        // Симулируем прогресс
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 100) progress = 100;
            progressFill.style.width = progress + '%';
            if (progress >= 100) clearInterval(interval);
        }, 300);
    }

    // ========================================
    // НАВИГАЦИЯ - АКТИВНАЯ СТРАНИЦА
    // ========================================

    function updateActiveNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // ========================================
    // УЛУЧШЕННЫЙ ПОИСК С ДЕБАУНСОМ
    // ========================================

    function enhanceSearch() {
        const searchInput = document.getElementById('regionSearch');
        if (!searchInput) return;

        let searchTimeout;
        const originalInput = searchInput.oninput;

        searchInput.oninput = function(e) {
            clearTimeout(searchTimeout);

            // Добавляем индикатор загрузки
            this.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 50 50\'%3E%3Cpath fill=\'%23ffcc00\' d=\'M25 5A20 20 0 1 0 45 25A20 20 0 0 0 25 5Zm0 36A16 16 0 1 1 41 25A16 16 0 0 1 25 41Z\' opacity=\'.25\'/%3E%3Cpath fill=\'%23ffcc00\' d=\'M25 5A20 20 0 0 1 45 25H41A16 16 0 0 0 25 9Z\'%3E%3CanimateTransform attributeName=\'transform\' dur=\'1s\' from=\'0 25 25\' repeatCount=\'indefinite\' to=\'360 25 25\' type=\'rotate\'/%3E%3C/path%3E%3C/svg%3E")';
            this.style.backgroundRepeat = 'no-repeat';
            this.style.backgroundPosition = 'right 12px center';
            this.style.backgroundSize = '20px';

            searchTimeout = setTimeout(() => {
                this.style.backgroundImage = '';
                if (typeof originalInput === 'function') {
                    originalInput.call(this, e);
                }
            }, 300);
        };
    }

    // ========================================
    // ПОКАЗ SKELETON ПРИ ЗАГРУЗКЕ
    // ========================================

    function showSkeletons(container, count = 6) {
        const skeletons = [];
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'region-card skeleton skeleton-card';
            skeleton.innerHTML = `
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            `;
            skeletons.push(skeleton);
        }
        return skeletons;
    }

    // ========================================
    // PERFORMANCE MONITORING
    // ========================================

    function monitorPerformance() {
        if ('PerformanceObserver' in window) {
            // Отслеживаем долгие задачи
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('Долгая задача обнаружена:', entry.duration.toFixed(2) + 'ms');
                    }
                }
            });

            try {
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Не все браузеры поддерживают longtask
            }
        }

        // Логируем метрики при загрузке
        window.addEventListener('load', () => {
            if (window.performance && window.performance.timing) {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log('⚡ Время загрузки страницы:', pageLoadTime + 'ms');
            }
        });
    }

    // ========================================
    // ИНИЦИАЛИЗАЦИЯ ВСЕХ УЛУЧШЕНИЙ
    // ========================================

    function init() {
        // Проверяем что DOM готов
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('🚀 Инициализация современных улучшений...');

        try {
            initScrollAnimations();
            animateNewElements();
            initRippleEffect();
            initParallax();
            initLazyLoading();
            initSmoothScroll();
            enhanceLoader();
            updateActiveNavigation();
            enhanceSearch();
            monitorPerformance();

            console.log('✅ Все улучшения активированы');
        } catch (error) {
            console.error('❌ Ошибка при инициализации улучшений:', error);
        }
    }

    // Запускаем инициализацию
    init();

    // Экспортируем функции для использования
    window.ModernInteractions = {
        showSkeletons,
        initScrollAnimations,
        initLazyLoading
    };

})();
