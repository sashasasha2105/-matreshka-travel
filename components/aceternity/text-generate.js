/**
 * ================================
 * 🎨 TEXT GENERATE EFFECT
 * Анимация появления текста по словам/буквам
 * Источник: https://ui.aceternity.com/components/text-generate-effect
 * ================================
 */

class TextGenerate extends AceternityComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);

        this.options = {
            text: options.text || 'Text Generate Effect',
            duration: options.duration || 50,
            delay: options.delay || 0,
            className: options.className || '',
            filter: options.filter !== false,
            animateBy: options.animateBy || 'words', // 'words' or 'chars'
            ...options
        };

        this.mount();
    }

    render() {
        const container = this.createElement('div', {
            className: cn(
                'text-generate-container',
                this.options.className
            )
        });

        // Split text into words or characters
        const parts = this.options.animateBy === 'words'
            ? this.options.text.split(' ')
            : this.options.text.split('');

        // Create spans for each part
        parts.forEach((part, index) => {
            const span = this.createElement('span', {
                className: cn(
                    'inline-block',
                    this.options.animateBy === 'words' && 'mr-1'
                ),
                style: {
                    opacity: '0',
                    filter: this.options.filter ? 'blur(10px)' : 'none'
                }
            });

            span.textContent = part;
            container.appendChild(span);

            // Animate with delay
            setTimeout(() => {
                span.style.transition = 'all 0.5s ease-out';
                span.style.opacity = '1';
                span.style.filter = 'blur(0px)';
            }, this.options.delay + (index * this.options.duration));
        });

        return container;
    }

    /**
     * Restart animation
     */
    restart() {
        this.unmount();
        this.mount();
    }
}

window.TextGenerate = TextGenerate;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextGenerate;
}
