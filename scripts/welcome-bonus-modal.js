// Welcome Bonus Modal
(function() {
    'use strict';

    // Проверяем, был ли только что выбран регион
    function checkAndShowWelcomeBonus() {
        const userRegion = localStorage.getItem('userRegion');
        const bonusShown = sessionStorage.getItem('welcomeBonusShown');
        const justCompleted = sessionStorage.getItem('justCompletedWelcome');

        // Показываем только если регион выбран, бонус еще не показан и только что завершили welcome
        if (userRegion && !bonusShown && justCompleted) {
            setTimeout(() => {
                showWelcomeBonusModal(userRegion);
                sessionStorage.setItem('welcomeBonusShown', 'true');
                sessionStorage.removeItem('justCompletedWelcome');
            }, 500);
        }
    }

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

    // Показать модальное окно
    function showWelcomeBonusModal(regionName) {
        const regionIcon = getRegionIcon(regionName);

        const modalHTML = `
            <div class="welcome-bonus-overlay" id="welcomeBonusOverlay">
                <div class="welcome-bonus-modal">
                    <button class="bonus-modal-close" id="bonusModalClose">×</button>

                    <div class="bonus-modal-content">
                        <div class="bonus-icon">🎉</div>

                        <h2 class="bonus-title">Поздравляем!</h2>
                        <p class="bonus-subtitle">Вам доступен эксклюзивный пакет</p>

                        <div class="bonus-region-badge">
                            <span class="bonus-region-icon">${regionIcon}</span>
                            <span class="bonus-region-name">${regionName}</span>
                        </div>

                        <p class="bonus-description">
                            Специально для вас мы подготовили уникальное предложение —
                            полный доступ к турам и достопримечательностям вашего региона
                            со скидкой на целый месяц!
                        </p>

                        <div class="bonus-features">
                            <div class="bonus-features-title">Что входит в пакет:</div>

                            <div class="bonus-feature-item">
                                <span class="bonus-feature-icon">🎫</span>
                                <span class="bonus-feature-text">
                                    Скидка до 30% на все туры региона
                                    <span class="bonus-discount-badge">
                                        <span>🔥</span>
                                        <span>-30%</span>
                                    </span>
                                </span>
                            </div>

                            <div class="bonus-feature-item">
                                <span class="bonus-feature-icon">📍</span>
                                <span class="bonus-feature-text">Доступ к эксклюзивным локациям</span>
                            </div>

                            <div class="bonus-feature-item">
                                <span class="bonus-feature-icon">🗓️</span>
                                <span class="bonus-feature-text">Действует 30 дней с момента активации</span>
                            </div>

                            <div class="bonus-feature-item">
                                <span class="bonus-feature-icon">⭐</span>
                                <span class="bonus-feature-text">Приоритетная поддержка</span>
                            </div>
                        </div>

                        <div class="bonus-modal-actions">
                            <button class="bonus-btn bonus-btn-primary" id="activateBonusBtn">
                                <span>Активировать пакет</span>
                                <span>→</span>
                            </button>
                            <button class="bonus-btn bonus-btn-secondary" id="viewLaterBtn">
                                Посмотреть позже
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Добавляем модальное окно в DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Добавляем обработчики событий
        const overlay = document.getElementById('welcomeBonusOverlay');
        const closeBtn = document.getElementById('bonusModalClose');
        const activateBtn = document.getElementById('activateBonusBtn');
        const laterBtn = document.getElementById('viewLaterBtn');

        // Закрытие модального окна
        function closeModal() {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }

        // Закрыть по клику на крестик
        closeBtn.addEventListener('click', closeModal);

        // Закрыть по клику на overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });

        // Закрыть по Escape
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        });

        // Активировать пакет
        activateBtn.addEventListener('click', () => {
            // Сохраняем информацию об активации
            const activationDate = new Date();
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);

            localStorage.setItem('regionBonusActive', 'true');
            localStorage.setItem('regionBonusRegion', regionName);
            localStorage.setItem('regionBonusActivated', activationDate.toISOString());
            localStorage.setItem('regionBonusExpires', expirationDate.toISOString());

            // Показываем уведомление
            showToast('🎉 Пакет активирован! Скидки будут применены автоматически', 4000);

            closeModal();

            // Прокручиваем к секции с турами региона (если она есть)
            setTimeout(() => {
                const regionsSection = document.querySelector('.regions-section');
                if (regionsSection) {
                    regionsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500);
        });

        // Посмотреть позже
        laterBtn.addEventListener('click', closeModal);
    }

    // Toast notification helper
    function showToast(message, duration = 3000) {
        // Используем существующую функцию showToast если она есть
        if (typeof window.showToast === 'function') {
            window.showToast(message, duration);
        } else {
            // Fallback если функции нет
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(23, 23, 23, 0.95);
                color: white;
                padding: 1rem 2rem;
                border-radius: 12px;
                z-index: 10001;
                font-size: 1rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
    }

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndShowWelcomeBonus);
    } else {
        checkAndShowWelcomeBonus();
    }

    // Экспортируем функцию для возможности вызова извне
    window.showWelcomeBonusModal = showWelcomeBonusModal;
})();
