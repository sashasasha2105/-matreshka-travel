/**
 * 🎨 TRIP DATE PICKER SECTION
 * Премиальный компонент выбора дат в стиле Aceternity UI
 * Дизайн согласован с marquee hero carousel
 */

import React, { useState, useRef, useEffect } from 'react';
import './TripDatePickerSection.css';

/**
 * Компонент секции выбора дат поездки
 *
 * @param {Object} props
 * @param {string} props.title - Заголовок секции (по умолчанию: "Когда планируете начать поездку?")
 * @param {string} props.buttonText - Текст кнопки (по умолчанию: "Выбрать даты")
 * @param {function} props.onDateSelect - Колбэк при выборе дат (startDate, endDate) => void
 * @param {boolean} props.showEndDate - Показывать ли поле конечной даты (по умолчанию: true)
 */
const TripDatePickerSection = ({
  title = "Когда планируете начать поездку?",
  buttonText = "Выбрать даты",
  onDateSelect,
  showEndDate = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDates, setSelectedDates] = useState(null);
  const pickerRef = useRef(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Форматирование даты для отображения
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Обработка сохранения дат
  const handleSaveDates = () => {
    if (!startDate) {
      alert('Пожалуйста, выберите дату начала поездки');
      return;
    }

    if (showEndDate && endDate && new Date(endDate) < new Date(startDate)) {
      alert('Дата окончания не может быть раньше даты начала');
      return;
    }

    const dates = {
      startDate,
      endDate: showEndDate ? endDate : null,
      formatted: {
        start: formatDate(startDate),
        end: showEndDate ? formatDate(endDate) : null
      }
    };

    setSelectedDates(dates);
    setIsOpen(false);

    // Вызываем колбэк
    if (onDateSelect) {
      onDateSelect(startDate, showEndDate ? endDate : null);
    }
  };

  // Текст для кнопки после выбора
  const getButtonDisplayText = () => {
    if (!selectedDates) return buttonText;

    if (showEndDate && selectedDates.endDate) {
      return `${selectedDates.formatted.start} → ${selectedDates.formatted.end}`;
    }

    return selectedDates.formatted.start;
  };

  return (
    <section className="trip-date-picker-section">
      <div className="trip-date-picker-container">
        {/* Заголовок */}
        <h2 className="trip-date-picker-title">
          {title}
        </h2>

        {/* Основная кнопка выбора дат */}
        <div className="trip-date-picker-wrapper" ref={pickerRef}>
          <button
            className={`trip-date-select-button ${selectedDates ? 'has-dates' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
          >
            <span className="button-icon">📅</span>
            <span className="button-text">{getButtonDisplayText()}</span>
            <span className={`button-chevron ${isOpen ? 'open' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          {/* Поповер с выбором дат */}
          {isOpen && (
            <div className="trip-date-picker-popover">
              <div className="popover-content">
                <div className="popover-header">
                  <h3 className="popover-title">Выберите даты поездки</h3>
                  <button
                    className="popover-close"
                    onClick={() => setIsOpen(false)}
                    aria-label="Закрыть"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                <div className="date-inputs-grid">
                  {/* Дата начала */}
                  <div className="date-input-group">
                    <label className="date-input-label" htmlFor="start-date">
                      Дата начала
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        id="start-date"
                        type="date"
                        className="date-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Дата окончания */}
                  {showEndDate && (
                    <>
                      <div className="date-separator-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="date-input-group">
                        <label className="date-input-label" htmlFor="end-date">
                          Дата окончания
                        </label>
                        <div className="date-input-wrapper">
                          <input
                            id="end-date"
                            type="date"
                            className="date-input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Кнопки действий */}
                <div className="popover-actions">
                  <button
                    className="action-button secondary"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setSelectedDates(null);
                    }}
                  >
                    Очистить
                  </button>
                  <button
                    className="action-button primary"
                    onClick={handleSaveDates}
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Подсказка */}
        {!selectedDates && (
          <p className="trip-date-picker-hint">
            Выберите удобные даты для вашего путешествия по России
          </p>
        )}
      </div>
    </section>
  );
};

export default TripDatePickerSection;
