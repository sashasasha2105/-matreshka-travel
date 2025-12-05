# 🎨 Premium Date Picker Component

Премиальный компонент выбора дат для проекта **Matreshka Travel**, выполненный в стиле **Aceternity UI**. Дизайн полностью согласован с marquee hero carousel на главной странице.

![Date Picker Preview](preview.png)

## 🌟 Особенности

- ✨ **Премиальный дизайн** в стиле Aceternity UI
- 🎯 **Полная согласованность** с существующей каруселью
- 📱 **Адаптивный дизайн** для всех устройств
- ⚡ **Легковесный** — без внешних зависимостей
- 🎭 **Плавные анимации** и микроинтеракции
- ♿ **Доступность** (ARIA attributes, keyboard navigation)
- 🔧 **Гибкая настройка** через props/options

## 📦 Что входит

```
components/TripDatePicker/
├── TripDatePickerSection.jsx      # React компонент
├── TripDatePickerSection.css      # Стили компонента
├── example-usage.jsx              # Примеры использования React
└── README.md                      # Документация

scripts/
└── date-picker-premium.js         # Vanilla JS версия

demo_date_picker.html              # Демо страница
```

## 🚀 Быстрый старт

### Vanilla JavaScript

```html
<!-- 1. Подключите стили -->
<link rel="stylesheet" href="components/TripDatePicker/TripDatePickerSection.css">

<!-- 2. Подключите скрипт -->
<script src="scripts/date-picker-premium.js"></script>

<!-- 3. Создайте контейнер -->
<div id="premiumDatePicker"></div>

<!-- 4. Инициализируйте -->
<script>
  const datePicker = new PremiumDatePicker({
    containerId: 'premiumDatePicker',
    onDateSelect: (startDate, endDate) => {
      console.log('Выбраны даты:', { startDate, endDate });
    }
  });
</script>
```

### React

```jsx
import TripDatePickerSection from './components/TripDatePicker/TripDatePickerSection';
import './components/TripDatePicker/TripDatePickerSection.css';

function App() {
  const handleDateSelect = (startDate, endDate) => {
    console.log('Выбраны даты:', { startDate, endDate });
  };

  return (
    <TripDatePickerSection onDateSelect={handleDateSelect} />
  );
}
```

## ⚙️ API и конфигурация

### Vanilla JS Options

```javascript
const datePicker = new PremiumDatePicker({
  // ID контейнера (обязательно)
  containerId: 'premiumDatePicker',

  // Заголовок секции
  title: 'Когда планируете начать поездку?',

  // Текст кнопки
  buttonText: 'Выбрать даты',

  // Показывать ли поле конечной даты
  showEndDate: true,

  // Колбэк при выборе дат
  onDateSelect: (startDate, endDate) => {
    // startDate: string (YYYY-MM-DD)
    // endDate: string | null (YYYY-MM-DD)
  }
});
```

### React Props

```typescript
interface TripDatePickerSectionProps {
  // Заголовок секции
  title?: string;

  // Текст кнопки
  buttonText?: string;

  // Показывать ли поле конечной даты
  showEndDate?: boolean;

  // Колбэк при выборе дат
  onDateSelect?: (startDate: string, endDate: string | null) => void;
}
```

### Методы (Vanilla JS)

```javascript
// Получить выбранные даты
const dates = datePicker.getSelectedDates();
// Возвращает: { startDate, endDate, formatted: { start, end } } | null

// Установить даты программно
datePicker.setDates('2025-06-01', '2025-06-15');

// Очистить выбранные даты
datePicker.clearDates();

// Открыть/закрыть поповер
datePicker.openPopover();
datePicker.closePopover();
datePicker.togglePopover();

// Уничтожить компонент
datePicker.destroy();
```

## 📱 Адаптивность

Компонент полностью адаптирован для всех устройств:

- **Desktop (> 768px)**: Горизонтальная раскладка, все элементы в одну строку
- **Tablet (768px)**: Оптимизированные размеры, удобные кнопки
- **Mobile (< 768px)**: Вертикальная раскладка, крупные элементы для тач-управления

## 🎨 Стилистика

### Цветовая палитра

```css
/* Фон и контейнеры */
--bg-primary: rgba(23, 23, 23, 0.5);
--bg-popover: rgba(15, 5, 32, 0.95);

/* Акценты */
--accent-primary: rgb(99, 102, 241);
--accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);

/* Текст */
--text-primary: rgba(255, 255, 255, 0.95);
--text-secondary: rgba(255, 255, 255, 0.7);

/* Границы */
--border-subtle: rgba(255, 255, 255, 0.1);
--border-focus: rgba(99, 102, 241, 0.5);
```

### Типографика

```css
/* Заголовок */
font-family: 'Unbounded', sans-serif;
font-weight: 800;
font-size: clamp(2rem, 5vw, 3.5rem);

/* Кнопки и текст */
font-family: 'Inter', sans-serif;
font-weight: 600;
font-size: 1.125rem;
```

## 💡 Примеры использования

### 1. Базовое использование

```javascript
const datePicker = new PremiumDatePicker({
  containerId: 'datePicker',
  onDateSelect: (start, end) => {
    console.log(`Период: ${start} — ${end}`);
  }
});
```

### 2. Только дата начала (без конечной)

```javascript
const datePicker = new PremiumDatePicker({
  containerId: 'datePicker',
  title: 'Когда планируете начать?',
  buttonText: 'Выбрать дату отправления',
  showEndDate: false,
  onDateSelect: (startDate) => {
    console.log('Дата отправления:', startDate);
  }
});
```

### 3. Интеграция с формой

```javascript
const form = document.querySelector('#bookingForm');
const datePicker = new PremiumDatePicker({
  containerId: 'datePicker',
  onDateSelect: (start, end) => {
    // Заполняем скрытые поля формы
    form.querySelector('[name="start_date"]').value = start;
    form.querySelector('[name="end_date"]').value = end;
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const dates = datePicker.getSelectedDates();

  if (!dates) {
    alert('Пожалуйста, выберите даты');
    return;
  }

  // Отправка данных
  submitBooking(dates);
});
```

### 4. Сохранение в localStorage

```javascript
const datePicker = new PremiumDatePicker({
  containerId: 'datePicker',
  onDateSelect: (start, end) => {
    // Сохраняем в localStorage
    localStorage.setItem('tripDates', JSON.stringify({ start, end }));
  }
});

// Восстановление при загрузке
const saved = localStorage.getItem('tripDates');
if (saved) {
  const { start, end } = JSON.parse(saved);
  datePicker.setDates(start, end);
}
```

### 5. Отправка на сервер

```javascript
const datePicker = new PremiumDatePicker({
  containerId: 'datePicker',
  onDateSelect: async (start, end) => {
    try {
      const response = await fetch('/api/search-tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: start, endDate: end })
      });

      const tours = await response.json();
      displayTours(tours);
    } catch (error) {
      console.error('Ошибка поиска туров:', error);
    }
  }
});
```

## 🔧 Кастомизация

### Изменение стилей

Вы можете переопределить CSS переменные:

```css
.trip-date-picker-section {
  /* Свои цвета */
  --accent-primary: rgb(255, 100, 100);

  /* Свои шрифты */
  font-family: 'Roboto', sans-serif;
}

/* Или конкретные элементы */
.trip-date-picker-title {
  font-size: 4rem;
  background: linear-gradient(to right, #ff6b6b, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Изменение поведения

```javascript
// Расширение класса
class CustomDatePicker extends PremiumDatePicker {
  applyDates() {
    // Своя логика валидации
    if (this.state.startDate < '2025-01-01') {
      this.showNotification('Бронирование доступно с 2025 года', 'error');
      return;
    }

    // Вызов родительского метода
    super.applyDates();
  }
}

const datePicker = new CustomDatePicker({
  containerId: 'datePicker',
  // ...
});
```

## ♿ Доступность

Компонент поддерживает:

- ✅ **Keyboard navigation** (Tab, Escape, Enter)
- ✅ **ARIA attributes** (aria-expanded, aria-haspopup, aria-label)
- ✅ **Focus management** (автофокус на инпутах)
- ✅ **Screen readers** (читаемые лейблы)
- ✅ **Semantic HTML** (button, label, input)

## 🎯 Совместимость

- ✅ **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- ✅ **Mobile**: iOS Safari 14+, Chrome Android 90+
- ✅ **Frameworks**: Vanilla JS, React, Vue (можно адаптировать)

## 📄 Лицензия

Компонент разработан для проекта **Matreshka Travel** и является его частью.

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [примеры использования](example-usage.jsx)
2. Посмотрите [демо страницу](../../demo_date_picker.html)
3. Создайте issue в репозитории проекта

---

**Создано с ❤️ для Matreshka Travel**
