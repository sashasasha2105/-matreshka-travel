#!/bin/bash

# 🎛️ Управление сервером Матрешка

PLIST_PATH="/Users/alexbrizkiy/Library/LaunchAgents/com.matreshka.server.plist"
SERVICE_NAME="com.matreshka.server"
PORT=8000

case "$1" in
    start)
        echo "🚀 Запуск сервера..."
        launchctl load "$PLIST_PATH" 2>/dev/null || echo "⚠️ Сервис уже запущен"
        sleep 3
        if curl -s http://localhost:$PORT > /dev/null; then
            echo "✅ Сервер запущен: http://localhost:$PORT"
        else
            echo "❌ Ошибка запуска сервера"
            exit 1
        fi
        ;;

    stop)
        echo "🛑 Остановка сервера..."
        launchctl unload "$PLIST_PATH" 2>/dev/null || echo "⚠️ Сервис уже остановлен"
        sleep 2
        if ! curl -s http://localhost:$PORT > /dev/null 2>&1; then
            echo "✅ Сервер остановлен"
        else
            echo "⚠️ Сервер все еще работает, принудительная остановка..."
            kill -9 $(lsof -ti:$PORT) 2>/dev/null
            echo "✅ Сервер остановлен принудительно"
        fi
        ;;

    restart)
        echo "🔄 Перезапуск сервера..."
        $0 stop
        sleep 2
        $0 start
        ;;

    status)
        echo "📊 Статус сервера:"
        if launchctl list | grep -q "$SERVICE_NAME"; then
            echo "  🟢 LaunchAgent: АКТИВЕН"
        else
            echo "  🔴 LaunchAgent: НЕАКТИВЕН"
        fi

        if curl -s http://localhost:$PORT > /dev/null 2>&1; then
            echo "  🟢 HTTP сервер: РАБОТАЕТ (http://localhost:$PORT)"
            PID=$(lsof -ti:$PORT)
            echo "  📍 PID: $PID"
        else
            echo "  🔴 HTTP сервер: НЕ ОТВЕЧАЕТ"
        fi

        if [ -f "server.log" ]; then
            echo ""
            echo "📋 Последние 5 строк лога:"
            tail -5 server.log
        fi
        ;;

    logs)
        echo "📋 Логи сервера (последние 20 строк):"
        tail -20 server.log 2>/dev/null || echo "Лог файл не найден"
        ;;

    enable-autostart)
        echo "⚙️ Включение автозапуска при загрузке системы..."
        launchctl load "$PLIST_PATH" 2>/dev/null
        echo "✅ Автозапуск включен"
        echo "   Сервер будет автоматически запускаться при включении Mac"
        ;;

    disable-autostart)
        echo "⚙️ Отключение автозапуска..."
        launchctl unload "$PLIST_PATH" 2>/dev/null
        echo "✅ Автозапуск отключен"
        echo "   Сервер НЕ будет запускаться автоматически"
        ;;

    *)
        echo "🎛️ Управление сервером Матрешка"
        echo ""
        echo "Использование: $0 {команда}"
        echo ""
        echo "Доступные команды:"
        echo "  start              - Запустить сервер"
        echo "  stop               - Остановить сервер"
        echo "  restart            - Перезапустить сервер"
        echo "  status             - Показать статус сервера"
        echo "  logs               - Показать логи сервера"
        echo "  enable-autostart   - Включить автозапуск при загрузке"
        echo "  disable-autostart  - Отключить автозапуск"
        echo ""
        echo "Примеры:"
        echo "  $0 start           # Запустить сервер"
        echo "  $0 status          # Проверить статус"
        echo "  $0 logs            # Посмотреть логи"
        exit 1
        ;;
esac
