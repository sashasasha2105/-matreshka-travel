/**
 * LIQUID GLASS TOGGLE
 * Интерактивный переключатель с эффектом жидкого стекла
 * Использует GSAP для анимаций и Draggable для перетаскивания
 */

(function() {
    'use strict';

    // Проверяем наличие GSAP
    if (typeof gsap === 'undefined') {
        console.warn('⚠️ GSAP не загружен. Liquid glass эффект не будет работать');
        return;
    }

    // Регистрируем плагин Draggable если доступен
    if (typeof Draggable !== 'undefined') {
        gsap.registerPlugin(Draggable);
    }

    class LiquidGlassToggle {
        constructor(element, options = {}) {
            this.element = element;
            this.config = {
                bounce: options.bounce !== false,
                bubble: options.bubble !== false,
                delta: options.delta !== false,
                mapped: options.mapped !== false,
                hue: options.hue || 144,
                onToggle: options.onToggle || null,
                ...options
            };

            this.proxy = null;
            this.draggable = null;
            this.init();
        }

        init() {
            this.element.dataset.bounce = this.config.bounce;
            this.element.dataset.mapped = this.config.mapped;
            this.element.style.setProperty('--hue', this.config.hue);
            this.element.style.setProperty('--complete', '0');
            this.element.setAttribute('aria-pressed', 'false');

            this.setupDraggable();
            this.setupKeyboard();
            this.setupMouseTracking();

            console.log('✅ Liquid glass toggle инициализирован');
        }

        setupMouseTracking() {
            // Отслеживание мыши для spotlight эффекта
            this.element.addEventListener('mousemove', (e) => {
                const rect = this.element.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                this.element.style.setProperty('--mouse-x', `${x}%`);
                this.element.style.setProperty('--mouse-y', `${y}%`);
            });
        }

        setupDraggable() {
            if (typeof Draggable === 'undefined') {
                // Fallback: простой клик без драга
                this.element.addEventListener('click', () => this.toggleState());
                return;
            }

            this.proxy = document.createElement('div');

            this.draggable = Draggable.create(this.proxy, {
                allowContextMenu: true,
                handle: this.element,
                onDragStart: () => this.onDragStart(),
                onDrag: () => this.onDrag(),
                onDragEnd: () => this.onDragEnd(),
                onPress: () => this.onPress(),
                onRelease: () => this.onRelease()
            })[0];
        }

        onDragStart() {
            const toggleBounds = this.element.getBoundingClientRect();
            const pressed = this.element.matches('[aria-pressed=true]');
            const bounds = pressed
                ? toggleBounds.left - this.draggable.pointerX
                : toggleBounds.left + toggleBounds.width - this.draggable.pointerX;

            this.draggable.dragBounds = bounds;
            this.element.dataset.active = true;
        }

        onDrag() {
            const pressed = this.element.matches('[aria-pressed=true]');
            const dragged = this.draggable.x - this.draggable.startX;
            const complete = gsap.utils.clamp(
                0,
                100,
                pressed
                    ? gsap.utils.mapRange(this.draggable.dragBounds, 0, 0, 100, dragged)
                    : gsap.utils.mapRange(0, this.draggable.dragBounds, 0, 100, dragged)
            );

            this.draggable.complete = complete;
            gsap.set(this.element, {
                '--complete': complete,
                '--delta': Math.min(Math.abs(this.draggable.deltaX), 12)
            });
        }

        onDragEnd() {
            gsap.fromTo(
                this.element,
                { '--complete': this.draggable.complete },
                {
                    '--complete': this.draggable.complete >= 50 ? 100 : 0,
                    duration: 0.15,
                    onComplete: () => {
                        gsap.delayedCall(0.05, () => {
                            this.element.dataset.active = false;
                            const newState = this.draggable.complete >= 50;
                            this.element.setAttribute('aria-pressed', newState);
                            this.triggerCallback(newState);
                        });
                    }
                }
            );
        }

        onPress() {
            this.__pressTime = Date.now();
            if ('ontouchstart' in window && navigator.maxTouchPoints > 0) {
                this.element.dataset.active = true;
            }
        }

        onRelease() {
            this.__releaseTime = Date.now();
            gsap.set(this.element, { '--delta': 0 });

            if (
                'ontouchstart' in window &&
                navigator.maxTouchPoints > 0 &&
                ((this.draggable.startX !== undefined &&
                    this.draggable.endX !== undefined &&
                    Math.abs(this.draggable.endX - this.draggable.startX) < 4) ||
                    this.draggable.endX === undefined)
            ) {
                this.element.dataset.active = false;
            }

            // Если это был клик (не драг)
            if (this.__releaseTime - this.__pressTime <= 150) {
                this.toggleState();
            }
        }

        async toggleState() {
            this.element.dataset.pressed = true;
            if (this.config.bubble) {
                this.element.dataset.active = true;
            }

            // Ждем завершения анимации если bounce отключен
            if (!this.config.bounce) {
                await Promise.allSettled(
                    this.element.getAnimations({ subtree: true }).map(a => a.finished)
                );
            }

            const pressed = this.element.matches('[aria-pressed=true]');
            const newState = !pressed;

            gsap.timeline({
                onComplete: () => {
                    gsap.delayedCall(0.05, () => {
                        this.element.dataset.active = false;
                        this.element.dataset.pressed = false;
                        this.element.setAttribute('aria-pressed', newState);
                        this.triggerCallback(newState);
                    });
                }
            }).to(this.element, {
                '--complete': newState ? 100 : 0,
                duration: 0.12,
                delay: this.config.bounce && this.config.bubble ? 0.18 : 0
            });
        }

        setupKeyboard() {
            this.element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.toggleState();
                }
                if (e.key === ' ') {
                    e.preventDefault();
                }
            });

            this.element.addEventListener('keyup', (e) => {
                if (e.key === ' ') {
                    this.toggleState();
                }
            });
        }

        triggerCallback(state) {
            if (this.config.onToggle && typeof this.config.onToggle === 'function') {
                this.config.onToggle(state);
            }
        }

        // Публичные методы
        setValue(value) {
            const complete = value ? 100 : 0;
            gsap.to(this.element, {
                '--complete': complete,
                duration: 0.3,
                onComplete: () => {
                    this.element.setAttribute('aria-pressed', value);
                }
            });
        }

        getValue() {
            return this.element.matches('[aria-pressed=true]');
        }

        destroy() {
            if (this.draggable) {
                this.draggable.kill();
            }
        }
    }

    // Экспортируем класс глобально
    window.LiquidGlassToggle = LiquidGlassToggle;

    // Автоинициализация для элементов с классом liquid-toggle
    document.addEventListener('DOMContentLoaded', () => {
        const toggles = document.querySelectorAll('.liquid-toggle:not([data-no-auto-init])');
        toggles.forEach(toggle => {
            new LiquidGlassToggle(toggle, {
                hue: parseInt(toggle.dataset.hue) || 144,
                bounce: toggle.dataset.bounce !== 'false',
                bubble: toggle.dataset.bubble !== 'false',
                mapped: toggle.dataset.mapped !== 'false',
                delta: toggle.dataset.delta !== 'false'
            });
        });

        if (toggles.length > 0) {
            console.log(`✅ Инициализировано ${toggles.length} liquid glass переключателей`);
        }
    });

    // Добавляем ripple эффект для обычных кнопок
    document.addEventListener('click', function(e) {
        const rippleButton = e.target.closest('.ripple');
        if (!rippleButton) return;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');

        const rect = rippleButton.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        rippleButton.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });

})();
