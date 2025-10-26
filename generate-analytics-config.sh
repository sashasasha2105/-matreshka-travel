#!/bin/bash

# ========================================
# Генерация конфига аналитики для Railway
# ========================================
# Этот скрипт создаёт analytics.config.js из переменных окружения

echo "Генерация analytics.config.js..."

# Получаем переменные из окружения или используем значения по умолчанию
BOT_TOKEN="${ANALYTICS_BOT_TOKEN:-7471119413:AAH8RHbU0dLSMSMRjgKS6yW4JoMBFp6ylFA}"
CHAT_ID="${ANALYTICS_CHAT_ID:-1540847019}"
ENABLED="${ANALYTICS_ENABLED:-true}"
DEBUG="${ANALYTICS_DEBUG:-false}"

# Создаём файл конфигурации
cat > analytics.config.js << EOF
// ========================================
// КОНФИГУРАЦИЯ АНАЛИТИЧЕСКОГО БОТА
// ========================================
// Автоматически сгенерирован из переменных окружения Railway

window.ANALYTICS_CONFIG = {
    BOT_TOKEN: '${BOT_TOKEN}',
    CHAT_ID: '${CHAT_ID}',
    ENABLED: ${ENABLED},
    DEBUG: ${DEBUG}
};
EOF

echo "✅ analytics.config.js успешно создан!"
