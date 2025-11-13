#!/usr/bin/env python3
"""
Упрощенное API для работы с лентой путешествий
Работает с новой таблицей travel_feed
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


def async_route(f):
    """Декоратор для асинхронных роутов"""
    def wrapper(*args, **kwargs):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(f(*args, **kwargs))
        finally:
            loop.close()
    wrapper.__name__ = f.__name__
    return wrapper


@app.route('/api/feed', methods=['GET'])
@async_route
async def get_feed():
    """Получить ленту путешествий"""
    try:
        # Получаем параметры из запроса
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)

        if not db:
            return jsonify({
                'error': 'База данных не инициализирована'
            }), 500

        # Получаем ленту из БД
        photos = await db.get_travel_feed(limit=limit, offset=offset)

        logger.info(f"✅ Получено {len(photos)} фотографий из ленты")

        return jsonify({
            'success': True,
            'photos': photos,
            'count': len(photos),
            'limit': limit,
            'offset': offset
        })

    except Exception as e:
        logger.error(f"❌ Ошибка получения ленты: {e}", exc_info=True)
        return jsonify({
            'error': str(e),
            'success': False
        }), 500


@app.route('/api/feed/<int:photo_id>', methods=['GET'])
def get_feed_photo(photo_id):
    """Получить конкретную фотографию по ID"""
    try:
        if not db:
            return jsonify({'error': 'База данных не инициализирована'}), 500

        # Получаем фото напрямую из travel_feed
        result = db.client.table('travel_feed')\
            .select('*')\
            .eq('id', photo_id)\
            .execute()

        if not result.data:
            return jsonify({'error': 'Фотография не найдена'}), 404

        photo = result.data[0]

        return jsonify({
            'success': True,
            'photo': photo
        })

    except Exception as e:
        logger.error(f"❌ Ошибка получения фотографии: {e}", exc_info=True)
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/feed/<int:photo_id>', methods=['DELETE'])
@async_route
async def delete_feed_photo(photo_id):
    """Удалить фотографию из ленты"""
    try:
        if not db:
            return jsonify({'error': 'База данных не инициализирована'}), 500

        # Получаем информацию о фото перед удалением
        result = db.client.table('travel_feed')\
            .select('photo_url')\
            .eq('id', photo_id)\
            .execute()

        if not result.data:
            return jsonify({'error': 'Фотография не найдена'}), 404

        photo_url = result.data[0]['photo_url']

        # Удаляем запись из БД
        success = await db.delete_travel_photo(photo_id)

        if success:
            # Удаляем фото из Storage
            db.delete_photo_from_storage(photo_url)

            return jsonify({
                'success': True,
                'message': 'Фотография удалена'
            })
        else:
            return jsonify({
                'error': 'Не удалось удалить фотографию',
                'success': False
            }), 500

    except Exception as e:
        logger.error(f"❌ Ошибка удаления фотографии: {e}", exc_info=True)
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/users/<int:telegram_id>/photos', methods=['GET'])
@async_route
async def get_user_photos(telegram_id):
    """Получить фотографии конкретного пользователя"""
    try:
        limit = request.args.get('limit', 50, type=int)

        if not db:
            return jsonify({'error': 'База данных не инициализирована'}), 500

        # Получаем фотографии пользователя
        photos = await db.get_user_travel_photos(telegram_id=telegram_id, limit=limit)

        return jsonify({
            'success': True,
            'photos': photos,
            'count': len(photos)
        })

    except Exception as e:
        logger.error(f"❌ Ошибка получения фото пользователя: {e}", exc_info=True)
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/stats', methods=['GET'])
@async_route
async def get_stats():
    """Получить статистику ленты"""
    try:
        if not db:
            return jsonify({'error': 'База данных не инициализирована'}), 500

        stats = await db.get_feed_stats()

        return jsonify({
            'success': True,
            'stats': stats
        })

    except Exception as e:
        logger.error(f"❌ Ошибка получения статистики: {e}", exc_info=True)
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка работоспособности API"""
    try:
        db_status = 'connected' if db else 'disconnected'

        return jsonify({
            'status': 'healthy',
            'database': db_status,
            'message': 'Travel Feed API is running',
            'version': '2.0 (Simplified)'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500


if __name__ == '__main__':
    logger.info("🚀 Запуск Travel Feed API v2.0...")

    if not db:
        logger.error("❌ База данных не инициализирована!")
        logger.error("Проверьте переменные окружения SUPABASE_URL и SUPABASE_KEY")
    else:
        logger.info("✅ База данных подключена")
        logger.info("📊 Работаю с таблицей: travel_feed")

    # Запускаем сервер
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
