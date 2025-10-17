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

        // Загружаем данные из sessionStorage
        this.loadFromSession();
    }

    /**
     * Загрузка данных профиля из sessionStorage
     */
    loadFromSession() {
        try {
            const savedProfile = sessionStorage.getItem('matryoshka_profile');
            const savedStories = sessionStorage.getItem('matryoshka_stories');
            const savedAvatar = sessionStorage.getItem('matryoshka_avatar');

            if (savedProfile) {
                const parsed = JSON.parse(savedProfile);
                this.profileData = { ...this.profileData, ...parsed };
            }

            if (savedStories) {
                const parsed = JSON.parse(savedStories);
                this.travelStories = parsed;
            }

            if (savedAvatar) {
                this.user.photo_url = savedAvatar;
            }
        } catch (error) {
            console.error('Ошибка загрузки данных из sessionStorage:', error);
        }
    }

    /**
     * Сохранение данных профиля в sessionStorage
     */
    saveToSession() {
        try {
            sessionStorage.setItem('matryoshka_profile', JSON.stringify(this.profileData));
            sessionStorage.setItem('matryoshka_stories', JSON.stringify(this.travelStories));
            if (this.user.photo_url) {
                sessionStorage.setItem('matryoshka_avatar', this.user.photo_url);
            }
        } catch (error) {
            console.error('Ошибка сохранения данных в sessionStorage:', error);
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
            <div class="profile-header" data-animate="fadeInUp">
                <div class="profile-header-top">
                    <button class="profile-edit-btn" data-action="edit-profile" title="Редактировать профиль">✏️</button>
                </div>
                <div class="profile-main-info">
                    <div class="profile-avatar-wrapper">
                        <img src="${this.user.photo_url || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="60" fill="#FFCC00"/><text x="50%" y="50%" fill="white" text-anchor="middle" dy=".3em" font-family="Arial" font-size="40">👤</text></svg>')}"
                             alt="Аватар пользователя"
                             class="profile-avatar"
                             loading="lazy">
                    </div>
                    <div class="profile-info">
                        <div class="profile-name">${this.profileData.name || this.user.first_name || 'Путешественник'}</div>
                        <div class="profile-id">ID: ${this.user.id || 'MATRYOSHKA-' + Math.floor(Math.random() * 100000)}</div>
                        <div class="profile-bio">${this.profileData.bio}</div>
                    </div>
                </div>
            </div>

            <div class="profile-stats" data-animate="fadeInUp" data-delay="200">
                ${this.generateStatsHTML()}
            </div>

            ${this.generateCouponsSection()}

            <div class="travel-gallery-section" data-animate="fadeInUp" data-delay="500">
                <div class="travel-gallery-header">
                    <h3 class="gallery-title">
                        <span>📸</span> Мои путешествия
                    </h3>
                    <button class="add-travel-btn" data-action="add-travel">+ Добавить</button>
                </div>
                <div class="travel-cards" id="travelCards">
                    ${this.generateTravelCardsHTML()}
                </div>
            </div>

            <div class="profile-actions" data-animate="fadeInUp" data-delay="600">
                <button class="action-btn" data-action="support">
                    <span>💬</span> Поддержка
                </button>
            </div>
        `;

        // Запускаем анимации появления
        this.animateElements();
    }

    /**
     * Генерация HTML для статистики
     */
    generateStatsHTML() {
        const stats = [
            { key: 'travels', value: this.profileData.travels, label: 'Путешествий', icon: '🌍' },
            { key: 'cities', value: this.profileData.cities, label: 'Городов', icon: '🏛️' },
            { key: 'reviews', value: this.profileData.reviews, label: 'Отзывов', icon: '⭐' }
        ];

        return stats.map(stat => `
            <div class="profile-stat" data-value="${stat.value}" data-key="${stat.key}">
                <div class="profile-stat-value">0</div>
                <div class="profile-stat-label">
                    <span>${stat.icon}</span> ${stat.label}
                </div>
            </div>
        `).join('');
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
                    <small>Нажмите "Добавить" чтобы поделиться своим опытом</small>
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
            </div>
        `).join('');
    }

    /**
     * Генерация секции купонов и скидок
     */
    generateCouponsSection() {
        // Загружаем оплаченные регионы из sessionStorage
        let paidRegions = [];
        try {
            const saved = sessionStorage.getItem('paidRegions');
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

        // Собираем всех партнеров из оплаченных регионов
        let allPartners = [];
        paidRegions.forEach(regionId => {
            const regionData = window.RUSSIA_REGIONS_DATA?.[regionId];
            if (regionData && regionData.partners) {
                regionData.partners.forEach(partner => {
                    allPartners.push({
                        ...partner,
                        regionName: regionData.name,
                        regionId: regionId
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
                    <p class="coupons-subtitle">Партнеры из оплаченных регионов</p>
                </div>
                <div class="coupons-grid">
                    ${allPartners.map((partner, index) => `
                        <div class="coupon-card" data-partner-index="${index}">
                            <div class="coupon-emoji">${partner.emoji}</div>
                            <div class="coupon-info">
                                <div class="coupon-name">${partner.name}</div>
                                <div class="coupon-type">${partner.type}</div>
                                <div class="coupon-region">📍 ${partner.regionName}</div>
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
                    `).join('')}
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
                this.saveToSession();
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
            default:
                console.log(`Неизвестное действие: ${action}`);
        }
    }

    /**
     * Показ модалки поддержки
     */
    showSupportModal() {
        const modal = document.createElement('div');
        modal.className = 'travel-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>💬 Поддержка</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div style="padding: 20px; text-align: center;">
                        <div style="margin-bottom: 25px;">
                            <div style="font-size: 48px; margin-bottom: 15px;">📞</div>
                            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 20px;">
                                Свяжитесь с нами любым удобным способом
                            </p>
                        </div>

                        <div style="background: rgba(255,204,0,0.05); border: 1px solid rgba(255,204,0,0.2); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                            <div style="color: #ffcc00; font-weight: 600; margin-bottom: 8px; font-size: 16px;">Telegram</div>
                            <a href="https://t.me/Alexandr_TSYP" target="_blank" style="color: #6fb6ff; text-decoration: none; font-size: 15px; display: inline-block; padding: 8px 16px; background: rgba(111,182,255,0.1); border-radius: 8px; transition: all 0.3s;">
                                @Alexandr_TSYP
                            </a>
                        </div>

                        <div style="background: rgba(255,204,0,0.05); border: 1px solid rgba(255,204,0,0.2); border-radius: 12px; padding: 20px;">
                            <div style="color: #ffcc00; font-weight: 600; margin-bottom: 8px; font-size: 16px;">Email</div>
                            <a href="mailto:cypkajkinsasa@gmail.com" style="color: #6fb6ff; text-decoration: none; font-size: 15px; display: inline-block; padding: 8px 16px; background: rgba(111,182,255,0.1); border-radius: 8px; transition: all 0.3s;">
                                cypkajkinsasa@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel">Закрыть</button>
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
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📸 Добавить путешествие</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="travelTitle" placeholder="Название путешествия" maxlength="50">
                    <textarea id="travelText" placeholder="Расскажите о своем путешествии..." maxlength="300"></textarea>
                    <div class="photo-upload-section">
                        <label class="photo-upload-label" style="
                            display: block;
                            padding: 20px;
                            border: 2px dashed rgba(255,204,0,0.5);
                            border-radius: 12px;
                            text-align: center;
                            cursor: pointer;
                            margin-bottom: 15px;
                            transition: all 0.3s ease;
                        ">
                            <input type="file" id="travelImages" accept="image/*" multiple style="display: none;">
                            <div style="font-size: 48px; margin-bottom: 10px;">📸</div>
                            <div style="color: #ffcc00; font-weight: 600; margin-bottom: 5px;">Добавить фото</div>
                            <div style="color: #888; font-size: 12px;">До 10 фотографий • JPG, PNG</div>
                        </label>

                        <div id="imagesPreview" style="
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                            gap: 10px;
                            max-height: 300px;
                            overflow-y: auto;
                            padding: 10px 0;
                            margin-bottom: 15px;
                        "></div>

                        <div id="uploadActions" style="display: none; text-align: center;">
                            <div style="
                                background: rgba(255,204,0,0.1);
                                border-radius: 12px;
                                padding: 15px;
                                margin-bottom: 20px;
                                border: 1px solid rgba(255,204,0,0.3);
                            ">
                                <div id="photoCount" style="color: #ffcc00; font-weight: 600; margin-bottom: 8px;">0 фотографий выбрано</div>
                                <div style="color: #888; font-size: 13px;">Фотографии будут красиво сгруппированы в вашем посте</div>
                            </div>
                            <button type="button" id="savePhotosBtn" style="
                                background: linear-gradient(135deg, #ffcc00, #ff8e53);
                                border: none;
                                color: #1a1a2e;
                                padding: 15px 30px;
                                border-radius: 25px;
                                font-weight: 600;
                                cursor: pointer;
                                font-size: 16px;
                                transition: all 0.3s ease;
                                box-shadow: 0 4px 15px rgba(255,204,0,0.3);
                            ">✨ Опубликовать путешествие</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel">Отмена</button>
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

        console.log(`Выбрано ${files.length} файлов`);

        if (files.length > 10) {
            this.showToast('❌ Максимум 10 фотографий');
            event.target.value = '';
            return;
        }

        if (files.length === 0) {
            preview.innerHTML = '';
            actions.style.display = 'none';
            return;
        }

        // Показываем действия и обновляем счетчик
        actions.style.display = 'block';
        const fileText = files.length === 1 ? 'фотография' : files.length < 5 ? 'фотографии' : 'фотографий';
        photoCount.textContent = `${files.length} ${fileText} выбрано`;

        // Очищаем превью
        preview.innerHTML = '';

        // Обрабатываем каждый файл
        files.forEach((file, index) => {
            console.log(`Обрабатываем файл ${index + 1}: ${file.name}`);

            const reader = new FileReader();
            reader.onload = (e) => {
                console.log(`Файл ${index + 1} загружен`);

                const imageContainer = document.createElement('div');
                imageContainer.className = 'image-preview-item';
                imageContainer.dataset.fileIndex = index;
                imageContainer.style.cssText = `
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 10px;
                    overflow: hidden;
                    background: #333;
                    border: 2px solid rgba(255,204,0,0.3);
                `;

                imageContainer.innerHTML = `
                    <img src="${e.target.result}"
                         style="width: 100%; height: 100%; object-fit: cover;"
                         alt="Фото ${index + 1}"
                         loading="lazy">
                    <div style="
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: linear-gradient(transparent, rgba(0,0,0,0.8));
                        color: white;
                        font-size: 11px;
                        padding: 8px 5px 5px;
                        text-align: center;
                    ">${index + 1}</div>
                    <button class="remove-image-btn"
                            data-file-index="${index}"
                            style="
                                position: absolute;
                                top: 5px;
                                right: 5px;
                                background: rgba(255,107,107,0.9);
                                border: none;
                                color: white;
                                width: 22px;
                                height: 22px;
                                border-radius: 50%;
                                cursor: pointer;
                                font-size: 11px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: bold;
                            "
                            title="Удалить фото">×</button>
                `;

                // Добавляем обработчик удаления
                const removeBtn = imageContainer.querySelector('.remove-image-btn');
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log(`Удаляем фото ${index + 1}`);
                    imageContainer.remove();
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

        // === СРАЗУ закрываем модалку ===
        this.closeModal(modal);

        // Создаем объект путешествия
        const images = imageFiles.map(file => URL.createObjectURL(file));
        const newTravel = {
            id: Date.now(),
            title: title,
            text: text,
            images: images,
            image: images[0],
        };

        // Обновляем данные
        this.travelStories.push(newTravel);

        // Автоматически обновляем счетчики
        this.updateTravelCounters();

        this.updateTravelCards();
        this.saveToSession();

        // Добавляем в глобальную ленту (если есть)
        if (typeof addToGlobalFeed === 'function') {
            addToGlobalFeed(newTravel);
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

            // Автоматически обновляем счетчики
            this.updateTravelCounters();

            this.updateTravelCards();
            this.saveToSession();
            this.showToast('🗑️ Путешествие удалено');
        }
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
        this.saveToSession();

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