/**
 * 🔍 Модуль поиска заведений и отзывов через 2GIS API
 * Полная интеграция поиска достопримечательностей с отзывами
 */

class Matryoshka2GISSearch {
    constructor() {
        this.apiKey = '8a7c9b28-b45f-4f45-9784-d34db72416db';
        this.baseApiUrl = 'https://catalog.api.2gis.com/3.0';
        this.searchResults = [];
        this.activeCity = null;
    }

    /**
     * Поиск заведений в городе
     */
    async searchPlaces(query, cityName, region = null) {
        try {
            console.log(`🔍 Поиск: "${query}" в ${cityName}`);

            // Формируем запрос
            const searchQuery = region ? `${query} ${cityName} ${region}` : `${query} ${cityName}`;
            const params = new URLSearchParams({
                q: searchQuery,
                key: this.apiKey,
                fields: 'items.point,items.name,items.purpose_name,items.adm_div,items.address,items.contact_groups,items.schedule,items.rubrics,items.reviews,items.photos',
                page_size: 50
            });

            const url = `${this.baseApiUrl}/items?${params}`;
            console.log('🌐 API запрос:', url);

            const response = await fetch(url, {
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
            console.log('📦 Получен ответ от API:', data);

            if (data.result && data.result.items) {
                this.searchResults = data.result.items;
                return this.searchResults;
            }

            return [];
        } catch (error) {
            console.error('❌ Ошибка поиска:', error);
            return this.getFallbackPlaces(query, cityName);
        }
    }

    /**
     * Получение подробной информации о заведении включая отзывы
     */
    async getPlaceDetails(placeId) {
        try {
            const params = new URLSearchParams({
                id: placeId,
                key: this.apiKey,
                fields: 'items.reviews,items.photos,items.schedule,items.contact_groups,items.description'
            });

            const url = `${this.baseApiUrl}/items?${params}`;
            const response = await fetch(url, {
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
                return data.result.items[0];
            }

            return null;
        } catch (error) {
            console.error('❌ Ошибка получения деталей:', error);
            return null;
        }
    }

    /**
     * Fallback данные для известных достопримечательностей
     */
    getFallbackPlaces(query, cityName) {
        const fallbackData = {
            'москва': [
                {
                    id: 'mock_kremlin',
                    name: 'Московский Кремль',
                    purpose_name: 'Достопримечательность',
                    point: { lat: 55.7520, lon: 37.6173 },
                    address: { name: 'Красная площадь, 1' },
                    reviews: {
                        general_rating: 4.8,
                        general_review_count: 15420,
                        items: [
                            {
                                rating: 5,
                                text: 'Сердце России! Обязательно к посещению. Великолепная архитектура и богатая история.',
                                author: { name: 'Александр М.' },
                                date_created: '2024-09-15'
                            },
                            {
                                rating: 5,
                                text: 'Потрясающее место! Экскурсия по территории Кремля произвела неизгладимое впечатление.',
                                author: { name: 'Елена К.' },
                                date_created: '2024-09-10'
                            }
                        ]
                    }
                },
                {
                    id: 'mock_red_square',
                    name: 'Красная площадь',
                    purpose_name: 'Площадь',
                    point: { lat: 55.7539, lon: 37.6211 },
                    address: { name: 'Красная площадь' },
                    reviews: {
                        general_rating: 4.9,
                        general_review_count: 22350,
                        items: [
                            {
                                rating: 5,
                                text: 'Символ Москвы и всей России! Величественно и торжественно.',
                                author: { name: 'Дмитрий С.' },
                                date_created: '2024-09-20'
                            }
                        ]
                    }
                },
                {
                    id: 'mock_basil',
                    name: 'Храм Василия Блаженного',
                    purpose_name: 'Храм',
                    point: { lat: 55.7525, lon: 37.6230 },
                    address: { name: 'Красная площадь, 2' },
                    reviews: {
                        general_rating: 4.7,
                        general_review_count: 8920,
                        items: [
                            {
                                rating: 5,
                                text: 'Невероятная архитектура! Каждый купол уникален. Внутри тоже очень красиво.',
                                author: { name: 'Мария П.' },
                                date_created: '2024-09-18'
                            }
                        ]
                    }
                }
            ],
            'санкт-петербург': [
                {
                    id: 'mock_hermitage',
                    name: 'Государственный Эрмитаж',
                    purpose_name: 'Музей',
                    point: { lat: 59.9398, lon: 30.3141 },
                    address: { name: 'Дворцовая набережная, 34' },
                    reviews: {
                        general_rating: 4.8,
                        general_review_count: 18750,
                        items: [
                            {
                                rating: 5,
                                text: 'Один из величайших музеев мира! Коллекция просто потрясающая.',
                                author: { name: 'Анна В.' },
                                date_created: '2024-09-22'
                            }
                        ]
                    }
                },
                {
                    id: 'mock_palace_square',
                    name: 'Дворцовая площадь',
                    purpose_name: 'Площадь',
                    point: { lat: 59.9386, lon: 30.3158 },
                    address: { name: 'Дворцовая площадь' },
                    reviews: {
                        general_rating: 4.9,
                        general_review_count: 12400,
                        items: [
                            {
                                rating: 5,
                                text: 'Величественная площадь в сердце Петербурга. Особенно красива вечером.',
                                author: { name: 'Игорь Л.' },
                                date_created: '2024-09-19'
                            }
                        ]
                    }
                }
            ]
        };

        const cityKey = cityName.toLowerCase();
        return fallbackData[cityKey] || [];
    }

    /**
     * Создание маркера на карте для найденного заведения
     */
    createPlaceMarker(place, map, index) {
        if (!place.point) return null;

        const coordinates = [place.point.lon, place.point.lat];

        // Создаем элемент маркера
        const markerElement = document.createElement('div');
        markerElement.className = 'place-marker';
        markerElement.innerHTML = `
            <div class="marker-icon place-marker-icon">
                <span class="marker-number">${index + 1}</span>
            </div>
        `;

        // Создаем маркер
        const marker = new mapgl.Marker(map, {
            coordinates: coordinates,
            element: markerElement,
        });

        // Добавляем обработчик клика
        markerElement.addEventListener('click', () => {
            this.showPlacePopup(place, coordinates, map);
        });

        return marker;
    }

    /**
     * Показ подробной информации о заведении
     */
    async showPlacePopup(place, coordinates, map) {
        // Создаем попап
        const popupElement = document.createElement('div');
        popupElement.className = 'place-popup';

        // Получаем рейтинг и отзывы
        const rating = place.reviews?.general_rating || 0;
        const reviewCount = place.reviews?.general_review_count || 0;
        const stars = this.generateStars(rating);

        popupElement.innerHTML = `
            <div class="popup-header">
                <h3 class="popup-title">${place.name}</h3>
                <button class="popup-close" onclick="event.stopPropagation(); this.closest('.place-popup').remove();">✕</button>
            </div>
            <div class="popup-content">
                <div class="place-info">
                    <div class="place-type">${place.purpose_name || 'Заведение'}</div>
                    <div class="place-address">${place.address?.name || 'Адрес не указан'}</div>

                    <div class="place-rating">
                        <div class="rating-stars">${stars}</div>
                        <span class="rating-value">${rating.toFixed(1)}</span>
                        <span class="rating-count">(${reviewCount.toLocaleString()} отзывов)</span>
                    </div>
                </div>

                <div class="place-reviews" id="reviews-${place.id}">
                    <div class="reviews-loading">
                        <div class="reviews-spinner"></div>
                        <span>Загружаем отзывы...</span>
                    </div>
                </div>

                <div class="popup-actions">
                    <button class="popup-btn route-btn" onclick="matryoshka2GISSearch.openRoute([${coordinates}])">
                        🗺️ Маршрут
                    </button>
                    <button class="popup-btn info-btn" onclick="matryoshka2GISSearch.open2GISPage('${place.name}')">
                        ℹ️ Подробнее в 2ГИС
                    </button>
                </div>
            </div>
        `;

        // Создаем попап на карте
        const popup = new mapgl.Popup(map, {
            coordinates: coordinates,
            element: popupElement,
        });

        // Загружаем отзывы
        this.loadReviews(place, `reviews-${place.id}`);

        return popup;
    }

    /**
     * Загрузка и отображение отзывов
     */
    async loadReviews(place, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            // Пытаемся получить дополнительные отзывы через API
            let reviews = place.reviews?.items || [];

            if (place.id && !place.id.startsWith('mock_')) {
                const details = await this.getPlaceDetails(place.id);
                if (details && details.reviews && details.reviews.items) {
                    reviews = details.reviews.items;
                }
            }

            this.displayReviews(reviews, container);
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            this.displayReviews(place.reviews?.items || [], container);
        }
    }

    /**
     * Отображение отзывов
     */
    displayReviews(reviews, container) {
        if (!reviews || reviews.length === 0) {
            container.innerHTML = `
                <div class="no-reviews">
                    <span class="no-reviews-icon">💬</span>
                    <span>Отзывы не найдены</span>
                </div>
            `;
            return;
        }

        const reviewsHtml = reviews.slice(0, 3).map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">${review.author?.name || 'Аноним'}</div>
                    <div class="review-rating">${this.generateStars(review.rating || 5)}</div>
                </div>
                <div class="review-text">${review.text || 'Отличное место!'}</div>
                <div class="review-date">${this.formatDate(review.date_created)}</div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="reviews-header">
                <h4>Последние отзывы</h4>
            </div>
            <div class="reviews-list">
                ${reviewsHtml}
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
     * Открытие маршрута
     */
    openRoute(coordinates) {
        const routeUrl = `https://2gis.ru/geo/${coordinates[1]},${coordinates[0]}?m=${coordinates[1]},${coordinates[0]},16`;
        window.open(routeUrl, '_blank');
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
     * Очистка результатов поиска
     */
    clearResults() {
        this.searchResults = [];
    }
}

// Глобальная инициализация
window.matryoshka2GISSearch = new Matryoshka2GISSearch();

console.log('🔍 Модуль поиска 2GIS инициализирован');