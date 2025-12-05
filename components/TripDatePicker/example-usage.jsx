/**
 * 📖 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ TripDatePickerSection
 */

import React from 'react';
import TripDatePickerSection from './TripDatePickerSection';

// ========================================
// ПРИМЕР 1: Базовое использование
// ========================================
function BasicExample() {
  const handleDateSelect = (startDate, endDate) => {
    console.log('Выбраны даты:', { startDate, endDate });
    // Здесь можно отправить данные на сервер, сохранить в state и т.д.
  };

  return (
    <TripDatePickerSection
      onDateSelect={handleDateSelect}
    />
  );
}

// ========================================
// ПРИМЕР 2: Кастомизация текстов
// ========================================
function CustomTextExample() {
  return (
    <TripDatePickerSection
      title="Выберите период вашего путешествия"
      buttonText="Указать даты"
      onDateSelect={(start, end) => {
        alert(`Вы выбрали: ${start} - ${end}`);
      }}
    />
  );
}

// ========================================
// ПРИМЕР 3: Только дата начала (без конечной даты)
// ========================================
function SingleDateExample() {
  return (
    <TripDatePickerSection
      title="Когда планируете начать?"
      buttonText="Выбрать дату отправления"
      showEndDate={false}
      onDateSelect={(startDate) => {
        console.log('Дата отправления:', startDate);
      }}
    />
  );
}

// ========================================
// ПРИМЕР 4: Интеграция с формой
// ========================================
function FormIntegrationExample() {
  const [formData, setFormData] = React.useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1
  });

  const handleDateSelect = (startDate, endDate) => {
    setFormData(prev => ({
      ...prev,
      startDate,
      endDate
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Отправка формы:', formData);
    // Отправка на сервер
  };

  return (
    <form onSubmit={handleSubmit}>
      <TripDatePickerSection
        onDateSelect={handleDateSelect}
      />

      <input
        type="text"
        placeholder="Куда едем?"
        value={formData.destination}
        onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
      />

      <button type="submit">Найти туры</button>
    </form>
  );
}

// ========================================
// ПРИМЕР 5: С сохранением в localStorage
// ========================================
function PersistentExample() {
  const handleDateSelect = (startDate, endDate) => {
    const dates = { startDate, endDate };

    // Сохраняем в localStorage
    localStorage.setItem('tripDates', JSON.stringify(dates));

    console.log('Даты сохранены в localStorage');
  };

  // Можно загрузить при монтировании
  React.useEffect(() => {
    const saved = localStorage.getItem('tripDates');
    if (saved) {
      const dates = JSON.parse(saved);
      console.log('Загружены сохраненные даты:', dates);
    }
  }, []);

  return (
    <TripDatePickerSection
      onDateSelect={handleDateSelect}
    />
  );
}

// ========================================
// ПОЛНЫЙ ПРИМЕР: Интеграция в лендинг
// ========================================
function LandingPageExample() {
  const [selectedDates, setSelectedDates] = React.useState(null);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleDateSelect = async (startDate, endDate) => {
    setSelectedDates({ startDate, endDate });

    // Можно сразу начать поиск туров
    setIsSearching(true);

    try {
      const response = await fetch('/api/search-tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
      });

      const tours = await response.json();
      console.log('Найдены туры:', tours);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Marquee Hero Carousel */}
      <section className="marquee-hero-section">
        {/* ... */}
      </section>

      {/* Trip Date Picker */}
      <TripDatePickerSection
        title="Когда планируете начать поездку?"
        buttonText="Выбрать даты"
        onDateSelect={handleDateSelect}
      />

      {/* Результаты поиска */}
      {isSearching && <div>Поиск туров...</div>}

      {selectedDates && (
        <div className="selected-info">
          <p>Выбранный период: {selectedDates.startDate} - {selectedDates.endDate}</p>
        </div>
      )}

      {/* Остальной контент */}
    </div>
  );
}

export {
  BasicExample,
  CustomTextExample,
  SingleDateExample,
  FormIntegrationExample,
  PersistentExample,
  LandingPageExample
};
