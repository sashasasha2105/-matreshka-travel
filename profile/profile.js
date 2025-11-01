/**
 * Модуль личного кабинета Матрешка
 * Обеспечивает красивый и интерактивный профиль пользователя
 */

class MatryoshkaProfile {
    constructor() {
        this.user = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
        this.profileData = {
            travels: 0,
            cities: 0,
            reviews: 0,
            bio: 'Путешественник, исследователь России. Обожаю открывать новые места и делиться впечатлениями!',
            name: 'Путешественник'
        };
        this.travelStories = [];

        // Загружаем данные из localStorage
        this.loadFromLocalStorage();
    }

    /**
     * Загрузка данных профиля из localStorage
     */
    loadFromLocalStorage() {
        console.log('📖 Загружаем данные профиля из localStorage...');
        try {
            const savedProfile = localStorage.getItem('matryoshka_profile');
            const savedStories = localStorage.getItem('matryoshka_stories');
            const savedAvatar = localStorage.getItem('matryoshka_avatar');

            console.log('📦 Загружено из localStorage:', {
                profile: savedProfile ? 'есть' : 'нет',
                stories: savedStories ? 'есть' : 'нет',
                avatar: savedAvatar ? 'есть' : 'нет'
            });

            if (savedProfile) {
                const parsed = JSON.parse(savedProfile);
                this.profileData = { ...this.profileData, ...parsed };
            }

            if (savedStories) {
                const parsed = JSON.parse(savedStories);
                this.travelStories = parsed;
                console.log('✅ Загружено путешествий:', this.travelStories.length);
                if (this.travelStories.length > 0) {
                    console.log('🖼️ Первое путешествие:', this.travelStories[0].title);
                    console.log('🖼️ Изображения в первом путешествии:', this.travelStories[0].images?.length);
                    if (this.travelStories[0].images && this.travelStories[0].images.length > 0) {
                        console.log('🖼️ Первое изображение (первые 100 символов):', this.travelStories[0].images[0].substring(0, 100));
                    }
                }
            }

            if (savedAvatar) {
                this.user.photo_url = savedAvatar;
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки данных из localStorage:', error);
        }
    }

    /**
     * Сохранение данных профиля в localStorage
     */
    saveToLocalStorage() {
        console.log('💾 Сохраняем данные профиля в localStorage...');
        try {
            localStorage.setItem('matryoshka_profile', JSON.stringify(this.profileData));
            localStorage.setItem('matryoshka_stories', JSON.stringify(this.travelStories));
            if (this.user.photo_url) {
                localStorage.setItem('matryoshka_avatar', this.user.photo_url);
            }
            console.log('✅ Сохранено путешествий:', this.travelStories.length);
            if (this.travelStories.length > 0) {
                console.log('🖼️ Изображения в первом путешествии:', this.travelStories[0].images?.length);
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения данных в localStorage:', error);
            console.error('Возможно превышен лимит localStorage');
        }
    }

    /**
     * Инициализация профиля с анимациями
     */
    initProfile() {
        console.log('🪆 Профиль Матрешка инициализирован');
        this.loadProfileData();
        this.initAnimations();
        this.initInteractions();
    }

    /**
     * Загрузка и отображение данных профиля
     */
    loadProfileData() {
        const profileContent = document.querySelector('.profile-content');

        if (!profileContent) {
            console.warn('Контейнер профиля не найден');
            return;
        }

        // Автоматически пересчитываем счетчики при загрузке
        if (this.travelStories.length > 0) {
            this.updateTravelCounters();
        }

        profileContent.innerHTML = `
            <!-- Аватар и имя (НЕ ТРОГАЕМ) -->
            <div class="profile-header" data-animate="fadeInUp">
                <div class="profile-main-info">
                    <div class="profile-avatar-wrapper">
                        <img src="${this.user.photo_url || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="60" fill="#FFCC00"/><text x="50%" y="50%" fill="white" text-anchor="middle" dy=".3em" font-family="Arial" font-size="40">👤</text></svg>')}"
                             alt="Аватар пользователя"
                             class="profile-avatar"
                             loading="lazy">
                    </div>
                    <div class="profile-info">
                        <div class="profile-name">${this.profileData.name || this.user.first_name || 'Путешественник'}</div>
                        ${this.user.username ? `<div class="profile-username">@${this.user.username}</div>` : ''}
                    </div>
                </div>
            </div>

            <!-- Статистика - НОВЫЙ ДИЗАЙН -->
            <div class="profile-stats-modern" data-animate="fadeInUp" data-delay="200">
                ${this.generateStatsHTML()}
            </div>

            <!-- Мои путешествия - ОБНОВЛЕННЫЙ СТИЛЬ -->
            <div class="travel-gallery-section" data-animate="fadeInUp" data-delay="300">
                <div class="travel-gallery-header">
                    <h3 class="gallery-title">
                        <span>📸</span> Мои путешествия
                    </h3>
                    <button class="add-travel-btn" data-action="add-travel">
                        <span class="btn-icon">➕</span>
                    </button>
                </div>
                <div class="travel-cards" id="travelCards">
                    ${this.generateTravelCardsHTML()}
                </div>
            </div>

            <!-- Кнопка поддержки - СОВРЕМЕННЫЙ СТИЛЬ -->
            <div class="profile-actions-modern" data-animate="fadeInUp" data-delay="400">
                <button class="support-btn-modern" data-action="support">
                    <span class="support-icon">💬</span>
                    <span class="support-text">Связаться с поддержкой</span>
                    <span class="support-arrow">→</span>
                </button>
            </div>
        `;

        // Запускаем анимации появления
        this.animateElements();
    }

    /**
     * Генерация HTML для статистики - НОВЫЙ СОВРЕМЕННЫЙ СТИЛЬ
     */
    generateStatsHTML() {
        const stats = [
            { key: 'travels', value: this.profileData.travels, label: 'Путешествий', icon: '🌍', description: 'Количество ваших путешествий' }
        ];

        return stats.map(stat => `
            <div class="stat-card-modern" data-value="${stat.value}" data-key="${stat.key}">
                <div class="stat-icon-modern">${stat.icon}</div>
                <div class="stat-info-modern">
                    <div class="stat-value-modern">0</div>
                    <div class="stat-label-modern">${stat.label}</div>
                    <div class="stat-description-modern">${stat.description}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Генерация секции активных пакетов
     */
    generatePackagesSection() {
        // Загружаем купленные пакеты из localStorage
        let purchasedPackages = [];
        try {
            const saved = localStorage.getItem('purchasedPackages');
            if (saved) {
                purchasedPackages = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Ошибка загрузки purchasedPackages:', e);
        }

        // Фильтруем только активные пакеты (не истекшие)
        const now = new Date();
        const activePackages = purchasedPackages.filter(pkg => {
            const expiresAt = new Date(pkg.expiresAt);
            return expiresAt > now;
        });

        // Удаляем истекшие пакеты из localStorage
        if (activePackages.length !== purchasedPackages.length) {
            localStorage.setItem('purchasedPackages', JSON.stringify(activePackages));
        }

        if (activePackages.length === 0) {
            return ''; // Не показываем секцию, если нет активных пакетов
        }

        // Функция для вычисления оставшихся дней
        const getDaysLeft = (expiresAt) => {
            const expires = new Date(expiresAt);
            const diffTime = expires - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        };

        // Генерируем HTML для секции пакетов
        return `
            <div class="packages-section" data-animate="fadeInUp" data-delay="300">
                <div class="packages-header">
                    <h3 class="packages-title">
                        <span>🎒</span> Мои активные пакеты
                    </h3>
                    <p class="packages-subtitle">${activePackages.length} активных</p>
                </div>
                <div class="packages-grid-profile">
                    ${activePackages.map(pkg => {
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
            </div>
        `;
    }

    /**
     * Генерация HTML для карточек путешествий
     */
    generateTravelCardsHTML() {
        if (this.travelStories.length === 0) {
            return `
                <div class="no-travels">
                    <span>🗺️</span>
                    <p>Пока нет добавленных путешествий</p>
                    <small>Нажмите ➕ чтобы поделиться своим опытом</small>
                </div>
            `;
        }

        return this.travelStories.map(travel => `
            <div class="travel-card" data-travel-id="${travel.id}">
                <!-- Кнопка удаления -->
                <button class="delete-travel-btn" data-action="delete-travel" data-id="${travel.id}">
                    🗑️
                </button>

                <!-- Фотографии -->
                <div class="travel-card-images" onclick="matryoshkaProfile.openPhotoGallery(${travel.id})">
                    ${this.generatePhotoGrid(travel.images)}
                </div>

                <!-- Текст поста -->
                <div class="travel-card-content">
                    <h4 class="travel-card-title">${travel.title}</h4>
                    <p class="travel-card-text">${travel.text}</p>
                </div>

                <!-- Футер с лайками -->
                <div class="travel-card-footer">
                    <button class="like-btn ${travel.liked ? 'liked' : ''}" data-action="toggle-like" data-travel-id="${travel.id}">
                        <span class="like-icon">${travel.liked ? '❤️' : '🤍'}</span>
                        <span class="like-count">${travel.likes || 0}</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Генерация секции купонов и скидок
     */
    generateCouponsSection() {
        // Загружаем оплаченные регионы из localStorage
        let paidRegions = [];
        try {
            const saved = localStorage.getItem('paidRegions');
            if (saved) {
                paidRegions = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Ошибка загрузки paidRegions:', e);
        }

        console.log('🎫 Загружены оплаченные регионы для купонов:', paidRegions);

        if (paidRegions.length === 0) {
            return ''; // Не показываем секцию, если ничего не куплено
        }

        const now = new Date();

        // Функция для вычисления оставшихся дней
        const getDaysLeft = (expiresAt) => {
            const expires = new Date(expiresAt);
            const diffTime = expires - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        };

        // Собираем всех партнеров из оплаченных регионов
        let allPartners = [];
        paidRegions.forEach(region => {
            // Поддержка как старого формата (строка), так и нового (объект)
            const regionId = typeof region === 'string' ? region : region.id;
            const regionExpiry = typeof region === 'object' ? region.expiresAt : null;

            const regionData = window.RUSSIA_REGIONS_DATA?.[regionId];
            if (regionData && regionData.partners) {
                regionData.partners.forEach(partner => {
                    allPartners.push({
                        ...partner,
                        regionName: regionData.name,
                        regionId: regionId,
                        expiresAt: regionExpiry
                    });
                });
            }
        });

        if (allPartners.length === 0) {
            return '';
        }

        // Генерируем HTML для секции купонов
        return `
            <div class="coupons-section" data-animate="fadeInUp" data-delay="400">
                <div class="coupons-header">
                    <h3 class="coupons-title">
                        <span>🎫</span> Мои купоны и скидки
                    </h3>
                    <p class="coupons-subtitle">${allPartners.length} доступных</p>
                </div>
                <div class="coupons-grid">
                    ${allPartners.map((partner, index) => {
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
                                <button class="coupon-qr-btn" onclick="matryoshkaProfile.showPartnerQR('${partner.name.replace(/'/g, "\\'")}', '${partner.emoji}')">
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
     * Показать QR-код для конкретного партнера
     */
    showPartnerQR(partnerName, partnerEmoji) {
        console.log('🔲 Показываем QR для партнера из профиля:', partnerName);

        // Используем глобальный экземпляр MatryoshkaQR
        if (window.matryoshkaQR && typeof window.matryoshkaQR.showQRCode === 'function') {
            // Создаем объект партнера для QR системы
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
            this.showToast('❌ Ошибка отображения QR-кода');
        }
    }

    /**
     * Обновление секции купонов (вызывается после оплаты)
     */
    updateCoupons() {
        // Перезагружаем весь профиль, чтобы обновить секцию купонов
        this.loadProfileData();
    }

    /**
     * Генерация адаптивной сетки фотографий
     */
    generatePhotoGrid(images) {
        if (!images || images.length === 0) {
            return '<div class="no-images">Нет фотографий</div>';
        }

        if (images.length === 1) {
            return `<img src="${images[0]}" class="single-image" loading="lazy">`;
        }

        if (images.length === 2) {
            return `
                <div class="grid-two">
                    ${images.map(img => `<img src="${img}" class="grid-image" loading="lazy">`).join('')}
                </div>
            `;
        }

        if (images.length === 3) {
            return `
                <div class="grid-three">
                    <img src="${images[0]}" class="grid-image main" loading="lazy">
                    <div class="grid-column">
                        <img src="${images[1]}" class="grid-image" loading="lazy">
                        <img src="${images[2]}" class="grid-image" loading="lazy">
                    </div>
                </div>
            `;
        }

        if (images.length >= 4) {
            return `
                <div class="grid-many">
                    <img src="${images[0]}" class="grid-image" loading="lazy">
                    <img src="${images[1]}" class="grid-image" loading="lazy">
                    <img src="${images[2]}" class="grid-image" loading="lazy">
                    <div class="grid-more">
                        <img src="${images[3]}" class="grid-image" loading="lazy">
                        ${images.length > 4 ? `<div class="more-overlay">+${images.length - 4}</div>` : ''}
                    </div>
                </div>
            `;
        }
    }

    /**
     * Инициализация анимаций
     */
    initAnimations() {
        // Анимация счетчиков статистики
        this.animateCounters();

        // Анимация пульса аватара
        this.pulseAvatar();
    }

    /**
     * Анимация элементов при появлении
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
     * Анимация счетчиков статистики
     */
    animateCounters() {
        setTimeout(() => {
            const counters = document.querySelectorAll('.profile-stat');

            counters.forEach((counter, index) => {
                const target = parseInt(counter.dataset.value);
                const valueElement = counter.querySelector('.profile-stat-value');

                setTimeout(() => {
                    this.countUp(valueElement, target, 1500);
                }, index * 200);
            });
        }, 800);
    }

    /**
     * Анимация подсчета чисел
     */
    countUp(element, target, duration) {
        const start = 0;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing функция для плавности
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Пульсация аватара
     */
    pulseAvatar() {
        const avatar = document.querySelector('.profile-avatar');
        if (avatar) {
            setInterval(() => {
                avatar.style.animation = 'pulse 2s ease-in-out';
                setTimeout(() => {
                    avatar.style.animation = '';
                }, 2000);
            }, 10000);
        }
    }

    /**
     * Инициализация интерактивности
     */
    initInteractions() {
        // Обработка кликов по кнопкам действий
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action]')) {
                const action = e.target.closest('[data-action]').dataset.action;
                this.handleAction(action, e.target.closest('[data-action]'));
            }

            // Обработка кликов по кнопкам редактирования статистики
            if (e.target.classList.contains('edit-stat-btn')) {
                const stat = e.target.closest('.profile-stat');
                this.editStatistic(stat);
            }
        });

        /**
         * Редактирование статистики
         */
        this.editStatistic = (statElement) => {
            const key = statElement.dataset.key;
            const currentValue = statElement.dataset.value;
            const valueElement = statElement.querySelector('.profile-stat-value');

            const input = document.createElement('input');
            input.type = 'number';
            input.value = currentValue;
            input.className = 'stat-input';
            input.min = '0';
            input.max = '9999';

            valueElement.style.display = 'none';
            statElement.appendChild(input);
            input.focus();
            input.select();

            const saveValue = () => {
                const newValue = parseInt(input.value) || 0;
                this.profileData[key] = newValue;
                statElement.dataset.value = newValue;
                valueElement.textContent = newValue;
                valueElement.style.display = '';
                input.remove();
                this.saveToLocalStorage();
                this.showToast(`✅ ${key === 'cities' ? 'Города' : 'Статистика'} обновлена`);
            };

            input.addEventListener('blur', saveValue);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveValue();
                }
                if (e.key === 'Escape') {
                    valueElement.style.display = '';
                    input.remove();
                }
            });
        };

        // Тактильная обратная связь для Telegram
        if (window.Telegram?.WebApp?.HapticFeedback) {
            const buttons = document.querySelectorAll('.action-btn, .profile-stat');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                });
            });
        }
    }

    /**
     * Обработка действий кнопок
     */
    handleAction(action, button) {
        // Анимация нажатия
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);

        switch (action) {
            case 'support':
                this.showSupportModal();
                break;
            case 'add-travel':
                this.showAddTravelModal();
                break;
            case 'delete-travel':
                const travelId = parseInt(button.dataset.id);
                this.deleteTravelStory(travelId);
                break;
            case 'edit-profile':
                this.showEditProfileModal();
                break;
            case 'toggle-like':
                const likedTravelId = parseInt(button.dataset.travelId);
                this.toggleLike(likedTravelId, button);
                break;
            default:
                console.log(`Неизвестное действие: ${action}`);
        }
    }

    /**
     * Показ модалки поддержки
     */
    showSupportModal() {
        const modal = document.createElement('div');
        modal.className = 'travel-modal modern-modal';
        modal.innerHTML = `
            <div class="modal-content support-modal-content">
                <div class="modal-header modern-modal-header">
                    <h3 class="modal-title">💬 Поддержка</h3>
                    <button class="modal-close modern-close">✕</button>
                </div>
                <div class="modal-body modern-modal-body">
                    <div class="support-intro">
                        <div class="support-icon">📞</div>
                        <p class="support-subtitle">Свяжитесь с нами любым удобным способом</p>
                    </div>

                    <div class="support-contacts">
                        <div class="support-contact-card telegram-card">
                            <div class="contact-icon">💬</div>
                            <div class="contact-info">
                                <div class="contact-label">Telegram</div>
                                <a href="https://t.me/Alexandr_TSYP" target="_blank" class="contact-link">
                                    @Alexandr_TSYP
                                </a>
                            </div>
                        </div>

                        <div class="support-contact-card email-card">
                            <div class="contact-icon">📧</div>
                            <div class="contact-info">
                                <div class="contact-label">Email</div>
                                <a href="mailto:cypkajkinsasa@gmail.com" class="contact-link">
                                    cypkajkinsasa@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer modern-modal-footer">
                    <button class="modal-btn modern-btn cancel">Закрыть</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').onclick = () => this.closeModal(modal);
        modal.querySelector('.cancel').onclick = () => this.closeModal(modal);

        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Показ модалки добавления путешествия
     */
    showAddTravelModal() {
        const modal = document.createElement('div');
        modal.className = 'travel-modal';
        modal.innerHTML = `
            <div class="modal-content travel-add-modal">
                <div class="modal-header">
                    <h3>📸 Добавить путешествие</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-section">
                        <label class="form-label">Название</label>
                        <input type="text" id="travelTitle" placeholder="Например: Москва, Красная площадь" maxlength="50" class="form-input">
                    </div>

                    <div class="form-section">
                        <label class="form-label">Описание</label>
                        <textarea id="travelText" placeholder="Поделитесь впечатлениями о поездке..." maxlength="300" class="form-textarea"></textarea>
                    </div>

                    <div class="form-section">
                        <label class="form-label">Фотографии</label>
                        <label class="photo-upload-area">
                            <input type="file" id="travelImages" accept="image/*" multiple style="display: none;">
                            <div class="upload-icon-large">📷</div>
                            <div class="upload-title">Загрузить фото</div>
                            <div class="upload-subtitle">До 10 фотографий • JPG, PNG</div>
                        </label>

                        <div id="imagesPreview" class="images-preview-grid"></div>

                        <div id="uploadActions" class="upload-actions-section" style="display: none;">
                            <div class="photo-count-badge">
                                <span id="photoCount">0 фото</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer modal-footer-sticky">
                    <button class="modal-btn cancel">Отмена</button>
                    <button class="modal-btn publish" id="savePhotosBtn" style="display: none;">Опубликовать</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Обработчики событий модалки
        modal.querySelector('.modal-close').onclick = () => this.closeModal(modal);
        modal.querySelector('.cancel').onclick = () => this.closeModal(modal);

        // Обработка множественных изображений
        const imageInput = modal.querySelector('#travelImages');
        imageInput.addEventListener('change', (e) => {
            this.handleMultipleImages(e, modal);
        });

        // Обработчик кнопки сохранения
        const saveBtn = modal.querySelector('#savePhotosBtn');
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.savePhotosAndSubmit(modal);
        });

        // Анимация появления
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Обработка множественных изображений
     */
    handleMultipleImages(event, modal) {
        const files = Array.from(event.target.files);
        const preview = modal.querySelector('#imagesPreview');
        const actions = modal.querySelector('#uploadActions');
        const photoCount = modal.querySelector('#photoCount');
        const publishBtn = modal.querySelector('#savePhotosBtn');

        console.log(`Выбрано ${files.length} файлов`);

        if (files.length > 10) {
            this.showToast('❌ Максимум 10 фотографий');
            event.target.value = '';
            return;
        }

        if (files.length === 0) {
            preview.innerHTML = '';
            actions.style.display = 'none';
            publishBtn.style.display = 'none';
            return;
        }

        // Показываем действия, счетчик и кнопку публикации
        actions.style.display = 'flex';
        publishBtn.style.display = 'block';
        const fileText = files.length === 1 ? 'фото' : files.length < 5 ? 'фото' : 'фото';
        photoCount.textContent = `${files.length} ${fileText}`;

        // Очищаем превью
        preview.innerHTML = '';

        // Обрабатываем каждый файл
        files.forEach((file, index) => {
            console.log(`Обрабатываем файл ${index + 1}: ${file.name}`);

            const reader = new FileReader();
            reader.onload = (e) => {
                console.log(`Файл ${index + 1} загружен`);

                const imageContainer = document.createElement('div');
                imageContainer.className = 'preview-image-item';
                imageContainer.dataset.fileIndex = index;

                imageContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Фото ${index + 1}">
                    <div class="preview-number">${index + 1}</div>
                    <button class="remove-image-btn" data-file-index="${index}" title="Удалить">
                        <span>×</span>
                    </button>
                `;

                // Добавляем обработчик удаления
                const removeBtn = imageContainer.querySelector('.remove-image-btn');
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log(`Удаляем фото ${index + 1}`);
                    imageContainer.remove();

                    // Проверяем, остались ли еще фото
                    const remainingPhotos = preview.querySelectorAll('.preview-image-item');
                    if (remainingPhotos.length === 0) {
                        actions.style.display = 'none';
                        publishBtn.style.display = 'none';
                    } else {
                        photoCount.textContent = `${remainingPhotos.length} фото`;
                    }
                });

                preview.appendChild(imageContainer);
                console.log(`Фото ${index + 1} добавлено в превью`);
            };

            reader.onerror = () => {
                console.error(`Ошибка загрузки файла ${file.name}`);
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Отрисовка превью фотографий
     */
    renderPhotoPreview(processedFiles, modal) {
        const preview = modal.querySelector('#imagesPreview');
        preview.innerHTML = '';

        processedFiles.forEach((item, displayIndex) => {
            if (!item) return; // Пропускаем удаленные элементы

            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-preview-item';
            imageContainer.dataset.originalIndex = item.index;
            imageContainer.style.cssText = `
                position: relative;
                aspect-ratio: 1;
                border-radius: 10px;
                overflow: hidden;
                background: #333;
            `;

            imageContainer.innerHTML = `
                <img src="${item.dataUrl}"
                     style="width: 100%; height: 100%; object-fit: cover;"
                     alt="Preview ${displayIndex + 1}"
                     loading="lazy">
                <button class="remove-image-btn"
                        data-original-index="${item.index}"
                        style="
                            position: absolute;
                            top: 5px;
                            right: 5px;
                            background: rgba(0,0,0,0.7);
                            border: none;
                            color: white;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: all 0.2s ease;
                        "
                        onmouseover="this.style.background='rgba(255,107,107,0.9)'"
                        onmouseout="this.style.background='rgba(0,0,0,0.7)'"
                        title="Удалить фото">✕</button>
            `;

            // Добавляем обработчик удаления
            const removeBtn = imageContainer.querySelector('.remove-image-btn');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const originalIndex = parseInt(removeBtn.dataset.originalIndex);
                this.removeImageFromPreview(originalIndex, modal);
            });

            preview.appendChild(imageContainer);
        });
    }

    /**
     * Удаление изображения из превью
     */
    removeImageFromPreview(indexToRemove, modal) {
        const input = modal.querySelector('#travelImages');
        const preview = modal.querySelector('#imagesPreview');
        const actions = modal.querySelector('#uploadActions');
        const photoCount = modal.querySelector('#photoCount');

        try {
            const dt = new DataTransfer();
            const currentFiles = Array.from(input.files);

            // Создаем новый список файлов без удаленного
            currentFiles.forEach((file, i) => {
                if (i !== indexToRemove) {
                    dt.items.add(file);
                }
            });

            input.files = dt.files;

            // Удаляем элемент из превью
            const itemToRemove = preview.querySelector(`[data-index="${indexToRemove}"]`);
            if (itemToRemove) {
                itemToRemove.remove();
            }

            // Перенумеровываем оставшиеся элементы
            const remainingItems = preview.querySelectorAll('.image-preview-item');
            remainingItems.forEach((item, newIndex) => {
                item.dataset.index = newIndex;
                const removeBtn = item.querySelector('.remove-image-btn');
                removeBtn.dataset.index = newIndex;

                // Обновляем обработчик события
                const newBtn = removeBtn.cloneNode(true);
                newBtn.addEventListener('click', () => {
                    this.removeImageFromPreview(newIndex, modal);
                });
                removeBtn.parentNode.replaceChild(newBtn, removeBtn);
            });

            // Обновляем счетчик и видимость
            const fileCount = input.files.length;
            if (fileCount === 0) {
                actions.style.display = 'none';
            } else {
                photoCount.textContent = `${fileCount} ${fileCount === 1 ? 'фотография' : fileCount < 5 ? 'фотографии' : 'фотографий'} выбрано`;
            }

        } catch (error) {
            console.error('Ошибка при удалении изображения:', error);
            this.showToast('❌ Ошибка удаления фото');
        }
    }

    /**
     * Сохранение фото и создание поста
     */
    savePhotosAndSubmit(modal) {
        console.log('🚀 ЗАПУСК savePhotosAndSubmit');

        const titleElement = modal.querySelector('#travelTitle');
        const textElement = modal.querySelector('#travelText');
        const imagesElement = modal.querySelector('#travelImages');

        const title = titleElement ? titleElement.value.trim() : '';
        const text = textElement ? textElement.value.trim() : '';
        const imageFiles = imagesElement ? Array.from(imagesElement.files) : [];

        if (!title) {
            this.showToast('❌ Введите название путешествия');
            return;
        }

        if (!text) {
            this.showToast('❌ Введите описание путешествия');
            return;
        }

        if (imageFiles.length === 0) {
            this.showToast('❌ Добавьте хотя бы одно фото');
            return;
        }

        if (imageFiles.length > 10) {
            this.showToast('❌ Максимум 10 фотографий');
            return;
        }

        // === ПОЛУЧАЕМ BASE64 ИЗОБРАЖЕНИЯ ИЗ ПРЕВЬЮ ===
        const preview = modal.querySelector('#imagesPreview');
        const previewImages = preview.querySelectorAll('.preview-image-item img');
        const images = Array.from(previewImages).map(img => img.src);

        console.log('📸 Извлечено изображений из превью:', images.length);
        console.log('📸 Первое изображение (первые 100 символов):', images[0]?.substring(0, 100));

        if (images.length === 0) {
            this.showToast('❌ Нет загруженных изображений');
            return;
        }

        // === СРАЗУ закрываем модалку ===
        this.closeModal(modal);

        // Создаем объект путешествия
        const newTravel = {
            id: Date.now(),
            title: title,
            text: text,
            images: images, // Используем base64 данные из превью
            image: images[0],
        };

        console.log('✅ Создан объект путешествия с', images.length, 'изображениями');

        // Обновляем данные
        this.travelStories.push(newTravel);

        // Автоматически обновляем счетчики
        this.updateTravelCounters();

        this.updateTravelCards();
        this.saveToLocalStorage();

        // Добавляем в глобальную базу данных
        if (window.travelDatabase) {
            const userInfo = this.user || {};
            console.log('📤 Добавляем в глобальную базу:', newTravel);
            console.log('👤 Информация о пользователе:', userInfo);
            const addedTravel = window.travelDatabase.add(newTravel, userInfo);
            console.log('✅ Путешествие добавлено в глобальную ленту:', addedTravel);
            console.log('📊 Всего в базе:', window.travelDatabase.travels.length);

            // Обновляем ленту на главной странице если функция существует
            if (typeof loadMainFeedSection === 'function') {
                loadMainFeedSection();
                console.log('🔄 Лента на главной обновлена');
            }
        } else {
            console.error('❌ window.travelDatabase не найден!');
        }

        // Показываем уведомление
        this.showToast('✅ Путешествие добавлено!');
    }

    /**
     * Автоматическое обновление счетчиков путешествий и городов
     */
    updateTravelCounters() {
        // Обновляем количество путешествий
        this.profileData.travels = this.travelStories.length;

        // Собираем уникальные города из всех путешествий
        const uniqueCities = new Set();
        this.travelStories.forEach(travel => {
            if (travel.title) {
                // Извлекаем название города из заголовка (до первой запятой или целиком)
                const city = travel.title.split(',')[0].trim();
                uniqueCities.add(city);
            }
        });
        this.profileData.cities = uniqueCities.size;

        // Обновляем отображение статистики
        this.updateStatsDisplay();
    }

    /**
     * Обновление отображения статистики на экране
     */
    updateStatsDisplay() {
        const profileStats = document.querySelectorAll('.profile-stat');
        profileStats.forEach(stat => {
            const key = stat.dataset.key;
            if (key === 'travels') {
                const valueEl = stat.querySelector('.stat-value');
                if (valueEl) valueEl.textContent = this.profileData.travels;
                stat.dataset.value = this.profileData.travels;
            } else if (key === 'cities') {
                const valueEl = stat.querySelector('.stat-value');
                if (valueEl) valueEl.textContent = this.profileData.cities;
                stat.dataset.value = this.profileData.cities;
            }
        });
    }

    /**
     * Удаление истории путешествия
     */
    deleteTravelStory(travelId) {
        if (confirm('Удалить это путешествие?')) {
            this.travelStories = this.travelStories.filter(t => t.id !== travelId);

            // Удаляем из глобальной базы данных
            if (window.travelDatabase) {
                console.log('🗑️ Удаляем из глобальной базы, ID:', travelId);
                window.travelDatabase.removeByLocalId(travelId);
                console.log('✅ Путешествие удалено из глобальной ленты');
                console.log('📊 Осталось в базе:', window.travelDatabase.travels.length);

                // Обновляем ленту на главной странице
                if (typeof loadMainFeedSection === 'function') {
                    loadMainFeedSection();
                    console.log('🔄 Лента на главной обновлена после удаления');
                }
            } else {
                console.error('❌ window.travelDatabase не найден при удалении!');
            }

            // Автоматически обновляем счетчики
            this.updateTravelCounters();

            this.updateTravelCards();
            this.saveToLocalStorage();
            this.showToast('🗑️ Путешествие удалено');
        }
    }

    /**
     * Переключение лайка на путешествии
     */
    toggleLike(travelId, button) {
        const travel = this.travelStories.find(t => t.id === travelId);
        if (!travel) return;

        // Инициализируем поля лайков если их еще нет
        if (travel.likes === undefined) travel.likes = 0;
        if (travel.liked === undefined) travel.liked = false;

        // Переключаем состояние лайка
        travel.liked = !travel.liked;

        if (travel.liked) {
            travel.likes += 1;
            // Анимация лайка
            button.classList.add('liked');
            button.style.animation = 'likeAnimation 0.5s ease';
        } else {
            travel.likes = Math.max(0, travel.likes - 1);
            button.classList.remove('liked');
        }

        // Обновляем UI кнопки
        const likeIcon = button.querySelector('.like-icon');
        const likeCount = button.querySelector('.like-count');

        if (likeIcon) likeIcon.textContent = travel.liked ? '❤️' : '🤍';
        if (likeCount) likeCount.textContent = travel.likes;

        // Сохраняем изменения
        this.saveToLocalStorage();

        // Убираем анимацию после завершения
        setTimeout(() => {
            button.style.animation = '';
        }, 500);
    }

    /**
     * Обновление карточек путешествий
     */
    updateTravelCards() {
        const container = document.getElementById('travelCards');
        if (container) {
            container.innerHTML = this.generateTravelCardsHTML();
        }
    }

    /**
     * Показ модалки редактирования профиля
     */
    showEditProfileModal() {
        // Очищаем глобальную переменную аватарки
        window.selectedAvatarData = null;

        const modal = document.createElement('div');
        modal.className = 'travel-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✏️ Редактировать профиль</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="edit-section">
                        <label>Аватар</label>
                        <div class="avatar-upload">
                            <img src="${this.user.photo_url || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="60" fill="#FFCC00"/><text x="50%" y="50%" fill="white" text-anchor="middle" dy=".3em" font-family="Arial" font-size="40">👤</text></svg>')}" class="current-avatar" id="currentAvatar">
                            <input type="file" id="avatarUpload" accept="image/*">
                            <label for="avatarUpload" class="avatar-upload-btn">📷 Изменить</label>
                        </div>
                    </div>
                    <div class="edit-section">
                        <label>Имя</label>
                        <input type="text" id="nameText" placeholder="Ваше имя" maxlength="30" value="${this.profileData.name || this.user.first_name || 'Путешественник'}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,204,0,0.3); background: rgba(255,255,255,0.1); color: white; margin-bottom: 15px;">
                    </div>
                    <div class="edit-section">
                        <label>О себе</label>
                        <textarea id="bioText" placeholder="Расскажите о себе..." maxlength="150">${this.profileData.bio}</textarea>
                    </div>
                    <div class="edit-section">
                        <label>Статистика</label>
                        <div class="stats-edit">
                            <div class="stat-edit-item">
                                <span>🌍 Путешествий:</span>
                                <input type="number" id="travelsCount" value="${this.profileData.travels}" min="0" max="999">
                            </div>
                            <div class="stat-edit-item">
                                <span>🏛️ Городов:</span>
                                <input type="number" id="citiesCount" value="${this.profileData.cities}" min="0" max="999">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel">Отмена</button>
                    <button class="modal-btn save" id="saveProfile">Сохранить</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Обработчики
        modal.querySelector('.modal-close').onclick = () => this.closeModal(modal);
        modal.querySelector('.cancel').onclick = () => this.closeModal(modal);
        modal.querySelector('#saveProfile').onclick = () => this.saveProfileChanges(modal);
        // Обработчик аватарки будет добавлен через avatar_fix.js

        // Анимация появления
        setTimeout(() => modal.classList.add('show'), 10);
    }


    /**
     * Сохранение изменений профиля
     */
    saveProfileChanges(modal) {
        console.log('💾 Сохраняем изменения профиля');

        const name = modal.querySelector('#nameText').value.trim();
        const bio = modal.querySelector('#bioText').value.trim();
        const travels = parseInt(modal.querySelector('#travelsCount').value) || 0;
        const cities = parseInt(modal.querySelector('#citiesCount').value) || 0;
        const avatarFile = modal.querySelector('#avatarUpload').files[0];

        // Обновляем основные данные профиля
        this.profileData.name = name || 'Путешественник';
        this.profileData.bio = bio;
        this.profileData.travels = travels;
        this.profileData.cities = cities;

        console.log('📝 Основные данные обновлены:', this.profileData);

        // РАБОЧАЯ ЛОГИКА АВАТАРКИ ИЗ ТЕСТА
        if (window.selectedAvatarData) {
            this.user.photo_url = window.selectedAvatarData;
            console.log('✅ Аватар сохранен из selectedAvatarData');
        }

        // Сохраняем в sessionStorage
        this.saveToLocalStorage();

        // Обновляем интерфейс
        this.loadProfileData();

        // Закрываем модалку и показываем уведомление
        this.closeModal(modal);
        setTimeout(() => {
            this.showToast('✅ Профиль обновлен!');
        }, 100);
    }

    /**
     * Открытие галереи фотографий
     */
    openPhotoGallery(travelId) {
        const travel = this.travelStories.find(t => t.id === travelId);
        if (!travel || !travel.images) return;

        const gallery = document.createElement('div');
        gallery.id = 'photoGallery';
        gallery.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            backdrop-filter: blur(10px);
        `;

        let currentIndex = 0;
        const images = travel.images;

        gallery.innerHTML = `
            <div style="
                position: relative;
                max-width: 90vw;
                max-height: 90vh;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <!-- Закрыть -->
                <button id="closeGallery" style="
                    position: absolute;
                    top: -50px;
                    right: 0;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    z-index: 10002;
                ">✕</button>

                <!-- Предыдущее фото -->
                <button id="prevPhoto" style="
                    position: absolute;
                    left: -60px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    cursor: pointer;
                    z-index: 10002;
                    ${images.length <= 1 ? 'display: none;' : ''}
                ">‹</button>

                <!-- Фотография -->
                <img id="galleryPhoto" src="${images[0]}" style="
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    border-radius: 10px;
                    box-shadow: 0 10px 50px rgba(0,0,0,0.5);
                ">

                <!-- Следующее фото -->
                <button id="nextPhoto" style="
                    position: absolute;
                    right: -60px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    cursor: pointer;
                    z-index: 10002;
                    ${images.length <= 1 ? 'display: none;' : ''}
                ">›</button>

                <!-- Индикатор -->
                <div id="photoIndicator" style="
                    position: absolute;
                    bottom: -50px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: white;
                    font-size: 14px;
                    ${images.length <= 1 ? 'display: none;' : ''}
                ">${currentIndex + 1} / ${images.length}</div>
            </div>
        `;

        document.body.appendChild(gallery);

        // Обработчики событий
        const photo = gallery.querySelector('#galleryPhoto');
        const indicator = gallery.querySelector('#photoIndicator');

        const updatePhoto = () => {
            photo.src = images[currentIndex];
            if (indicator) {
                indicator.textContent = `${currentIndex + 1} / ${images.length}`;
            }
        };

        gallery.querySelector('#closeGallery').onclick = () => {
            gallery.remove();
        };

        const prevBtn = gallery.querySelector('#prevPhoto');
        if (prevBtn) {
            prevBtn.onclick = () => {
                currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
                updatePhoto();
            };
        }

        const nextBtn = gallery.querySelector('#nextPhoto');
        if (nextBtn) {
            nextBtn.onclick = () => {
                currentIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
                updatePhoto();
            };
        }

        // Закрытие по клику вне фото
        gallery.addEventListener('click', (e) => {
            if (e.target === gallery) {
                gallery.remove();
            }
        });

        // Управление клавиатурой
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                gallery.remove();
                document.removeEventListener('keydown', handleKeyPress);
            } else if (e.key === 'ArrowLeft' && prevBtn) {
                prevBtn.click();
            } else if (e.key === 'ArrowRight' && nextBtn) {
                nextBtn.click();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
    }

    /**
     * Закрытие модалки
     */
    closeModal(modal) {
        modal.classList.add('hide');
        setTimeout(() => modal.remove(), 300);
    }


    /**
     * Показ уведомлений
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'matryoshka-toast';
        toast.textContent = message;

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #ffcc00, #ff8e53)',
            color: '#1a1a2e',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            zIndex: '10000',
            boxShadow: '0 8px 32px rgba(255, 204, 0, 0.3)',
            animation: 'fadeInUp 0.3s ease-out'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Глобальная инициализация
let matryoshkaProfile = null;

function initProfile() {
    matryoshkaProfile = new MatryoshkaProfile();
    matryoshkaProfile.initProfile();
}

function loadProfileData() {
    if (matryoshkaProfile) {
        matryoshkaProfile.loadProfileData();
    }
}

// Автоинициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
} else {
    initProfile();
}

// Экспорт для модульности
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MatryoshkaProfile,
        initProfile,
        loadProfileData
    };
}