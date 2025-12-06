#!/bin/bash

# 🤖 Автозапуск Telegram бота Матрешка

PROJECT_DIR="/Users/alexbrizkiy/PycharmProjects/PythonProject20"
LOG_FILE="$PROJECT_DIR/bot.log"

cd "$PROJECT_DIR" || exit 1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🤖 Запуск Telegram бота..." >> "$LOG_FILE"

# Запускаем бота
exec python3 backend/bot.py
