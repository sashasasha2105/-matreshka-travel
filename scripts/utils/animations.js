/**
 * ================================
 * 🎬 ANIMATION UTILITIES
 * Аналог Framer Motion для Vanilla JS
 * Используется для адаптации Aceternity UI компонентов
 * ================================
 */

/**
 * Motion - класс для создания анимированных элементов
 * Имитирует API motion.div, motion.button и т.д. из framer-motion
 */
class Motion {
    constructor(element) {
        this.element = element;
        this.animations = [];
        this.cleanup = [];
    }

    /**
     * Анимация появления элемента
     * @param {Object} variants - объект с состояниями анимации
     * @param {Object} options - настройки анимации
     */
    animate(variants, options = {}) {
        const {
            duration = 0.3,
            delay = 0,
            ease = 'ease-out',
            iterations = 1
        } = options;

        const element = this.element;

        // Применяем начальное состояние
        if (variants.from) {
            Object.entries(variants.from).forEach(([prop, value]) => {
                this.applyStyle(element, prop, value);
            });
        }

        // Запускаем анимацию
        setTimeout(() => {
            element.style.transition = `all ${duration}s ${ease}`;

            if (variants.to) {
                Object.entries(variants.to).forEach(([prop, value]) => {
                    this.applyStyle(element, prop, value);
                });
            }
        }, delay * 1000);

        return this;
    }

    /**
     * Применяет стиль к элементу (конвертирует React-style в CSS)
     */
    applyStyle(element, prop, value) {
        const styleMap = {
            x: (val) => element.style.transform = `translateX(${val}px)`,
            y: (val) => element.style.transform = `translateY(${val}px)`,
            scale: (val) => element.style.transform = `scale(${val})`,
            rotate: (val) => element.style.transform = `rotate(${val}deg)`,
            opacity: (val) => element.style.opacity = val
        };

        if (styleMap[prop]) {
            styleMap[prop](value);
        } else {
            element.style[prop] = value;
        }
    }

    /**
     * Анимация при наведении
     */
    whileHover(styles) {
        const element = this.element;
        const originalStyles = {};

        // Сохраняем оригинальные стили
        Object.keys(styles).forEach(key => {
            originalStyles[key] = element.style[key];
        });

        const onMouseEnter = () => {
            Object.entries(styles).forEach(([prop, value]) => {
                this.applyStyle(element, prop, value);
            });
        };

        const onMouseLeave = () => {
            Object.entries(originalStyles).forEach(([prop, value]) => {
                this.applyStyle(element, prop, value);
            });
        };

        element.addEventListener('mouseenter', onMouseEnter);
        element.addEventListener('mouseleave', onMouseLeave);

        this.cleanup.push(() => {
            element.removeEventListener('mouseenter', onMouseEnter);
            element.removeEventListener('mouseleave', onMouseLeave);
        });

        return this;
    }

    /**
     * Анимация при клике
     */
    whileTap(styles) {
        const element = this.element;
        const originalStyles = {};

        Object.keys(styles).forEach(key => {
            originalStyles[key] = element.style[key];
        });

        const onMouseDown = () => {
            Object.entries(styles).forEach(([prop, value]) => {
                this.applyStyle(element, prop, value);
            });
        };

        const onMouseUp = () => {
            Object.entries(originalStyles).forEach(([prop, value]) => {
                this.applyStyle(element, prop, value);
            });
        };

        element.addEventListener('mousedown', onMouseDown);
        element.addEventListener('mouseup', onMouseUp);

        this.cleanup.push(() => {
            element.removeEventListener('mousedown', onMouseDown);
            element.removeEventListener('mouseup', onMouseUp);
        });

        return this;
    }

    /**
     * Очистка event listeners
     */
    destroy() {
        this.cleanup.forEach(fn => fn());
    }
}

/**
 * Создает анимированный элемент
 * @param {HTMLElement|string} element - элемент или селектор
 * @returns {Motion}
 */
function motion(element) {
    const el = typeof element === 'string'
        ? document.querySelector(element)
        : element;

    if (!el) {
        console.error('Motion: element not found');
        return null;
    }

    return new Motion(el);
}

/**
 * ================================
 * 🎨 ПРЕДУСТАНОВЛЕННЫЕ АНИМАЦИИ
 * Готовые варианты для быстрого использования
 * ================================
 */

const MotionPresets = {
    // Fade In
    fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 }
    },

    // Fade Out
    fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 }
    },

    // Slide from Left
    slideInLeft: {
        from: { x: -50, opacity: 0 },
        to: { x: 0, opacity: 1 }
    },

    // Slide from Right
    slideInRight: {
        from: { x: 50, opacity: 0 },
        to: { x: 0, opacity: 1 }
    },

    // Slide from Top
    slideInTop: {
        from: { y: -50, opacity: 0 },
        to: { y: 0, opacity: 1 }
    },

    // Slide from Bottom
    slideInBottom: {
        from: { y: 50, opacity: 0 },
        to: { y: 0, opacity: 1 }
    },

    // Scale Up
    scaleIn: {
        from: { scale: 0.8, opacity: 0 },
        to: { scale: 1, opacity: 1 }
    },

    // Scale Down
    scaleOut: {
        from: { scale: 1, opacity: 1 },
        to: { scale: 0.8, opacity: 0 }
    },

    // Bounce
    bounce: {
        from: { y: 0 },
        to: { y: -10 }
    },

    // Hover Scale
    hoverScale: { scale: 1.05 },

    // Tap Scale
    tapScale: { scale: 0.95 }
};

/**
 * ================================
 * 🔄 STAGGER ANIMATIONS
 * Последовательная анимация элементов
 * ================================
 */

/**
 * Анимирует элементы с задержкой между ними
 * @param {NodeList|Array} elements - список элементов
 * @param {Object} variants - варианты анимации
 * @param {Object} options - настройки
 */
function staggerAnimate(elements, variants, options = {}) {
    const {
        staggerDelay = 0.1,
        duration = 0.3,
        ease = 'ease-out'
    } = options;

    elements.forEach((element, index) => {
        const m = motion(element);
        m.animate(variants, {
            duration,
            ease,
            delay: index * staggerDelay
        });
    });
}

/**
 * ================================
 * 🎯 SCROLL ANIMATIONS
 * Анимации при скролле
 * ================================
 */

/**
 * Анимирует элемент при появлении в viewport
 * @param {HTMLElement} element - элемент для анимации
 * @param {Object} variants - варианты анимации
 * @param {Object} options - настройки
 */
function animateOnScroll(element, variants, options = {}) {
    const {
        threshold = 0.1,
        rootMargin = '0px',
        once = true
    } = options;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                motion(element).animate(variants, options);

                if (once) {
                    observer.unobserve(element);
                }
            }
        });
    }, {
        threshold,
        rootMargin
    });

    observer.observe(element);

    return observer;
}

/**
 * ================================
 * 🌊 SPRING ANIMATIONS
 * Пружинистые анимации (упрощенная версия)
 * ================================
 */

const SpringPresets = {
    default: { stiffness: 100, damping: 10, mass: 1 },
    gentle: { stiffness: 120, damping: 14, mass: 1 },
    wobbly: { stiffness: 180, damping: 12, mass: 1 },
    stiff: { stiffness: 260, damping: 20, mass: 1 },
    slow: { stiffness: 80, damping: 20, mass: 1 },
    molasses: { stiffness: 60, damping: 25, mass: 1 }
};

/**
 * Конвертирует spring параметры в CSS cubic-bezier
 * Упрощенная версия, для точности лучше использовать Web Animations API
 */
function springToEasing(spring = SpringPresets.default) {
    const presetMap = {
        100: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        120: 'cubic-bezier(0.4, 0, 0.2, 1)',
        180: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        260: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        80: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        60: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)'
    };

    return presetMap[spring.stiffness] || presetMap[100];
}

/**
 * ================================
 * 📦 ЭКСПОРТ
 * ================================
 */

window.Motion = Motion;
window.motion = motion;
window.MotionPresets = MotionPresets;
window.staggerAnimate = staggerAnimate;
window.animateOnScroll = animateOnScroll;
window.SpringPresets = SpringPresets;
window.springToEasing = springToEasing;

// Экспорт для ES6 модулей (если используются)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Motion,
        motion,
        MotionPresets,
        staggerAnimate,
        animateOnScroll,
        SpringPresets,
        springToEasing
    };
}

console.log('✅ Animation utilities загружены');
