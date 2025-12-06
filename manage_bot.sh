#!/bin/bash

# 🤖 Управление Telegram ботом Матрешка

PLIST_PATH="/Users/alexbrizkiy/Library/LaunchAgents/com.matreshka.bot.plist"
SERVICE_NAME="com.matreshka.bot"

case "$1" in
    start)
        echo "🤖 Запуск бота..."
        launchctl load "$PLIST_PATH" 2>/dev/null || echo "⚠️ Бот уже запущен"
        sleep 3
        if ps aux | grep -v grep | grep "backend/bot.py" > /dev/null; then
            echo "✅ Бот запущен"
        else
            echo "❌ Ошибка запуска бота"
            exit 1
        fi
        ;;

    stop)
        echo "🛑 Остановка бота..."
        launchctl unload "$PLIST_PATH" 2>/dev/null || echo "⚠️ Бот уже остановлен"
        sleep 2
        pkill -f "backend/bot.py" 2>/dev/null
        echo "✅ Бот остановлен"
        ;;

    restart)
        echo "🔄 Перезапуск бота..."
        $0 stop
        sleep 2
        $0 start
        ;;

    status)
        echo "📊 Статус бота:"
        if launchctl list | grep -q "$SERVICE_NAME"; then
            echo "  🟢 LaunchAgent: АКТИВЕН"
        else
            echo "  🔴 LaunchAgent: НЕАКТИВЕН"
        fi

        if ps aux | grep -v grep | grep "backend/bot.py" > /dev/null 2>&1; then
            echo "  🟢 Telegram бот: РАБОТАЕТ"
            PID=$(ps aux | grep -v grep | grep "backend/bot.py" | awk '{print $2}')
            echo "  📍 PID: $PID"
        else
            echo "  🔴 Telegram бот: НЕ ЗАПУЩЕН"
        fi

        if [ -f "bot.log" ]; then
            echo ""
            echo "📋 Последние 5 строк лога:"
            tail -5 bot.log
        fi
        ;;

    logs)
        echo "📋 Логи бота (последние 30 строк):"
        tail -30 bot_stdout.log 2>/dev/null || echo "Лог файл не найден"
        ;;

    enable-autostart)
        echo "⚙️ Включение автозапуска бота..."
        launchctl load "$PLIST_PATH" 2>/dev/null
        echo "✅ Автозапуск бота включен"
        ;;

    disable-autostart)
        echo "⚙️ Отключение автозапуска бота..."
        launchctl unload "$PLIST_PATH" 2>/dev/null
        echo "✅ Автозапуск бота отключен"
        ;;

    *)
        echo "🤖 Управление Telegram ботом Матрешка (@traveleducationbot)"
        echo ""
        echo "Использование: $0 {команда}"
        echo ""
        echo "Доступные команды:"
        echo "  start              - Запустить бота"
        echo "  stop               - Остановить бота"
        echo "  restart            - Перезапустить бота"
        echo "  status             - Показать статус бота"
        echo "  logs               - Показать логи бота"
        echo "  enable-autostart   - Включить автозапуск"
        echo "  disable-autostart  - Отключить автозапуск"
        exit 1
        ;;
esac
