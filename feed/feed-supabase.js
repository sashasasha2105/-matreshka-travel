/**
 * Модуль для загрузки фотографий из Supabase
 */

class SupabaseFeedLoader {
    constructor(apiUrl) {
        // URL API может быть локальным или удаленным
        this.apiUrl = apiUrl || 'http://localhost:5000/api';
        this.photos = [];
        this.isLoading = false;
        console.log('✅ SupabaseFeedLoader инициализирован:', this.apiUrl);
    }

    /**
     * Загрузить фотографии из Supabase
     */
    async loadPhotos(limit = 50, offset = 0) {
        try {
            console.log(`📥 Загрузка фотографий из Supabase (limit: ${limit}, offset: ${offset})...`);
            this.isLoading = true;

            const response = await fetch(`${this.apiUrl}/photos?limit=${limit}&offset=${offset}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.photos) {
                this.photos = data.photos;
                console.log(`✅ Загружено ${this.photos.length} фотографий из Supabase`);
                console.log('📊 Данные фотографий:', this.photos);
                return this.photos;
            } else {
                console.error('❌ Ошибка в ответе API:', data);
                return [];
            }

        } catch (error) {
            console.error('❌ Ошибка загрузки фотографий из Supabase:', error);
            return [];
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Преобразовать фотографию из Supabase в формат для ленты
     */
    convertPhotoToTravel(photo) {
        const user = photo.user || {};

        return {
            id: photo.id,
            globalId: `supabase_${photo.id}`,
            title: `${user.first_name || 'Путешественник'} ${user.last_name || ''}`,
            text: new Date(photo.created_at).toLocaleString('ru-RU'),
            images: [photo.photo_url],
            author: {
                username: user.username || 'unknown',
                firstName: user.first_name || 'Путешественник',
                lastName: user.last_name || '',
                photo: null
            },
            likes: 0,
            liked: false,
            createdAt: new Date(photo.created_at).getTime(),
            source: 'supabase'
        };
    }

    /**
     * Получить фотографии конкретного пользователя
     */
    async getUserPhotos(telegramId, limit = 50) {
        try {
            const response = await fetch(`${this.apiUrl}/users/${telegramId}/photos?limit=${limit}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                console.log(`✅ Загружено ${data.photos.length} фото пользователя ${telegramId}`);
                return data.photos;
            }

            return [];
        } catch (error) {
            console.error('❌ Ошибка загрузки фото пользователя:', error);
            return [];
        }
    }

    /**
     * Проверка доступности API
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.apiUrl}/health`);

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            console.log('✅ API статус:', data);
            return data.status === 'healthy';
        } catch (error) {
            console.error('❌ API недоступен:', error);
            return false;
        }
    }
}

// Создаем глобальный экземпляр
// По умолчанию используем localhost, но можно переопределить
window.supabaseFeed = new SupabaseFeedLoader();

console.log('✅ SupabaseFeedLoader готов к использованию');
