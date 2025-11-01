/**
 * Глобальная база данных путешествий
 * Хранит все путешествия всех пользователей в localStorage
 */

class TravelDatabase {
    constructor() {
        this.storageKey = 'matryoshka_all_travels';
        this.travels = this.loadAll();
        console.log('✅ TravelDatabase инициализирована, путешествий:', this.travels.length);
    }

    /**
     * Загрузить все путешествия из localStorage
     */
    loadAll() {
        try {
            console.log('📖📖📖 ЗАГРУЗКА ИЗ localStorage 📖📖📖');
            console.log('🔑 Ключ:', this.storageKey);

            const data = localStorage.getItem(this.storageKey);

            if (!data) {
                console.log('⚠️ Данные не найдены в localStorage');
                return [];
            }

            console.log('📦 Размер данных в localStorage:', data.length, 'символов');
            console.log('📦 Размер в KB:', (data.length / 1024).toFixed(2), 'KB');

            const parsed = JSON.parse(data);
            console.log('✅ Распарсено путешествий:', parsed.length);

            if (parsed.length > 0) {
                const first = parsed[0];
                console.log('🔍 Проверка первого путешествия:');
                console.log('  - Название:', first.title);
                console.log('  - ID:', first.id);
                console.log('  - GlobalID:', first.globalId);
                console.log('  - Изображения:', first.images);
                console.log('  - Количество изображений:', first.images?.length);

                if (first.images && first.images.length > 0) {
                    console.log('  - Первое изображение существует:', first.images[0] ? 'ДА' : 'НЕТ');
                    console.log('  - Тип первого изображения:', typeof first.images[0]);
                    console.log('  - Длина первого изображения:', first.images[0]?.length);
                    console.log('  - Начинается с:', first.images[0]?.substring(0, 100));
                } else {
                    console.error('❌ ПРОБЛЕМА: В первом путешествии НЕТ изображений!');
                }
            }

            return parsed;
        } catch (error) {
            console.error('❌ Ошибка загрузки путешествий:', error);
            return [];
        }
    }

    /**
     * Сохранить все путешествия в localStorage
     */
    saveAll() {
        try {
            console.log('💾💾💾 СОХРАНЕНИЕ В localStorage 💾💾💾');
            console.log('🔑 Ключ:', this.storageKey);
            console.log('📊 Путешествий в памяти для сохранения:', this.travels.length);

            // Проверяем первое путешествие перед сохранением
            if (this.travels.length > 0) {
                const first = this.travels[0];
                console.log('🔍 Проверка первого путешествия ПЕРЕД сохранением:');
                console.log('  - Название:', first.title);
                console.log('  - Изображения:', first.images);
                console.log('  - Количество изображений:', first.images?.length);
                if (first.images && first.images.length > 0) {
                    console.log('  - Первое изображение (первые 50 символов):', first.images[0]?.substring(0, 50));
                }
            }

            const dataToSave = JSON.stringify(this.travels);
            console.log('📦 Размер JSON для сохранения:', dataToSave.length, 'символов');
            console.log('📦 Размер в KB:', (dataToSave.length / 1024).toFixed(2), 'KB');

            localStorage.setItem(this.storageKey, dataToSave);
            console.log('✅ Данные записаны в localStorage');

            // Проверяем, что данные действительно сохранились
            const verification = localStorage.getItem(this.storageKey);
            if (verification) {
                const verParsed = JSON.parse(verification);
                console.log('✅ Проверка: в localStorage сохранено путешествий:', verParsed.length);

                if (verParsed.length > 0) {
                    const verFirst = verParsed[0];
                    console.log('✅ Проверка: изображения в первом путешествии:', verFirst.images?.length);
                    if (verFirst.images && verFirst.images.length > 0) {
                        console.log('✅ Проверка: первое изображение присутствует, длина:', verFirst.images[0]?.length);
                    } else {
                        console.error('❌ КРИТИЧЕСКАЯ ПРОБЛЕМА: После сохранения в первом путешествии НЕТ изображений!');
                    }
                }
            } else {
                console.error('❌ Проверка: данные НЕ сохранились в localStorage!');
            }
        } catch (error) {
            console.error('❌❌❌ ОШИБКА СОХРАНЕНИЯ:', error);
            console.error('Детали:', error.message);

            // Проверяем размер localStorage
            try {
                let total = 0;
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        total += localStorage[key].length + key.length;
                    }
                }
                console.error('Текущий размер localStorage:', (total / 1024).toFixed(2), 'KB');
            } catch (e) {
                console.error('Не удалось посчитать размер localStorage');
            }
        }
    }

    /**
     * Добавить новое путешествие в глобальную ленту
     * @param {Object} travel - Объект путешествия
     * @param {Object} userInfo - Информация о пользователе (опционально)
     */
    add(travel, userInfo = null) {
        console.log('➕ TravelDatabase.add() вызвана');
        console.log('📥 Входящее путешествие:', travel);
        console.log('👤 Входящий userInfo:', userInfo);
        console.log('🖼️ Изображения во входящем путешествии:', travel.images);
        console.log('🖼️ Количество изображений:', travel.images?.length);
        if (travel.images && travel.images.length > 0) {
            console.log('🖼️ Первое изображение (первые 100 символов):', travel.images[0].substring(0, 100));
        }

        // Добавляем информацию о пользователе если есть
        const enrichedTravel = {
            ...travel,
            globalId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            author: userInfo || this.getDefaultUserInfo(),
            likes: travel.likes || 0,
            liked: false  // Для текущего пользователя
        };

        console.log('📦 Обогащенное путешествие:', enrichedTravel);
        console.log('🖼️ Изображения в обогащенном путешествии:', enrichedTravel.images);
        console.log('🖼️ Количество изображений в обогащенном:', enrichedTravel.images?.length);

        this.travels.unshift(enrichedTravel); // Добавляем в начало (свежие сверху)
        console.log('💾 Сохраняем в localStorage...');
        this.saveAll();

        console.log('✅ Путешествие добавлено в глобальную ленту:', enrichedTravel.title);
        console.log('📊 Всего путешествий в памяти:', this.travels.length);
        return enrichedTravel;
    }

    /**
     * Получить информацию о текущем пользователе по умолчанию
     */
    getDefaultUserInfo() {
        // Получаем из Telegram WebApp или используем данные по умолчанию
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
            return {
                id: tgUser.id,
                username: tgUser.username || `user_${tgUser.id}`,
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                photo: tgUser.photo_url || null
            };
        }

        // Данные по умолчанию
        return {
            id: 'local_user',
            username: 'Путешественник',
            firstName: 'Анонимный',
            lastName: 'Пользователь',
            photo: null
        };
    }

    /**
     * Удалить путешествие из глобальной ленты
     * @param {Number} travelId - ID путешествия (локальный ID из профиля)
     */
    removeByLocalId(travelId) {
        const beforeCount = this.travels.length;
        this.travels = this.travels.filter(t => t.id !== travelId);
        this.saveAll();

        const removed = beforeCount - this.travels.length;
        if (removed > 0) {
            console.log(`🗑️ Удалено из глобальной ленты: ${removed} путешествие(-ий)`);
        }
    }

    /**
     * Удалить путешествие по глобальному ID
     * @param {String} globalId - Глобальный ID путешествия
     */
    removeByGlobalId(globalId) {
        this.travels = this.travels.filter(t => t.globalId !== globalId);
        this.saveAll();
        console.log('🗑️ Путешествие удалено из ленты');
    }

    /**
     * Получить все путешествия для ленты (отсортированные по дате)
     * @param {Number} limit - Максимальное количество (опционально)
     */
    getAll(limit = null) {
        const sorted = [...this.travels].sort((a, b) => b.createdAt - a.createdAt);
        return limit ? sorted.slice(0, limit) : sorted;
    }

    /**
     * Получить путешествия конкретного пользователя
     * @param {String} userId - ID пользователя
     */
    getByUser(userId) {
        return this.travels.filter(t => t.author.id === userId);
    }

    /**
     * Поставить/убрать лайк
     * @param {String} globalId - Глобальный ID путешествия
     */
    toggleLike(globalId) {
        const travel = this.travels.find(t => t.globalId === globalId);
        if (travel) {
            travel.liked = !travel.liked;
            travel.likes = (travel.likes || 0) + (travel.liked ? 1 : -1);
            this.saveAll();
            console.log(`${travel.liked ? '❤️' : '🤍'} Лайк переключен для:`, travel.title);
            return travel;
        }
        return null;
    }

    /**
     * Очистить всю базу данных (для отладки)
     */
    clearAll() {
        this.travels = [];
        this.saveAll();
        console.log('🗑️ База данных путешествий очищена');
    }

    /**
     * Получить статистику
     */
    getStats() {
        return {
            total: this.travels.length,
            totalLikes: this.travels.reduce((sum, t) => sum + (t.likes || 0), 0),
            uniqueAuthors: new Set(this.travels.map(t => t.author.id)).size
        };
    }
}

// Создаем глобальный экземпляр базы данных
window.travelDatabase = new TravelDatabase();

// Экспортируем для использования в других модулях
console.log('✅ TravelDatabase готова к использованию');
