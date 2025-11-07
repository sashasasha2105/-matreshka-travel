/**
 * 🚀 МОДУЛЬ ДЛЯ РАБОТЫ С ФОТО-СЕРВЕРОМ
 * Загружает и получает фотографии с внешнего сервера
 * Быстрая загрузка, моментальное отображение
 */

class PhotoStorageServer {
    constructor() {
        // URL сервера на Railway
        this.serverUrl = 'https://matreshka-photo-server-production.up.railway.app';
        console.log('✅ PhotoStorageServer инициализирован');
        console.log('🌐 Сервер URL:', this.serverUrl);
    }

    /**
     * Загрузить фотографию на сервер
     * @param {File|Blob} file - Файл фотографии
     * @param {String} travelId - ID путешествия
     * @param {String} userId - ID пользователя
     * @returns {Promise<String>} - URL загруженной фотографии
     */
    async uploadPhoto(file, travelId = '', userId = '') {
        try {
            console.log('📤 Загрузка фотографии на сервер...');

            // Получаем информацию о пользователе из Telegram WebApp
            const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
            const telegramUserId = telegramUser?.id || 'unknown';
            const username = telegramUser?.username || telegramUser?.first_name || 'Пользователь';

            // Формируем детальный user_id
            const detailedUserId = userId || `${username} (ID: ${telegramUserId})`;

            const formData = new FormData();
            formData.append('photo', file);
            formData.append('travel_id', travelId);
            formData.append('user_id', detailedUserId);
            formData.append('photo_type', 'travel');  // Указываем что это фото из ленты

            const response = await fetch(`${this.serverUrl}/api/upload-photo`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Ошибка сервера:', response.status, errorText);
                throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Неизвестная ошибка');
            }

            console.log('✅ Фотография загружена на сервер и отправлена в Telegram бот:', data.photo_id);
            console.log('📊 Размер:', (data.size / 1024).toFixed(2), 'KB');

            // Возвращаем полный URL
            return `${this.serverUrl}${data.photo_url}`;

        } catch (error) {
            console.error('❌ Ошибка загрузки фотографии:', error);
            throw error;
        }
    }

    /**
     * Загрузить несколько фотографий параллельно
     * @param {Array<File|Blob>} files - Массив файлов
     * @param {String} travelId - ID путешествия
     * @param {String} userId - ID пользователя
     * @returns {Promise<Array<String>>} - Массив URL загруженных фотографий
     */
    async uploadMultiplePhotos(files, travelId = '', userId = '') {
        try {
            console.log(`📤 Загрузка ${files.length} фотографий параллельно...`);

            const uploadPromises = files.map(file =>
                this.uploadPhoto(file, travelId, userId)
            );

            const urls = await Promise.all(uploadPromises);

            console.log('✅ Все фотографии загружены:', urls.length);

            return urls;

        } catch (error) {
            console.error('❌ Ошибка массовой загрузки:', error);
            throw error;
        }
    }

    /**
     * Конвертировать base64 в Blob для загрузки
     * @param {String} base64 - Base64 строка изображения
     * @param {String} mimeType - MIME тип (по умолчанию image/jpeg)
     * @returns {Blob} - Blob объект
     */
    base64ToBlob(base64, mimeType = 'image/jpeg') {
        try {
            // Убираем префикс data:image/...;base64, если есть
            const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

            const byteCharacters = atob(base64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);

                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            return new Blob(byteArrays, { type: mimeType });

        } catch (error) {
            console.error('❌ Ошибка конвертации base64 в Blob:', error);
            throw error;
        }
    }

    /**
     * Загрузить base64 фотографии на сервер
     * @param {Array<String>} base64Images - Массив base64 изображений
     * @param {String} travelId - ID путешествия
     * @param {String} userId - ID пользователя
     * @returns {Promise<Array<String>>} - Массив URL загруженных фотографий
     */
    async uploadBase64Photos(base64Images, travelId = '', userId = '') {
        try {
            console.log(`📤 Конвертация и загрузка ${base64Images.length} base64 фотографий...`);

            // Конвертируем все base64 в Blob
            const blobs = base64Images.map(base64 => this.base64ToBlob(base64));

            // Загружаем на сервер
            const urls = await this.uploadMultiplePhotos(blobs, travelId, userId);

            return urls;

        } catch (error) {
            console.error('❌ Ошибка загрузки base64 фотографий:', error);
            throw error;
        }
    }

    /**
     * Получить список всех фотографий
     * @returns {Promise<Array>} - Массив объектов с метаданными фотографий
     */
    async getAllPhotos() {
        try {
            const response = await fetch(`${this.serverUrl}/api/travel-photos`);

            if (!response.ok) {
                throw new Error(`Ошибка получения списка: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Неизвестная ошибка');
            }

            console.log('✅ Получен список фотографий:', data.total);

            return data.photos;

        } catch (error) {
            console.error('❌ Ошибка получения списка фотографий:', error);
            throw error;
        }
    }

    /**
     * Удалить фотографию с сервера
     * @param {String} photoId - ID фотографии
     * @returns {Promise<Boolean>} - Успешность удаления
     */
    async deletePhoto(photoId) {
        try {
            console.log('🗑️ Удаление фотографии:', photoId);

            const response = await fetch(`${this.serverUrl}/api/delete-photo/${photoId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Ошибка удаления: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Неизвестная ошибка');
            }

            console.log('✅ Фотография удалена');

            return true;

        } catch (error) {
            console.error('❌ Ошибка удаления фотографии:', error);
            throw error;
        }
    }

    /**
     * Проверить доступность сервера
     * @returns {Promise<Boolean>} - Доступность сервера
     */
    async checkServerHealth() {
        try {
            const response = await fetch(`${this.serverUrl}/api/health`);

            if (!response.ok) {
                return false;
            }

            const data = await response.json();

            console.log('✅ Сервер доступен, фотографий:', data.photos_count);

            return data.status === 'ok';

        } catch (error) {
            console.error('❌ Сервер недоступен:', error);
            return false;
        }
    }

    /**
     * Получить полный URL фотографии по ID
     * @param {String} photoId - ID фотографии
     * @returns {String} - Полный URL
     */
    getPhotoUrl(photoId) {
        return `${this.serverUrl}/api/photo/${photoId}`;
    }
}

// Создаем глобальный экземпляр
window.photoStorageServer = new PhotoStorageServer();

console.log('✅ PhotoStorageServer готов к использованию');
