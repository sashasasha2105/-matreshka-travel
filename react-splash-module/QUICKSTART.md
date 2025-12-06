# 🚀 Быстрый старт

Это краткое руководство для немедленного запуска и тестирования модуля.

## ⚡ Запуск за 3 минуты

### 1. Установка зависимостей

```bash
cd react-splash-module
npm install
```

**Важно:** Если возникают проблемы с `dotted-map`, используйте:

```bash
npm install dotted-map --legacy-peer-deps
```

### 2. Запуск dev-сервера

```bash
npm run dev
```

Откройте http://localhost:3001 в браузере.

### 3. Что вы увидите

1. **Splash screen** (4 секунды)
   - Анимированная карта мира с фокусом на России
   - Плавное появление линий между регионами
   - Пульсирующие точки на городах

2. **Welcome modal** (после splash)
   - Выбор региона из выпадающего списка
   - Информация о приветственном бонусе
   - Кнопки "Продолжить" и "Пропустить"

3. **Результат** (после выбора)
   - Страница с информацией о выбранном регионе
   - Кнопка для перезапуска демо

---

## 🧪 Тестирование интеграции

### Вариант A: Тест в отдельном окне

Просто откройте http://localhost:3001 — это standalone версия.

### Вариант B: Тест через iframe

Создайте файл `test-integration.html` в корне **основного** проекта:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Matreshka Splash Integration</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, sans-serif;
            background: #0f0520;
            color: white;
        }

        #matreshka-splash-iframe {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            border: none;
            z-index: 10000;
            transition: opacity 0.5s ease;
        }

        #matreshka-splash-iframe.hidden {
            opacity: 0;
            pointer-events: none;
        }

        #main-content {
            display: none;
            max-width: 800px;
            margin: 0 auto;
            padding: 60px 20px;
            text-align: center;
        }

        #main-content.visible {
            display: block;
        }

        .status {
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }

        button {
            background: #6366f1;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        button:hover {
            background: #818cf8;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <!-- Основное приложение -->
    <div id="main-content">
        <h1>✅ Matreshka Travel</h1>
        <p>Splash screen успешно завершен!</p>

        <div class="status" id="status">
            <h3>Информация о выборе:</h3>
            <p id="region-info">Загрузка...</p>
        </div>

        <button onclick="restartSplash()">🔄 Перезапустить Splash Screen</button>
    </div>

    <!-- Splash screen iframe -->
    <iframe
        id="matreshka-splash-iframe"
        src="http://localhost:3001"
    ></iframe>

    <script>
        // Слушаем сообщения от splash модуля
        window.addEventListener('message', (event) => {
            console.log('Получено сообщение:', event.data);

            if (event.data.type === 'MATRESHKA_COMPLETE') {
                const { regionId, skipped } = event.data;

                console.log('✅ Splash завершен!');
                console.log('Регион:', regionId);
                console.log('Пропущено:', skipped);

                // Скрываем iframe
                const iframe = document.getElementById('matreshka-splash-iframe');
                iframe.classList.add('hidden');

                setTimeout(() => {
                    iframe.style.display = 'none';
                }, 500);

                // Показываем основное приложение
                const mainContent = document.getElementById('main-content');
                mainContent.classList.add('visible');

                // Обновляем информацию
                const regionInfo = document.getElementById('region-info');
                if (skipped) {
                    regionInfo.innerHTML = '<strong>Выбор пропущен</strong><br>Пользователь решил начать без региона';
                } else if (regionId) {
                    regionInfo.innerHTML = `<strong>Выбран регион:</strong> ${regionId}<br>Приветственный бонус активирован!`;
                    localStorage.setItem('selectedRegion', regionId);
                }
            }
        });

        function restartSplash() {
            location.reload();
        }
    </script>
</body>
</html>
```

Откройте файл в браузере:

```bash
# В корне основного проекта
open test-integration.html
# или для Linux
xdg-open test-integration.html
```

---

## 📝 Проверка функциональности

### ✅ Чек-лист

- [ ] Splash screen появляется сразу при загрузке
- [ ] Карта анимируется плавно (линии рисуются постепенно)
- [ ] Точки на карте пульсируют
- [ ] Через 4 секунды splash исчезает
- [ ] Появляется welcome modal
- [ ] Можно выбрать регион из списка
- [ ] При выборе региона показывается информация о бонусе
- [ ] Кнопка "Продолжить" активна только при выборе региона
- [ ] Кнопка "Пропустить" работает
- [ ] После завершения отправляется postMessage (в iframe режиме)

---

## 🐛 Частые проблемы

### Карта не загружается

**Решение:**
```bash
npm install dotted-map --legacy-peer-deps
```

### Анимации не работают

**Проверьте версию motion:**
```bash
npm list motion
# Должно быть: motion@12.0.0-alpha.2
```

**Переустановите если нужно:**
```bash
npm uninstall motion
npm install motion@12.0.0-alpha.2
```

### Ошибка "Module not found: @/"

**Решение:** Убедитесь что в `tsconfig.json` правильно настроены paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### iframe не работает

1. Убедитесь что dev-сервер запущен на порту 3001
2. Проверьте консоль браузера на ошибки CORS
3. Проверьте что URL в iframe правильный: `http://localhost:3001`

---

## 🎨 Кастомизация для теста

### Изменить время splash

В `src/components/MatreshkaSplashScreen.tsx`:
```typescript
const SPLASH_DURATION = 2000; // 2 секунды вместо 4
```

### Изменить цвет линий

В `src/app/page.tsx`:
```tsx
<MatreshkaEntryFlow
  regions={MATRESHKA_REGIONS}
  onComplete={handleComplete}
  lineColor="#ff6b6b" // Красный
/>
```

### Пропустить splash (для быстрого теста modal)

В `src/app/page.tsx`:
```tsx
<MatreshkaEntryFlow
  regions={MATRESHKA_REGIONS}
  onComplete={handleComplete}
  skipSplash={true} // Пропустить splash
/>
```

---

## 📚 Следующие шаги

1. ✅ **Протестировали модуль** — всё работает
2. 📖 **Прочитайте** [INTEGRATION.md](./INTEGRATION.md) — как интегрировать в основной проект
3. 🎨 **Кастомизируйте** цвета, тексты, регионы под свои нужды
4. 🚀 **Интегрируйте** один из трех способов из документации

---

## 💡 Быстрые команды

```bash
# Установка
npm install

# Запуск dev-сервера
npm run dev

# Сборка для продакшена
npm run build

# Запуск production версии
npm start

# Линтинг
npm run lint
```

---

**Готово! 🎉**

Модуль готов к работе и интеграции. Если возникли вопросы — смотрите [README.md](./README.md) или [INTEGRATION.md](./INTEGRATION.md).
