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
        console.log('🛒 Корзина Матрешка инициализирована');
        this.loadCartData();
        this.updateCartBadge();
    }

    /**
     * Загрузка данных корзины
     */
    loadCartData() {
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
                <h2 class="cart-title">
                    <span>🛒</span> Мои покупки
                </h2>
                <p class="cart-subtitle">Активные пакеты и купоны</p>
                ${this.purchasedPackages.length > 0 || this.paidRegions.length > 0 ? `
                    <button class="cart-clear-btn" onclick="matryoshkaCart.clearAll()" style="margin-top: 10px; padding: 8px 16px; background: #ff4444; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🗑️ Очистить корзину
                    </button>
                ` : ''}
            </div>

            ${this.generatePackagesSection()}
            ${this.generateCouponsSection()}

            ${this.purchasedPackages.length === 0 && this.paidRegions.length === 0 ? `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛍️</div>
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
        console.log('🔄 loadPurchasedPackages() ВЫЗВАНА');
        try {
            const saved = localStorage.getItem('purchasedPackages');
            console.log('🔍 localStorage.getItem результат:', saved);
            console.log('🔍 Тип данных:', typeof saved);
            console.log('🔍 Длина строки:', saved?.length);

            if (saved) {
                this.purchasedPackages = JSON.parse(saved);
                console.log('📦 УСПЕШНО загружено пакетов:', this.purchasedPackages.length);
                console.log('📦 Пакеты полностью:', this.purchasedPackages);

                // ВИЗУАЛЬНОЕ уведомление
                alert(`КОРЗИНА ЗАГРУЖЕНА:\n📦 Найдено пакетов в localStorage: ${this.purchasedPackages.length}\n💾 Длина данных: ${saved.length} символов`);

                // Фильтруем истекшие
                const now = new Date();
                this.purchasedPackages = this.purchasedPackages.filter(pkg => {
                    const isValid = new Date(pkg.expiresAt) > now;
                    if (!isValid) {
                        console.log(`⏰ Пакет "${pkg.name}" истек`);
                    }
                    return isValid;
                });

                console.log('✅ Активных пакетов после фильтрации:', this.purchasedPackages.length);

                // Сохраняем обновленный список
                localStorage.setItem('purchasedPackages', JSON.stringify(this.purchasedPackages));
            } else {
                console.log('📦 localStorage пуст, пакетов нет');
                // ВИЗУАЛЬНОЕ уведомление о пустой корзине
                alert(`⚠️ КОРЗИНА ПУСТА!\n❌ localStorage НЕ содержит purchasedPackages\n🔍 Значение: ${saved}`);
            }
        } catch (e) {
            console.error('❌ Ошибка загрузки пакетов:', e);
            this.purchasedPackages = [];
        }
    }

    /**
     * Загрузка оплаченных регионов
     */
    loadPaidRegions() {
        try {
            const saved = sessionStorage.getItem('paidRegions');
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

                sessionStorage.setItem('paidRegions', JSON.stringify(this.paidRegions));
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
        let allPackagePartners = [];
        this.purchasedPackages.forEach(pkg => {
            // 🔥 СНАЧАЛА ПРОВЕРЯЕМ, СОХРАНЕНЫ ЛИ ПАРТНЕРЫ С ПАКЕТОМ
            if (pkg.partners && Array.isArray(pkg.partners) && pkg.partners.length > 0) {
                // Используем сохраненных партнеров
                pkg.partners.forEach(partner => {
                    allPackagePartners.push({
                        ...partner,
                        packageName: pkg.name,
                        packageId: pkg.id,
                        expiresAt: pkg.expiresAt
                    });
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
                                        allPackagePartners.push({
                                            ...partner,
                                            cityName: partner.city || cityName,
                                            packageName: pkg.name,
                                            packageId: pkg.id,
                                            expiresAt: pkg.expiresAt
                                        });
                                    });
                                }
                            }
                        });
                    });
                }
            }
        });

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

        if (allRegionPartners.length === 0) {
            return '';
        }

        return `
            <div class="coupons-section" data-animate="fadeInUp" data-delay="400">
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
        this.loadCartData();
        this.updateCartBadge();
    }

    /**
     * Очистка всей корзины
     */
    clearAll() {
        if (confirm('Вы уверены, что хотите очистить всю корзину? Это удалит все купленные пакеты и регионы.')) {
            localStorage.removeItem('purchasedPackages');
            sessionStorage.removeItem('paidRegions');
            this.purchasedPackages = [];
            this.paidRegions = [];
            this.refresh();
            console.log('🗑️ Корзина очищена');
        }
    }
}

// Глобальная инициализация
let matryoshkaCart = null;

function initCart() {
    matryoshkaCart = new MatryoshkaCart();
    matryoshkaCart.initCart();
}

// Автоинициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MatryoshkaCart,
        initCart
    };
}
