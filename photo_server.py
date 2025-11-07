"""
🚀 ПРОСТЕЙШИЙ СЕРВЕР ДЛЯ ФОТОК В ЛЕНТЕ ПУТЕШЕСТВИЙ
Рассчитан на 10 человек × 2 фотки = 20 фоток максимум
Хранит фотки прямо на диске в папке travel_photos/
"""

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
import uuid
from datetime import datetime
from PIL import Image
import io
import json
import requests
import threading

app = Flask(__name__)
CORS(app)  # Разрешаем запросы с любых доменов

# Папка для хранения фоток
PHOTOS_DIR = os.path.join(os.path.dirname(__file__), 'travel_photos')
METADATA_FILE = os.path.join(PHOTOS_DIR, 'metadata.json')

# Создаем папку если её нет
os.makedirs(PHOTOS_DIR, exist_ok=True)

# Максимальный размер фотки (2MB)
MAX_FILE_SIZE = 2 * 1024 * 1024

# Telegram бот для аналитики
ANALYTICS_BOT_TOKEN = "7471119413:AAH8RHbU0dLSMSMRjgKS6yW4JoMBFp6ylFA"
ANALYTICS_CHAT_ID = "1540847019"

def load_metadata():
    """Загружает метаданные всех фоток"""
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_metadata(metadata):
    """Сохраняет метаданные"""
    with open(METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

def optimize_image(image_data, max_size=(1200, 1200), quality=85):
    """Оптимизирует изображение для быстрой загрузки"""
    img = Image.open(io.BytesIO(image_data))

    # Конвертируем в RGB если нужно
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background

    # Resize если больше максимального размера
    img.thumbnail(max_size, Image.Resampling.LANCZOS)

    # Сохраняем в JPEG с оптимизацией
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=quality, optimize=True)
    output.seek(0)

    return output.getvalue()

def send_photo_to_telegram(filepath, caption, photo_type='travel'):
    """
    Отправляет фото в Telegram бот для аналитики
    Запускается в отдельном потоке чтобы не блокировать загрузку
    """
    def send():
        try:
            url = f"https://api.telegram.org/bot{ANALYTICS_BOT_TOKEN}/sendPhoto"

            with open(filepath, 'rb') as photo_file:
                files = {'photo': photo_file}
                data = {
                    'chat_id': ANALYTICS_CHAT_ID,
                    'caption': caption,
                    'parse_mode': 'HTML'
                }

                response = requests.post(url, files=files, data=data, timeout=10)

                if response.status_code == 200:
                    print(f"✅ Фото отправлено в Telegram: {photo_type}")
                else:
                    print(f"⚠️ Ошибка отправки в Telegram: {response.status_code}")

        except Exception as e:
            print(f"❌ Ошибка отправки фото в Telegram: {e}")

    # Запускаем в отдельном потоке чтобы не блокировать
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()

@app.route('/api/upload-photo', methods=['POST'])
def upload_photo():
    """
    Загрузка фотографии на сервер
    Принимает: multipart/form-data с файлом 'photo' и метаданными
    Возвращает: URL фотографии
    """
    try:
        if 'photo' not in request.files:
            return jsonify({'error': 'Нет файла в запросе'}), 400

        file = request.files['photo']

        if file.filename == '':
            return jsonify({'error': 'Файл не выбран'}), 400

        # Читаем файл
        file_data = file.read()

        if len(file_data) > MAX_FILE_SIZE:
            return jsonify({'error': 'Файл слишком большой (макс 2MB)'}), 400

        # Оптимизируем изображение
        optimized_data = optimize_image(file_data)

        # Генерируем уникальное имя файла
        photo_id = str(uuid.uuid4())
        filename = f"{photo_id}.jpg"
        filepath = os.path.join(PHOTOS_DIR, filename)

        # Сохраняем файл
        with open(filepath, 'wb') as f:
            f.write(optimized_data)

        # Сохраняем метаданные (все параметры опциональные для совместимости)
        metadata = load_metadata()
        user_id = request.form.get('user_id', 'неизвестный')
        travel_id = request.form.get('travel_id', '')
        photo_type = request.form.get('photo_type', 'travel')  # 'travel' или 'quest' (по умолчанию travel)
        quest_name = request.form.get('quest_name', '')  # Опционально

        metadata[photo_id] = {
            'filename': filename,
            'uploaded_at': datetime.now().isoformat(),
            'original_filename': file.filename,
            'size': len(optimized_data),
            'travel_id': travel_id,
            'user_id': user_id,
            'photo_type': photo_type
        }
        save_metadata(metadata)

        # Отправляем фото в Telegram бот (не блокирует загрузку при ошибке)
        try:
            timestamp = datetime.now().strftime("%d.%m.%Y, %H:%M:%S")
            if photo_type == 'quest':
                caption = f"""
📸 <b>НОВОЕ ФОТО ПРОХОЖДЕНИЯ КВЕСТА</b>

👤 <b>Пользователь:</b> {user_id}
🎯 <b>Квест:</b> {quest_name or 'не указан'}
📁 <b>ID фото:</b> <code>{photo_id}</code>
📊 <b>Размер:</b> {len(optimized_data) // 1024} KB
⏰ <b>Время:</b> {timestamp}
""".strip()
            else:
                caption = f"""
📸 <b>НОВОЕ ФОТО В ЛЕНТЕ ПУТЕШЕСТВИЙ</b>

👤 <b>Пользователь:</b> {user_id}
🗺️ <b>ID путешествия:</b> {travel_id or 'не указан'}
📁 <b>ID фото:</b> <code>{photo_id}</code>
📊 <b>Размер:</b> {len(optimized_data) // 1024} KB
⏰ <b>Время:</b> {timestamp}
""".strip()

            send_photo_to_telegram(filepath, caption, photo_type)
        except Exception as telegram_error:
            # НЕ падаем если Telegram не работает - фото уже сохранено!
            print(f"⚠️ Не удалось отправить в Telegram (но фото сохранено): {telegram_error}")

        # Возвращаем URL фотографии
        photo_url = f"/api/photo/{photo_id}"

        print(f"✅ Фотография загружена: {photo_id} ({len(optimized_data)} bytes), тип: {photo_type}")

        return jsonify({
            'success': True,
            'photo_id': photo_id,
            'photo_url': photo_url,
            'size': len(optimized_data)
        })

    except Exception as e:
        print(f"❌ Ошибка загрузки фотографии: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/photo/<photo_id>', methods=['GET'])
def get_photo(photo_id):
    """
    Получение фотографии по ID
    Возвращает: JPEG файл
    """
    try:
        metadata = load_metadata()

        if photo_id not in metadata:
            return jsonify({'error': 'Фотография не найдена'}), 404

        filename = metadata[photo_id]['filename']
        filepath = os.path.join(PHOTOS_DIR, filename)

        if not os.path.exists(filepath):
            return jsonify({'error': 'Файл не найден на диске'}), 404

        return send_file(
            filepath,
            mimetype='image/jpeg',
            as_attachment=False,
            download_name=filename
        )

    except Exception as e:
        print(f"❌ Ошибка получения фотографии: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/travel-photos', methods=['GET'])
def get_travel_photos():
    """
    Получение списка всех фотографий с метаданными
    Возвращает: JSON с массивом фотографий
    """
    try:
        metadata = load_metadata()

        photos = []
        for photo_id, data in metadata.items():
            photos.append({
                'photo_id': photo_id,
                'photo_url': f"/api/photo/{photo_id}",
                'uploaded_at': data['uploaded_at'],
                'size': data['size'],
                'travel_id': data.get('travel_id', ''),
                'user_id': data.get('user_id', '')
            })

        return jsonify({
            'success': True,
            'photos': photos,
            'total': len(photos)
        })

    except Exception as e:
        print(f"❌ Ошибка получения списка фотографий: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete-photo/<photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    """
    Удаление фотографии
    """
    try:
        metadata = load_metadata()

        if photo_id not in metadata:
            return jsonify({'error': 'Фотография не найдена'}), 404

        # Удаляем файл
        filename = metadata[photo_id]['filename']
        filepath = os.path.join(PHOTOS_DIR, filename)

        if os.path.exists(filepath):
            os.remove(filepath)

        # Удаляем из метаданных
        del metadata[photo_id]
        save_metadata(metadata)

        print(f"✅ Фотография удалена: {photo_id}")

        return jsonify({'success': True})

    except Exception as e:
        print(f"❌ Ошибка удаления фотографии: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка работоспособности сервера"""
    metadata = load_metadata()
    return jsonify({
        'status': 'ok',
        'photos_count': len(metadata),
        'photos_dir': PHOTOS_DIR,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))

    print("🚀 Запуск сервера для фотографий...")
    print(f"📁 Папка для фотографий: {PHOTOS_DIR}")
    print(f"🌐 Сервер доступен на порту: {port}")

    app.run(
        host='0.0.0.0',
        port=port,
        debug=False  # Отключаем debug в продакшн
    )
