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
        // Загружаем за 300px до появления в viewport (увеличено для быстрого скролла)
        rootMargin: '300px 0px',
        threshold: 0.01
    });

    // Немедленная загрузка изображения
    function loadImageImmediately(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
        }
    }

    // Наблюдаем за всеми изображениями (с защитой от быстрого скролла)
    function observeImages() {
        document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
            // ФИКС: Проверяем, не находится ли изображение УЖЕ в viewport
            const rect = img.getBoundingClientRect();
            const isInViewport = (
                rect.top >= -300 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 300 &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );

            if (isInViewport) {
                // Изображение уже в viewport - загружаем немедленно
                loadImageImmediately(img);
                console.log('📷 Image loaded immediately (already in viewport):', img.dataset.src);
            } else {
                // Изображение вне viewport - наблюдаем за ним
                imageObserver.observe(img);
            }
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
        rootMargin: '300px 0px',  // Увеличен для быстрого скролла
        threshold: 0.01
    });

    // Немедленная загрузка background image
    function loadBackgroundImmediately(element) {
        const bgImage = element.dataset.bgImage;
        if (bgImage) {
            element.style.backgroundImage = `url('${bgImage}')`;
            element.removeAttribute('data-bg-image');
        }
    }

    // Наблюдаем за элементами с data-bg-image (с защитой от быстрого скролла)
    function observeBackgrounds() {
        document.querySelectorAll('[data-bg-image]').forEach(element => {
            // ФИКС: Проверяем, не находится ли элемент УЖЕ в viewport
            const rect = element.getBoundingClientRect();
            const isInViewport = (
                rect.top >= -300 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 300 &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );

            if (isInViewport) {
                // Элемент уже в viewport - загружаем немедленно
                loadBackgroundImmediately(element);
                console.log('🎨 Background loaded immediately (already in viewport):', element.dataset.bgImage);
            } else {
                // Элемент вне viewport - наблюдаем за ним
                bgObserver.observe(element);
            }
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
