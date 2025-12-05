/**
 * ================================
 * 🎨 BACKGROUND BEAMS
 * Анимированные световые лучи на фоне
 * Источник: https://ui.aceternity.com/components/background-beams
 * ================================
 */

class BackgroundBeams extends AceternityComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);

        this.options = {
            beamCount: options.beamCount || 8,
            colors: options.colors || ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'],
            duration: options.duration || 8000,
            delay: options.delay || 1000,
            ...options
        };

        this.mount();
    }

    render() {
        // Container с overflow hidden
        const container = this.createElement('div', {
            className: cn(
                'absolute inset-0',
                'overflow-hidden',
                'pointer-events-none'
            ),
            style: {
                zIndex: '0'
            }
        });

        // Создаем лучи
        for (let i = 0; i < this.options.beamCount; i++) {
            const beam = this.createBeam(i);
            container.appendChild(beam);
        }

        return container;
    }

    createBeam(index) {
        const color = this.options.colors[index % this.options.colors.length];
        const leftPosition = (100 / (this.options.beamCount + 1)) * (index + 1);
        const animationDelay = (this.options.delay * index) / this.options.beamCount;

        const beam = this.createElement('div', {
            className: 'beam',
            style: {
                position: 'absolute',
                left: `${leftPosition}%`,
                top: '-50%',
                width: '1px',
                height: '200%',
                background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
                opacity: '0',
                transform: 'translateY(0)',
                animation: `beamMove ${this.options.duration}ms ease-in-out ${animationDelay}ms infinite`,
                filter: 'blur(1px)'
            }
        });

        // Inject animation keyframes if not already done
        this.injectBeamAnimation();

        return beam;
    }

    injectBeamAnimation() {
        if (document.getElementById('background-beams-animation')) return;

        const style = document.createElement('style');
        style.id = 'background-beams-animation';
        style.textContent = `
            @keyframes beamMove {
                0% {
                    opacity: 0;
                    transform: translateY(-100%);
                }
                10% {
                    opacity: 0.3;
                }
                50% {
                    opacity: 0.5;
                    transform: translateY(0%);
                }
                90% {
                    opacity: 0.3;
                }
                100% {
                    opacity: 0;
                    transform: translateY(100%);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

window.BackgroundBeams = BackgroundBeams;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackgroundBeams;
}
