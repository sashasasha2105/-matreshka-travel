/**
 * ================================
 * 🎨 ANIMATED TOOLTIP
 * Интерактивные аватары с тултипами
 * Источник: https://ui.aceternity.com/components/animated-tooltip
 * ================================
 */

class AnimatedTooltip extends AceternityComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);

        this.options = {
            items: options.items || [],
            ...options
        };

        this.hoveredIndex = null;
        this.mouseX = 0;

        this.mount();
    }

    render() {
        const wrapper = this.createElement('div', {
            className: 'animated-tooltip-wrapper',
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0',
                position: 'relative'
            }
        });

        this.options.items.forEach((item, idx) => {
            const itemContainer = this.createElement('div', {
                className: 'tooltip-item-container',
                style: {
                    position: 'relative',
                    marginRight: '-2rem',
                    zIndex: '1',
                    transition: 'z-index 0.3s ease'
                }
            });

            // Tooltip (появляется при hover)
            const tooltip = this.createElement('div', {
                className: 'tooltip-popup',
                style: {
                    position: 'absolute',
                    top: '-6rem',
                    left: '50%',
                    transform: 'translateX(-50%) translateY(20px) scale(0.6)',
                    zIndex: '50',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0.5rem',
                    background: '#000',
                    padding: '0.75rem 1.5rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    opacity: '0',
                    pointerEvents: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    whiteSpace: 'nowrap'
                }
            });

            // Gradient lines
            const gradientLine1 = this.createElement('div', {
                style: {
                    position: 'absolute',
                    bottom: '-1px',
                    left: '2.5rem',
                    right: '2.5rem',
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, rgb(16, 185, 129), transparent)',
                    zIndex: '30'
                }
            });

            const gradientLine2 = this.createElement('div', {
                style: {
                    position: 'absolute',
                    bottom: '-1px',
                    left: '2.5rem',
                    width: '40%',
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, rgb(14, 165, 233), transparent)',
                    zIndex: '30'
                }
            });

            const name = this.createElement('div', {
                style: {
                    position: 'relative',
                    zIndex: '30',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'white'
                }
            });
            name.textContent = item.name;

            const designation = this.createElement('div', {
                style: {
                    fontSize: '1rem',
                    color: 'white',
                    opacity: '0.9'
                }
            });
            designation.textContent = item.designation;

            tooltip.appendChild(gradientLine1);
            tooltip.appendChild(gradientLine2);
            tooltip.appendChild(name);
            tooltip.appendChild(designation);

            // Avatar image
            const img = this.createElement('img', {
                className: 'tooltip-avatar',
                style: {
                    position: 'relative',
                    height: '7rem',
                    width: '7rem',
                    borderRadius: '9999px',
                    border: '3px solid white',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    cursor: 'pointer',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: '1'
                }
            });
            img.src = item.image;
            img.alt = item.name;

            // Mouse move handler
            const handleMouseMove = (e) => {
                const rect = img.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const halfWidth = rect.width / 2;
                this.mouseX = offsetX - halfWidth;

                // Rotate and translate tooltip based on mouse position
                const rotate = (this.mouseX / halfWidth) * 45;
                const translateX = (this.mouseX / halfWidth) * 50;

                tooltip.style.transform = `translateX(calc(-50% + ${translateX}px)) translateY(0) scale(1) rotate(${rotate}deg)`;
            };

            // Hover handlers
            const handleMouseEnter = () => {
                this.hoveredIndex = item.id;
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateX(-50%) translateY(0) scale(1)';
                itemContainer.style.zIndex = '30';
                img.style.transform = 'scale(1.05)';
                img.style.zIndex = '30';
            };

            const handleMouseLeave = () => {
                this.hoveredIndex = null;
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateX(-50%) translateY(20px) scale(0.6)';
                itemContainer.style.zIndex = '1';
                img.style.transform = 'scale(1)';
                img.style.zIndex = '1';
            };

            img.addEventListener('mousemove', handleMouseMove);
            itemContainer.addEventListener('mouseenter', handleMouseEnter);
            itemContainer.addEventListener('mouseleave', handleMouseLeave);

            this.cleanup.push(() => {
                img.removeEventListener('mousemove', handleMouseMove);
                itemContainer.removeEventListener('mouseenter', handleMouseEnter);
                itemContainer.removeEventListener('mouseleave', handleMouseLeave);
            });

            itemContainer.appendChild(tooltip);
            itemContainer.appendChild(img);
            wrapper.appendChild(itemContainer);
        });

        return wrapper;
    }
}

window.AnimatedTooltip = AnimatedTooltip;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimatedTooltip;
}
