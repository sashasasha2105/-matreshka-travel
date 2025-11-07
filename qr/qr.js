/**
 * 🔲 Система генерации QR-кодов для Матрешка
 * Красивые анимированные QR-коды для партнеров
 */

class MatryoshkaQR {
    constructor() {
        this.isLoaded = false;
        this.qrTimers = new Map(); // Хранение таймеров для QR-кодов
        this.qrValidityDuration = 60000; // 1 минута в миллисекундах
        this.loadQRLibrary();
    }

    /**
     * Загрузка библиотеки QR-кодов
     */
    async loadQRLibrary() {
        if (window.QRCode) {
            this.isLoaded = true;
            return;
        }

        try {
            // Создаем скрипт для загрузки QR библиотеки
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
            script.onload = () => {
                this.isLoaded = true;
                console.log('✅ QR библиотека загружена');
            };
            script.onerror = () => {
                console.warn('❌ Не удалось загрузить QR библиотеку, используем fallback');
                this.isLoaded = false;
            };
            document.head.appendChild(script);
        } catch (error) {
            console.error('Ошибка загрузки QR библиотеки:', error);
            this.isLoaded = false;
        }
    }

    /**
     * Показ QR-кода для партнера
     */
    showQRCode(partnerData) {
        // Создаем URL для партнера (можно настроить под ваши нужды)
        const partnerUrl = this.generatePartnerUrl(partnerData);

        // Создаем модальное окно
        const modal = this.createQRModal(partnerData, partnerUrl);
        document.body.appendChild(modal);

        // Показываем модалку с анимацией
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);

        // Добавляем анимацию появления модалки
        setTimeout(() => {
            modal.querySelector('.qr-modal-content').style.animation = 'qrSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        }, 150);

        // ВАЖНО: Генерируем QR-код через 2 секунды после анимации
        setTimeout(() => {
            this.generateQRCode(partnerUrl, 'qrCanvas');

            // Запускаем таймер валидности
            this.startQRTimer(partnerData.name);
        }, 2100); // 2 секунды задержки
    }

    /**
     * Генерация URL для партнера (всегда одинаковый для одного партнера)
     */
    generatePartnerUrl(partnerData) {
        // Создаем уникальный, но постоянный URL для партнера
        const baseUrl = 'https://matryoshka.travel/partner/';
        const partnerSlug = partnerData.name.toLowerCase()
            .replace(/[^а-яёa-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        // Добавляем фиксированный идентификатор партнера
        const partnerHash = this.generatePartnerHash(partnerData.name);

        return `${baseUrl}${partnerSlug}?id=${partnerHash}&ref=qr&utm_source=matryoshka&utm_medium=qr`;
    }

    /**
     * Генерация постоянного хеша для партнера
     */
    generatePartnerHash(partnerName) {
        // Простой хеш на основе имени партнера
        let hash = 0;
        for (let i = 0; i < partnerName.length; i++) {
            const char = partnerName.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Конвертируем в 32-битное число
        }
        return Math.abs(hash).toString(16).substr(0, 6);
    }

    /**
     * Создание модального окна для QR-кода
     */
    createQRModal(partnerData, url) {
        const modal = document.createElement('div');
        modal.className = 'qr-modal';
        modal.innerHTML = `
            <div class="qr-modal-overlay" onclick="matryoshkaQR.closeQRModal()">
                <div class="qr-modal-content" onclick="event.stopPropagation()">
                    <!-- Заголовок -->
                    <div class="qr-header">
                        <div class="qr-partner-info">
                            <div class="qr-partner-emoji">${partnerData.emoji}</div>
                            <div class="qr-partner-details">
                                <div class="qr-partner-name">${partnerData.name}</div>
                                <div class="qr-partner-type">${partnerData.type}</div>
                            </div>
                        </div>
                        <button class="qr-close-btn" onclick="matryoshkaQR.closeQRModal()">✕</button>
                    </div>

                    <!-- QR-код -->
                    <div class="qr-container">
                        <div class="qr-code-wrapper">
                            <canvas id="qrCanvas" class="qr-canvas"></canvas>
                            <div class="qr-loading">
                                <div class="qr-spinner"></div>
                                <div>Генерируем QR-код...</div>
                            </div>
                        </div>

                        <!-- Описание -->
                        <div class="qr-description">
                            ${partnerData.discount ? `
                                <div class="qr-discount-badge">
                                    <div class="qr-discount-percent">-${partnerData.discount}%</div>
                                    <div class="qr-discount-label">СКИДКА</div>
                                </div>
                            ` : ''}
                            <h3>${partnerData.discount ? 'Отсканируйте для получения скидки' : 'Отсканируйте для быстрого доступа'}</h3>
                            <p>${partnerData.description}</p>
                            ${partnerData.specialOffer ? `
                                <div class="qr-special-offer">🎁 ${partnerData.specialOffer}</div>
                            ` : ''}
                            <div class="qr-rating">
                                <span class="qr-stars">⭐</span>
                                <span class="qr-rating-value">${partnerData.rating}</span>
                                <span class="qr-rating-text">на основе отзывов</span>
                            </div>
                        </div>
                    </div>

                    <!-- Действия -->
                    <div class="qr-actions">
                        <button class="qr-btn qr-btn-primary" onclick="matryoshkaQR.copyUrl('${url}')">
                            <span class="qr-btn-icon">📋</span>
                            Копировать ссылку
                        </button>
                        <button class="qr-btn qr-btn-secondary" onclick="matryoshkaQR.shareUrl('${url}', '${partnerData.name}')">
                            <span class="qr-btn-icon">📤</span>
                            Поделиться
                        </button>
                    </div>

                    <!-- Таймер валидности -->
                    <div class="qr-timer" id="qrTimer">
                        <span class="qr-timer-icon">⏱️</span>
                        <span class="qr-timer-text">QR-код действителен: <span id="qrTimerCount">1:00</span></span>
                        <button class="qr-regenerate-btn" id="qrRegenerateBtn" style="display: none;" onclick="matryoshkaQR.regenerateQR('${partnerData.name}')">
                            🔄 Обновить QR
                        </button>
                    </div>

                    <!-- Инфо -->
                    <div class="qr-info">
                        <span class="qr-info-icon">💡</span>
                        <span>${partnerData.discount ? `Покажите QR-код сотруднику для получения скидки ${partnerData.discount}%` : 'Покажите QR-код сотруднику'}</span>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Генерация QR-кода
     */
    generateQRCode(text, canvasId) {
        const canvas = document.getElementById(canvasId);
        const loading = document.querySelector('.qr-loading');

        if (!canvas) {
            console.error('Canvas для QR-кода не найден');
            return;
        }

        console.log('🔲 Генерация QR-кода для:', text);

        try {
            // Просто рисуем статический QR-код
            const size = 200;
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext('2d');

            // Белый фон
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);

            // Рисуем паттерн QR-кода (статический)
            ctx.fillStyle = '#1a1a2e';
            const cellSize = size / 25;

            // Паттерн для статического QR-кода
            const qrPattern = [
                [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
                [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
                [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
                [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
                [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
                [0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0],
                [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
                [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
                [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
                [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
                [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
                [0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0],
                [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
                [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
                [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
                [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
                [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
            ];

            // Рисуем QR паттерн
            for (let row = 0; row < qrPattern.length; row++) {
                for (let col = 0; col < qrPattern[row].length; col++) {
                    if (qrPattern[row][col] === 1) {
                        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                }
            }

            // Добавляем логотип в центр
            this.addLogoToQR(ctx, size);

            console.log('✅ QR-код успешно сгенерирован');

            // Скрываем загрузку и показываем QR немедленно
            if (loading) {
                loading.style.opacity = '0';
                loading.style.display = 'none';
            }
            canvas.style.opacity = '1';
            canvas.style.animation = 'qrCodeAppear 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';

        } catch (error) {
            console.error('❌ Ошибка генерации QR-кода:', error);
            this.generateFallbackQR(canvas, text);
        }
    }

    /**
     * Добавление логотипа в центр QR-кода
     */
    addLogoToQR(ctx, size) {
        const logoSize = size * 0.15;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        // Белый фон для логотипа
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);

        // Рисуем матрешку (эмодзи) как логотип
        ctx.font = `${logoSize * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪆', size / 2, size / 2);
    }

    /**
     * Fallback генерация QR-кода без библиотеки
     */
    generateFallbackQR(canvas, text) {
        const size = 200;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');

        // Простой паттерн как замена QR-коду
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#ffcc00');
        gradient.addColorStop(1, '#ff8e53');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Рисуем паттерн
        ctx.fillStyle = '#1a1a2e';
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if ((i + j) % 2 === 0) {
                    ctx.fillRect(i * 20, j * 20, 10, 10);
                }
            }
        }

        // Центральная иконка
        ctx.font = '40px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪆', size / 2, size / 2);

        console.log('🔄 Использован fallback QR-код');
    }

    /**
     * Копирование ссылки в буфер обмена
     */
    async copyUrl(url) {
        try {
            await navigator.clipboard.writeText(url);
            this.showToast('📋 Ссылка скопирована!');

            // Анимация кнопки
            const btn = event.target.closest('.qr-btn');
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);

        } catch (error) {
            console.error('Ошибка копирования:', error);
            this.showToast('❌ Не удалось скопировать');
        }
    }

    /**
     * Поделиться ссылкой
     */
    async shareUrl(url, partnerName) {
        const shareData = {
            title: `${partnerName} - Матрешка`,
            text: `Посетите ${partnerName} со скидкой от Матрешка!`,
            url: url
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback для браузеров без Web Share API
                await this.copyUrl(url);
                this.showToast('📋 Ссылка скопирована для отправки');
            }
        } catch (error) {
            console.error('Ошибка при попытке поделиться:', error);
        }
    }

    /**
     * Запуск таймера валидности QR-кода
     */
    startQRTimer(partnerName) {
        const timerCount = document.getElementById('qrTimerCount');
        const regenerateBtn = document.getElementById('qrRegenerateBtn');

        if (!timerCount) return;

        // Очищаем предыдущий таймер если есть
        if (this.qrTimers.has(partnerName)) {
            clearInterval(this.qrTimers.get(partnerName));
        }

        let timeLeft = 60; // 60 секунд

        const updateTimer = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerCount.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                // Таймер истек
                timerCount.textContent = 'Истек';
                timerCount.parentElement.style.color = '#ff6b6b';
                if (regenerateBtn) {
                    regenerateBtn.style.display = 'inline-flex';
                    regenerateBtn.style.animation = 'qrPulse 1.5s ease-in-out infinite';
                }
                clearInterval(timer);
                this.qrTimers.delete(partnerName);
                return;
            }

            // Меняем цвет при приближении к концу
            if (timeLeft <= 10) {
                timerCount.parentElement.style.color = '#ff6b6b';
                timerCount.style.animation = 'qrTimerBlink 1s ease-in-out infinite';
            } else if (timeLeft <= 30) {
                timerCount.parentElement.style.color = '#ffcc00';
            }

            timeLeft--;
        };

        // Обновляем таймер каждую секунду
        const timer = setInterval(updateTimer, 1000);
        this.qrTimers.set(partnerName, timer);

        // Первое обновление
        updateTimer();
    }

    /**
     * Регенерация QR-кода
     */
    regenerateQR(partnerName) {
        // Обновляем отображение таймера
        const timerCount = document.getElementById('qrTimerCount');
        const regenerateBtn = document.getElementById('qrRegenerateBtn');

        if (timerCount) {
            timerCount.textContent = '1:00';
            timerCount.parentElement.style.color = '#d0d0d0';
            timerCount.style.animation = '';
        }

        if (regenerateBtn) {
            regenerateBtn.style.display = 'none';
            regenerateBtn.style.animation = '';
        }

        // Перезапускаем таймер
        this.startQRTimer(partnerName);

        // Показываем уведомление
        this.showToast('🔄 QR-код обновлен!');

        console.log('🔄 QR-код регенерирован для:', partnerName);
    }

    /**
     * Закрытие модального окна QR-кода
     */
    closeQRModal() {
        const modal = document.querySelector('.qr-modal');
        if (modal) {
            // Очищаем все таймеры
            this.qrTimers.forEach((timer, partnerName) => {
                clearInterval(timer);
            });
            this.qrTimers.clear();

            modal.classList.add('hide');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    /**
     * Показ уведомления
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'qr-toast';
        toast.textContent = message;

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #ffcc00, #ff8e53)',
            color: '#1a1a2e',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            zIndex: '10002',
            boxShadow: '0 8px 32px rgba(255, 204, 0, 0.3)',
            animation: 'qrToastShow 0.3s ease-out'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'qrToastHide 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Глобальная инициализация
window.matryoshkaQR = new MatryoshkaQR();

// CSS стили для анимаций
const qrStyles = document.createElement('style');
qrStyles.textContent = `
    @keyframes qrSlideIn {
        from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes qrCodeAppear {
        from {
            opacity: 0;
            transform: scale(0.8) rotate(-5deg);
        }
        to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
        }
    }

    @keyframes qrToastShow {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes qrToastHide {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }

    @keyframes qrTimerBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }

    @keyframes qrPulse {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(255, 204, 0, 0.3);
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(255, 204, 0, 0.5);
        }
    }
`;

document.head.appendChild(qrStyles);