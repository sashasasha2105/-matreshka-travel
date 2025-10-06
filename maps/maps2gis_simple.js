/**
 * 🗺️ ПРОСТАЯ РАБОЧАЯ ВЕРСИЯ 2GIS карт
 * Минимум кода - максимум стабильности
 */

class Matryoshka2GISMaps {
    constructor() {
        this.apiKey = '8a7c9b28-b45f-4f45-9784-d34db72416db';
        this.mapInstance = null;
        this.markers = [];
        this.searchApiUrl = 'https://catalog.api.2gis.com/3.0/items';
        console.log('🗺️ Простая версия 2GIS карт инициализирована');
    }

    /**
     * Создание карты для региона
     */
    async createMap(regionData, containerId) {
        console.log('🗺️ Создание ПРОСТОЙ карты для:', regionData.name);

        const mainContainer = document.getElementById(containerId);
        if (!mainContainer) {
            throw new Error(`Контейнер ${containerId} не найден`);
        }

        // Находим элемент карты внутри контейнера
        let container = mainContainer.querySelector('#mapElement');
        if (!container) {
            container = mainContainer.querySelector('.map-content');
        }
        if (!container) {
            container = mainContainer;
        }

        // Очищаем контейнер карты
        container.innerHTML = '';
        console.log('🗺️ Используем контейнер:', container.id || container.className);

        const center = this.getRegionCenter(regionData.id);

        try {
            // Ждем загрузки MapGL API
            await this.waitForMapGL();

            // Создаем карту
            this.mapInstance = new mapgl.Map(container, {
                center: [center.coordinates[0], center.coordinates[1]],
                zoom: center.zoom,
                key: this.apiKey,
            });

            // Простой обработчик клика по карте
            this.mapInstance.on('click', (event) => {
                console.log('🖱️ Клик по карте:', event.lngLat);
                this.showClickInfo(event.lngLat);
            });

            // Автоматически загружаем популярные места
            setTimeout(() => {
                this.loadPopularPlaces(regionData.name);
            }, 2000);

            console.log('✅ Простая карта создана успешно');

        } catch (error) {
            console.error('❌ Ошибка создания карты:', error);
            this.createFallbackMap(container, center, regionData.name);
        }
    }

    /**
     * Ожидание загрузки MapGL API
     */
    async waitForMapGL() {
        return new Promise((resolve, reject) => {
            if (typeof mapgl !== 'undefined') {
                resolve();
                return;
            }

            let attempts = 0;
            const checkMapGL = () => {
                attempts++;
                if (typeof mapgl !== 'undefined') {
                    resolve();
                } else if (attempts > 20) {
                    reject(new Error('MapGL API не загрузился'));
                } else {
                    setTimeout(checkMapGL, 500);
                }
            };
            checkMapGL();
        });
    }

    /**
     * Загрузка популярных мест
     */
    async loadPopularPlaces(cityName) {
        console.log('🏢 Загружаем популярные места для:', cityName);

        const popularQueries = {
            'Москва': 'кремль москва',
            'Санкт-Петербург': 'эрмитаж санкт-петербург',
            'Казань': 'кремль казань',
            'Сочи': 'олимпийский парк сочи',
            'Екатеринбург': 'храм на крови екатеринбург'
        };

        const query = popularQueries[cityName] || `достопримечательности ${cityName}`;

        try {
            console.log('🔍 Пробуем API запрос для:', query);
            const results = await this.searchPlaces(query);
            console.log('📦 API ответ:', results);

            if (results.length > 0) {
                console.log(`✅ API: Найдено ${results.length} мест`);
                // Добавляем первые 5 мест как маркеры
                results.slice(0, 5).forEach((place, index) => {
                    this.addSimpleMarker(place, index);
                });

                this.showToast(`🎯 Загружено ${Math.min(results.length, 5)} популярных мест! Кликайте по маркерам.`);
            } else {
                console.warn('⚠️ API вернул пустой результат, используем fallback');
                this.loadFallbackPlaces(cityName);
            }

        } catch (error) {
            console.error('❌ Ошибка API запроса:', error);
            console.log('🔄 Используем fallback данные');
            this.loadFallbackPlaces(cityName);
        }
    }

    /**
     * Загрузка fallback мест
     */
    loadFallbackPlaces(cityName) {
        console.log('📍 Загружаем fallback места для:', cityName);

        const fallbackPlaces = {
            'Москва': [
                { name: 'Московский Кремль', point: { lon: 37.6173, lat: 55.7520 }, address: { name: 'Красная площадь, 1' }, purpose_name: 'Достопримечательность' },
                { name: 'Красная площадь', point: { lon: 37.6211, lat: 55.7539 }, address: { name: 'Красная площадь' }, purpose_name: 'Площадь' },
                { name: 'Храм Василия Блаженного', point: { lon: 37.6230, lat: 55.7525 }, address: { name: 'Красная площадь, 2' }, purpose_name: 'Храм' },
                { name: 'Третьяковская галерея', point: { lon: 37.6207, lat: 55.7416 }, address: { name: 'Лаврушинский пер., 10' }, purpose_name: 'Музей' },
                { name: 'Большой театр', point: { lon: 37.6192, lat: 55.7596 }, address: { name: 'Театральная пл., 1' }, purpose_name: 'Театр' }
            ],
            'Санкт-Петербург': [
                { name: 'Государственный Эрмитаж', point: { lon: 30.3141, lat: 59.9398 }, address: { name: 'Дворцовая набережная, 34' }, purpose_name: 'Музей' },
                { name: 'Дворцовая площадь', point: { lon: 30.3158, lat: 59.9386 }, address: { name: 'Дворцовая площадь' }, purpose_name: 'Площадь' },
                { name: 'Петропавловская крепость', point: { lon: 30.3167, lat: 59.9496 }, address: { name: 'Петропавловская крепость' }, purpose_name: 'Крепость' },
                { name: 'Исаакиевский собор', point: { lon: 30.3063, lat: 59.9340 }, address: { name: 'Исаакиевская пл., 4' }, purpose_name: 'Собор' },
                { name: 'Невский проспект', point: { lon: 30.3351, lat: 59.9311 }, address: { name: 'Невский проспект' }, purpose_name: 'Проспект' }
            ],
            'Казань': [
                { name: 'Казанский Кремль', point: { lon: 49.1057, lat: 55.7981 }, address: { name: 'Кремль' }, purpose_name: 'Кремль' },
                { name: 'Мечеть Кул-Шариф', point: { lon: 49.1052, lat: 55.7984 }, address: { name: 'Кремль' }, purpose_name: 'Мечеть' },
                { name: 'Улица Баумана', point: { lon: 49.1221, lat: 55.7887 }, address: { name: 'ул. Баумана' }, purpose_name: 'Улица' },
                { name: 'Дворец земледельцев', point: { lon: 49.1070, lat: 55.7953 }, address: { name: 'Дворец земледельцев' }, purpose_name: 'Дворец' }
            ],
            'Сочи': [
                { name: 'Олимпийский парк', point: { lon: 39.9566, lat: 43.4057 }, address: { name: 'Олимпийский парк' }, purpose_name: 'Парк' },
                { name: 'Роза Хутор', point: { lon: 40.3142, lat: 43.7291 }, address: { name: 'Роза Хутор' }, purpose_name: 'Курорт' },
                { name: 'Дендрарий', point: { lon: 39.7440, lat: 43.5853 }, address: { name: 'Курортный проспект' }, purpose_name: 'Парк' },
                { name: 'Морской вокзал', point: { lon: 39.7184, lat: 43.5813 }, address: { name: 'Морской вокзал' }, purpose_name: 'Вокзал' }
            ]
        };

        const places = fallbackPlaces[cityName] || fallbackPlaces['Москва'];

        places.forEach((place, index) => {
            this.addSimpleMarker(place, index);
        });

        this.showToast(`🎯 Загружено ${places.length} популярных мест! Кликайте по маркерам.`);
        console.log(`✅ Fallback: Добавлено ${places.length} мест для ${cityName}`);
    }

    /**
     * Поиск мест через API
     */
    async searchPlaces(query) {
        if (!this.mapInstance) {
            console.warn('⚠️ Карта не инициализирована для поиска');
            return [];
        }

        const center = this.mapInstance.getCenter();
        console.log('🎯 Центр карты для поиска:', center);

        const params = new URLSearchParams({
            q: query,
            key: this.apiKey,
            point: `${center[0]},${center[1]}`,
            radius: 10000, // Увеличиваем радиус поиска
            page_size: 15,
            fields: 'items.point,items.name,items.purpose_name,items.address'
        });

        const url = `${this.searchApiUrl}?${params}`;
        console.log('📡 Полный API запрос:', url);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            console.log('📨 Статус ответа:', response.status, response.statusText);

            if (!response.ok) {
                console.error('❌ Ошибка HTTP:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('❌ Текст ошибки:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📦 Полный ответ API:', data);

            if (data.result && data.result.items) {
                console.log(`✅ Получено ${data.result.items.length} объектов`);
                return data.result.items;
            } else {
                console.warn('⚠️ Нет результатов в ответе API');
                return [];
            }

        } catch (error) {
            console.error('❌ Критическая ошибка API запроса:', error);
            throw error;
        }
    }

    /**
     * Добавление простого маркера
     */
    addSimpleMarker(place, index) {
        if (!place.point || !this.mapInstance) return;

        const coordinates = [place.point.lon, place.point.lat];

        // Простой элемент маркера
        const markerElement = document.createElement('div');
        markerElement.style.cssText = `
            width: 30px;
            height: 30px;
            background: linear-gradient(135deg, #ff8e53, #ffcc00);
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(255, 142, 83, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-weight: bold;
            color: #1a1a2e;
            font-size: 12px;
            transition: transform 0.3s ease;
        `;
        markerElement.textContent = index + 1;

        // Создаем маркер
        const marker = new mapgl.Marker(this.mapInstance, {
            coordinates: coordinates,
            element: markerElement,
        });

        // Простой обработчик клика
        markerElement.onclick = () => {
            console.log('🎯 Клик по маркеру:', place.name);
            this.showPlaceInfo(place);

            // Центрируем карту
            this.mapInstance.setCenter(coordinates);
            this.mapInstance.setZoom(16);
        };

        // Hover эффект
        markerElement.onmouseenter = () => {
            markerElement.style.transform = 'scale(1.2)';
        };
        markerElement.onmouseleave = () => {
            markerElement.style.transform = 'scale(1)';
        };

        this.markers.push(marker);
    }

    /**
     * Показ информации о месте
     */
    showPlaceInfo(place) {
        console.log('📋 Показываем информацию о месте:', place);

        // Используем функцию showPlaceInfo из HTML
        if (typeof window.showPlaceInfo === 'function') {
            window.showPlaceInfo(place);
        } else {
            // Fallback - если функция не найдена
            const info = `
                🏢 ${place.name}
                📍 ${place.address?.name || 'Адрес не указан'}
                🏷️ ${place.purpose_name || 'Заведение'}
            `;
            alert(info);
        }
    }

    /**
     * Обработка клика по объекту на карте
     */
    async handleObjectClick(feature, coordinates) {
        console.log('🎯 Обработка клика по объекту:', feature);

        // Извлекаем информацию об объекте
        const properties = feature.properties || {};
        const name = properties.name || properties.title || 'Объект на карте';
        const category = properties.class || properties.type || 'Место';

        // Создаем объект места для показа
        const place = {
            name: name,
            purpose_name: category,
            address: {
                name: `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`
            },
            point: {
                lat: coordinates[1],
                lon: coordinates[0]
            },
            id: properties.id || null,
            properties: properties
        };

        console.log('🏢 Объект для показа:', place);

        // Ищем подробную информацию в 2GIS
        try {
            const detailedInfo = await this.getDetailedPlaceInfo(coordinates[1], coordinates[0], name);
            if (detailedInfo) {
                this.showPlaceInfo(detailedInfo);
                return;
            }
        } catch (error) {
            console.warn('⚠️ Не удалось получить подробную информацию:', error);
        }

        // Показываем базовую информацию
        this.showPlaceInfo(place);
    }

    /**
     * Получение подробной информации о месте
     */
    async getDetailedPlaceInfo(lat, lon, searchName = '') {
        console.log('🔍 Поиск подробной информации:', { lat, lon, searchName });

        try {
            const radius = 100; // Небольшой радиус для точного поиска
            const query = searchName || '';
            const url = `${this.searchApiUrl}?q=${encodeURIComponent(query)}&point=${lon},${lat}&radius=${radius}&key=${this.apiKey}&page_size=5`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            if (!response.ok) {
                console.warn(`⚠️ API поиска вернул ${response.status}`);
                return null;
            }

            const data = await response.json();
            console.log('📦 Результат поиска подробной информации:', data);

            if (data.result && data.result.items && data.result.items.length > 0) {
                // Возвращаем первый найденный объект
                return data.result.items[0];
            }

            return null;
        } catch (error) {
            console.error('❌ Ошибка получения подробной информации:', error);
            return null;
        }
    }

    /**
     * Показ информации о клике
     */
    async showClickInfo(coordinates) {
        const lon = coordinates[0];
        const lat = coordinates[1];

        console.log('🖱️ Клик по координатам:', { lat, lon });

        // СРАЗУ ИЩЕМ ЗАВЕДЕНИЯ И ПОКАЗЫВАЕМ РЕЗУЛЬТАТ
        try {
            const nearbyPlaces = await this.searchNearbyPlaces(lat, lon);

            if (nearbyPlaces.length > 0) {
                // Показываем первое найденное место
                this.showPlaceInfo(nearbyPlaces[0]);
            } else {
                // Если ничего не найдено - пробуем поиск по категориям
                await this.tryDifferentSearches(lat, lon);
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
            this.showLocationInfo({ lat, lon });
        }
    }

    async tryDifferentSearches(lat, lon) {
        const searches = ['кафе', 'магазин', 'банк', 'аптека', 'ресторан'];

        for (const query of searches) {
            try {
                const url = `${this.searchApiUrl}?q=${encodeURIComponent(query)}&point=${lon},${lat}&radius=200&key=${this.apiKey}&page_size=5`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.result && data.result.items && data.result.items.length > 0) {
                    this.showPlaceInfo(data.result.items[0]);
                    return;
                }
            } catch (error) {
                continue;
            }
        }

        // Если ничего не нашли - показываем поиск
        this.showLocationInfo({ lat, lon });
    }

    /**
     * Поиск ближайших мест по координатам
     */
    async searchNearbyPlaces(lat, lon) {
        console.log('🔍 Поиск ближайших мест:', { lat, lon });

        const radius = 500; // метров
        const url = `${this.searchApiUrl}?q=&point=${lon},${lat}&radius=${radius}&key=${this.apiKey}&page_size=10`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            if (!response.ok) {
                console.warn(`⚠️ API вернул ${response.status}, используем fallback`);
                return [];
            }

            const data = await response.json();
            console.log('📦 Найденные места:', data);

            if (data.result && data.result.items) {
                console.log(`✅ Найдено ${data.result.items.length} ближайших мест`);
                return data.result.items;
            }

            return [];
        } catch (error) {
            console.error('❌ Ошибка API поиска мест:', error);
            return [];
        }
    }

    /**
     * Показ информации о ближайших местах
     */
    showNearbyPlacesInfo(places, clickCoords) {
        console.log('🏢 Показываем ближайшие места:', places);

        if (typeof window.showNearbyPlaces === 'function') {
            window.showNearbyPlaces(places, clickCoords);
        } else {
            // Fallback - показываем первое место
            if (places.length > 0) {
                this.showPlaceInfo(places[0]);
            }
        }
    }

    /**
     * Показ информации о локации (если не найдены места)
     */
    showLocationInfo(coords) {
        console.log('📍 Показываем информацию о локации:', coords);

        if (typeof window.showLocationInfo === 'function') {
            window.showLocationInfo(coords);
        } else {
            const info = `📍 Координаты:\nШирота: ${coords.lat.toFixed(6)}\nДолгота: ${coords.lon.toFixed(6)}`;
            alert(info);
        }
    }

    /**
     * Показ уведомления
     */
    showToast(message) {
        // Убираем предыдущий toast
        const existing = document.querySelector('.simple-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'simple-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
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
            'ekaterinburg': { coordinates: [60.6122, 56.8431], zoom: 12 }
        };
        return centers[regionId] || centers['moscow'];
    }

    /**
     * Fallback карта
     */
    createFallbackMap(container, center, cityName) {
        console.log('🔄 Создаем fallback карту');

        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 500px; background: rgba(255,255,255,0.1); border-radius: 16px; color: #fff; text-align: center;">
                <div>
                    <h3>🗺️ ${cityName}</h3>
                    <p>Карта временно недоступна</p>
                    <iframe
                        src="https://widgets.2gis.com/widget?id=DgWidget_map&opt=%7B%22pos%22%3A%7B%22lat%22%3A${center.coordinates[1]}%2C%22lon%22%3A${center.coordinates[0]}%2C%22zoom%22%3A${center.zoom}%7D%2C%22opt%22%3A%7B%22city%22%3A%22${encodeURIComponent(cityName)}%22%7D%7D"
                        width="100%"
                        height="400"
                        frameborder="0"
                        style="border-radius: 12px; margin-top: 16px;"
                    ></iframe>
                </div>
            </div>
        `;
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
     * Уничтожение карты
     */
    destroy() {
        this.clearMarkers();
        if (this.mapInstance) {
            this.mapInstance.destroy();
            this.mapInstance = null;
        }
        console.log('🗑️ Простая карта уничтожена');
    }
}

// Добавляем стили для анимации
if (!document.getElementById('simple-map-styles')) {
    const style = document.createElement('style');
    style.id = 'simple-map-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// Глобальная инициализация
window.matryoshka2GIS = new Matryoshka2GISMaps();

console.log('🚀 ПРОСТАЯ версия 2GIS карт готова к работе!');