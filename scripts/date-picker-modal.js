/**
 * Date Picker Modal - Aceternity UI Style
 * Управление модальным окном для выбора дат
 */

class DatePickerModal {
    constructor() {
        this.overlay = null;
        this.startDateInput = null;
        this.endDateInput = null;
        this.isOpen = false;

        this.init();
    }

    init() {
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Получаем элементы
        this.overlay = document.getElementById('datePickerModal');
        this.startDateInput = document.getElementById('modalStartDate');
        this.endDateInput = document.getElementById('modalEndDate');

        if (!this.overlay) {
            console.error('Date picker modal not found');
            return;
        }

        // Привязываем события
        this.bindEvents();

        // Устанавливаем минимальную дату (сегодня)
        this.setMinDate();
    }

    bindEvents() {
        // Открытие модального окна
        const trigger = document.getElementById('datePickerTrigger');
        if (trigger) {
            trigger.addEventListener('click', () => this.open());
        }

        // Закрытие по клику на overlay
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Закрытие по кнопке закрытия
        const closeBtn = this.overlay.querySelector('.date-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Закрытие по кнопке "Отмена"
        const cancelBtn = this.overlay.querySelector('.date-modal-btn-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }

        // Сохранение дат
        const saveBtn = this.overlay.querySelector('.date-modal-btn-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveDates());
        }

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Валидация дат
        if (this.startDateInput) {
            this.startDateInput.addEventListener('change', () => this.validateDates());
        }
        if (this.endDateInput) {
            this.endDateInput.addEventListener('change', () => this.validateDates());
        }
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];

        if (this.startDateInput) {
            this.startDateInput.min = today;
        }
        if (this.endDateInput) {
            this.endDateInput.min = today;
        }
    }

    validateDates() {
        if (!this.startDateInput || !this.endDateInput) return;

        const startDate = new Date(this.startDateInput.value);
        const endDate = new Date(this.endDateInput.value);

        // Если выбрана дата начала, устанавливаем минимальную дату окончания
        if (this.startDateInput.value) {
            this.endDateInput.min = this.startDateInput.value;
        }

        // Если дата окончания раньше даты начала, сбрасываем
        if (this.startDateInput.value && this.endDateInput.value && endDate < startDate) {
            this.endDateInput.value = '';
            this.showNotification('Дата окончания не может быть раньше даты начала', 'warning');
        }
    }

    open() {
        if (!this.overlay) return;

        this.isOpen = true;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Анимация появления
        setTimeout(() => {
            if (this.startDateInput) {
                this.startDateInput.focus();
            }
        }, 300);
    }

    close() {
        if (!this.overlay) return;

        this.isOpen = false;
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    saveDates() {
        if (!this.startDateInput || !this.endDateInput) return;

        const startDate = this.startDateInput.value;
        const endDate = this.endDateInput.value;

        // Валидация
        if (!startDate || !endDate) {
            this.showNotification('Пожалуйста, выберите обе даты', 'error');
            return;
        }

        // Сохраняем в localStorage
        localStorage.setItem('travelStartDate', startDate);
        localStorage.setItem('travelEndDate', endDate);

        // Форматируем даты для отображения
        const formattedStart = this.formatDate(startDate);
        const formattedEnd = this.formatDate(endDate);

        // Обновляем текст кнопки
        const trigger = document.getElementById('datePickerTrigger');
        if (trigger) {
            trigger.innerHTML = `
                <span>✈️</span>
                <span>${formattedStart} → ${formattedEnd}</span>
            `;
        }

        // Показываем уведомление
        this.showNotification(
            `Даты сохранены: ${formattedStart} - ${formattedEnd}`,
            'success'
        );

        // Закрываем модальное окно
        this.close();

        // Вызываем callback если есть
        this.onDatesSelected(startDate, endDate);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short' };
        return date.toLocaleDateString('ru-RU', options);
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Стили уведомления
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.95rem',
            zIndex: '10000',
            animation: 'slideInRight 0.3s ease-out',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            maxWidth: '320px'
        });

        // Цвета в зависимости от типа
        const colors = {
            success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
        };
        notification.style.background = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    onDatesSelected(startDate, endDate) {
        // Этот метод можно переопределить для кастомной логики
        console.log('Даты выбраны:', { startDate, endDate });

        // Можно отправить данные на сервер
        // this.sendDatesToServer(startDate, endDate);
    }

    loadSavedDates() {
        // Загружаем сохраненные даты при инициализации
        const savedStart = localStorage.getItem('travelStartDate');
        const savedEnd = localStorage.getItem('travelEndDate');

        if (savedStart && savedEnd) {
            if (this.startDateInput) this.startDateInput.value = savedStart;
            if (this.endDateInput) this.endDateInput.value = savedEnd;

            // Обновляем текст кнопки
            const trigger = document.getElementById('datePickerTrigger');
            if (trigger) {
                const formattedStart = this.formatDate(savedStart);
                const formattedEnd = this.formatDate(savedEnd);
                trigger.innerHTML = `
                    <span>✈️</span>
                    <span>${formattedStart} → ${formattedEnd}</span>
                `;
            }
        }
    }
}

// CSS для анимаций уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Инициализация при загрузке страницы
let datePickerModal;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        datePickerModal = new DatePickerModal();
        datePickerModal.loadSavedDates();
    });
} else {
    datePickerModal = new DatePickerModal();
    datePickerModal.loadSavedDates();
}

// Экспортируем для глобального доступа
window.DatePickerModal = DatePickerModal;
window.datePickerModal = datePickerModal;
