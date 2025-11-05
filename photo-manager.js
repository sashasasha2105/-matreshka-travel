/**
 * МЕНЕДЖЕР ФОТОГРАФИЙ
 * Единая точка входа для работы с фотографиями
 * Поддерживает локальное и серверное хранение
 */

(function() {
    'use strict';

    class PhotoManager {
        constructor() {
            this.storageMode = 'hybrid'; // 'local', 'server', 'hybrid'

            this.config = {
                // Использовать серверное хранилище для новых фото
                useServerForNew: true,

                // Сохранять копию локально (для офлайн-режима)
                keepLocalBackup: true,

                // Автоматическая синхронизация
                autoSync: true,

                // Максимальный возраст локального кэша (7 дней)
                maxCacheAge: 7 * 24 * 60 * 60 * 1000
            };

            this.stats = {
                uploaded: 0,
                failed: 0,
                cached: 0
            };
        }

        /**
         * ГЛАВНЫЙ МЕТОД: Сохранить фотографию
         * Автоматически решает куда сохранять
         */
        async savePhoto(base64Data, metadata = {}) {
            console.log('💾 PhotoManager.savePhoto()');

            try {
                let result = {};

                // Вариант 1: Загружаем на сервер
                if (this.config.useServerForNew && window.uploadService) {
                    console.log('📤 Загрузка на сервер...');

                    try {
                        const uploaded = await window.uploadService.uploadPhoto(base64Data, metadata);

                        result = {
                            url: uploaded.url,
                            thumbnailUrl: uploaded.thumbnailUrl,
                            fileId: uploaded.fileId,
                            storage: uploaded.storage,
                            localBackup: null
                        };

                        console.log('✅ Загружено на сервер:', uploaded.storage);
                        this.stats.uploaded++;

                        // Опционально: сохраняем копию локально для офлайна
                        if (this.config.keepLocalBackup) {
                            const localId = await this.saveToLocal(base64Data, metadata);
                            result.localBackup = localId;
                            console.log('💾 Локальная копия сохранена:', localId);
                        }

                    } catch (uploadError) {
                        console.warn('⚠️ Ошибка загрузки на сервер, используем локальное хранилище:', uploadError);

                        // Fallback: сохраняем локально
                        const localId = await this.saveToLocal(base64Data, metadata);
                        result = {
                            url: base64Data, // Используем base64 временно
                            thumbnailUrl: base64Data,
                            fileId: localId,
                            storage: 'local',
                            needsUpload: true // Флаг для будущей синхронизации
                        };

                        this.stats.failed++;
                    }
                } else {
                    // Вариант 2: Только локальное хранилище
                    console.log('💾 Сохранение локально...');
                    const localId = await this.saveToLocal(base64Data, metadata);

                    result = {
                        url: base64Data,
                        thumbnailUrl: base64Data,
                        fileId: localId,
                        storage: 'local'
                    };
                }

                return result;

            } catch (error) {
                console.error('❌ Ошибка сохранения фото:', error);
                throw error;
            }
        }

        /**
         * Пакетное сохранение фотографий
         */
        async saveMultiplePhotos(base64Array, metadata = {}) {
            console.log(`📦 Сохранение ${base64Array.length} фотографий...`);

            const results = [];

            // Используем пакетную загрузку если доступна
            if (this.config.useServerForNew && window.uploadService) {
                try {
                    const uploaded = await window.uploadService.uploadMultiplePhotos(base64Array, metadata);

                    for (const photo of uploaded) {
                        results.push({
                            url: photo.url,
                            thumbnailUrl: photo.thumbnailUrl,
                            fileId: photo.fileId,
                            storage: photo.storage
                        });
                    }

                    this.stats.uploaded += uploaded.length;

                    console.log(`✅ Загружено ${uploaded.length} фотографий на сервер`);

                } catch (error) {
                    console.warn('⚠️ Ошибка пакетной загрузки, используем локальное хранилище');

                    // Fallback: сохраняем локально
                    for (const base64 of base64Array) {
                        const localId = await this.saveToLocal(base64, metadata);
                        results.push({
                            url: base64,
                            thumbnailUrl: base64,
                            fileId: localId,
                            storage: 'local',
                            needsUpload: true
                        });
                    }

                    this.stats.failed += base64Array.length;
                }
            } else {
                // Только локальное хранилище
                for (const base64 of base64Array) {
                    const localId = await this.saveToLocal(base64, metadata);
                    results.push({
                        url: base64,
                        thumbnailUrl: base64,
                        fileId: localId,
                        storage: 'local'
                    });
                }
            }

            return results;
        }

        /**
         * Сохранение в локальное хранилище (IndexedDB)
         */
        async saveToLocal(base64Data, metadata) {
            if (!window.matryoshkaStorage) {
                throw new Error('matryoshkaStorage не инициализирован');
            }

            // Генерируем уникальный ID
            const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Сохраняем в IndexedDB через существующую систему
            // (используем временное путешествие)
            const tempTravel = {
                id: localId,
                title: metadata.title || 'Фото',
                text: metadata.description || '',
                images: [base64Data],
                createdAt: Date.now()
            };

            await window.matryoshkaStorage.saveTravel(tempTravel);

            this.stats.cached++;

            return localId;
        }

        /**
         * Загрузить фотографию (с автоматическим кэшированием)
         */
        async loadPhoto(photoData) {
            // Если это серверное фото
            if (photoData.storage !== 'local' && photoData.url) {
                // Проверяем кэш
                if (window.performanceOptimizer) {
                    const cached = await window.performanceOptimizer.imageCache.get(photoData.url);
                    if (cached) {
                        console.log('✅ Фото из кэша:', photoData.url);
                        return cached.url;
                    }
                }

                // Загружаем с сервера и кэшируем
                console.log('📥 Загрузка с сервера:', photoData.url);
                return photoData.url;
            }

            // Если это локальное фото
            if (photoData.fileId && photoData.fileId.startsWith('local_')) {
                console.log('💾 Загрузка из локального хранилища:', photoData.fileId);
                return photoData.url; // Уже base64
            }

            return null;
        }

        /**
         * Синхронизация локальных фото на сервер
         */
        async syncPendingPhotos() {
            if (!this.config.autoSync) {
                console.log('⏸️ Автосинхронизация отключена');
                return;
            }

            console.log('🔄 Синхронизация локальных фото...');

            try {
                // Получаем все путешествия из IndexedDB
                const travels = await window.matryoshkaStorage.getAllTravels();

                let synced = 0;
                let errors = 0;

                for (const travel of travels) {
                    // Ищем фото которые нужно загрузить
                    if (travel.images && travel.images.length > 0) {
                        for (let i = 0; i < travel.images.length; i++) {
                            const image = travel.images[i];

                            // Если это base64 (не URL)
                            if (typeof image === 'string' && image.startsWith('data:image')) {
                                try {
                                    const uploaded = await window.uploadService.uploadPhoto(image, {
                                        travelId: travel.id,
                                        title: travel.title,
                                        index: i
                                    });

                                    // Заменяем base64 на URL
                                    travel.images[i] = uploaded.url;

                                    synced++;
                                    console.log(`✅ Синхронизировано фото ${i + 1} из путешествия "${travel.title}"`);

                                } catch (error) {
                                    console.error(`❌ Ошибка синхронизации фото ${i + 1}:`, error);
                                    errors++;
                                }
                            }
                        }

                        // Сохраняем обновленное путешествие
                        if (synced > 0) {
                            await window.matryoshkaStorage.saveTravel(travel);
                        }
                    }
                }

                console.log(`✅ Синхронизация завершена: ${synced} загружено, ${errors} ошибок`);

                return { synced, errors };

            } catch (error) {
                console.error('❌ Ошибка синхронизации:', error);
                throw error;
            }
        }

        /**
         * Очистка старого кэша
         */
        async cleanOldCache() {
            console.log('🗑️ Очистка старого кэша...');

            const now = Date.now();
            const travels = await window.matryoshkaStorage.getAllTravels();

            let cleaned = 0;

            for (const travel of travels) {
                // Проверяем возраст
                const age = now - (travel.createdAt || 0);

                if (age > this.config.maxCacheAge) {
                    // Удаляем только если есть серверная копия
                    const hasServerCopy = travel.images && travel.images.some(img =>
                        typeof img === 'string' && (img.startsWith('http') || img.startsWith('/uploads'))
                    );

                    if (hasServerCopy) {
                        await window.matryoshkaStorage.deleteTravel(travel.id);
                        cleaned++;
                        console.log(`🗑️ Удален старый кэш: ${travel.title}`);
                    }
                }
            }

            console.log(`✅ Очищено ${cleaned} старых записей`);
        }

        /**
         * Получить статистику
         */
        getStats() {
            return {
                ...this.stats,
                storageMode: this.storageMode,
                useServer: this.config.useServerForNew,
                hasUploadService: !!window.uploadService
            };
        }
    }

    // Создаем глобальный экземпляр
    window.photoManager = new PhotoManager();

    // Автоматическая синхронизация при загрузке (через 5 секунд)
    setTimeout(() => {
        if (window.photoManager.config.autoSync) {
            window.photoManager.syncPendingPhotos().catch(console.error);
        }
    }, 5000);

    // Периодическая синхронизация (каждые 5 минут)
    setInterval(() => {
        if (window.photoManager.config.autoSync) {
            window.photoManager.syncPendingPhotos().catch(console.error);
        }
    }, 5 * 60 * 1000);

    console.log('✅ PhotoManager инициализирован');
    console.log('📊 Режим:', window.photoManager.storageMode);
})();
