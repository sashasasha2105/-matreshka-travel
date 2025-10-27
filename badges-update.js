/**
 * Автоматическое обновление badges (счетчиков)
 * Обновляет значки количества заданий и товаров в корзине
 */

(function() {
    'use strict';

    // Функция обновления badge
    function updateBadge(badgeId, count) {
        const badge = document.getElementById(badgeId);
        if (!badge) return;

        // Устанавливаем значение
        badge.textContent = count;
        badge.setAttribute('data-count', count);

        // Показываем/скрываем в зависимости от count
        if (count > 0) {
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // Функция получения количества заданий
    function getQuestsCount() {
        try {
            // Проверяем есть ли система заданий
            if (window.matryoshkaQuests && window.matryoshkaQuests.quests) {
                // Считаем активные (не завершенные) задания
                const activeQuests = window.matryoshkaQuests.quests.filter(q => !q.completed);
                return activeQuests.length;
            }

            // Fallback - проверяем localStorage
            const savedQuests = localStorage.getItem('matryoshkaQuests');
            if (savedQuests) {
                const quests = JSON.parse(savedQuests);
                const activeQuests = quests.filter(q => !q.completed);
                return activeQuests.length;
            }

            return 0;
        } catch (e) {
            console.error('Ошибка подсчета заданий:', e);
            return 0;
        }
    }

    // Функция получения количества товаров в корзине
    function getCartCount() {
        try {
            // Проверяем есть ли корзина
            if (window.matryoshkaCart) {
                // Считаем пакеты
                const packagesCount = window.matryoshkaCart.purchasedPackages?.length || 0;

                // Считаем оплаченные регионы
                const regionsCount = window.matryoshkaCart.paidRegions?.length || 0;

                return packagesCount + regionsCount;
            }

            // Fallback - проверяем localStorage и sessionStorage
            let total = 0;

            // Пакеты из localStorage
            const savedPackages = localStorage.getItem('purchasedPackages');
            if (savedPackages) {
                const packages = JSON.parse(savedPackages);
                total += packages.length;
            }

            // Регионы из sessionStorage
            const savedRegions = sessionStorage.getItem('paidRegions');
            if (savedRegions) {
                const regions = JSON.parse(savedRegions);
                total += regions.length;
            }

            return total;
        } catch (e) {
            console.error('Ошибка подсчета корзины:', e);
            return 0;
        }
    }

    // Основная функция обновления всех badges
    function updateAllBadges() {
        const questsCount = getQuestsCount();
        const cartCount = getCartCount();

        updateBadge('questsBadge', questsCount);
        updateBadge('cartBadge', cartCount);

        console.log('📊 Badges обновлены:', { quests: questsCount, cart: cartCount });
    }

    // Обновляем при загрузке страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateAllBadges);
    } else {
        updateAllBadges();
    }

    // Обновляем каждые 2 секунды (для синхронизации)
    setInterval(updateAllBadges, 2000);

    // Обновляем при изменении localStorage/sessionStorage
    window.addEventListener('storage', updateAllBadges);

    // Экспортируем функцию для ручного вызова
    window.updateBadges = updateAllBadges;

    // Обновляем при переходах между страницами
    const originalShowQuests = window.showQuests;
    const originalShowCart = window.showCart;
    const originalShowProfile = window.showProfile;
    const originalShowMainSection = window.showMainSection;

    if (typeof originalShowQuests === 'function') {
        window.showQuests = function() {
            updateAllBadges();
            return originalShowQuests.apply(this, arguments);
        };
    }

    if (typeof originalShowCart === 'function') {
        window.showCart = function() {
            updateAllBadges();
            return originalShowCart.apply(this, arguments);
        };
    }

    if (typeof originalShowProfile === 'function') {
        window.showProfile = function() {
            updateAllBadges();
            return originalShowProfile.apply(this, arguments);
        };
    }

    if (typeof originalShowMainSection === 'function') {
        window.showMainSection = function() {
            updateAllBadges();
            return originalShowMainSection.apply(this, arguments);
        };
    }

    console.log('✅ Система обновления badges инициализирована');
})();
