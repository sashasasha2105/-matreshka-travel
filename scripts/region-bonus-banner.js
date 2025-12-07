// Region Bonus Banner - плашка с информацией о доступных купонах региона
(function() {
    'use strict';

    // Получить иконку региона
    function getRegionIcon(regionName) {
        const regionIcons = {
            'Москва': '🏛️',
            'Санкт-Петербург': '🌉',
            'Московская область': '🏘️',
            'Краснодарский край': '🌴',
            'Республика Татарстан': '🕌',
            'Свердловская область': '🏔️',
            'Новосибирская область': '🌲',
            'Ростовская область': '🌾',
            'Республика Башкортостан': '🏞️',
            'Красноярский край': '❄️',
            'Приморский край': '🌊',
            'Пермский край': '⛰️',
            'Волгоградская область': '🏛️',
            'Челябинская область': '🏭',
            'Самарская область': '🚀',
            'Нижегородская область': '🎭',
            'Республика Дагестан': '🗻',
            'Ставропольский край': '⛲',
            'Иркутская область': '🦌',
            'Саратовская область': '🌻',
            'Тюменская область': '🛢️',
            'Кемеровская область': '⛏️',
            'Алтайский край': '🏔️',
            'Хабаровский край': '🐅',
            'Омская область': '🏛️',
            'Республика Крым': '🏖️',
            'Калининградская область': '🏰',
            'Воронежская область': '🌳',
            'Ленинградская область': '🏡',
            'Тульская область': '🎨'
        };

        return regionIcons[regionName] || '🗺️';
    }

    // Получить количество дней до истечения
    function getDaysRemaining() {
        const expiresDate = localStorage.getItem('regionBonusExpires');
        if (!expiresDate) return 0;

        const now = new Date();
        const expires = new Date(expiresDate);
        const diffTime = expires - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    }

    // Активировать регион как оплаченный
    function activateRegionBonus(regionName) {
        // Инициализируем paidRegions если нужно
        if (typeof window.paidRegions === 'undefined') {
            window.paidRegions = [];
            const saved = localStorage.getItem('paidRegions');
            if (saved) {
                try {
                    window.paidRegions = JSON.parse(saved);
                } catch (e) {
                    window.paidRegions = [];
                }
            }
        }

        // Находим ID региона по имени
        const regionId = findRegionIdByName(regionName);
        if (!regionId) {
            console.error('Регион не найден:', regionName);
            return;
        }

        // Проверяем, не добавлен ли уже
        const existingRegion = window.paidRegions.find(r => r.id === regionId);
        if (existingRegion) {
            console.log('Регион уже активирован:', regionName);
            return;
        }

        // Добавляем регион в оплаченные
        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + 30);

        window.paidRegions.push({
            id: regionId,
            purchaseDate: new Date().toISOString(),
            expiresAt: expiresDate.toISOString()
        });

        localStorage.setItem('paidRegions', JSON.stringify(window.paidRegions));
        console.log('✅ Регион активирован:', regionName, regionId);

        // Обновляем задания и корзину
        if (window.questsSystem) {
            window.questsSystem.generateQuests();
            window.questsSystem.renderQuests();
            window.questsSystem.updateQuestsBadge();
        }

        if (window.matryoshkaCart) {
            window.matryoshkaCart.loadPaidRegions();
            window.matryoshkaCart.render();
        }
    }

    // Найти ID региона по имени
    function findRegionIdByName(regionName) {
        if (!window.RUSSIA_REGIONS_DATA) return null;

        for (const [id, data] of Object.entries(window.RUSSIA_REGIONS_DATA)) {
            if (data.name === regionName) {
                return id;
            }
        }
        return null;
    }

    // Показать плашку
    function showRegionBonusBanner() {
        const bonusActive = localStorage.getItem('regionBonusActive');
        const regionName = localStorage.getItem('regionBonusRegion');
        const bonusJustActivated = sessionStorage.getItem('bonusJustActivated');

        if (!bonusActive || !regionName) return;

        // Проверяем, не истек ли бонус
        const daysRemaining = getDaysRemaining();
        if (daysRemaining <= 0) {
            localStorage.removeItem('regionBonusActive');
            localStorage.removeItem('regionBonusRegion');
            localStorage.removeItem('regionBonusActivated');
            localStorage.removeItem('regionBonusExpires');
            return;
        }

        // Проверяем, нет ли уже плашки
        if (document.getElementById('regionBonusBanner')) {
            return;
        }

        // Активируем регион если только что получен бонус
        if (bonusJustActivated) {
            activateRegionBonus(regionName);
            sessionStorage.removeItem('bonusJustActivated');
        }

        const regionIcon = getRegionIcon(regionName);

        // Находим карусель
        const carousel = document.getElementById('applePackagesCarousel');
        if (!carousel) return;

        // Создаем плашку
        const bannerHTML = `
            <div class="region-bonus-banner" id="regionBonusBanner">
                <div class="bonus-banner-content">
                    <div class="bonus-banner-icon-wrapper">
                        <div class="bonus-banner-icon">${regionIcon}</div>
                        <div class="bonus-banner-badge">🎉</div>
                    </div>

                    <div class="bonus-banner-info">
                        <div class="bonus-banner-title">
                            <span class="bonus-banner-region">${regionName}</span>
                            <span class="bonus-banner-status">Активен</span>
                        </div>
                        <div class="bonus-banner-text">
                            Выдан пакет региона со скидками и digital-челленджами на <strong>${daysRemaining} ${getDaysText(daysRemaining)}</strong>
                        </div>
                    </div>

                    <div class="bonus-banner-discount">
                        <div class="bonus-discount-value">-30%</div>
                        <div class="bonus-discount-label">скидка</div>
                    </div>
                </div>

                <button class="bonus-banner-close" id="bonusBannerClose" title="Скрыть">
                    ×
                </button>
            </div>
        `;

        // Вставляем плашку после карусели
        carousel.insertAdjacentHTML('afterend', bannerHTML);

        // Анимация появления
        const banner = document.getElementById('regionBonusBanner');
        setTimeout(() => {
            banner.classList.add('visible');
        }, 100);

        // Функция закрытия
        function closeBanner() {
            banner.classList.remove('visible');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }

        // Обработчик закрытия по кнопке
        const closeBtn = document.getElementById('bonusBannerClose');
        closeBtn.addEventListener('click', closeBanner);

        // Автозакрытие через 5 секунд только если бонус только что активирован
        if (bonusJustActivated) {
            setTimeout(() => {
                if (document.getElementById('regionBonusBanner')) {
                    closeBanner();
                }
            }, 5000);
        }
    }

    // Вспомогательная функция для склонения слова "день"
    function getDaysText(days) {
        if (days === 1) return 'день';
        if (days >= 2 && days <= 4) return 'дня';
        return 'дней';
    }

    // Проверяем и показываем плашку при загрузке страницы
    function checkAndShowBanner() {
        const bonusActive = localStorage.getItem('regionBonusActive');
        if (bonusActive) {
            // Даем время карусели загрузиться
            setTimeout(showRegionBonusBanner, 1000);
        }
    }

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndShowBanner);
    } else {
        checkAndShowBanner();
    }

    // Экспортируем функцию для использования из других скриптов
    window.showRegionBonusBanner = showRegionBonusBanner;
})();
