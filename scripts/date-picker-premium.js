/**
 * 🎨 PREMIUM DATE PICKER - Vanilla JS версия
 * Премиальный компонент выбора дат в стиле Aceternity UI
 * Без зависимостей, чистый JavaScript
 */

class PremiumDatePicker {
  constructor(options = {}) {
    this.options = {
      containerId: options.containerId || 'premiumDatePicker',
      title: options.title || 'Когда планируете начать поездку?',
      buttonText: options.buttonText || 'Выбрать даты',
      showEndDate: options.showEndDate !== false,
      onDateSelect: options.onDateSelect || null,
      ...options
    };

    this.state = {
      isOpen: false,
      startDate: '',
      endDate: '',
      selectedDates: null
    };

    this.container = null;
    this.init();
  }

  /**
   * Инициализация компонента
   */
  init() {
    const container = document.getElementById(this.options.containerId);
    if (!container) {
      console.error(`Контейнер #${this.options.containerId} не найден`);
      return;
    }

    this.container = container;
    this.render();
    this.attachEventListeners();
  }

  /**
   * Рендер компонента
   */
  render() {
    const html = `
      <section class="trip-date-picker-section">
        <div class="trip-date-picker-container">
          <!-- Заголовок -->
          <h2 class="trip-date-picker-title">
            ${this.options.title}
          </h2>

          <!-- Основная кнопка -->
          <div class="trip-date-picker-wrapper">
            <button
              class="trip-date-select-button ${this.state.selectedDates ? 'has-dates' : ''}"
              id="dateSelectButton"
              aria-expanded="${this.state.isOpen}"
              aria-haspopup="dialog"
            >
              <span class="button-icon">📅</span>
              <span class="button-text" id="buttonText">${this.getButtonText()}</span>
              <span class="button-chevron ${this.state.isOpen ? 'open' : ''}">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>

            <!-- Поповер -->
            <div class="trip-date-picker-popover" id="datePickerPopover" style="display: ${this.state.isOpen ? 'block' : 'none'};">
              <div class="popover-content">
                <div class="popover-header">
                  <h3 class="popover-title">Выберите даты поездки</h3>
                  <button class="popover-close" id="popoverClose" aria-label="Закрыть">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>

                <div class="date-inputs-grid">
                  <!-- Дата начала -->
                  <div class="date-input-group">
                    <label class="date-input-label" for="startDateInput">
                      Дата начала
                    </label>
                    <div class="date-input-wrapper">
                      <input
                        id="startDateInput"
                        type="date"
                        class="date-input"
                        value="${this.state.startDate}"
                        min="${this.getTodayDate()}"
                      />
                    </div>
                  </div>

                  ${this.options.showEndDate ? `
                    <!-- Разделитель -->
                    <div class="date-separator-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>

                    <!-- Дата окончания -->
                    <div class="date-input-group">
                      <label class="date-input-label" for="endDateInput">
                        Дата окончания
                      </label>
                      <div class="date-input-wrapper">
                        <input
                          id="endDateInput"
                          type="date"
                          class="date-input"
                          value="${this.state.endDate}"
                          min="${this.state.startDate || this.getTodayDate()}"
                        />
                      </div>
                    </div>
                  ` : ''}
                </div>

                <!-- Кнопки действий -->
                <div class="popover-actions">
                  <button class="action-button secondary" id="clearButton">
                    Очистить
                  </button>
                  <button class="action-button primary" id="applyButton">
                    Применить
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Подсказка -->
          ${!this.state.selectedDates ? `
            <p class="trip-date-picker-hint">
              Выберите удобные даты для вашего путешествия по России
            </p>
          ` : ''}
        </div>
      </section>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Привязка обработчиков событий
   */
  attachEventListeners() {
    // Кнопка открытия/закрытия
    const selectButton = document.getElementById('dateSelectButton');
    if (selectButton) {
      selectButton.addEventListener('click', () => this.togglePopover());
    }

    // Кнопка закрытия
    const closeButton = document.getElementById('popoverClose');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closePopover());
    }

    // Инпуты дат
    const startInput = document.getElementById('startDateInput');
    const endInput = document.getElementById('endDateInput');

    if (startInput) {
      startInput.addEventListener('change', (e) => {
        this.state.startDate = e.target.value;
        // Обновляем min для endDate
        if (endInput) {
          endInput.min = e.target.value;
        }
      });
    }

    if (endInput) {
      endInput.addEventListener('change', (e) => {
        this.state.endDate = e.target.value;
      });
    }

    // Кнопка очистки
    const clearButton = document.getElementById('clearButton');
    if (clearButton) {
      clearButton.addEventListener('click', () => this.clearDates());
    }

    // Кнопка применения
    const applyButton = document.getElementById('applyButton');
    if (applyButton) {
      applyButton.addEventListener('click', () => this.applyDates());
    }

    // Закрытие при клике вне
    document.addEventListener('click', (e) => this.handleOutsideClick(e));

    // Закрытие при Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isOpen) {
        this.closePopover();
      }
    });
  }

  /**
   * Переключение поповера
   */
  togglePopover() {
    this.state.isOpen = !this.state.isOpen;
    this.updatePopoverVisibility();
  }

  /**
   * Открытие поповера
   */
  openPopover() {
    this.state.isOpen = true;
    this.updatePopoverVisibility();
  }

  /**
   * Закрытие поповера
   */
  closePopover() {
    this.state.isOpen = false;
    this.updatePopoverVisibility();
  }

  /**
   * Обновление видимости поповера
   */
  updatePopoverVisibility() {
    const popover = document.getElementById('datePickerPopover');
    const button = document.getElementById('dateSelectButton');
    const chevron = button?.querySelector('.button-chevron');

    if (popover) {
      popover.style.display = this.state.isOpen ? 'block' : 'none';
    }

    if (button) {
      button.setAttribute('aria-expanded', this.state.isOpen);
    }

    if (chevron) {
      chevron.classList.toggle('open', this.state.isOpen);
    }
  }

  /**
   * Обработка клика вне компонента
   */
  handleOutsideClick(event) {
    if (!this.state.isOpen) return;

    const wrapper = this.container?.querySelector('.trip-date-picker-wrapper');
    if (wrapper && !wrapper.contains(event.target)) {
      this.closePopover();
    }
  }

  /**
   * Очистка дат
   */
  clearDates() {
    this.state.startDate = '';
    this.state.endDate = '';
    this.state.selectedDates = null;

    const startInput = document.getElementById('startDateInput');
    const endInput = document.getElementById('endDateInput');

    if (startInput) startInput.value = '';
    if (endInput) endInput.value = '';

    this.updateButtonText();
    this.updateButtonStyle();
  }

  /**
   * Применение дат
   */
  applyDates() {
    if (!this.state.startDate) {
      this.showNotification('Пожалуйста, выберите дату начала поездки', 'error');
      return;
    }

    if (this.options.showEndDate && this.state.endDate) {
      if (new Date(this.state.endDate) < new Date(this.state.startDate)) {
        this.showNotification('Дата окончания не может быть раньше даты начала', 'error');
        return;
      }
    }

    this.state.selectedDates = {
      startDate: this.state.startDate,
      endDate: this.options.showEndDate ? this.state.endDate : null,
      formatted: {
        start: this.formatDate(this.state.startDate),
        end: this.options.showEndDate ? this.formatDate(this.state.endDate) : null
      }
    };

    this.closePopover();
    this.updateButtonText();
    this.updateButtonStyle();

    // Вызываем колбэк
    if (this.options.onDateSelect) {
      this.options.onDateSelect(
        this.state.startDate,
        this.options.showEndDate ? this.state.endDate : null
      );
    }

    this.showNotification('Даты сохранены', 'success');
  }

  /**
   * Обновление текста кнопки
   */
  updateButtonText() {
    const buttonTextEl = document.getElementById('buttonText');
    if (buttonTextEl) {
      buttonTextEl.textContent = this.getButtonText();
    }
  }

  /**
   * Обновление стиля кнопки
   */
  updateButtonStyle() {
    const button = document.getElementById('dateSelectButton');
    if (button) {
      button.classList.toggle('has-dates', !!this.state.selectedDates);
    }
  }

  /**
   * Получение текста для кнопки
   */
  getButtonText() {
    if (!this.state.selectedDates) {
      return this.options.buttonText;
    }

    const { formatted } = this.state.selectedDates;

    if (this.options.showEndDate && formatted.end) {
      return `${formatted.start} → ${formatted.end}`;
    }

    return formatted.start;
  }

  /**
   * Форматирование даты
   */
  formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Получение сегодняшней даты в формате YYYY-MM-DD
   */
  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Показ уведомления
   */
  showNotification(message, type = 'info') {
    // Простая реализация уведомления
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Можно добавить Toast уведомление
    const toast = document.createElement('div');
    toast.className = `date-picker-toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: ${type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(34, 197, 94, 0.9)'};
      color: white;
      border-radius: 0.75rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Получение выбранных дат
   */
  getSelectedDates() {
    return this.state.selectedDates;
  }

  /**
   * Программная установка дат
   */
  setDates(startDate, endDate = null) {
    this.state.startDate = startDate;
    this.state.endDate = endDate;

    const startInput = document.getElementById('startDateInput');
    const endInput = document.getElementById('endDateInput');

    if (startInput) startInput.value = startDate;
    if (endInput && endDate) endInput.value = endDate;
  }

  /**
   * Уничтожение компонента
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    document.removeEventListener('click', this.handleOutsideClick);
  }
}

// Экспорт для использования
window.PremiumDatePicker = PremiumDatePicker;
