/**
 * ================================
 * 🎨 FOCUS CARDS
 * Карточки с эффектом фокуса при наведении
 * Источник: https://ui.aceternity.com/components/focus-cards
 * ================================
 */

class FocusCards extends AceternityComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);

        this.options = {
            cards: options.cards || [],
            columns: options.columns || { sm: 1, md: 2, lg: 3 },
            gap: options.gap || '2.5rem',
            onCardClick: options.onCardClick || (() => {}),
            showTitleOnHover: options.showTitleOnHover !== false,
            blurAmount: options.blurAmount || '8px',
            scaleInactive: options.scaleInactive || 0.98,
            imageHeight: options.imageHeight || { sm: '15rem', md: '24rem' },
            ...options
        };

        this.state = {
            hoveredIndex: null
        };

        this.mount();
    }

    render() {
        const container = this.createElement('div', {
            className: cn(
                'focus-cards-grid',
                'grid gap-10 w-full mx-auto'
            ),
            style: {
                gridTemplateColumns: '1fr',
                gap: this.options.gap,
                maxWidth: '80rem',
                padding: '0 2rem'
            }
        });

        // Add responsive grid
        this.injectResponsiveStyles();

        // Create cards
        this.options.cards.forEach((card, index) => {
            const cardElement = this.createCard(card, index);
            container.appendChild(cardElement);
        });

        return container;
    }

    createCard(card, index) {
        const isHovered = this.state.hoveredIndex === index;
        const isOtherHovered = this.state.hoveredIndex !== null && !isHovered;

        const cardWrapper = this.createElement('div', {
            className: cn(
                'focus-card-wrapper',
                'relative rounded-lg overflow-hidden',
                'bg-gray-100 dark:bg-neutral-900',
                'transition-all duration-300 ease-out',
                'cursor-pointer'
            ),
            style: {
                height: this.options.imageHeight.sm,
                transform: isOtherHovered ? `scale(${this.options.scaleInactive})` : 'scale(1)',
                filter: isOtherHovered ? `blur(${this.options.blurAmount})` : 'blur(0)',
                transition: 'all 0.3s ease-out'
            },
            events: {
                mouseenter: () => this.handleMouseEnter(index),
                mouseleave: () => this.handleMouseLeave(),
                click: () => this.options.onCardClick(card, index)
            }
        });

        // Image
        const img = this.createElement('img', {
            className: 'absolute inset-0 w-full h-full object-cover',
            attributes: {
                src: card.src || card.image,
                alt: card.title,
                loading: index < 6 ? 'eager' : 'lazy'
            }
        });

        // Overlay with title (visible on hover)
        const overlay = this.createElement('div', {
            className: cn(
                'focus-card-overlay',
                'absolute inset-0',
                'bg-black/50',
                'flex items-end',
                'py-8 px-4',
                'transition-opacity duration-300'
            ),
            style: {
                opacity: this.options.showTitleOnHover ? (isHovered ? '1' : '0') : '1'
            }
        });

        // Title
        const title = this.createElement('div', {
            className: cn(
                'focus-card-title',
                'text-xl md:text-2xl font-medium',
                'bg-clip-text text-transparent',
                'bg-gradient-to-b from-neutral-50 to-neutral-200'
            )
        });
        title.textContent = card.title;

        // Assemble
        overlay.appendChild(title);
        cardWrapper.appendChild(img);
        cardWrapper.appendChild(overlay);

        return cardWrapper;
    }

    handleMouseEnter(index) {
        this.setState({ hoveredIndex: index });
        this.updateCards();
    }

    handleMouseLeave() {
        this.setState({ hoveredIndex: null });
        this.updateCards();
    }

    updateCards() {
        const cards = this.container.querySelectorAll('.focus-card-wrapper');
        const overlays = this.container.querySelectorAll('.focus-card-overlay');

        cards.forEach((card, index) => {
            const isHovered = this.state.hoveredIndex === index;
            const isOtherHovered = this.state.hoveredIndex !== null && !isHovered;

            // Update card styles
            card.style.transform = isOtherHovered ? `scale(${this.options.scaleInactive})` : 'scale(1)';
            card.style.filter = isOtherHovered ? `blur(${this.options.blurAmount})` : 'blur(0)';

            // Update overlay opacity
            if (this.options.showTitleOnHover) {
                overlays[index].style.opacity = isHovered ? '1' : '0';
            }
        });
    }

    injectResponsiveStyles() {
        if (document.getElementById('focus-cards-responsive-styles')) return;

        const style = document.createElement('style');
        style.id = 'focus-cards-responsive-styles';
        style.textContent = `
            @media (min-width: 768px) {
                .focus-cards-grid {
                    grid-template-columns: repeat(${this.options.columns.md}, 1fr) !important;
                }

                .focus-card-wrapper {
                    height: ${this.options.imageHeight.md} !important;
                }
            }

            @media (min-width: 1024px) {
                .focus-cards-grid {
                    grid-template-columns: repeat(${this.options.columns.lg}, 1fr) !important;
                }
            }

            .focus-card-wrapper {
                will-change: transform, filter;
            }

            .focus-card-title {
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Update cards data
     */
    updateCards(newCards) {
        this.options.cards = newCards;
        this.update();
    }

    /**
     * Add new cards
     */
    addCards(cards) {
        this.options.cards = [...this.options.cards, ...cards];
        this.update();
    }

    /**
     * Clear all cards
     */
    clearCards() {
        this.options.cards = [];
        this.update();
    }
}

window.FocusCards = FocusCards;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FocusCards;
}
