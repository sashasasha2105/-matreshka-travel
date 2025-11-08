/**
 * РЕГИСТРАЦИЯ SERVICE WORKER
 * Подключает Service Worker для оффлайн-режима и турбо-кэширования
 */

(function() {
    'use strict';

    // Проверяем поддержку Service Worker
    if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Worker не поддерживается этим браузером');
        return;
    }

    // Регистрация при загрузке страницы
    window.addEventListener('load', async () => {
        try {
            console.log('📡 Регистрация Service Worker...');

            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            console.log('✅ Service Worker зарегистрирован:', registration.scope);

            // Отслеживаем обновления
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('🆕 Доступна новая версия приложения');

                        // ⚠️ НЕ ПОКАЗЫВАЕМ уведомление автоматически
                        // Это предотвращает бесконечные перезагрузки
                        // showUpdateNotification(newWorker);
                        console.log('ℹ️ Новая версия будет применена при следующем визите');
                    }
                });
            });

            // ⚠️ ОТКЛЮЧЕНА периодическая проверка обновлений
            // Это предотвращает бесконечные перезагрузки
            // setInterval(() => {
            //     registration.update();
            // }, 60 * 60 * 1000);

        } catch (error) {
            console.error('❌ Ошибка регистрации Service Worker:', error);
        }
    });

    /**
     * Показать уведомление об обновлении
     */
    function showUpdateNotification(newWorker) {
        // Создаем красивое уведомление
        const notification = document.createElement('div');
        notification.className = 'sw-update-notification';
        notification.innerHTML = `
            <div class="sw-update-content">
                <div class="sw-update-icon">🔄</div>
                <div class="sw-update-text">
                    <div class="sw-update-title">Доступна новая версия</div>
                    <div class="sw-update-subtitle">Обновите для получения улучшений</div>
                </div>
                <button class="sw-update-btn" id="swUpdateBtn">
                    Обновить
                </button>
            </div>
        `;

        // Добавляем стили
        const style = document.createElement('style');
        style.textContent = `
            .sw-update-notification {
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10001;
                animation: slideUp 0.3s ease-out;
            }

            @keyframes slideUp {
                from {
                    transform: translateX(-50%) translateY(100px);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }

            .sw-update-content {
                background: linear-gradient(135deg, rgba(15, 5, 32, 0.98), rgba(30, 10, 50, 0.98));
                border: 2px solid rgba(255, 204, 0, 0.4);
                border-radius: 16px;
                padding: 16px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(10px);
                max-width: 90vw;
            }

            .sw-update-icon {
                font-size: 2rem;
                animation: rotate 2s linear infinite;
            }

            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .sw-update-text {
                flex: 1;
            }

            .sw-update-title {
                color: #ffcc00;
                font-weight: 700;
                font-size: 0.95rem;
                margin-bottom: 4px;
            }

            .sw-update-subtitle {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.85rem;
            }

            .sw-update-btn {
                background: linear-gradient(135deg, #ffcc00, #ff8e53);
                color: #1a1a2e;
                border: none;
                border-radius: 12px;
                padding: 10px 20px;
                font-weight: 700;
                font-size: 0.9rem;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }

            .sw-update-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 16px rgba(255, 204, 0, 0.4);
            }

            .sw-update-btn:active {
                transform: scale(0.95);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(notification);

        // Обработчик кнопки обновления
        document.getElementById('swUpdateBtn').addEventListener('click', () => {
            // Активируем новый Service Worker
            newWorker.postMessage({ action: 'skipWaiting' });

            // Перезагружаем страницу
            window.location.reload();
        });
    }

    /**
     * API для управления Service Worker
     */
    window.serviceWorkerAPI = {
        /**
         * Очистить все кэши
         */
        clearCache: async () => {
            if (!navigator.serviceWorker.controller) {
                console.warn('⚠️ Service Worker не активен');
                return;
            }

            navigator.serviceWorker.controller.postMessage({
                action: 'clearCache'
            });

            console.log('🗑️ Запрос на очистку кэша отправлен');
        },

        /**
         * Получить размер кэша
         */
        getCacheSize: async () => {
            if (!navigator.serviceWorker.controller) {
                console.warn('⚠️ Service Worker не активен');
                return null;
            }

            return new Promise((resolve) => {
                const messageChannel = new MessageChannel();

                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data.size);
                };

                navigator.serviceWorker.controller.postMessage(
                    { action: 'getCacheSize' },
                    [messageChannel.port2]
                );
            });
        },

        /**
         * Проверить статус Service Worker
         */
        getStatus: () => {
            return {
                supported: 'serviceWorker' in navigator,
                registered: !!navigator.serviceWorker.controller,
                scope: navigator.serviceWorker.controller?.scope || null
            };
        }
    };

    console.log('✅ Service Worker регистратор готов');
})();
