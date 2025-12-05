/**
 * ================================
 * 🏙️ REGION CARD ACETERNITY
 * Карточка региона в стиле Aceternity UI
 * Modern design with glass morphism
 * ================================
 */

class RegionCardMobile extends AceternityComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);

        this.options = {
            title: options.title || 'Регион',
            description: options.description || 'Описание региона',
            emoji: options.emoji || '🏛️',
            image: options.image || null,
            onClick: options.onClick || null,
            regionId: options.regionId || null,
            featured: options.featured || false,
            tag: options.tag || null,
            ...options
        };

        this.mount();
    }

    render() {
        // Wrapper
        const wrapper = this.createElement('div', {
            className: 'region-card-wrapper-aceternity',
            style: {
                width: '100%',
                position: 'relative'
            }
        });

        // Card
        const card = this.createElement('div', {
            className: `region-card-aceternity ${this.options.featured ? 'featured' : ''}`,
            style: {
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '1rem',
                border: this.options.featured
                    ? '1px solid rgba(99, 102, 241, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                background: this.options.featured
                    ? 'linear-gradient(to bottom, rgba(67, 56, 202, 0.1), rgba(23, 23, 23, 0.9))'
                    : 'rgba(23, 23, 23, 0.9)',
                cursor: this.options.onClick ? 'pointer' : 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }
        });

        // Gradient top bar для featured
        if (this.options.featured) {
            const gradientBar = this.createElement('div', {
                className: 'gradient-top-bar',
                style: {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '2px',
                    background: 'linear-gradient(to right, rgb(14, 165, 233), rgb(99, 102, 241), rgb(168, 85, 247))',
                    zIndex: '20'
                }
            });
            card.appendChild(gradientBar);
        }

        // Image wrapper
        const imageWrapper = this.createElement('div', {
            className: 'region-image-wrapper',
            style: {
                position: 'relative',
                height: '12rem',
                overflow: 'hidden'
            }
        });

        // Image
        const img = this.createElement('img', {
            className: 'region-image-aceternity',
            style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }
        });
        img.src = this.options.image || 'assets/images/placeholder.jpg';
        img.alt = this.options.title;

        // Image gradient overlay
        const imageOverlay = this.createElement('div', {
            className: 'image-gradient-overlay',
            style: {
                position: 'absolute',
                inset: '0',
                background: 'linear-gradient(to top, rgba(23, 23, 23, 1), rgba(23, 23, 23, 0.5), transparent)',
                zIndex: '5'
            }
        });

        // Tag badge
        if (this.options.tag) {
            const tag = this.createElement('div', {
                className: 'region-tag',
                style: {
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgb(229, 229, 229)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    zIndex: '10'
                }
            });
            tag.textContent = this.options.tag;
            imageWrapper.appendChild(tag);
        }

        imageWrapper.appendChild(img);
        imageWrapper.appendChild(imageOverlay);

        // Content section
        const content = this.createElement('div', {
            className: 'region-content-aceternity',
            style: {
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }
        });

        // Header
        const header = this.createElement('div', {
            className: 'region-header',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }
        });

        // Title
        const title = this.createElement('h3', {
            className: 'region-name-aceternity',
            style: {
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'rgb(250, 250, 250)',
                margin: '0',
                lineHeight: '1.2'
            }
        });
        title.textContent = this.options.title;

        // Description
        const description = this.createElement('p', {
            className: 'region-description-aceternity',
            style: {
                fontSize: '0.875rem',
                color: 'rgb(163, 163, 163)',
                margin: '0',
                lineHeight: '1.5'
            }
        });
        description.textContent = this.options.description;

        // Assemble header
        header.appendChild(title);
        header.appendChild(description);
        content.appendChild(header);

        // Hover glow effect
        const hoverGlow = this.createElement('div', {
            className: 'hover-glow',
            style: {
                position: 'absolute',
                inset: '-2px',
                background: 'linear-gradient(to right, rgb(14, 165, 233), rgb(99, 102, 241))',
                borderRadius: '1rem',
                opacity: '0',
                transition: 'opacity 0.3s ease',
                zIndex: '-1',
                filter: 'blur(20px)'
            }
        });

        // Assemble card
        card.appendChild(imageWrapper);
        card.appendChild(content);
        card.appendChild(hoverGlow);
        wrapper.appendChild(card);

        // Event handlers
        if (this.options.onClick) {
            let touchStartTime = 0;

            const handleTouchStart = () => {
                touchStartTime = Date.now();
                card.style.transform = 'scale(0.98)';
            };

            const handleTouchEnd = (e) => {
                card.style.transform = 'translateY(-4px) scale(1.01)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 200);

                if (Date.now() - touchStartTime < 300) {
                    this.options.onClick(this.options.regionId);
                }
            };

            const handleTouchCancel = () => {
                card.style.transform = 'scale(1)';
            };

            const handleMouseEnter = () => {
                card.style.transform = 'translateY(-4px) scale(1.01)';
                img.style.transform = 'scale(1.1)';
                hoverGlow.style.opacity = '1';
            };

            const handleMouseLeave = () => {
                card.style.transform = 'scale(1)';
                img.style.transform = 'scale(1)';
                hoverGlow.style.opacity = '0';
            };

            card.addEventListener('touchstart', handleTouchStart, { passive: true });
            card.addEventListener('touchend', handleTouchEnd);
            card.addEventListener('touchcancel', handleTouchCancel);
            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mouseleave', handleMouseLeave);
            card.addEventListener('click', () => this.options.onClick(this.options.regionId));

            this.cleanup.push(() => {
                card.removeEventListener('touchstart', handleTouchStart);
                card.removeEventListener('touchend', handleTouchEnd);
                card.removeEventListener('touchcancel', handleTouchCancel);
                card.removeEventListener('mouseenter', handleMouseEnter);
                card.removeEventListener('mouseleave', handleMouseLeave);
            });
        }

        // Entrance animation с opacity
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease';
            card.style.opacity = '1';
        }, 10);

        return wrapper;
    }
}

window.RegionCardMobile = RegionCardMobile;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegionCardMobile;
}
