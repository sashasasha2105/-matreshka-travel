/**
 * 🗺️ ПОЛНАЯ ИНТЕГРАЦИЯ 2ГИС - РАБОЧАЯ ВЕРСИЯ
 * Простая и понятная интеграция карт 2ГИС с полным функционалом
 */

class TwoGISIntegration {
    constructor(apiKey) {
        this.apiKey = apiKey || '20d959b9-d5ec-4578-abe3-1d414e8edfc3';
        this.map = null;
        this.markers = [];
        this.currentResults = [];

        console.log('🚀 Инициализация интеграции 2ГИС');
    }

    /**
     * Создание карты в контейнере
     */
    async createMap(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Контейнер ${containerId} не найден`);
        }

        // Параметры по умолчанию (Москва)
        const defaultOptions = {
            center: [37.6173, 55.7558],
            zoom: 11,
            cityName: 'Москва'
        };

        const config = { ...defaultOptions, ...options };

        console.log('🗺️ Создание карты с параметрами:', config);

        // Очищаем контейнер
        container.innerHTML = '';

        // Создаем структуру
        this.createMapStructure(container, config);

        // Инициализируем карту
        const mapCanvas = document.getElementById('mapCanvas');

        try {
            this.map = new mapgl.Map(mapCanvas, {
                center: config.center,
                zoom: config.zoom,
                key: this.apiKey,
            });

            console.log('✅ Карта создана успешно');

            // Ждем готовности карты
            await this.waitForMapReady();

            // Настраиваем обработчики
            this.setupEventHandlers();

            // Автопоиск популярных мест
            if (config.cityName) {
                await this.autoSearch(config.cityName);
            }

            return this.map;

        } catch (error) {
            console.error('❌ Ошибка создания карты:', error);
            throw error;
        }
    }

    /**
     * Создание HTML структуры
     */
    createMapStructure(container, config) {
        container.style.display = 'flex';
        container.style.height = '600px';
        container.style.position = 'relative';
        container.style.borderRadius = '16px';
        container.style.overflow = 'hidden';

        container.innerHTML = `
            <!-- Боковая панель -->
            <div id="sidebar" style="
                width: 380px;
                background: linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(22, 33, 62, 0.98));
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Шапка -->
                <div style="padding: 20px; border-bottom: 1px solid rgba(255, 204, 0, 0.2);">
                    <h2 style="color: #fff; margin: 0 0 16px 0; font-size: 1.4rem;">${config.cityName}</h2>

                    <!-- Поиск -->
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="searchInput" placeholder="Поиск мест..." style="
                            flex: 1;
                            padding: 12px 16px;
                            background: rgba(255,255,255,0.1);
                            border: 1px solid rgba(255,255,255,0.2);
                            border-radius: 12px;
                            color: #fff;
                            font-size: 1rem;
                        ">
                        <button id="searchBtn" style="
                            padding: 12px 20px;
                            background: linear-gradient(135deg, #ffcc00, #ff8e53);
                            border: none;
                            border-radius: 12px;
                            color: #1a1a2e;
                            font-weight: 600;
                            cursor: pointer;
                        ">🔍</button>
                    </div>
                </div>

                <!-- Контент -->
                <div id="sidebarContent" style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                ">
                    <div style="text-align: center; padding: 40px 20px; color: #d0d0d0;">
                        <h3 style="color: #fff; margin-bottom: 12px;">🎯 Добро пожаловать!</h3>
                        <p>Введите запрос в поиск или кликните на маркер</p>
                    </div>
                </div>
            </div>

            <!-- Карта -->
            <div id="mapCanvas" style="
                flex: 1;
                position: relative;
                background: #e5e3df;
            "></div>
        `;

        console.log('✅ HTML структура создана');
    }

    /**
     * Ожидание готовности карты
     */
    waitForMapReady() {
        return new Promise((resolve) => {
            if (!this.map) {
                resolve();
                return;
            }

            const checkReady = () => {
                this.map.on('idle', () => {
                    console.log('✅ Карта готова');
                    resolve();
                });
            };

            // Проверяем через небольшую задержку
            setTimeout(checkReady, 100);
        });
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventHandlers() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        console.log('✅ Обработчики событий настроены');
    }

    /**
     * Выполнение поиска
     */
    async performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput?.value?.trim();

        if (!query) {
            this.showMessage('Введите поисковый запрос');
            return;
        }

        console.log('🔍 Поиск:', query);
        this.showLoading('Поиск мест...');

        try {
            const center = this.map.getCenter();
            const results = await this.searchPlaces(query, center);

            console.log(`✅ Найдено мест: ${results.length}`);
            this.displayResults(results);

        } catch (error) {
            console.error('❌ Ошибка поиска:', error);
            this.showMessage('Ошибка поиска. Попробуйте снова.');
        }
    }

    /**
     * Автоматический поиск популярных мест
     */
    async autoSearch(cityName) {
        const queries = {
            'Москва': 'кафе',
            'Санкт-Петербург': 'кафе',
            'Казань': 'кафе',
        };

        const query = queries[cityName] || 'кафе';

        console.log(`🔍 Автопоиск: ${query}`);

        try {
            const center = this.map.getCenter();
            const results = await this.searchPlaces(query, center);

            if (results.length > 0) {
                this.displayResults(results);
                console.log(`✅ Автопоиск завершен: ${results.length} мест`);
            }
        } catch (error) {
            console.warn('⚠️ Ошибка автопоиска:', error);
        }
    }

    /**
     * Поиск мест через API 2ГИС
     */
    async searchPlaces(query, center) {
        const params = new URLSearchParams({
            q: query,
            key: this.apiKey,
            point: `${center[0]},${center[1]}`,
            radius: 10000,
            page_size: 15,
            fields: 'items.point,items.name,items.address_name,items.purpose_name,items.reviews,items.contact_groups,items.schedule,items.photos,items.description,items.rubrics'
        });

        const url = `https://catalog.api.2gis.com/3.0/items?${params}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.result?.items || [];
    }

    /**
     * Отображение результатов поиска
     */
    displayResults(results) {
        this.currentResults = results;

        // Очищаем старые маркеры
        this.clearMarkers();

        // Добавляем новые маркеры
        results.forEach((place, index) => {
            if (place.point) {
                this.addMarker(place, index);
            }
        });

        // Отображаем список
        this.renderResultsList(results);

        console.log(`✅ Отображено маркеров: ${this.markers.length}`);
    }

    /**
     * Добавление маркера на карту
     */
    addMarker(place, index) {
        if (!place.point || !this.map) return null;

        const coords = [place.point.lon, place.point.lat];

        // Создаем HTML элемент маркера
        const el = document.createElement('div');
        el.className = 'map-marker';
        el.innerHTML = `
            <div class="marker-inner">
                <span class="marker-num">${index + 1}</span>
            </div>
        `;

        // Стили маркера
        el.style.cssText = `
            cursor: pointer;
            width: 40px;
            height: 40px;
            position: absolute;
            z-index: 1000;
        `;

        const inner = el.querySelector('.marker-inner');
        inner.style.cssText = `
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #ff8e53, #ffcc00);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid #fff;
            box-shadow: 0 4px 16px rgba(255, 142, 83, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;

        const num = el.querySelector('.marker-num');
        num.style.cssText = `
            color: #1a1a2e;
            font-weight: 700;
            font-size: 14px;
            transform: rotate(45deg);
        `;

        // Создаем маркер 2ГИС
        const marker = new mapgl.Marker(this.map, {
            coordinates: coords,
            element: el
        });

        // Обработчик клика
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🎯 Клик по маркеру:', place.name);

            // Показываем кнопку перехода в 2ГИС
            this.show2GISButton(place);
        });

        // Hover эффект
        el.addEventListener('mouseenter', () => {
            inner.style.transform = 'rotate(-45deg) scale(1.2)';
            inner.style.boxShadow = '0 6px 24px rgba(255, 142, 83, 0.8)';
        });

        el.addEventListener('mouseleave', () => {
            inner.style.transform = 'rotate(-45deg) scale(1)';
            inner.style.boxShadow = '0 4px 16px rgba(255, 142, 83, 0.6)';
        });

        this.markers.push(marker);
        return marker;
    }

    /**
     * Отображение списка результатов
     */
    renderResultsList(results) {
        const content = document.getElementById('sidebarContent');

        if (results.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #d0d0d0;">
                    <h3 style="color: #fff;">🔍 Ничего не найдено</h3>
                    <p>Попробуйте изменить запрос</p>
                </div>
            `;
            return;
        }

        const items = results.map((place, index) => {
            const rating = place.reviews?.general_rating || 0;
            const reviewCount = place.reviews?.general_review_count || 0;

            return `
                <div class="result-item" data-index="${index}" style="
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    <div style="display: flex; gap: 12px;">
                        <div style="
                            background: linear-gradient(135deg, #ffcc00, #ff8e53);
                            color: #1a1a2e;
                            width: 28px;
                            height: 28px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 700;
                            font-size: 0.85rem;
                            flex-shrink: 0;
                        ">${index + 1}</div>

                        <div style="flex: 1;">
                            <h4 style="color: #fff; margin: 0 0 4px 0; font-size: 1rem;">${place.name}</h4>
                            <p style="color: #ffcc00; margin: 0 0 8px 0; font-size: 0.85rem;">${place.purpose_name || 'Место'}</p>
                            <p style="color: #d0d0d0; margin: 0; font-size: 0.85rem;">📍 ${place.address_name || place.address?.name || 'Адрес не указан'}</p>
                            ${rating > 0 ? `
                                <div style="margin-top: 8px; color: #ffcc00; font-size: 0.85rem;">
                                    ⭐ ${rating.toFixed(1)} (${reviewCount} отзывов)
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        content.innerHTML = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="color: #fff; margin: 0;">🎯 Найдено: ${results.length}</h3>
                    <button id="clearResultsBtn" style="
                        background: rgba(255,255,255,0.1);
                        border: 1px solid rgba(255,255,255,0.2);
                        color: #fff;
                        padding: 6px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.85rem;
                    ">Очистить</button>
                </div>
                ${items}
            </div>
        `;

        // Добавляем обработчики кликов через addEventListener
        const resultItems = content.querySelectorAll('.result-item');
        resultItems.forEach((item) => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                const place = results[index];
                console.log('🎯 Клик по элементу списка:', place.name);

                // Показываем кнопку перехода в 2ГИС
                this.show2GISButton(place);
            });

            // Hover эффект
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(255,255,255,0.1)';
                item.style.transform = 'translateY(-2px)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(255,255,255,0.05)';
                item.style.transform = 'translateY(0)';
            });
        });

        // Обработчик кнопки очистки
        const clearBtn = document.getElementById('clearResultsBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                console.log('🗑️ Очистка результатов');
                this.clearResults();
            });
        }

        console.log(`✅ Добавлены обработчики кликов для ${resultItems.length} элементов`);
    }

    /**
     * Показ карточки места
     */
    async showPlaceCard(place, index) {
        console.log('📋 Показываем карточку:', place.name);

        const content = document.getElementById('sidebarContent');

        // Показываем загрузку
        content.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 204, 0, 0.2);
                    border-top-color: #ffcc00;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p style="color: #d0d0d0;">Загружаем информацию...</p>
            </div>
        `;

        try {
            // Получаем полные данные
            const fullData = await this.getPlaceDetails(place.id);

            // Рендерим карточку
            this.renderPlaceCard(fullData, index);

            // Центрируем карту
            if (fullData.point && this.map) {
                this.map.setCenter([fullData.point.lon, fullData.point.lat]);
                this.map.setZoom(16);
            }

        } catch (error) {
            console.error('❌ Ошибка загрузки карточки:', error);
            content.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #f44336;">
                    <h3>❌ Ошибка</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    /**
     * Получение детальной информации о месте
     */
    async getPlaceDetails(placeId) {
        const fields = [
            'items.name',
            'items.address',
            'items.point',
            'items.purpose_name',
            'items.rubrics',
            'items.contact_groups',
            'items.schedule',
            'items.reviews',
            'items.photos',
            'items.description',
            'items.links'
        ].join(',');

        const params = new URLSearchParams({
            id: placeId,
            key: this.apiKey,
            fields: fields,
            locale: 'ru_RU'
        });

        const url = `https://catalog.api.2gis.com/3.0/items?${params}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.result?.items?.[0]) {
            throw new Error('Место не найдено');
        }

        return data.result.items[0];
    }

    /**
     * Рендер карточки места
     */
    renderPlaceCard(place, index) {
        const content = document.getElementById('sidebarContent');

        const rating = place.reviews?.general_rating || 0;
        const reviewCount = place.reviews?.general_review_count || 0;
        const photos = place.photos || [];
        const contacts = place.contact_groups?.flatMap(g => g.contacts || []) || [];
        const schedule = place.schedule?.working_hours || [];

        let html = `
            <div style="animation: slideIn 0.3s ease;">
                <!-- Кнопка назад -->
                <button id="backToResultsBtn" style="
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #fff;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-bottom: 16px;
                    font-size: 0.9rem;
                ">← Назад к результатам</button>

                <!-- Фото -->
                ${photos.length > 0 ? `
                    <div style="
                        width: 100%;
                        height: 200px;
                        background: url('${photos[0].url || photos[0].thumbnail_url}') center/cover;
                        border-radius: 12px;
                        margin-bottom: 20px;
                        position: relative;
                    ">
                        ${photos.length > 1 ? `
                            <div style="
                                position: absolute;
                                bottom: 12px;
                                right: 12px;
                                background: rgba(0,0,0,0.7);
                                color: #fff;
                                padding: 6px 12px;
                                border-radius: 16px;
                                font-size: 0.8rem;
                            ">📷 ${photos.length} фото</div>
                        ` : ''}
                    </div>
                ` : ''}

                <!-- Название -->
                <h2 style="color: #fff; margin: 0 0 8px 0; font-size: 1.4rem; line-height: 1.3;">
                    ${place.name}
                </h2>

                <!-- Категория -->
                <p style="color: #ffcc00; margin: 0 0 12px 0; font-size: 0.95rem;">
                    ${place.purpose_name || place.rubrics?.[0]?.name || 'Место'}
                </p>

                <!-- Рейтинг -->
                ${rating > 0 ? `
                    <div style="
                        background: rgba(255,204,0,0.1);
                        padding: 12px;
                        border-radius: 8px;
                        margin-bottom: 16px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    ">
                        <span style="color: #ffcc00; font-size: 1.1rem;">⭐ ${rating.toFixed(1)}</span>
                        <span style="color: #999; font-size: 0.9rem;">(${reviewCount} отзывов)</span>
                    </div>
                ` : ''}

                <!-- Адрес -->
                <div style="
                    background: rgba(255,255,255,0.05);
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    display: flex;
                    gap: 10px;
                ">
                    <span style="font-size: 1.2rem;">📍</span>
                    <span style="color: #d0d0d0; line-height: 1.4;">
                        ${place.address?.name || 'Адрес не указан'}
                    </span>
                </div>

                <!-- График работы -->
                ${schedule.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #ffcc00; font-size: 1rem; margin: 0 0 12px 0;">🕒 Время работы</h3>
                        ${schedule.slice(0, 3).map(day => `
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                border-bottom: 1px solid rgba(255,255,255,0.05);
                                color: #d0d0d0;
                                font-size: 0.9rem;
                            ">
                                <span>${day.day_name}</span>
                                <span style="color: #fff; font-weight: 500;">
                                    ${day.working_time_periods?.map(p => `${p.time_from}-${p.time_to}`).join(', ') || 'Закрыто'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Контакты -->
                ${contacts.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #ffcc00; font-size: 1rem; margin: 0 0 12px 0;">📞 Контакты</h3>
                        ${contacts.map(c => {
                            const icon = c.type === 'phone' ? '📞' : c.type === 'website' ? '🌐' : '📧';
                            const link = c.type === 'phone' ? `tel:${c.value}` :
                                        c.type === 'website' ? c.value :
                                        `mailto:${c.value}`;

                            return `
                                <a href="${link}" style="
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                    padding: 10px;
                                    background: rgba(255,255,255,0.05);
                                    border-radius: 8px;
                                    margin-bottom: 8px;
                                    color: #2196f3;
                                    text-decoration: none;
                                ">
                                    <span style="font-size: 1.2rem;">${icon}</span>
                                    <span style="color: #e0e0e0;">${c.value}</span>
                                </a>
                            `;
                        }).join('')}
                    </div>
                ` : ''}

                <!-- Описание -->
                ${place.description ? `
                    <div style="
                        background: rgba(255,255,255,0.03);
                        padding: 16px;
                        border-radius: 12px;
                        border-left: 3px solid #667eea;
                        margin-bottom: 20px;
                    ">
                        <h3 style="color: #ffcc00; font-size: 1rem; margin: 0 0 8px 0;">📝 Описание</h3>
                        <p style="color: #e0e0e0; line-height: 1.5; margin: 0; font-size: 0.9rem;">
                            ${place.description}
                        </p>
                    </div>
                ` : ''}
            </div>

            <style>
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;

        content.innerHTML = html;

        // Добавляем обработчик кнопки "Назад"
        const backBtn = document.getElementById('backToResultsBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('⬅️ Возврат к результатам');
                this.displayResults(this.currentResults);
            });
        }
    }

    /**
     * Показать кнопку перехода в 2ГИС
     */
    show2GISButton(place) {
        const content = document.getElementById('sidebarContent');

        // URL для перехода на 2ГИС
        const url2gis = `https://2gis.ru/firm/${place.id}`;

        const rating = place.reviews?.general_rating || 0;
        const reviewCount = place.reviews?.general_review_count || 0;

        content.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                text-align: center;
                animation: fadeIn 0.3s ease;
            ">
                <!-- Иконка -->
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #ffcc00, #ff8e53);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 40px;
                    margin-bottom: 20px;
                    box-shadow: 0 8px 24px rgba(255, 204, 0, 0.4);
                ">📍</div>

                <!-- Название -->
                <h2 style="
                    color: #fff;
                    margin: 0 0 8px 0;
                    font-size: 1.5rem;
                    line-height: 1.3;
                ">${place.name}</h2>

                <!-- Категория -->
                <p style="
                    color: #ffcc00;
                    margin: 0 0 12px 0;
                    font-size: 1rem;
                ">${place.purpose_name || 'Место'}</p>

                <!-- Адрес -->
                <p style="
                    color: #d0d0d0;
                    margin: 0 0 20px 0;
                    font-size: 0.9rem;
                    line-height: 1.4;
                ">📍 ${place.address_name || place.address?.name || 'Адрес не указан'}</p>

                <!-- Рейтинг -->
                ${rating > 0 ? `
                    <div style="
                        background: rgba(255,204,0,0.1);
                        padding: 12px 20px;
                        border-radius: 12px;
                        margin-bottom: 24px;
                        display: inline-flex;
                        align-items: center;
                        gap: 12px;
                    ">
                        <span style="color: #ffcc00; font-size: 1.2rem;">⭐ ${rating.toFixed(1)}</span>
                        <span style="color: #999; font-size: 0.9rem;">(${reviewCount} отзывов)</span>
                    </div>
                ` : ''}

                <!-- Кнопка перехода в 2ГИС -->
                <a href="${url2gis}" target="_blank" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    background: linear-gradient(135deg, #00a650, #008f45);
                    color: white;
                    padding: 16px 32px;
                    border-radius: 12px;
                    text-decoration: none;
                    font-size: 1.1rem;
                    font-weight: 600;
                    box-shadow: 0 8px 24px rgba(0, 166, 80, 0.4);
                    transition: all 0.3s ease;
                    margin-bottom: 16px;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 32px rgba(0, 166, 80, 0.6)';"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(0, 166, 80, 0.4)';">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Открыть в 2ГИС
                </a>

                <!-- Кнопка назад -->
                <button id="backToListBtn" style="
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #fff;
                    padding: 10px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.15)';"
                   onmouseout="this.style.background='rgba(255,255,255,0.1)';">
                    ← Назад к списку
                </button>

                <!-- ID для отладки -->
                <p style="
                    color: #666;
                    margin-top: 20px;
                    font-size: 0.75rem;
                    font-family: monospace;
                ">ID: ${place.id}</p>
            </div>

            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            </style>
        `;

        // Добавляем обработчик кнопки "Назад"
        const backBtn = document.getElementById('backToListBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('⬅️ Возврат к списку');
                this.displayResults(this.currentResults);
            });
        }

        console.log('✅ Кнопка перехода в 2ГИС показана:', url2gis);
    }

    /**
     * Очистка результатов
     */
    clearResults() {
        this.clearMarkers();
        this.currentResults = [];

        const content = document.getElementById('sidebarContent');
        content.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #d0d0d0;">
                <h3 style="color: #fff; margin-bottom: 12px;">🎯 Результаты очищены</h3>
                <p>Введите новый запрос для поиска</p>
            </div>
        `;

        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
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
     * Показать сообщение
     */
    showMessage(text) {
        const content = document.getElementById('sidebarContent');
        content.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #d0d0d0;">
                <p>${text}</p>
            </div>
        `;
    }

    /**
     * Показать загрузку
     */
    showLoading(text) {
        const content = document.getElementById('sidebarContent');
        content.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 204, 0, 0.2);
                    border-top-color: #ffcc00;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p style="color: #d0d0d0;">${text}</p>
            </div>
        `;
    }

    /**
     * Уничтожение карты
     */
    destroy() {
        this.clearMarkers();
        if (this.map) {
            this.map.destroy();
            this.map = null;
        }
    }
}

// Глобальная инициализация
window.TwoGISIntegration = TwoGISIntegration;
console.log('✅ Класс TwoGISIntegration загружен');
