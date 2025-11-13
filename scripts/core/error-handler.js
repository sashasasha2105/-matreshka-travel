/**
 * Глобальный обработчик ошибок для Matreshka Travel
 * Перехватывает все JavaScript ошибки и Promise rejections
 */

(function() {
    'use strict';

    // Конфигурация
    const ERROR_HANDLER_CONFIG = {
        enabled: true,
        showToast: true, // Показывать уведомление пользователю
        logToConsole: true,
        maxErrorsPerSession: 50, // Максимум ошибок за сессию
        ignoredErrors: [
            'ResizeObserver loop limit exceeded', // Известная безобидная ошибка Chrome
            'Non-Error promise rejection captured' // Promise.reject без Error объекта
        ]
    };

    // Счетчик ошибок
    let errorCount = 0;
    const errorLog = [];

    /**
     * Проверка, нужно ли игнорировать ошибку
     */
    function shouldIgnoreError(message) {
        return ERROR_HANDLER_CONFIG.ignoredErrors.some(ignored =>
            message && message.includes(ignored)
        );
    }

    /**
     * Логирование ошибки
     */
    function logError(errorInfo) {
        if (ERROR_HANDLER_CONFIG.logToConsole) {
            console.error('🔴 Перехвачена ошибка:', errorInfo);
        }

        // Сохраняем в лог
        errorLog.push({
            ...errorInfo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });

        // Ограничиваем размер лога
        if (errorLog.length > ERROR_HANDLER_CONFIG.maxErrorsPerSession) {
            errorLog.shift();
        }
    }

    /**
     * Показать уведомление пользователю
     */
    function showErrorToast(message) {
        if (!ERROR_HANDLER_CONFIG.showToast) return;

        // Проверяем что функция showToast доступна
        if (typeof showToast === 'function') {
            showToast(`⚠️ ${message}`, 5000);
        } else {
            // Fallback если showToast еще не загружен
            console.warn('showToast не доступен, ошибка:', message);
        }
    }

    /**
     * Обработчик глобальных JavaScript ошибок
     */
    window.addEventListener('error', function(event) {
        if (!ERROR_HANDLER_CONFIG.enabled) return;

        const { message, filename, lineno, colno, error } = event;

        // Игнорируем некоторые ошибки
        if (shouldIgnoreError(message)) {
            return;
        }

        errorCount++;

        const errorInfo = {
            type: 'JavaScript Error',
            message: message || 'Unknown error',
            filename: filename || 'unknown',
            line: lineno,
            column: colno,
            stack: error?.stack || 'No stack trace',
            count: errorCount
        };

        logError(errorInfo);

        // Показываем уведомление только для первых нескольких ошибок
        if (errorCount <= 3) {
            showErrorToast('Произошла ошибка. Мы работаем над её исправлением.');
        }

        // Предотвращаем бесконечный цикл ошибок
        if (errorCount > ERROR_HANDLER_CONFIG.maxErrorsPerSession) {
            console.error('🛑 Достигнут лимит ошибок за сессию. Прекращаем логирование.');
            ERROR_HANDLER_CONFIG.enabled = false;
        }

        // Не блокируем дефолтную обработку ошибки браузером
        return false;
    });

    /**
     * Обработчик необработанных Promise rejections
     */
    window.addEventListener('unhandledrejection', function(event) {
        if (!ERROR_HANDLER_CONFIG.enabled) return;

        const reason = event.reason;

        // Игнорируем некоторые Promise rejections
        if (shouldIgnoreError(String(reason))) {
            return;
        }

        errorCount++;

        const errorInfo = {
            type: 'Unhandled Promise Rejection',
            message: String(reason) || 'Unknown rejection',
            stack: reason?.stack || 'No stack trace',
            count: errorCount
        };

        logError(errorInfo);

        // Показываем уведомление
        if (errorCount <= 3) {
            showErrorToast('Ошибка загрузки данных. Пожалуйста, попробуйте позже.');
        }

        // Предотвращаем вывод ошибки в консоль (уже логируем сами)
        event.preventDefault();
    });

    /**
     * Wrapper для безопасного выполнения функций
     * Использование: safeExecute(() => { код который может упасть })
     */
    window.safeExecute = function(fn, fallback = null) {
        try {
            return fn();
        } catch (error) {
            console.error('🔴 Ошибка в safeExecute:', error);
            logError({
                type: 'SafeExecute Error',
                message: error.message,
                stack: error.stack
            });

            if (fallback) {
                return fallback();
            }

            return null;
        }
    };

    /**
     * Async wrapper для безопасного выполнения асинхронных функций
     */
    window.safeExecuteAsync = async function(fn, fallback = null) {
        try {
            return await fn();
        } catch (error) {
            console.error('🔴 Ошибка в safeExecuteAsync:', error);
            logError({
                type: 'SafeExecuteAsync Error',
                message: error.message,
                stack: error.stack
            });

            if (fallback) {
                return await fallback();
            }

            return null;
        }
    };

    /**
     * Получить лог всех ошибок (для отладки)
     */
    window.getErrorLog = function() {
        return errorLog;
    };

    /**
     * Очистить лог ошибок
     */
    window.clearErrorLog = function() {
        errorLog.length = 0;
        errorCount = 0;
        ERROR_HANDLER_CONFIG.enabled = true;
        console.log('✅ Лог ошибок очищен');
    };

    /**
     * Экспорт статистики ошибок
     */
    window.getErrorStats = function() {
        return {
            totalErrors: errorCount,
            loggedErrors: errorLog.length,
            handlerEnabled: ERROR_HANDLER_CONFIG.enabled,
            recentErrors: errorLog.slice(-10)
        };
    };

    console.log('✅ Глобальный error handler инициализирован');
})();
