/**
 * ================================
 * 🎨 MOVING BORDER BUTTON
 * Кнопка с анимированной границей
 * Источник: https://ui.aceternity.com/components/moving-border
 * ================================
 */

class MovingBorderButton extends AceternityComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);

        this.options = {
            text: options.text || 'Button',
            onClick: options.onClick || (() => {}),
            borderRadius: options.borderRadius || '9999px',
            borderColor: options.borderColor || 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
            backgroundColor: options.backgroundColor || '#000',
            textColor: options.textColor || '#fff',
            duration: options.duration || 3000,
            ...options
        };

        this.mount();
    }

    render() {
        // Wrapper с position relative
        const wrapper = this.createElement('div', {
            className: 'relative inline-block'
        });

        // Анимированная граница (pseudo-element через inline styles)
        const borderElement = this.createElement('div', {
            className: 'absolute inset-0 rounded-full',
            style: {
                background: this.options.borderColor,
                animation: `spin ${this.options.duration / 1000}s linear infinite`,
                padding: '2px',
                borderRadius: this.options.borderRadius
            }
        });

        // Кнопка
        const button = this.createElement('button', {
            className: cn(
                'relative z-10 px-8 py-3',
                'font-medium transition-all',
                'hover:scale-105 active:scale-95'
            ),
            style: {
                backgroundColor: this.options.backgroundColor,
                color: this.options.textColor,
                borderRadius: this.options.borderRadius
            },
            events: {
                click: this.options.onClick
            }
        });

        button.textContent = this.options.text;

        // Собираем
        wrapper.appendChild(borderElement);
        wrapper.appendChild(button);

        // Добавляем анимации
        const m = motion(button);
        m.whileHover({ scale: 1.05 });
        m.whileTap({ scale: 0.95 });

        // Добавляем CSS анимацию вращения
        this.injectSpinAnimation();

        return wrapper;
    }

    injectSpinAnimation() {
        if (document.getElementById('moving-border-spin')) return;

        const style = document.createElement('style');
        style.id = 'moving-border-spin';
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

window.MovingBorderButton = MovingBorderButton;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovingBorderButton;
}
