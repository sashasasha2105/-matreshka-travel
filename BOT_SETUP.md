# 🤖 Настройка Telegram бота для Матрешка

## Быстрый старт

### 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 2. Запуск бота

```bash
python3 bot.py
```

Бот автоматически запустится и начнет работать!

---

## 📝 Что делает бот?

Telegram бот **Матрешка** предоставляет пользователям доступ к Web App приложению через удобный интерфейс:

- **`/start`** - Запуск приложения с кнопкой "Открыть Матрешку"
- **`/help`** - Справка по использованию
- **`/about`** - Информация о приложении

При нажатии на кнопку "🪆 Открыть Матрешку" пользователь переходит в полноэкранное Web App приложение внутри Telegram.

---

## 🔧 Конфигурация

### API Токен

Токен бота уже прописан в `bot.py`:
```python
BOT_TOKEN = "8284679572:AAE36-iXRiJgZr2Y526TKyAGA-z-IdD1SRg"
```

### Web App URL

URL вашего приложения на GitHub Pages:
```python
WEB_APP_URL = "https://sashasasha2105.github.io/-matreshka-travel/"
```

### Безопасное хранение (опционально)

Для продакшена рекомендуется использовать переменные окружения:

1. Создайте файл `.env`:
```bash
cp .env.example .env
```

2. Отредактируйте `.env`:
```env
BOT_TOKEN=8284679572:AAE36-iXRiJgZr2Y526TKyAGA-z-IdD1SRg
WEB_APP_URL=https://sashasasha2105.github.io/-matreshka-travel/
```

3. Обновите `bot.py` для использования .env:
```python
from dotenv import load_dotenv
import os

load_dotenv()
BOT_TOKEN = os.getenv('BOT_TOKEN')
WEB_APP_URL = os.getenv('WEB_APP_URL')
```

---

## 🚀 Настройка бота в BotFather

### Шаг 1: Установка Menu Button

Чтобы кнопка "Открыть Матрешку" появлялась в меню бота:

1. Откройте [@BotFather](https://t.me/BotFather)
2. Выполните команду `/mybots`
3. Выберите своего бота
4. Нажмите **Bot Settings** → **Menu Button**
5. Введите:
   - **Button text**: `🪆 Открыть Матрешку`
   - **URL**: `https://sashasasha2105.github.io/-matreshka-travel/`

### Шаг 2: Установка команд

Настройте команды для автодополнения:

1. В [@BotFather](https://t.me/BotFather) выполните `/mybots`
2. Выберите своего бота
3. Нажмите **Edit Bot** → **Edit Commands**
4. Вставьте:

```
start - Запустить приложение Матрешка
help - Показать справку
about - О приложении
```

### Шаг 3: Настройка описания

Установите описание бота:

1. **About** (краткое):
```
🪆 Матрешка — твой путеводитель по России! Исследуй регионы, выбирай пакеты путешествий, находи партнеров со скидками.
```

2. **Description** (полное):
```
🪆 Матрешка — современный сервис для путешествий по России

✨ Что умеет:
• 15+ регионов России с подробным описанием
• Готовые пакеты путешествий
• Интерактивные карты 2GIS
• QR-коды со скидками от партнеров
• Информация о достопримечательностях
• Лента путешествий от пользователей

🎯 Нажмите /start, чтобы начать путешествие!
```

---

## 📱 Тестирование

### Локальное тестирование

1. Запустите бота:
```bash
python3 bot.py
```

2. Откройте Telegram и найдите своего бота
3. Отправьте команду `/start`
4. Нажмите кнопку "🪆 Открыть Матрешку"

### Проверка работы Web App

После нажатия кнопки должно открыться полноэкранное приложение с:
- ✅ Интеграцией Telegram WebApp API
- ✅ BackButton для навигации
- ✅ Адаптацией под тему Telegram
- ✅ Получением данных пользователя (имя, фото)

---

## 🔍 Отладка

### Просмотр логов

Бот выводит подробные логи в консоль:
```
2025-01-18 12:00:00 - __main__ - INFO - 🪆 Запуск Telegram бота Матрешка...
2025-01-18 12:00:01 - __main__ - INFO - ✅ Бот успешно запущен и ожидает сообщений...
2025-01-18 12:00:05 - __main__ - INFO - User 123456789 (username) started the bot
```

### Проверка токена

Если бот не запускается, проверьте токен:
```bash
curl https://api.telegram.org/bot8284679572:AAE36-iXRiJgZr2Y526TKyAGA-z-IdD1SRg/getMe
```

Должен вернуться JSON с информацией о боте.

---

## 🌐 Деплой на сервер

### Вариант 1: Screen (простой)

```bash
# Запустить в фоне
screen -S matryoshka-bot
python3 bot.py

# Отключиться: Ctrl+A, затем D
# Подключиться обратно:
screen -r matryoshka-bot
```

### Вариант 2: Systemd (рекомендуется)

Создайте файл `/etc/systemd/system/matryoshka-bot.service`:

```ini
[Unit]
Description=Matryoshka Telegram Bot
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/PythonProject20
ExecStart=/usr/bin/python3 /path/to/PythonProject20/bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Запуск:
```bash
sudo systemctl daemon-reload
sudo systemctl enable matryoshka-bot
sudo systemctl start matryoshka-bot
sudo systemctl status matryoshka-bot
```

### Вариант 3: Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY bot.py .
CMD ["python3", "bot.py"]
```

Запуск:
```bash
docker build -t matryoshka-bot .
docker run -d --name matryoshka-bot --restart unless-stopped matryoshka-bot
```

---

## ❓ Частые проблемы

### Бот не отвечает
- Проверьте, что бот запущен: `ps aux | grep bot.py`
- Проверьте интернет-соединение
- Проверьте токен бота

### Web App не открывается
- Убедитесь, что GitHub Pages развернут и доступен
- Проверьте URL в `bot.py` (должен быть HTTPS)
- Откройте URL в браузере для проверки

### Ошибка "Address already in use"
Если используете локальный сервер:
```bash
# Найти процесс
lsof -ti:8000
# Убить процесс
kill -9 $(lsof -ti:8000)
```

---

## 📚 Дополнительная информация

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [python-telegram-bot документация](https://docs.python-telegram-bot.org/)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)

---

**Готово!** Теперь ваш бот полностью настроен и готов к работе! 🎉
