/**
 * Глобальная база данных путешествий
 * ПОЛНОСТЬЮ ПЕРЕРАБОТАНА: IndexedDB вместо localStorage
 * Решает проблему переполнения и гарантирует постоянное отображение фото
 */

class TravelDatabase {
    constructor() {
        this.dbName = 'MatryoshkaGlobalDB';
        this.dbVersion = 2;
        this.db = null;
        this.travels = []; // Кэш в памяти для быстрого доступа
        this.isReady = false;

        // Автоматическая инициализация
        this.init().catch(error => {
            console.error('❌ Ошибка инициализации TravelDatabase:', error);
        });
    }

    /**
     * Инициализация IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            console.log('🗄️ Инициализация глобальной базы путешествий (IndexedDB)...');

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ Ошибка открытия IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = async () => {
                this.db = request.result;
                console.log('✅ Глобальная база IndexedDB открыта');

                // Загружаем данные в кэш
                await this.loadAllToCache();
                this.isReady = true;

                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                console.log('🔧 Создание/обновление структуры глобальной базы...');
                const db = event.target.result;

                // Создаем хранилище для глобальных путешествий
                if (!db.objectStoreNames.contains('globalTravels')) {
                    const store = db.createObjectStore('globalTravels', { keyPath: 'globalId' });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                    store.createIndex('authorId', 'author.id', { unique: false });
                    console.log('✅ Создано хранилище "globalTravels"');
                }

                // Создаем хранилище для фотографий глобальной ленты
                if (!db.objectStoreNames.contains('globalPhotos')) {
                    const photoStore = db.createObjectStore('globalPhotos', { keyPath: 'id', autoIncrement: true });
                    photoStore.createIndex('globalId', 'globalId', { unique: false });
                    photoStore.createIndex('index', 'index', { unique: false });
                    console.log('✅ Создано хранилище "globalPhotos"');
                }
            };
        });
    }

    /**
     * Загрузить все путешествия в кэш памяти
     */
    async loadAllToCache() {
        try {
            console.log('📖 Загрузка всех путешествий в кэш...');

            const travels = await this._getAllTravels();

            // Загружаем фотографии для каждого путешествия
            for (let travel of travels) {
                // 🔥 НОВАЯ ЛОГИКА: Если images уже есть в объекте (URL-ы с сервера), НЕ перезаписываем!
                if (!travel.images || travel.images.length === 0) {
                    console.log(`📥 Загружаем base64 фотографии для "${travel.title}"`);
                    travel.images = await this.getPhotosForTravel(travel.globalId);
                } else {
                    console.log(`🌐 Используем сохраненные URL-ы для "${travel.title}": ${travel.images.length} фото`);
                }
            }

            this.travels = travels;
            console.log('✅ Загружено путешествий в кэш:', this.travels.length);

            if (this.travels.length > 0) {
                console.log('🔍 Первое путешествие:', this.travels[0].title);
                console.log('🖼️ Фото в первом путешествии:', this.travels[0].images?.length);
                if (this.travels[0].images && this.travels[0].images.length > 0) {
                    console.log('📸 Первое фото:', this.travels[0].images[0].substring(0, 50) + '...');
                }
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки в кэш:', error);
            this.travels = [];
        }
    }

    /**
     * Ожидание готовности базы данных
     */
    async waitForReady() {
        if (this.isReady) return;

        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.isReady) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    /**
     * Добавить новое путешествие в глобальную ленту
     * @param {Object} travel - Объект путешествия
     * @param {Object} userInfo - Информация о пользователе (опционально)
     */
    async add(travel, userInfo = null) {
        await this.waitForReady();

        console.log('➕ TravelDatabase.add() - добавление в IndexedDB');
        console.log('📥 Входящее путешествие:', travel.title);
        console.log('🖼️ Количество изображений:', travel.images?.length);

        // Создаем обогащенный объект путешествия
        const enrichedTravel = {
            ...travel,
            globalId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            author: userInfo || this.getDefaultUserInfo(),
            likes: travel.likes || 0,
            liked: false,
            images: travel.images || [] // 🔥 СОХРАНЯЕМ URL-Ы В ОБЪЕКТЕ!
        };

        // Извлекаем фотографии для IndexedDB (только base64)
        const photos = enrichedTravel.images || [];
        const base64Photos = photos.filter(p => !p.startsWith('http://') && !p.startsWith('https://'));

        console.log(`📸 Всего фотографий: ${photos.length}, из них base64: ${base64Photos.length}, URL: ${photos.length - base64Photos.length}`);

        try {
            // Сохраняем путешествие (с URL-ами в объекте!)
            await this._putTravel(enrichedTravel);
            console.log('✅ Путешествие сохранено в IndexedDB (с URL-ами)');

            // Сохраняем только base64 фотографии в отдельное хранилище
            if (base64Photos.length > 0) {
                const savePromises = base64Photos.map((photoData, i) =>
                    this.savePhoto(enrichedTravel.globalId, i, photoData)
                );
                await Promise.all(savePromises);
                console.log('✅ Base64 фотографии сохранены в IndexedDB:', base64Photos.length);
            }

            // Добавляем в кэш с фотографиями (URL-ы уже есть в объекте)
            this.travels.unshift(enrichedTravel);

            console.log('✅ Путешествие добавлено в глобальную ленту:', enrichedTravel.title);
            console.log('📊 Всего путешествий:', this.travels.length);

            return enrichedTravel;
        } catch (error) {
            console.error('❌ Ошибка добавления путешествия:', error);
            throw error;
        }
    }

    /**
     * Сохранить фотографию в IndexedDB
     * ВАЖНО: Если photoData это URL (начинается с http), то НЕ сохраняем в IndexedDB!
     */
    async savePhoto(globalId, index, photoData) {
        try {
            // 🔥 НОВАЯ ЛОГИКА: Проверяем, это URL или base64
            if (photoData.startsWith('http://') || photoData.startsWith('https://')) {
                console.log(`  🌐 Фото ${index + 1} - это URL, пропускаем сохранение в IndexedDB:`, photoData.substring(0, 50) + '...');
                // URL-ы не сохраняем в IndexedDB, они будут грузиться с сервера
                return;
            }

            console.log(`  💾 Фото ${index + 1} - это base64, сохраняем в IndexedDB`);

            // Сжимаем фото если доступна компрессия
            let compressedData = photoData;
            if (window.imageCompression) {
                try {
                    compressedData = await window.imageCompression.compressImage(
                        photoData,
                        1200,  // Увеличил разрешение для качества
                        900,
                        0.85   // Увеличил качество
                    );
                } catch (error) {
                    console.warn('⚠️ Сжатие не удалось, используем оригинал');
                }
            }

            // Конвертируем в Blob для эффективного хранения
            const blob = await this._base64ToBlob(compressedData);

            const photoObj = {
                globalId: globalId,
                index: index,
                blob: blob,
                timestamp: Date.now()
            };

            await this._putPhoto(photoObj);
            console.log(`  📸 Фото ${index + 1} сохранено (${(blob.size / 1024).toFixed(2)} KB)`);
        } catch (error) {
            console.error(`❌ Ошибка сохранения фото ${index + 1}:`, error);
            throw error;
        }
    }

    /**
     * Получить фотографии для путешествия
     */
    async getPhotosForTravel(globalId) {
        try {
            const transaction = this.db.transaction(['globalPhotos'], 'readonly');
            const store = transaction.objectStore('globalPhotos');
            const index = store.index('globalId');

            return new Promise((resolve, reject) => {
                const request = index.getAll(globalId);

                request.onsuccess = async () => {
                    const photos = request.result;

                    // Сортируем по индексу
                    photos.sort((a, b) => a.index - b.index);

                    // Конвертируем Blob обратно в base64
                    const base64Photos = [];
                    for (let photo of photos) {
                        const base64 = await this._blobToBase64(photo.blob);
                        base64Photos.push(base64);
                    }

                    resolve(base64Photos);
                };

                request.onerror = () => {
                    console.error('❌ Ошибка загрузки фото:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Ошибка getPhotosForTravel:', error);
            return [];
        }
    }

    /**
     * Получить все путешествия для ленты (из кэша)
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
        return this.travels.filter(t => t.author && t.author.id === userId);
    }

    /**
     * Удалить путешествие по локальному ID
     * @param {Number} travelId - ID путешествия (локальный ID из профиля)
     */
    async removeByLocalId(travelId) {
        await this.waitForReady();

        // Находим путешествие с таким localId
        const travel = this.travels.find(t => t.id === travelId);
        if (!travel) {
            console.warn('⚠️ Путешествие не найдено:', travelId);
            return;
        }

        await this.removeByGlobalId(travel.globalId);
    }

    /**
     * Удалить путешествие по глобальному ID
     * @param {String} globalId - Глобальный ID путешествия
     */
    async removeByGlobalId(globalId) {
        await this.waitForReady();

        try {
            console.log('🗑️ Удаление путешествия:', globalId);

            // Удаляем фотографии
            const photos = await this._getPhotosByGlobalId(globalId);
            for (let photo of photos) {
                await this._deletePhoto(photo.id);
            }

            // Удаляем путешествие
            await this._deleteTravel(globalId);

            // Удаляем из кэша
            this.travels = this.travels.filter(t => t.globalId !== globalId);

            console.log('✅ Путешествие удалено');
        } catch (error) {
            console.error('❌ Ошибка удаления:', error);
            throw error;
        }
    }

    /**
     * Поставить/убрать лайк
     * @param {String} globalId - Глобальный ID путешествия
     */
    async toggleLike(globalId) {
        await this.waitForReady();

        const travel = this.travels.find(t => t.globalId === globalId);
        if (travel) {
            travel.liked = !travel.liked;
            travel.likes = (travel.likes || 0) + (travel.liked ? 1 : -1);

            // Обновляем в базе
            try {
                await this._updateTravel(travel);
                console.log(`${travel.liked ? '❤️' : '🤍'} Лайк переключен для:`, travel.title);
                return travel;
            } catch (error) {
                console.error('❌ Ошибка обновления лайка:', error);
            }
        }
        return null;
    }

    /**
     * Очистить всю базу данных (для отладки)
     */
    async clearAll() {
        await this.waitForReady();

        try {
            console.log('🗑️ Очистка глобальной базы данных...');

            const travelsTransaction = this.db.transaction(['globalTravels'], 'readwrite');
            const travelsStore = travelsTransaction.objectStore('globalTravels');
            await travelsStore.clear();

            const photosTransaction = this.db.transaction(['globalPhotos'], 'readwrite');
            const photosStore = photosTransaction.objectStore('globalPhotos');
            await photosStore.clear();

            this.travels = [];
            console.log('✅ База данных очищена');
        } catch (error) {
            console.error('❌ Ошибка очистки:', error);
        }
    }

    /**
     * Получить статистику
     */
    getStats() {
        return {
            total: this.travels.length,
            totalLikes: this.travels.reduce((sum, t) => sum + (t.likes || 0), 0),
            uniqueAuthors: new Set(this.travels.map(t => t.author?.id).filter(Boolean)).size,
            isReady: this.isReady
        };
    }

    /**
     * Получить информацию о текущем пользователе
     */
    getDefaultUserInfo() {
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
            return {
                id: tgUser.id,
                username: tgUser.username || `user_${tgUser.id}`,
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                photo: tgUser.photo_url || null
            };
        }

        return {
            id: 'local_user',
            username: 'Путешественник',
            firstName: 'Анонимный',
            lastName: 'Пользователь',
            photo: null
        };
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ IndexedDB ==========

    async _putTravel(travel) {
        const transaction = this.db.transaction(['globalTravels'], 'readwrite');
        const store = transaction.objectStore('globalTravels');

        return new Promise((resolve, reject) => {
            const request = store.put(travel);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async _putPhoto(photo) {
        const transaction = this.db.transaction(['globalPhotos'], 'readwrite');
        const store = transaction.objectStore('globalPhotos');

        return new Promise((resolve, reject) => {
            const request = store.put(photo);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async _getAllTravels() {
        const transaction = this.db.transaction(['globalTravels'], 'readonly');
        const store = transaction.objectStore('globalTravels');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async _getPhotosByGlobalId(globalId) {
        const transaction = this.db.transaction(['globalPhotos'], 'readonly');
        const store = transaction.objectStore('globalPhotos');
        const index = store.index('globalId');

        return new Promise((resolve, reject) => {
            const request = index.getAll(globalId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async _deleteTravel(globalId) {
        const transaction = this.db.transaction(['globalTravels'], 'readwrite');
        const store = transaction.objectStore('globalTravels');

        return new Promise((resolve, reject) => {
            const request = store.delete(globalId);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async _deletePhoto(photoId) {
        const transaction = this.db.transaction(['globalPhotos'], 'readwrite');
        const store = transaction.objectStore('globalPhotos');

        return new Promise((resolve, reject) => {
            const request = store.delete(photoId);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async _updateTravel(travel) {
        // Создаем копию без images для сохранения
        const travelCopy = { ...travel };
        delete travelCopy.images;

        return await this._putTravel(travelCopy);
    }

    async _base64ToBlob(base64) {
        const response = await fetch(base64);
        return await response.blob();
    }

    async _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}

// Создаем глобальный экземпляр базы данных
window.travelDatabase = new TravelDatabase();

// 🗑️ ОЧИСТКА ВСЕХ ПУТЕШЕСТВИЙ ПРИ ИНИЦИАЛИЗАЦИИ
window.travelDatabase.waitForReady().then(() => {
    console.log('🗑️ Очистка всех путешествий из базы данных...');
    window.travelDatabase.clearAll().then(() => {
        console.log('✅ Все путешествия удалены из базы данных');
    });
});

console.log('✅ TravelDatabase (IndexedDB) инициализируется...');
