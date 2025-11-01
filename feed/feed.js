/**
 * Лента путешествий - отображение всех путешествий пользователей
 */

class TravelFeed {
    constructor() {
        this.database = window.travelDatabase;
        this.container = null;
        console.log('✅ TravelFeed инициализирована');
    }

    /**
     * Отобразить ленту путешествий
     */
    render() {
        const container = document.querySelector('#mainSection');
        if (!container) {
            console.error('❌ #mainSection не найден');
            return;
        }

        this.container = container;
        const travels = this.database.getAll();

        const html = `
            <div class="feed-container">
                <div class="feed-header">
                    <h2 class="feed-title">
                        <span class="feed-icon">🌍</span>
                        Лента путешествий
                    </h2>
                    <div class="feed-stats">
                        ${travels.length} ${this.getWordForm(travels.length, ['путешествие', 'путешествия', 'путешествий'])}
                    </div>
                </div>

                ${travels.length === 0 ? this.renderEmptyState() : this.renderTravels(travels)}
            </div>
        `;

        container.innerHTML = html;
        this.attachEventListeners();
    }

    /**
     * Пустое состояние ленты
     */
    renderEmptyState() {
        return `
            <div class="feed-empty">
                <div class="feed-empty-icon">🗺️</div>
                <h3 class="feed-empty-title">Пока нет путешествий</h3>
                <p class="feed-empty-text">Станьте первым, кто поделится своим путешествием!</p>
                <button class="feed-empty-btn" onclick="showSection('profileSection')">
                    📸 Добавить путешествие
                </button>
            </div>
        `;
    }

    /**
     * Отрисовка списка путешествий
     */
    renderTravels(travels) {
        return `
            <div class="feed-grid">
                ${travels.map(travel => this.renderTravelCard(travel)).join('')}
            </div>
        `;
    }

    /**
     * Отрисовка карточки путешествия
     */
    renderTravelCard(travel) {
        const author = travel.author || {};
        const authorName = author.firstName ? `${author.firstName} ${author.lastName || ''}` : author.username || 'Аноним';
        const timeAgo = this.getTimeAgo(travel.createdAt);

        return `
            <div class="feed-card" data-global-id="${travel.globalId}">
                <!-- Шапка с автором -->
                <div class="feed-card-header">
                    <div class="feed-author">
                        <div class="feed-author-avatar">
                            ${author.photo ? `<img src="${author.photo}" alt="${authorName}">` : `<span>${this.getInitials(authorName)}</span>`}
                        </div>
                        <div class="feed-author-info">
                            <div class="feed-author-name">${authorName}</div>
                            <div class="feed-author-time">${timeAgo}</div>
                        </div>
                    </div>
                </div>

                <!-- Фотографии -->
                <div class="feed-card-images" onclick="matryoshkaFeed.openGallery('${travel.globalId}')">
                    ${this.generatePhotoGrid(travel.images)}
                </div>

                <!-- Контент -->
                <div class="feed-card-content">
                    <h4 class="feed-card-title">${travel.title}</h4>
                    <p class="feed-card-text">${travel.text}</p>
                </div>

                <!-- Футер с лайками -->
                <div class="feed-card-footer">
                    <button class="feed-like-btn ${travel.liked ? 'liked' : ''}"
                            onclick="matryoshkaFeed.toggleLike('${travel.globalId}')">
                        <span class="feed-like-icon">${travel.liked ? '❤️' : '🤍'}</span>
                        <span class="feed-like-count">${travel.likes || 0}</span>
                    </button>
                    <div class="feed-card-location">
                        📍 ${travel.title.split(',')[0]}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Генерация адаптивной сетки фотографий (как в профиле)
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
     * Получить инициалы из имени
     */
    getInitials(name) {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    /**
     * Получить относительное время
     */
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} ${this.getWordForm(days, ['день', 'дня', 'дней'])} назад`;
        if (hours > 0) return `${hours} ${this.getWordForm(hours, ['час', 'часа', 'часов'])} назад`;
        if (minutes > 0) return `${minutes} ${this.getWordForm(minutes, ['минуту', 'минуты', 'минут'])} назад`;
        return 'только что';
    }

    /**
     * Склонение числительных
     */
    getWordForm(number, words) {
        const cases = [2, 0, 1, 1, 1, 2];
        return words[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]];
    }

    /**
     * Переключить лайк
     */
    toggleLike(globalId) {
        const travel = this.database.toggleLike(globalId);
        if (travel) {
            // Обновляем UI
            const card = document.querySelector(`[data-global-id="${globalId}"]`);
            if (card) {
                const likeBtn = card.querySelector('.feed-like-btn');
                const likeIcon = likeBtn.querySelector('.feed-like-icon');
                const likeCount = likeBtn.querySelector('.feed-like-count');

                likeBtn.classList.toggle('liked', travel.liked);
                likeIcon.textContent = travel.liked ? '❤️' : '🤍';
                likeCount.textContent = travel.likes || 0;

                // Анимация
                likeIcon.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    likeIcon.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }

    /**
     * Открыть галерею фотографий
     */
    openGallery(globalId) {
        const travel = this.database.travels.find(t => t.globalId === globalId);
        if (travel && travel.images) {
            // Используем существующую систему галереи из профиля
            if (window.matryoshkaProfile && typeof window.matryoshkaProfile.showPhotoGalleryModal === 'function') {
                window.matryoshkaProfile.showPhotoGalleryModal(travel.images, 0);
            }
        }
    }

    /**
     * Привязка обработчиков событий
     */
    attachEventListeners() {
        // Обработчики уже привязаны через onclick в HTML
        console.log('✅ Feed event listeners attached');
    }
}

// Создаем глобальный экземпляр
window.matryoshkaFeed = new TravelFeed();

console.log('✅ TravelFeed готова к использованию');
