/**
 * 🏢 ПОЛНАЯ КАРТОЧКА ОРГАНИЗАЦИИ 2GIS
 * Максимально детальная информация как в приложении 2ГИС
 */

class Organization2GISCard {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.catalogApiUrl = 'https://catalog.api.2gis.com/3.0/items';
    }

    /**
     * Получить ПОЛНУЮ информацию об организации по ID
     */
    async getFullOrganizationData(orgId) {
        try {
            console.log('🔍 Загружаем полную информацию об организации:', orgId);

            // Запрашиваем ВСЕ доступные поля
            const fields = [
                'items.name',
                'items.address',
                'items.point',
                'items.purpose_name',
                'items.rubrics',
                'items.contact_groups',      // Контакты (телефоны, сайт, email)
                'items.schedule',            // График работы
                'items.reviews',             // Отзывы и рейтинг
                'items.photos',              // Фотографии
                'items.description',         // Описание
                'items.org',                 // Информация об организации
                'items.external_content',    // Внешний контент
                'items.flags',               // Флаги (Wi-Fi, парковка и т.д.)
                'items.links',               // Ссылки на соцсети
                'items.locale',              // Локализация
                'items.context',             // Контекст
                'items.ads'                  // Рекламные материалы (акции, спецпредложения)
            ].join(',');

            const params = new URLSearchParams({
                id: orgId,
                key: this.apiKey,
                fields: fields,
                locale: 'ru_RU'
            });

            const url = `${this.catalogApiUrl}?${params}`;
            console.log('📡 API запрос:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📦 Полные данные организации:', data);

            if (!data.result || !data.result.items || data.result.items.length === 0) {
                throw new Error('Организация не найдена');
            }

            return data.result.items[0];

        } catch (error) {
            console.error('❌ Ошибка загрузки данных организации:', error);
            throw error;
        }
    }

    /**
     * Отображение ПОЛНОЙ карточки организации
     */
    async showFullCard(orgId, containerElement) {
        try {
            // Показываем загрузчик
            this.showLoadingState(containerElement);

            // Получаем полные данные
            const org = await this.getFullOrganizationData(orgId);

            // Сохраняем текущую организацию
            this.currentOrg = org;

            // Рендерим карточку для сайдбара
            containerElement.innerHTML = this.renderSidebarCard(org);

            // Инициализируем интерактивные элементы
            this.initializeCardInteractions(containerElement, org);

        } catch (error) {
            this.showErrorState(containerElement, error.message);
        }
    }

    /**
     * Рендер полной карточки
     */
    renderFullCard(org) {
        const html = `
            <div class="org-card-full">
                <!-- Фотографии (слайдер) -->
                ${this.renderPhotoGallery(org)}

                <!-- Основная информация -->
                <div class="org-card-header">
                    ${this.renderHeader(org)}
                </div>

                <!-- Табы -->
                <div class="org-card-tabs">
                    ${this.renderTabs()}
                </div>

                <!-- Контент табов -->
                <div class="org-card-content">
                    <!-- Таб: Контакты -->
                    <div class="org-tab-pane active" data-tab="contacts">
                        ${this.renderContactsTab(org)}
                    </div>

                    <!-- Таб: Инфо -->
                    <div class="org-tab-pane" data-tab="info">
                        ${this.renderInfoTab(org)}
                    </div>

                    <!-- Таб: Отзывы -->
                    <div class="org-tab-pane" data-tab="reviews">
                        ${this.renderReviewsTab(org)}
                    </div>

                    <!-- Таб: Фото -->
                    <div class="org-tab-pane" data-tab="photos">
                        ${this.renderPhotosTab(org)}
                    </div>
                </div>

                <!-- Кнопки действий -->
                ${this.renderActionButtons(org)}
            </div>
        `;

        return html;
    }

    /**
     * Рендер карточки для сайдбара (компактная версия со всей информацией)
     */
    renderSidebarCard(org) {
        const rating = org.reviews?.general_rating || 0;
        const reviewCount = org.reviews?.general_review_count || 0;

        return `
            <div class="org-sidebar-card" style="animation: slideInRight 0.3s ease;">
                <!-- Шапка с фото -->
                ${this.renderCompactPhotoHeader(org)}

                <!-- Основная информация -->
                <div style="padding: 20px;">
                    <!-- Название и категория -->
                    <h2 class="org-name" style="font-size: 1.3rem; color: #fff; margin: 0 0 8px 0; line-height: 1.3;">
                        ${org.name || 'Организация'}
                    </h2>

                    <p class="org-category" style="color: #ffcc00; font-size: 0.9rem; margin: 0 0 12px 0;">
                        ${org.purpose_name || org.rubrics?.[0]?.name || 'Место'}
                    </p>

                    <!-- Рейтинг -->
                    ${rating > 0 ? `
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; background: rgba(255,204,0,0.1); padding: 10px; border-radius: 8px;">
                            <div class="rating-stars" style="color: #ffcc00; font-size: 1rem;">
                                ${this.renderStars(rating)}
                            </div>
                            <span style="color: #ffcc00; font-weight: 700; font-size: 1.1rem;">${rating.toFixed(1)}</span>
                            <span style="color: #999; font-size: 0.85rem;">(${reviewCount} отзывов)</span>
                        </div>
                    ` : ''}

                    <!-- Адрес -->
                    <div style="display: flex; gap: 8px; margin-bottom: 20px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <span style="font-size: 1.2rem;">📍</span>
                        <span style="color: #d0d0d0; font-size: 0.9rem; line-height: 1.4;">
                            ${org.address?.name || 'Адрес не указан'}
                        </span>
                    </div>

                    <!-- График работы -->
                    ${this.renderCompactSchedule(org.schedule)}

                    <!-- Контакты -->
                    ${this.renderCompactContacts(org.contact_groups)}

                    <!-- Описание -->
                    ${org.description ? `
                        <div style="margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 3px solid #667eea;">
                            <h4 style="color: #ffcc00; font-size: 0.95rem; margin: 0 0 8px 0; font-weight: 600;">📝 Описание</h4>
                            <p style="color: #e0e0e0; line-height: 1.5; margin: 0; font-size: 0.9rem;">
                                ${org.description}
                            </p>
                        </div>
                    ` : ''}

                    <!-- Категории и рубрики -->
                    ${this.renderCompactCategories(org.rubrics)}

                    <!-- Особенности (Wi-Fi, парковка и т.д.) -->
                    ${this.renderCompactFeatures(org)}

                    <!-- Социальные сети -->
                    ${this.renderCompactSocials(org.links)}

                    <!-- Отзывы -->
                    ${this.renderCompactReviews(org.reviews)}

                    <!-- Фотографии -->
                    ${this.renderCompactPhotos(org.photos)}

                    <!-- Дополнительная информация -->
                    ${this.renderAdditionalInfo(org)}

                </div>
            </div>
        `;
    }

    /**
     * Компактная шапка с фото
     */
    renderCompactPhotoHeader(org) {
        const photos = org.photos || [];

        if (photos.length > 0) {
            const mainPhoto = photos[0];
            const photoUrl = mainPhoto.url || mainPhoto.thumbnail_url;

            return `
                <div style="position: relative; width: 100%; height: 180px; background: linear-gradient(135deg, #667eea, #764ba2); overflow: hidden;">
                    <img src="${photoUrl}"
                         style="width: 100%; height: 100%; object-fit: cover;"
                         onerror="this.style.display='none'">
                    ${photos.length > 1 ? `
                        <div style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.7); color: #fff; padding: 6px 12px; border-radius: 16px; font-size: 0.8rem; font-weight: 500;">
                            📷 ${photos.length} фото
                        </div>
                    ` : ''}
                </div>
            `;
        }

        const icon = this.getCategoryIcon(org);
        return `
            <div style="width: 100%; height: 120px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center;">
                <div style="font-size: 4rem; opacity: 0.9;">${icon}</div>
            </div>
        `;
    }

    /**
     * Компактный график работы
     */
    renderCompactSchedule(schedule) {
        if (!schedule || !schedule.working_hours || schedule.working_hours.length === 0) {
            return '';
        }

        const isOpenNow = this.checkIfOpenNow(schedule);
        const statusColor = isOpenNow ? '#4caf50' : '#f44336';
        const statusText = isOpenNow ? 'Открыто' : 'Закрыто';

        const hours = schedule.working_hours.slice(0, 3).map(day => {
            const timeStr = day.working_time_periods?.map(p => `${p.time_from}-${p.time_to}`).join(', ') || 'Закрыто';
            return `
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                    <span style="color: #999;">${day.day_name}</span>
                    <span style="color: #fff; font-weight: 500;">${timeStr}</span>
                </div>
            `;
        }).join('');

        return `
            <div style="margin-bottom: 20px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 1.2rem;">🕒</span>
                    <span style="color: ${statusColor}; font-weight: 700; font-size: 1rem;">${statusText}</span>
                </div>
                ${hours}
                ${schedule.working_hours.length > 3 ? `
                    <div style="color: #ffcc00; font-size: 0.85rem; margin-top: 8px; cursor: pointer;" onclick="alert('Показать полное расписание')">
                        + показать всё расписание
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Компактные контакты
     */
    renderCompactContacts(contactGroups) {
        if (!contactGroups || contactGroups.length === 0) return '';

        const contacts = contactGroups.flatMap(group => group.contacts || []);
        if (contacts.length === 0) return '';

        const contactsHtml = contacts.map(contact => {
            let icon = '📞';
            let value = contact.value;
            let clickable = '';

            switch (contact.type) {
                case 'phone':
                    icon = '📞';
                    value = `<a href="tel:${contact.value}" style="color: #2196f3; text-decoration: none;">${contact.value}</a>`;
                    clickable = 'cursor: pointer;';
                    break;
                case 'website':
                    icon = '🌐';
                    value = `<a href="${contact.value}" target="_blank" style="color: #2196f3; text-decoration: none; word-break: break-all;">${contact.value}</a>`;
                    clickable = 'cursor: pointer;';
                    break;
                case 'email':
                    icon = '📧';
                    value = `<a href="mailto:${contact.value}" style="color: #2196f3; text-decoration: none;">${contact.value}</a>`;
                    clickable = 'cursor: pointer;';
                    break;
            }

            return `
                <div style="display: flex; align-items: center; gap: 12px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 8px; ${clickable}">
                    <span style="font-size: 1.2rem;">${icon}</span>
                    <span style="color: #e0e0e0; font-size: 0.9rem; flex: 1;">${value}</span>
                </div>
            `;
        }).join('');

        return `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffcc00; font-size: 0.95rem; margin: 0 0 12px 0; font-weight: 600;">📞 Контакты</h4>
                ${contactsHtml}
            </div>
        `;
    }

    /**
     * Компактные категории
     */
    renderCompactCategories(rubrics) {
        if (!rubrics || rubrics.length === 0) return '';

        const tags = rubrics.slice(0, 5).map(rubric =>
            `<span style="background: rgba(33,150,243,0.2); color: #64b5f6; padding: 6px 12px; border-radius: 16px; font-size: 0.8rem; font-weight: 500; display: inline-block; margin: 4px;">${rubric.name}</span>`
        ).join('');

        return `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffcc00; font-size: 0.95rem; margin: 0 0 12px 0; font-weight: 600;">🏷️ Категории</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${tags}
                </div>
            </div>
        `;
    }

    /**
     * Компактные особенности
     */
    renderCompactFeatures(org) {
        const features = [];

        // Извлекаем особенности из разных полей
        if (org.flags) {
            if (org.flags.wifi) features.push('📶 Wi-Fi');
            if (org.flags.parking) features.push('🅿️ Парковка');
            if (org.flags.card_payment) features.push('💳 Оплата картой');
            if (org.flags.booking) features.push('📅 Бронирование');
        }

        if (features.length === 0) return '';

        return `
            <div style="margin-bottom: 20px; padding: 16px; background: rgba(76,175,80,0.1); border-radius: 12px; border-left: 3px solid #4caf50;">
                <h4 style="color: #4caf50; font-size: 0.95rem; margin: 0 0 12px 0; font-weight: 600;">✨ Особенности</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${features.map(f => `<span style="color: #e0e0e0; font-size: 0.85rem;">${f}</span>`).join(' • ')}
                </div>
            </div>
        `;
    }

    /**
     * Компактные соцсети
     */
    renderCompactSocials(links) {
        if (!links || links.length === 0) return '';

        const socials = [];
        links.forEach(link => {
            const url = link.url || link.href || '';
            if (url.includes('vk.com')) socials.push({name: 'VK', icon: 'VK', url, color: '#4680c2'});
            if (url.includes('t.me') || url.includes('telegram')) socials.push({name: 'Telegram', icon: '✈️', url, color: '#0088cc'});
            if (url.includes('instagram')) socials.push({name: 'Instagram', icon: '📷', url, color: '#e4405f'});
            if (url.includes('youtube')) socials.push({name: 'YouTube', icon: '▶️', url, color: '#ff0000'});
        });

        if (socials.length === 0) return '';

        return `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffcc00; font-size: 0.95rem; margin: 0 0 12px 0; font-weight: 600;">📱 Мы в соцсетях</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${socials.map(s => `
                        <a href="${s.url}" target="_blank"
                           style="background: ${s.color}; color: white; padding: 8px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                            <span>${s.icon}</span>
                            <span>${s.name}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Компактные отзывы
     */
    renderCompactReviews(reviews) {
        if (!reviews || !reviews.items || reviews.items.length === 0) return '';

        const reviewsHtml = reviews.items.slice(0, 2).map(review => {
            const author = review.author?.name || 'Аноним';
            const rating = review.rating || 5;
            const text = review.text || '';

            return `
                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #2196f3;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #fff; font-weight: 600; font-size: 0.9rem;">${author}</span>
                        <span style="color: #ffcc00; font-size: 0.85rem;">${this.renderStars(rating)}</span>
                    </div>
                    ${text ? `<p style="color: #d0d0d0; font-size: 0.85rem; margin: 0; line-height: 1.4;">${text}</p>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffcc00; font-size: 0.95rem; margin: 0 0 12px 0; font-weight: 600;">💬 Отзывы</h4>
                ${reviewsHtml}
                ${reviews.items.length > 2 ? `
                    <div style="color: #64b5f6; font-size: 0.85rem; margin-top: 8px; cursor: pointer;">
                        + ещё ${reviews.items.length - 2} отзывов
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Компактные фото
     */
    renderCompactPhotos(photos) {
        if (!photos || photos.length <= 1) return '';

        const photosHtml = photos.slice(1, 5).map((photo, index) => {
            const url = photo.thumbnail_url || photo.url;
            return `
                <div style="width: 100%; padding-top: 100%; position: relative; border-radius: 8px; overflow: hidden; cursor: pointer;">
                    <img src="${url}"
                         style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
                         alt="Фото ${index + 2}">
                </div>
            `;
        }).join('');

        return `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffcc00; font-size: 0.95rem; margin: 0 0 12px 0; font-weight: 600;">📸 Фотографии (${photos.length})</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                    ${photosHtml}
                </div>
                ${photos.length > 5 ? `
                    <div style="color: #64b5f6; font-size: 0.85rem; margin-top: 8px; cursor: pointer; text-align: center;">
                        + ещё ${photos.length - 4} фото
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Дополнительная информация
     */
    renderAdditionalInfo(org) {
        const info = [];

        if (org.org) {
            if (org.org.branch_count) info.push(`Филиалов: ${org.org.branch_count}`);
            if (org.org.org_name) info.push(`Организация: ${org.org.org_name}`);
        }

        if (org.context) {
            if (org.context.text) info.push(org.context.text);
        }

        if (info.length === 0) return '';

        return `
            <div style="margin-top: 20px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                <h4 style="color: #999; font-size: 0.85rem; margin: 0 0 8px 0; font-weight: 600;">ℹ️ Дополнительно</h4>
                ${info.map(i => `<p style="color: #d0d0d0; font-size: 0.85rem; margin: 4px 0;">${i}</p>`).join('')}
            </div>
        `;
    }

    /**
     * Рендер галереи фотографий (как в 2ГИС)
     */
    renderPhotoGallery(org) {
        const photos = org.photos || [];

        if (photos.length === 0) {
            // Заглушка с иконкой категории
            const icon = this.getCategoryIcon(org);
            return `
                <div class="org-photo-placeholder">
                    <div class="photo-icon">${icon}</div>
                </div>
            `;
        }

        // Главное фото
        const mainPhoto = photos[0];
        const photoUrl = mainPhoto.url || mainPhoto.thumbnail_url;

        return `
            <div class="org-photo-gallery">
                <div class="photo-main" style="background-image: url('${photoUrl}')">
                    <div class="photo-controls">
                        <button class="photo-btn photo-prev">‹</button>
                        <button class="photo-btn photo-next">›</button>
                    </div>
                    <div class="photo-counter">
                        <span class="photo-current">1</span> / <span class="photo-total">${photos.length}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Рендер шапки с названием и рейтингом
     */
    renderHeader(org) {
        const name = org.name || 'Организация';
        const category = org.purpose_name || org.rubrics?.[0]?.name || 'Место';
        const rating = org.reviews?.general_rating || 0;
        const reviewCount = org.reviews?.general_review_count || 0;

        return `
            <div class="org-header-content">
                <h2 class="org-name">${name}</h2>
                <p class="org-category">${category}</p>

                ${rating > 0 ? `
                    <div class="org-rating-block">
                        <div class="rating-stars">${this.renderStars(rating)}</div>
                        <span class="rating-value">${rating.toFixed(1)}</span>
                        <span class="rating-count">${reviewCount} отзывов</span>
                    </div>
                ` : ''}

                <div class="org-address">
                    <span class="address-icon">📍</span>
                    <span class="address-text">${org.address?.name || 'Адрес не указан'}</span>
                </div>
            </div>
        `;
    }

    /**
     * Рендер табов
     */
    renderTabs() {
        return `
            <div class="tab-list">
                <button class="tab-btn active" data-tab="contacts">Контакты</button>
                <button class="tab-btn" data-tab="info">Инфо</button>
                <button class="tab-btn" data-tab="reviews">Отзывы</button>
                <button class="tab-btn" data-tab="photos">Фото</button>
            </div>
        `;
    }

    /**
     * Таб: Контакты
     */
    renderContactsTab(org) {
        let html = `<div class="tab-content-scroll">`;

        // График работы
        if (org.schedule) {
            html += this.renderWorkingHours(org.schedule);
        }

        // Контактная информация
        if (org.contact_groups && org.contact_groups.length > 0) {
            html += `<div class="org-section">`;
            html += `<h3 class="section-title">Контакты</h3>`;

            org.contact_groups.forEach(group => {
                if (group.contacts) {
                    group.contacts.forEach(contact => {
                        html += this.renderContactItem(contact);
                    });
                }
            });

            html += `</div>`;
        }

        // Социальные сети и мессенджеры
        if (org.links || org.external_content) {
            html += this.renderSocialLinks(org);
        }

        html += `</div>`;
        return html;
    }

    /**
     * График работы
     */
    renderWorkingHours(schedule) {
        if (!schedule.working_hours || schedule.working_hours.length === 0) {
            return '';
        }

        const isOpenNow = this.checkIfOpenNow(schedule);
        const statusClass = isOpenNow ? 'status-open' : 'status-closed';
        const statusText = isOpenNow ? 'Открыто' : 'Закрыто';

        let html = `
            <div class="org-section working-hours">
                <div class="work-status ${statusClass}">
                    <span class="status-icon">🕒</span>
                    <span class="status-text">${statusText}</span>
                </div>
                <div class="hours-list">
        `;

        schedule.working_hours.forEach(day => {
            const dayName = day.day_name || '';
            const periods = day.working_time_periods || [];

            let timeStr = 'Закрыто';
            if (periods.length > 0) {
                timeStr = periods.map(p => `${p.time_from}-${p.time_to}`).join(', ');
            }

            html += `
                <div class="hours-row">
                    <span class="day-name">${dayName}</span>
                    <span class="day-hours">${timeStr}</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Контактный элемент
     */
    renderContactItem(contact) {
        let icon = '📞';
        let value = contact.value;
        let clickable = false;

        switch (contact.type) {
            case 'phone':
                icon = '📞';
                clickable = true;
                value = `<a href="tel:${contact.value}">${contact.value}</a>`;
                break;
            case 'website':
                icon = '🌐';
                clickable = true;
                value = `<a href="${contact.value}" target="_blank">${contact.value}</a>`;
                break;
            case 'email':
                icon = '📧';
                clickable = true;
                value = `<a href="mailto:${contact.value}">${contact.value}</a>`;
                break;
        }

        return `
            <div class="contact-item ${clickable ? 'clickable' : ''}">
                <span class="contact-icon">${icon}</span>
                <span class="contact-value">${value}</span>
            </div>
        `;
    }

    /**
     * Социальные сети
     */
    renderSocialLinks(org) {
        // Попытка извлечь ссылки на соцсети
        const links = org.links || [];
        const socials = [];

        // Парсим известные соцсети
        links.forEach(link => {
            const url = link.url || link.href || '';
            if (url.includes('vk.com')) socials.push({name: 'ВКонтакте', icon: 'VK', url, color: '#4680c2'});
            if (url.includes('t.me') || url.includes('telegram')) socials.push({name: 'Telegram', icon: '✈️', url, color: '#0088cc'});
            if (url.includes('instagram')) socials.push({name: 'Instagram', icon: '📷', url, color: '#e4405f'});
            if (url.includes('youtube')) socials.push({name: 'YouTube', icon: '▶️', url, color: '#ff0000'});
            if (url.includes('ok.ru')) socials.push({name: 'Одноклассники', icon: 'OK', url, color: '#ee8208'});
        });

        if (socials.length === 0) return '';

        let html = `
            <div class="org-section">
                <h3 class="section-title">Мы в соцсетях</h3>
                <div class="social-links">
        `;

        socials.forEach(social => {
            html += `
                <a href="${social.url}" target="_blank" class="social-btn" style="background-color: ${social.color}">
                    <span class="social-icon">${social.icon}</span>
                    <span class="social-name">${social.name}</span>
                </a>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Таб: Инфо
     */
    renderInfoTab(org) {
        let html = `<div class="tab-content-scroll">`;

        // Описание
        if (org.description) {
            html += `
                <div class="org-section">
                    <h3 class="section-title">Описание</h3>
                    <p class="org-description">${org.description}</p>
                </div>
            `;
        }

        // Категории и рубрики
        if (org.rubrics && org.rubrics.length > 0) {
            html += `
                <div class="org-section">
                    <h3 class="section-title">Категории</h3>
                    <div class="categories-list">
            `;

            org.rubrics.forEach(rubric => {
                html += `<span class="category-tag">${rubric.name}</span>`;
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Особенности (Wi-Fi, парковка и т.д.)
        if (org.flags) {
            html += this.renderFeatures(org.flags);
        }

        html += `</div>`;
        return html;
    }

    /**
     * Таб: Отзывы
     */
    renderReviewsTab(org) {
        const reviews = org.reviews?.items || [];
        const rating = org.reviews?.general_rating || 0;
        const reviewCount = org.reviews?.general_review_count || 0;

        let html = `<div class="tab-content-scroll">`;

        // Общая статистика
        if (rating > 0) {
            html += `
                <div class="reviews-summary">
                    <div class="summary-rating">
                        <div class="big-rating">${rating.toFixed(1)}</div>
                        <div class="rating-stars">${this.renderStars(rating)}</div>
                        <div class="rating-text">${reviewCount} оценок</div>
                    </div>
                </div>
            `;
        }

        // Список отзывов
        if (reviews.length > 0) {
            html += `<div class="reviews-list">`;

            reviews.forEach(review => {
                html += this.renderReviewItem(review);
            });

            html += `</div>`;
        } else {
            html += `
                <div class="no-reviews">
                    <p>Пока нет отзывов</p>
                    <p class="text-muted">Будьте первым, кто оставит отзыв!</p>
                </div>
            `;
        }

        html += `</div>`;
        return html;
    }

    /**
     * Отзыв
     */
    renderReviewItem(review) {
        const author = review.author?.name || 'Аноним';
        const rating = review.rating || 5;
        const text = review.text || '';
        const date = this.formatDate(review.date_created);

        return `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">
                        <div class="author-avatar">${author.charAt(0).toUpperCase()}</div>
                        <div class="author-info">
                            <div class="author-name">${author}</div>
                            <div class="review-date">${date}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${this.renderStars(rating)}
                    </div>
                </div>
                ${text ? `<p class="review-text">${text}</p>` : ''}
            </div>
        `;
    }

    /**
     * Таб: Фото
     */
    renderPhotosTab(org) {
        const photos = org.photos || [];

        if (photos.length === 0) {
            return `
                <div class="no-photos">
                    <p>Нет фотографий</p>
                </div>
            `;
        }

        let html = `<div class="photos-grid">`;

        photos.forEach((photo, index) => {
            const url = photo.thumbnail_url || photo.url;
            html += `
                <div class="photo-item" data-index="${index}" onclick="orgCard.openPhotoViewer(${index})">
                    <img src="${url}" alt="Фото ${index + 1}" loading="lazy">
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    /**
     * Кнопки действий
     */
    renderActionButtons(org) {
        return `
            <div class="org-actions">
                <button class="action-btn btn-primary" onclick="orgCard.buildRoute()">
                    <span class="btn-icon">🗺️</span>
                    <span>Построить маршрут</span>
                </button>
                <button class="action-btn btn-secondary" onclick="orgCard.shareOrg()">
                    <span class="btn-icon">📤</span>
                    <span>Поделиться</span>
                </button>
            </div>
        `;
    }

    // ============= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =============

    /**
     * Рендер звезд рейтинга
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

        return '★'.repeat(fullStars) +
               (hasHalf ? '☆' : '') +
               '☆'.repeat(emptyStars);
    }

    /**
     * Получить иконку категории
     */
    getCategoryIcon(org) {
        const category = (org.purpose_name || org.rubrics?.[0]?.name || '').toLowerCase();

        if (category.includes('кафе') || category.includes('ресторан')) return '🍽️';
        if (category.includes('магазин') || category.includes('супермаркет')) return '🛒';
        if (category.includes('банк')) return '🏦';
        if (category.includes('больница') || category.includes('медицин')) return '🏥';
        if (category.includes('аптека')) return '💊';
        if (category.includes('фитнес') || category.includes('спорт')) return '💪';
        if (category.includes('школа') || category.includes('универ')) return '🎓';
        if (category.includes('гостиница') || category.includes('отель')) return '🏨';
        if (category.includes('парк')) return '🌳';

        return '🏢';
    }

    /**
     * Проверить открыто ли сейчас
     */
    checkIfOpenNow(schedule) {
        // Упрощенная проверка
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours * 60 + minutes;

        if (!schedule.working_hours) return false;

        const todaySchedule = schedule.working_hours.find(day => {
            // Упрощенное сопоставление дня недели
            return true; // TODO: правильная проверка
        });

        return true; // Временно возвращаем true
    }

    /**
     * Форматировать дату
     */
    formatDate(dateString) {
        if (!dateString) return 'Недавно';

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Сегодня';
            if (diffDays === 1) return 'Вчера';
            if (diffDays < 7) return `${diffDays} дней назад`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`;

            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return 'Недавно';
        }
    }

    /**
     * Показать состояние загрузки
     */
    showLoadingState(container) {
        container.innerHTML = `
            <div class="org-card-loading">
                <div class="loading-spinner"></div>
                <p>Загружаем информацию...</p>
            </div>
        `;
    }

    /**
     * Показать ошибку
     */
    showErrorState(container, message) {
        container.innerHTML = `
            <div class="org-card-error">
                <p class="error-icon">⚠️</p>
                <p class="error-message">${message}</p>
                <button class="btn-retry" onclick="location.reload()">Попробовать снова</button>
            </div>
        `;
    }

    /**
     * Инициализация интерактивности
     */
    initializeCardInteractions(container, org) {
        // Табы
        const tabButtons = container.querySelectorAll('.tab-btn');
        const tabPanes = container.querySelectorAll('.org-tab-pane');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;

                // Убираем активность со всех
                tabButtons.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));

                // Добавляем на текущие
                btn.classList.add('active');
                container.querySelector(`.org-tab-pane[data-tab="${targetTab}"]`).classList.add('active');
            });
        });

        // Галерея фото
        this.initPhotoGallery(container, org);
    }

    /**
     * Инициализация галереи
     */
    initPhotoGallery(container, org) {
        const photos = org.photos || [];
        if (photos.length === 0) return;

        let currentPhotoIndex = 0;
        const prevBtn = container.querySelector('.photo-prev');
        const nextBtn = container.querySelector('.photo-next');
        const photoMain = container.querySelector('.photo-main');
        const currentCounter = container.querySelector('.photo-current');

        const updatePhoto = (index) => {
            currentPhotoIndex = index;
            const photo = photos[index];
            const url = photo.url || photo.thumbnail_url;
            photoMain.style.backgroundImage = `url('${url}')`;
            if (currentCounter) currentCounter.textContent = index + 1;
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const newIndex = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : photos.length - 1;
                updatePhoto(newIndex);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const newIndex = currentPhotoIndex < photos.length - 1 ? currentPhotoIndex + 1 : 0;
                updatePhoto(newIndex);
            });
        }
    }

    /**
     * Построить маршрут
     */
    buildRoute() {
        alert('Функция построения маршрута будет добавлена');
    }

    /**
     * Поделиться
     */
    shareOrg() {
        if (navigator.share) {
            navigator.share({
                title: 'Организация',
                text: 'Посмотри эту организацию',
            });
        } else {
            alert('Функция поделиться не поддерживается');
        }
    }
}

// Глобальная инициализация
window.orgCard = new Organization2GISCard('8a7c9b28-b45f-4f45-9784-d34db72416db');

console.log('🏢 Модуль полной карточки организации 2GIS загружен');
