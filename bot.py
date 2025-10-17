#!/usr/bin/env python3
"""
Telegram бот для Матрешка - путешествия по России
"""

import logging
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# API токен бота
BOT_TOKEN = "8284679572:AAE36-iXRiJgZr2Y526TKyAGA-z-IdD1SRg"

# URL вашего Web App (замените на ваш GitHub Pages URL)
WEB_APP_URL = "https://sashasasha2105.github.io/-matreshka-travel/"


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start - показывает приветствие и кнопку запуска Web App"""
    user = update.effective_user

    # Создаем кнопку для запуска Web App
    keyboard = [
        [InlineKeyboardButton(
            text="🪆 Открыть Матрешку",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    # Приветственное сообщение
    welcome_message = (
        f"Привет, {user.first_name}! 👋\n\n"
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


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик ошибок"""
    logger.error("Exception while handling an update:", exc_info=context.error)


def main() -> None:
    """Запуск бота"""
    logger.info("🪆 Запуск Telegram бота Матрешка...")

    # Создаем приложение
    application = Application.builder().token(BOT_TOKEN).build()

    # Регистрируем обработчики команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("about", about_command))

    # Регистрируем обработчик ошибок
    application.add_error_handler(error_handler)

    # Запускаем бота
    logger.info("✅ Бот успешно запущен и ожидает сообщений...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()
