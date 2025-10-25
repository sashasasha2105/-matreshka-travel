/**
 * Модуль управления пакетами путешествий
 */

// Загрузка и отображение пакетов
function loadTravelPackages() {
    console.log('📦 Загрузка пакетов путешествий...');
    console.log('🔍 window.TRAVEL_PACKAGES:', window.TRAVEL_PACKAGES);
    console.log('🔍 typeof TRAVEL_PACKAGES:', typeof TRAVEL_PACKAGES);

    const packagesGrid = document.getElementById('packagesGrid');
    if (!packagesGrid) {
        console.error('❌ Контейнер packagesGrid не найден');
        return;
    }

    if (typeof TRAVEL_PACKAGES === 'undefined') {
        console.error('❌ TRAVEL_PACKAGES не загружены');
        console.error('Попробуем загрузить через 100ms...');
        setTimeout(loadTravelPackages, 100);
        return;
    }

    if (!TRAVEL_PACKAGES || !Array.isArray(TRAVEL_PACKAGES)) {
        console.error('❌ TRAVEL_PACKAGES не является массивом:', TRAVEL_PACKAGES);
        return;
    }

    console.log(`✅ Найдено ${TRAVEL_PACKAGES.length} пакетов`);

    packagesGrid.innerHTML = TRAVEL_PACKAGES.map(pkg => `
        <div class="package-card" onclick="showPackageModal('${pkg.id}')">
            <div class="package-image" style="background-image: url('${pkg.image}')"></div>
            <div class="package-content">
                <h3 class="package-name">${pkg.name}</h3>
                <div class="package-duration">${pkg.duration}</div>
                <div class="package-cities">
                    ${pkg.cities.slice(0, 3).map(city => `<span class="city-tag">${city}</span>`).join('')}
                    ${pkg.cities.length > 3 ? `<span class="city-tag">+${pkg.cities.length - 3}</span>` : ''}
                </div>
                <p class="package-description">${pkg.description}</p>
                <div class="package-footer">
                    <div class="package-price">
                        ${pkg.oldPrice ? `<span class="old-price">${pkg.oldPrice.toLocaleString()} ₽</span>` : ''}
                        <span class="current-price">${pkg.price.toLocaleString()} ₽</span>
                    </div>
                    <button class="package-btn">Подробнее</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Получить партнеров из городов пакета
function getPartnersForPackage(pkg) {
    const allPartners = [];

    // Проходим по всем городам пакета
    pkg.cities.forEach(cityName => {
        // Ищем регион с таким городом
        Object.values(RUSSIA_REGIONS_DATA).forEach(region => {
            if (region.name === cityName || region.city === cityName) {
                if (region.partners && region.partners.length > 0) {
                    region.partners.forEach(partner => {
                        allPartners.push({
                            ...partner,
                            city: cityName
                        });
                    });
                }
            }
        });
    });

    return allPartners;
}

// Показ модального окна с деталями пакета
function showPackageModal(packageId) {
    const pkg = TRAVEL_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    // Получаем партнеров из городов пакета
    const partners = getPartnersForPackage(pkg);

    const modal = document.createElement('div');
    modal.className = 'package-modal';
    modal.id = 'packageModal';

    modal.innerHTML = `
        <div class="package-modal-content">
            <button class="package-modal-close" onclick="closePackageModal()">✕</button>

            <div class="package-modal-header">
                <div class="package-modal-image" style="background-image: url('${pkg.image}')"></div>
                <div class="package-modal-info">
                    <h2 class="package-modal-title">${pkg.name}</h2>
                    <div class="package-modal-duration">${pkg.duration}</div>
                    <div class="package-modal-price">
                        ${pkg.oldPrice ? `<span class="modal-old-price">${pkg.oldPrice.toLocaleString()} ₽</span>` : ''}
                        <span class="modal-current-price">${pkg.price.toLocaleString()} ₽</span>
                    </div>
                    <div class="package-validity-info">
                        <span class="validity-icon">⏱️</span>
                        <span class="validity-text">Срок действия: 7 дней после покупки</span>
                    </div>
                </div>
            </div>

            <div class="package-modal-body">
                <div class="package-section">
                    <h3 class="package-section-title">Описание</h3>
                    <p class="package-section-text">${pkg.description}</p>
                </div>

                <div class="package-section">
                    <h3 class="package-section-title">Города в маршруте</h3>
                    <div class="package-cities-list">
                        ${pkg.cities.map(city => `<span class="package-city-item">${city}</span>`).join('')}
                    </div>
                </div>

                ${partners.length > 0 ? `
                <div class="package-section">
                    <h3 class="package-section-title">🍽️ Партнеры со скидками (${partners.length})</h3>
                    <div class="package-partners-grid">
                        ${partners.map(partner => `
                            <div class="package-partner-card">
                                <div class="package-partner-header">
                                    <span class="package-partner-emoji">${partner.emoji || '🏪'}</span>
                                    <div class="package-partner-info">
                                        <div class="package-partner-name">${partner.name}</div>
                                        <div class="package-partner-city">${partner.city}</div>
                                    </div>
                                    ${partner.rating ? `<div class="package-partner-rating">⭐ ${partner.rating}</div>` : ''}
                                </div>
                                <div class="package-partner-type">${partner.type}</div>
                                <div class="package-partner-description">${partner.description}</div>
                                ${partner.specialOffer ? `
                                    <div class="package-partner-offer">
                                        <span class="offer-icon">🎁</span>
                                        ${partner.specialOffer}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="package-section package-quests-section">
                    <h3 class="package-section-title">🎯 Выполните задания и получите скидку!</h3>
                    <div class="package-quests-grid">
                        <div class="package-quest-card" data-quest="favorites">
                            <div class="quest-icon">❤️</div>
                            <div class="quest-info">
                                <div class="quest-title">Добавьте 3 города в избранное</div>
                                <div class="quest-reward">Скидка 5%</div>
                            </div>
                            <div class="quest-status" id="quest-favorites-${pkg.id}">
                                <span class="quest-progress">0/3</span>
                            </div>
                        </div>

                        <div class="package-quest-card" data-quest="views">
                            <div class="quest-icon">👀</div>
                            <div class="quest-info">
                                <div class="quest-title">Посмотрите 5 достопримечательностей</div>
                                <div class="quest-reward">Скидка 3%</div>
                            </div>
                            <div class="quest-status" id="quest-views-${pkg.id}">
                                <span class="quest-progress">0/5</span>
                            </div>
                        </div>

                        <div class="package-quest-card" data-quest="share">
                            <div class="quest-icon">📤</div>
                            <div class="quest-info">
                                <div class="quest-title">Поделитесь пакетом с друзьями</div>
                                <div class="quest-reward">Скидка 2%</div>
                            </div>
                            <button class="quest-action-btn" onclick="sharePackage('${pkg.id}')">
                                Поделиться
                            </button>
                        </div>

                        <div class="package-quest-card" data-quest="review">
                            <div class="quest-icon">⭐</div>
                            <div class="quest-info">
                                <div class="quest-title">Оставьте отзыв о сервисе</div>
                                <div class="quest-reward">Бонус 500 ₽</div>
                            </div>
                            <button class="quest-action-btn" onclick="leaveReview('${pkg.id}')">
                                Написать отзыв
                            </button>
                        </div>
                    </div>
                    <div class="total-discount">
                        💰 Ваша итоговая скидка: <span id="total-discount-${pkg.id}">0%</span>
                    </div>
                </div>

                <div class="package-modal-footer">
                    <button class="package-book-btn" onclick="bookPackage('${pkg.id}')">
                        <span id="book-btn-text-${pkg.id}">Купить пакет за ${pkg.price.toLocaleString()} ₽</span>
                    </button>
                    <div class="package-footer-note">Действует 7 дней после покупки</div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    // Закрытие по клику вне модалки
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePackageModal();
        }
    });
}

// Закрытие модального окна
function closePackageModal() {
    const modal = document.getElementById('packageModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Переключение отображения деталей маршрута
function toggleRoute(routeId, packageId) {
    const routeDetails = document.getElementById(`route-${packageId}-${routeId}`);
    const toggle = event.currentTarget.querySelector('.package-route-toggle');

    if (routeDetails.style.display === 'none') {
        routeDetails.style.display = 'block';
        toggle.textContent = '▲';
    } else {
        routeDetails.style.display = 'none';
        toggle.textContent = '▼';
    }
}

// Бронирование пакета
function bookPackage(packageId) {
    const pkg = TRAVEL_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    // Сохраняем купленный пакет в localStorage
    const purchasedPackages = JSON.parse(localStorage.getItem('purchasedPackages') || '[]');

    // Проверяем, не куплен ли уже этот пакет
    const existingPackage = purchasedPackages.find(p => p.id === packageId);
    if (existingPackage) {
        showNotification(`Пакет "${pkg.name}" уже активен до ${new Date(existingPackage.expiresAt).toLocaleDateString('ru-RU')}`);
        return;
    }

    // Добавляем новый пакет со сроком действия 7 дней
    const purchaseDate = new Date();
    const expiresAt = new Date(purchaseDate);
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Получаем всех партнеров из городов пакета
    const partners = getPartnersForPackage(pkg);

    const purchasedPackage = {
        id: pkg.id,
        name: pkg.name,
        purchaseDate: purchaseDate.toISOString(),
        expiresAt: expiresAt.toISOString(),
        cities: pkg.cities,
        price: pkg.price,
        partners: partners  // 🔥 СОХРАНЯЕМ ПАРТНЕРОВ ВМЕСТЕ С ПАКЕТОМ!
    };

    purchasedPackages.push(purchasedPackage);
    localStorage.setItem('purchasedPackages', JSON.stringify(purchasedPackages));

    // 🌍 Автоматически увеличиваем счетчик путешествий в профиле
    try {
        const profileData = JSON.parse(sessionStorage.getItem('matryoshka_profile') || '{}');
        profileData.travels = (profileData.travels || 0) + 1;
        sessionStorage.setItem('matryoshka_profile', JSON.stringify(profileData));
        console.log('🌍 Счетчик путешествий увеличен:', profileData.travels);
    } catch (e) {
        console.error('Ошибка обновления счетчика путешествий:', e);
    }

    console.log('💾 Пакет сохранен в localStorage:', purchasedPackage);
    console.log('💾 Всего пакетов в localStorage:', purchasedPackages.length);

    // Показываем уведомление
    showNotification(`✅ Пакет "${pkg.name}" успешно куплен! Действителен до ${expiresAt.toLocaleDateString('ru-RU')}`);
    closePackageModal();

    // 🔥 ОБНОВЛЯЕМ КОРЗИНУ И АВТОМАТИЧЕСКИ ОТКРЫВАЕМ ЕЕ
    console.log('🔍 window.matryoshkaCart существует?', !!window.matryoshkaCart);
    console.log('🔍 showCart функция существует?', typeof showCart);

    if (window.matryoshkaCart) {
        console.log('🔄 Обновляю корзину...');
        window.matryoshkaCart.refresh();
        // Автоматически открываем корзину после покупки
        if (typeof showCart === 'function') {
            showCart();
            console.log('✅ Корзина обновлена и открыта');
        } else {
            console.error('❌ showCart не является функцией!');
        }
    } else {
        console.error('❌ window.matryoshkaCart не найден!');
    }

    // Обновляем профиль если он открыт
    if (window.matryoshkaProfile && document.getElementById('profileSection').style.display !== 'none') {
        window.matryoshkaProfile.loadProfileData();
    }

    // 🎯 ДОБАВЛЯЕМ РЕГИОНЫ ИЗ ПАКЕТА В ОПЛАЧЕННЫЕ И ГЕНЕРИРУЕМ ЗАДАНИЯ
    console.log('🎯 Добавляем регионы из пакета в оплаченные...');

    // Инициализируем paidRegions если нужно
    if (typeof window.paidRegions === 'undefined') {
        window.paidRegions = [];
        const saved = sessionStorage.getItem('paidRegions');
        if (saved) {
            try {
                window.paidRegions = JSON.parse(saved);
            } catch (e) {
                window.paidRegions = [];
            }
        }
    }

    // Для каждого города в пакете находим соответствующий регион
    let addedRegions = 0;
    pkg.cities.forEach(cityName => {
        // Ищем регион с таким названием
        const regionEntry = Object.entries(window.RUSSIA_REGIONS_DATA || {}).find(([key, region]) => {
            return region.name === cityName || region.city === cityName;
        });

        if (regionEntry) {
            const [regionId, regionData] = regionEntry;

            // Проверяем, не добавлен ли уже этот регион
            const existingRegion = window.paidRegions.find(r => r.id === regionId);
            if (!existingRegion) {
                // Добавляем регион в оплаченные со сроком действия 7 дней
                const purchaseDate = new Date();
                const expiresAt = new Date(purchaseDate);
                expiresAt.setDate(expiresAt.getDate() + 7);

                const paidRegion = {
                    id: regionId,
                    purchaseDate: purchaseDate.toISOString(),
                    expiresAt: expiresAt.toISOString()
                };

                window.paidRegions.push(paidRegion);
                addedRegions++;
                console.log(`✅ Регион ${regionData.name} (${regionId}) добавлен в оплаченные`);
            } else {
                console.log(`ℹ️ Регион ${regionData.name} (${regionId}) уже оплачен`);
            }
        } else {
            console.warn(`⚠️ Не найден регион для города: ${cityName}`);
        }
    });

    // Сохраняем обновленный список в sessionStorage
    sessionStorage.setItem('paidRegions', JSON.stringify(window.paidRegions));
    console.log(`💾 Добавлено новых регионов: ${addedRegions}, всего оплаченных: ${window.paidRegions.length}`);

    // 🎯 ОБНОВЛЯЕМ ЗАДАНИЯ
    if (window.matryoshkaQuests && typeof window.matryoshkaQuests.refresh === 'function') {
        console.log('🔄 Обновляем задания...');
        window.matryoshkaQuests.refresh();
        console.log('✅ Задания обновлены после покупки пакета');
    } else {
        console.warn('⚠️ Система заданий не найдена или метод refresh отсутствует');
    }
}

// Показ уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'package-notification';
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Функции для работы с заданиями пакетов
function sharePackage(packageId) {
    const pkg = TRAVEL_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    // Создаем текст для шэринга
    const shareText = `Посмотрите этот замечательный тур: ${pkg.name}! ${pkg.description}`;
    const shareUrl = window.location.href;

    // Если доступен Web Share API
    if (navigator.share) {
        navigator.share({
            title: pkg.name,
            text: shareText,
            url: shareUrl
        }).then(() => {
            markQuestComplete('share', packageId);
            showToast('✅ Спасибо за то, что поделились!', 3000);
        }).catch(err => console.log('Ошибка шэринга:', err));
    } else {
        // Fallback: копируем ссылку в буфер обмена
        navigator.clipboard.writeText(shareUrl).then(() => {
            markQuestComplete('share', packageId);
            showToast('📋 Ссылка скопирована в буфер обмена!', 3000);
        });
    }
}

function leaveReview(packageId) {
    const review = prompt('Расскажите, что вам нравится в нашем сервисе:');
    if (review && review.trim().length > 10) {
        markQuestComplete('review', packageId);
        showToast('⭐ Спасибо за отзыв! Вы получили бонус 500 ₽', 4000);
    } else if (review !== null) {
        showToast('❌ Отзыв слишком короткий (минимум 10 символов)', 3000);
    }
}

function markQuestComplete(questType, packageId) {
    const questData = JSON.parse(localStorage.getItem('packageQuests') || '{}');
    if (!questData[packageId]) {
        questData[packageId] = {};
    }
    questData[packageId][questType] = true;
    localStorage.setItem('packageQuests', JSON.stringify(questData));

    updateQuestDiscounts(packageId);
}

function updateQuestDiscounts(packageId) {
    const pkg = TRAVEL_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    const questData = JSON.parse(localStorage.getItem('packageQuests') || '{}');
    const packageQuests = questData[packageId] || {};

    let totalDiscount = 0;
    let bonusAmount = 0;

    // Проверяем выполненные задания
    if (packageQuests.favorites) totalDiscount += 5;
    if (packageQuests.views) totalDiscount += 3;
    if (packageQuests.share) totalDiscount += 2;
    if (packageQuests.review) bonusAmount += 500;

    // Обновляем отображение скидки
    const totalDiscountEl = document.getElementById(`total-discount-${packageId}`);
    if (totalDiscountEl) {
        totalDiscountEl.textContent = `${totalDiscount}%` + (bonusAmount > 0 ? ` + ${bonusAmount} ₽` : '');
    }

    // Пересчитываем цену
    const finalPrice = Math.round(pkg.price * (1 - totalDiscount / 100) - bonusAmount);
    const bookBtnText = document.getElementById(`book-btn-text-${packageId}`);
    if (bookBtnText) {
        if (totalDiscount > 0 || bonusAmount > 0) {
            bookBtnText.innerHTML = `Купить пакет за ${finalPrice.toLocaleString()} ₽ <small style="text-decoration: line-through; opacity: 0.7;">${pkg.price.toLocaleString()} ₽</small>`;
        } else {
            bookBtnText.textContent = `Купить пакет за ${pkg.price.toLocaleString()} ₽`;
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadTravelPackages();
});
