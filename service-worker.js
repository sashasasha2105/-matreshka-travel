/**
 * SERVICE WORKER - АГРЕССИВНОЕ КЭШИРОВАНИЕ
 * Обеспечивает мгновенную загрузку и офлайн-режим
 */

const CACHE_VERSION = 'matryoshka-v3.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Критические ресурсы для офлайн-режима
const CRITICAL_RESOURCES = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './performance-optimizer.js',
    './storage.js',
    './lazy-loading.js',
    './error-handler.js'
];

// Максимальный размер кэша (количество элементов)
const MAX_CACHE_SIZE = {
    static: 50,
    dynamic: 100,
    images: 200
};

// ============= УСТАНОВКА =============
self.addEventListener('install', (event) => {
    console.log('[SW] Установка Service Worker v' + CACHE_VERSION);

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Кэширование критических ресурсов');
                return cache.addAll(CRITICAL_RESOURCES);
            })
            .then(() => {
                console.log('[SW] Критические ресурсы закэширова��ы');
                return self.skipWaiting(); // Активируем сразу
            })
            .catch((error) => {
                console.error('[SW] Ошибка кэширования:', error);
            })
    );
});

// ============= АКТИВАЦИЯ =============
self.addEventListener('activate', (event) => {
    console.log('[SW] Активация Service Worker v' + CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                // Удаляем старые кэши
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (!cacheName.startsWith(CACHE_VERSION)) {
                            console.log('[SW] Удаление старого кэша:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Старые кэши очищены');
                return self.clients.claim(); // Контролируем страницы сразу
            })
    );
});

// ============= ПЕРЕХВАТ ЗАПРОСОВ =============
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Пропускаем внешние домены (кроме изображений)
    if (url.origin !== location.origin && !isImage(request)) {
        return;
    }

    // Пропускаем chrome-extension и т.д.
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Стратегия для разных типов контента
    if (isImage(request)) {
        event.respondWith(handleImageRequest(request));
    } else if (isStaticAsset(request)) {
        event.respondWith(handleStaticRequest(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});

// ============= СТРАТЕГИЯ ДЛЯ ИЗОБРАЖЕНИЙ =============
// Cache First, затем Network (с умным кэшированием)
async function handleImageRequest(request) {
    try {
        // 1. Проверяем кэш
        const cache = await caches.open(IMAGE_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            console.log('[SW] Изображение из кэша:', request.url);
            return cachedResponse;
        }

        // 2. Загружаем из сети
        console.log('[SW] Загрузка изображения из сети:', request.url);
        const networkResponse = await fetch(request);

        // 3. Кэшируем если успешно
        if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();

            // Ограничиваем размер кэша
            limitCacheSize(IMAGE_CACHE, MAX_CACHE_SIZE.images);

            cache.put(request, responseClone);
            console.log('[SW] Изображение закэшировано:', request.url);
        }

        return networkResponse;

    } catch (error) {
        console.error('[SW] Ошибка загрузки изображения:', error);

        // Возвращаем placeholder
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#f0f0f0" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="#999">Изображение недоступно</text></svg>',
            {
                headers: { 'Content-Type': 'image/svg+xml' }
            }
        );
    }
}

// ============= СТРАТЕГИЯ ДЛЯ СТАТИЧЕСКИХ РЕСУРСОВ =============
// Cache First, затем Network (CSS, JS)
async function handleStaticRequest(request) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            console.log('[SW] Статический ресурс из кэша:', request.url);

            // Асинхронно обновляем кэш в фоне (stale-while-revalidate)
            fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    cache.put(request, networkResponse.clone());
                }
            }).catch(() => {});

            return cachedResponse;
        }

        // Если нет в кэше - загружаем
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            cache.put(request, responseClone);
            console.log('[SW] Статический ресурс закэширован:', request.url);
        }

        return networkResponse;

    } catch (error) {
        console.error('[SW] Ошибка загрузки статического ресурса:', error);
        throw error;
    }
}

// ============= СТРАТЕГИЯ ДЛЯ ДИНАМИЧЕСКОГО КОНТЕНТА =============
// Network First, затем Cache (HTML, API)
async function handleDynamicRequest(request) {
    try {
        // Сначала пытаемся загрузить из сети
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.status === 200) {
            // Кэшируем успешный ответ
            const cache = await caches.open(DYNAMIC_CACHE);
            const responseClone = networkResponse.clone();

            limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE.dynamic);
            cache.put(request, responseClone);

            console.log('[SW] Динамический контент закэширован:', request.url);
        }

        return networkResponse;

    } catch (error) {
        // Сеть недоступна - пытаемся взять из кэша
        console.log('[SW] Сеть недоступна, проверяем кэш:', request.url);

        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            console.log('[SW] Контент из офлайн-кэша:', request.url);
            return cachedResponse;
        }

        // Если это HTML - показываем офлайн-страницу
        if (request.headers.get('accept').includes('text/html')) {
            const offlinePage = await cache.match('/index.html');
            if (offlinePage) {
                return offlinePage;
            }
        }

        throw error;
    }
}

// ============= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =============

/**
 * Проверка, является ли запрос изображением
 */
function isImage(request) {
    return request.destination === 'image' ||
           request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

/**
 * Проверка, является ли запрос статическим ресурсом
 */
function isStaticAsset(request) {
    return request.url.match(/\.(css|js|woff2?|ttf|eot)$/i);
}

/**
 * Ограничение размера кэша
 */
async function limitCacheSize(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxSize) {
        // Удаляем самые старые (первые в списке)
        const keysToDelete = keys.slice(0, keys.length - maxSize);

        await Promise.all(
            keysToDelete.map((key) => {
                console.log('[SW] Удаление из кэша:', key.url);
                return cache.delete(key);
            })
        );
    }
}

// ============= ОБРАБОТКА СООБЩЕНИЙ =============
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                console.log('[SW] Все кэши очищены');
            })
        );
    }

    if (event.data.action === 'getCacheSize') {
        event.waitUntil(
            getCacheSize().then((size) => {
                event.ports[0].postMessage({ size });
            })
        );
    }
});

/**
 * Получить размер всех кэшей
 */
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();

        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }

    return {
        bytes: totalSize,
        mb: (totalSize / 1024 / 1024).toFixed(2)
    };
}

console.log('[SW] Service Worker загружен');
