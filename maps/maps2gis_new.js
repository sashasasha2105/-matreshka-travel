/**
 * 🗺️ НОВЫЙ модуль карт 2GIS - ПРАВИЛЬНАЯ ИНТЕГРАЦИЯ ПО ДОКУМЕНТАЦИИ
 * Полностью переписан согласно официальной документации 2GIS MapGL API
 */

class Matryoshka2GISMaps {
    constructor() {
        this.apiKey = '8a7c9b28-b45f-4f45-9784-d34db72416db';
        this.mapInstance = null;
        this.markers = [];
        this.currentPopup = null;
        this.currentRegionData = null;

        // API endpoints согласно документации
        this.placesApiUrl = 'https://catalog.api.2gis.com/3.0/items';
        this.searchApiUrl = 'https://catalog.api.2gis.com/3.0/items';

        this.init();
    }

    /**
     * Инициализация модуля
     */
    async init() {
        console.log('🚀 Инициализация нового модуля 2GIS Maps...');

        // Проверяем поддержку браузера
        if (typeof mapgl !== 'undefined' && mapgl.isSupported()) {
            console.log('✅ Браузер поддерживает MapGL API');
        } else {
            console.warn('⚠️ Браузер может не поддерживать все функции MapGL');
        }

        // Загружаем MapGL API если не загружен
        await this.loadMapGLAPI();
    }

    /**
     * Загрузка MapGL API
     */
    async loadMapGLAPI() {
        return new Promise((resolve, reject) => {
            if (typeof mapgl !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://mapgl.2gis.com/api/js/v1';
            script.onload = () => {
                console.log('✅ MapGL API загружен');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Ошибка загрузки MapGL API');
                reject(new Error('Failed to load MapGL API'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Создание карты для региона
     */
    async createMap(regionData, containerId) {
        console.log('🗺️ Создание карты для региона:', regionData.name);

        this.currentRegionData = regionData;
        const container = document.getElementById(containerId);

        if (!container) {
            throw new Error(`Контейнер ${containerId} не найден`);
        }

        // Очищаем контейнер
        container.innerHTML = '';

        // Получаем центр региона
        const center = this.getRegionCenter(regionData.id);

        try {
            // СНАЧАЛА создаем структуру интерфейса
            this.createMapStructure(container, regionData);

            // Получаем div для карты
            const mapDiv = document.getElementById('map2gisCanvas');
            if (!mapDiv) {
                throw new Error('Map canvas div не найден');
            }

            // ЗАТЕМ создаем карту в правильном div
            this.mapInstance = new mapgl.Map(mapDiv, {
                center: [center.coordinates[0], center.coordinates[1]],
                zoom: center.zoom,
                key: this.apiKey,
                style: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b', // Стиль карты 2GIS
            });

            // Ждем загрузки карты
            await this.waitForMapReady();

            // Настраиваем обработчики событий
            this.setupEventHandlers();

            // Загружаем достопримечательности
            await this.loadRegionAttractions(regionData);

            // АВТОМАТИЧЕСКИ загружаем популярные места для клика
            await this.loadPopularPlaces(regionData.name);

            console.log('✅ Карта успешно создана');

        } catch (error) {
            console.error('❌ Ошибка создания карты:', error);
            this.createFallbackInterface(container, regionData);
        }
    }

    /**
     * Ожидание готовности карты
     */
    waitForMapReady() {
        return new Promise((resolve) => {
            if (this.mapInstance) {
                this.mapInstance.on('ready', () => {
                    console.log('🎯 Карта готова к использованию');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Создание структуры карты (ДО создания самой карты)
     */
    createMapStructure(container, regionData) {
        // Создаем контейнер с flex-раскладкой
        container.style.display = 'flex';
        container.style.height = '500px';
        container.style.position = 'relative';

        // Создаем боковую панель
        const sidebar = document.createElement('div');
        sidebar.className = 'map-sidebar';
        sidebar.id = 'mapSidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h2 class="region-title">${regionData.name}</h2>
            </div>
            <div class="sidebar-content" id="sidebarContent">
                <div class="welcome-message" style="padding: 20px; text-align: center; color: rgba(255,255,255,0.6);">
                    <p style="font-size: 0.95rem;">Достопримечательности и места на карте</p>
                </div>
            </div>
        `;

        // Создаем div для карты
        const mapDiv = document.createElement('div');
        mapDiv.id = 'map2gisCanvas';
        mapDiv.style.flex = '1';
        mapDiv.style.position = 'relative';
        mapDiv.style.minHeight = '500px';
        mapDiv.style.zIndex = '1'; // Важно для интерактивности

        // Добавляем элементы в контейнер
        container.appendChild(sidebar);
        container.appendChild(mapDiv);

        console.log('✅ Структура карты создана');
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventHandlers() {
        // Поиск удален
        console.log('✅ Event handlers setup completed');


        // Обработчик кликов по карте
        if (this.mapInstance) {
            this.mapInstance.on('click', (event) => {
                console.log('🖱️ Клик по карте detected:', event);
                this.handleMapClick(event);
            });

            // Дополнительные события для диагностики
            this.mapInstance.on('ready', () => {
                console.log('🗺️ Карта полностью готова к взаимодействию');
            });

            this.mapInstance.on('idle', () => {
                console.log('🔄 Карта в состоянии покоя - готова к кликам');
            });
        }
    }

    /**
     * Поиск мест
     */
    async performSearch() {
        const searchInput = document.getElementById('placeSearch');
        const query = searchInput?.value?.trim();

        if (!query) {
            this.showMessage('Введите поисковый запрос');
            return;
        }

        console.log('🔍 Поиск:', query);
        this.showLoading('Поиск мест...');

        try {
            const results = await this.searchPlaces(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('❌ Ошибка поиска:', error);
            this.showMessage('Ошибка поиска. Попробуйте снова.');
        }
    }

    /**
     * Поиск мест через API согласно документации
     */
    async searchPlaces(query) {
        const center = this.mapInstance.getCenter();

        // Формируем запрос согласно документации Places API
        const params = new URLSearchParams({
            q: query,
            key: this.apiKey,
            point: `${center[0]},${center[1]}`,
            radius: 10000, // 10 км радиус
            page_size: 20,
            fields: 'items.point,items.name,items.purpose_name,items.address,items.contact_groups,items.schedule,items.reviews,items.photos'
        });

        const url = `${this.searchApiUrl}?${params}`;
        console.log('📡 API запрос:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Ответ API:', data);

        return data.result?.items || [];
    }

    /**
     * Отображение результатов поиска
     */
    displaySearchResults(results) {
        const sidebarContent = document.getElementById('sidebarContent');

        if (results.length === 0) {
            sidebarContent.innerHTML = `
                <div class="no-results">
                    <h3>🔍 Ничего не найдено</h3>
                    <p>Попробуйте изменить поисковый запрос</p>
                </div>
            `;
            return;
        }

        console.log(`📍 Добавляем ${results.length} маркеров на карту`);

        // Очищаем предыдущие маркеры
        this.clearMarkers();

        const resultsHtml = results.map((place, index) => {
            // Добавляем маркер на карту ТОЛЬКО если есть координаты
            if (place.point) {
                console.log(`✅ Добавляем маркер для: ${place.name}`, place.point);
                this.addPlaceMarker(place, index);
            } else {
                console.warn(`⚠️ Нет координат для: ${place.name}`);
            }

            const rating = place.reviews?.general_rating || 0;
            const reviewCount = place.reviews?.general_review_count || 0;

            return `
                <div class="search-result-item" onclick="window.matryoshka2GIS.showPlaceDetails('${place.id}', ${index})">
                    <div class="result-header">
                        <span class="result-number">${index + 1}</span>
                        <div class="result-info">
                            <h4 class="result-name">${place.name}</h4>
                            <p class="result-type">${place.purpose_name || 'Заведение'}</p>
                        </div>
                    </div>
                    <div class="result-details">
                        <p class="result-address">📍 ${place.address_name || place.address?.name || 'Адрес не указан'}</p>
                        ${rating > 0 ? `
                            <div class="result-rating">
                                <span class="stars">${this.generateStars(rating)}</span>
                                <span class="rating-text">${rating.toFixed(1)} (${reviewCount} отзывов)</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        sidebarContent.innerHTML = `
            <div class="search-results">
                <div class="results-header">
                    <h3>🎯 Найдено: ${results.length}</h3>
                    <button onclick="window.matryoshka2GIS.clearSearch()" class="clear-btn">Очистить</button>
                </div>
                <div class="results-list">
                    ${resultsHtml}
                </div>
            </div>
        `;

        // Сохраняем результаты
        this.currentSearchResults = results;

        console.log(`✅ Создано маркеров: ${this.markers.length}`);
        console.log(`💡 Подсказка: Кликните на маркер (кружок с номером) на карте`);
    }

    /**
     * Добавление маркера места на карту
     */
    addPlaceMarker(place, index) {
        if (!place.point || !this.mapInstance) return;

        const coordinates = [place.point.lon, place.point.lat];

        // Создаем элемент маркера
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.innerHTML = `
            <div class="marker-pin">
                <span class="marker-number">${index + 1}</span>
            </div>
        `;

        // ВАЖНО: делаем маркер интерактивным ДО создания маркера
        markerElement.style.pointerEvents = 'auto';
        markerElement.style.cursor = 'pointer';
        markerElement.style.position = 'absolute';
        markerElement.style.zIndex = '1000';
        markerElement.style.touchAction = 'auto';

        // Создаем маркер согласно документации
        const marker = new mapgl.Marker(this.mapInstance, {
            coordinates: coordinates,
            element: markerElement,
        });

        // Сохраняем данные места в элементе для доступа
        markerElement.dataset.placeId = place.id;
        markerElement.dataset.placeIndex = index;
        markerElement.dataset.placeName = place.name;

        // Добавляем обработчик клика на сам элемент и внутренние элементы
        const clickHandler = (e) => {
            console.log('🎯 КЛИК ПО МАРКЕРУ!', {place: place.name, index, id: place.id});
            e.stopPropagation();
            e.preventDefault();
            this.showPlaceDetails(place.id, index);
        };

        markerElement.addEventListener('click', clickHandler, true);
        markerElement.addEventListener('touchend', clickHandler, true);

        // Также добавляем на внутренние элементы
        const markerPin = markerElement.querySelector('.marker-pin');
        if (markerPin) {
            markerPin.addEventListener('click', clickHandler, true);
            markerPin.addEventListener('touchend', clickHandler, true);
            markerPin.style.pointerEvents = 'auto';
            markerPin.style.cursor = 'pointer';
        }

        const markerNumber = markerElement.querySelector('.marker-number');
        if (markerNumber) {
            markerNumber.addEventListener('click', clickHandler, true);
            markerNumber.addEventListener('touchend', clickHandler, true);
            markerNumber.style.pointerEvents = 'auto';
            markerNumber.style.cursor = 'pointer';
        }

        // Добавляем hover эффект для лучшей видимости
        markerElement.addEventListener('mouseenter', () => {
            markerElement.style.transform = 'scale(1.15)';
            markerElement.style.zIndex = '10000';
            console.log('🔍 Hover на маркере:', place.name);
        });

        markerElement.addEventListener('mouseleave', () => {
            markerElement.style.transform = 'scale(1)';
            markerElement.style.zIndex = '1000';
        });

        // Сохраняем маркер с данными
        marker.placeData = place;
        marker.placeIndex = index;

        this.markers.push(marker);
        return marker;
    }

    /**
     * Показ детальной информации о месте
     */
    async showPlaceDetails(placeId, index) {
        console.log('🎯 showPlaceDetails вызвана!', {placeId, index});

        const sidebarContent = document.getElementById('sidebarContent');
        if (!sidebarContent) {
            console.error('❌ sidebarContent не найден!');
            return;
        }

        try {
            console.log('✅ Начинаем загрузку карточки...');

            // Используем ПОЛНУЮ карточку организации
            if (window.orgCard) {
                console.log('✅ Модуль orgCard найден, загружаем карточку...');
                await window.orgCard.showFullCard(placeId, sidebarContent);
            } else {
                console.warn('⚠️ Модуль orgCard НЕ найден, используем fallback');
                // Fallback к старому методу
                this.showLoading('Загружаем информацию...');
                const placeData = await this.getPlaceDetails(placeId);
                this.displayPlaceDetails(placeData, index);
            }

            // Центрируем карту на месте
            const placeData = await this.getPlaceDetails(placeId);
            if (placeData.point && this.mapInstance) {
                this.mapInstance.setCenter([placeData.point.lon, placeData.point.lat]);
                this.mapInstance.setZoom(16);
                console.log('✅ Карта центрирована на организации');
            }

        } catch (error) {
            console.error('❌ Ошибка получения деталей:', error);
            this.showMessage('Ошибка загрузки информации: ' + error.message);
        }
    }

    /**
     * Получение детальной информации о месте
     */
    async getPlaceDetails(placeId) {
        const params = new URLSearchParams({
            id: placeId,
            key: this.apiKey,
            fields: 'items.name,items.purpose_name,items.address,items.point,items.contact_groups,items.schedule,items.reviews,items.photos,items.description'
        });

        const url = `${this.placesApiUrl}?${params}`;
        console.log('📡 Запрос деталей:', url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.result?.items?.[0] || null;
    }

    /**
     * Отображение детальной информации о месте
     */
    displayPlaceDetails(place, index) {
        if (!place) {
            this.showMessage('Информация о месте не найдена');
            return;
        }

        const sidebarContent = document.getElementById('sidebarContent');
        const rating = place.reviews?.general_rating || 0;
        const reviewCount = place.reviews?.general_review_count || 0;

        sidebarContent.innerHTML = `
            <div class="place-details">
                <div class="details-header">
                    <button onclick="matryoshka2GIS.goBackToResults()" class="back-btn">← Назад</button>
                    <span class="place-number">#${index + 1}</span>
                </div>

                <div class="place-info">
                    <h2 class="place-name">${place.name}</h2>
                    <p class="place-type">${place.purpose_name || 'Заведение'}</p>
                    <p class="place-address">📍 ${place.address?.name || 'Адрес не указан'}</p>

                    ${rating > 0 ? `
                        <div class="place-rating">
                            <div class="rating-display">
                                <span class="stars">${this.generateStars(rating)}</span>
                                <span class="rating-value">${rating.toFixed(1)}</span>
                                <span class="rating-count">(${reviewCount} отзывов)</span>
                            </div>
                        </div>
                    ` : ''}
                </div>

                ${place.description ? `
                    <div class="place-description">
                        <h4>📝 Описание</h4>
                        <p>${place.description}</p>
                    </div>
                ` : ''}

                ${this.renderContactInfo(place.contact_groups)}
                ${this.renderSchedule(place.schedule)}
                ${this.renderPhotos(place.photos)}
                ${this.renderReviews(place.reviews)}

                <div class="place-actions">
                    <button onclick="matryoshka2GIS.copyCoordinates(${place.point?.lat}, ${place.point?.lon})" class="action-btn">
                        📋 Копировать координаты
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Рендер контактной информации
     */
    renderContactInfo(contactGroups) {
        if (!contactGroups || contactGroups.length === 0) return '';

        const contacts = contactGroups.flatMap(group => group.contacts || []);
        if (contacts.length === 0) return '';

        const contactsHtml = contacts.map(contact => {
            switch (contact.type) {
                case 'phone':
                    return `<div class="contact-item">📞 ${contact.value}</div>`;
                case 'website':
                    return `<div class="contact-item">🌐 ${contact.value}</div>`;
                case 'email':
                    return `<div class="contact-item">📧 ${contact.value}</div>`;
                default:
                    return `<div class="contact-item">${contact.value}</div>`;
            }
        }).join('');

        return `
            <div class="place-contacts">
                <h4>📞 Контакты</h4>
                ${contactsHtml}
            </div>
        `;
    }

    /**
     * Рендер расписания
     */
    renderSchedule(schedule) {
        if (!schedule || !schedule.working_hours) return '';

        return `
            <div class="place-schedule">
                <h4>🕒 Время работы</h4>
                <div class="schedule-info">
                    ${schedule.working_hours.map(hours => `
                        <div class="schedule-day">
                            <span class="day">${hours.day_name}</span>
                            <span class="time">${hours.working_time_periods?.map(p => `${p.time_from}-${p.time_to}`).join(', ') || 'Закрыто'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Рендер фотографий
     */
    renderPhotos(photos) {
        if (!photos || photos.length === 0) return '';

        return `
            <div class="place-photos">
                <h4>📸 Фотографии</h4>
                <div class="photos-grid">
                    ${photos.slice(0, 6).map(photo => `
                        <img src="${photo.thumbnail_url || photo.url}" alt="Фото" class="place-photo">
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Рендер отзывов
     */
    renderReviews(reviews) {
        if (!reviews || !reviews.items || reviews.items.length === 0) return '';

        return `
            <div class="place-reviews">
                <h4>💬 Отзывы</h4>
                <div class="reviews-list">
                    ${reviews.items.slice(0, 3).map(review => `
                        <div class="review-item">
                            <div class="review-header">
                                <span class="review-author">${review.author?.name || 'Аноним'}</span>
                                <span class="review-rating">${this.generateStars(review.rating || 5)}</span>
                            </div>
                            <p class="review-text">${review.text || 'Отличное место!'}</p>
                            <span class="review-date">${this.formatDate(review.date_created)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Загрузка достопримечательностей региона
     */
    async loadRegionAttractions(regionData) {
        console.log('🏛️ Загружаем достопримечательности для:', regionData.name);

        if (!regionData.attractions) return;

        // Добавляем маркеры достопримечательностей
        regionData.attractions.forEach((attraction, index) => {
            this.addAttractionMarker(attraction, index);
        });
    }

    /**
     * Добавление маркера достопримечательности
     */
    async addAttractionMarker(attraction, index) {
        try {
            // Пытаемся найти координаты через поиск
            const coordinates = await this.findAttractionCoordinates(attraction.name, this.currentRegionData.name);

            if (coordinates) {
                const markerElement = document.createElement('div');
                markerElement.className = 'attraction-marker';
                markerElement.innerHTML = `
                    <div class="marker-pin attraction-pin">
                        <span class="marker-icon">🏛️</span>
                    </div>
                `;

                const marker = new mapgl.Marker(this.mapInstance, {
                    coordinates: coordinates,
                    element: markerElement,
                });

                markerElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showAttractionInfo(attraction, coordinates);
                });

                this.markers.push(marker);
            }
        } catch (error) {
            console.warn('⚠️ Не удалось найти координаты для:', attraction.name);
        }
    }

    /**
     * Поиск координат достопримечательности
     */
    async findAttractionCoordinates(name, city) {
        try {
            const results = await this.searchPlaces(`${name} ${city}`);
            if (results.length > 0 && results[0].point) {
                return [results[0].point.lon, results[0].point.lat];
            }
        } catch (error) {
            console.warn('Не удалось найти координаты:', error);
        }
        return null;
    }

    /**
     * Показ информации о достопримечательности
     */
    showAttractionInfo(attraction, coordinates) {
        const sidebarContent = document.getElementById('sidebarContent');

        sidebarContent.innerHTML = `
            <div class="attraction-info">
                <h2 class="attraction-name">🏛️ ${attraction.name}</h2>
                <p class="attraction-description">${attraction.info}</p>

                <div class="attraction-actions">
                    <button onclick="matryoshka2GIS.centerOnCoordinates(${coordinates[0]}, ${coordinates[1]})" class="action-btn">
                        🎯 Показать на карте
                    </button>
                    <button onclick="matryoshka2GIS.searchNearPlace('${attraction.name}')" class="action-btn">
                        🔍 Найти в 2ГИС
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Автоматическая загрузка популярных мест для клика
     */
    async loadPopularPlaces(cityName) {
        console.log('🏢 Автоматически загружаем популярные места для:', cityName);

        const popularQueries = {
            'Москва': ['кремль', 'красная площадь', 'третьяковская галерея', 'большой театр', 'парк горького'],
            'Санкт-Петербург': ['эрмитаж', 'дворцовая площадь', 'петропавловская крепость', 'исаакиевский собор', 'невский проспект'],
            'Казань': ['казанский кремль', 'мечеть кул шариф', 'улица баумана', 'дворец земледельцев'],
            'Сочи': ['олимпийский парк', 'роза хутор', 'дендрарий', 'морской вокзал'],
            'Екатеринбург': ['храм на крови', 'плотинка', 'ельцин центр', 'площадь 1905 года']
        };

        const queries = popularQueries[cityName] || ['достопримечательности', 'музеи', 'парки'];

        try {
            // Загружаем по одному популярному запросу чтобы не перегружать
            const results = await this.searchPlaces(queries[0]);

            if (results.length > 0) {
                console.log(`✅ Загружено ${results.length} популярных мест для клика`);

                // Показываем результаты в sidebar
                this.displaySearchResults(results);

                // Уведомляем пользователя
                setTimeout(() => {
                    this.showToast(`🎯 Загружено ${results.length} популярных мест! Кликайте по маркерам.`);
                }, 1000);
            }
        } catch (error) {
            console.warn('⚠️ Не удалось загрузить популярные места:', error);
        }
    }

    /**
     * Центрирование карты на координатах
     */
    centerOnCoordinates(lon, lat) {
        if (this.mapInstance) {
            this.mapInstance.setCenter([lon, lat]);
            this.mapInstance.setZoom(16);
        }
    }

    /**
     * Поиск места в 2ГИС
     */
    async searchNearPlace(name) {
        const searchInput = document.getElementById('placeSearch');
        if (searchInput) {
            searchInput.value = name;
            this.performSearch();
        }
    }

    /**
     * Обработка клика по карте
     */
    async handleMapClick(event) {
        const coordinates = event.lngLat;
        console.log('🗺️ Клик по карте:', coordinates);

        // ОТКЛЮЧЕНО - не показываем координаты, только маркеры кликабельны
        // this.showLocationInfo(coordinates);
    }

    /**
     * Показ информации о локации
     */
    showLocationInfo(coordinates) {
        const sidebarContent = document.getElementById('sidebarContent');

        sidebarContent.innerHTML = `
            <div class="location-info">
                <h3>📍 Выбранная точка</h3>
                <div class="coordinates">
                    <p><strong>Широта:</strong> ${coordinates[1].toFixed(6)}</p>
                    <p><strong>Долгота:</strong> ${coordinates[0].toFixed(6)}</p>
                </div>

                <div class="location-actions">
                    <button onclick="matryoshka2GIS.copyCoordinates(${coordinates[1]}, ${coordinates[0]})" class="action-btn">
                        📋 Копировать координаты
                    </button>
                    <button onclick="matryoshka2GIS.searchNearbyFromPoint(${coordinates[0]}, ${coordinates[1]})" class="action-btn">
                        🔍 Поиск рядом
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Поиск рядом с точкой
     */
    async searchNearbyFromPoint(lon, lat) {
        const searchInput = document.getElementById('placeSearch');
        if (searchInput) {
            searchInput.value = 'кафе';

            // Обновляем центр карты
            this.mapInstance.setCenter([lon, lat]);

            this.performSearch();
        }
    }

    // =============== УТИЛИТЫ ===============

    /**
     * Генерация звезд рейтинга
     */
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return '★'.repeat(fullStars) +
               (hasHalfStar ? '☆' : '') +
               '☆'.repeat(emptyStars);
    }

    /**
     * Форматирование даты
     */
    formatDate(dateString) {
        if (!dateString) return 'Недавно';
        try {
            const date = new Date(dateString);
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
     * Копирование координат
     */
    copyCoordinates(lat, lon) {
        const text = `${lat}, ${lon}`;
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Координаты скопированы!');
        }).catch(() => {
            prompt('Координаты:', text);
        });
    }

    /**
     * Показ уведомления
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    /**
     * Показ загрузки
     */
    showLoading(message) {
        const sidebarContent = document.getElementById('sidebarContent');
        sidebarContent.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Показ сообщения
     */
    showMessage(message) {
        const sidebarContent = document.getElementById('sidebarContent');
        sidebarContent.innerHTML = `
            <div class="message-state">
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Возврат к результатам поиска
     */
    goBackToResults() {
        if (this.currentSearchResults) {
            this.displaySearchResults(this.currentSearchResults);
        }
    }

    /**
     * Очистка поиска
     */
    clearSearch() {
        this.clearMarkers();
        const sidebarContent = document.getElementById('sidebarContent');
        sidebarContent.innerHTML = `
            <div class="welcome-message">
                <h3>🎯 Поиск очищен</h3>
                <p>Введите новый запрос для поиска</p>
            </div>
        `;

        const searchInput = document.getElementById('placeSearch');
        if (searchInput) {
            searchInput.value = '';
        }
    }

    /**
     * Очистка маркеров
     */
    clearMarkers() {
        this.markers.forEach(marker => {
            if (marker && marker.destroy) {
                marker.destroy();
            }
        });
        this.markers = [];
    }

    /**
     * Получение центра региона
     */
    getRegionCenter(regionId) {
        const centers = {
            'moscow': { coordinates: [37.6173, 55.7558], zoom: 11 },
            'spb': { coordinates: [30.3351, 59.9311], zoom: 11 },
            'kazan': { coordinates: [49.1221, 55.7887], zoom: 12 },
            'sochi': { coordinates: [39.7303, 43.6028], zoom: 12 },
            'ekaterinburg': { coordinates: [60.6122, 56.8431], zoom: 12 },
            'volgograd': { coordinates: [44.5133, 48.7194], zoom: 12 },
            'irkutsk': { coordinates: [104.2964, 52.2869], zoom: 12 },
            'kaliningrad': { coordinates: [20.4522, 54.7104], zoom: 12 },
            'nizhnynovgorod': { coordinates: [44.0075, 56.2965], zoom: 12 },
            'chelyabinsk': { coordinates: [61.4291, 55.1644], zoom: 12 },
            'karachaevo': { coordinates: [42.7189, 43.8489], zoom: 11 },
            'stavropol': { coordinates: [41.9734, 45.0428], zoom: 12 },
            'yaroslavl': { coordinates: [39.8739, 57.6261], zoom: 12 },
            'kostroma': { coordinates: [40.9268, 57.7675], zoom: 12 },
            'kabardino': { coordinates: [43.6178, 43.4806], zoom: 11 }
        };

        return centers[regionId] || centers['moscow'];
    }

    /**
     * Создание fallback интерфейса
     */
    createFallbackInterface(container, regionData) {
        const center = this.getRegionCenter(regionData.id);

        container.innerHTML = `
            <div style="display: flex; height: 500px;">
                <div class="map-sidebar" id="mapSidebar">
                    <div class="sidebar-header">
                        <h2>${regionData.name}</h2>
                        <p>⚠️ Использую резервный режим</p>
                    </div>
                    <div class="sidebar-content" id="sidebarContent">
                        <div class="fallback-message">
                            <h3>🗺️ Карта недоступна</h3>
                            <p>Карта отображается в базовом режиме</p>
                        </div>
                    </div>
                </div>
                <div style="flex: 1;">
                    <iframe
                        src="https://widgets.2gis.com/widget?id=DgWidget_map&opt=%7B%22pos%22%3A%7B%22lat%22%3A${center.coordinates[1]}%2C%22lon%22%3A${center.coordinates[0]}%2C%22zoom%22%3A${center.zoom}%7D%2C%22opt%22%3A%7B%22city%22%3A%22${encodeURIComponent(regionData.name)}%22%7D%7D"
                        width="100%"
                        height="100%"
                        frameborder="0"
                        style="border-radius: 0 16px 16px 0;"
                    ></iframe>
                </div>
            </div>
        `;
    }

    /**
     * Уничтожение карты
     */
    destroy() {
        this.clearMarkers();

        if (this.currentPopup) {
            this.currentPopup.destroy();
            this.currentPopup = null;
        }

        if (this.mapInstance) {
            this.mapInstance.destroy();
            this.mapInstance = null;
        }

        console.log('🗑️ Карта уничтожена');
    }
}

// Глобальная инициализация
window.matryoshka2GIS = new Matryoshka2GISMaps();

console.log('🗺️ НОВЫЙ модуль карт Матрешка 2GIS инициализирован по правильной документации');