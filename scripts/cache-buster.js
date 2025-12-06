/**
 * 🧹 Cache Buster для Telegram WebView
 * Принудительно очищает кэш и перезагружает данные
 */

(function() {
    const APP_VERSION = '2.1.0'; // Увеличивай при критичных обновлениях
    const VERSION_KEY = 'matreshka_app_version';

    // Проверяем версию при загрузке
    function checkVersion() {
        const savedVersion = localStorage.getItem(VERSION_KEY);

        if (savedVersion !== APP_VERSION) {
            console.log(`🔄 Обнаружена новая версия: ${APP_VERSION} (была: ${savedVersion})`);
            clearCache();
            localStorage.setItem(VERSION_KEY, APP_VERSION);
            console.log('✅ Кэш очищен, версия обновлена');
        } else {
            console.log(`✅ Версия актуальна: ${APP_VERSION}`);
        }
    }

    // Очистка всех кэшей
    function clearCache() {
        // Очищаем localStorage (кроме важных данных пользователя)
        const keysToKeep = ['user_id', 'user_favorites', 'user_profile'];
        const allKeys = Object.keys(localStorage);

        allKeys.forEach(key => {
            if (!keysToKeep.includes(key) && key !== VERSION_KEY) {
                localStorage.removeItem(key);
                console.log(`🗑️ Удален: ${key}`);
            }
        });

        // Очищаем sessionStorage
        sessionStorage.clear();

        // Очищаем Service Worker cache (если есть)
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                    console.log(`🗑️ Кэш удален: ${name}`);
                });
            });
        }
    }

    // Принудительная перезагрузка без кэша
    function forceReload() {
        console.log('🔄 Принудительная перезагрузка...');
        window.location.reload(true); // Hard reload
    }

    // Команда для ручной очистки через консоль
    window.clearMatreshkaCache = function() {
        console.log('🧹 Ручная очистка кэша...');
        clearCache();
        console.log('✅ Готово! Перезагружаю страницу...');
        setTimeout(forceReload, 1000);
    };

    // Автоматическая проверка при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkVersion);
    } else {
        checkVersion();
    }

    console.log('🧹 Cache Buster загружен. Версия:', APP_VERSION);
    console.log('💡 Для ручной очистки: clearMatreshkaCache()');
})();
