# 📱 ОТЧЕТ О МОБИЛЬНЫХ БАГАХ - MATRESHKA TRAVEL

**Дата анализа:** 2025-10-31
**Проанализировано:** 17 CSS файлов, 1 HTML файл, структура проекта
**Статус:** Глубокий статический анализ кода

---

## ⚠️ КРИТИЧЕСКИЕ БАГИ (Требуют немедленного исправления)

### БАГ #1: Хаотичные z-index значения
**Серьезность:** 🔴 КРИТИЧНО
**Файлы:** Все CSS файлы

**Проблема:**
```
z-index: -1       (4 места)
z-index: 1        (7 мест)
z-index: 10       (4 места)
z-index: 100      (6 мест)
z-index: 1000     (10 мест)
z-index: 2000     (2 места)
z-index: 3000     (1 место)
z-index: 9000     (1 место)
z-index: 10000    (10 мест)
z-index: 10001    (2 места)
z-index: 11000    (1 место) ← САМЫЙ ВЫСОКИЙ!
```

**Последствия на мобильных:**
- Модальные окна перекрываются navigation
- QR-коды показываются под другими элементами
- Toast уведомления невидимы
- Profile модалки конфликтуют с bottom-nav

**Решение:**
Создать единую z-index шкалу:
```css
:root {
    --z-base: 1;
    --z-dropdown: 100;
    --z-sticky: 200;
    --z-fixed-nav: 1000;
    --z-overlay: 2000;
    --z-modal: 3000;
    --z-toast: 4000;
    --z-tooltip: 5000;
}
```

**Где исправить:**
- `visual-fixes.css:451-459`
- `style.css:995, 1985, 2264, 2467, 2828, 3324`
- `qr/qr.css:12`
- `profile/profile.css:958`
- `feed-redesign.css:299`

---

### БАГ #2: 100vh не работает на iOS Safari
**Серьезность:** 🔴 КРИТИЧНО
**Файлы:** `mobile-hero-simple-fix.css`, `profile-fix.css`, `style.css`

**Проблема:**
```css
/* В 14 местах используется 100vh */
.hero-section {
    height: 100vh; /* iOS Safari не учитывает адресную строку! */
}
```

**Последствия:**
- Hero секция обрезается на iPhone
- Bottom navigation перекрывает контент
- Прокрутка работает неправильно
- Content "прыгает" при показе/скрытии адресной строки

**Решение:**
```css
/* Вместо 100vh использовать: */
.hero-section {
    min-height: 100vh;
    min-height: -webkit-fill-available;
    min-height: 100dvh; /* Dynamic viewport height */
}

/* Или JavaScript fallback */
document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
```

**Где исправить:**
- `mobile-hero-simple-fix.css:10, 134-136`
- `profile-fix.css:9`
- `style.css:76`
- `profile/profile.css:2082-2083`

---

### БАГ #3: Горизонтальная прокрутка (horizontal scroll)
**Серьезность:** 🔴 КРИТИЧНО
**Файлы:** Глобальная проблема

**Проблема:**
```css
/* В mobile-enhancements.css есть попытка исправить: */
html, body {
    overflow-x: hidden; /* Но это НЕ работает если дети шире viewport! */
    max-width: 100vw;
}
```

**Последствия:**
- Страница прокручивается по горизонтали
- Белая полоса справа
- Layout "ломается" на маленьких экранах
- Невозможно нормально прокручивать по вертикали

**Причины:**
1. Элементы с `width: 100vw` НЕ учитывают scrollbar (на Android)
2. Абсолютно позиционированные элементы вылазят за viewport
3. `.container` имеет padding, но дети имеют 100% width
4. Flexbox и grid могут выходить за границы

**Решение:**
```css
* {
    max-width: 100%;
}

.container, .hero-section, .regions-grid {
    box-sizing: border-box;
    max-width: 100%;
    overflow-x: clip; /* Современный overflow */
}

/* Убрать все 100vw */
```

**Где искать проблему:**
- Любые элементы с `width: 100vw`
- Absolute positioned элементы без `right: 0`
- Images без `max-width: 100%`

---

### БАГ #4: 17 CSS файлов загружаются последовательно
**Серьезность:** 🟠 ВЫСОКИЙ
**Файл:** `index.html:22-59`

**Проблема:**
```html
<!-- 17 отдельных CSS файлов! -->
<link rel="stylesheet" href="style.css?v=3.0">
<link rel="stylesheet" href="profile/profile.css?v=3.0">
<link rel="stylesheet" href="profile/modern-modal.css?v=3.0">
<!-- ... еще 14 файлов ... -->
```

**Последствия на мобильных:**
- Медленная загрузка (3G/4G)
- 17 отдельных HTTP requests
- FOUC (Flash of Unstyled Content)
- Блокирующий рендеринг
- Высокий LCP (Largest Contentful Paint)

**Решение:**
```bash
# Concatenate CSS
cat style.css responsive.css mobile-enhancements.css > bundle.min.css

# Minify
cssnano bundle.min.css

# Результат: 1 файл вместо 17
```

**Где исправить:**
- `index.html:22-59`
- Настроить build process

---

### БАГ #5: position: fixed без учета safe-area
**Серьезность:** 🟠 ВЫСОКИЙ
**Файлы:** 16 мест с `position: fixed`

**Проблема:**
```css
.bottom-nav {
    position: fixed;
    bottom: 0; /* На iPhone X+ перекрывается home indicator! */
}
```

**Последствия на iPhone X+:**
- Bottom navigation перекрыта home indicator
- Кнопки внизу нельзя нажать
- Модальные окна обрезаются notch'ем
- Fixed header скрывается за status bar

**Решение:**
```css
.bottom-nav {
    position: fixed;
    bottom: env(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}

/* Или */
.bottom-nav {
    position: fixed;
    bottom: max(0px, env(safe-area-inset-bottom));
}
```

**Где исправить:**
- `responsive.css:342` - `.bottom-nav`
- `style.css:985, 1978, 2254, 2462, 2823, 3313`
- `qr/qr.css:7`
- `quests/quests.css:263, 458`
- `profile/profile.css:949`
- `maps/maps2gis_new.css:643`

---

### БАГ #6: Маленькие touch targets (< 44px)
**Серьезность:** 🟠 ВЫСОКИЙ
**Файлы:** Множество кнопок

**Проблема:**
```css
.nav-label {
    font-size: 0.65rem; /* Слишком мелкий текст */
}

.quests-badge {
    padding: 2px 5px; /* Слишком маленькая область касания */
}
```

**Последствия:**
- Невозможно попасть по кнопкам
- Плохой UX на телефонах
- Провал accessibility тестов
- Не соответствует Apple HIG и Material Design

**Apple/Google требования:**
- Минимум 44x44 px (iOS)
- Минимум 48x48 px (Android)

**Где проблема:**
- `.nav-label` - 0.65rem слишком мелко
- `.quests-badge` - padding 2px 5px
- `.cart-badge` - min-width 16px
- `.region-stats` - font-size 0.7rem на mobile
- Все иконки меньше 44px

**Решение:**
```css
@media (hover: none) and (pointer: coarse) {
    button, .nav-item, .clickable {
        min-height: 44px;
        min-width: 44px;
        padding: 12px; /* Увеличить padding */
    }
}
```

---

## 🟡 СЕРЬЕЗНЫЕ БАГИ (Влияют на UX)

### БАГ #7: Conflicting overflow properties
**Серьезность:** 🟡 СРЕДНИЙ
**Файлы:** 50+ мест с `overflow: hidden`

**Проблема:**
```css
/* responsive.css:724 */
.profile-section {
    overflow: visible; /* ??? */
}

/* Но в другом файле: */
.profile-section {
    overflow: hidden; /* Конфликт! */
}
```

**Последствия:**
- Dropdown меню обрезаются
- Tooltips невидимы
- Shadows обрезаются
- Modals не показываются полностью

**Где искать:**
- `responsive.css:722-727`
- `style.css` - 16 мест
- `profile/profile.css` - 10 мест

---

### БАГ #8: Нет debounce для scroll events
**Серьезность:** 🟡 СРЕДНИЙ
**Файлы:** `modern-interactions.js`, JavaScript код

**Проблема:**
Scroll events обрабатываются на каждый кадр без debounce/throttle

**Последствия:**
- Лагает прокрутка на слабых телефонах
- Высокий CPU usage
- Разряжается батарея
- Плохой FPS

**Решение:**
```javascript
const throttledScroll = throttle(() => {
    // scroll handler
}, 100);

window.addEventListener('scroll', throttledScroll, { passive: true });
```

---

### БАГ #9: Images без lazy loading
**Серьезность:** 🟡 СРЕДНИЙ
**Файлы:** Везде где `<img>`

**Проблема:**
Все изображения загружаются сразу, даже те что внизу страницы

**Последствия на 3G/4G:**
- Медленная первоначальная загрузка
- Высокий data usage
- Блокирует критический контент
- Плохой LCP score

**Решение:**
```html
<!-- Добавить loading="lazy" -->
<img src="region.jpg" loading="lazy" alt="Region">
```

**Где исправить:**
- Все `<img>` теги без `loading="lazy"`
- Background images загружать через Intersection Observer

---

### БАГ #10: Animations на слабых устройствах
**Серьезность:** 🟡 СРЕДНИЙ
**Файлы:** `modern-effects.css`, `enhancements.css`

**Проблема:**
```css
.hero-title {
    background-size: 300% 300%;
    animation: gradientShift 6s ease-in-out infinite;
}
```

**Последствия:**
- Лагает на бюджетных Android
- Разряжается батарея
- Низкий FPS при прокрутке
- Перегрев устройства

**Решение:**
```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}

/* Или отключить тяжелые анимации на mobile */
@media (max-width: 768px) and (hover: none) {
    .hero-title {
        animation: none;
        background: linear-gradient(135deg, #fff, #ffcc00);
    }
}
```

---

### БАГ #11: Нет offline fallback
**Серьезность:** 🟡 СРЕДНИЙ
**Файлы:** Отсутствие Service Worker

**Проблема:**
При потере соединения приложение полностью ломается

**Последствия:**
- Белый экран при потере 3G/4G
- Нет кэширования
- Плохой UX в метро/лифте
- Невозможно посмотреть купленные пакеты offline

**Решение:**
```javascript
// service-worker.js
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('matreshka-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/style.css',
                '/script.js',
                '/offline.html'
            ]);
        })
    );
});
```

---

### БАГ #12: Font sizes меньше 16px на inputs
**Серьезность:** 🟡 СРЕДНИЙ
**Файлы:** `style.css`, form elements

**Проблема:**
```css
.search-input {
    font-size: 14px; /* < 16px вызывает zoom на iOS! */
}
```

**Последствия на iOS:**
- Автоматический zoom при focus на input
- Страница "прыгает"
- Плохой UX
- Пользователь должен вручную zoom out

**Решение:**
```css
input, textarea, select {
    font-size: 16px !important; /* Минимум для iOS */
}
```

**Где исправить:**
- Все inputs с `font-size < 16px`
- `.search-input`
- `.date-input`
- Form fields

---

## 🟢 МЕЛКИЕ БАГИ (Косметические)

### БАГ #13: user-select: none на всем body
**Серьезность:** 🟢 НИЗКИЙ
**Файлы:** `mobile-enhancements.css:416-420`

**Проблема:**
```css
* {
    -webkit-user-select: none;
    user-select: none; /* Нельзя выделить НИЧЕГО! */
}
```

**Последствия:**
- Нельзя скопировать текст
- Нельзя выделить адрес
- Плохой accessibility
- Раздражает пользователей

**Решение:**
```css
/* Разрешаем выделение текста */
p, span, a, li, h1, h2, h3, h4, h5, h6 {
    -webkit-user-select: text;
    user-select: text;
}
```

---

### БАГ #14: Слишком много will-change
**Серьезность:** 🟢 НИЗКИЙ
**Файлы:** `mobile-enhancements.css:317-331`

**Проблема:**
```css
.region-card, .nav-item, .modal-content, .hero-section {
    will-change: transform; /* Постоянно! */
}
```

**Последствия:**
- Высокое потребление памяти
- Слой отрисовки создается заранее
- Может замедлить устройство
- MDN рекомендует использовать спарсели

**Решение:**
```css
/* Добавлять will-change только перед анимацией */
.region-card:hover {
    will-change: transform;
}

.region-card {
    will-change: auto; /* По умолчанию */
}
```

---

### БАГ #15: -webkit-tap-highlight-color: transparent везде
**Серьезность:** 🟢 НИЗКИЙ
**Файлы:** `mobile-enhancements.css:156`

**Проблема:**
```css
a, button, .nav-item, .region-card {
    -webkit-tap-highlight-color: transparent;
}
```

**Последствия:**
- Нет визуальной обратной связи при tap
- Пользователь не знает что нажал
- Плохой UX для новичков

**Решение:**
```css
/* Оставить легкую подсветку */
a, button {
    -webkit-tap-highlight-color: rgba(255, 204, 0, 0.1);
}

/* Добавить :active state */
button:active {
    background: rgba(255, 204, 0, 0.2);
}
```

---

### БАГ #16: Landscape orientation не оптимизирована
**Серьезность:** 🟢 НИЗКИЙ
**Файлы:** `mobile-enhancements.css:338-364`

**Проблема:**
Только частичная поддержка landscape mode

**Последствия:**
- Hero section слишком высокий в landscape
- Bottom nav занимает много места по высоте
- Content обрезается

**Решение:**
```css
@media (max-height: 500px) and (orientation: landscape) {
    .hero-section {
        height: 80vh; /* Меньше */
    }

    .bottom-nav {
        height: 50px; /* Компактнее */
    }

    .nav-label {
        display: none; /* Только иконки */
    }
}
```

---

### БАГ #17: Нет preconnect для external resources
**Серьезность:** 🟢 НИЗКИЙ
**Файлы:** `index.html:11-15`

**Проблема:**
```html
<!-- Только dns-prefetch, нет preconnect -->
<link rel="dns-prefetch" href="//telegram.org">
```

**Последствия:**
- Медленная загрузка внешних ресурсов
- DNS + TCP + TLS handshake при каждом запросе

**Решение:**
```html
<!-- Добавить preconnect -->
<link rel="preconnect" href="https://telegram.org" crossorigin>
<link rel="preconnect" href="https://mapgl.2gis.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
```

---

### БАГ #18: backdrop-filter без fallback
**Серьезность:** 🟢 НИЗКИЙ
**Файлы:** `responsive.css:351`, другие

**Проблема:**
```css
.bottom-nav {
    backdrop-filter: blur(20px); /* Не работает на старых Android! */
}
```

**Последствия:**
- Прозрачный background на старых устройствах
- Нечитаемый текст
- Плохой контраст

**Решение:**
```css
.bottom-nav {
    background: rgba(15, 5, 32, 0.95); /* Fallback */
}

@supports (backdrop-filter: blur(20px)) {
    .bottom-nav {
        background: rgba(15, 5, 32, 0.8);
        backdrop-filter: blur(20px);
    }
}
```

---

## 📊 СТАТИСТИКА

### Найдено проблем
- **Критических:** 6
- **Серьезных:** 6
- **Мелких:** 6
- **Итого:** 18 багов

### По категориям
- **Layout/Positioning:** 6 багов
- **Performance:** 5 багов
- **Accessibility:** 4 бага
- **iOS Specific:** 3 бага
- **CSS Architecture:** 3 бага

### По файлам с наибольшим числом проблем
1. `style.css` - 8 проблем
2. `mobile-enhancements.css` - 6 проблем
3. `responsive.css` - 4 проблемы
4. `index.html` - 3 проблемы
5. Остальные - по 1-2 проблемы

---

## 🎯 ПРИОРИТЕТЫ ИСПРАВЛЕНИЯ

### Неделя 1 (Критичные)
1. ✅ Исправить z-index хаос
2. ✅ Заменить 100vh на safe alternatives
3. ✅ Убрать horizontal scroll
4. ✅ Добавить safe-area-inset для iPhone X+

### Неделя 2 (Высокий приоритет)
5. ✅ Увеличить touch targets до 44px
6. ✅ Concatenate CSS files
7. ✅ Добавить lazy loading для images
8. ✅ Исправить overflow conflicts

### Неделя 3 (Средний приоритет)
9. Оптимизировать animations
10. Добавить Service Worker
11. Исправить font sizes в inputs
12. Debounce scroll events

### Неделя 4 (Низкий приоритет)
13. Улучшить tap feedback
14. Оптимизировать will-change
15. Улучшить landscape support
16. Добавить preconnect

---

## 🛠️ ИНСТРУМЕНТЫ ДЛЯ ТЕСТИРОВАНИЯ

### Необходимо протестировать на:
- ✅ iPhone SE (маленький экран)
- ✅ iPhone 12/13/14 (notch)
- ✅ iPhone 14 Pro Max (Dynamic Island)
- ✅ Samsung Galaxy S21 (Android)
- ✅ Google Pixel 6 (чистый Android)
- ✅ Бюджетный Android (слабое железо)

### Инструменты
- Chrome DevTools Mobile Emulation
- Safari iOS Simulator
- BrowserStack / LambdaTest
- Lighthouse Mobile Audit
- WebPageTest (3G/4G тест)

---

## 📝 ЗАМЕТКИ

1. **Telegram WebApp особенности:**
   - Safe area уже частично реализован
   - Viewport-fit=cover присутствует
   - Theme color правильный

2. **Хорошие практики уже есть:**
   - Preload для критичных ресурсов
   - Meta tags правильно настроены
   - Dark mode через color-scheme

3. **Нужно добавить:**
   - Build process для CSS
   - Service Worker
   - Image optimization
   - Bundle size reduction

---

**Автор:** Claude Code
**Дата:** 2025-10-31
**Версия:** 1.0 (Static Analysis)
