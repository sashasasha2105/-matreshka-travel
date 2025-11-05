/**
 * Liquid Glass Navigation
 * iOS-style навигация с жидким стеклом
 */

(function() {
    'use strict';

    class LiquidNavigation {
        constructor() {
            this.currentSection = 'main';
            this.previousSection = null;
            this.navHistory = ['main'];
            this.isAnimating = false;

            // Конфигурация секций
            this.sections = {
                main: {
                    id: 'mainSection',
                    icon: '🏠',
                    label: 'Главная',
                    hue: 144,
                },
                feed: {
                    id: 'fullFeedContainer',
                    icon: '🌍',
                    label: 'Лента',
                    hue: 200,
                },
                profile: {
                    id: 'profileSection',
                    icon: '👤',
                    label: 'Профиль',
                    hue: 264,
                },
                quests: {
                    id: 'questsSection',
                    icon: '🎯',
                    label: 'Задания',
                    hue: 44,
                },
                cart: {
                    id: 'cartSection',
                    icon: '🛒',
                    label: 'Корзина',
                    hue: 14,
                }
            };

            this.init();
        }

        init() {
            console.log('🌊 Инициализация Liquid Navigation...');
            this.createNavigation();
            this.setupEventListeners();
            console.log('✅ Liquid Navigation инициализирована');
        }

        createNavigation() {
            // Создаем контейнер навигации
            const nav = document.createElement('div');
            nav.className = 'bottom-nav-liquid';
            nav.innerHTML = `
                ${Object.entries(this.sections).map(([key, section]) => `
                    <div class="nav-item-wrapper ${key === 'main' ? 'active' : ''}" data-section="${key}">
                        <div class="nav-item-icon">${section.icon}</div>
                        <div class="nav-item-label">${section.label}</div>
                    </div>
                `).join('')}
            `;

            // Добавляем SVG фильтры
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.id = 'liquid-goo';
            svg.setAttribute('style', 'position: absolute; width: 0; height: 0;');
            svg.innerHTML = `
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="
                            1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 18 -8" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                    </filter>
                    <filter id="remove-black" color-interpolation-filters="sRGB">
                        <feColorMatrix type="matrix" values="
                            1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            -255 -255 -255 0 1" result="black-pixels"/>
                        <feMorphology in="black-pixels" operator="dilate" radius="0.5" result="smoothed"/>
                        <feComposite in="SourceGraphic" in2="smoothed" operator="out"/>
                    </filter>
                </defs>
            `;

            document.body.appendChild(svg);
            document.body.appendChild(nav);
        }

        setupEventListeners() {
            const navItems = document.querySelectorAll('.nav-item-wrapper');

            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const section = item.dataset.section;
                    this.navigateTo(section);
                });

                // Haptic feedback для Telegram
                item.addEventListener('touchstart', () => {
                    if (window.Telegram?.WebApp?.HapticFeedback) {
                        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                });
            });

            // Обработка кнопки "Назад" браузера
            window.addEventListener('popstate', (e) => {
                if (e.state && e.state.section) {
                    this.navigateTo(e.state.section, true);
                }
            });
        }

        async navigateTo(targetSection, isBack = false) {
            if (this.isAnimating || targetSection === this.currentSection) {
                return;
            }

            console.log(`🌊 Навигация: ${this.currentSection} → ${targetSection}`);

            this.isAnimating = true;

            // Обновляем активный пункт навигации
            this.updateActiveNav(targetSection);

            // Определяем направление анимации
            const isForward = !isBack && this.navHistory.indexOf(targetSection) === -1;

            // Скрываем текущую секцию с анимацией
            await this.hideSection(this.currentSection, isForward);

            // Показываем новую секцию с анимацией
            await this.showSection(targetSection, isForward);

            // Обновляем состояние
            this.previousSection = this.currentSection;
            this.currentSection = targetSection;

            // Обновляем историю
            if (!isBack) {
                this.navHistory.push(targetSection);
                history.pushState({ section: targetSection }, '', `#${targetSection}`);
            }

            this.isAnimating = false;

            // Вызываем callback для инициализации секции
            this.initializeSection(targetSection);
        }

        updateActiveNav(section) {
            document.querySelectorAll('.nav-item-wrapper').forEach(item => {
                item.classList.toggle('active', item.dataset.section === section);
            });
        }

        async hideSection(sectionKey, isForward) {
            const sectionEl = document.getElementById(this.sections[sectionKey].id);
            if (!sectionEl) return;

            const animationClass = isForward ? 'page-transition-exit' : 'page-transition-back-exit';
            sectionEl.classList.add(animationClass);

            await new Promise(resolve => setTimeout(resolve, 350));

            sectionEl.style.display = 'none';
            sectionEl.classList.remove(animationClass);
        }

        async showSection(sectionKey, isForward) {
            const sectionEl = document.getElementById(this.sections[sectionKey].id);
            if (!sectionEl) return;

            sectionEl.style.display = 'block';

            // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Прокрутка наверх
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            // Убираем блокировки скролла
            document.body.style.overflow = 'auto';
            document.body.style.position = 'static';
            document.documentElement.style.overflow = 'auto';

            // Вызываем глобальную функцию разблокировки
            if (window.ensureScrollEnabled) {
                window.ensureScrollEnabled();
            }

            const animationClass = isForward ? 'page-transition-enter' : 'page-transition-back-enter';
            sectionEl.classList.add(animationClass);

            await new Promise(resolve => setTimeout(resolve, 350));

            sectionEl.classList.remove(animationClass);
        }

        initializeSection(sectionKey) {
            console.log(`🔧 Инициализация секции: ${sectionKey}`);

            // Управление видимостью секции команды
            this.toggleTeamSection(sectionKey);

            switch(sectionKey) {
                case 'profile':
                    if (window.matryoshkaProfile && typeof window.matryoshkaProfile.initProfile === 'function') {
                        window.matryoshkaProfile.initProfile();
                    }
                    break;

                case 'quests':
                    if (window.matryoshkaQuests && typeof window.matryoshkaQuests.render === 'function') {
                        window.matryoshkaQuests.render();
                    }
                    break;

                case 'cart':
                    if (typeof renderCart === 'function') {
                        renderCart();
                    }
                    break;

                case 'feed':
                    // Рендерим полную ленту
                    if (window.matryoshkaFeed && window.travelDatabase) {
                        const travels = window.travelDatabase.getAll();
                        const fullFeedContainer = document.getElementById('fullFeedContainer');
                        if (fullFeedContainer) {
                            const html = `
                                <div class="feed-container">
                                    <div class="feed-header">
                                        <h2 class="feed-title">
                                            <span class="feed-icon">🌍</span>
                                            Лента путешествий
                                        </h2>
                                        <div class="feed-stats">
                                            ${travels.length} ${window.matryoshkaFeed.getWordForm(travels.length, ['путешествие', 'путешествия', 'путешествий'])}
                                        </div>
                                    </div>

                                    ${travels.length === 0 ? window.matryoshkaFeed.renderEmptyState() : `<div class="feed-grid">${travels.map(t => window.matryoshkaFeed.renderTravelCard(t)).join('')}</div>`}
                                </div>
                            `;
                            fullFeedContainer.innerHTML = html;
                        }
                    }
                    break;

                case 'main':
                    // Обновляем главную секцию если нужно
                    if (typeof loadMainFeedSection === 'function') {
                        loadMainFeedSection();
                    }
                    break;
            }
        }

        // Управление видимостью секции команды
        toggleTeamSection(sectionKey) {
            const teamSection = document.querySelector('.team-section');
            if (!teamSection) return;

            // Показываем секцию команды только на главной странице
            if (sectionKey === 'main') {
                teamSection.style.display = 'block';
                console.log('👥 Секция команды показана (главная страница)');
            } else {
                teamSection.style.display = 'none';
                console.log('👥 Секция команды скрыта');
            }
        }

        // Метод для программной навигации из других частей кода
        goTo(section) {
            this.navigateTo(section);
        }

        // Возврат на предыдущую секцию
        goBack() {
            if (this.navHistory.length > 1) {
                this.navHistory.pop();
                const prevSection = this.navHistory[this.navHistory.length - 1];
                this.navigateTo(prevSection, true);
            }
        }
    }

    // Создаем глобальный экземпляр
    window.liquidNav = new LiquidNavigation();

    // Заменяем старые функции навигации на новые
    window.showProfile = () => window.liquidNav.goTo('profile');
    window.showQuests = () => window.liquidNav.goTo('quests');
    window.showCart = () => window.liquidNav.goTo('cart');
    window.showFeed = () => window.liquidNav.goTo('feed');
    window.showMain = () => window.liquidNav.goTo('main');

    console.log('✅ Liquid Navigation loaded');
})();
