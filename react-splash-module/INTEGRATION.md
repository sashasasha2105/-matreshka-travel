# 🔌 Инструкция по интеграции Matreshka Splash Module

Этот документ описывает различные способы интеграции React-модуля splash screen в основной проект Matreshka.

## 📋 Содержание

1. [Вариант 1: iframe интеграция](#вариант-1-iframe-интеграция)
2. [Вариант 2: npm пакет](#вариант-2-npm-пакет)
3. [Вариант 3: Прямое копирование компонентов](#вариант-3-прямое-копирование-компонентов)
4. [Настройка коммуникации](#настройка-коммуникации)
5. [Кастомизация](#кастомизация)

---

## Вариант 1: iframe интеграция

Самый простой способ — встроить модуль через iframe. Модуль работает независимо и общается с родительским приложением через `postMessage`.

### Шаг 1: Запустите модуль

```bash
cd react-splash-module
npm install
npm run dev
```

Модуль будет доступен на `http://localhost:3001`

### Шаг 2: Встройте iframe в основное приложение

В вашем `index.html` или главном компоненте:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Matreshka Travel</title>
    <style>
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
    </style>
</head>
<body>
    <!-- Ваше основное приложение -->
    <div id="app">
        <!-- Контент скрыт до завершения splash -->
        <div id="main-content" style="display: none;">
            <!-- Основной контент Matreshka -->
        </div>
    </div>

    <!-- Splash screen iframe -->
    <iframe
        id="matreshka-splash-iframe"
        src="http://localhost:3001"
    ></iframe>

    <script src="integration.js"></script>
</body>
</html>
```

### Шаг 3: Обработка событий

Создайте `integration.js`:

```javascript
// integration.js

// Слушаем сообщения от splash модуля
window.addEventListener('message', (event) => {
    // Проверяем источник (в продакшене проверяйте origin!)
    if (event.data.type === 'MATRESHKA_COMPLETE') {
        const { regionId, skipped } = event.data;

        console.log('Splash завершен!');
        console.log('Выбранный регион:', regionId);
        console.log('Пропущено:', skipped);

        // Скрываем iframe
        const iframe = document.getElementById('matreshka-splash-iframe');
        iframe.classList.add('hidden');

        // Удаляем iframe через 500ms после анимации
        setTimeout(() => {
            iframe.remove();
        }, 500);

        // Показываем основное приложение
        const mainContent = document.getElementById('main-content');
        mainContent.style.display = 'block';

        // Сохраняем выбранный регион
        if (regionId) {
            localStorage.setItem('selectedRegion', regionId);
            // Можно перенаправить на страницу региона
            // window.location.hash = `#region/${regionId}`;
        }

        // Инициализация вашего приложения
        initMatreshkaApp(regionId);
    }
});

function initMatreshkaApp(selectedRegionId) {
    console.log('Инициализация Matreshka с регионом:', selectedRegionId);
    // Ваша логика инициализации
}

// Проверяем, был ли уже показан splash ранее
const hasSeenSplash = localStorage.getItem('hasSeenSplash');
if (hasSeenSplash === 'true') {
    // Пропускаем splash, сразу показываем приложение
    document.getElementById('matreshka-splash-iframe').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

    const savedRegion = localStorage.getItem('selectedRegion');
    initMatreshkaApp(savedRegion);
} else {
    // Отмечаем что splash был показан
    localStorage.setItem('hasSeenSplash', 'true');
}
```

---

## Вариант 2: npm пакет

Если вы хотите использовать компоненты напрямую в React-приложении.

### Шаг 1: Соберите модуль как пакет

В `react-splash-module/package.json` добавьте:

```json
{
  "name": "@matreshka/splash-module",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build:lib": "tsc && tsup src/components/index.ts --format esm,cjs --dts"
  }
}
```

Установите `tsup`:

```bash
npm install -D tsup
```

Соберите:

```bash
npm run build:lib
```

### Шаг 2: Установите в основной проект

```bash
# Из локальной папки
npm install ../react-splash-module

# Или опубликуйте в npm registry
```

### Шаг 3: Используйте компоненты

```tsx
import { MatreshkaEntryFlow } from '@matreshka/splash-module';
import { MATRESHKA_REGIONS } from '@matreshka/splash-module/data';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <MatreshkaEntryFlow
          regions={MATRESHKA_REGIONS}
          onComplete={(regionId) => {
            setShowSplash(false);
            console.log('Selected region:', regionId);
          }}
        />
      )}

      {!showSplash && (
        <MainApp />
      )}
    </>
  );
}
```

---

## Вариант 3: Прямое копирование компонентов

Для максимальной гибкости скопируйте компоненты в основной проект.

### Шаг 1: Скопируйте файлы

```bash
# Из корня основного проекта
cp -r react-splash-module/src/components ./components/splash
cp -r react-splash-module/src/lib ./lib
cp -r react-splash-module/src/types ./types
cp -r react-splash-module/src/data ./data
```

### Шаг 2: Установите зависимости

```bash
npm install motion dotted-map clsx tailwind-merge
```

### Шаг 3: Настройте импорты

Замените все `@/` импорты на относительные пути согласно вашей структуре.

---

## Настройка коммуникации

### События postMessage

Модуль отправляет следующее событие:

```typescript
interface MatreshkaCompleteEvent {
  type: 'MATRESHKA_COMPLETE';
  regionId: string | null;
  skipped: boolean;
}
```

### Пример обработчика

```javascript
window.addEventListener('message', (event) => {
  // В продакшене ОБЯЗАТЕЛЬНО проверяйте origin!
  if (event.origin !== 'http://localhost:3001') {
    return;
  }

  if (event.data.type === 'MATRESHKA_COMPLETE') {
    const { regionId, skipped } = event.data;

    if (!skipped && regionId) {
      // Пользователь выбрал регион
      handleRegionSelection(regionId);
    } else {
      // Пользователь пропустил выбор
      handleSkip();
    }
  }
});
```

---

## Кастомизация

### Цвета

Измените цвета в `tailwind.config.ts`:

```typescript
colors: {
  matreshka: {
    primary: '#6366f1',     // Основной цвет
    secondary: '#818cf8',   // Вторичный
    dark: '#0a0118',        // Темный фон
    darker: '#0f0520',      // Еще темнее
    accent: '#c7d2fe',      // Акцентный
  },
}
```

### Продолжительность splash screen

В компоненте `MatreshkaSplashScreen.tsx`:

```typescript
const SPLASH_DURATION = 4000; // миллисекунды
```

Или передайте через props:

```tsx
<MatreshkaSplashScreen
  regions={regions}
  onFinish={handleFinish}
  duration={5000} // 5 секунд
/>
```

### Цвет линий на карте

```tsx
<MatreshkaSplashScreen
  regions={regions}
  onFinish={handleFinish}
  lineColor="#ff6b6b" // Красный цвет
/>
```

### Регионы

Отредактируйте `src/data/regions.ts` для добавления/удаления регионов:

```typescript
export const MATRESHKA_REGIONS: Region[] = [
  {
    id: 'moscow',
    name: 'Москва',
    lat: 55.7558,
    lng: 37.6173,
    emoji: '🏛️',
  },
  // Добавьте свои регионы...
];
```

---

## Production готовность

### Build для продакшена

```bash
cd react-splash-module
npm run build
npm start
```

### Deploy на Vercel/Netlify

1. Подключите репозиторий
2. Укажите root directory: `react-splash-module`
3. Build command: `npm run build`
4. Output directory: `.next`

### Использование CDN

После деплоя замените localhost URL на production:

```html
<iframe
    id="matreshka-splash-iframe"
    src="https://your-splash-module.vercel.app"
></iframe>
```

---

## Troubleshooting

### Карта не отображается

Убедитесь что установлен `dotted-map`:

```bash
npm install dotted-map --legacy-peer-deps
```

### Анимации не работают

Проверьте версию `motion`:

```bash
npm install motion@12.0.0-alpha.2
```

### Ошибки TypeScript

Проверьте пути в `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Поддержка

Для вопросов и проблем:
- GitHub Issues: [ссылка на репозиторий]
- Документация: [README.md](./README.md)

---

**Создано с ❤️ для проекта Matreshka Travel**
