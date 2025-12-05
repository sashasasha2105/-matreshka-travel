/**
 * ================================
 * 🎨 SPOTLIGHT CARD
 * Карточка со светящимся эффектом при наведении
 * Источник: https://ui.aceternity.com/components/card-spotlight
 * ================================
 */

class SpotlightCard extends AceternityComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);

        this.options = {
            title: options.title || 'Card Title',
            description: options.description || 'Card description goes here',
            icon: options.icon || '✨',
            spotlightColor: options.spotlightColor || 'rgba(59, 130, 246, 0.3)',
            width: options.width || '100%',
            height: options.height || 'auto',
            image: options.image || null,
            ...options
        };

        this.mouseX = 0;
        this.mouseY = 0;

        this.mount();
    }

    render() {
        // Wrapper
        const wrapper = this.createElement('div', {
            className: 'spotlight-card-wrapper',
            style: {
                width: this.options.width,
                height: this.options.height,
                position: 'relative'
            }
        });

        // Card
        const card = this.createElement('div', {
            className: cn(
                'spotlight-card',
                'relative overflow-hidden',
                'bg-gradient-to-br from-gray-900 to-gray-800',
                'border border-gray-700',
                'rounded-2xl p-8',
                'transition-all duration-300',
                'hover:border-gray-600'
            ),
            style: this.options.image ? {
                backgroundImage: `url('${this.options.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '400px'
            } : {}
        });

        // Dark overlay for readability (if image exists)
        let darkOverlay = null;
        if (this.options.image) {
            darkOverlay = this.createElement('div', {
                className: 'dark-overlay',
                style: {
                    position: 'absolute',
                    inset: '0',
                    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8))',
                    zIndex: '1'
                }
            });
            card.appendChild(darkOverlay);
        }

        // Spotlight overlay
        const spotlight = this.createElement('div', {
            className: 'spotlight-overlay',
            style: {
                position: 'absolute',
                inset: '0',
                opacity: '0',
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
                background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${this.options.spotlightColor}, transparent 40%)`,
                zIndex: '2'
            }
        });

        // Content container
        const content = this.createElement('div', {
            className: 'relative',
            style: {
                zIndex: '10',
                position: 'relative'
            }
        });

        // Icon
        const icon = this.createElement('div', {
            className: 'text-5xl mb-4'
        });
        icon.textContent = this.options.icon;

        // Title
        const title = this.createElement('h3', {
            className: 'text-2xl font-bold text-white mb-3'
        });
        title.textContent = this.options.title;

        // Description
        const description = this.createElement('p', {
            className: 'text-gray-400 text-base leading-relaxed'
        });
        description.textContent = this.options.description;

        // Assemble
        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(description);
        card.appendChild(spotlight);
        card.appendChild(content);
        wrapper.appendChild(card);

        // Add mouse tracking
        this.addMouseTracking(card, spotlight);

        // Add entrance animation
        motion(card).animate(MotionPresets.fadeIn, {
            duration: 0.5
        });

        return wrapper;
    }

    addMouseTracking(card, spotlight) {
        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Update CSS variables
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // Show spotlight
            spotlight.style.opacity = '1';
        };

        const handleMouseLeave = () => {
            spotlight.style.opacity = '0';
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        this.cleanup.push(() => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        });
    }
}

window.SpotlightCard = SpotlightCard;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpotlightCard;
}
