#!/bin/bash

echo "🚀 Деплой Photo Server на Railway"
echo "=================================="

# Проверяем установлен ли Railway CLI
if ! command -v railway &> /dev/null
then
    echo "❌ Railway CLI не установлен!"
    echo ""
    echo "Установи Railway CLI:"
    echo "npm i -g @railway/cli"
    echo ""
    echo "Или используй веб-интерфейс:"
    echo "1. Зайди на https://railway.app"
    echo "2. Открой проект 'matreshka-photo-server-production'"
    echo "3. Нажми 'Settings' → 'Redeploy'"
    exit 1
fi

echo "✅ Railway CLI найден"
echo ""
echo "Деплоим обновленный photo_server.py..."
echo ""

# Деплой на Railway
railway up --service matreshka-photo-server-production

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Деплой успешен!"
    echo "🎉 Фото теперь будут отправляться в Telegram бот!"
    echo ""
    echo "Проверь логи:"
    echo "railway logs --service matreshka-photo-server-production"
else
    echo ""
    echo "❌ Ошибка деплоя!"
    echo ""
    echo "Попробуй вручную:"
    echo "1. https://railway.app"
    echo "2. Проект: matreshka-photo-server-production"
    echo "3. Settings → Redeploy"
fi
