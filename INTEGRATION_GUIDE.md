# 🚀 Руководство по интеграции Premium Date Picker

## Быстрая интеграция в index.html

### Шаг 1: Подключите CSS

Добавьте в `<head>` вашего `index.html`:

```html
<!-- Premium Date Picker Styles -->
<link rel="stylesheet" href="components/TripDatePicker/TripDatePickerSection.css">
```

### Шаг 2: Подключите JavaScript

Добавьте перед закрывающим `</body>`:

```html
<!-- Premium Date Picker Script -->
<script src="scripts/date-picker-premium.js"></script>
```

### Шаг 3: Замените существующий блок выбора дат

Найдите в `index.html` существующий блок с классом `.travel-date-picker` (строки 66-94) и замените на:

```html
<!-- Premium Date Picker -->
<div id="premiumDatePicker"></div>
```

### Шаг 4: Инициализируйте компонент

Добавьте скрипт инициализации (лучше в конце файла):

```html
<script>
// Инициализация Premium Date Picker
document.addEventListener('DOMContentLoaded', function() {
  const premiumDatePicker = new PremiumDatePicker({
    containerId: 'premiumDatePicker',
    title: 'Когда планируете начать поездку?',
    buttonText: 'Выбрать даты',
    showEndDate: true,
    onDateSelect: (startDate, endDate) => {
      console.log('✅ Выбраны даты:', { startDate, endDate });

      // Сохранение в localStorage (опционально)
      localStorage.setItem('matreshka_trip_dates', JSON.stringify({
        startDate,
        endDate,
        timestamp: Date.now()
      }));

      // Можно отправить на сервер
      saveTravelDates(startDate, endDate);
    }
  });

  // Восстановление из localStorage при загрузке
  const savedDates = localStorage.getItem('matreshka_trip_dates');
  if (savedDates) {
    try {
      const { startDate, endDate } = JSON.parse(savedDates);
      premiumDatePicker.setDates(startDate, endDate);
      console.log('📦 Восстановлены сохраненные даты');
    } catch (e) {
      console.warn('Ошибка восстановления дат:', e);
    }
  }

  // Делаем доступным глобально
  window.premiumDatePicker = premiumDatePicker;
});

// Функция для совместимости с существующим кодом
function saveTravelDates(startDate, endDate) {
  // Ваша существующая логика сохранения дат
  console.log('Сохранение дат:', { startDate, endDate });

  // Пример: отправка на сервер
  // fetch('/api/save-dates', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ startDate, endDate })
  // });
}
</script>
```

## Полный пример замены

### Было (старый код):

```html
<!-- Date Picker Section -->
<div class="hero-section" style="min-height: auto; background: transparent; border: none; margin-top: 2rem;">
    <div class="hero-overlay" style="background: transparent; padding: 2rem 1.5rem;">
        <div class="travel-date-picker">
            <div class="date-picker-header">
                <span class="date-icon">📅</span>
                <span class="date-label">Когда планируете поездку?</span>
            </div>
            <div class="date-inputs-row">
                <!-- ... старый код ... -->
            </div>
            <button class="date-save-btn" onclick="saveTravelDates()">
                <span class="btn-icon">✓</span>
                <span class="btn-text">Сохранить даты</span>
            </button>
        </div>
    </div>
</div>
```

### Стало (новый компонент):

```html
<!-- Premium Date Picker -->
<div id="premiumDatePicker"></div>
```

## Кастомизация под ваш проект

### Изменение заголовка и текстов

```javascript
const premiumDatePicker = new PremiumDatePicker({
  containerId: 'premiumDatePicker',
  title: 'Спланируйте своё путешествие',
  buttonText: 'Когда поедем?',
  // ...
});
```

### Только дата начала (без конечной)

```javascript
const premiumDatePicker = new PremiumDatePicker({
  containerId: 'premiumDatePicker',
  showEndDate: false,
  // ...
});
```

### Интеграция с существующими функциями

```javascript
const premiumDatePicker = new PremiumDatePicker({
  containerId: 'premiumDatePicker',
  onDateSelect: (startDate, endDate) => {
    // Вызов существующей функции
    if (typeof saveTravelDates === 'function') {
      saveTravelDates(startDate, endDate);
    }

    // Обновление элементов интерфейса
    updateTravelDatesDisplay(startDate, endDate);

    // Триггер события для других компонентов
    document.dispatchEvent(new CustomEvent('datesSelected', {
      detail: { startDate, endDate }
    }));
  }
});
```

## Проверка работы

1. Откройте `demo_date_picker.html` в браузере
2. Протестируйте все функции:
   - Клик на кнопку "Выбрать даты"
   - Выбор дат в календаре
   - Кнопки "Очистить" и "Применить"
   - Закрытие по клику вне
   - Закрытие по Escape
3. Откройте консоль браузера и проверьте логи
4. Проверьте на мобильных устройствах

## Совместимость с существующим кодом

Если у вас уже есть функция `saveTravelDates()`, она продолжит работать:

```javascript
// Ваша существующая функция
function saveTravelDates() {
  const startDate = document.getElementById('travelStartDate')?.value;
  const endDate = document.getElementById('travelEndDate')?.value;
  // ... существующая логика
}

// Новая интеграция
const premiumDatePicker = new PremiumDatePicker({
  containerId: 'premiumDatePicker',
  onDateSelect: (startDate, endDate) => {
    // Вызываем существующую логику
    saveTravelDates();

    // Или адаптируем:
    // saveTravelDatesNew(startDate, endDate);
  }
});
```

## Устранение проблем

### Компонент не отображается

1. Проверьте, что подключены CSS и JS:
   ```html
   <link rel="stylesheet" href="components/TripDatePicker/TripDatePickerSection.css">
   <script src="scripts/date-picker-premium.js"></script>
   ```

2. Проверьте, что контейнер существует:
   ```html
   <div id="premiumDatePicker"></div>
   ```

3. Проверьте консоль браузера на ошибки

### Стили конфликтуют

Если возникают конфликты стилей, добавьте префикс:

```css
/* В вашем CSS файле */
.trip-date-picker-section {
  /* Ваши переопределения */
}
```

### Шрифты не загружаются

Убедитесь, что подключены Unbounded и Inter:

```html
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

## Дополнительные возможности

### Программное управление

```javascript
// Получить выбранные даты
const dates = premiumDatePicker.getSelectedDates();

// Установить даты
premiumDatePicker.setDates('2025-06-01', '2025-06-15');

// Очистить даты
premiumDatePicker.clearDates();

// Открыть/закрыть поповер
premiumDatePicker.openPopover();
premiumDatePicker.closePopover();
```

### События

```javascript
// Слушаем событие выбора дат
document.addEventListener('datesSelected', (e) => {
  const { startDate, endDate } = e.detail;
  console.log('Даты выбраны:', startDate, endDate);
});
```

## Готовые примеры

Посмотрите готовые примеры использования:

- `demo_date_picker.html` — демо страница
- `components/TripDatePicker/example-usage.jsx` — примеры для React
- `components/TripDatePicker/README.md` — полная документация

---

**Готово! 🎉**

Теперь у вас есть премиальный компонент выбора дат, идеально интегрированный в дизайн вашего проекта.
