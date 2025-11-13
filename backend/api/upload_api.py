"""
API для загрузки фотографий на сервер
Поддерживает множество вариантов хранения
"""

import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image
import io

# Создаем Flask приложение
app = Flask(__name__)

# ====================================
# КОНФИГУРАЦИЯ
# ====================================

class Config:
    """Конфигурация приложения"""

    # Папки для хранения
    UPLOAD_FOLDER = Path('uploads')
    THUMBNAILS_FOLDER = Path('uploads/thumbs')

    # Максимальный размер файла (16 MB)
    MAX_FILE_SIZE = 16 * 1024 * 1024

    # Разрешенные форматы
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

    # Размеры для ресайза
    MAX_WIDTH = 1920
    MAX_HEIGHT = 1080
    THUMBNAIL_SIZE = (400, 400)

    # Качество сжатия
    JPEG_QUALITY = 85
    WEBP_QUALITY = 85

    # База данных (JSON файл для простоты)
    DATABASE_FILE = Path('photo_database.json')


# Создаем папки если не существуют
Config.UPLOAD_FOLDER.mkdir(exist_ok=True)
Config.THUMBNAILS_FOLDER.mkdir(exist_ok=True)

# Инициализируем базу данных
if not Config.DATABASE_FILE.exists():
    Config.DATABASE_FILE.write_text('{"photos": []}')


# ====================================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
# ====================================

def allowed_file(filename):
    """Проверка разрешенного формата файла"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS


def generate_filename(original_filename):
    """Генерация уникального имени файла"""
    ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'jpg'
    unique_id = uuid.uuid4().hex
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return f"{timestamp}_{unique_id}.{ext}"


def optimize_image(image, max_width=None, max_height=None, quality=85):
    """
    Оптимизация изображения
    - Ресайз если больше лимитов
    - Конвертация в RGB (для JPEG)
    - Сжатие
    """
    # Конвертируем в RGB если нужно
    if image.mode in ('RGBA', 'LA', 'P'):
        # Создаем белый фон для прозрачных изображений
        background = Image.new('RGB', image.size, (255, 255, 255))
        if image.mode == 'P':
            image = image.convert('RGBA')
        background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
        image = background
    elif image.mode != 'RGB':
        image = image.convert('RGB')

    # Ресайз если нужно
    if max_width and max_height:
        image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

    return image


def create_thumbnail(image, size=(400, 400)):
    """Создание миниатюры"""
    thumb = image.copy()
    thumb.thumbnail(size, Image.Resampling.LANCZOS)
    return thumb


def save_to_database(photo_data):
    """Сохранение метаданных в JSON базу"""
    try:
        with open(Config.DATABASE_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)

        db['photos'].append(photo_data)

        with open(Config.DATABASE_FILE, 'w', encoding='utf-8') as f:
            json.dump(db, f, ensure_ascii=False, indent=2)

        return True
    except Exception as e:
        print(f"Error saving to database: {e}")
        return False


# ====================================
# API ENDPOINTS
# ====================================

@app.route('/api/upload', methods=['POST'])
def upload_photo():
    """
    Загрузка фотографии

    Form data:
        - photo: файл изображения
        - metadata: JSON с метаданными (optional)

    Returns:
        {
            "success": true,
            "id": "unique-id",
            "filename": "filename.jpg",
            "url": "/uploads/filename.jpg",
            "thumbnailUrl": "/uploads/thumbs/filename.jpg",
            "width": 1920,
            "height": 1080,
            "size": 234567
        }
    """
    try:
        # Проверяем наличие файла
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo provided'}), 400

        file = request.files['photo']

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400

        # Получаем метаданные если есть
        metadata = {}
        if 'metadata' in request.form:
            try:
                metadata = json.loads(request.form['metadata'])
            except json.JSONDecodeError:
                pass

        # Загружаем изображение
        image = Image.open(file.stream)
        original_width, original_height = image.size

        # Оптимизируем
        optimized_image = optimize_image(
            image,
            Config.MAX_WIDTH,
            Config.MAX_HEIGHT,
            Config.JPEG_QUALITY
        )

        # Создаем миниатюру
        thumbnail = create_thumbnail(image, Config.THUMBNAIL_SIZE)

        # Генерируем уникальное имя
        filename = generate_filename(file.filename)

        # Сохраняем оптимизированное изображение
        output_path = Config.UPLOAD_FOLDER / filename
        optimized_image.save(
            output_path,
            format='JPEG',
            quality=Config.JPEG_QUALITY,
            optimize=True
        )

        # Сохраняем миниатюру
        thumbnail_path = Config.THUMBNAILS_FOLDER / filename
        thumbnail.save(
            thumbnail_path,
            format='JPEG',
            quality=Config.JPEG_QUALITY,
            optimize=True
        )

        # Получаем размер файла
        file_size = output_path.stat().st_size

        # Сохраняем в базу данных
        photo_id = uuid.uuid4().hex
        photo_data = {
            'id': photo_id,
            'filename': filename,
            'original_filename': file.filename,
            'width': optimized_image.width,
            'height': optimized_image.height,
            'original_width': original_width,
            'original_height': original_height,
            'size': file_size,
            'uploaded_at': datetime.now().isoformat(),
            'metadata': metadata
        }

        save_to_database(photo_data)

        # Возвращаем результат
        return jsonify({
            'success': True,
            'id': photo_id,
            'filename': filename,
            'url': f'/uploads/{filename}',
            'thumbnailUrl': f'/uploads/thumbs/{filename}',
            'width': optimized_image.width,
            'height': optimized_image.height,
            'size': file_size
        })

    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/upload/batch', methods=['POST'])
def upload_batch():
    """
    Пакетная загрузка фотографий

    Form data:
        - photos[]: массив файлов
        - metadata: JSON с метаданными (optional)

    Returns:
        {
            "success": true,
            "uploaded": 5,
            "failed": 0,
            "photos": [...]
        }
    """
    try:
        files = request.files.getlist('photos[]')

        if not files:
            return jsonify({'error': 'No photos provided'}), 400

        # Получаем метаданные
        metadata = {}
        if 'metadata' in request.form:
            try:
                metadata = json.loads(request.form['metadata'])
            except json.JSONDecodeError:
                pass

        results = []
        uploaded = 0
        failed = 0

        for file in files:
            try:
                # Загружаем как обычно
                image = Image.open(file.stream)
                optimized_image = optimize_image(image, Config.MAX_WIDTH, Config.MAX_HEIGHT)
                thumbnail = create_thumbnail(image, Config.THUMBNAIL_SIZE)

                filename = generate_filename(file.filename)

                output_path = Config.UPLOAD_FOLDER / filename
                thumbnail_path = Config.THUMBNAILS_FOLDER / filename

                optimized_image.save(output_path, format='JPEG', quality=Config.JPEG_QUALITY, optimize=True)
                thumbnail.save(thumbnail_path, format='JPEG', quality=Config.JPEG_QUALITY, optimize=True)

                photo_id = uuid.uuid4().hex
                photo_data = {
                    'id': photo_id,
                    'filename': filename,
                    'url': f'/uploads/{filename}',
                    'thumbnailUrl': f'/uploads/thumbs/{filename}',
                    'width': optimized_image.width,
                    'height': optimized_image.height
                }

                save_to_database({**photo_data, 'metadata': metadata})

                results.append(photo_data)
                uploaded += 1

            except Exception as e:
                print(f"Error uploading {file.filename}: {e}")
                failed += 1

        return jsonify({
            'success': True,
            'uploaded': uploaded,
            'failed': failed,
            'photos': results
        })

    except Exception as e:
        print(f"Batch upload error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    """Отдача загруженных файлов"""
    return send_from_directory(Config.UPLOAD_FOLDER, filename)


@app.route('/uploads/thumbs/<path:filename>')
def serve_thumbnail(filename):
    """Отдача миниатюр"""
    return send_from_directory(Config.THUMBNAILS_FOLDER, filename)


@app.route('/api/photos', methods=['GET'])
def get_photos():
    """
    Получение списка всех фотографий

    Query params:
        - limit: количество (default: 50)
        - offset: смещение (default: 0)

    Returns:
        {
            "photos": [...],
            "total": 123,
            "limit": 50,
            "offset": 0
        }
    """
    try:
        with open(Config.DATABASE_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)

        photos = db['photos']

        # Пагинация
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))

        paginated = photos[offset:offset + limit]

        return jsonify({
            'photos': paginated,
            'total': len(photos),
            'limit': limit,
            'offset': offset
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/photo/<photo_id>', methods=['GET'])
def get_photo(photo_id):
    """Получение информации о конкретной фотографии"""
    try:
        with open(Config.DATABASE_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)

        photo = next((p for p in db['photos'] if p['id'] == photo_id), None)

        if not photo:
            return jsonify({'error': 'Photo not found'}), 404

        return jsonify(photo)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/photo/<photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    """Удаление фотографии"""
    try:
        with open(Config.DATABASE_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)

        photo = next((p for p in db['photos'] if p['id'] == photo_id), None)

        if not photo:
            return jsonify({'error': 'Photo not found'}), 404

        # Удаляем файлы
        file_path = Config.UPLOAD_FOLDER / photo['filename']
        thumb_path = Config.THUMBNAILS_FOLDER / photo['filename']

        if file_path.exists():
            file_path.unlink()
        if thumb_path.exists():
            thumb_path.unlink()

        # Удаляем из базы
        db['photos'] = [p for p in db['photos'] if p['id'] != photo_id]

        with open(Config.DATABASE_FILE, 'w', encoding='utf-8') as f:
            json.dump(db, f, ensure_ascii=False, indent=2)

        return jsonify({'success': True})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Статистика хранилища"""
    try:
        with open(Config.DATABASE_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)

        total_photos = len(db['photos'])
        total_size = sum(p.get('size', 0) for p in db['photos'])

        return jsonify({
            'total_photos': total_photos,
            'total_size_bytes': total_size,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'upload_folder': str(Config.UPLOAD_FOLDER),
            'thumbnails_folder': str(Config.THUMBNAILS_FOLDER)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ====================================
# CORS для фронтенда
# ====================================

@app.after_request
def after_request(response):
    """Добавляем CORS headers"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


# ====================================
# ЗАПУСК
# ====================================

if __name__ == '__main__':
    print("="*50)
    print("🚀 Upload API Server")
    print("="*50)
    print(f"📁 Upload folder: {Config.UPLOAD_FOLDER.absolute()}")
    print(f"📁 Thumbnails folder: {Config.THUMBNAILS_FOLDER.absolute()}")
    print(f"📊 Database: {Config.DATABASE_FILE.absolute()}")
    print("="*50)

    # Запускаем сервер
    app.run(
        host='0.0.0.0',
        port=5001,  # Используем другой порт чтобы не конфликтовать с bot.py
        debug=True
    )
