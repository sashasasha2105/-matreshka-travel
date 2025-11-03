/**
 * PRODUCTION LOGGER
 * Умное логирование с отключением в продакшене
 */

(function() {
    'use strict';

    // Определяем режим работы
    const IS_PRODUCTION = window.location.hostname !== 'localhost' &&
                          !window.location.hostname.includes('127.0.0.1') &&
                          !window.location.hostname.includes('.local');

    const IS_DEBUG = localStorage.getItem('debugMode') === 'true';

    class Logger {
        constructor() {
            this.production = IS_PRODUCTION;
            this.debugEnabled = IS_DEBUG;

            // Счетчики для мониторинга
            this.stats = {
                errors: 0,
                warnings: 0,
                infos: 0,
                debugs: 0
            };

            console.log(
                `📊 Logger инициализирован | Режим: ${this.production ? 'PRODUCTION' : 'DEVELOPMENT'} | Debug: ${this.debugEnabled ? 'ON' : 'OFF'}`
            );
        }

        /**
         * Debug - только в development или если включен debugMode
         */
        debug(...args) {
            if (!this.production || this.debugEnabled) {
                console.log(...args);
                this.stats.debugs++;
            }
        }

        /**
         * Info - всегда показываем важную информацию
         */
        info(...args) {
            console.info(...args);
            this.stats.infos++;
        }

        /**
         * Warning - всегда показываем предупреждения
         */
        warn(...args) {
            console.warn(...args);
            this.stats.warnings++;

            // В production отправляем критичные warning в аналитику
            if (this.production && window.matryoshkaAnalytics) {
                this.sendToAnalytics('warning', args);
            }
        }

        /**
         * Error - всегда показываем и логируем ошибки
         */
        error(...args) {
            console.error(...args);
            this.stats.errors++;

            // В production отправляем все ошибки в аналитику
            if (this.production && window.matryoshkaAnalytics) {
                this.sendToAnalytics('error', args);
            }
        }

        /**
         * Отправка в аналитику (только критичное)
         */
        async sendToAnalytics(level, args) {
            try {
                const message = args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' ');

                await window.matryoshkaAnalytics.trackAction(
                    `${level.toUpperCase()}: ${message.substring(0, 200)}`
                );
            } catch (e) {
                // Тихо проглатываем ошибки аналитики
            }
        }

        /**
         * Группа логов (только в dev)
         */
        group(label) {
            if (!this.production || this.debugEnabled) {
                console.group(label);
            }
        }

        groupEnd() {
            if (!this.production || this.debugEnabled) {
                console.groupEnd();
            }
        }

        /**
         * Время выполнения (только в dev)
         */
        time(label) {
            if (!this.production || this.debugEnabled) {
                console.time(label);
            }
        }

        timeEnd(label) {
            if (!this.production || this.debugEnabled) {
                console.timeEnd(label);
            }
        }

        /**
         * Таблицы (только в dev)
         */
        table(data) {
            if (!this.production || this.debugEnabled) {
                console.table(data);
            }
        }

        /**
         * Получить статистику логирования
         */
        getStats() {
            return {
                ...this.stats,
                mode: this.production ? 'production' : 'development',
                debugEnabled: this.debugEnabled
            };
        }

        /**
         * Очистить консоль (только в dev)
         */
        clear() {
            if (!this.production || this.debugEnabled) {
                console.clear();
            }
        }

        /**
         * Включить/выключить debug mode вручную
         */
        toggleDebug() {
            this.debugEnabled = !this.debugEnabled;
            localStorage.setItem('debugMode', this.debugEnabled ? 'true' : 'false');
            console.log('🔧 Debug mode:', this.debugEnabled ? 'ВКЛЮЧЕН' : 'ВЫКЛЮЧЕН');
            return this.debugEnabled;
        }
    }

    // Создаем глобальный logger
    window.logger = new Logger();

    // Перехватываем глобальные ошибки
    window.addEventListener('error', (event) => {
        window.logger.error('Uncaught error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        window.logger.error('Unhandled promise rejection:', event.reason);
    });

    // API для удобного использования
    window.log = window.logger.debug.bind(window.logger);
    window.logInfo = window.logger.info.bind(window.logger);
    window.logWarn = window.logger.warn.bind(window.logger);
    window.logError = window.logger.error.bind(window.logger);

    console.log('✅ Production Logger готов');
})();
