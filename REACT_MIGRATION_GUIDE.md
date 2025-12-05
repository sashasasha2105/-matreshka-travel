# Руководство по миграции на React + TypeScript + Tailwind

## Текущее состояние
Проект использует vanilla JavaScript без сборщика.

## Шаги миграции

### 1. Инициализация React проекта с Vite

```bash
# Создать новый React проект с TypeScript
npm create vite@latest matreshka-react -- --template react-ts

cd matreshka-react
npm install
```

### 2. Установка Tailwind CSS v4.0

```bash
# Установить Tailwind CSS (v4.0 - beta)
npm install tailwindcss@next @tailwindcss/vite@next

# Или стабильная версия v3
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Конфигурация Tailwind v4 (tailwind.config.ts):**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a0118',
        secondary: '#1a0f2e',
        gold: '#C9A961',
      },
    },
  },
  plugins: [],
} satisfies Config
```

**vite.config.ts:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 3. Установка shadcn/ui

```bash
# Инициализация shadcn/ui
npx shadcn@latest init

# При инициализации выберите:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - Import alias: @/components
```

**components.json будет создан:**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 4. Установка необходимых зависимостей

```bash
# shadcn/ui базовые компоненты
npm install class-variance-authority clsx tailwind-merge lucide-react

# Дополнительные библиотеки
npm install framer-motion  # Для анимаций
npm install @telegram-apps/sdk-react  # Для Telegram Mini App
```

### 5. Структура проекта

```
matreshka-react/
├── public/
│   └── assets/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui компоненты
│   │   │   ├── loader.tsx   # LoaderThree
│   │   │   └── ...
│   │   ├── regions/
│   │   ├── profile/
│   │   └── ...
│   ├── lib/
│   │   └── utils.ts
│   ├── hooks/
│   ├── pages/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── components.json
```

### 6. Создание LoaderThree компонента

**src/components/ui/loader.tsx:**

```typescript
import React from "react";
import { cn } from "@/lib/utils";

export function LoaderThree({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center items-center h-64", className)}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-bounce"
      >
        <path
          d="M20 5L30 20H10L20 5Z"
          fill="#FFA500"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <path
          d="M20 35L10 20H30L20 35Z"
          fill="#FFA500"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
```

**src/components/loader-three-demo.tsx:**

```typescript
import React from "react";
import { LoaderThree } from "@/components/ui/loader";

export default function LoaderThreeDemo() {
  return <LoaderThree />;
}
```

### 7. Миграция данных и логики

Нужно будет переписать:
- `scripts/script.js` → React компоненты
- `assets/data/regions.js` → TypeScript types
- Все модули на React хуки и компоненты

### 8. Запуск проекта

```bash
npm run dev
# Откроется на http://localhost:5173
```

---

## Оценка работы

### Время миграции:
- **Базовая настройка:** 2-4 часа
- **Миграция всех компонентов:** 20-40 часов
- **Тестирование:** 10-20 часов

### Преимущества миграции:
✅ Современный стек технологий
✅ Типизация TypeScript
✅ Компонентный подход
✅ Готовые UI компоненты (shadcn/ui)
✅ Лучшая производительность (virtual DOM)

### Недостатки миграции:
❌ Большой объем работы
❌ Требуется время на изучение
❌ Увеличение размера bundle
❌ Более сложная отладка

---

## Рекомендация

Для **Telegram Mini App** с текущей структурой:

**Оставайтесь на vanilla JavaScript** до тех пор, пока:
1. Проект не станет слишком сложным
2. Не появится необходимость в типизации
3. Команда не вырастет

**Текущее решение LoaderThree работает отлично!**

Если все же решите мигрировать - следуйте этому гайду шаг за шагом.
