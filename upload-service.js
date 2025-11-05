/**
 * СЕРВИС ЗАГРУЗКИ ФОТОГРАФИЙ НА СЕРВЕР
 * Поддерживает множество вариантов хранения
 */

(function() {
    'use strict';

    class UploadService {
        constructor() {
            // Конфигурация
            this.config = {
                // Вариант 1: Telegram Bot API (РЕКОМЕНДУЕТСЯ)
                telegram: {
                    enabled: true,
                    botToken: null, // Берем из window.ANALYTICS_CONFIG или переменных окружения
                    chatId: null,   // ID чата для хранения фото
                    apiUrl: 'https://api.telegram.org/bot'
                },

                // Вариант 2: Свой бэкенд (Flask/FastAPI)
                backend: {
                    enabled: false,
                    uploadUrl: '/api/upload',
                    cdnUrl: '/uploads'
                },

                // Вариант 3: Cloudinary
                cloudinary: {
                    enabled: false,
                    cloudName: null,
                    uploadPreset: null
                },

                // Настройки сжатия
                compression: {
                    maxWidth: 1920,
                    maxHeight: 1080,
                    quality: 0.85,
                    format: 'jpeg' // или 'webp'
                }
            };

            this.init();
        }

        /**
         * Инициализация
         */
        init() {
            // Получаем конфигурацию из глобальных переменных
            if (window.ANALYTICS_CONFIG && window.ANALYTICS_CONFIG.BOT_TOKEN) {
                this.config.telegram.botToken = window.ANALYTICS_CONFIG.BOT_TOKEN;
                this.config.telegram.chatId = window.ANALYTICS_CONFIG.CHAT_ID;
            }

            console.log('📤 Upload Service инициализирован');
        }

        /**
         * ГЛАВНЫЙ МЕТОД: Загрузка фото на сервер
         * @param {string} base64Data - Base64 изображения
         * @param {Object} metadata - Метаданные (title, description, userId)
         * @returns {Promise<Object>} - { url, thumbnailUrl, fileId, storage }
         */
        async uploadPhoto(base64Data, metadata = {}) {
            console.log('📤 Начинаем загрузку фото...');

            try {
                // 1. Сжимаем изображение перед отправкой
                const compressedData = await this.compressImage(base64Data);

                // 2. Выбираем метод загрузки
                if (this.config.telegram.enabled && this.config.telegram.botToken) {
                    return await this.uploadToTelegram(compressedData, metadata);
                } else if (this.config.backend.enabled) {
                    return await this.uploadToBackend(compressedData, metadata);
                } else if (this.config.cloudinary.enabled) {
                    return await this.uploadToCloudinary(compressedData, metadata);
                } else {
                    throw new Error('Ни один метод загрузки не настроен!');
                }

            } catch (error) {
                console.error('❌ Ошибка загрузки фото:', error);
                throw error;
            }
        }

        /**
         * ВАРИАНТ 1: Загрузка в Telegram Bot API
         */
        async uploadToTelegram(base64Data, metadata) {
            console.log('📱 Загрузка в Telegram...');

            try {
                const blob = await this.base64ToBlob(base64Data);

                // Создаем FormData
                const formData = new FormData();
                formData.append('photo', blob, `photo_${Date.now()}.jpg`);
                formData.append('chat_id', this.config.telegram.chatId);

                // Добавляем описание если есть
                if (metadata.title) {
                    const caption = `📸 ${metadata.title}\n${metadata.description || ''}`;
                    formData.append('caption', caption.substring(0, 1024)); // Лимит Telegram
                }

                // Отправляем в Telegram
                const apiUrl = `${this.config.telegram.apiUrl}${this.config.telegram.botToken}/sendPhoto`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Telegram API error: ${response.status}`);
                }

                const result = await response.json();

                if (!result.ok) {
                    throw new Error(result.description || 'Telegram upload failed');
                }

                // Извлекаем данные о фото
                const photo = result.result.photo;
                const largestPhoto = photo[photo.length - 1]; // Самое большое разрешение
                const thumbnailPhoto = photo[0]; // Миниатюра

                // Получаем прямую ссылку на файл
                const fileUrl = await this.getTelegramFileUrl(largestPhoto.file_id);
                const thumbnailUrl = await this.getTelegramFileUrl(thumbnailPhoto.file_id);

                console.log('✅ Фото загружено в Telegram');

                return {
                    url: fileUrl,
                    thumbnailUrl: thumbnailUrl,
                    fileId: largestPhoto.file_id,
                    storage: 'telegram',
                    width: largestPhoto.width,
                    height: largestPhoto.height,
                    size: largestPhoto.file_size
                };

            } catch (error) {
                console.error('❌ Ошибка загрузки в Telegram:', error);
                throw error;
            }
        }

        /**
         * Получить прямую ссылку на файл из Telegram
         */
        async getTelegramFileUrl(fileId) {
            const apiUrl = `${this.config.telegram.apiUrl}${this.config.telegram.botToken}/getFile`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_id: fileId })
            });

            const result = await response.json();

            if (!result.ok) {
                throw new Error('Failed to get file URL');
            }

            // Формируем прямую ссылку
            const filePath = result.result.file_path;
            return `https://api.telegram.org/file/bot${this.config.telegram.botToken}/${filePath}`;
        }

        /**
         * ВАРИАНТ 2: Загрузка на свой бэкенд (Flask/FastAPI)
         */
        async uploadToBackend(base64Data, metadata) {
            console.log('🖥️ Загрузка на backend...');

            try {
                const blob = await this.base64ToBlob(base64Data);

                const formData = new FormData();
                formData.append('photo', blob, `photo_${Date.now()}.jpg`);
                formData.append('metadata', JSON.stringify(metadata));

                const response = await fetch(this.config.backend.uploadUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Backend upload failed: ${response.status}`);
                }

                const result = await response.json();

                return {
                    url: `${this.config.backend.cdnUrl}/${result.filename}`,
                    thumbnailUrl: `${this.config.backend.cdnUrl}/thumbs/${result.filename}`,
                    fileId: result.id,
                    storage: 'backend'
                };

            } catch (error) {
                console.error('❌ Ошибка загрузки на backend:', error);
                throw error;
            }
        }

        /**
         * ВАРИАНТ 3: Загрузка в Cloudinary
         */
        async uploadToCloudinary(base64Data, metadata) {
            console.log('☁️ Загрузка в Cloudinary...');

            try {
                const formData = new FormData();
                formData.append('file', base64Data);
                formData.append('upload_preset', this.config.cloudinary.uploadPreset);

                // Добавляем метаданные
                if (metadata.title) {
                    formData.append('context', `title=${metadata.title}`);
                }

                const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${this.config.cloudinary.cloudName}/image/upload`;

                const response = await fetch(cloudinaryUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Cloudinary upload failed: ${response.status}`);
                }

                const result = await response.json();

                return {
                    url: result.secure_url,
                    thumbnailUrl: result.eager ? result.eager[0].secure_url : result.secure_url,
                    fileId: result.public_id,
                    storage: 'cloudinary',
                    width: result.width,
                    height: result.height
                };

            } catch (error) {
                console.error('❌ Ошибка загрузки в Cloudinary:', error);
                throw error;
            }
        }

        /**
         * Пакетная загрузка фотографий
         * @param {Array<string>} base64Array - Массив base64 изображений
         * @param {Object} metadata - Общие метаданные
         * @returns {Promise<Array>} - Массив результатов
         */
        async uploadMultiplePhotos(base64Array, metadata = {}) {
            console.log(`📤 Пакетная загрузка ${base64Array.length} фотографий...`);

            const results = [];
            const errors = [];

            // Загружаем параллельно (максимум 3 одновременно)
            const batchSize = 3;
            for (let i = 0; i < base64Array.length; i += batchSize) {
                const batch = base64Array.slice(i, i + batchSize);

                const batchPromises = batch.map(async (base64, index) => {
                    try {
                        const photoMetadata = {
                            ...metadata,
                            index: i + index,
                            total: base64Array.length
                        };

                        const result = await this.uploadPhoto(base64, photoMetadata);
                        console.log(`✅ Фото ${i + index + 1}/${base64Array.length} загружено`);
                        return result;

                    } catch (error) {
                        console.error(`❌ Ошибка загрузки фото ${i + index + 1}:`, error);
                        errors.push({ index: i + index, error });
                        return null;
                    }
                });

                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults.filter(r => r !== null));
            }

            console.log(`✅ Загружено ${results.length} из ${base64Array.length} фотографий`);

            if (errors.length > 0) {
                console.warn(`⚠️ Не удалось загрузить ${errors.length} фотографий:`, errors);
            }

            return results;
        }

        /**
         * Сжатие изображения перед загрузкой
         */
        async compressImage(base64Data) {
            if (!window.imageCompression) {
                console.warn('⚠️ imageCompression не найден, пропускаем сжатие');
                return base64Data;
            }

            try {
                const { maxWidth, maxHeight, quality } = this.config.compression;

                const compressed = await window.imageCompression.compressImage(
                    base64Data,
                    maxWidth,
                    maxHeight,
                    quality
                );

                const originalSize = base64Data.length;
                const compressedSize = compressed.length;
                const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

                console.log(`🗜️ Сжатие: ${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB (${savings}% экономии)`);

                return compressed;

            } catch (error) {
                console.error('❌ Ошибка сжатия, используем оригинал:', error);
                return base64Data;
            }
        }

        /**
         * Конвертация base64 в Blob
         */
        async base64ToBlob(base64Data) {
            const response = await fetch(base64Data);
            return await response.blob();
        }

        /**
         * Получить статистику загрузок
         */
        getStats() {
            return {
                enabled: this.config.telegram.enabled || this.config.backend.enabled || this.config.cloudinary.enabled,
                storage: this.config.telegram.enabled ? 'telegram' :
                         this.config.backend.enabled ? 'backend' :
                         this.config.cloudinary.enabled ? 'cloudinary' : 'none'
            };
        }
    }

    // Создаем глобальный экземпляр
    window.uploadService = new UploadService();

    console.log('✅ Upload Service готов');
    console.log('📊 Используется:', window.uploadService.getStats().storage);
})();
