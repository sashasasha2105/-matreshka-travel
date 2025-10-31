/**
 * Lazy Loading для изображений
 * Оптимизирует загрузку страницы на мобильных устройствах
 */

(function() {
    'use strict';

    // Проверяем поддержку native lazy loading
    const supportsNativeLazyLoading = 'loading' in HTMLImageElement.prototype;

    if (supportsNativeLazyLoading) {
        console.log('✅ Native lazy loading supported');

        // Добавляем loading="lazy" ко всем img без этого атрибута
        document.querySelectorAll('img:not([loading])').forEach(img => {
            img.setAttribute('loading', 'lazy');
        });

        return;
    }

    console.log('⚠️ Native lazy loading not supported, using IntersectionObserver');

    // Fallback с IntersectionObserver
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                // Загружаем изображение
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }

                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                    img.removeAttribute('data-srcset');
                }

                // Перестаем наблюдать за этим изображением
                observer.unobserve(img);

                console.log('📷 Image loaded:', img.src);
            }
        });
    }, {
        // Загружаем за 50px до появления в viewport
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // Наблюдаем за всеми изображениями
    function observeImages() {
        document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Инициализация при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeImages);
    } else {
        observeImages();
    }

    // Наблюдаем за новыми изображениями (для динамически добавляемых)
    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    // Если добавлен img
                    if (node.tagName === 'IMG' && (node.dataset.src || node.dataset.srcset)) {
                        imageObserver.observe(node);
                    }

                    // Если добавлен контейнер с img внутри
                    const images = node.querySelectorAll && node.querySelectorAll('img[data-src], img[data-srcset]');
                    if (images) {
                        images.forEach(img => imageObserver.observe(img));
                    }
                }
            });
        });
    });

    // Начинаем наблюдение за DOM
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Lazy loading для background images
    const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const bgImage = element.dataset.bgImage;

                if (bgImage) {
                    element.style.backgroundImage = `url('${bgImage}')`;
                    element.removeAttribute('data-bg-image');
                    bgObserver.unobserve(element);

                    console.log('🎨 Background image loaded:', bgImage);
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // Наблюдаем за элементами с data-bg-image
    function observeBackgrounds() {
        document.querySelectorAll('[data-bg-image]').forEach(element => {
            bgObserver.observe(element);
        });
    }

    observeBackgrounds();

    // Экспортируем API для ручного добавления
    window.lazyLoadingAPI = {
        observeImage: (img) => imageObserver.observe(img),
        observeBackground: (element) => bgObserver.observe(element),
        refreshImages: observeImages,
        refreshBackgrounds: observeBackgrounds
    };

    console.log('✅ Lazy loading инициализирован');
})();
