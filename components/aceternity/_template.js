/**
 * ================================
 * 🎨 COMPONENT_NAME
 * Краткое описание компонента
 * Источник: https://ui.aceternity.com/components/xxx
 * ================================
 */

class ComponentName extends AceternityComponent {
    /**
     * Конструктор компонента
     * @param {string|HTMLElement} containerId - ID контейнера или HTMLElement
     * @param {Object} options - Опции компонента
     */
    constructor(containerId, options = {}) {
        super(containerId, options);

        // Настройки по умолчанию
        this.options = {
            // Текстовые параметры
            title: options.title || 'Default Title',
            description: options.description || '',

            // Стилевые параметры
            variant: options.variant || 'default', // 'default' | 'primary' | 'secondary'
            size: options.size || 'md', // 'sm' | 'md' | 'lg'

            // Callback функции
            onClick: options.onClick || (() => {}),
            onChange: options.onChange || (() => {}),

            // Анимации
            animated: options.animated !== false,
            animationDuration: options.animationDuration || 0.3,

            // Остальные опции
            ...options
        };

        // Инициализация состояния
        this.state = {
            isActive: false,
            isHovered: false
        };

        // Монтируем компонент
        this.mount();
    }

    /**
     * Основной метод рендеринга
     * @returns {HTMLElement}
     */
    render() {
        // Создаем контейнер
        const wrapper = this.createElement('div', {
            className: this.getWrapperClasses()
        });

        // Создаем внутренние элементы
        const title = this.createTitle();
        const content = this.createContent();

        // Собираем компонент
        wrapper.appendChild(title);
        wrapper.appendChild(content);

        // Добавляем анимации если включены
        if (this.options.animated) {
            this.addAnimations(wrapper);
        }

        return wrapper;
    }

    /**
     * Создает заголовок
     * @returns {HTMLElement}
     */
    createTitle() {
        const title = this.createElement('h3', {
            className: 'text-xl font-bold mb-2'
        });

        title.textContent = this.options.title;
        return title;
    }

    /**
     * Создает контент
     * @returns {HTMLElement}
     */
    createContent() {
        const content = this.createElement('div', {
            className: 'text-gray-600 dark:text-gray-400'
        });

        content.textContent = this.options.description;
        return content;
    }

    /**
     * Получает классы для wrapper
     * @returns {string}
     */
    getWrapperClasses() {
        const variants = {
            default: 'bg-white dark:bg-gray-900',
            primary: 'bg-blue-500 text-white',
            secondary: 'bg-gray-100 dark:bg-gray-800'
        };

        const sizes = {
            sm: 'p-3',
            md: 'p-4',
            lg: 'p-6'
        };

        return cn(
            'rounded-lg shadow-lg',
            'transition-all duration-300',
            variants[this.options.variant],
            sizes[this.options.size]
        );
    }

    /**
     * Добавляет анимации к элементу
     * @param {HTMLElement} element
     */
    addAnimations(element) {
        const m = motion(element);

        // Анимация появления
        m.animate(MotionPresets.fadeIn, {
            duration: this.options.animationDuration
        });

        // Hover эффект
        m.whileHover({ scale: 1.02 });

        // Tap эффект
        m.whileTap({ scale: 0.98 });
    }

    /**
     * Обновляет опции компонента
     * @param {Object} newOptions
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.update();
    }

    /**
     * Lifecycle: вызывается после монтирования
     */
    onMount() {
        console.log('ComponentName mounted');
    }

    /**
     * Lifecycle: вызывается перед размонтированием
     */
    onUnmount() {
        console.log('ComponentName unmounted');
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        super.destroy();
    }
}

// Экспорт
window.ComponentName = ComponentName;

// ES6 модули
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentName;
}
