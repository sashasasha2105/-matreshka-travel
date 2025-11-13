#!/usr/bin/env python3
"""
API для работы с лентой фотографий
"""

import asyncio
import logging
import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

# Добавляем путь к backend директории
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from database import db

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем Flask приложение
app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всех доменов


@app.route('/api/photos', methods=['GET'])
def get_photos():
    """Получить все фотографии для ленты"""
    try:
        # Получаем параметры из запроса
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)

        if not db:
            return jsonify({
                'error': 'База данных не инициализирована'
            }), 500

        # Получаем фотографии из БД с информацией о пользователях
        photos_result = db.client.table('photos')\
            .select('id, photo_url, created_at, users!inner(telegram_id, username, first_name, last_name)')\
            .order('created_at', desc=True)\
            .limit(limit)\
            .range(offset, offset + limit - 1)\
            .execute()

        photos = []
        if photos_result.data:
            for item in photos_result.data:
                user_info = item.get('users', {})
                photos.append({
                    'id': item['id'],
                    'photo_url': item['photo_url'],
                    'created_at': item['created_at'],
                    'user': {
                        'telegram_id': user_info.get('telegram_id'),
                        'username': user_info.get('username'),
                        'first_name': user_info.get('first_name'),
                        'last_name': user_info.get('last_name', '')
                    }
                })

        logger.info(f"✅ Получено {len(photos)} фотографий")

        return jsonify({
            'success': True,
            'photos': photos,
            'count': len(photos),
            'limit': limit,
            'offset': offset
        })

    except Exception as e:
        logger.error(f"❌ Ошибка получения фотографий: {e}", exc_info=True)
        return jsonify({
            'error': str(e),
            'success': False
        }), 500


@app.route('/api/photos/<int:photo_id>', methods=['GET'])
def get_photo(photo_id):
    """Получить конкретную фотографию по ID"""
    try:
        if not db:
            return jsonify({'error': 'База данных не инициализирована'}), 500

        result = db.client.table('photos')\
            .select('id, photo_url, created_at, users!inner(telegram_id, username, first_name, last_name)')\
            .eq('id', photo_id)\
            .execute()

        if not result.data:
            return jsonify({'error': 'Фотография не найдена'}), 404

        item = result.data[0]
        user_info = item.get('users', {})

        photo = {
            'id': item['id'],
            'photo_url': item['photo_url'],
            'created_at': item['created_at'],
            'user': {
                'telegram_id': user_info.get('telegram_id'),
                'username': user_info.get('username'),
                'first_name': user_info.get('first_name'),
                'last_name': user_info.get('last_name', '')
            }
        }

        return jsonify({
            'success': True,
            'photo': photo
        })

    except Exception as e:
        logger.error(f"❌ Ошибка получения фотографии: {e}", exc_info=True)
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/users/<int:telegram_id>/photos', methods=['GET'])
def get_user_photos(telegram_id):
    """Получить фотографии конкретного пользователя"""
    try:
        limit = request.args.get('limit', 50, type=int)

        if not db:
            return jsonify({'error': 'База данных не инициализирована'}), 500

        # Находим пользователя
        user_result = db.client.table('users')\
            .select('id')\
            .eq('telegram_id', telegram_id)\
            .execute()

        if not user_result.data:
            return jsonify({'error': 'Пользователь не найден'}), 404

        user_id = user_result.data[0]['id']

        # Получаем фотографии пользователя
        photos_result = db.client.table('photos')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()

        photos = photos_result.data if photos_result.data else []

        return jsonify({
            'success': True,
            'photos': photos,
            'count': len(photos)
        })

    except Exception as e:
        logger.error(f"❌ Ошибка получения фото пользователя: {e}", exc_info=True)
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка работоспособности API"""
    try:
        db_status = 'connected' if db else 'disconnected'

        return jsonify({
            'status': 'healthy',
            'database': db_status,
            'message': 'Feed API is running'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500


if __name__ == '__main__':
    logger.info("🚀 Запуск Feed API...")

    if not db:
        logger.error("❌ База данных не инициализирована!")
        logger.error("Проверьте переменные окружения SUPABASE_URL и SUPABASE_KEY")
    else:
        logger.info("✅ База данных подключена")

    # Запускаем сервер
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
