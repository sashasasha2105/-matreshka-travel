/**
 * ================================
 * 🔄 ACETERNITY ADAPTER
 * Утилиты для адаптации React-компонентов
 * Aceternity UI в Vanilla JavaScript
 * ================================
 */

/**
 * Класс базового компонента Aceternity
 * Используется как основа для всех адаптированных компонентов
 */
class AceternityComponent {
    constructor(containerId, options = {}) {
        this.container = typeof containerId === 'string'
            ? document.getElementById(containerId)
            : containerId;

        if (!this.container) {
            throw new Error(`Container "${containerId}" not found`);
        }

        this.options = options;
        this.state = {};
        this.refs = {};
        this.cleanup = [];
    }

    /**
     * Устанавливает состояние компонента
     * Аналог React useState
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        if (this.onStateChange) {
            this.onStateChange(this.state);
        }
    }

    /**
     * Создает элемент с классами в стиле Tailwind/Aceternity
     * Аналог JSX createElement
     */
    createElement(tag, options = {}, ...children) {
        const element = document.createElement(tag);

        // Применяем классы
        if (options.className) {
            element.className = options.className;
        }

        // Применяем стили
        if (options.style) {
            Object.assign(element.style, options.style);
        }

        // Применяем атрибуты
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }

        // Применяем event listeners
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
                this.cleanup.push(() => element.removeEventListener(event, handler));
            });
        }

        // Добавляем детей
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });

        return element;
    }

    /**
     * Рендерит компонент
     * Должен быть переопределен в наследнике
     */
    render() {
        throw new Error('render() must be implemented');
    }

    /**
     * Монтирует компонент
     */
    mount() {
        const content = this.render();
        this.container.appendChild(content);
        if (this.onMount) {
            this.onMount();
        }
    }

    /**
     * Размонтирует компонент
     */
    unmount() {
        this.cleanup.forEach(fn => fn());
        this.container.innerHTML = '';
        if (this.onUnmount) {
            this.onUnmount();
        }
    }

    /**
     * Обновляет компонент
     */
    update() {
        this.unmount();
        this.mount();
    }

    /**
     * Уничтожает компонент
     */
    destroy() {
        this.unmount();
    }
}

/**
 * ================================
 * 🎨 CN (Class Names Helper)
 * Утилита для условного объединения классов
 * Аналог библиотеки 'clsx' или 'classnames'
 * ================================
 */

function cn(...classes) {
    return classes
        .filter(Boolean)
        .map(cls => {
            if (typeof cls === 'string') return cls;
            if (typeof cls === 'object') {
                return Object.entries(cls)
                    .filter(([_, value]) => value)
                    .map(([key]) => key)
                    .join(' ');
            }
            return '';
        })
        .join(' ')
        .trim();
}

/**
 * ================================
 * 🔧 TAILWIND UTILITIES
 * Хелперы для работы с Tailwind-классами
 * ================================
 */

const TailwindUtils = {
    /**
     * Конвертирует inline стили в Tailwind классы
     * Упрощенная версия для базовых кейсов
     */
    styleToClass(styles) {
        const classMap = {
            'display: flex': 'flex',
            'flex-direction: column': 'flex-col',
            'align-items: center': 'items-center',
            'justify-content: center': 'justify-center',
            'justify-content: space-between': 'justify-between',
            'text-align: center': 'text-center',
            'font-weight: bold': 'font-bold',
            'font-size: 1.5rem': 'text-2xl',
            'font-size: 1.25rem': 'text-xl',
            'font-size: 1rem': 'text-base',
            'margin: 0 auto': 'mx-auto',
            'padding: 1rem': 'p-4',
            'border-radius: 0.5rem': 'rounded-lg'
        };

        const styleStr = Object.entries(styles)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');

        return classMap[styleStr] || '';
    },

    /**
     * Применяет responsive classes
     */
    responsive(base, sm, md, lg, xl) {
        const classes = [base];
        if (sm) classes.push(`sm:${sm}`);
        if (md) classes.push(`md:${md}`);
        if (lg) classes.push(`lg:${lg}`);
        if (xl) classes.push(`xl:${xl}`);
        return classes.join(' ');
    }
};

/**
 * ================================
 * ⚛️ REACT HOOKS EMULATION
 * Эмуляция базовых React хуков
 * ================================
 */

const Hooks = {
    /**
     * useEffect аналог
     * Выполняет callback после инициализации
     */
    useEffect(component, callback, dependencies = []) {
        const oldDeps = component._deps || [];
        const hasChanged = dependencies.some((dep, i) => dep !== oldDeps[i]);

        if (hasChanged || dependencies.length === 0) {
            callback();
            component._deps = dependencies;
        }
    },

    /**
     * useState аналог
     * Возвращает [value, setValue]
     */
    useState(component, initialValue) {
        if (!component._state) {
            component._state = {};
        }

        const stateId = Object.keys(component._state).length;

        if (!(stateId in component._state)) {
            component._state[stateId] = initialValue;
        }

        const setValue = (newValue) => {
            component._state[stateId] = newValue;
            if (component.update) {
                component.update();
            }
        };

        return [component._state[stateId], setValue];
    },

    /**
     * useRef аналог
     */
    useRef(initialValue = null) {
        return { current: initialValue };
    }
};

/**
 * ================================
 * 📝 TEMPLATE HELPERS
 * Хелперы для создания шаблонов
 * ================================
 */

const TemplateHelpers = {
    /**
     * Создает контейнер с Aceternity стилями
     */
    createContainer(className = '') {
        const container = document.createElement('div');
        container.className = cn(
            'relative w-full mx-auto',
            'bg-white dark:bg-black',
            'rounded-lg shadow-lg',
            'backdrop-blur',
            className
        );
        return container;
    },

    /**
     * Создает кнопку в стиле Aceternity
     */
    createButton(text, options = {}) {
        const {
            variant = 'primary',
            size = 'md',
            onClick,
            className = ''
        } = options;

        const variants = {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
            outline: 'border border-gray-300 hover:bg-gray-50 text-gray-900'
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg'
        };

        const button = document.createElement('button');
        button.textContent = text;
        button.className = cn(
            'rounded-lg font-medium transition-all',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            variants[variant],
            sizes[size],
            className
        );

        if (onClick) {
            button.addEventListener('click', onClick);
        }

        return button;
    },

    /**
     * Создает input в стиле Aceternity
     */
    createInput(options = {}) {
        const {
            type = 'text',
            placeholder = '',
            className = '',
            onChange
        } = options;

        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;
        input.className = cn(
            'w-full px-4 py-2 rounded-lg',
            'border border-gray-300 dark:border-gray-700',
            'bg-white dark:bg-black',
            'text-gray-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'transition-all',
            className
        );

        if (onChange) {
            input.addEventListener('input', onChange);
        }

        return input;
    },

    /**
     * Создает карточку в стиле Aceternity
     */
    createCard(content, options = {}) {
        const {
            className = '',
            hover = true
        } = options;

        const card = document.createElement('div');
        card.className = cn(
            'bg-white dark:bg-gray-900',
            'rounded-xl shadow-lg',
            'p-6',
            'border border-gray-200 dark:border-gray-800',
            hover && 'transition-transform hover:scale-105 hover:shadow-xl',
            className
        );

        if (typeof content === 'string') {
            card.innerHTML = content;
        } else {
            card.appendChild(content);
        }

        return card;
    }
};

/**
 * ================================
 * 🎭 PROP CONVERTER
 * Конвертирует React props в Vanilla JS options
 * ================================
 */

const PropConverter = {
    /**
     * Конвертирует camelCase в kebab-case
     */
    camelToKebab(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    },

    /**
     * Конвертирует React props в HTML атрибуты
     */
    propsToAttributes(props) {
        const attributes = {};

        Object.entries(props).forEach(([key, value]) => {
            // Пропускаем специальные React props
            if (['children', 'className', 'style', 'ref', 'key'].includes(key)) {
                return;
            }

            // Конвертируем event handlers (onClick -> click)
            if (key.startsWith('on')) {
                return; // События обрабатываются отдельно
            }

            // Конвертируем остальные props
            const attrName = this.camelToKebab(key);
            attributes[attrName] = value;
        });

        return attributes;
    },

    /**
     * Извлекает event handlers из props
     */
    extractEvents(props) {
        const events = {};

        Object.entries(props).forEach(([key, value]) => {
            if (key.startsWith('on') && typeof value === 'function') {
                const eventName = key.slice(2).toLowerCase();
                events[eventName] = value;
            }
        });

        return events;
    }
};

/**
 * ================================
 * 📦 ЭКСПОРТ
 * ================================
 */

window.AceternityComponent = AceternityComponent;
window.cn = cn;
window.TailwindUtils = TailwindUtils;
window.Hooks = Hooks;
window.TemplateHelpers = TemplateHelpers;
window.PropConverter = PropConverter;

// ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AceternityComponent,
        cn,
        TailwindUtils,
        Hooks,
        TemplateHelpers,
        PropConverter
    };
}

console.log('✅ Aceternity adapter загружен');
