/**
 * Вспомогательные функции для отладки localStorage
 * Эти функции доступны в консоли браузера для диагностики
 */

(function() {
    'use strict';

    /**
     * Проверить все данные в localStorage
     */
    window.debugCheckLocalStorage = function() {
        console.log('🔍🔍🔍 ПРОВЕРКА ВСЕХ ДАННЫХ В localStorage 🔍🔍🔍');
        console.log('');

        // Проверяем размер
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        console.log('📦 Общий размер localStorage:', (totalSize / 1024).toFixed(2), 'KB');
        console.log('📦 Лимит обычно: 5000-10000 KB');
        console.log('');

        // Проверяем каждый ключ
        console.log('📋 Ключи в localStorage:');
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const value = localStorage[key];
                console.log(`  - ${key}: ${(value.length / 1024).toFixed(2)} KB`);
            }
        }
        console.log('');

        // Проверяем путешествия профиля
        const profileStories = localStorage.getItem('matryoshka_stories');
        if (profileStories) {
            console.log('✅ matryoshka_stories существует');
            const parsed = JSON.parse(profileStories);
            console.log('  📊 Путешествий:', parsed.length);

            if (parsed.length > 0) {
                const first = parsed[0];
                console.log('  🔍 Первое путешествие:');
                console.log('    - Название:', first.title);
                console.log('    - Описание:', first.text?.substring(0, 50));
                console.log('    - Изображений:', first.images?.length);

                if (first.images && first.images.length > 0) {
                    console.log('    - Первое изображение:');
                    console.log('      * Длина:', first.images[0]?.length);
                    console.log('      * Начинается с:', first.images[0]?.substring(0, 100));
                    console.log('      * Это base64?', first.images[0]?.startsWith('data:image/') ? 'ДА ✅' : 'НЕТ ❌');
                } else {
                    console.error('    ❌ ПРОБЛЕМА: Нет изображений в первом путешествии!');
                }
            }
        } else {
            console.warn('  ⚠️ matryoshka_stories не найден');
        }
        console.log('');

        // Проверяем глобальную базу путешествий
        const globalTravels = localStorage.getItem('matryoshka_all_travels');
        if (globalTravels) {
            console.log('✅ matryoshka_all_travels существует');
            const parsed = JSON.parse(globalTravels);
            console.log('  📊 Путешествий:', parsed.length);

            if (parsed.length > 0) {
                const first = parsed[0];
                console.log('  🔍 Первое путешествие:');
                console.log('    - Название:', first.title);
                console.log('    - Описание:', first.text?.substring(0, 50));
                console.log('    - Изображений:', first.images?.length);

                if (first.images && first.images.length > 0) {
                    console.log('    - Первое изображение:');
                    console.log('      * Длина:', first.images[0]?.length);
                    console.log('      * Начинается с:', first.images[0]?.substring(0, 100));
                    console.log('      * Это base64?', first.images[0]?.startsWith('data:image/') ? 'ДА ✅' : 'НЕТ ❌');
                } else {
                    console.error('    ❌ ПРОБЛЕМА: Нет изображений в первом путешествии!');
                }
            }
        } else {
            console.warn('  ⚠️ matryoshka_all_travels не найден');
        }

        console.log('');
        console.log('✅ Проверка завершена');
    };

    /**
     * Показать первое изображение первого путешествия
     */
    window.debugShowFirstImage = function() {
        console.log('🖼️ Попытка показать первое изображение...');

        const globalTravels = localStorage.getItem('matryoshka_all_travels');
        if (!globalTravels) {
            console.error('❌ matryoshka_all_travels не найден');
            return;
        }

        const parsed = JSON.parse(globalTravels);
        if (parsed.length === 0) {
            console.error('❌ Нет путешествий');
            return;
        }

        const first = parsed[0];
        if (!first.images || first.images.length === 0) {
            console.error('❌ Нет изображений в первом путешествии');
            return;
        }

        const img = first.images[0];
        console.log('📸 Изображение:');
        console.log('  - Длина:', img.length);
        console.log('  - Тип:', typeof img);
        console.log('  - Начинается с data:image/?', img.startsWith('data:image/') ? 'ДА ✅' : 'НЕТ ❌');
        console.log('  - Первые 200 символов:');
        console.log(img.substring(0, 200));

        // Пытаемся показать изображение
        if (img.startsWith('data:image/')) {
            console.log('✅ Это валидный base64 data URL, можно использовать в <img src="">');
        } else {
            console.error('❌ Это НЕ валидный base64 data URL!');
        }
    };

    /**
     * Очистить все данные Матрешки из localStorage
     */
    window.debugClearMatryoshkaData = function() {
        const confirmed = confirm('⚠️ Вы уверены что хотите удалить ВСЕ данные Матрешки?\nЭто действие нельзя отменить!');

        if (!confirmed) {
            console.log('❌ Отменено');
            return;
        }

        console.log('🗑️ Удаление данных Матрешки...');

        const keys = [
            'matryoshka_stories',
            'matryoshka_profile',
            'matryoshka_avatar',
            'matryoshka_all_travels',
            'purchasedPackages',
            'paidRegions',
            'matryoshkaQuests'
        ];

        keys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`✅ Удалено: ${key}`);
            }
        });

        console.log('✅ Все данные Матрешки удалены');
        console.log('🔄 Перезагрузите страницу для применения изменений');
    };

    /**
     * Проверить конкретное путешествие по индексу
     */
    window.debugCheckTravel = function(index = 0) {
        console.log(`🔍 Проверка путешествия #${index}...`);

        const globalTravels = localStorage.getItem('matryoshka_all_travels');
        if (!globalTravels) {
            console.error('❌ matryoshka_all_travels не найден');
            return;
        }

        const parsed = JSON.parse(globalTravels);
        if (index >= parsed.length) {
            console.error(`❌ Путешествие #${index} не существует (всего: ${parsed.length})`);
            return;
        }

        const travel = parsed[index];
        console.log('📋 Данные путешествия:');
        console.log(travel);
        console.log('');
        console.log('🖼️ Изображения:');
        if (travel.images && travel.images.length > 0) {
            travel.images.forEach((img, i) => {
                console.log(`  [${i}] Длина: ${img.length}, Base64: ${img.startsWith('data:image/') ? 'ДА' : 'НЕТ'}`);
            });
        } else {
            console.error('  ❌ Нет изображений!');
        }
    };

    console.log('🛠️ Debug helpers загружены. Доступные команды:');
    console.log('  - debugCheckLocalStorage() - проверить весь localStorage');
    console.log('  - debugShowFirstImage() - показать первое изображение');
    console.log('  - debugCheckTravel(index) - проверить конкретное путешествие');
    console.log('  - debugClearMatryoshkaData() - очистить все данные (осторожно!)');
})();
