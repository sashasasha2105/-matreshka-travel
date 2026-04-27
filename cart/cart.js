/**
 * Модуль корзины - Мои покупки
 * Отображает все купленные пакеты, регионы и их партнеров
 */

class MatryoshkaCart {
    constructor() {
        this.purchasedPackages = [];
        this.paidRegions = [];
    }

    /**
     * Инициализация корзины
     */
    initCart() {
        console.log('Корзина Матрешка инициализирована');
        this.loadCartData();
        this.updateCartBadge();
    }

    /**
     * Загрузка данных корзины
     */
    loadCartData() {
        console.log('loadCartData() вызван');

        const cartContent = document.querySelector('.cart-content');

        if (!cartContent) {
            console.warn('Контейнер корзины не найден');
            return;
        }

        // Загружаем купленные пакеты
        this.loadPurchasedPackages();

        // Загружаем оплаченные регионы
        this.loadPaidRegions();

        cartContent.innerHTML = `
            <div class="cart-header" data-animate="fadeInUp">
                <h2 class="cart-title">Мои покупки</h2>
                <p class="cart-subtitle">Активные пакеты и купоны</p>
                ${this.purchasedPackages.length > 0 || this.paidRegions.length > 0 ? `
                    <button class="cart-clear-btn" onclick="matryoshkaCart.clearAll()" style="margin-top: 10px; padding: 8px 16px; background: #ff4444; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Очистить корзину
                    </button>
                ` : ''}
            </div>

            ${this.generatePackagesSection()}
            ${this.generateCouponsSection()}

            ${this.purchasedPackages.length === 0 && this.paidRegions.length === 0 ? `
                <div class="cart-empty">
                    <div class="cart-empty-text">Корзина пуста</div>
                    <div class="cart-empty-subtext">Купите пакеты или регионы для получения купонов</div>
                </div>
            ` : ''}
        `;

        // Запускаем анимации
        this.animateElements();
    }

    /**
     * Загрузка купленных пакетов
     */
    loadPurchasedPackages() {
        console.log('loadPurchasedPackages() ВЫЗВАНА');
        try {
            const saved = localStorage.getItem('purchasedPackages');

            if (saved) {
                this.purchasedPackages = JSON.parse(saved);
                console.log('📦 Загружено пакетов:', this.purchasedPackages.length);

                // Фильтруем истекшие
                const now = new Date();
                this.purchasedPackages = this.purchasedPackages.filter(pkg => {
                    const isValid = new Date(pkg.expiresAt) > now;
                    if (!isValid) {
                        console.log(`⏰ Пакет "${pkg.name}" истек`);
                    }
                    return isValid;
                });

                console.log('Активных пакетов после фильтрации:', this.purchasedPackages.length);

                // Сохраняем обновленный список
                localStorage.setItem('purchasedPackages', JSON.stringify(this.purchasedPackages));
            } else {
                console.log('📦 localStorage пуст, пакетов нет');
            }
        } catch (e) {
            console.error('Ошибка загрузки пакетов:', e);
            this.purchasedPackages = [];
        }
    }

    /**
     * Загрузка оплаченных регионов
     */
    loadPaidRegions() {
        try {
            const saved = localStorage.getItem('paidRegions');
            if (saved) {
                this.paidRegions = JSON.parse(saved);

                // Фильтруем истекшие
                const now = new Date();
                this.paidRegions = this.paidRegions.filter(region => {
                    if (typeof region === 'object' && region.expiresAt) {
                        return new Date(region.expiresAt) > now;
                    }
                    return true; // Старый формат без даты
                });

                localStorage.setItem('paidRegions', JSON.stringify(this.paidRegions));
            }
        } catch (e) {
            console.error('Ошибка загрузки регионов:', e);
            this.paidRegions = [];
        }
    }

    /**
     * Генерация секции пакетов с партнерами
     */
    generatePackagesSection() {
        console.log('🎨 generatePackagesSection вызван, пакетов:', this.purchasedPackages.length);

        if (this.purchasedPackages.length === 0) {
            console.log('⚠️ Секция пакетов не генерируется - список пуст');
            return '';
        }

        const now = new Date();

        const getDaysLeft = (expiresAt) => {
            const expires = new Date(expiresAt);
            const diffTime = expires - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        };

        // Собираем всех партнеров из купленных пакетов
        // Используем Map для удаления дубликатов по имени партнера
        const partnersMap = new Map();

        this.purchasedPackages.forEach(pkg => {
            // 🔥 СНАЧАЛА ПРОВЕРЯЕМ, СОХРАНЕНЫ ЛИ ПАРТНЕРЫ С ПАКЕТОМ
            if (pkg.partners && Array.isArray(pkg.partners) && pkg.partners.length > 0) {
                // Используем сохраненных партнеров
                pkg.partners.forEach(partner => {
                    const partnerKey = partner.name; // Уникальный ключ - имя партнера

                    // Добавляем только если партнера еще нет в Map
                    if (!partnersMap.has(partnerKey)) {
                        partnersMap.set(partnerKey, {
                            ...partner,
                            packageName: pkg.name,
                            packageId: pkg.id,
                            expiresAt: pkg.expiresAt
                        });
                    } else {
                        // Если партнер уже есть, можем обновить пакет если нужно
                        const existing = partnersMap.get(partnerKey);
                        // Сохраняем тот пакет, который истекает позже
                        if (new Date(pkg.expiresAt) > new Date(existing.expiresAt)) {
                            partnersMap.set(partnerKey, {
                                ...partner,
                                packageName: pkg.name,
                                packageId: pkg.id,
                                expiresAt: pkg.expiresAt
                            });
                        }
                    }
                });
                console.log(`✅ Загружены партнеры из пакета "${pkg.name}": ${pkg.partners.length} шт.`);
            } else {
                // Fallback: ищем партнеров по городам (для старых данных)
                console.warn(`⚠️ Пакет "${pkg.name}" не содержит партнеров, ищем по городам...`);
                if (pkg.cities && Array.isArray(pkg.cities)) {
                    pkg.cities.forEach(cityName => {
                        // Ищем регион с таким городом
                        Object.values(window.RUSSIA_REGIONS_DATA || {}).forEach(region => {
                            if (region.name === cityName || region.city === cityName) {
                                if (region.partners && region.partners.length > 0) {
                                    region.partners.forEach(partner => {
                                        const partnerKey = partner.name;

                                        if (!partnersMap.has(partnerKey)) {
                                            partnersMap.set(partnerKey, {
                                                ...partner,
                                                cityName: partner.city || cityName,
                                                packageName: pkg.name,
                                                packageId: pkg.id,
                                                expiresAt: pkg.expiresAt
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    });
                }
            }
        });

        // Конвертируем Map обратно в массив
        const allPackagePartners = Array.from(partnersMap.values());

        // 🎯 СОБИРАЕМ ЗАДАНИЯ ИЗ КУПЛЕННЫХ ПАКЕТОВ
        let allPackageQuests = [];
        if (window.matryoshkaQuests && window.matryoshkaQuests.quests) {
            this.purchasedPackages.forEach(pkg => {
                // Фильтруем задания, которые относятся к регионам из этого пакета
                pkg.cities.forEach(cityName => {
                    // Находим задания для этого города
                    const cityQuests = window.matryoshkaQuests.quests.filter(quest => {
                        return quest.regionName === cityName;
                    });

                    cityQuests.forEach(quest => {
                        allPackageQuests.push({
                            ...quest,
                            packageName: pkg.name,
                            packageId: pkg.id,
                            packageExpiresAt: pkg.expiresAt
                        });
                    });
                });
            });
            console.log(`✅ Загружено заданий для пакетов: ${allPackageQuests.length} шт.`);
        }

        return `
            <div class="packages-section" data-animate="fadeInUp" data-delay="200">
                <div class="packages-header">
                    <h3 class="packages-title">
                        <span>🎒</span> Активные пакеты
                    </h3>
                    <p class="packages-subtitle">${this.purchasedPackages.length} активных</p>
                </div>
                <div class="packages-grid-profile">
                    ${this.purchasedPackages.map(pkg => {
                        const daysLeft = getDaysLeft(pkg.expiresAt);
                        const expiresDate = new Date(pkg.expiresAt).toLocaleDateString('ru-RU');
                        const isExpiringSoon = daysLeft <= 2;

                        return `
                            <div class="profile-package-card ${isExpiringSoon ? 'expiring-soon' : ''}">
                                <div class="profile-package-header">
                                    <div class="profile-package-name">${pkg.name}</div>
                                    <div class="profile-package-badge ${isExpiringSoon ? 'badge-warning' : 'badge-active'}">
                                        ${isExpiringSoon ? '⚠️' : '✓'} ${daysLeft === 1 ? 'Истекает сегодня' : `${daysLeft} дн.`}
                                    </div>
                                </div>
                                <div class="profile-package-cities">
                                    📍 ${pkg.cities.join(', ')}
                                </div>
                                <div class="profile-package-footer">
                                    <div class="profile-package-expiry">
                                        <span class="expiry-icon">⏱️</span>
                                        <span>До ${expiresDate}</span>
                                    </div>
                                    <div class="profile-package-price">${pkg.price.toLocaleString()} ₽</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                ${allPackagePartners.length > 0 ? `
                    <div class="package-partners-section">
                        <h3 class="partners-section-title">
                            <span>🍽️</span> Партнеры из пакетов (${allPackagePartners.length})
                        </h3>
                        <div class="coupons-grid">
                            ${allPackagePartners.map((partner, index) => {
                                const daysLeft = getDaysLeft(partner.expiresAt);
                                const expiresDate = new Date(partner.expiresAt).toLocaleDateString('ru-RU');
                                const isExpiringSoon = daysLeft <= 2;

                                return `
                                    <div class="coupon-card ${isExpiringSoon ? 'expiring-soon' : ''}" data-partner-index="${index}">
                                        <div class="coupon-emoji">${partner.emoji}</div>
                                        <div class="coupon-info">
                                            <div class="coupon-name">${partner.name}</div>
                                            <div class="coupon-type">${partner.type}</div>
                                            <div class="coupon-region">📍 ${partner.cityName}</div>
                                            <div class="coupon-package">🎒 ${partner.packageName}</div>
                                            <div class="coupon-expiry ${isExpiringSoon ? 'expiring' : ''}">
                                                <span class="expiry-icon">⏱️</span>
                                                <span>До ${expiresDate} (${daysLeft} дн.)</span>
                                            </div>
                                            <div class="coupon-rating">
                                                <span>⭐</span>
                                                <span>${partner.rating}</span>
                                            </div>
                                            ${partner.specialOffer ? `<div class="coupon-offer">🎁 ${partner.specialOffer}</div>` : ''}
                                        </div>
                                        <button class="coupon-qr-btn" onclick="matryoshkaCart.showPartnerQR('${partner.name.replace(/'/g, "\\'")}', '${partner.emoji}')">
                                            <span class="qr-icon">📱</span>
                                            <span class="qr-text">Показать QR</span>
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

                ${allPackageQuests.length > 0 ? `
                    <div class="package-quests-section">
                        <h3 class="partners-section-title">
                            <span>🎯</span> Задания из пакетов (${allPackageQuests.length})
                        </h3>
                        <div class="coupons-grid">
                            ${allPackageQuests.map((quest, index) => {
                                const daysLeft = getDaysLeft(quest.packageExpiresAt);
                                const expiresDate = new Date(quest.packageExpiresAt).toLocaleDateString('ru-RU');
                                const isExpiringSoon = daysLeft <= 2;
                                const isCompleted = quest.status === 'completed';

                                return `
                                    <div class="coupon-card quest-card-cart ${isExpiringSoon ? 'expiring-soon' : ''} ${isCompleted ? 'completed' : ''}" data-quest-index="${index}">
                                        <div class="coupon-emoji">${isCompleted ? '✅' : '🎯'}</div>
                                        <div class="coupon-info">
                                            <div class="coupon-name">${quest.title}</div>
                                            <div class="coupon-type">${quest.description}</div>
                                            <div class="coupon-region">📍 ${quest.regionName}</div>
                                            <div class="coupon-package">🎒 ${quest.packageName}</div>
                                            <div class="coupon-expiry ${isExpiringSoon ? 'expiring' : ''}">
                                                <span class="expiry-icon">⏱️</span>
                                                <span>До ${expiresDate} (${daysLeft} дн.)</span>
                                            </div>
                                            ${quest.rewardText ? `<div class="coupon-offer">🎁 ${quest.rewardText}</div>` : ''}
                                            ${isCompleted && quest.completedDate ? `
                                                <div class="quest-completed-date" style="margin-top: 8px; font-size: 12px; color: #10b981;">
                                                    ✅ Выполнено: ${new Date(quest.completedDate).toLocaleDateString('ru-RU')}
                                                </div>
                                            ` : ''}
                                        </div>
                                        ${isCompleted && quest.qrCode ? `
                                            <button class="coupon-qr-btn" onclick="matryoshkaCart.showQuestQR('${quest.id}')">
                                                <span class="qr-icon">📱</span>
                                                <span class="qr-text">Показать QR</span>
                                            </button>
                                        ` : !isCompleted ? `
                                            <button class="coupon-qr-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" onclick="showQuests()">
                                                <span class="qr-icon">🎯</span>
                                                <span class="qr-text">Выполнить</span>
                                            </button>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Генерация секции купонов из регионов
     */
    generateCouponsSection() {
        if (this.paidRegions.length === 0) {
            return '';
        }

        const now = new Date();

        const getDaysLeft = (expiresAt) => {
            const expires = new Date(expiresAt);
            const diffTime = expires - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        };

        // Собираем партнеров из оплаченных регионов
        let allRegionPartners = [];
        this.paidRegions.forEach(region => {
            const regionId = typeof region === 'string' ? region : region.id;
            const regionExpiry = typeof region === 'object' ? region.expiresAt : null;

            const regionData = window.RUSSIA_REGIONS_DATA?.[regionId];
            if (regionData && regionData.partners) {
                regionData.partners.forEach(partner => {
                    allRegionPartners.push({
                        ...partner,
                        regionName: regionData.name,
                        regionId: regionId,
                        expiresAt: regionExpiry
                    });
                });
            }
        });

        // 🎯 СОБИРАЕМ ЗАДАНИЯ ИЗ КУПЛЕННЫХ РЕГИОНОВ
        let allRegionQuests = [];
        if (window.matryoshkaQuests && window.matryoshkaQuests.quests) {
            this.paidRegions.forEach(region => {
                const regionId = typeof region === 'string' ? region : region.id;
                const regionExpiry = typeof region === 'object' ? region.expiresAt : null;

                const regionData = window.RUSSIA_REGIONS_DATA?.[regionId];
                if (regionData) {
                    // Находим задания для этого региона
                    const regionQuests = window.matryoshkaQuests.quests.filter(quest => {
                        return quest.regionName === regionData.name;
                    });

                    regionQuests.forEach(quest => {
                        allRegionQuests.push({
                            ...quest,
                            regionExpiresAt: regionExpiry
                        });
                    });
                }
            });
            console.log(`✅ Загружено заданий для регионов: ${allRegionQuests.length} шт.`);
        }

        if (allRegionPartners.length === 0 && allRegionQuests.length === 0) {
            return '';
        }

        return `
            <div class="coupons-section" data-animate="fadeInUp" data-delay="400">
                ${allRegionPartners.length > 0 ? `
                    <div class="coupons-header">
                        <h3 class="coupons-title">
                            <span>🎫</span> Купоны из регионов
                        </h3>
                        <p class="coupons-subtitle">${allRegionPartners.length} доступных</p>
                    </div>
                    <div class="coupons-grid">
                        ${allRegionPartners.map((partner, index) => {
                            const daysLeft = partner.expiresAt ? getDaysLeft(partner.expiresAt) : null;
                            const expiresDate = partner.expiresAt ? new Date(partner.expiresAt).toLocaleDateString('ru-RU') : null;
                            const isExpiringSoon = daysLeft && daysLeft <= 2;

                            return `
                                <div class="coupon-card ${isExpiringSoon ? 'expiring-soon' : ''}" data-partner-index="${index}">
                                    <div class="coupon-emoji">${partner.emoji}</div>
                                    <div class="coupon-info">
                                        <div class="coupon-name">${partner.name}</div>
                                        <div class="coupon-type">${partner.type}</div>
                                        <div class="coupon-region">📍 ${partner.regionName}</div>
                                        ${partner.expiresAt ? `
                                            <div class="coupon-expiry ${isExpiringSoon ? 'expiring' : ''}">
                                                <span class="expiry-icon">⏱️</span>
                                                <span>До ${expiresDate} (${daysLeft} дн.)</span>
                                            </div>
                                        ` : ''}
                                        <div class="coupon-rating">
                                            <span>⭐</span>
                                            <span>${partner.rating}</span>
                                        </div>
                                        ${partner.specialOffer ? `<div class="coupon-offer">🎁 ${partner.specialOffer}</div>` : ''}
                                    </div>
                                    <button class="coupon-qr-btn" onclick="matryoshkaCart.showPartnerQR('${partner.name.replace(/'/g, "\\'")}', '${partner.emoji}')">
                                        <span class="qr-icon">📱</span>
                                        <span class="qr-text">Показать QR</span>
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}

                ${allRegionQuests.length > 0 ? `
                    <div class="region-quests-section" style="margin-top: ${allRegionPartners.length > 0 ? '30px' : '0'};">
                        <h3 class="coupons-title">
                            <span>🎯</span> Задания из регионов
                        </h3>
                        <p class="coupons-subtitle">${allRegionQuests.length} доступных</p>
                        <div class="coupons-grid">
                            ${allRegionQuests.map((quest, index) => {
                                const daysLeft = quest.regionExpiresAt ? getDaysLeft(quest.regionExpiresAt) : null;
                                const expiresDate = quest.regionExpiresAt ? new Date(quest.regionExpiresAt).toLocaleDateString('ru-RU') : null;
                                const isExpiringSoon = daysLeft && daysLeft <= 2;
                                const isCompleted = quest.status === 'completed';

                                return `
                                    <div class="coupon-card quest-card-cart ${isExpiringSoon ? 'expiring-soon' : ''} ${isCompleted ? 'completed' : ''}" data-quest-index="${index}">
                                        <div class="coupon-emoji">${isCompleted ? '✅' : '🎯'}</div>
                                        <div class="coupon-info">
                                            <div class="coupon-name">${quest.title}</div>
                                            <div class="coupon-type">${quest.description}</div>
                                            <div class="coupon-region">📍 ${quest.regionName}</div>
                                            ${quest.regionExpiresAt ? `
                                                <div class="coupon-expiry ${isExpiringSoon ? 'expiring' : ''}">
                                                    <span class="expiry-icon">⏱️</span>
                                                    <span>До ${expiresDate} (${daysLeft} дн.)</span>
                                                </div>
                                            ` : ''}
                                            ${quest.rewardText ? `<div class="coupon-offer">🎁 ${quest.rewardText}</div>` : ''}
                                            ${isCompleted && quest.completedDate ? `
                                                <div class="quest-completed-date" style="margin-top: 8px; font-size: 12px; color: #10b981;">
                                                    ✅ Выполнено: ${new Date(quest.completedDate).toLocaleDateString('ru-RU')}
                                                </div>
                                            ` : ''}
                                        </div>
                                        ${isCompleted && quest.qrCode ? `
                                            <button class="coupon-qr-btn" onclick="matryoshkaCart.showQuestQR('${quest.id}')">
                                                <span class="qr-icon">📱</span>
                                                <span class="qr-text">Показать QR</span>
                                            </button>
                                        ` : !isCompleted ? `
                                            <button class="coupon-qr-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" onclick="showQuests()">
                                                <span class="qr-icon">🎯</span>
                                                <span class="qr-text">Выполнить</span>
                                            </button>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Показать QR-код для партнера
     */
    showPartnerQR(partnerName, partnerEmoji) {
        console.log('🔲 Показываем QR для партнера из корзины:', partnerName);

        if (window.matryoshkaQR && typeof window.matryoshkaQR.showQRCode === 'function') {
            const partnerData = {
                name: partnerName,
                emoji: partnerEmoji,
                type: 'Партнер',
                description: 'Покажите этот QR-код сотруднику для получения скидки',
                rating: '4.5'
            };

            window.matryoshkaQR.showQRCode(partnerData);
        } else {
            console.error('❌ MatryoshkaQR не загружен');
        }
    }

    /**
     * Показать QR-код из задания
     */
    showQuestQR(questId) {
        console.log('🔲 Показываем QR для задания из корзины:', questId);

        if (window.matryoshkaQuests && typeof window.matryoshkaQuests.showQRFullscreen === 'function') {
            window.matryoshkaQuests.showQRFullscreen(questId);
        } else {
            console.error('❌ MatryoshkaQuests не загружен');
        }
    }

    /**
     * Обновление счетчика корзины
     */
    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;

        const totalItems = this.purchasedPackages.length + this.paidRegions.length;

        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * Анимация элементов
     */
    animateElements() {
        const elements = document.querySelectorAll('[data-animate]');

        elements.forEach((element, index) => {
            const delay = parseInt(element.dataset.delay) || index * 100;

            setTimeout(() => {
                element.style.animation = `fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
            }, delay);
        });
    }

    /**
     * Обновление корзины
     */
    refresh() {
        console.log('🔄 refresh() вызван');
        this.loadCartData();
        this.updateCartBadge();
    }

    /**
     * Очистка всей корзины
     */
    clearAll() {
        if (confirm('Вы уверены, что хотите очистить всю корзину? Это удалит все купленные пакеты и регионы.')) {
            localStorage.removeItem('purchasedPackages');
            localStorage.removeItem('paidRegions');
            this.purchasedPackages = [];
            this.paidRegions = [];
            this.refresh();
            console.log('🗑️ Корзина очищена');
        }
    }
}

// 🔥 ГЛОБАЛЬНАЯ инициализация - доступна как window.matryoshkaCart
window.matryoshkaCart = null;

function initCart() {
    console.log('🔧 initCart() вызвана');
    window.matryoshkaCart = new MatryoshkaCart();
    window.matryoshkaCart.initCart();
    console.log('✅ window.matryoshkaCart инициализирована:', !!window.matryoshkaCart);
}

// Автоинициализация при загрузке DOM
if (document.readyState === 'loading') {
    console.log('⏳ DOM еще загружается, ждем DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    console.log('✅ DOM уже загружен, инициализируем сразу');
    initCart();
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MatryoshkaCart,
        initCart
    };
}
