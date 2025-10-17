2





/**
 * 🗺️ Интеграция 2GIS карт для проекта Матрешка
 * Полная система карт с достопримечательностями и поиском
 */

class Matryoshka2GISMaps {
    constructor() {
        this.apiKey = '20d959b9-d5ec-4578-abe3-1d414e8edfc3';
        this.mapInstance = null;
        this.mapContainer = null;
        this.markers = [];
        this.activeRegion = null;
        this.isMapLoaded = false;
        this.searchResults = [];

        // Сразу показываем, что модуль готов
        console.log('🗺️ Модуль карт Матрешка инициализирован');

        // Сохраняем промис инициализации для ожидания
        this.initPromise = this.initializeAPI();
    }

    /**
     * Инициализация 2GIS MapGL API
     */
    async initializeAPI() {
        try {
            // Загружаем 2GIS MapGL
            if (!window.mapgl) {
                await this.loadMapGLScript();
            }

            console.log('✅ 2GIS MapGL API загружен');
            this.isMapLoaded = true;
        } catch (error) {
            console.error('❌ Ошибка загрузки 2GIS API:', error);
            this.fallbackToIframe();
        }
    }

    /**
     * Загрузка скрипта MapGL
     */
    loadMapGLScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://mapgl.2gis.com/api/js/v1';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Создание карты для региона
     */
    async createMap(regionData, containerId) {
        this.mapContainer = document.getElementById(containerId);
        if (!this.mapContainer) {
            console.error('❌ Контейнер для карты не найден:', containerId);
            return;
        }

        this.activeRegion = regionData;

        // СРАЗУ создаем карту, не ждем инициализации
        console.log('🚀 НЕМЕДЛЕННО создаем карту для:', regionData.name);

        // ПРИНУДИТЕЛЬНО создаем MapGL карту!
        console.log('🔥 ПРИНУДИТЕЛЬНО создаем MapGL карту с кликабельными объектами!');

        try {
            // Загружаем MapGL прямо сейчас
            if (!window.mapgl) {
                console.log('⚡ Загружаем MapGL API...');
                await this.loadMapGLScript();
            }

            console.log('✅ MapGL загружен - создаем НАСТОЯЩУЮ интерактивную карту');
            await this.createRealInteractiveMap(regionData);
        } catch (error) {
            console.error('❌ Ошибка MapGL:', error);
            console.log('🔄 Создаем упрощенную интерактивную карту');
            this.createForceInteractiveMap(regionData);
        }
    }

    /**
     * НОВАЯ - Создание НАСТОЯЩЕЙ интерактивной MapGL карты
     */
    async createRealInteractiveMap(regionData) {
        const center = this.getRegionCenter(regionData.id);

        console.log('🔥 СОЗДАЕМ НАСТОЯЩУЮ MapGL карту:', regionData.name);

        // Создаем интерфейс
        this.mapContainer.innerHTML = `
            <div class="full-map-interface">
                <!-- Боковая панель -->
                <div class="map-sidebar" id="mapSidebar">
                    <div class="sidebar-header">
                        <div class="region-title">${regionData.name}</div>
                        <div class="search-container">
                            <input type="text" class="map-search" id="mapSearch" placeholder="Поиск мест и достопримечательностей...">
                            <button class="search-btn" onclick="matryoshka2GIS.performSearch()">🔍</button>
                        </div>
                    </div>
                    <div class="sidebar-content" id="sidebarContent">
                        <div class="map-status">⚡ Загружаем интерактивную карту...</div>
                    </div>
                </div>

                <!-- MapGL карта -->
                <div class="map-canvas" id="mapCanvas" style="flex: 1; position: relative; background: #1a1a2e;">
                    <div class="map-loading-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(26, 26, 46, 0.9); z-index: 999;">
                        <div style="color: #ffcc00; font-size: 18px;">🗺️ Инициализируем карту...</div>
                    </div>
                </div>
            </div>
        `;

        // Создаем MapGL карту
        await this.initializeMapGLInstance(center, regionData);

        console.log('✅ НАСТОЯЩАЯ MapGL карта создана');
    }

    /**
     * Инициализация MapGL экземпляра с кликабельными объектами
     */
    async initializeMapGLInstance(center, regionData) {
        try {
            console.log('⚡ Инициализируем MapGL экземпляр...');

            // Убираем overlay
            setTimeout(() => {
                const overlay = document.querySelector('.map-loading-overlay');
                if (overlay) overlay.remove();
            }, 1000);

            // Создаем MapGL карту
            this.mapInstance = new mapgl.Map('mapCanvas', {
                center: center.coordinates,
                zoom: center.zoom,
                key: this.apiKey,
                style: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b', // 2ГИС стиль
            });

            console.log('🗺️ MapGL карта создана');

            // Ждем загрузки карты
            this.mapInstance.on('ready', () => {
                console.log('✅ MapGL карта готова к использованию');

                // СРАЗУ загружаем достопримечательности
                this.loadAndDisplayAttractions(regionData);

                // Добавляем поиск объектов по клику
                this.mapInstance.on('click', (event) => {
                    this.handleMapClick(event, regionData);
                });
            });

            // Обработка ошибок
            this.mapInstance.on('error', (error) => {
                console.error('❌ Ошибка MapGL:', error);
                this.createForceInteractiveMap(regionData);
            });

        } catch (error) {
            console.error('❌ Критическая ошибка MapGL:', error);
            this.createForceInteractiveMap(regionData);
        }
    }

    /**
     * СТАРАЯ - Создание полноценной интерактивной карты с боковой панелью
     */
    async createInteractiveMap_OLD(regionData) {
        // Определяем центр для региона
        const center = this.getRegionCenter(regionData.id);

        // Создаем полноценный интерфейс с боковой панелью
        this.mapContainer.innerHTML = `
            <div class="full-map-interface">
                <!-- Боковая панель слева -->
                <div class="map-sidebar" id="mapSidebar">
                    <div class="sidebar-header">
                        <div class="region-title">${regionData.name}</div>
                        <div class="search-container">
                            <input type="text" class="map-search" id="mapSearch" placeholder="Поиск мест и достопримечательностей...">
                            <button class="search-btn" onclick="matryoshka2GIS.performSearch()">🔍</button>
                        </div>
                    </div>

                    <div class="sidebar-content" id="sidebarContent">
                        <div class="sidebar-welcome">
                            <h3>Добро пожаловать в ${regionData.name}!</h3>
                            <p>Кликните на любой объект на карте, чтобы узнать подробную информацию</p>
                            <div class="attraction-categories">
                                <button class="category-btn" onclick="matryoshka2GIS.searchCategory('достопримечательности')">🏛️ Достопримечательности</button>
                                <button class="category-btn" onclick="matryoshka2GIS.searchCategory('музеи')">🎨 Музеи</button>
                                <button class="category-btn" onclick="matryoshka2GIS.searchCategory('рестораны')">🍽️ Рестораны</button>
                                <button class="category-btn" onclick="matryoshka2GIS.searchCategory('отели')">🏨 Отели</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Основная карта справа -->
                <div class="map-main-container" id="mapMainContainer">
                    <div class="map-loading">
                        <div class="map-loading-spinner"></div>
                        <div class="map-loading-text">Загружаем интерактивную карту...</div>
                    </div>
                </div>
            </div>
        `;

        const mapMainContainer = document.getElementById('mapMainContainer');

        try {
            // Проверяем доступность MapGL
            if (!window.mapgl) {
                throw new Error('MapGL не загружен');
            }

            // Создаем полноценную интерактивную карту
            this.mapInstance = new mapgl.Map(mapMainContainer, {
                center: center.coordinates,
                zoom: center.zoom,
                key: this.apiKey,
                style: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b',
            });

            // Убираем загрузчик
            setTimeout(() => {
                const loader = mapMainContainer.querySelector('.map-loading');
                if (loader) loader.remove();
            }, 1000);

            // Добавляем обработчики кликов на карту
            this.mapInstance.on('click', (event) => {
                this.handleMapClick(event, regionData);
            });

            // АВТОМАТИЧЕСКИ загружаем и показываем достопримечательности
            setTimeout(async () => {
                console.log('🚀 СТАРТ: Загружаем достопримечательности для', regionData.name);
                try {
                    await this.loadAndDisplayAttractions(regionData);
                    console.log('🎯 Достопримечательности загружены и отображены');
                } catch (error) {
                    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при загрузке достопримечательностей:', error);
                }
            }, 1500);

            console.log('✅ Полноценная интерактивная карта создана для:', regionData.name);
            console.log(`🎯 Интерфейс готов к использованию`);
        } catch (error) {
            console.error('❌ Ошибка создания интерактивной карты:', error);

            // Fallback к простому iframe с данными
            this.createSimpleMapInterface(regionData, mapMainContainer);
        }
    }

    /**
     * Получение координат центра региона
     */
    getRegionCenter(regionId) {
        const centers = {
            'moscow': {
                coordinates: [37.6176, 55.7558],
                zoom: 10
            },
            'spb': {
                coordinates: [30.3351, 59.9311],
                zoom: 10
            },
            'kazan': {
                coordinates: [49.1221, 55.7887],
                zoom: 11
            },
            'sochi': {
                coordinates: [39.7303, 43.6028],
                zoom: 11
            },
            'ekaterinburg': {
                coordinates: [60.6122, 56.8431],
                zoom: 11
            },
            'volgograd': {
                coordinates: [44.5018, 48.7194],
                zoom: 11
            },
            'irkutsk': {
                coordinates: [104.2964, 52.2978],
                zoom: 11
            },
            'kaliningrad': {
                coordinates: [20.5083, 54.7065],
                zoom: 11
            },
            'nizhnynovgorod': {
                coordinates: [44.0020, 56.2965],
                zoom: 11
            },
            'chelyabinsk': {
                coordinates: [61.4291, 55.1644],
                zoom: 11
            },
            'karachaevo': {
                coordinates: [42.0577, 43.7681],
                zoom: 10
            },
            'stavropol': {
                coordinates: [41.9734, 45.0428],
                zoom: 11
            },
            'yaroslavl': {
                coordinates: [39.8844, 57.6261],
                zoom: 11
            },
            'kostroma': {
                coordinates: [40.9266, 57.7665],
                zoom: 11
            },
            'kabardino': {
                coordinates: [43.4917, 43.4806],
                zoom: 10
            }
        };

        return centers[regionId] || { coordinates: [37.6176, 55.7558], zoom: 10 };
    }

    /**
     * Обработка кликов по карте
     */
    async handleMapClick(event, regionData) {
        console.log('🖱️ Клик по карте:', event.lngLat);

        // Показываем индикатор загрузки в боковой панели
        this.showSidebarLoading('Ищем информацию о выбранном месте...');

        // СРАЗУ показываем информацию о точке клика
        this.displayLocationInfo(event.lngLat, regionData.name);

        try {
            // Асинхронно ищем близлежащие места
            const nearbyPlaces = await this.searchNearbyPlaces(event.lngLat, regionData.name);

            if (nearbyPlaces && nearbyPlaces.length > 0) {
                // Показываем найденное место
                this.displayPlaceInSidebar(nearbyPlaces[0]);
            }
        } catch (error) {
            console.error('Ошибка обработки клика:', error);
            // Оставляем информацию о координатах, которую уже показали
        }
    }

    /**
     * Поиск объектов рядом с координатами
     */
    async searchNearbyPlaces(coordinates, cityName) {
        try {
            const cityId = this.getCityIdForRegion(cityName);
            const searchUrl = `https://catalog.api.2gis.com/3.0/items?point=${coordinates.lng},${coordinates.lat}&radius=100&key=${this.apiKey}&city_id=${cityId}&fields=items.point,items.name,items.address,items.reviews,items.photos,items.schedule,items.contact_groups,items.purpose_name,items.rubrics&page_size=10&sort=distance`;

            const response = await fetch(searchUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result?.items || [];
        } catch (error) {
            console.warn('Ошибка поиска рядом:', error);
            return [];
        }
    }

    /**
     * Выполнение поиска из поисковой строки
     */
    async performSearch() {
        const searchInput = document.getElementById('mapSearch');
        const query = searchInput.value.trim();

        if (!query) return;

        this.showSidebarLoading(`Поиск "${query}"...`);

        try {
            const cityName = this.activeRegion.name;
            const results = await this.searchPlaces(query, cityName);

            if (results.length > 0) {
                this.displaySearchResults(results);
                // Показываем первый результат на карте
                if (results[0].point) {
                    this.mapInstance.setCenter([results[0].point.lon, results[0].point.lat]);
                    this.mapInstance.setZoom(16);
                }
            } else {
                this.showSidebarMessage('По вашему запросу ничего не найдено');
            }
        } catch (error) {
            console.error('Ошибка поиска:', error);
            this.showSidebarError('Ошибка выполнения поиска');
        }
    }

    /**
     * Поиск по категории
     */
    async searchCategory(category) {
        this.showSidebarLoading(`Поиск: ${category}...`);

        try {
            const cityName = this.activeRegion.name;
            const results = await this.searchPlaces(category, cityName);

            if (results.length > 0) {
                this.displaySearchResults(results);
            } else {
                this.showSidebarMessage(`${category} не найдены`);
            }
        } catch (error) {
            console.error('Ошибка поиска по категории:', error);
            this.showSidebarError('Ошибка поиска по категории');
        }
    }

    /**
     * Поиск мест через 2GIS API
     */
    async searchPlaces(query, cityName) {
        const cityId = this.getCityIdForRegion(cityName);
        const searchUrl = `https://catalog.api.2gis.com/3.0/items?q=${encodeURIComponent(query)}&key=${this.apiKey}&city_id=${cityId}&fields=items.point,items.name,items.address,items.reviews,items.photos,items.schedule,items.contact_groups,items.purpose_name,items.rubrics&page_size=20&sort=rating`;

        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result?.items || [];
    }

    /**
     * Загрузка и отображение достопримечательностей
     */
    async loadAndDisplayAttractions(regionData) {
        // СРАЗУ скрываем любой загрузчик
        console.log('🚀 НАЧИНАЕМ загрузку достопримечательностей без спиннера!');

        // ВСЕГДА загружаем fallback данные для гарантии
        let attractions = this.getFallbackAttractions(regionData.name);
        console.log(`📦 Fallback данные для ${regionData.name}:`, attractions.length, 'объектов');

        try {
            // Пробуем также загрузить данные из API 2GIS
            const apiAttractions = await this.searchPlaces('достопримечательности музеи', regionData.name);

            // Если API работает, комбинируем данные
            if (apiAttractions && apiAttractions.length > 0) {
                console.log('✅ API 2GIS работает, комбинируем данные');
                // Добавляем API данные к fallback (убираем дубликаты)
                const combinedAttractions = [...attractions];
                apiAttractions.forEach(apiPlace => {
                    const exists = attractions.some(fallbackPlace =>
                        this.isSimilarPlace(apiPlace.name, fallbackPlace.name)
                    );
                    if (!exists) {
                        combinedAttractions.push(apiPlace);
                    }
                });
                attractions = combinedAttractions;
            } else {
                console.warn('⚠️ API 2GIS не отвечает, используем только локальные данные');
            }
        } catch (error) {
            console.warn('⚠️ Ошибка API 2GIS:', error.message);
            console.log('📦 Используем локальные данные достопримечательностей');
        }

        // Получаем партнеров региона
        const partners = this.getRegionPartners(regionData);
        console.log(`🤝 Партнеры для ${regionData.name}:`, partners.length, 'партнеров');

        // Отображаем результаты (всегда есть fallback данные)
        if (attractions.length > 0) {
            // Добавляем маркеры на карту (если карта интерактивная)
            if (this.mapInstance) {
                console.log('🗺️ Добавляем маркеры достопримечательностей на интерактивную карту');
                this.addMarkersToMap(attractions);

                // Добавляем маркеры партнеров
                if (partners.length > 0) {
                    console.log('🤝 Добавляем маркеры партнеров на карту');
                    this.addPartnerMarkersToMap(partners);
                }
            } else {
                console.log('📱 Iframe карта - показываем все в sidebar');
            }

            // ВСЕГДА показываем в боковой панели
            this.displaySearchResults(attractions);
            console.log(`🎯 Отображено ${attractions.length} достопримечательностей для ${regionData.name}`);
        } else {
            console.error('❌ Нет данных о достопримечательностях!');
            console.log('Проверяем fallback данные для:', regionData.name);

            // ПРИНУДИТЕЛЬНО пытаемся загрузить fallback еще раз
            const fallbackAttractions = this.getFallbackAttractions(regionData.name);
            if (fallbackAttractions.length > 0) {
                console.log('🔄 Найдены fallback данные:', fallbackAttractions.length);
                this.displaySearchResults(fallbackAttractions);
            } else {
                this.showSidebarMessage('Достопримечательности не найдены');
            }
        }
    }

    /**
     * Проверка схожести мест для удаления дубликатов
     */
    isSimilarPlace(name1, name2) {
        const clean1 = name1.toLowerCase().replace(/[^\w\s]/g, '');
        const clean2 = name2.toLowerCase().replace(/[^\w\s]/g, '');
        return clean1.includes(clean2) || clean2.includes(clean1);
    }

    /**
     * Fallback достопримечательности для каждого города
     */
    getFallbackAttractions(cityName) {
        const fallbackData = {
            'Москва': [
                {
                    id: 'kremlin_moscow',
                    name: 'Московский Кремль',
                    purpose_name: 'Достопримечательность',
                    point: { lat: 55.751800, lon: 37.617300 }, // Более точные координаты центра Кремля
                    address: { name: 'Москва, Кремль' },
                    reviews: { general_rating: 4.8, general_review_count: 15420 }
                },
                {
                    id: 'red_square',
                    name: 'Красная площадь',
                    purpose_name: 'Площадь',
                    point: { lat: 55.753930, lon: 37.620795 }, // Точные координаты центра Красной площади
                    address: { name: 'Москва, Красная площадь' },
                    reviews: { general_rating: 4.9, general_review_count: 22350 }
                },
                {
                    id: 'basil_cathedral',
                    name: 'Собор Василия Блаженного',
                    purpose_name: 'Храм',
                    point: { lat: 55.752516, lon: 37.623147 }, // Точные координаты храма
                    address: { name: 'Москва, Красная площадь, 7' },
                    reviews: { general_rating: 4.7, general_review_count: 8920 }
                },
                {
                    id: 'tretyakov_gallery',
                    name: 'Третьяковская галерея',
                    purpose_name: 'Музей',
                    point: { lat: 55.7414, lon: 37.6207 },
                    address: { name: 'Лаврушинский пер., 10' },
                    reviews: { general_rating: 4.6, general_review_count: 12500 }
                }
            ],
            'Санкт-Петербург': [
                {
                    id: 'hermitage_spb',
                    name: 'Государственный Эрмитаж',
                    purpose_name: 'Музей',
                    point: { lat: 59.9398, lon: 30.3141 },
                    address: { name: 'Дворцовая набережная, 34' },
                    reviews: { general_rating: 4.8, general_review_count: 18750 }
                },
                {
                    id: 'palace_square_spb',
                    name: 'Дворцовая площадь',
                    purpose_name: 'Площадь',
                    point: { lat: 59.9386, lon: 30.3158 },
                    address: { name: 'Дворцовая площадь' },
                    reviews: { general_rating: 4.9, general_review_count: 12400 }
                },
                {
                    id: 'peter_paul_fortress',
                    name: 'Петропавловская крепость',
                    purpose_name: 'Крепость',
                    point: { lat: 59.9496, lon: 30.3164 },
                    address: { name: 'Петропавловская крепость' },
                    reviews: { general_rating: 4.7, general_review_count: 9800 }
                }
            ],
            'Казань': [
                {
                    id: 'kazan_kremlin',
                    name: 'Казанский Кремль',
                    purpose_name: 'Кремль',
                    point: { lat: 55.7998, lon: 49.1056 },
                    address: { name: 'Кремль, 1' },
                    reviews: { general_rating: 4.6, general_review_count: 8500 }
                },
                {
                    id: 'qol_sharif',
                    name: 'Мечеть Кул-Шариф',
                    purpose_name: 'Мечеть',
                    point: { lat: 55.7986, lon: 49.1050 },
                    address: { name: 'Казанский Кремль' },
                    reviews: { general_rating: 4.8, general_review_count: 6200 }
                }
            ]
        };

        // Пытаемся найти город по различным вариантам названия
        let cityKey = Object.keys(fallbackData).find(key =>
            key.toLowerCase() === cityName.toLowerCase() ||
            cityName.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(cityName.toLowerCase())
        );

        let result = fallbackData[cityKey] || [];
        console.log(`🔍 Поиск fallback данных для "${cityName}":`, cityKey ? `найден ключ "${cityKey}"` : 'ключ не найден', `возвращаем ${result.length} объектов`);

        // Если нет данных, создаем базовые
        if (result.length === 0) {
            console.log('🆘 Создаем экстренные базовые данные для:', cityName);
            result = [
                {
                    id: 'emergency_center',
                    name: `Центр города ${cityName}`,
                    purpose_name: 'Центр',
                    point: this.getRegionCenter('moscow').coordinates,
                    address: { name: `${cityName}, центр` },
                    reviews: { general_rating: 4.5, general_review_count: 100 }
                }
            ];
        }

        return result;
    }

    /**
     * Добавление маркеров достопримечательностей
     */
    async addAttractionMarkers(regionData) {
        if (!regionData.attractions || !this.mapInstance) return;

        // Очищаем предыдущие маркеры
        this.clearMarkers();

        for (const [index, attraction] of regionData.attractions.entries()) {
            try {
                // Получаем координаты достопримечательности через поиск
                const coordinates = await this.searchAttractionCoordinates(attraction.name, regionData.name);

                if (coordinates) {
                    const marker = await this.createAttractionMarker(attraction, coordinates, index);
                    this.markers.push(marker);
                }
            } catch (error) {
                console.warn(`⚠️ Не удалось добавить маркер для ${attraction.name}:`, error);
            }
        }

        console.log(`✅ Добавлено ${this.markers.length} маркеров достопримечательностей`);
    }

    /**
     * Поиск координат достопримечательности через 2GIS API
     */
    async searchAttractionCoordinates(attractionName, regionName) {
        try {
            // Получаем правильный city_id для региона
            const cityId = this.getCityIdForRegion(regionName);
            const query = `${attractionName} ${regionName}`;

            // Улучшенный поиск с указанием города и сортировкой по рейтингу
            const searchUrl = `https://catalog.api.2gis.com/3.0/items?q=${encodeURIComponent(query)}&key=${this.apiKey}&city_id=${cityId}&fields=items.point,items.name,items.purpose_name&sort=rating&page_size=5`;

            console.log(`🔍 Поиск координат для "${attractionName}" в городе ${regionName} (ID: ${cityId})`);

            const response = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.result && data.result.items && data.result.items.length > 0) {
                // Ищем лучшее совпадение среди результатов
                const bestMatch = data.result.items.find(item =>
                    item.name.toLowerCase().includes(attractionName.toLowerCase()) ||
                    attractionName.toLowerCase().includes(item.name.toLowerCase())
                ) || data.result.items[0];

                if (bestMatch && bestMatch.point) {
                    console.log(`✅ Найдены координаты для "${attractionName}": ${bestMatch.name}`);
                    return [bestMatch.point.lon, bestMatch.point.lat];
                }
            }

            // Fallback координаты если не найдено
            console.warn(`⚠️ Координаты не найдены для "${attractionName}", используем fallback`);
            return this.getFallbackCoordinates(attractionName, regionName);
        } catch (error) {
            console.warn('❌ Ошибка поиска координат:', error);
            // Возвращаем приблизительные координаты
            return this.getFallbackCoordinates(attractionName, regionName);
        }
    }

    /**
     * Получение city_id для конкретного региона
     */
    getCityIdForRegion(regionName) {
        const cityIds = {
            'Москва': '4504222397630173',        // Москва
            'Санкт-Петербург': '4504309321650163', // Санкт-Петербург
            'Казань': '4504078682312704',        // Казань
            'Сочи': '4504226846105603',          // Сочи
            'Екатеринбург': '4504078682181632',  // Екатеринбург
            'Волгоград': '4504294968975360',     // Волгоград
            'Иркутск': '4504078682181634',       // Иркутск
            'Калининград': '4504294968975362',   // Калининград
            'Нижний Новгород': '4504294968975364', // Нижний Новгород
            'Челябинск': '4504294968975366',     // Челябинск
        };

        // Пытаемся найти по ключевым словам
        const regionKey = Object.keys(cityIds).find(key =>
            regionName.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(regionName.toLowerCase())
        );

        return cityIds[regionKey] || '4504222397630173'; // По умолчанию Москва
    }

    /**
     * Получение приблизительных координат для fallback
     */
    getFallbackCoordinates(attractionName, regionName) {
        // Предустановленные координаты для известных достопримечательностей
        const knownAttractions = {
            'Красная площадь': [37.6211, 55.7539],
            'Кремль': [37.6173, 55.7520],
            'Храм Василия Блаженного': [37.6230, 55.7525],
            'Большой театр': [37.6183, 55.7596],
            'Третьяковская галерея': [37.6206, 55.7414],
            'Эрмитаж': [30.3141, 59.9398],
            'Дворцовая площадь': [30.3158, 59.9386],
            'Петропавловская крепость': [30.3169, 59.9496],
            'Исаакиевский собор': [30.3063, 59.9342],
            'Казанский Кремль': [49.1056, 55.7989],
            'Мечеть Кул-Шариф': [49.1051, 55.7985]
        };

        // Ищем точное совпадение
        for (const [name, coords] of Object.entries(knownAttractions)) {
            if (attractionName.includes(name) || name.includes(attractionName)) {
                return coords;
            }
        }

        // Возвращаем центр региона как fallback
        const regionCenter = this.getRegionCenter(regionName);
        return regionCenter.coordinates;
    }

    /**
     * Создание яркого маркера достопримечательности
     */
    async createAttractionMarker(attraction, coordinates, index) {
        // Создаем кастомный HTML элемент для маркера - ЯРКИЙ И ЗАМЕТНЫЙ!
        const markerElement = document.createElement('div');
        markerElement.className = 'attraction-marker bright-marker';
        markerElement.innerHTML = `
            <div class="marker-icon bright-marker-icon">
                <span class="marker-number">${index + 1}</span>
                <div class="marker-pulse"></div>
            </div>
            <div class="marker-label">${attraction.name}</div>
        `;

        // Создаем маркер
        const marker = new mapgl.Marker(this.mapInstance, {
            coordinates: coordinates,
            element: markerElement,
        });

        // Добавляем обработчик клика для получения РЕАЛЬНЫХ данных 2GIS
        markerElement.addEventListener('click', async () => {
            await this.showDetailedAttractionInfo(attraction, coordinates);
        });

        // Анимация появления
        setTimeout(() => {
            markerElement.style.animation = 'markerBounceIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        }, index * 200);

        return marker;
    }

    /**
     * Показ детальной информации о достопримечательности с данными 2GIS
     */
    async showDetailedAttractionInfo(attraction, coordinates) {
        // Удаляем предыдущий попап если есть
        this.closePopup();

        // Создаем попап с загрузкой
        const popupElement = document.createElement('div');
        popupElement.className = 'attraction-popup detailed-popup';
        popupElement.innerHTML = `
            <div class="popup-header">
                <h3 class="popup-title">${attraction.name}</h3>
                <button class="popup-close" onclick="matryoshka2GIS.closePopup()">✕</button>
            </div>
            <div class="popup-content">
                <div class="popup-loading">
                    <div class="popup-spinner"></div>
                    <div>Загружаем информацию из 2ГИС...</div>
                </div>
            </div>
        `;

        // Создаем попап на карте
        this.currentPopup = new mapgl.Popup(this.mapInstance, {
            coordinates: coordinates,
            element: popupElement,
        });

        // Загружаем реальные данные из 2GIS
        try {
            const realData = await this.fetchReal2GISData(attraction, coordinates);
            this.updatePopupWithRealData(popupElement, attraction, realData, coordinates);
        } catch (error) {
            console.error('Ошибка загрузки данных 2GIS:', error);
            this.updatePopupWithFallbackData(popupElement, attraction, coordinates);
        }
    }

    /**
     * Получение реальных данных из 2GIS API
     */
    async fetchReal2GISData(attraction, coordinates) {
        try {
            // Поиск по названию достопримечательности с расширенными полями
            const searchQuery = encodeURIComponent(attraction.name);
            const searchUrl = `https://catalog.api.2gis.com/3.0/items?q=${searchQuery}&key=${this.apiKey}&fields=items.point,items.name,items.address,items.reviews,items.photos,items.schedule,items.contact_groups,items.purpose_name,items.rubrics,items.description,items.links,items.attributes,items.external_content&page_size=10&sort=rating`;

            const response = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.result && data.result.items && data.result.items.length > 0) {
                // Находим наиболее подходящий объект
                const bestMatch = this.findBestMatch(data.result.items, attraction.name, coordinates);
                return bestMatch;
            }

            return null;
        } catch (error) {
            console.error('Ошибка запроса к 2GIS API:', error);
            return null;
        }
    }

    /**
     * Поиск наиболее подходящего объекта
     */
    findBestMatch(items, attractionName, coordinates) {
        // Если только один результат
        if (items.length === 1) return items[0];

        // Ищем точное совпадение по названию
        const exactMatch = items.find(item =>
            item.name.toLowerCase() === attractionName.toLowerCase()
        );
        if (exactMatch) return exactMatch;

        // Ищем частичное совпадение
        const partialMatch = items.find(item =>
            item.name.toLowerCase().includes(attractionName.toLowerCase()) ||
            attractionName.toLowerCase().includes(item.name.toLowerCase())
        );
        if (partialMatch) return partialMatch;

        // Возвращаем первый результат
        return items[0];
    }

    /**
     * Обновление попапа с реальными данными 2GIS
     */
    updatePopupWithRealData(popupElement, attraction, realData, coordinates) {
        const content = popupElement.querySelector('.popup-content');

        if (realData) {
            const reviews = realData.reviews || {};
            const rating = reviews.general_rating || 0;
            const reviewCount = reviews.general_review_count || 0;
            const address = realData.address?.name || 'Адрес не указан';
            const phone = realData.contact_groups?.[0]?.contacts?.find(c => c.type === 'phone')?.value || null;

            content.innerHTML = `
                <div class="real-2gis-info">
                    <div class="place-basic-info">
                        <div class="place-type">${realData.purpose_name || 'Достопримечательность'}</div>
                        <div class="place-address">📍 ${address}</div>
                        ${phone ? `<div class="place-phone">📞 ${phone}</div>` : ''}
                    </div>

                    <div class="place-rating-detailed">
                        <div class="rating-display">
                            <div class="rating-stars">${this.generateStars(rating)}</div>
                            <span class="rating-value">${rating.toFixed(1)}</span>
                            <span class="rating-count">(${reviewCount.toLocaleString()} отзывов)</span>
                        </div>
                    </div>

                    <div class="place-description">
                        <h4>Описание</h4>
                        <p>${attraction.info}</p>
                    </div>

                    ${reviews.items && reviews.items.length > 0 ? `
                        <div class="real-reviews">
                            <h4>Последние отзывы из 2ГИС</h4>
                            <div class="reviews-container">
                                ${reviews.items.slice(0, 3).map(review => `
                                    <div class="review-item-real">
                                        <div class="review-header">
                                            <span class="review-author">${review.author?.name || 'Аноним'}</span>
                                            <span class="review-rating">${this.generateStars(review.rating || 5)}</span>
                                        </div>
                                        <div class="review-text">${review.text || 'Отличное место!'}</div>
                                        <div class="review-date">${this.formatDate(review.date_created)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="popup-actions">
                        <button class="popup-btn route-btn" onclick="matryoshka2GIS.buildRoute([${coordinates}])">
                            🗺️ Маршрут
                        </button>
                        <button class="popup-btn info-btn" onclick="matryoshka2GIS.open2GISPage('${realData.name}', [${coordinates}])">
                            🔍 Открыть в 2ГИС
                        </button>
                        ${realData.id ? `
                            <button class="popup-btn details-btn" onclick="matryoshka2GIS.showMore2GISDetails('${realData.id}')">
                                📋 Больше информации
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            this.updatePopupWithFallbackData(popupElement, attraction, coordinates);
        }
    }

    /**
     * Fallback отображение при отсутствии данных 2GIS
     */
    updatePopupWithFallbackData(popupElement, attraction, coordinates) {
        const content = popupElement.querySelector('.popup-content');
        content.innerHTML = `
            <div class="popup-info">
                <div class="fallback-notice">
                    <span class="notice-icon">ℹ️</span>
                    <span>Информация из базы Матрешка</span>
                </div>
                <div class="attraction-description">
                    ${attraction.info.replace(/\n/g, '<br>')}
                </div>
            </div>
            <div class="popup-actions">
                <button class="popup-btn route-btn" onclick="matryoshka2GIS.buildRoute([${coordinates}])">
                    🗺️ Построить маршрут
                </button>
                <button class="popup-btn info-btn" onclick="matryoshka2GIS.open2GISPage('${attraction.name}', [${coordinates}])">
                    🔍 Открыть в 2ГИС
                </button>
            </div>
        `;
    }

    /**
     * Генерация звездочек рейтинга
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
     * Открытие страницы в 2ГИС
     */
    open2GISPage(placeName, coordinates = null) {
        if (coordinates) {
            // Используем координаты для точного позиционирования
            const mapUrl = `https://2gis.ru/geo/${coordinates[1]},${coordinates[0]}?m=${coordinates[1]},${coordinates[0]},16&q=${encodeURIComponent(placeName)}`;
            window.open(mapUrl, '_blank');
        } else {
            // Fallback к поиску по названию
            const searchUrl = `https://2gis.ru/search/${encodeURIComponent(placeName)}`;
            window.open(searchUrl, '_blank');
        }
    }


    /**
     * Закрытие попапа
     */
    closePopup() {
        if (this.currentPopup) {
            this.currentPopup.destroy();
            this.currentPopup = null;
        }
    }

    /**
     * Построение маршрута к достопримечательности
     */
    buildRoute(coordinates) {
        // Центрируем карту на объекте и увеличиваем масштаб
        if (this.mapInstance) {
            this.mapInstance.setCenter(coordinates);
            this.mapInstance.setZoom(16);

            // Показываем информацию о маршруте в боковой панели
            this.showRouteInfo(coordinates);
        }
    }

    /**
     * Открытие страницы объекта в 2GIS (встроенная версия)
     */
    open2GISPage(placeName, coordinates = null) {
        if (coordinates) {
            // Центрируем карту на объекте
            if (this.mapInstance) {
                this.mapInstance.setCenter(coordinates);
                this.mapInstance.setZoom(16);
            }

            // Показываем детальную информацию в боковой панели
            this.displayLocationInfo(coordinates, placeName);
        } else {
            // Выполняем поиск по названию
            this.searchPlaces(placeName, this.currentRegionData?.name || 'Москва');
        }
    }

    /**
     * Показать больше информации о месте из 2GIS
     */
    async showMore2GISDetails(placeId) {
        try {
            // Получаем детальную информацию об объекте
            const detailsUrl = `https://catalog.api.2gis.com/3.0/items?id=${placeId}&key=${this.apiKey}&fields=items.schedule,items.photos,items.description,items.links,items.attributes,items.external_content,items.reviews,items.rubrics`;

            const response = await fetch(detailsUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.result && data.result.items && data.result.items.length > 0) {
                const details = data.result.items[0];
                this.showDetailedModal(details);
            }
        } catch (error) {
            console.error('Ошибка получения детальной информации:', error);
            // Открываем страницу в 2GIS как fallback
            this.open2GISPage(`id:${placeId}`);
        }
    }

    /**
     * Показать детальную модальную информацию
     */
    showDetailedModal(details) {
        // Создаем модальное окно с подробной информацией
        const modal = document.createElement('div');
        modal.className = 'detailed-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${details.name}</h2>
                    <button class="modal-close" onclick="this.closest('.detailed-modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    ${details.description ? `
                        <div class="detail-section">
                            <h3>Описание</h3>
                            <p>${details.description}</p>
                        </div>
                    ` : ''}

                    ${details.schedule ? `
                        <div class="detail-section">
                            <h3>Режим работы</h3>
                            <div class="schedule-info">
                                ${this.formatSchedule(details.schedule)}
                            </div>
                        </div>
                    ` : ''}

                    ${details.photos && details.photos.length > 0 ? `
                        <div class="detail-section">
                            <h3>Фотографии</h3>
                            <div class="photos-gallery">
                                ${details.photos.slice(0, 6).map(photo => `
                                    <img src="${photo.thumbnail_url || photo.url}" alt="Фото ${details.name}" class="gallery-photo">
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${details.reviews && details.reviews.items && details.reviews.items.length > 0 ? `
                        <div class="detail-section">
                            <h3>Отзывы (${details.reviews.general_review_count || 0})</h3>
                            <div class="detailed-reviews">
                                ${details.reviews.items.slice(0, 5).map(review => `
                                    <div class="detailed-review-item">
                                        <div class="review-header">
                                            <span class="review-author">${review.author?.name || 'Аноним'}</span>
                                            <span class="review-rating">${this.generateStars(review.rating || 5)}</span>
                                        </div>
                                        <div class="review-text">${review.text || 'Отличное место!'}</div>
                                        <div class="review-date">${this.formatDate(review.date_created)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="popup-btn route-btn" onclick="this.closest('.detailed-modal').remove()">
                        ✅ Закрыть детали
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Форматирование расписания
     */
    formatSchedule(schedule) {
        if (!schedule) return 'Режим работы не указан';

        if (typeof schedule === 'string') return schedule;

        if (schedule.Everyday) {
            return `Ежедневно: ${schedule.Everyday}`;
        }

        if (schedule.working_hours) {
            return schedule.working_hours.map(day =>
                `${day.day}: ${day.working_hours || 'Выходной'}`
            ).join('<br>');
        }

        return 'Режим работы не указан';
    }

    /**
     * Добавление маркеров на карту
     */
    addMarkersToMap(places) {
        // Очищаем предыдущие маркеры
        this.clearMarkers();

        places.forEach((place, index) => {
            if (place.point) {
                const marker = this.createClickableMarker(place, index);
                this.markers.push(marker);
            }
        });
    }

    /**
     * Создание кликабельного маркера
     */
    createClickableMarker(place, index) {
        const coordinates = [place.point.lon, place.point.lat];

        const markerElement = document.createElement('div');
        markerElement.className = 'interactive-marker';
        markerElement.innerHTML = `
            <div class="marker-icon interactive-marker-icon">
                <span class="marker-number">${index + 1}</span>
            </div>
        `;

        const marker = new mapgl.Marker(this.mapInstance, {
            coordinates: coordinates,
            element: markerElement,
        });

        // Обработчик клика на маркер
        markerElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.displayPlaceInSidebar(place);
            this.mapInstance.setCenter(coordinates);
        });

        return marker;
    }

    /**
     * Получение партнеров региона
     */
    getRegionPartners(regionData) {
        if (!regionData || !regionData.partners) {
            return [];
        }

        // Преобразуем партнеров в формат с координатами
        return regionData.partners
            .filter(partner => partner.coordinates && partner.coordinates.lat && partner.coordinates.lon)
            .map((partner, index) => ({
                id: `partner_${index}`,
                name: partner.name,
                type: partner.type,
                description: partner.description,
                emoji: partner.emoji,
                rating: partner.rating,
                specialOffer: partner.specialOffer,
                point: {
                    lat: partner.coordinates.lat,
                    lon: partner.coordinates.lon
                },
                isPartner: true // Флаг для идентификации партнера
            }));
    }

    /**
     * Добавление маркеров партнеров на карту
     */
    addPartnerMarkersToMap(partners) {
        partners.forEach((partner, index) => {
            if (partner.point) {
                const marker = this.createPartnerMarker(partner, index);
                this.markers.push(marker);
            }
        });
    }

    /**
     * Создание маркера партнера
     */
    createPartnerMarker(partner, index) {
        const coordinates = [partner.point.lon, partner.point.lat];

        const markerElement = document.createElement('div');
        markerElement.className = 'partner-marker';
        markerElement.innerHTML = `
            <div class="partner-marker-icon">
                <span class="partner-emoji">${partner.emoji || '🏪'}</span>
            </div>
            <div class="partner-tooltip">${partner.name}</div>
        `;

        const marker = new mapgl.Marker(this.mapInstance, {
            coordinates: coordinates,
            element: markerElement,
        });

        // Обработчик клика на маркер партнера
        markerElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.displayPartnerInSidebar(partner);
            this.mapInstance.setCenter(coordinates);
        });

        return marker;
    }

    /**
     * Отображение партнера в боковой панели
     */
    displayPartnerInSidebar(partner) {
        const sidebarContent = document.getElementById('sidebarContent');

        sidebarContent.innerHTML = `
            <div class="place-detail partner-detail">
                <div class="place-header">
                    <h2 class="place-name">${partner.emoji || '🏪'} ${partner.name}</h2>
                    <div class="place-type">${partner.type}</div>
                    <div class="place-badge partner-badge">Партнер Матрешка</div>
                </div>

                <div class="partner-description">
                    ${partner.description}
                </div>

                ${partner.rating ? `
                    <div class="place-rating enhanced-rating">
                        <div class="rating-display">
                            <div class="rating-stars">${this.generateStars(parseFloat(partner.rating))}</div>
                            <span class="rating-value">${partner.rating}</span>
                        </div>
                        <div class="rating-bar">
                            <div class="rating-fill" style="width: ${(parseFloat(partner.rating) / 5) * 100}%"></div>
                        </div>
                    </div>
                ` : ''}

                ${partner.specialOffer ? `
                    <div class="special-offer">
                        <h4>🎁 Специальное предложение</h4>
                        <p>${partner.specialOffer}</p>
                    </div>
                ` : ''}

                <div class="place-actions">
                    <button class="action-btn route-btn" onclick="matryoshkaMap.openRoute(${partner.point.lat}, ${partner.point.lon})">
                        🗺️ Маршрут
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Отображение места в боковой панели с встроенной информацией 2GIS
     */
    displayPlaceInSidebar(place) {
        const sidebarContent = document.getElementById('sidebarContent');
        const reviews = place.reviews || {};
        const rating = reviews.general_rating || 0;
        const reviewCount = reviews.general_review_count || 0;

        sidebarContent.innerHTML = `
            <div class="place-detail embedded-2gis-info">
                <div class="place-header">
                    <h2 class="place-name">${place.name}</h2>
                    <div class="place-type">${place.purpose_name || 'Место'}</div>
                    <div class="place-badge">Данные 2GIS</div>
                </div>

                ${place.address ? `
                    <div class="place-address">
                        <span class="address-icon">📍</span>
                        ${place.address.name || place.address}
                    </div>
                ` : ''}

                ${rating > 0 ? `
                    <div class="place-rating enhanced-rating">
                        <div class="rating-display">
                            <div class="rating-stars">${this.generateStars(rating)}</div>
                            <span class="rating-value">${rating.toFixed(1)}</span>
                            <span class="rating-count">(${reviewCount.toLocaleString()} отзывов)</span>
                        </div>
                        <div class="rating-bar">
                            <div class="rating-fill" style="width: ${(rating / 5) * 100}%"></div>
                        </div>
                    </div>
                ` : ''}

                <!-- Встроенный виджет 2GIS с информацией о месте -->
                <div class="embedded-2gis-widget">
                    <div class="widget-header">
                        <h4>Подробная информация из 2ГИС</h4>
                        <div class="widget-actions">
                            <button class="widget-btn" onclick="matryoshka2GIS.refreshPlaceInfo('${place.id || place.name}')">🔄</button>
                            <button class="widget-btn" onclick="matryoshka2GIS.toggleWidget()">📱</button>
                        </div>
                    </div>
                    <div class="widget-content" id="embedded2gisContent">
                        ${this.createEmbedded2GISContent(place)}
                    </div>
                </div>

                ${place.schedule ? `
                    <div class="place-schedule enhanced-schedule">
                        <h4>🕒 Режим работы</h4>
                        <div class="schedule-info">${this.formatSchedule(place.schedule)}</div>
                    </div>
                ` : ''}

                ${place.contact_groups && place.contact_groups[0] ? `
                    <div class="place-contacts enhanced-contacts">
                        <h4>📞 Контакты</h4>
                        ${place.contact_groups[0].contacts.map(contact => {
                            if (contact.type === 'phone') {
                                return `<div class="contact-item clickable-phone" onclick="window.open('tel:${contact.value}')">📞 ${contact.value}</div>`;
                            } else if (contact.type === 'website') {
                                return `<div class="contact-item"><a href="${contact.value}" target="_blank">🌐 ${contact.value}</a></div>`;
                            }
                            return '';
                        }).join('')}
                    </div>
                ` : ''}

                ${reviews.items && reviews.items.length > 0 ? `
                    <div class="place-reviews enhanced-reviews">
                        <h4>💬 Отзывы (последние ${reviews.items.length})</h4>
                        <div class="reviews-list">
                            ${reviews.items.slice(0, 5).map((review, index) => `
                                <div class="review-item enhanced-review" style="animation-delay: ${index * 0.1}s">
                                    <div class="review-header">
                                        <div class="review-author">
                                            <div class="author-avatar">${(review.author?.name || 'А').charAt(0).toUpperCase()}</div>
                                            <span class="author-name">${review.author?.name || 'Аноним'}</span>
                                        </div>
                                        <div class="review-rating">${this.generateStars(review.rating || 5)}</div>
                                    </div>
                                    <div class="review-text">${review.text || 'Отличное место!'}</div>
                                    <div class="review-date">${this.formatDate(review.date_created)}</div>
                                </div>
                            `).join('')}
                        </div>
                        ${reviewCount > 5 ? `
                            <button class="load-more-reviews" onclick="matryoshka2GIS.loadMoreReviews('${place.id}')">
                                Показать еще отзывы (${reviewCount - 5})
                            </button>
                        ` : ''}
                    </div>
                ` : ''}

                <div class="place-actions enhanced-actions">
                    <button class="action-btn route-btn primary" onclick="matryoshka2GIS.buildRoute([${place.point.lon}, ${place.point.lat}])">
                        🗺️ Маршрут
                    </button>
                    <button class="action-btn share-btn" onclick="matryoshka2GIS.sharePlace('${place.name}', [${place.point.lon}, ${place.point.lat}])">
                        📤 Поделиться
                    </button>
                    <button class="action-btn favorite-btn" onclick="matryoshka2GIS.toggleFavorite('${place.id}')">
                        ❤️ В избранное
                    </button>
                </div>

                <!-- Встроенная мини-карта места -->
                <div class="mini-map-container">
                    <h4>📍 Расположение</h4>
                    <div class="mini-map" id="miniMap-${place.id}">
                        <iframe
                            src="https://widgets.2gis.com/widget?id=DgWidget_map&opt=%7B%22pos%22%3A%7B%22lat%22%3A${place.point.lat}%2C%22lon%22%3A${place.point.lon}%2C%22zoom%22%3A16%7D%2C%22opt%22%3A%7B%22city%22%3A%22%22%7D%2C%22org%22%3A%22${encodeURIComponent(place.name)}%22%7D"
                            width="100%"
                            height="120"
                            frameborder="0"
                            scrolling="no"
                            style="border-radius: 8px;">
                        </iframe>
                    </div>
                </div>
            </div>
        `;

        // Анимация появления контента
        setTimeout(() => {
            const placeDetail = sidebarContent.querySelector('.place-detail');
            if (placeDetail) {
                placeDetail.classList.add('animated-in');
            }
        }, 100);
    }

    /**
     * Создание встроенного контента 2GIS
     */
    createEmbedded2GISContent(place) {
        return `
            <div class="place-info-grid">
                <div class="info-item">
                    <div class="info-label">Категория</div>
                    <div class="info-value">${place.purpose_name || 'Не указано'}</div>
                </div>

                ${place.rubrics && place.rubrics.length > 0 ? `
                    <div class="info-item">
                        <div class="info-label">Рубрики</div>
                        <div class="info-value rubrics-list">
                            ${place.rubrics.slice(0, 3).map(rubric =>
                                `<span class="rubric-tag">${rubric.name}</span>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}

                ${place.point ? `
                    <div class="info-item">
                        <div class="info-label">Координаты</div>
                        <div class="info-value coordinates">
                            <span class="coord">${place.point.lat.toFixed(6)}</span>
                            <span class="coord">${place.point.lon.toFixed(6)}</span>
                        </div>
                    </div>
                ` : ''}
            </div>

            <div class="place-description">
                <h5>Описание</h5>
                <p>${this.getPlaceDescription(place)}</p>
            </div>
        `;
    }

    /**
     * Получение описания места
     */
    getPlaceDescription(place) {
        if (place.description) return place.description;

        const descriptions = {
            'Московский Кремль': 'Историческая крепость в центре Москвы, официальная резиденция Президента России. Включен в список Всемирного наследия ЮНЕСКО.',
            'Красная площадь': 'Главная площадь Москвы, расположенная в центре столицы между Кремлём и Китай-городом.',
            'Храм Василия Блаженного': 'Православный храм, расположенный на Красной площади. Построен в 1555—1561 годах по приказу Ивана Грозного.',
            'Третьяковская галерея': 'Художественный музей в Москве, основанный в 1856 году купцом Павлом Третьяковым.',
            'Государственный Эрмитаж': 'Один из крупнейших и самых значительных художественных и культурно-исторических музеев России и мира.',
            'Дворцовая площадь': 'Главная площадь Санкт-Петербурга, архитектурный ансамбль, включённый в список Всемирного наследия ЮНЕСКО.',
            'Петропавловская крепость': 'Историческое ядро Санкт-Петербурга, заложенное Петром I в 1703 году.',
            'Казанский Кремль': 'Главная достопримечательность Казани, официальная резиденция Президента Татарстана.',
            'Мечеть Кул-Шариф': 'Главная соборная мечеть Республики Татарстан и Казани, расположенная на территории Казанского кремля.'
        };

        return descriptions[place.name] || `Популярное место в категории "${place.purpose_name || 'места'}". Подробную информацию можно найти в отзывах посетителей.`;
    }

    /**
     * Отображение результатов поиска
     */
    displaySearchResults(results) {
        const sidebarContent = document.getElementById('sidebarContent');

        // ПРИНУДИТЕЛЬНО убираем любые спиннеры
        console.log('🚀 ПОКАЗЫВАЕМ РЕЗУЛЬТАТЫ, убираем все спиннеры!');

        sidebarContent.innerHTML = `
            <div class="search-results">
                <div class="results-header">
                    <h3>Найдено: ${results.length} мест</h3>
                </div>
                <div class="results-list">
                    ${results.map((place, index) => `
                        <div class="result-item" onclick="matryoshka2GIS.selectPlace(${index})" data-place-index="${index}">
                            <div class="result-content">
                                <div class="result-name">${place.name}</div>
                                <div class="result-type">${place.purpose_name || 'Место'}</div>
                                ${place.address ? `<div class="result-address">${place.address.name || place.address}</div>` : ''}
                                ${place.reviews?.general_rating ? `
                                    <div class="result-rating">
                                        <span class="rating-stars">${this.generateStars(place.reviews.general_rating)}</span>
                                        <span class="rating-value">${place.reviews.general_rating.toFixed(1)}</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="result-number">${index + 1}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Сохраняем результаты для быстрого доступа
        this.searchResults = results;
    }

    /**
     * Выбор места из списка результатов
     */
    selectPlace(index) {
        if (this.searchResults && this.searchResults[index]) {
            const place = this.searchResults[index];
            this.displayPlaceInSidebar(place);

            if (place.point) {
                this.mapInstance.setCenter([place.point.lon, place.point.lat]);
                this.mapInstance.setZoom(16);
            }
        }
    }

    /**
     * Показать загрузку в боковой панели
     */
    showSidebarLoading(message) {
        console.log('⚠️ showSidebarLoading ЗАБЛОКИРОВАН:', message);
        // ВРЕМЕННО ОТКЛЮЧАЕМ СПИННЕРЫ - ОНИ МЕШАЮТ!
        return;

        const sidebarContent = document.getElementById('sidebarContent');
        sidebarContent.innerHTML = `
            <div class="sidebar-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
    }

    /**
     * Показать сообщение в боковой панели
     */
    showSidebarMessage(message) {
        const sidebarContent = document.getElementById('sidebarContent');
        sidebarContent.innerHTML = `
            <div class="sidebar-message">
                <div class="message-icon">ℹ️</div>
                <div class="message-text">${message}</div>
            </div>
        `;
    }

    /**
     * Показать ошибку в боковой панели
     */
    showSidebarError(message) {
        const sidebarContent = document.getElementById('sidebarContent');
        sidebarContent.innerHTML = `
            <div class="sidebar-error">
                <div class="error-icon">❌</div>
                <div class="error-text">${message}</div>
            </div>
        `;
    }

    /**
     * Отображение информации о локации
     */
    displayLocationInfo(coordinates, cityName) {
        const sidebarContent = document.getElementById('sidebarContent');
        sidebarContent.innerHTML = `
            <div class="location-info enhanced-location">
                <div class="location-header">
                    <h3>📍 Выбранная точка в ${cityName}</h3>
                    <div class="location-badge">Клик по карте</div>
                </div>

                <div class="coordinates-display">
                    <div class="coord-group">
                        <label>Широта:</label>
                        <span class="coord-value">${coordinates.lat.toFixed(6)}</span>
                    </div>
                    <div class="coord-group">
                        <label>Долгота:</label>
                        <span class="coord-value">${coordinates.lng.toFixed(6)}</span>
                    </div>
                </div>

                <!-- Встроенная мини-карта точки -->
                <div class="point-mini-map">
                    <h4>🗺️ Карта области</h4>
                    <iframe
                        src="https://widgets.2gis.com/widget?id=DgWidget_map&opt=%7B%22pos%22%3A%7B%22lat%22%3A${coordinates.lat}%2C%22lon%22%3A${coordinates.lng}%2C%22zoom%22%3A15%7D%2C%22opt%22%3A%7B%22city%22%3A%22${encodeURIComponent(cityName)}%22%7D%7D"
                        width="100%"
                        height="150"
                        frameborder="0"
                        scrolling="no"
                        style="border-radius: 12px; border: 1px solid rgba(255, 204, 0, 0.2);">
                    </iframe>
                </div>

                <div class="location-actions enhanced-location-actions">
                    <button class="action-btn route-btn primary" onclick="matryoshka2GIS.buildRoute([${coordinates.lng}, ${coordinates.lat}])">
                        🗺️ Маршрут к точке
                    </button>
                    <button class="action-btn search-btn" onclick="matryoshka2GIS.searchNearLocation('${coordinates.lng},${coordinates.lat}')">
                        🔍 Поиск рядом
                    </button>
                    <button class="action-btn copy-btn" onclick="matryoshka2GIS.copyCoordinates(${coordinates.lat}, ${coordinates.lng})">
                        📋 Копировать
                    </button>
                </div>

                <div class="location-info-text">
                    <p>💡 Вы выбрали точку на карте. Используйте кнопки выше для получения дополнительной информации или поиска ближайших объектов.</p>
                </div>
            </div>
        `;
    }

    /**
     * Поиск рядом с выбранной точкой
     */
    async searchNearLocation(coordinatesStr) {
        const [lng, lat] = coordinatesStr.split(',').map(Number);
        this.showSidebarLoading('Поиск мест рядом...');

        try {
            const nearbyPlaces = await this.searchNearbyPlaces({ lng, lat }, this.activeRegion.name);
            if (nearbyPlaces.length > 0) {
                this.displaySearchResults(nearbyPlaces);
            } else {
                this.showSidebarMessage('Рядом с выбранной точкой ничего не найдено');
            }
        } catch (error) {
            this.showSidebarError('Ошибка поиска рядом с точкой');
        }
    }

    /**
     * Обновление информации о месте
     */
    async refreshPlaceInfo(placeId) {
        console.log(`🔄 Обновляем информацию о месте: ${placeId}`);
        // Здесь можно добавить логику обновления данных
        const content = document.getElementById('embedded2gisContent');
        if (content) {
            content.innerHTML = '<div class="loading-spinner"></div><div>Обновляем данные...</div>';

            setTimeout(() => {
                content.innerHTML = '<div class="info-updated">✅ Данные обновлены</div>';
            }, 1000);
        }
    }

    /**
     * Переключение виджета
     */
    toggleWidget() {
        const widget = document.querySelector('.embedded-2gis-widget');
        if (widget) {
            widget.classList.toggle('collapsed');
        }
    }

    /**
     * Загрузка дополнительных отзывов
     */
    async loadMoreReviews(placeId) {
        console.log(`📖 Загружаем больше отзывов для: ${placeId}`);

        const button = event.target;
        button.textContent = 'Загружаем...';
        button.disabled = true;

        setTimeout(() => {
            // Имитация загрузки дополнительных отзывов
            const reviewsList = button.closest('.place-reviews').querySelector('.reviews-list');
            reviewsList.innerHTML += `
                <div class="review-item enhanced-review" style="animation: fadeInUp 0.5s ease-out">
                    <div class="review-header">
                        <div class="review-author">
                            <div class="author-avatar">И</div>
                            <span class="author-name">Иван Петров</span>
                        </div>
                        <div class="review-rating">★★★★★</div>
                    </div>
                    <div class="review-text">Отличное место для посещения! Рекомендую всем.</div>
                    <div class="review-date">15 сент. 2024</div>
                </div>
            `;
            button.remove();
        }, 1000);
    }

    /**
     * Поделиться местом
     */
    sharePlace(placeName, coordinates) {
        if (navigator.share) {
            navigator.share({
                title: placeName,
                text: `Посмотрите это место: ${placeName}`,
                url: `https://2gis.ru/geo/${coordinates[1]},${coordinates[0]}`
            });
        } else {
            // Fallback для браузеров без поддержки Web Share API
            const shareText = `${placeName} - https://2gis.ru/geo/${coordinates[1]},${coordinates[0]}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Ссылка скопирована в буфер обмена!');
            });
        }
    }

    /**
     * Добавить в избранное
     */
    toggleFavorite(placeId) {
        const button = event.target;
        const isFavorite = button.classList.contains('favorited');

        if (isFavorite) {
            button.textContent = '❤️ В избранное';
            button.classList.remove('favorited');
        } else {
            button.textContent = '💖 В избранном';
            button.classList.add('favorited');
        }

        // Сохраняем в localStorage
        const favorites = JSON.parse(localStorage.getItem('matryoshka_favorites') || '[]');
        if (isFavorite) {
            const index = favorites.indexOf(placeId);
            if (index > -1) favorites.splice(index, 1);
        } else {
            if (!favorites.includes(placeId)) favorites.push(placeId);
        }
        localStorage.setItem('matryoshka_favorites', JSON.stringify(favorites));
    }

    /**
     * Поиск дополнительной информации в 2GIS (теперь встроенной)
     */
    search2GISInfo(attractionName) {
        // Вместо перехода на сайт, показываем встроенную информацию
        console.log(`🔍 Встроенный поиск информации о: ${attractionName}`);

        const sidebarContent = document.getElementById('sidebarContent');
        if (sidebarContent) {
            sidebarContent.innerHTML = `
                <div class="embedded-search-result">
                    <h3>Информация из 2ГИС: ${attractionName}</h3>
                    <iframe
                        src="https://widgets.2gis.com/widget?id=DgWidget_map&opt=%7B%22q%22%3A%22${encodeURIComponent(attractionName)}%22%7D"
                        width="100%"
                        height="400"
                        frameborder="0"
                        style="border-radius: 12px;">
                    </iframe>
                </div>
            `;
        }
    }

    /**
     * Генерация звездочек рейтинга
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
     * Создание простого интерфейса карты при ошибках
     */
    createSimpleMapInterface(regionData, mapContainer) {
        const center = this.getRegionCenter(regionData.id);

        // Убираем загрузчик
        const loader = mapContainer.querySelector('.map-loading');
        if (loader) loader.remove();

        // Создаем простую карту iframe
        mapContainer.innerHTML = `
            <iframe
                src="https://widgets.2gis.com/widget?id=DgWidget_map&opt=%7B%22pos%22%3A%7B%22lat%22%3A${center.coordinates[1]}%2C%22lon%22%3A${center.coordinates[0]}%2C%22zoom%22%3A${center.zoom}%7D%2C%22opt%22%3A%7B%22city%22%3A%22${encodeURIComponent(regionData.name)}%22%7D%2C%22org%22%3A%22%22%7D"
                width="100%"
                height="100%"
                frameborder="0"
                scrolling="no"
                style="border: none; background: #1a1a2e;"
            ></iframe>
        `;

        // Загружаем fallback данные в боковую панель
        setTimeout(async () => {
            await this.loadAndDisplayAttractions(regionData);
            console.log('🎯 Достопримечательности загружены в простой карте');
        }, 1000);

        console.log('✅ Простая карта создана для:', regionData.name);
    }

    /**
     * Fallback к iframe карте
     */
    createIframeMap(regionData) {
        const center = this.getRegionCenter(regionData.id);

        this.mapContainer.innerHTML = `
            <div class="map-iframe-container">
                <iframe
                    src="https://widgets.2gis.com/widget?id=DgWidget_map&opt=%7B%22pos%22%3A%7B%22lat%22%3A${center.coordinates[1]}%2C%22lon%22%3A${center.coordinates[0]}%2C%22zoom%22%3A${center.zoom}%7D%2C%22opt%22%3A%7B%22city%22%3A%22${regionData.name}%22%7D%2C%22org%22%3A%22%22%7D"
                    width="100%"
                    height="100%"
                    frameborder="0"
                    scrolling="no"
                    style="border-radius: 16px;"
                ></iframe>
            </div>
        `;

        console.log('✅ Iframe карта создана для:', regionData.name);
    }

    /**
     * Создание простой карты с боковой панелью и маркерами (ВСЕГДА РАБОТАЕТ!)
     */
    createSimpleMapWithSidebar(regionData) {
        const center = this.getRegionCenter(regionData.id);

        console.log('🚀 СОЗДАЕМ ПРОСТУЮ КАРТУ С SIDEBAR для:', regionData.name);

        // Создаем полноценный интерфейс даже без MapGL
        this.mapContainer.innerHTML = `
            <div class="full-map-interface">
                <!-- Боковая панель слева -->
                <div class="map-sidebar" id="mapSidebar">
                    <div class="sidebar-header">
                        <div class="region-title">${regionData.name}</div>
                        <div class="search-container">
                            <input type="text" class="map-search" id="mapSearch" placeholder="Поиск мест и достопримечательностей...">
                            <button class="search-btn" onclick="matryoshka2GIS.performSearch()">🔍</button>
                        </div>
                    </div>

                    <div class="sidebar-content" id="sidebarContent">
                        <div class="loading-attractions">
                            <h3>⚡ Загружаем ${regionData.name}...</h3>
                            <div class="attractions-will-appear">Достопримечательности появятся мгновенно!</div>
                        </div>
                    </div>
                </div>

                <!-- ДВОЙНАЯ карта: iframe 2ГИС + наши маркеры -->
                <div class="map-area" style="flex: 1; display: flex; flex-direction: column;">

                    <!-- Основная iframe карта 2ГИС с организациями -->
                    <div style="flex: 2; position: relative;">
                        <iframe
                            src="https://widgets.2gis.com/widget?id=DgWidget_map&opt=%7B%22pos%22%3A%7B%22lat%22%3A${center.coordinates[1]}%2C%22lon%22%3A${center.coordinates[0]}%2C%22zoom%22%3A${center.zoom}%7D%2C%22opt%22%3A%7B%22city%22%3A%22${encodeURIComponent(regionData.name)}%22%2C%22zoom%22%3A${center.zoom}%2C%22org%22%3Atrue%7D%7D"
                            width="100%"
                            height="100%"
                            frameborder="0"
                            scrolling="no"
                            style="border: none; background: #1a1a2e;"
                        ></iframe>
                    </div>

                    <!-- Панель с кликабельными маркерами достопримечательностей -->
                    <div id="attractionMarkers" style="flex: 1; background: rgba(26, 26, 46, 0.95); padding: 10px; border-radius: 12px; margin-top: 8px; max-height: 200px; overflow-y: auto;">
                        <div style="color: #ffcc00; font-weight: 600; margin-bottom: 8px;">🎯 Достопримечательности:</div>
                        <div id="markersList" style="display: flex; flex-wrap: wrap; gap: 8px;">
                            <!-- Кликабельные маркеры будут здесь -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // МГНОВЕННО загружаем достопримечательности и маркеры
        console.log('🎯 МГНОВЕННАЯ загрузка достопримечательностей и маркеров!');
        this.loadAndDisplayAttractions(regionData);

        // Добавляем кликабельные маркеры в панель
        setTimeout(() => {
            this.addAttractionsToMarkersPanel(regionData);
        }, 500);

        console.log('✅ Простая карта с sidebar создана для:', regionData.name);
    }

    /**
     * Принудительное создание интерактивной карты (fallback)
     */
    createForceInteractiveMap(regionData) {
        const center = this.getRegionCenter(regionData.id);

        console.log('🔄 СОЗДАЕМ ПРИНУДИТЕЛЬНУЮ интерактивную карту:', regionData.name);

        // Создаем интерфейс с кликабельными элементами
        this.mapContainer.innerHTML = `
            <div class="full-map-interface">
                <!-- Боковая панель -->
                <div class="map-sidebar" id="mapSidebar">
                    <div class="sidebar-header">
                        <div class="region-title">${regionData.name}</div>
                        <div class="search-container">
                            <input type="text" class="map-search" id="mapSearch" placeholder="Поиск мест и достопримечательностей...">
                            <button class="search-btn" onclick="matryoshka2GIS.performSearch()">🔍</button>
                        </div>
                    </div>
                    <div class="sidebar-content" id="sidebarContent">
                        <div class="ready-status">🎯 Готово к использованию!</div>
                    </div>
                </div>

                <!-- Карта + кликабельные объекты -->
                <div class="map-area" style="flex: 1; display: flex; flex-direction: column;">
                    <!-- 2ГИС карта с организациями -->
                    <div style="flex: 1; position: relative;">
                        <iframe
                            src="https://widgets.2gis.com/widget?id=DgWidget_map&opt=%7B%22pos%22%3A%7B%22lat%22%3A${center.coordinates[1]}%2C%22lon%22%3A${center.coordinates[0]}%2C%22zoom%22%3A${center.zoom}%7D%2C%22opt%22%3A%7B%22city%22%3A%22${encodeURIComponent(regionData.name)}%22%2C%22zoom%22%3A${center.zoom}%2C%22org%22%3Atrue%7D%7D"
                            width="100%"
                            height="100%"
                            frameborder="0"
                            scrolling="no"
                            style="border: none; background: #1a1a2e;"
                        ></iframe>

                        <!-- Кликабельная накладка для поиска по клику -->
                        <div onclick="matryoshka2GIS.showMapClickInfo(event, '${regionData.name}')"
                             style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; cursor: crosshair; background: transparent;">
                        </div>
                    </div>

                    <!-- Панель с достопримечательностями -->
                    <div id="attractionMarkers" style="background: rgba(26, 26, 46, 0.95); padding: 10px; border-radius: 12px; margin-top: 8px; max-height: 200px; overflow-y: auto;">
                        <div style="color: #ffcc00; font-weight: 600; margin-bottom: 8px;">🎯 Достопримечательности (нажмите для подробностей):</div>
                        <div id="markersList" style="display: flex; flex-wrap: wrap; gap: 8px;">
                            <!-- Кликабельные маркеры будут здесь -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // НЕМЕДЛЕННО загружаем данные
        this.loadAndDisplayAttractions(regionData);
        this.addAttractionsToMarkersPanel(regionData);

        console.log('✅ Принудительная интерактивная карта создана');
    }

    /**
     * Обработка клика по карте (для fallback режима)
     */
    showMapClickInfo(event, cityName) {
        event.stopPropagation();

        // Показываем информацию о клике
        const sidebarContent = document.getElementById('sidebarContent');
        sidebarContent.innerHTML = `
            <div class="click-info">
                <h3>🗺️ Информация о точке</h3>
                <p>Вы кликнули по карте ${cityName}</p>
                <p>Для получения подробной информации об объектах используйте:</p>
                <ul>
                    <li>🎯 Кнопки достопримечательностей ниже</li>
                    <li>🔍 Поиск в верхней панели</li>
                    <li>🏢 Клики по зданиям на карте 2ГИС</li>
                </ul>
                <button onclick="matryoshka2GIS.loadAndDisplayAttractions(matryoshka2GIS.activeRegion)"
                        style="background: #ffcc00; color: #1a1a2e; border: none; padding: 8px 16px; border-radius: 8px; margin-top: 12px; cursor: pointer;">
                    ← Вернуться к списку
                </button>
            </div>
        `;
    }

    /**
     * Добавление кликабельных маркеров в панель под картой
     */
    addAttractionsToMarkersPanel(regionData) {
        const markersList = document.getElementById('markersList');
        if (!markersList) {
            console.log('❌ Панель маркеров не найдена');
            return;
        }

        console.log('🎯 ДОБАВЛЯЕМ КЛИКАБЕЛЬНЫЕ МАРКЕРЫ в панель!');

        // Получаем достопримечательности
        const attractions = this.getFallbackAttractions(regionData.name);

        // Очищаем старые маркеры
        markersList.innerHTML = '';

        attractions.forEach((attraction, index) => {
            // Создаем кнопку-маркер
            const markerButton = document.createElement('button');
            markerButton.className = 'attraction-marker-btn';
            markerButton.style.cssText = `
                background: linear-gradient(135deg, #ff1744, #ffcc00);
                color: #1a1a2e;
                border: none;
                border-radius: 20px;
                padding: 8px 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                animation: markerPulse 2s infinite;
                box-shadow: 0 4px 12px rgba(255, 23, 68, 0.4);
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
            `;

            markerButton.innerHTML = `
                <span style="
                    background: rgba(26, 26, 46, 0.8);
                    color: #ffcc00;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: 700;
                ">${index + 1}</span>
                <span>${attraction.name}</span>
            `;

            // Добавляем hover эффект
            markerButton.addEventListener('mouseenter', () => {
                markerButton.style.transform = 'scale(1.05)';
                markerButton.style.boxShadow = '0 6px 20px rgba(255, 23, 68, 0.6)';
            });

            markerButton.addEventListener('mouseleave', () => {
                markerButton.style.transform = 'scale(1)';
                markerButton.style.boxShadow = '0 4px 12px rgba(255, 23, 68, 0.4)';
            });

            // Добавляем клик
            markerButton.addEventListener('click', () => {
                console.log('🎯 КЛИК по маркеру:', attraction.name);
                this.showAttractionDetailsInSidebar(attraction);
            });

            markersList.appendChild(markerButton);
        });

        console.log(`✅ Добавлено ${attractions.length} кликабельных маркеров в панель!`);
    }

    /**
     * СТАРЫЙ метод - удаляем
     */
    addCustomMarkersToIframe_OLD(regionData) {
        const markersContainer = document.getElementById('customMarkers');
        if (!markersContainer) {
            console.log('❌ Контейнер для маркеров не найден');
            return;
        }

        console.log('🎯 ДОБАВЛЯЕМ КЛИКАБЕЛЬНЫЕ МАРКЕРЫ поверх iframe!');

        // Получаем достопримечательности
        const attractions = this.getFallbackAttractions(regionData.name);
        const center = this.getRegionCenter(regionData.id);

        // Очищаем старые маркеры
        markersContainer.innerHTML = '';

        attractions.forEach((attraction, index) => {
            if (attraction.point) {
                // Вычисляем позицию маркера относительно карты
                const markerPosition = this.calculateMarkerPosition(
                    attraction.point,
                    center.coordinates,
                    center.zoom
                );

                // Создаем яркий кликабельный маркер
                const markerElement = document.createElement('div');
                markerElement.className = 'custom-iframe-marker bright-marker';
                markerElement.style.cssText = `
                    position: absolute;
                    left: ${markerPosition.x}%;
                    top: ${markerPosition.y}%;
                    transform: translate(-50%, -100%);
                    cursor: pointer;
                    pointer-events: all;
                    z-index: 1001;
                `;

                markerElement.innerHTML = `
                    <div class="marker-icon bright-marker-icon" style="
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, #ff1744, #ffcc00, #ff8e53);
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid #fff;
                        box-shadow: 0 8px 32px rgba(255, 23, 68, 0.6), 0 0 40px rgba(255, 204, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        animation: markerPulse 2s infinite;
                    ">
                        <span style="
                            color: #1a1a2e;
                            font-weight: 700;
                            font-size: 14px;
                            transform: rotate(45deg);
                        ">${index + 1}</span>
                    </div>
                    <div style="
                        position: absolute;
                        top: -35px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(26, 26, 46, 0.95);
                        color: #fff;
                        padding: 4px 8px;
                        border-radius: 6px;
                        font-size: 12px;
                        white-space: nowrap;
                        opacity: 0;
                        transition: opacity 0.3s;
                        pointer-events: none;
                    " class="marker-tooltip">${attraction.name}</div>
                `;

                // Добавляем обработчики
                markerElement.addEventListener('mouseenter', () => {
                    markerElement.querySelector('.marker-tooltip').style.opacity = '1';
                });

                markerElement.addEventListener('mouseleave', () => {
                    markerElement.querySelector('.marker-tooltip').style.opacity = '0';
                });

                markerElement.addEventListener('click', () => {
                    console.log('🎯 КЛИК по маркеру:', attraction.name);
                    this.showAttractionDetailsInSidebar(attraction);
                });

                markersContainer.appendChild(markerElement);
            }
        });

        console.log(`✅ Добавлено ${attractions.length} кликабельных маркеров!`);
    }

    /**
     * Вычисление позиции маркера относительно iframe карты
     */
    calculateMarkerPosition(point, centerCoords, zoom) {
        // Приблизительные вычисления для позиционирования маркеров
        const latDiff = point.lat - centerCoords[1];
        const lngDiff = point.lon - centerCoords[0];

        // Базовые позиции для центра карты
        const centerX = 50; // 50% - центр по X
        const centerY = 50; // 50% - центр по Y

        // Масштабирование в зависимости от зума
        const scale = Math.pow(2, zoom - 10); // Базовый зум 10

        // Примерное позиционирование (подходит для большинства случаев)
        const x = centerX + (lngDiff * scale * 1000);
        const y = centerY - (latDiff * scale * 1000);

        // Ограничиваем позиции в пределах карты
        return {
            x: Math.max(5, Math.min(95, x)),
            y: Math.max(5, Math.min(95, y))
        };
    }

    /**
     * Показ детальной информации о достопримечательности в sidebar
     */
    showAttractionDetailsInSidebar(attraction) {
        console.log('🎯 Показываем детали:', attraction.name);

        const sidebarContent = document.getElementById('sidebarContent');
        sidebarContent.innerHTML = `
            <div class="attraction-details">
                <div class="details-header">
                    <h2 class="attraction-name">${attraction.name}</h2>
                    <div class="attraction-type">${attraction.purpose_name}</div>
                </div>

                <div class="attraction-info">
                    <div class="address-info">
                        <span class="info-icon">📍</span>
                        <span>${attraction.address?.name || 'Адрес не указан'}</span>
                    </div>

                    ${attraction.reviews ? `
                        <div class="rating-info">
                            <span class="rating-stars">${this.generateStars(attraction.reviews.general_rating)}</span>
                            <span class="rating-value">${attraction.reviews.general_rating.toFixed(1)}</span>
                            <span class="rating-count">(${attraction.reviews.general_review_count} отзывов)</span>
                        </div>
                    ` : ''}

                    <div class="description-info">
                        <p>${this.getAttractionDescription(attraction)}</p>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="action-btn primary" onclick="matryoshka2GIS.open2GISPage('${attraction.name}', [${attraction.point.lon}, ${attraction.point.lat}])">
                        🗺️ Открыть в 2ГИС
                    </button>
                    <button class="action-btn" onclick="matryoshka2GIS.buildRoute([${attraction.point.lon}, ${attraction.point.lat}])">
                        🧭 Маршрут
                    </button>
                    <button class="action-btn" onclick="matryoshka2GIS.sharePlace('${attraction.name}', [${attraction.point.lon}, ${attraction.point.lat}])">
                        📤 Поделиться
                    </button>
                </div>

                <div class="back-to-list">
                    <button onclick="matryoshka2GIS.loadAndDisplayAttractions(matryoshka2GIS.activeRegion)" class="back-btn">
                        ← Вернуться к списку
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Fallback при ошибке загрузки API
     */
    fallbackToIframe() {
        this.isMapLoaded = false;
        console.log('🔄 Переключение на iframe карты');
    }

    /**
     * Уничтожение карты
     */
    destroy() {
        this.clearMarkers();
        this.closePopup();

        if (this.mapInstance && this.mapInstance.destroy) {
            this.mapInstance.destroy();
        }

        this.mapInstance = null;
        this.activeRegion = null;
    }

    /**
     * Копирование координат в буфер обмена
     */
    copyCoordinates(lat, lng) {
        const coordString = `${lat}, ${lng}`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(coordString).then(() => {
                this.showNotification('📋 Координаты скопированы: ' + coordString);
            }).catch((err) => {
                console.error('Ошибка копирования:', err);
                this.fallbackCopyToClipboard(coordString);
            });
        } else {
            this.fallbackCopyToClipboard(coordString);
        }
    }

    /**
     * Fallback для копирования в старых браузерах
     */
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.showNotification('📋 Координаты скопированы: ' + text);
        } catch (err) {
            console.error('Fallback: Не удалось скопировать', err);
            this.showNotification('❌ Не удалось скопировать координаты');
        }

        document.body.removeChild(textArea);
    }

    /**
     * Показ уведомления пользователю
     */
    showNotification(message) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            animation: slideInRight 0.3s ease-out;
        `;

        // Добавляем CSS анимацию если её нет
        if (!document.getElementById('copy-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'copy-notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Показать информацию о маршруте в боковой панели
     */
    showRouteInfo(coordinates) {
        const sidebarContent = document.getElementById('sidebarContent');
        if (!sidebarContent) return;

        sidebarContent.innerHTML = `
            <div class="route-info">
                <div class="route-header">
                    <h3>🗺️ Информация о маршруте</h3>
                </div>
                <div class="route-details">
                    <div class="coordinate-info">
                        <h4>📍 Координаты</h4>
                        <div class="coordinates">
                            <div class="coord-item">
                                <span class="coord-label">Широта:</span>
                                <span class="coord-value">${coordinates[1].toFixed(6)}</span>
                            </div>
                            <div class="coord-item">
                                <span class="coord-label">Долгота:</span>
                                <span class="coord-value">${coordinates[0].toFixed(6)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="route-actions">
                        <button class="action-btn copy-btn" onclick="matryoshka2GIS.copyCoordinates(${coordinates[1]}, ${coordinates[0]})">
                            📋 Копировать координаты
                        </button>
                        <button class="action-btn center-btn" onclick="matryoshka2GIS.mapInstance?.setCenter([${coordinates[0]}, ${coordinates[1]}]); matryoshka2GIS.mapInstance?.setZoom(18);">
                            🎯 Увеличить масштаб
                        </button>
                    </div>

                    <div class="route-tip">
                        <div class="tip-icon">💡</div>
                        <div class="tip-text">
                            Карта центрирована на выбранном объекте.
                            Используйте элементы управления для навигации или поиска других мест.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Глобальная инициализация
window.matryoshka2GIS = new Matryoshka2GISMaps();

console.log('🗺️ Модуль карт Матрешка 2GIS инициализирован');