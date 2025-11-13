/**
 * Менеджер модальных окон с focus trap и keyboard navigation
 * Управляет открытием/закрытием модальных окон с поддержкой accessibility
 */

(function() {
    'use strict';

    // Хранилище открытых модальных окон
    const openModals = [];
    let lastFocusedElement = null;

    /**
     * Класс для управления модальным окном
     */
    class ModalManager {
        constructor(modalElement) {
            this.modal = modalElement;
            this.focusableElements = null;
            this.firstFocusable = null;
            this.lastFocusable = null;
            this.keydownHandler = null;

            this.init();
        }

        /**
         * Инициализация модального окна
         */
        init() {
            // Добавляем ARIA атрибуты
            if (!this.modal.getAttribute('role')) {
                this.modal.setAttribute('role', 'dialog');
            }
            this.modal.setAttribute('aria-modal', 'true');

            // Находим все focusable элементы
            this.updateFocusableElements();

            // Сохраняем элемент который был в фокусе до открытия модалки
            lastFocusedElement = document.activeElement;

            // Устанавливаем focus trap
            this.setupFocusTrap();

            // Добавляем keyboard support
            this.setupKeyboardSupport();

            // Фокусируемся на первый элемент или кнопку закрытия
            this.focusFirstElement();

            // Добавляем в список открытых
            openModals.push(this);

            console.log('✅ Модальное окно инициализировано с focus trap');
        }

        /**
         * Находим все focusable элементы в модальном окне
         */
        updateFocusableElements() {
            const focusableSelector = `
                button:not([disabled]),
                [href],
                input:not([disabled]),
                select:not([disabled]),
                textarea:not([disabled]),
                [tabindex]:not([tabindex="-1"])
            `;

            this.focusableElements = this.modal.querySelectorAll(focusableSelector);

            if (this.focusableElements.length > 0) {
                this.firstFocusable = this.focusableElements[0];
                this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
            }
        }

        /**
         * Устанавливаем focus trap (фокус не может выйти за пределы модалки)
         */
        setupFocusTrap() {
            this.modal.addEventListener('keydown', (e) => {
                // Focus trap только при Tab
                if (e.key !== 'Tab') return;

                if (this.focusableElements.length === 0) {
                    e.preventDefault();
                    return;
                }

                // Shift + Tab - движение назад
                if (e.shiftKey) {
                    if (document.activeElement === this.firstFocusable) {
                        e.preventDefault();
                        this.lastFocusable.focus();
                    }
                } else {
                    // Tab - движение вперед
                    if (document.activeElement === this.lastFocusable) {
                        e.preventDefault();
                        this.firstFocusable.focus();
                    }
                }
            });
        }

        /**
         * Keyboard support (ESC для закрытия)
         */
        setupKeyboardSupport() {
            this.keydownHandler = (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            };

            document.addEventListener('keydown', this.keydownHandler);
        }

        /**
         * Фокусируемся на первом элементе
         */
        focusFirstElement() {
            // Приоритет: кнопка закрытия > первый input > первый focusable
            const closeButton = this.modal.querySelector('[class*="close"], [class*="Close"]');
            if (closeButton) {
                closeButton.focus();
                return;
            }

            const firstInput = this.modal.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
                return;
            }

            if (this.firstFocusable) {
                this.firstFocusable.focus();
            }
        }

        /**
         * Закрытие модального окна
         */
        close() {
            // Удаляем keyboard handler
            if (this.keydownHandler) {
                document.removeEventListener('keydown', this.keydownHandler);
            }

            // Возвращаем фокус на элемент который был до открытия модалки
            if (lastFocusedElement && lastFocusedElement.focus) {
                setTimeout(() => {
                    lastFocusedElement.focus();
                }, 100);
            }

            // Удаляем из списка открытых
            const index = openModals.indexOf(this);
            if (index > -1) {
                openModals.splice(index, 1);
            }

            // Удаляем модальное окно из DOM
            if (this.modal.parentNode) {
                this.modal.remove();
            }

            console.log('✅ Модальное окно закрыто');
        }

        /**
         * Уничтожение модального окна
         */
        destroy() {
            this.close();
        }
    }

    /**
     * Глобальная функция для инициализации модального окна
     * Используйте после создания модального окна в DOM
     */
    window.initModalManager = function(modalElement) {
        if (!modalElement) {
            console.error('❌ Элемент модального окна не найден');
            return null;
        }

        return new ModalManager(modalElement);
    };

    /**
     * Закрыть все открытые модальные окна
     */
    window.closeAllModals = function() {
        openModals.forEach(modal => modal.close());
    };

    /**
     * Получить список открытых модальных окон
     */
    window.getOpenModals = function() {
        return openModals.length;
    };

    /**
     * Auto-init для модальных окон с data-атрибутом
     * Использование: <div class="modal" data-auto-modal>...</div>
     */
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    if (node.hasAttribute && node.hasAttribute('data-auto-modal')) {
                        initModalManager(node);
                    }

                    // Ищем в дочерних элементах
                    const modalChildren = node.querySelectorAll && node.querySelectorAll('[data-auto-modal]');
                    if (modalChildren) {
                        modalChildren.forEach(child => initModalManager(child));
                    }
                }
            });
        });
    });

    // Начинаем наблюдение за изменениями DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('✅ Modal Manager инициализирован');
})();
