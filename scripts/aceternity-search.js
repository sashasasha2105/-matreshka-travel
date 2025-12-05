/**
 * ================================
 * 🎨 ACETERNITY-STYLE SEARCH COMPONENT
 * Красивый поиск в стиле Aceternity UI
 * Vanilla JavaScript (без React)
 * ================================
 */

class AceternitySearch {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }

        // Настройки
        this.options = {
            placeholders: options.placeholders || [
                "Куда поедем в России? 🌍",
                "Например: Байкал ⛰️",
                "Например: Сочи 🏖️",
                "Например: Казань 🕌",
                "Например: Камчатка 🌋",
                "Например: Алтай 🏔️",
                "Например: Карелия 🌲"
            ],
            placeholderInterval: options.placeholderInterval || 3000,
            onSearch: options.onSearch || this.defaultSearchHandler,
            vanishOnSubmit: options.vanishOnSubmit !== false,
            buttonText: options.buttonText || "Найти",
            minLength: options.minLength || 2
        };

        this.currentPlaceholderIndex = 0;
        this.isTyping = false;
        this.placeholderTimer = null;

        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
        this.startPlaceholderRotation();
    }

    render() {
        this.container.innerHTML = `
            <div class="aceternity-search-wrapper">
                <form class="aceternity-search-form" id="aceternitySearchForm">
                    <input
                        type="text"
                        class="aceternity-search-input typing"
                        id="aceternitySearchInput"
                        placeholder="${this.options.placeholders[0]}"
                        autocomplete="off"
                        spellcheck="false"
                    />
                    <button
                        type="submit"
                        class="aceternity-search-button"
                        id="aceternitySearchButton"
                    >
                        ${this.options.buttonText}
                    </button>
                </form>
            </div>
        `;

        this.form = document.getElementById('aceternitySearchForm');
        this.input = document.getElementById('aceternitySearchInput');
        this.button = document.getElementById('aceternitySearchButton');
    }

    attachEventListeners() {
        // Обработка submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Остановка ротации placeholder при вводе
        this.input.addEventListener('input', () => {
            if (this.input.value.length > 0) {
                this.stopPlaceholderRotation();
            } else {
                this.startPlaceholderRotation();
            }
        });

        // Фокус эффекты
        this.input.addEventListener('focus', () => {
            this.input.classList.remove('typing');
        });

        this.input.addEventListener('blur', () => {
            if (this.input.value.length === 0) {
                this.input.classList.add('typing');
            }
        });
    }

    handleSubmit() {
        const query = this.input.value.trim();

        // Валидация
        if (query.length < this.options.minLength) {
            this.showError(`Введите минимум ${this.options.minLength} символа`);
            return;
        }

        // Vanish эффект
        if (this.options.vanishOnSubmit) {
            this.playVanishAnimation(() => {
                this.options.onSearch(query);
                this.resetAfterVanish();
            });
        } else {
            this.options.onSearch(query);
            this.showSuccess();
        }
    }

    playVanishAnimation(callback) {
        this.form.classList.add('vanishing');

        setTimeout(() => {
            callback();
            this.form.classList.remove('vanishing');
        }, 500);
    }

    resetAfterVanish() {
        setTimeout(() => {
            this.form.classList.add('appearing');
            this.input.value = '';
            this.startPlaceholderRotation();

            setTimeout(() => {
                this.form.classList.remove('appearing');
            }, 500);
        }, 100);
    }

    showSuccess() {
        this.form.classList.add('success');
        setTimeout(() => {
            this.form.classList.remove('success');
            this.input.value = '';
        }, 1500);
    }

    showError(message) {
        // Простая анимация shake
        this.input.style.animation = 'shake 0.4s ease-in-out';
        this.input.focus();

        setTimeout(() => {
            this.input.style.animation = '';
        }, 400);

        // Можно добавить tooltip с ошибкой
        console.warn('Search validation error:', message);
    }

    startPlaceholderRotation() {
        if (this.placeholderTimer) return;

        this.placeholderTimer = setInterval(() => {
            this.rotatePlaceholder();
        }, this.options.placeholderInterval);

        this.input.classList.add('typing');
    }

    stopPlaceholderRotation() {
        if (this.placeholderTimer) {
            clearInterval(this.placeholderTimer);
            this.placeholderTimer = null;
        }
        this.input.classList.remove('typing');
    }

    rotatePlaceholder() {
        this.currentPlaceholderIndex =
            (this.currentPlaceholderIndex + 1) % this.options.placeholders.length;

        // Плавная смена placeholder с fade эффектом
        this.input.style.opacity = '0.7';

        setTimeout(() => {
            this.input.placeholder = this.options.placeholders[this.currentPlaceholderIndex];
            this.input.style.opacity = '1';
        }, 150);
    }

    defaultSearchHandler(query) {
        console.log('🔍 Searching for:', query);
        // Здесь будет твоя логика поиска
        // Например: window.searchRegions(query);
    }

    destroy() {
        this.stopPlaceholderRotation();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// ================================
// CSS для shake анимации (если её нет)
// ================================
const shakeAnimation = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
}
`;

// Добавляем стили если их нет
if (!document.getElementById('aceternity-search-shake')) {
    const style = document.createElement('style');
    style.id = 'aceternity-search-shake';
    style.textContent = shakeAnimation;
    document.head.appendChild(style);
}

// ================================
// ЭКСПОРТ для использования
// ================================
window.AceternitySearch = AceternitySearch;
