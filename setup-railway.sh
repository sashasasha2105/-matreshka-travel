#!/bin/bash

# ========================================
# Автоматическая настройка Railway
# ========================================

echo "🚂 Настройка Railway для проекта Матрешка..."
echo ""

# Проверяем, установлен ли Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен!"
    echo "Установите его: brew install railway"
    exit 1
fi

echo "✅ Railway CLI установлен"
echo ""

# Проверяем авторизацию
if ! railway whoami &> /dev/null; then
    echo "🔐 Требуется авторизация в Railway..."
    echo "Выполните: railway login"
    echo ""
    read -p "Войти сейчас? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway login
    else
        echo "❌ Авторизация отменена"
        exit 1
    fi
fi

echo "✅ Авторизован в Railway"
echo ""

# Проверяем, связан ли проект
if ! railway status &> /dev/null; then
    echo "📁 Проект не связан с Railway"
    echo "Выполните: railway link"
    echo ""
    read -p "Связать проект сейчас? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway link
    else
        echo "❌ Связывание отменено"
        exit 1
    fi
fi

echo "✅ Проект связан с Railway"
echo ""

# Настраиваем переменные окружения
echo "🔧 Настройка переменных окружения..."
echo ""

# Токен бота
echo "Установка ANALYTICS_BOT_TOKEN..."
railway variables set ANALYTICS_BOT_TOKEN="7471119413:AAH8RHbU0dLSMSMRjgKS6yW4JoMBFp6ylFA"

# Chat ID
echo "Установка ANALYTICS_CHAT_ID..."
railway variables set ANALYTICS_CHAT_ID="1540847019"

# Включить аналитику
echo "Установка ANALYTICS_ENABLED..."
railway variables set ANALYTICS_ENABLED="true"

# Отключить debug в продакшене
echo "Установка ANALYTICS_DEBUG..."
railway variables set ANALYTICS_DEBUG="false"

echo ""
echo "✅ Переменные окружения настроены!"
echo ""

# Проверяем build command
echo "📦 Проверка build команды..."
echo "Убедитесь, что в настройках Railway добавлена команда:"
echo ""
echo "    bash generate-analytics-config.sh"
echo ""
echo "Эта команда создаст analytics.config.js из переменных окружения"
echo ""

# Показываем текущие переменные
echo "📊 Текущие переменные окружения:"
railway variables

echo ""
echo "✅ Настройка Railway завершена!"
echo ""
echo "🚀 Теперь можете задеплоить приложение:"
echo "   railway up"
echo ""
