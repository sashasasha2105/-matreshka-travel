/**
 * LoaderThree - Aceternity UI Style SVG Loader
 * Красивый анимированный лоадер с тремя вращающимися кольцами
 */

class LoaderThree {
    constructor(containerId = 'loader') {
        this.containerId = containerId;
        this.container = null;
        this.init();
    }

    /**
     * Инициализация лоадера
     */
    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Контейнер с ID "${this.containerId}" не найден`);
            return;
        }

        // Очищаем контейнер и добавляем класс
        this.container.innerHTML = '';
        this.container.className = 'loader-three';

        // Создаем HTML структуру
        this.render();
    }

    /**
     * Создание HTML структуры лоадера
     */
    render() {
        const loaderHTML = `
            <div class="loader-three-container">
                <svg
                    class="loader-three-svg"
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <!-- Верхний треугольник -->
                    <path
                        class="loader-triangle-top"
                        d="M20 5L30 20H10L20 5Z"
                    />
                    <!-- Нижний треугольник -->
                    <path
                        class="loader-triangle-bottom"
                        d="M20 35L10 20H30L20 35Z"
                    />
                </svg>
            </div>
            <div class="loader-three-text">Загрузка...</div>
        `;

        this.container.innerHTML = loaderHTML;
    }

    /**
     * Показать лоадер
     * @param {string} text - Текст для отображения (опционально)
     */
    show(text = 'Загрузка...') {
        if (!this.container) return;

        const textElement = this.container.querySelector('.loader-three-text');
        if (textElement) {
            textElement.textContent = text;
        }

        this.container.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Скрыть лоадер
     */
    hide() {
        if (!this.container) return;

        this.container.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Обновить текст загрузки
     * @param {string} text - Новый текст
     */
    updateText(text) {
        if (!this.container) return;

        const textElement = this.container.querySelector('.loader-three-text');
        if (textElement) {
            textElement.textContent = text;
        }
    }

    /**
     * Уничтожить лоадер
     */
    destroy() {
        if (this.container) {
            this.container.remove();
        }
    }
}

/**
 * Инициализация LoaderThree при загрузке DOM
 * Просто создает экземпляр для инициализации HTML структуры
 * Существующие функции showLoader/hideLoader в script.js будут работать с этой структурой
 */
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем LoaderThree для создания HTML структуры
    new LoaderThree('loader');
    console.log('✅ LoaderThree (Aceternity UI) инициализирован');
});

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoaderThree;
}
