/**
 * Утилита для сжатия изображений
 * Автоматически уменьшает размер изображений для экономии localStorage
 */

(function() {
    'use strict';

    /**
     * Сжать изображение до заданного размера
     * @param {string} base64Image - Base64 строка изображения
     * @param {number} maxWidth - Максимальная ширина (по умолчанию 1920)
     * @param {number} maxHeight - Максимальная высота (по умолчанию 1080)
     * @param {number} quality - Качество JPEG 0-1 (по умолчанию 0.8)
     * @returns {Promise<string>} - Сжатое base64 изображение
     */
    function compressImage(base64Image, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
        return new Promise((resolve, reject) => {
            console.log('🗜️ Начало сжатия изображения...');
            console.log('  - Исходный размер:', (base64Image.length / 1024).toFixed(2), 'KB');

            // Создаем изображение
            const img = new Image();

            img.onload = function() {
                try {
                    console.log('  - Исходные размеры:', img.width, 'x', img.height);

                    // Вычисляем новые размеры с сохранением пропорций
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }

                    console.log('  - Новые размеры:', Math.round(width), 'x', Math.round(height));

                    // Создаем canvas для ресайза
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');

                    // Улучшаем качество ресайза
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // Рисуем изображение
                    ctx.drawImage(img, 0, 0, width, height);

                    // Конвертируем в base64
                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

                    console.log('  - Сжатый размер:', (compressedBase64.length / 1024).toFixed(2), 'KB');
                    console.log('  - Экономия:', ((1 - compressedBase64.length / base64Image.length) * 100).toFixed(1), '%');
                    console.log('✅ Сжатие завершено');

                    resolve(compressedBase64);
                } catch (error) {
                    console.error('❌ Ошибка при сжатии:', error);
                    reject(error);
                }
            };

            img.onerror = function(error) {
                console.error('❌ Ошибка загрузки изображения для сжатия:', error);
                reject(error);
            };

            img.src = base64Image;
        });
    }

    /**
     * Сжать массив изображений
     * @param {Array<string>} images - Массив base64 изображений
     * @param {Object} options - Опции сжатия
     * @returns {Promise<Array<string>>} - Массив сжатых изображений
     */
    async function compressImages(images, options = {}) {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 0.8
        } = options;

        console.log('🗜️ Начало пакетного сжатия', images.length, 'изображений...');

        const compressedImages = [];

        for (let i = 0; i < images.length; i++) {
            console.log(`\n📸 Сжатие изображения ${i + 1}/${images.length}`);
            try {
                const compressed = await compressImage(images[i], maxWidth, maxHeight, quality);
                compressedImages.push(compressed);
            } catch (error) {
                console.error(`❌ Не удалось сжать изображение ${i + 1}, используем оригинал`);
                compressedImages.push(images[i]);
            }
        }

        const originalSize = images.reduce((sum, img) => sum + img.length, 0);
        const compressedSize = compressedImages.reduce((sum, img) => sum + img.length, 0);

        console.log('\n📊 Итого:');
        console.log('  - Исходный размер:', (originalSize / 1024).toFixed(2), 'KB');
        console.log('  - Сжатый размер:', (compressedSize / 1024).toFixed(2), 'KB');
        console.log('  - Экономия:', ((1 - compressedSize / originalSize) * 100).toFixed(1), '%');

        return compressedImages;
    }

    /**
     * Проверить не превышен ли лимит localStorage
     * @param {Object} dataToSave - Данные для сохранения
     * @param {string} key - Ключ в localStorage
     * @returns {boolean} - true если данные поместятся
     */
    function checkLocalStorageLimit(dataToSave, key) {
        try {
            const jsonString = JSON.stringify(dataToSave);
            const newSize = jsonString.length;

            // Вычисляем текущий размер localStorage без этого ключа
            let currentSize = 0;
            for (let k in localStorage) {
                if (localStorage.hasOwnProperty(k) && k !== key) {
                    currentSize += localStorage[k].length + k.length;
                }
            }

            const totalSize = currentSize + newSize;
            const limitKB = 5000; // Безопасный лимит 5MB

            console.log('📦 Проверка лимита localStorage:');
            console.log('  - Текущий размер (без этого ключа):', (currentSize / 1024).toFixed(2), 'KB');
            console.log('  - Новые данные:', (newSize / 1024).toFixed(2), 'KB');
            console.log('  - Итого:', (totalSize / 1024).toFixed(2), 'KB');
            console.log('  - Лимит:', limitKB, 'KB');

            if (totalSize > limitKB * 1024) {
                console.warn('⚠️ Данные могут превысить лимит localStorage!');
                return false;
            }

            console.log('✅ Данные поместятся в localStorage');
            return true;
        } catch (error) {
            console.error('❌ Ошибка проверки лимита:', error);
            return false;
        }
    }

    // Экспортируем функции глобально
    window.imageCompression = {
        compressImage,
        compressImages,
        checkLocalStorageLimit
    };

    console.log('✅ Image compression утилита загружена');
})();
