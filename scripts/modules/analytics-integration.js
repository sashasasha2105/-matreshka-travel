// ========================================
// ИНТЕГРАЦИЯ АНАЛИТИКИ В МАТРЕШКУ
// ========================================

/**
 * Этот файл интегрирует аналитику во все ключевые точки приложения
 */

(function() {
    // Ждём загрузки аналитического модуля
    function waitForAnalytics(callback) {
        if (window.matryoshkaAnalytics) {
            callback();
        } else {
            setTimeout(() => waitForAnalytics(callback), 100);
        }
    }

    waitForAnalytics(() => {
        const analytics = window.matryoshkaAnalytics;

        if (analytics.debug) {
            console.log('🔗 Подключение интеграции аналитики...');
        }

        // ========================================
        // 1. ОТСЛЕЖИВАНИЕ ОТКРЫТИЯ ВНЕШНИХ ССЫЛОК
        // ========================================

        // Патчим window.open
        const originalWindowOpen = window.open;
        window.open = function(url, target, features) {
            analytics.trackLinkOpen(url, 'window.open', 'Внешняя ссылка');
            return originalWindowOpen.call(this, url, target, features);
        };

        // Патчим Telegram.WebApp.openLink
        if (window.Telegram?.WebApp?.openLink) {
            const originalOpenLink = window.Telegram.WebApp.openLink;
            window.Telegram.WebApp.openLink = function(url, options) {
                analytics.trackLinkOpen(url, 'telegram_link', 'Telegram Link');
                return originalOpenLink.call(this, url, options);
            };
        }

        // Патчим Telegram.WebApp.openTelegramLink
        if (window.Telegram?.WebApp?.openTelegramLink) {
            const originalOpenTelegramLink = window.Telegram.WebApp.openTelegramLink;
            window.Telegram.WebApp.openTelegramLink = function(url) {
                analytics.trackLinkOpen(url, 'telegram_internal', 'Telegram Internal Link');
                return originalOpenTelegramLink.call(this, url);
            };
        }

        // Отслеживание всех кликов по ссылкам с data-url
        document.addEventListener('click', function(e) {
            const target = e.target.closest('[data-url]');
            if (target) {
                const url = target.getAttribute('data-url');
                const title = target.getAttribute('data-title') || target.textContent.trim();
                analytics.trackLinkOpen(url, 'data-url-click', title);
            }
        });

        // ========================================
        // 2. ОТСЛЕЖИВАНИЕ НАВИГАЦИИ ПО РАЗДЕЛАМ
        // ========================================

        // Патчим функции навигации
        const navigationFunctions = {
            'showMainSection': 'Главная',
            'showProfile': 'Профиль',
            'showCart': 'Корзина',
            'showQuests': 'Задания',
            'showRegionDetails': 'Детали региона'
        };

        Object.keys(navigationFunctions).forEach(funcName => {
            if (window[funcName]) {
                const originalFunc = window[funcName];
                window[funcName] = function(...args) {
                    const pageName = navigationFunctions[funcName];
                    analytics.trackPageView(pageName, document.title);
                    return originalFunc.apply(this, args);
                };
            }
        });

        // ========================================
        // 3. ОТСЛЕЖИВАНИЕ ПОКУПОК
        // ========================================

        // Если есть функция покупки пакета
        if (window.purchasePackage) {
            const originalPurchase = window.purchasePackage;
            window.purchasePackage = function(packageData) {
                analytics.trackPurchase(
                    packageData.name || 'Пакет',
                    packageData.price || 0,
                    packageData.id
                );
                return originalPurchase.call(this, packageData);
            };
        }

        // ========================================
        // 4. ОТСЛЕЖИВАНИЕ ДЕЙСТВИЙ ПОЛЬЗОВАТЕЛЯ
        // ========================================

        // Добавление в корзину
        if (window.addToCart) {
            const originalAddToCart = window.addToCart;
            window.addToCart = function(item) {
                analytics.trackAction('Добавление в корзину', `${item.name || 'Товар'} - ${item.price || 0} ₽`);
                return originalAddToCart.call(this, item);
            };
        }

        // Открытие QR кода партнера
        document.addEventListener('click', function(e) {
            if (e.target.closest('.partner-qr-btn')) {
                const partner = e.target.closest('.partner-card');
                const partnerName = partner?.querySelector('.partner-name')?.textContent || 'Партнер';
                analytics.trackAction('Открытие QR партнера', partnerName);
            }
        });

        // Построение маршрута
        document.addEventListener('click', function(e) {
            if (e.target.closest('.route-btn, .partner-route-btn')) {
                const element = e.target.closest('[data-name], .partner-card, .attraction-card');
                const name = element?.getAttribute('data-name') ||
                             element?.querySelector('.partner-name, .attraction-name')?.textContent ||
                             'Место';
                analytics.trackAction('Построение маршрута', name);
            }
        });

        // ========================================
        // 5. ОТСЛЕЖИВАНИЕ ГЕНЕРАЦИИ ПУТЕШЕСТВИЙ
        // ========================================

        document.addEventListener('click', function(e) {
            if (e.target.closest('.generate-btn')) {
                analytics.trackAction('Генерация путешествия', 'Нажата кнопка генерации');
            }
        });

        // ========================================
        // 6. ОТСЛЕЖИВАНИЕ РАБОТЫ С ПРОФИЛЕМ
        // ========================================

        document.addEventListener('click', function(e) {
            // Добавление путешествия
            if (e.target.closest('.add-travel-btn')) {
                analytics.trackAction('Добавление путешествия', 'Открыта форма');
            }

            // Редактирование профиля
            if (e.target.closest('.profile-edit-btn')) {
                analytics.trackAction('Редактирование профиля', 'Открыта форма');
            }
        });

        // ========================================
        // 7. ОТСЛЕЖИВАНИЕ РАБОТЫ С ЗАДАНИЯМИ
        // ========================================

        document.addEventListener('click', function(e) {
            if (e.target.closest('.quest-action-btn')) {
                const questCard = e.target.closest('.quest-card');
                const questTitle = questCard?.querySelector('.quest-title')?.textContent || 'Задание';
                analytics.trackAction('Взятие задания', questTitle);
            }
        });

        // ========================================
        // 8. ОТСЛЕЖИВАНИЕ ВРЕМЕНИ НА СТРАНИЦЕ
        // ========================================

        let pageStartTime = Date.now();
        let currentPage = 'Главная';

        // Отправляем время при смене страницы
        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.floor((Date.now() - pageStartTime) / 1000);
            analytics.trackAction('Время на странице', `${currentPage}: ${timeSpent} сек`);
        });

        if (analytics.debug) {
            console.log('✅ Интеграция аналитики завершена');
            console.log('📊 Отслеживаются:');
            console.log('  - Запуски бота');
            console.log('  - Открытия ссылок');
            console.log('  - Навигация по разделам');
            console.log('  - Покупки');
            console.log('  - Действия пользователей');
            console.log('  - Работа с заданиями');
        }
    });
})();
