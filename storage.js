/**
 * Модуль для работы с IndexedDB
 * Правильное хранилище для фотографий и больших данных
 */

(function() {
    'use strict';

    class MatryoshkaStorage {
        constructor() {
            this.dbName = 'MatryoshkaDB';
            this.dbVersion = 1;
            this.db = null;
        }

        /**
         * Инициализация базы данных
         */
        async init() {
            return new Promise((resolve, reject) => {
                console.log('🗄️ Инициализация IndexedDB...');

                const request = indexedDB.open(this.dbName, this.dbVersion);

                request.onerror = () => {
                    console.error('❌ Ошибка открытия IndexedDB:', request.error);
                    reject(request.error);
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    console.log('✅ IndexedDB открыта успешно');
                    resolve(this.db);
                };

                request.onupgradeneeded = (event) => {
                    console.log('🔧 Обновление структуры базы данных...');
                    const db = event.target.result;

                    // Создаем хранилище для путешествий
                    if (!db.objectStoreNames.contains('travels')) {
                        const travelStore = db.createObjectStore('travels', { keyPath: 'id' });
                        console.log('✅ Создано хранилище "travels"');
                    }

                    // Создаем хранилище для фотографий
                    if (!db.objectStoreNames.contains('photos')) {
                        const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
                        photoStore.createIndex('travelId', 'travelId', { unique: false });
                        console.log('✅ Создано хранилище "photos"');
                    }

                    // Создаем хранилище для профиля
                    if (!db.objectStoreNames.contains('profile')) {
                        const profileStore = db.createObjectStore('profile', { keyPath: 'key' });
                        console.log('✅ Создано хранилище "profile"');
                    }
                };
            });
        }

        /**
         * Сохранить путешествие
         */
        async saveTravel(travel) {
            console.log('💾 Сохраняем путешествие:', travel.title);

            // Извлекаем фотографии
            const photos = travel.images || [];
            delete travel.images; // Удаляем из объекта путешествия

            // Сохраняем само путешествие
            await this._put('travels', travel);

            // Сохраняем фотографии отдельно
            for (let i = 0; i < photos.length; i++) {
                const photoData = photos[i];
                await this.savePhoto(travel.id, i, photoData);
            }

            console.log('✅ Путешествие сохранено с', photos.length, 'фотографиями');
        }

        /**
         * Сохранить фотографию
         */
        async savePhoto(travelId, index, base64Data) {
            // Конвертируем base64 в Blob для эффективного хранения
            const blob = await this._base64ToBlob(base64Data);

            const photoObj = {
                travelId: travelId,
                index: index,
                blob: blob,
                timestamp: Date.now()
            };

            await this._put('photos', photoObj);
            console.log(`  📸 Фото ${index + 1} сохранено (${(blob.size / 1024).toFixed(2)} KB)`);
        }

        /**
         * Получить все путешествия
         */
        async getAllTravels() {
            console.log('📖 Загружаем все путешествия...');

            const travels = await this._getAll('travels');
            console.log('  ✅ Загружено путешествий:', travels.length);

            // Загружаем фотографии для каждого путешествия
            for (let travel of travels) {
                travel.images = await this.getPhotosForTravel(travel.id);
                if (travel.images.length > 0) {
                    travel.image = travel.images[0]; // Первое фото как обложка
                }
            }

            console.log('✅ Все путешествия загружены с фотографиями');
            return travels;
        }

        /**
         * Получить фотографии для путешествия
         */
        async getPhotosForTravel(travelId) {
            const transaction = this.db.transaction(['photos'], 'readonly');
            const store = transaction.objectStore('photos');
            const index = store.index('travelId');

            return new Promise((resolve, reject) => {
                const request = index.getAll(travelId);

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

                request.onerror = () => reject(request.error);
            });
        }

        /**
         * Удалить путешествие
         */
        async deleteTravel(travelId) {
            console.log('🗑️ Удаляем путешествие ID:', travelId);

            // Удаляем фотографии
            const photos = await this._getAllByIndex('photos', 'travelId', travelId);
            for (let photo of photos) {
                await this._delete('photos', photo.id);
            }

            // Удаляем путешествие
            await this._delete('travels', travelId);

            console.log('✅ Путешествие удалено');
        }

        /**
         * Сохранить данные профиля
         */
        async saveProfile(profileData) {
            console.log('💾 Сохраняем профиль...');
            await this._put('profile', { key: 'data', ...profileData });
            console.log('✅ Профиль сохранен');
        }

        /**
         * Получить данные профиля
         */
        async getProfile() {
            const data = await this._get('profile', 'data');
            return data || null;
        }

        // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

        async _put(storeName, data) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            return new Promise((resolve, reject) => {
                const request = store.put(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }

        async _get(storeName, key) {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);

            return new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }

        async _getAll(storeName) {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);

            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }

        async _getAllByIndex(storeName, indexName, value) {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);

            return new Promise((resolve, reject) => {
                const request = index.getAll(value);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }

        async _delete(storeName, key) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            return new Promise((resolve, reject) => {
                const request = store.delete(key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }

        /**
         * Конвертировать base64 в Blob
         */
        async _base64ToBlob(base64) {
            const response = await fetch(base64);
            const blob = await response.blob();
            return blob;
        }

        /**
         * Конвертировать Blob в base64
         */
        async _blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        /**
         * Получить размер базы данных (примерно)
         */
        async getStorageSize() {
            const travels = await this._getAll('travels');
            const photos = await this._getAll('photos');

            let totalSize = 0;
            for (let photo of photos) {
                totalSize += photo.blob.size;
            }

            console.log('📦 Размер хранилища:');
            console.log('  - Путешествий:', travels.length);
            console.log('  - Фотографий:', photos.length);
            console.log('  - Размер фото:', (totalSize / 1024 / 1024).toFixed(2), 'MB');

            return {
                travels: travels.length,
                photos: photos.length,
                sizeBytes: totalSize,
                sizeMB: totalSize / 1024 / 1024
            };
        }

        /**
         * Очистить все данные
         */
        async clearAll() {
            console.log('🗑️ Очистка всей базы данных...');

            const storeNames = ['travels', 'photos', 'profile'];
            for (let storeName of storeNames) {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                await new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }

            console.log('✅ База данных очищена');
        }
    }

    // Создаем глобальный экземпляр
    window.matryoshkaStorage = new MatryoshkaStorage();

    console.log('✅ Модуль MatryoshkaStorage загружен');
})();
