#!/usr/bin/env python3
"""
Telegram бот для Матрешка - путешествия по России
Оптимизированная версия для 24/7 работы с интеграцией Supabase
"""

import logging
import asyncio
import signal
import sys
import aiohttp
from datetime import datetime
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
from telegram.error import NetworkError, TimedOut
from database import db

# Настройка логирования с ротацией
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('matreshka_bot.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# API токен бота
BOT_TOKEN = "8284679572:AAE36-iXRiJgZr2Y526TKyAGA-z-IdD1SRg"

# URL вашего Web App
WEB_APP_URL = "https://sashasasha2105.github.io/-matreshka-travel/"

# Аналитический бот
ANALYTICS_BOT_TOKEN = "7471119413:AAH8RHbU0dLSMSMRjgKS6yW4JoMBFp6ylFA"
ANALYTICS_CHAT_ID = "1540847019"

# Глобальная переменная для graceful shutdown
shutdown_event = asyncio.Event()


async def send_analytics(user, action="bot_start"):
    """Отправка аналитики в Telegram"""
    try:
        # Формируем сообщение
        timestamp = datetime.now().strftime("%d.%m.%Y, %H:%M:%S")

        message = f"""
🚀 <b>НОВЫЙ ЗАПУСК БОТА</b>

👤 <b>Пользователь:</b>
├ ID: <code>{user.id}</code>
├ Никнейм: @{user.username or 'нет'}
├ Имя: {user.first_name} {user.last_name or ''}
├ Язык: {user.language_code or 'не указан'}
{f'├ ⭐ Premium пользователь' if user.is_premium else ''}

⏰ <b>Время запуска:</b> {timestamp}
🆔 <b>User ID:</b> <code>{user.id}</code>
""".strip()

        # Отправляем в аналитический бот
        url = f"https://api.telegram.org/bot{ANALYTICS_BOT_TOKEN}/sendMessage"

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json={
                "chat_id": ANALYTICS_CHAT_ID,
                "text": message,
                "parse_mode": "HTML"
            }) as response:
                if response.status == 200:
                    logger.info(f"✅ Аналитика отправлена для пользователя {user.id}")
                else:
                    logger.warning(f"⚠️ Ошибка отправки аналитики: {response.status}")

    except Exception as e:
        logger.error(f"❌ Ошибка отправки аналитики: {e}")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start - показывает приветствие и кнопку запуска Web App"""
    user = update.effective_user

    # Отправляем аналитику
    await send_analytics(user)

    # Сохраняем/обновляем пользователя в базе данных
    if db:
        try:
            db_user = await db.get_user(user.id)
            if not db_user:
                # Создаем нового пользователя
                user_data = {
                    "telegram_id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name or "",
                    "is_premium": user.is_premium or False,
                    "language_code": user.language_code or 'ru'
                }
                db_user = await db.create_user(user_data)
                logger.info(f"✅ Новый пользователь зарегистрирован в БД: {user.id}")
            else:
                # Обновляем данные существующего пользователя
                user_data = {
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name or "",
                    "is_premium": user.is_premium or False,
                }
                await db.update_user(user.id, user_data)
                logger.info(f"✅ Данные пользователя обновлены: {user.id}")
        except Exception as e:
            logger.error(f"❌ Ошибка работы с БД для пользователя {user.id}: {e}")

    # Создаем кнопку для запуска Web App
    keyboard = [
        [InlineKeyboardButton(
            text="🪆 Открыть Матрешку",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    # Приветственное сообщение (имя всегда с большой буквы)
    welcome_message = (
        f"Привет, {user.first_name.capitalize()}! 👋\n\n"
        "🪆 Добро пожаловать в <b>Матрешку</b> — твой путеводитель по России!\n\n"
        "✨ Исследуй регионы\n"
        "🎒 Выбирай готовые пакеты путешествий\n"
        "🗺️ Находи партнеров и достопримечательности\n"
        "📱 Получай QR-коды со скидками\n\n"
        "Нажми кнопку ниже, чтобы начать путешествие! 👇"
    )

    await update.message.reply_text(
        welcome_message,
        reply_markup=reply_markup,
        parse_mode='HTML'
    )

    logger.info(f"User {user.id} ({user.username}) started the bot")


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /help - показывает помощь"""
    help_text = (
        "🪆 <b>Матрешка - Помощь</b>\n\n"
        "<b>Доступные команды:</b>\n"
        "/start - Запустить приложение\n"
        "/help - Показать эту справку\n"
        "/about - О приложении\n\n"
        "<b>Как пользоваться:</b>\n"
        "1️⃣ Нажмите 'Открыть Матрешку'\n"
        "2️⃣ Выберите регион или готовый пакет\n"
        "3️⃣ Изучайте достопримечательности\n"
        "4️⃣ Получайте QR-коды партнеров\n\n"
        "Приятных путешествий! 🇷🇺"
    )

    # Кнопка для запуска Web App
    keyboard = [
        [InlineKeyboardButton(
            text="🪆 Открыть Матрешку",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        help_text,
        reply_markup=reply_markup,
        parse_mode='HTML'
    )


async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /about - информация о приложении"""
    about_text = (
        "🪆 <b>О приложении Матрешка</b>\n\n"
        "Матрешка — это современный сервис для путешествий по России.\n\n"
        "🌟 <b>Особенности:</b>\n"
        "• 15+ регионов России\n"
        "• Готовые пакеты путешествий\n"
        "• Интерактивные карты 2GIS\n"
        "• QR-коды со скидками от партнеров\n"
        "• Информация о достопримечательностях\n"
        "• Лента путешествий от пользователей\n\n"
        "🎯 <b>Наша миссия:</b>\n"
        "Сделать путешествия по России доступными и увлекательными для каждого!\n\n"
        "🚀 Версия: 1.0\n"
        "📅 2025"
    )

    # Кнопка для запуска Web App
    keyboard = [
        [InlineKeyboardButton(
            text="🪆 Открыть Матрешку",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        about_text,
        reply_markup=reply_markup,
        parse_mode='HTML'
    )


async def photo_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик фотографий - загружает фото в Supabase Storage и сохраняет в базу данных"""
    user = update.effective_user
    message = update.message

    if not message or not message.photo:
        return

    try:
        # Получаем фото наивысшего качества
        photo = message.photo[-1]

        logger.info(f"📸 Получено фото от пользователя {user.id} (@{user.username}): {photo.file_id}")

        # Отправляем сообщение о загрузке
        status_message = await message.reply_text("⏳ Загружаю фото...")

        # Сохраняем в базу данных
        if db:
            try:
                # Сначала проверяем/создаем пользователя
                db_user = await db.get_user(user.id)
                if not db_user:
                    user_data = {
                        "telegram_id": user.id,
                        "username": user.username,
                        "first_name": user.first_name,
                        "last_name": user.last_name or "",
                    }
                    db_user = await db.create_user(user_data)
                    logger.info(f"✅ Создан новый пользователь: {user.id}")

                # Скачиваем фото из Telegram
                file = await context.bot.get_file(photo.file_id)

                # Создаем временное имя файла
                import os
                import tempfile
                temp_dir = tempfile.gettempdir()
                temp_file_path = os.path.join(temp_dir, f"{photo.file_id}.jpg")

                # Скачиваем фото во временный файл
                await file.download_to_drive(temp_file_path)
                logger.info(f"📥 Фото скачано во временный файл: {temp_file_path}")

                # Загружаем фото в Supabase Storage
                photo_url = db.upload_photo_to_storage(temp_file_path)

                # Удаляем временный файл
                try:
                    os.remove(temp_file_path)
                except:
                    pass

                if photo_url:
                    logger.info(f"☁️ Фото загружено в Supabase Storage: {photo_url}")

                    # Сохраняем запись в таблицу travel_feed
                    username = f"@{user.username}" if user.username else user.first_name
                    description = message.caption if message.caption else None

                    saved_photo = await db.add_travel_photo(
                        telegram_id=user.id,
                        username=username,
                        photo_url=photo_url,
                        description=description
                    )

                    if saved_photo:
                        logger.info(f"✅ Фото добавлено в ленту: ID={saved_photo['id']}")

                        # Обновляем сообщение о статусе
                        await status_message.edit_text(
                            "✅ Отлично! Фото добавлено в ленту путешествий!\n\n"
                            "📱 Оно будет видно в разделе 'Лента' приложения Матрешка.\n"
                            f"🕒 Время добавления: {datetime.now().strftime('%d.%m.%Y %H:%M')}",
                            parse_mode='HTML'
                        )
                    else:
                        logger.error(f"❌ Не удалось сохранить запись в БД")
                        await status_message.edit_text("❌ Произошла ошибка при сохранении записи в БД.")
                else:
                    logger.error(f"❌ Не удалось загрузить фото в Storage")
                    await status_message.edit_text("❌ Произошла ошибка при загрузке фото в хранилище.")

            except Exception as e:
                logger.error(f"❌ Ошибка при обработке фото: {e}", exc_info=True)
                try:
                    await status_message.edit_text("❌ Произошла ошибка при сохранении фото. Попробуйте позже.")
                except:
                    pass
        else:
            logger.warning("⚠️ База данных не инициализирована")
            await message.reply_text("⚠️ Сервис временно недоступен. Попробуйте позже.")

    except Exception as e:
        logger.error(f"❌ Ошибка обработки фото: {e}", exc_info=True)
        try:
            await message.reply_text("❌ Произошла ошибка при обработке фото.")
        except:
            pass


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик ошибок с улучшенной диагностикой"""
    logger.error("Exception while handling an update:", exc_info=context.error)

    # Обработка специфичных ошибок
    if isinstance(context.error, NetworkError):
        logger.warning("Network error occurred, bot will retry automatically")
    elif isinstance(context.error, TimedOut):
        logger.warning("Request timed out, bot will retry automatically")
    else:
        logger.error(f"Unexpected error: {type(context.error).__name__}: {context.error}")


def signal_handler(signum, frame):
    """Обработчик сигналов для graceful shutdown"""
    logger.info(f"Получен сигнал {signum}, начинаем остановку бота...")
    shutdown_event.set()


def main() -> None:
    """Запуск бота с автоматическим перезапуском"""
    logger.info("🪆 Запуск Telegram бота Матрешка...")

    # Регистрируем обработчики сигналов
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Создаем приложение с оптимизированными настройками
    application = (
        Application.builder()
        .token(BOT_TOKEN)
        .connect_timeout(30.0)
        .read_timeout(30.0)
        .write_timeout(30.0)
        .pool_timeout(30.0)
        .connection_pool_size(8)
        .build()
    )

    # Регистрируем обработчики команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("about", about_command))

    # Регистрируем обработчик фотографий
    application.add_handler(MessageHandler(filters.PHOTO, photo_handler))

    # Регистрируем обработчик ошибок
    application.add_error_handler(error_handler)

    # Запускаем бота с автоматическим переподключением
    logger.info("✅ Бот успешно запущен и ожидает сообщений...")
    logger.info("🔄 Бот работает в режиме 24/7 с автоматическим переподключением")

    try:
        application.run_polling(
            allowed_updates=Update.ALL_TYPES,
            drop_pending_updates=True,
            close_loop=False
        )
    except KeyboardInterrupt:
        logger.info("Бот остановлен пользователем")
    except Exception as e:
        logger.error(f"Критическая ошибка: {e}", exc_info=True)
        logger.info("Бот будет перезапущен системой управления процессами")
        sys.exit(1)
    finally:
        logger.info("Бот завершил работу")


if __name__ == '__main__':
    main()
