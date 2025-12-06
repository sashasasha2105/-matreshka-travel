# Matreshka Splash Module

Независимый React-модуль для экрана загрузки и приветственного окна проекта Matreshka Travel.

## Особенности

- 🗺️ Анимированная карта мира с фокусом на России
- ✨ Плавные анимации точек и линий между регионами
- 🎨 Минималистичный темный дизайн
- 📱 Адаптивный дизайн
- 🔌 Легкая интеграция в основной проект

## Технологии

- Next.js 15 + App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Motion (Framer Motion)
- Dotted Map

## Установка

```bash
cd react-splash-module
npm install
```

## Запуск

```bash
npm run dev
```

Откроется на http://localhost:3001

## Компоненты

### MatreshkaSplashScreen
Полноэкранный загрузочный экран с анимированной картой мира (4 секунды).

```tsx
<MatreshkaSplashScreen
  regions={regions}
  onFinish={() => console.log('Splash finished')}
/>
```

### WelcomeMatreshkaModal
Приветственное модальное окно с выбором региона.

```tsx
<WelcomeMatreshkaModal
  isOpen={true}
  regions={regions}
  onRegionSelected={(regionId) => console.log(regionId)}
  onSkip={() => console.log('Skipped')}
/>
```

### MatreshkaEntryFlow
Оркестратор, управляющий последовательностью splash → welcome modal.

```tsx
<MatreshkaEntryFlow
  regions={regions}
  onComplete={(selectedRegionId?) => console.log('Flow complete')}
/>
```

## Интеграция в основной проект

### Вариант 1: Использование как standalone приложение

1. Запустите модуль на отдельном порту (3001)
2. Встройте в основной проект через iframe:

```html
<iframe
  src="http://localhost:3001"
  style="width: 100vw; height: 100vh; border: none;"
  id="matreshka-splash"
></iframe>
```

3. Слушайте события через postMessage:

```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'MATRESHKA_COMPLETE') {
    const selectedRegion = event.data.regionId;
    // Скрыть iframe, показать основное приложение
  }
});
```

### Вариант 2: Export компонентов

1. Соберите модуль:
```bash
npm run build
```

2. Импортируйте собранные компоненты в основной проект

### Вариант 3: Копирование компонентов

Скопируйте папку `src/components` в основной проект и адаптируйте импорты.

## Структура проекта

```
react-splash-module/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # Главная страница с демо
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── MatreshkaSplashScreen.tsx    # Экран загрузки
│   │   ├── WelcomeMatreshkaModal.tsx    # Приветственное окно
│   │   ├── MatreshkaEntryFlow.tsx       # Оркестратор
│   │   └── WorldMap.tsx                  # Карта мира
│   ├── lib/
│   │   └── utils.ts          # Утилиты (cn)
│   ├── types/
│   │   └── index.ts          # TypeScript типы
│   └── data/
│       └── regions.ts        # Данные регионов
├── public/                    # Статические файлы
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Кастомизация

### Цвета

Измените цвета в `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      matreshka: {
        primary: '#6366f1',
        dark: '#0a0118',
        // ...
      }
    }
  }
}
```

### Время splash screen

В `MatreshkaSplashScreen.tsx`:

```typescript
const SPLASH_DURATION = 4000; // миллисекунды
```

## Лицензия

Часть проекта Matreshka Travel
