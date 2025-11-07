/**
 * 🔥 НОВАЯ СИСТЕМА НАВИГАЦИИ - ПОЛНОСТЬЮ ПЕРЕПИСАНА С НУЛЯ
 * Простая, надежная, без конфликтов
 */

console.log('🔥 navigation.js загружается...');

// СРАЗУ определяем глобальные функции для onclick
window.showMainSection = function() {
    console.log('🏠 showMainSection вызвана');
    if (window.MatryoshkaNavigation) {
        window.MatryoshkaNavigation.navigate('main');
    } else {
        console.error('❌ MatryoshkaNavigation еще не готова');
    }
};

window.showFeed = function() {
    console.log('🌍 showFeed вызвана');
    if (window.MatryoshkaNavigation) {
        window.MatryoshkaNavigation.navigate('feed');
    } else {
        console.error('❌ MatryoshkaNavigation еще не готова');
    }
};

window.showProfile = function() {
    console.log('👤 showProfile вызвана');
    if (window.MatryoshkaNavigation) {
        window.MatryoshkaNavigation.navigate('profile');
    } else {
        console.error('❌ MatryoshkaNavigation еще не готова');
    }
};

window.showCart = function() {
    console.log('🛒 showCart вызвана');
    if (window.MatryoshkaNavigation) {
        window.MatryoshkaNavigation.navigate('cart');
    } else {
        console.error('❌ MatryoshkaNavigation еще не готова');
    }
};

window.showQuests = function() {
    console.log('🎯 showQuests вызвана');
    if (window.MatryoshkaNavigation) {
        window.MatryoshkaNavigation.navigate('quests');
    } else {
        console.error('❌ MatryoshkaNavigation еще не готова');
    }
};

window.goBack = function() {
    console.log('⬅️ goBack вызвана');
    if (window.MatryoshkaNavigation) {
        window.MatryoshkaNavigation.navigate('main');
    } else {
        console.error('❌ MatryoshkaNavigation еще не готова');
    }
};

window.hideProfile = function() {
    if (window.MatryoshkaNavigation) {
        window.MatryoshkaNavigation.navigate('main');
    }
};

window.hideCart = function() {
    if (window.MatryoshkaNavigation) {
        window.MatryoshkaNavigation.navigate('main');
    }
};

console.log('✅ Глобальные функции навигации определены');

(function() {
    'use strict';

    console.log('🚀 Инициализация новой системы навигации...');

    // Глобальный объект навигации
    window.MatryoshkaNavigation = {
        currentPage: 'main',

        // Список всех секций
        sections: {
            main: 'mainSection',
            feed: 'fullFeedContainer',
            profile: 'profileSection',
            cart: 'cartSection',
            quests: 'questsSection',
            regionDetails: 'regionDetails'
        },

        /**
         * Главная функция переключения страниц
         */
        navigate: function(targetPage) {
            console.log(`📍 Навигация: ${this.currentPage} → ${targetPage}`);

            // Шаг 1: Скрываем ВСЕ секции
            this.hideAllSections();

            // Шаг 2: Показываем нужную секцию
            const sectionId = this.sections[targetPage];
            const section = document.getElementById(sectionId);

            if (section) {
                section.style.display = 'block';
                console.log(`✅ Показана секция: ${sectionId}`);
            } else {
                console.error(`❌ Секция не найдена: ${sectionId}`);
                return;
            }

            // Шаг 3: Разблокируем скролл ПРИНУДИТЕЛЬНО
            this.unlockScroll();

            // Шаг 4: Прокручиваем наверх
            this.scrollToTop();

            // Шаг 5: Обновляем навигацию
            this.updateNavButtons(targetPage);

            // Шаг 6: Обновляем видимость команды
            this.updateTeamVisibility(targetPage);

            // Шаг 7: Инициализируем секцию
            this.initSection(targetPage);

            // Сохраняем текущую страницу
            this.currentPage = targetPage;
        },

        /**
         * Скрыть все секции
         */
        hideAllSections: function() {
            Object.values(this.sections).forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.style.display = 'none';
                }
            });
        },

        /**
         * Разблокировка скролла (ПРИНУДИТЕЛЬНО)
         */
        unlockScroll: function() {
            // Убираем все возможные блокировки
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.height = '';
            document.body.style.width = '';

            document.documentElement.style.overflow = '';
            document.documentElement.style.position = '';
            document.documentElement.style.height = '';

            // Удаляем классы которые могут блокировать
            document.body.classList.remove('modal-open', 'no-scroll', 'locked');
            document.documentElement.classList.remove('modal-open', 'no-scroll', 'locked');

            console.log('🔓 Скролл разблокирован');
        },

        /**
         * Прокрутка наверх (УЛЬТРА АГРЕССИВНАЯ - ГАРАНТИРОВАННАЯ)
         */
        scrollToTop: function() {
            // Функция форсированной прокрутки
            const forceScrollTop = () => {
                window.scrollTo(0, 0);
                window.scrollTo({top: 0, left: 0, behavior: 'instant'});
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            };

            // Немедленно (синхронно)
            forceScrollTop();

            // Через requestAnimationFrame (после следующего рендера)
            requestAnimationFrame(() => {
                forceScrollTop();
            });

            // Через 0мс (следующий тик event loop)
            setTimeout(() => forceScrollTop(), 0);

            // Через 10мс (после рендера DOM)
            setTimeout(() => forceScrollTop(), 10);

            // Через 50мс (после анимаций)
            setTimeout(() => forceScrollTop(), 50);

            // Через 100мс (финальная гарантия)
            setTimeout(() => forceScrollTop(), 100);

            // Через 200мс (абсолютная гарантия для медленных устройств)
            setTimeout(() => {
                forceScrollTop();
                console.log('✅ Прокрутка наверх завершена (позиция:', window.scrollY, ')');
            }, 200);
        },

        /**
         * Обновление кнопок навигации
         */
        updateNavButtons: function(activePage) {
            const navButtons = document.querySelectorAll('.nav-item, .bottom-nav button, [data-page]');
            navButtons.forEach(btn => {
                const page = btn.getAttribute('data-page') || btn.getAttribute('onclick')?.match(/show(\w+)/)?.[1]?.toLowerCase();
                if (page === activePage || (page === 'main' && activePage === 'main')) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        },

        /**
         * Управление видимостью секции команды
         */
        updateTeamVisibility: function(page) {
            const teamSection = document.querySelector('.team-section');
            if (teamSection) {
                teamSection.style.display = page === 'main' ? 'block' : 'none';
            }
        },

        /**
         * Инициализация секции
         */
        initSection: function(page) {
            switch(page) {
                case 'profile':
                    if (window.matryoshkaProfile?.loadProfileData) {
                        setTimeout(() => window.matryoshkaProfile.loadProfileData(), 100);
                    }
                    break;

                case 'cart':
                    if (window.matryoshkaCart?.refresh) {
                        setTimeout(() => window.matryoshkaCart.refresh(), 100);
                    }
                    break;

                case 'quests':
                    if (window.matryoshkaQuests?.render) {
                        setTimeout(() => window.matryoshkaQuests.render(), 100);
                    }
                    break;

                case 'feed':
                    this.loadFeed();
                    break;

                case 'main':
                    if (typeof loadMainFeedSection === 'function') {
                        setTimeout(() => loadMainFeedSection(), 100);
                    }
                    break;
            }
        },

        /**
         * Загрузка ленты
         */
        loadFeed: function() {
            if (!window.matryoshkaFeed || !window.travelDatabase) return;

            const container = document.getElementById('fullFeedContainer');
            if (!container) return;

            const travels = window.travelDatabase.getAll();
            const html = `
                <div class="feed-container">
                    <div class="feed-header">
                        <h2 class="feed-title">
                            <span class="feed-icon">🌍</span>
                            Лента путешествий
                        </h2>
                        <div class="feed-stats">
                            ${travels.length} ${this.getWordForm(travels.length)}
                        </div>
                    </div>
                    ${travels.length === 0
                        ? window.matryoshkaFeed.renderEmptyState()
                        : `<div class="feed-grid">${travels.map(t => window.matryoshkaFeed.renderTravelCard(t)).join('')}</div>`
                    }
                </div>
            `;
            container.innerHTML = html;
        },

        /**
         * Склонение слов
         */
        getWordForm: function(count) {
            const forms = ['путешествие', 'путешествия', 'путешествий'];
            const cases = [2, 0, 1, 1, 1, 2];
            return forms[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
        }
    };

    // Обработчики для кнопок "Назад"
    document.addEventListener('DOMContentLoaded', function() {
        const backButtons = [
            'backBtn',
            'profileBackBtn',
            'cartBackBtn',
            'questsBackBtn'
        ];

        backButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    window.MatryoshkaNavigation.navigate('main');
                });
            }
        });
    });

    // Автоматическая разблокировка скролла при клике на любую кнопку навигации
    document.addEventListener('click', function(e) {
        const navButton = e.target.closest('.nav-item, .bottom-nav button, .back-btn');
        if (navButton) {
            setTimeout(() => {
                window.MatryoshkaNavigation.unlockScroll();
            }, 50);
        }
    }, true);

    console.log('✅ Новая система навигации готова');
})();
