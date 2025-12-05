/**
 * ================================
 * 🎨 3D CARD
 * Карточка с 3D эффектом при наведении
 * Источник: https://ui.aceternity.com/components/3d-card-effect
 * ================================
 */

class Card3D extends AceternityComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);

        this.options = {
            title: options.title || 'Card Title',
            description: options.description || 'Card description goes here',
            image: options.image || null,
            width: options.width || '350px',
            height: options.height || '400px',
            perspective: options.perspective || 1000,
            maxRotation: options.maxRotation || 15,
            ...options
        };

        this.state = {
            rotateX: 0,
            rotateY: 0
        };

        this.mount();
    }

    render() {
        // Wrapper с perspective
        const wrapper = this.createElement('div', {
            className: 'card-3d-wrapper',
            style: {
                perspective: `${this.options.perspective}px`,
                width: this.options.width,
                height: this.options.height
            }
        });

        // Карточка
        const card = this.createElement('div', {
            className: cn(
                'card-3d-inner',
                'relative w-full h-full',
                'bg-gradient-to-br from-gray-900 to-gray-800',
                'rounded-xl overflow-hidden',
                'transition-transform duration-200 ease-out',
                'shadow-2xl'
            )
        });

        // Overlay с градиентом
        const overlay = this.createElement('div', {
            className: 'absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 transition-opacity'
        });

        // Контент
        const content = this.createElement('div', {
            className: 'relative z-10 p-6 h-full flex flex-col justify-between'
        });

        // Изображение (если есть)
        if (this.options.image) {
            const img = this.createElement('img', {
                className: 'w-full h-48 object-cover rounded-lg mb-4',
                attributes: {
                    src: this.options.image,
                    alt: this.options.title
                }
            });
            content.appendChild(img);
        }

        // Заголовок
        const title = this.createElement('h3', {
            className: 'text-2xl font-bold text-white mb-2'
        });
        title.textContent = this.options.title;

        // Описание
        const description = this.createElement('p', {
            className: 'text-gray-300 text-base'
        });
        description.textContent = this.options.description;

        // Собираем
        content.appendChild(title);
        content.appendChild(description);
        card.appendChild(overlay);
        card.appendChild(content);
        wrapper.appendChild(card);

        // Добавляем обработчики мыши
        this.addMouseHandlers(wrapper, card, overlay);

        return wrapper;
    }

    addMouseHandlers(wrapper, card, overlay) {
        const handleMouseMove = (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * this.options.maxRotation;
            const rotateY = ((x - centerX) / centerX) * this.options.maxRotation;

            card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            overlay.style.opacity = '1';
        };

        const handleMouseLeave = () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            overlay.style.opacity = '0';
        };

        wrapper.addEventListener('mousemove', handleMouseMove);
        wrapper.addEventListener('mouseleave', handleMouseLeave);

        this.cleanup.push(() => {
            wrapper.removeEventListener('mousemove', handleMouseMove);
            wrapper.removeEventListener('mouseleave', handleMouseLeave);
        });
    }
}

window.Card3D = Card3D;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Card3D;
}
