# 🚂 Настройка Railway для аналитики

## Автоматическая настройка (Рекомендуется)

### Способ 1: Через веб-интерфейс Railway

1. **Откройте проект на Railway:**
   - Перейдите на https://railway.app
   - Выберите ваш проект Матрешка

2. **Настройте переменные окружения:**
   - Перейдите в **Settings → Variables**
   - Нажмите **New Variable** и добавьте следующие переменные:

   ```
   ANALYTICS_BOT_TOKEN=7471119413:AAH8RHbU0dLSMSMRjgKS6yW4JoMBFp6ylFA
   ANALYTICS_CHAT_ID=1540847019
   ANALYTICS_ENABLED=true
   ANALYTICS_DEBUG=false
   ```

3. **Готово!**
   - Файл `railway.toml` уже настроен для автоматической генерации конфига
   - При следующем деплое скрипт `generate-analytics-config.sh` создаст `analytics.config.js`
   - Аналитика заработает автоматически

### Способ 2: Через Railway CLI (из терминала)

1. **Авторизуйтесь в Railway:**
   ```bash
   railway login
   ```

2. **Свяжите проект (если ещё не связан):**
   ```bash
   railway link
   ```

3. **Запустите автоматическую настройку:**
   ```bash
   ./setup-railway.sh
   ```

   Этот скрипт автоматически:
   - Проверит авторизацию
   - Свяжет проект с Railway
   - Настроит все необходимые переменные окружения
   - Покажет текущую конфигурацию

## Что происходит при деплое

1. **Build команда** (из `railway.toml`):
   ```bash
   bash generate-analytics-config.sh
   ```

   Эта команда создаёт `analytics.config.js` из переменных окружения:
   ```javascript
   window.ANALYTICS_CONFIG = {
       BOT_TOKEN: '7471119413:AAH8RHbU0dLSMSMRjgKS6yW4JoMBFp6ylFA',
       CHAT_ID: '1540847019',
       ENABLED: true,
       DEBUG: false
   };
   ```

2. **Deploy команда** (из `railway.toml`):
   ```bash
   python bot.py
   ```

3. **Результат:**
   - Приложение стартует с полностью настроенной аналитикой
   - При каждом запуске пользователя отправляется уведомление в Telegram
   - Никакие токены не хранятся в Git (только в переменных окружения)

## Проверка работы

После деплоя:

1. Откройте приложение Матрешка
2. В течение нескольких секунд вы получите уведомление в [@Tracer2342332_bot](https://t.me/Tracer2342332_bot)
3. Уведомление содержит:
   - Информацию о пользователе
   - Данные устройства
   - Время захода
   - ID сессии

## Troubleshooting

### Уведомления не приходят

1. **Проверьте переменные окружения:**
   ```bash
   railway variables
   ```

   Должны быть установлены:
   - `ANALYTICS_BOT_TOKEN`
   - `ANALYTICS_CHAT_ID`
   - `ANALYTICS_ENABLED=true`

2. **Проверьте логи:**
   ```bash
   railway logs
   ```

   Ищите сообщения:
   - `✅ analytics.config.js успешно создан!`
   - Ошибки отправки в Telegram

3. **Проверьте, что бот активен:**
   - Откройте [@Tracer2342332_bot](https://t.me/Tracer2342332_bot)
   - Убедитесь, что нажали `/start`

### analytics.config.js не создаётся

1. **Проверьте railway.toml:**
   ```toml
   [build]
   buildCommand = "bash generate-analytics-config.sh || true"
   ```

2. **Проверьте права на выполнение:**
   ```bash
   chmod +x generate-analytics-config.sh
   git add generate-analytics-config.sh
   git commit -m "Fix script permissions"
   git push
   ```

### Ошибка "Unauthorized" при отправке

- Проверьте, что `ANALYTICS_BOT_TOKEN` правильный
- Токен не должен содержать пробелов или переносов строк
- Формат: `ЧИСЛО:СТРОКА` (например, `7471119413:AAH8RHbU0dLSMSMRjgKS6yW4JoMBFp6ylFA`)

## Дополнительные настройки

### Отключить аналитику

Установите переменную:
```bash
railway variables set ANALYTICS_ENABLED=false
```

### Включить режим отладки

Установите переменную:
```bash
railway variables set ANALYTICS_DEBUG=true
```

Это добавит подробные логи в консоль браузера.

### Изменить Chat ID

Если хотите получать уведомления на другой Telegram аккаунт:

1. Получите новый Chat ID через [@userinfobot](https://t.me/userinfobot)
2. Обновите переменную:
   ```bash
   railway variables set ANALYTICS_CHAT_ID=ваш_новый_chat_id
   ```

---

**Последнее обновление:** 26.10.2025
**Версия:** 2.0.0
