/**
 * ================================
 * 🎨 SHIMMER BUTTON
 * Кнопка с эффектом блеска
 * Источник: https://ui.aceternity.com/components/shimmer-button
 * ================================
 */

class ShimmerButton extends AceternityComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);

        this.options = {
            text: options.text || 'Shimmer Button',
            onClick: options.onClick || (() => {}),
            shimmerColor: options.shimmerColor || 'rgba(255, 255, 255, 0.5)',
            backgroundColor: options.backgroundColor || '#3b82f6',
            textColor: options.textColor || '#ffffff',
            size: options.size || 'md',
            ...options
        };

        this.mount();
    }

    render() {
        const sizes = {
            sm: 'px-4 py-2 text-sm',
            md: 'px-6 py-3 text-base',
            lg: 'px-8 py-4 text-lg'
        };

        // Button wrapper
        const wrapper = this.createElement('div', {
            className: 'shimmer-button-wrapper inline-block'
        });

        // Button
        const button = this.createElement('button', {
            className: cn(
                'shimmer-button relative overflow-hidden',
                'font-medium rounded-lg',
                'transition-all duration-300',
                'hover:scale-105 active:scale-95',
                'shadow-lg hover:shadow-xl',
                sizes[this.options.size]
            ),
            style: {
                backgroundColor: this.options.backgroundColor,
                color: this.options.textColor
            },
            events: {
                click: this.options.onClick
            }
        });

        button.textContent = this.options.text;

        // Shimmer effect overlay
        const shimmer = this.createElement('div', {
            className: 'shimmer-overlay',
            style: {
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: `linear-gradient(
                    to right,
                    transparent,
                    ${this.options.shimmerColor},
                    transparent
                )`,
                transform: 'translateX(-100%) rotate(45deg)',
                animation: 'shimmer 3s infinite'
            }
        });

        button.appendChild(shimmer);
        wrapper.appendChild(button);

        // Inject shimmer animation
        this.injectShimmerAnimation();

        // Add motion effects
        motion(button).whileHover({ scale: 1.05 });
        motion(button).whileTap({ scale: 0.95 });

        return wrapper;
    }

    injectShimmerAnimation() {
        if (document.getElementById('shimmer-button-animation')) return;

        const style = document.createElement('style');
        style.id = 'shimmer-button-animation';
        style.textContent = `
            @keyframes shimmer {
                0% {
                    transform: translateX(-100%) rotate(45deg);
                }
                100% {
                    transform: translateX(100%) rotate(45deg);
                }
            }

            .shimmer-button {
                position: relative;
                isolation: isolate;
            }

            .shimmer-button::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: inherit;
                padding: 2px;
                background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
            }
        `;
        document.head.appendChild(style);
    }
}

window.ShimmerButton = ShimmerButton;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShimmerButton;
}
