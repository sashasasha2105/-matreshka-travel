/**
 * СИСТЕМА ТУРБО-ОПТИМИЗАЦИИ ПРОИЗВОДИТЕЛЬНОСТИ
 * Обеспечивает мгновенную загрузку изображений и контента
 */

(function() {
    'use strict';

    class PerformanceOptimizer {
        constructor() {
            this.imageCache = new Map();
            this.prefetchQueue = [];
            this.isPreloading = false;

            // Конфигурация
            this.config = {
                // Агрессивное предзагрузка
                prefetchDistance: 3, // Предзагружать 3 следующих региона

                // Размеры для разных устройств
                thumbSize: { width: 400, height: 300, quality: 0.7 }, // Превью
                mobileSize: { width: 800, height: 600, quality: 0.75 }, // Мобильные
                desktopSize: { width: 1200, height: 900, quality: 0.8 }, // Десктоп

                // Максимальное время ожидания загрузки
                loadTimeout: 3000,

                // Параллельная загрузка
                concurrentLoads: 4
            };

            this.init();
        }

        init() {
            console.log('⚡ Инициализация Performance Optimizer...');

            // Определяем устройство
            this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            this.isSlowConnection = this.detectSlowConnection();

            // Настраиваем под устройство
            this.imageSize = this.isMobile ? this.config.mobileSize : this.config.desktopSize;

            console.log('📱 Устройство:', this.isMobile ? 'Mobile' : 'Desktop');
            console.log('🌐 Соединение:', this.isSlowConnection ? 'Медленное' : 'Быстрое');
            console.log('🖼️ Размер изображений:', this.imageSize);
        }

        /**
         * Определение медленного соединения
         */
        detectSlowConnection() {
            if ('connection' in navigator) {
                const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

                // Slow 2G, 3G считаются медленными
                if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.effectiveType === '3g') {
                    return true;
                }

                // Режим экономии трафика
                if (conn.saveData) {
                    return true;
                }
            }

            return false;
        }

        /**
         * МГНОВЕННАЯ ЗАГРУЗКА изображения с многоуровневым кэшем
         */
        async loadImageInstantly(src, element, priority = 'normal') {
            // 1. Проверяем кэш в памяти
            if (this.imageCache.has(src)) {
                const cachedData = this.imageCache.get(src);
                this.applyImage(element, cachedData.url);
                return cachedData.url;
            }

            // 2. Проверяем кэш браузера (Cache API)
            const cachedUrl = await this.getCachedImage(src);
            if (cachedUrl) {
                this.imageCache.set(src, { url: cachedUrl, timestamp: Date.now() });
                this.applyImage(element, cachedUrl);
                return cachedUrl;
            }

            // 3. Загружаем с приоритетом
            return await this.loadAndCacheImage(src, element, priority);
        }

        /**
         * Применить изображение к элементу с плавной анимацией
         */
        applyImage(element, url) {
            if (!element) return;

            // Добавляем placeholder пока грузится
            if (!element.src || element.src.includes('data:image')) {
                element.style.opacity = '0';
            }

            element.src = url;

            // Плавное появление
            element.onload = () => {
                element.style.transition = 'opacity 0.3s ease-in-out';
                element.style.opacity = '1';
            };
        }

        /**
         * Загрузка и кэширование изображения
         */
        async loadAndCacheImage(src, element, priority) {
            try {
                const startTime = performance.now();

                // Fetch с таймаутом
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), this.config.loadTimeout);

                const response = await fetch(src, {
                    signal: controller.signal,
                    priority: priority === 'high' ? 'high' : 'low'
                });

                clearTimeout(timeout);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const blob = await response.blob();

                // Оптимизируем если нужно
                const optimizedBlob = await this.optimizeImage(blob);

                // Создаем Object URL для мгновенного доступа
                const objectUrl = URL.createObjectURL(optimizedBlob);

                // Сохраняем в Cache API для persistence
                await this.saveToCacheAPI(src, optimizedBlob);

                // Сохраняем в память
                this.imageCache.set(src, { url: objectUrl, timestamp: Date.now() });

                // Применяем
                this.applyImage(element, objectUrl);

                const loadTime = performance.now() - startTime;
                console.log(`⚡ Изображение загружено за ${loadTime.toFixed(0)}ms:`, src.split('/').pop());

                return objectUrl;

            } catch (error) {
                console.error('❌ Ошибка загрузки изображения:', error);

                // Fallback placeholder
                this.applyPlaceholder(element);

                return null;
            }
        }

        /**
         * Оптимизация изображения (сжатие на лету)
         */
        async optimizeImage(blob) {
            // Пропускаем оптимизацию для маленьких файлов
            if (blob.size < 50 * 1024) { // Меньше 50KB
                return blob;
            }

            try {
                const bitmap = await createImageBitmap(blob);

                // Вычисляем новые размеры
                let { width, height } = this.imageSize;

                const scale = Math.min(
                    width / bitmap.width,
                    height / bitmap.height,
                    1 // Не увеличиваем
                );

                const newWidth = Math.round(bitmap.width * scale);
                const newHeight = Math.round(bitmap.height * scale);

                // Создаем canvas для resize
                const canvas = new OffscreenCanvas(newWidth, newHeight);
                const ctx = canvas.getContext('2d');

                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);

                // Конвертируем в WebP если поддерживается, иначе JPEG
                const optimizedBlob = await canvas.convertToBlob({
                    type: 'image/webp',
                    quality: this.imageSize.quality
                }).catch(() => {
                    return canvas.convertToBlob({
                        type: 'image/jpeg',
                        quality: this.imageSize.quality
                    });
                });

                console.log(`🗜️ Сжато: ${(blob.size / 1024).toFixed(1)}KB → ${(optimizedBlob.size / 1024).toFixed(1)}KB (${((1 - optimizedBlob.size / blob.size) * 100).toFixed(0)}%)`);

                return optimizedBlob;

            } catch (error) {
                console.warn('⚠️ Не удалось оптимизировать, используем оригинал:', error);
                return blob;
            }
        }

        /**
         * Сохранение в Cache API (постоянный кэш)
         */
        async saveToCacheAPI(url, blob) {
            if (!('caches' in window)) return;

            try {
                const cache = await caches.open('matryoshka-images-v1');
                const response = new Response(blob);
                await cache.put(url, response);
            } catch (error) {
                console.warn('⚠️ Cache API недоступен:', error);
            }
        }

        /**
         * Получение из Cache API
         */
        async getCachedImage(url) {
            if (!('caches' in window)) return null;

            try {
                const cache = await caches.open('matryoshka-images-v1');
                const response = await cache.match(url);

                if (response) {
                    const blob = await response.blob();
                    return URL.createObjectURL(blob);
                }
            } catch (error) {
                console.warn('⚠️ Ошибка чтения кэша:', error);
            }

            return null;
        }

        /**
         * ПРЕДЗАГРУЗКА следующих изображений (умная prefetch)
         */
        prefetchImages(imageSources) {
            if (this.isSlowConnection) {
                console.log('⏸️ Prefetch отключен для медленного соединения');
                return;
            }

            // Добавляем в очередь
            this.prefetchQueue.push(...imageSources);

            // Запускаем если ещё не работает
            if (!this.isPreloading) {
                this.processPrefetchQueue();
            }
        }

        /**
         * Обработка очереди предзагрузки
         */
        async processPrefetchQueue() {
            if (this.prefetchQueue.length === 0) {
                this.isPreloading = false;
                return;
            }

            this.isPreloading = true;

            // Загружаем параллельно несколько изображений
            const batch = this.prefetchQueue.splice(0, this.config.concurrentLoads);

            const promises = batch.map(async (src) => {
                // Пропускаем если уже в кэше
                if (this.imageCache.has(src)) return;

                try {
                    const response = await fetch(src, { priority: 'low' });
                    const blob = await response.blob();
                    const optimizedBlob = await this.optimizeImage(blob);

                    await this.saveToCacheAPI(src, optimizedBlob);

                    const objectUrl = URL.createObjectURL(optimizedBlob);
                    this.imageCache.set(src, { url: objectUrl, timestamp: Date.now() });

                    console.log('📦 Prefetched:', src.split('/').pop());
                } catch (error) {
                    console.warn('⚠️ Prefetch failed:', src, error);
                }
            });

            await Promise.allSettled(promises);

            // Продолжаем обработку очереди
            this.processPrefetchQueue();
        }

        /**
         * Умная предзагрузка регионов (предугадываем действия пользователя)
         */
        smartPrefetchRegions(regions, currentIndex) {
            const nextRegions = [];

            // Предзагружаем следующие N регионов
            for (let i = 1; i <= this.config.prefetchDistance; i++) {
                const nextIndex = currentIndex + i;
                if (nextIndex < regions.length) {
                    nextRegions.push(regions[nextIndex].image);
                }
            }

            this.prefetchImages(nextRegions);
        }

        /**
         * Placeholder с красивой анимацией
         */
        applyPlaceholder(element) {
            if (!element) return;

            // SVG placeholder
            const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23999"%3E%D0%97%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BA%D0%B0...%3C/text%3E%3C/svg%3E';

            element.src = placeholder;
            element.style.opacity = '0.5';
        }

        /**
         * Очистка старого кэша (освобождаем память)
         */
        clearOldCache() {
            const now = Date.now();
            const maxAge = 30 * 60 * 1000; // 30 минут

            for (const [key, value] of this.imageCache.entries()) {
                if (now - value.timestamp > maxAge) {
                    URL.revokeObjectURL(value.url);
                    this.imageCache.delete(key);
                }
            }

            console.log('🗑️ Очищен старый кэш. Осталось:', this.imageCache.size, 'изображений');
        }

        /**
         * Получить статистику
         */
        getStats() {
            return {
                cachedImages: this.imageCache.size,
                prefetchQueue: this.prefetchQueue.length,
                isPreloading: this.isPreloading,
                isMobile: this.isMobile,
                isSlowConnection: this.isSlowConnection
            };
        }
    }

    // Создаем глобальный экземпляр
    window.performanceOptimizer = new PerformanceOptimizer();

    // Очищаем кэш каждые 10 минут
    setInterval(() => {
        window.performanceOptimizer.clearOldCache();
    }, 10 * 60 * 1000);

    console.log('⚡ Performance Optimizer готов к работе');
})();
