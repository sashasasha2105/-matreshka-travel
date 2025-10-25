// ========================================
// АНАЛИТИЧЕСКИЙ БОТ - ОТСЛЕЖИВАНИЕ ДЕЙСТВИЙ
// ========================================

/**
 * Модуль для отправки аналитики в Telegram бот
 * Отслеживает:
 * - Запуски бота пользователями
 * - Открытия ссылок
 * - Действия пользователей
 */

const ANALYTICS_BOT_TOKEN = '7471119413:AAH4xq-T5nBuD__Sdhyzzo8BEZC2VBSwzl0';
const ANALYTICS_CHAT_ID = ''; // Сюда нужно добавить chat_id куда слать уведомления

class MatryoshkaAnalytics {
    constructor() {
        this.botToken = ANALYTICS_BOT_TOKEN;
        this.chatId = ANALYTICS_CHAT_ID;
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();

        console.log('📊 Аналитический модуль инициализирован');
        console.log('Session ID:', this.sessionId);
    }

    /**
     * Генерация уникального ID сессии
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Получение информации о пользователе из Telegram WebApp
     */
    getUserInfo() {
        const tg = window.Telegram?.WebApp;

        if (!tg || !tg.initDataUnsafe?.user) {
            return {
                id: 'unknown',
                username: 'Гость',
                first_name: 'Неизвестный',
                last_name: '',
                language_code: navigator.language || 'ru',
                is_bot: false,
                is_premium: false
            };
        }

        const user = tg.initDataUnsafe.user;
        return {
            id: user.id,
            username: user.username || 'no_username',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            language_code: user.language_code || 'ru',
            is_bot: user.is_bot || false,
            is_premium: user.is_premium || false,
            photo_url: user.photo_url || null
        };
    }

    /**
     * Получение информации о устройстве и браузере
     */
    getDeviceInfo() {
        const tg = window.Telegram?.WebApp;

        return {
            platform: tg?.platform || navigator.platform,
            user_agent: navigator.userAgent,
            screen_width: window.screen.width,
            screen_height: window.screen.height,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight,
            color_scheme: tg?.colorScheme || 'light',
            is_mobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    /**
     * Форматирование сообщения для Telegram
     */
    formatMessage(event, data) {
        const user = this.getUserInfo();
        const device = this.getDeviceInfo();
        const timestamp = new Date().toLocaleString('ru-RU', {
            timeZone: 'Europe/Moscow',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        let message = '';

        switch (event) {
            case 'bot_start':
                message = `
🚀 <b>НОВЫЙ ЗАПУСК БОТА</b>

👤 <b>Пользователь:</b>
├ ID: <code>${user.id}</code>
├ Никнейм: @${user.username}
├ Имя: ${user.first_name} ${user.last_name}
├ Язык: ${user.language_code}
${user.is_premium ? '├ ⭐ Premium пользователь\n' : ''}

📱 <b>Устройство:</b>
├ Платформа: ${device.platform}
├ Экран: ${device.screen_width}x${device.screen_height}
├ Мобильное: ${device.is_mobile ? 'Да' : 'Нет'}
├ Тема: ${device.color_scheme}

🌍 <b>Локация:</b>
├ Язык: ${device.language}
├ Часовой пояс: ${device.timezone}

⏰ <b>Время:</b> ${timestamp}
🆔 <b>Session:</b> <code>${this.sessionId}</code>
                `.trim();
                break;

            case 'link_open':
                message = `
🔗 <b>ОТКРЫТИЕ ССЫЛКИ</b>

👤 <b>Пользователь:</b> @${user.username} (${user.first_name})
🔗 <b>Ссылка:</b> ${data.url}
📄 <b>Тип:</b> ${data.type || 'unknown'}
${data.title ? `📌 <b>Название:</b> ${data.title}\n` : ''}

⏰ <b>Время:</b> ${timestamp}
🆔 <b>Session:</b> <code>${this.sessionId}</code>
                `.trim();
                break;

            case 'page_view':
                message = `
📄 <b>ПРОСМОТР СТРАНИЦЫ</b>

👤 <b>Пользователь:</b> @${user.username}
📄 <b>Страница:</b> ${data.page}
${data.from ? `⬅️ <b>Откуда:</b> ${data.from}\n` : ''}

⏰ <b>Время:</b> ${timestamp}
                `.trim();
                break;

            case 'action':
                message = `
⚡ <b>ДЕЙСТВИЕ ПОЛЬЗОВАТЕЛЯ</b>

👤 <b>Пользователь:</b> @${user.username}
⚡ <b>Действие:</b> ${data.action}
${data.details ? `📝 <b>Детали:</b> ${data.details}\n` : ''}

⏰ <b>Время:</b> ${timestamp}
                `.trim();
                break;

            case 'purchase':
                message = `
💰 <b>ПОКУПКА!</b>

👤 <b>Пользователь:</b> @${user.username} (${user.first_name})
🎁 <b>Товар:</b> ${data.item}
💵 <b>Сумма:</b> ${data.amount} ₽
${data.package_id ? `📦 <b>ID пакета:</b> ${data.package_id}\n` : ''}

⏰ <b>Время:</b> ${timestamp}
🆔 <b>Session:</b> <code>${this.sessionId}</code>
                `.trim();
                break;

            default:
                message = `
📊 <b>СОБЫТИЕ: ${event}</b>

👤 <b>Пользователь:</b> @${user.username}
📊 <b>Данные:</b> ${JSON.stringify(data, null, 2)}

⏰ <b>Время:</b> ${timestamp}
                `.trim();
        }

        return message;
    }

    /**
     * Отправка сообщения в Telegram
     */
    async sendMessage(message) {
        // Если chat_id не установлен, получаем его автоматически
        if (!this.chatId) {
            console.warn('⚠️ Analytics Chat ID не установлен. Используем bot owner chat.');
            // Попробуем получить updates и взять chat_id из первого сообщения
            await this.getUpdatesAndSetChatId();
        }

        if (!this.chatId) {
            console.warn('⚠️ Не удалось определить chat_id. Сообщение не отправлено.');
            return null;
        }

        try {
            const response = await fetch(`${this.apiUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: message,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                })
            });

            const result = await response.json();

            if (result.ok) {
                console.log('✅ Аналитика отправлена');
                return result.result;
            } else {
                console.error('❌ Ошибка отправки аналитики:', result.description);
                return null;
            }
        } catch (error) {
            console.error('❌ Ошибка отправки в аналитический бот:', error);
            return null;
        }
    }

    /**
     * Получение chat_id из обновлений бота
     */
    async getUpdatesAndSetChatId() {
        try {
            const response = await fetch(`${this.apiUrl}/getUpdates?limit=1`);
            const result = await response.json();

            if (result.ok && result.result.length > 0) {
                const latestUpdate = result.result[result.result.length - 1];
                const chatId = latestUpdate.message?.chat?.id || latestUpdate.my_chat_member?.chat?.id;

                if (chatId) {
                    this.chatId = chatId;
                    console.log('✅ Chat ID автоматически установлен:', chatId);
                }
            }
        } catch (error) {
            console.error('❌ Ошибка получения chat_id:', error);
        }
    }

    /**
     * Отправка события запуска бота
     */
    async trackBotStart() {
        console.log('📊 Отслеживание запуска бота');
        const message = this.formatMessage('bot_start', {});
        return await this.sendMessage(message);
    }

    /**
     * Отслеживание открытия ссылки
     */
    async trackLinkOpen(url, type = 'external', title = null) {
        console.log('📊 Отслеживание открытия ссылки:', url);
        const message = this.formatMessage('link_open', { url, type, title });
        return await this.sendMessage(message);
    }

    /**
     * Отслеживание просмотра страницы
     */
    async trackPageView(page, from = null) {
        console.log('📊 Отслеживание просмотра:', page);
        const message = this.formatMessage('page_view', { page, from });
        return await this.sendMessage(message);
    }

    /**
     * Отслеживание действия пользователя
     */
    async trackAction(action, details = null) {
        console.log('📊 Отслеживание действия:', action);
        const message = this.formatMessage('action', { action, details });
        return await this.sendMessage(message);
    }

    /**
     * Отслеживание покупки
     */
    async trackPurchase(item, amount, packageId = null) {
        console.log('📊 Отслеживание покупки:', item, amount);
        const message = this.formatMessage('purchase', { item, amount, package_id: packageId });
        return await this.sendMessage(message);
    }
}

// Создаём глобальный экземпляр аналитики
window.matryoshkaAnalytics = new MatryoshkaAnalytics();

// Автоматически отслеживаем запуск при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Отправляем событие запуска бота
    window.matryoshkaAnalytics.trackBotStart();

    console.log('📊 Аналитика Матрешка активирована');
});

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MatryoshkaAnalytics;
}
