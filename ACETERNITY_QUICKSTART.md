# ⚡ Aceternity UI - Quick Start

## Быстрая интеграция компонентов из Aceternity UI

---

## 🎯 В чем суть?

Ты можешь брать **любые компоненты** с https://ui.aceternity.com/ и использовать их в своем Vanilla JS проекте **без React**.

Мы создали инфраструктуру, которая **автоматически** конвертирует React-компоненты в обычный JavaScript.

---

## 📦 Что уже готово?

### ✅ Инфраструктура

```
scripts/utils/
├── animations.js          # 🎬 Аналог Framer Motion
└── aceternity-adapter.js  # 🔄 Адаптер для конвертации
```

### ✅ Примеры компонентов

```
components/aceternity/
├── _template.js           # 📝 Шаблон для новых компонентов
├── moving-border-button.js # ✨ Кнопка с анимацией
└── card-3d.js             # 🎴 3D карточка
```

### ✅ Документация

- `ACETERNITY_INTEGRATION_GUIDE.md` - Полное руководство (30+ страниц)
- `ACETERNITY_QUICKSTART.md` - Этот файл
- `ACETERNITY_SEARCH_GUIDE.md` - Гайд по компоненту поиска

### ✅ Демо

- `demo_aceternity_search.html` - Демо поиска
- `demo_aceternity_components.html` - Демо всех компонентов

---

## 🚀 Как добавить новый компонент?

### 3 простых шага:

### 1️⃣ Найди компонент на Aceternity UI

Зайди на https://ui.aceternity.com/ и выбери нужный компонент.

Например: https://ui.aceternity.com/components/bento-grid

### 2️⃣ Скопируй шаблон

```bash
cp components/aceternity/_template.js components/aceternity/bento-grid.js
```

### 3️⃣ Адаптируй код

Открой `bento-grid.js` и следуй комментариям в шаблоне.

**Пример:** React код от Aceternity:

```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  className="bg-white rounded-lg p-4"
>
  <h3>Title</h3>
</motion.div>
```

**Становится:**

```javascript
const div = this.createElement('div', {
    className: 'bg-white rounded-lg p-4'
});

const h3 = this.createElement('h3');
h3.textContent = 'Title';
div.appendChild(h3);

motion(div).whileHover({ scale: 1.05 });
```

---

## 💡 Шпаргалка по конвертации

### React → Vanilla JS

| React | Наш код |
|-------|---------|
| `<motion.div>` | `motion(createElement('div'))` |
| `useState()` | `this.setState()` |
| `onClick={handler}` | `events: { click: handler }` |
| `className={cn(...)}` | `className: cn(...)` |
| `{text}` | `element.textContent = text` |

### Анимации

```javascript
// Framer Motion (React)
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  whileHover={{ scale: 1.05 }}
/>

// Наш адаптер (Vanilla JS)
motion(div).animate({
    from: { opacity: 0 },
    to: { opacity: 1 }
});
motion(div).whileHover({ scale: 1.05 });
```

---

## 🎨 Готовые утилиты

### Animations (scripts/utils/animations.js)

```javascript
// Fade in
motion('#element').animate(MotionPresets.fadeIn);

// Slide from bottom
motion('#element').animate(MotionPresets.slideInBottom);

// Stagger (последовательная анимация)
staggerAnimate(elements, MotionPresets.fadeIn, {
    staggerDelay: 0.1
});

// On scroll
animateOnScroll('#element', MotionPresets.slideInLeft);
```

### Adapter (scripts/utils/aceternity-adapter.js)

```javascript
// cn() - объединение классов
const classes = cn(
    'base',
    isActive && 'active',
    { 'disabled': isDisabled }
);

// Создание элементов
const button = TemplateHelpers.createButton('Text', {
    variant: 'primary',
    onClick: handler
});

const card = TemplateHelpers.createCard('Content', {
    hover: true
});
```

---

## 📝 Пример: Добавляем новый компонент

### Допустим, хочешь добавить "Spotlight Card"

#### Шаг 1: Создай файл

`components/aceternity/spotlight-card.js`

```javascript
class SpotlightCard extends AceternityComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);

        this.options = {
            title: options.title || 'Card',
            description: options.description || '',
            spotlightColor: options.spotlightColor || '#3b82f6',
            ...options
        };

        this.mount();
    }

    render() {
        const card = this.createElement('div', {
            className: cn(
                'relative overflow-hidden',
                'bg-gray-900 rounded-xl p-6',
                'transition-transform hover:scale-105'
            )
        });

        // Spotlight эффект
        const spotlight = this.createElement('div', {
            className: 'absolute inset-0 opacity-0 transition-opacity',
            style: {
                background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), ${this.options.spotlightColor}, transparent 40%)`
            }
        });

        // Обработчик мыши
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            spotlight.style.opacity = '0.5';
        });

        card.addEventListener('mouseleave', () => {
            spotlight.style.opacity = '0';
        });

        // Контент
        const title = this.createElement('h3', {
            className: 'text-xl font-bold text-white mb-2'
        });
        title.textContent = this.options.title;

        const desc = this.createElement('p', {
            className: 'text-gray-400'
        });
        desc.textContent = this.options.description;

        card.appendChild(spotlight);
        card.appendChild(title);
        card.appendChild(desc);

        return card;
    }
}

window.SpotlightCard = SpotlightCard;
```

#### Шаг 2: Подключи в HTML

```html
<script src="components/aceternity/spotlight-card.js" defer></script>
```

#### Шаг 3: Используй

```html
<div id="myCard"></div>

<script>
new SpotlightCard('myCard', {
    title: 'Байкал',
    description: 'Самое глубокое озеро',
    spotlightColor: '#3b82f6'
});
</script>
```

---

## 🎯 Популярные компоненты для адаптации

Рекомендую начать с этих:

1. **Bento Grid** - https://ui.aceternity.com/components/bento-grid
2. **Card Hover Effect** - https://ui.aceternity.com/components/card-hover-effect
3. **Sparkles** - https://ui.aceternity.com/components/sparkles
4. **Text Generate Effect** - https://ui.aceternity.com/components/text-generate-effect
5. **Hero Parallax** - https://ui.aceternity.com/components/hero-parallax

---

## 🔥 Pro Tips

### 1. Используй шаблон

Всегда начинай с `_template.js` - там уже есть вся структура.

### 2. Тестируй на демо-странице

Создай свою версию `demo_aceternity_components.html` для тестирования.

### 3. Изучи существующие примеры

Смотри как реализованы:
- `components/aceternity/moving-border-button.js`
- `components/aceternity/card-3d.js`
- `scripts/aceternity-search.js`

### 4. Используй готовые утилиты

Не пиши анимации с нуля - используй `MotionPresets` и `motion()`.

### 5. Документируй

Добавляй комментарии и ссылку на оригинальный компонент Aceternity.

---

## 📚 Дополнительные ресурсы

- **Полный гайд:** `ACETERNITY_INTEGRATION_GUIDE.md`
- **Примеры:** `demo_aceternity_components.html`
- **Aceternity UI:** https://ui.aceternity.com/
- **Tailwind CSS:** https://tailwindcss.com/

---

## ❓ FAQ

### Q: Нужен ли React?
**A:** Нет! Мы адаптируем компоненты под Vanilla JS.

### Q: Работают ли все анимации?
**A:** Да, мы создали аналог Framer Motion на чистом JS.

### Q: Можно ли использовать TypeScript?
**A:** Да, просто добавь типы к классам и методам.

### Q: Как добавить Tailwind?
**A:** Он уже подключен через CDN в демо-файлах.

### Q: Где смотреть примеры?
**A:** Открой `demo_aceternity_components.html` в браузере.

---

## 🎉 Готово!

Теперь ты можешь быстро добавлять компоненты из Aceternity UI в свой проект!

**Попробуй прямо сейчас:**

1. Открой `demo_aceternity_components.html`
2. Выбери компонент на https://ui.aceternity.com/
3. Адаптируй по шаблону
4. Profit! 🚀

---

Made with ❤️ for Матрешка Travel App
