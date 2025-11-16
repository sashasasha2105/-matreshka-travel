/**
 * 🎨 ACETERNITY EFFECTS - JavaScript для интерактивных эффектов
 * 3D карточки, spotlight эффект, mouse tracking
 */

(function() {
    'use strict';

    console.log('🎨 Aceternity Effects загружены');

    // ========================================
    // 3D CARD EFFECT - Mouse tracking
    // ========================================
    function init3DCards() {
        const cards = document.querySelectorAll('.region-card, .package-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', handleMouseMove);
            card.addEventListener('mouseleave', handleMouseLeave);
        });

        function handleMouseMove(e) {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();

            // Вычисляем позицию мыши относительно карточки (0-1)
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            // Вычисляем углы поворота (-10 до +10 градусов)
            const rotateX = (y - 0.5) * -20; // Инвертируем для правильного направления
            const rotateY = (x - 0.5) * 20;

            // Применяем трансформацию
            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(1.05, 1.05, 1.05)
                translateY(-12px)
            `;
        }

        function handleMouseLeave(e) {
            const card = e.currentTarget;
            card.style.transform = '';
        }
    }

    // ========================================
    // SPOTLIGHT EFFECT - Следование за курсором
    // ========================================
    function initSpotlightEffect() {
        const cards = document.querySelectorAll('.region-card, .package-card, .team-member');

        cards.forEach(card => {
            card.addEventListener('mousemove', handleSpotlight);
        });

        function handleSpotlight(e) {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();

            // Позиция мыши в пикселях относительно карточки
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Устанавливаем CSS переменные для spotlight
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    }

    // ========================================
    // FLOATING DOCK - Магнитный эффект
    // ========================================
    function initFloatingDock() {
        const dock = document.querySelector('.bottom-nav');
        if (!dock) return;

        const navItems = dock.querySelectorAll('.nav-item');

        navItems.forEach((item, index) => {
            item.addEventListener('mouseenter', (e) => {
                // Увеличиваем соседние элементы
                const prevItem = navItems[index - 1];
                const nextItem = navItems[index + 1];

                if (prevItem) {
                    prevItem.style.transform = 'translateY(-6px) scale(1.08)';
                }
                if (nextItem) {
                    nextItem.style.transform = 'translateY(-6px) scale(1.08)';
                }
            });

            item.addEventListener('mouseleave', (e) => {
                const prevItem = navItems[index - 1];
                const nextItem = navItems[index + 1];

                if (prevItem && !prevItem.matches(':hover')) {
                    prevItem.style.transform = '';
                }
                if (nextItem && !nextItem.matches(':hover')) {
                    nextItem.style.transform = '';
                }
            });
        });
    }

    // ========================================
    // SCROLL ANIMATIONS - Fade in on scroll
    // ========================================
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Наблюдаем за элементами с data-animate
        const animatedElements = document.querySelectorAll('[data-animate]');
        animatedElements.forEach(el => observer.observe(el));

        // Также добавляем анимацию для карточек регионов
        const cards = document.querySelectorAll('.region-card, .package-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-fadeInUp');
        });
    }

    // ========================================
    // SMOOTH SCROLL для внутренних ссылок
    // ========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '') return;

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
    // PARALLAX EFFECT для hero секции
    // ========================================
    function initParallax() {
        const hero = document.querySelector('.hero-section');
        if (!hero) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const parallaxSpeed = 0.5;

                    // Двигаем фон медленнее чем скролл
                    hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;

                    ticking = false;
                });

                ticking = true;
            }
        });
    }

    // ========================================
    // RIPPLE EFFECT для кнопок
    // ========================================
    function initRippleEffect() {
        const buttons = document.querySelectorAll('.date-save-btn, .action-btn, .cta-button');

        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();

                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                // Удаляем существующий ripple если есть
                const existingRipple = this.querySelector('.ripple');
                if (existingRipple) {
                    existingRipple.remove();
                }

                this.appendChild(ripple);

                // Удаляем ripple после анимации
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    // ========================================
    // ACTIVE NAV ITEM - Highlighting
    // ========================================
    function updateActiveNavItem() {
        const currentPage = window.location.hash || '#main';
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (currentPage.includes(page) || (currentPage === '' && page === 'main')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // ========================================
    // AURORA BACKGROUND - Случайное изменение цветов
    // ========================================
    function initAuroraVariation() {
        const body = document.body;
        let hue = 0;

        setInterval(() => {
            hue = (hue + 1) % 360;
            body.style.setProperty('--aurora-hue', hue);
        }, 100);
    }

    // ========================================
    // PERFORMANCE OPTIMIZATION
    // ========================================
    function optimizePerformance() {
        // Отключаем сложные эффекты на слабых устройствах
        const isLowEndDevice = () => {
            return navigator.hardwareConcurrency <= 4 ||
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        };

        if (isLowEndDevice()) {
            console.log('🔧 Режим производительности: упрощенные эффекты');
            document.body.classList.add('low-performance');

            // Отключаем parallax на мобильных
            const hero = document.querySelector('.hero-section');
            if (hero) {
                hero.style.transform = 'none';
            }
        }
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        // Проверяем что DOM загружен
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('🚀 Инициализация Aceternity Effects...');

        // Запускаем все эффекты
        init3DCards();
        initSpotlightEffect();
        initFloatingDock();
        initScrollAnimations();
        initSmoothScroll();
        initParallax();
        initRippleEffect();
        updateActiveNavItem();
        optimizePerformance();

        // Обновляем active nav при изменении hash
        window.addEventListener('hashchange', updateActiveNavItem);

        // Добавляем класс loaded к body
        setTimeout(() => {
            document.body.classList.add('effects-loaded');
        }, 100);

        console.log('✅ Aceternity Effects инициализированы');
    }

    // Запускаем инициализацию
    init();

    // Экспортируем функции для возможного использования
    window.AceternityEffects = {
        init3DCards,
        initSpotlightEffect,
        initFloatingDock,
        updateActiveNavItem
    };

})();
