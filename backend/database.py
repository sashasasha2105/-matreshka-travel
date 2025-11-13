#!/usr/bin/env python3
"""
Упрощенный модуль для работы с базой данных Supabase
Только для ленты путешествий
"""

import os
import logging
from typing import Optional, Dict, List, Any
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

logger = logging.getLogger(__name__)


class Database:
    """Класс для работы с Supabase - упрощенная версия"""

    def __init__(self):
        """Инициализация подключения к Supabase"""
        self.url: str = os.environ.get("SUPABASE_URL", "")
        self.key: str = os.environ.get("SUPABASE_KEY", "")

        if not self.url or not self.key:
            raise ValueError(
                "SUPABASE_URL и SUPABASE_KEY должны быть установлены в .env файле"
            )

        try:
            self.client: Client = create_client(self.url, self.key)
            logger.info("✅ Успешное подключение к Supabase")
        except Exception as e:
            logger.error(f"❌ Ошибка подключения к Supabase: {e}")
            raise

    # ==================== ПОЛЬЗОВАТЕЛИ ====================

    async def create_user(self, user_data: Dict[str, Any]) -> Optional[Dict]:
        """
        Создать нового пользователя

        Args:
            user_data: Словарь с данными пользователя
                - telegram_id: ID пользователя в Telegram
                - username: Username в Telegram
                - first_name: Имя пользователя
                - last_name: Фамилия пользователя

        Returns:
            Словарь с данными созданного пользователя или None
        """
        try:
            result = self.client.table('users').insert(user_data).execute()
            logger.info(f"✅ Пользователь создан: {user_data.get('telegram_id')}")
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"❌ Ошибка создания пользователя: {e}")
            return None

    async def get_user(self, telegram_id: int) -> Optional[Dict]:
        """
        Получить пользователя по Telegram ID

        Args:
            telegram_id: ID пользователя в Telegram

        Returns:
            Словарь с данными пользователя или None
        """
        try:
            result = self.client.table('users')\
                .select('*')\
                .eq('telegram_id', telegram_id)\
                .execute()

            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"❌ Ошибка получения пользователя: {e}")
            return None

    # ==================== ЛЕНТА ПУТЕШЕСТВИЙ ====================

    async def add_travel_photo(
        self,
        telegram_id: int,
        username: str,
        photo_url: str,
        description: str = None
    ) -> Optional[Dict]:
        """
        Добавить фотографию в ленту путешествий

        Args:
            telegram_id: ID пользователя в Telegram
            username: Username пользователя (@username)
            photo_url: URL фотографии в Supabase Storage
            description: Описание фотографии (опционально)

        Returns:
            Словарь с данными добавленной записи или None
        """
        try:
            data = {
                'telegram_id': telegram_id,
                'username': username,
                'photo_url': photo_url,
            }
            if description:
                data['description'] = description

            result = self.client.table('travel_feed').insert(data).execute()
            logger.info(f"✅ Фото добавлено в ленту: {telegram_id} - {photo_url}")
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"❌ Ошибка добавления фото в ленту: {e}")
            return None

    async def get_travel_feed(
        self,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict]:
        """
        Получить ленту путешествий (все фото)

        Args:
            limit: Максимальное количество записей
            offset: Смещение для пагинации

        Returns:
            Список записей из ленты
        """
        try:
            result = self.client.table('travel_feed')\
                .select('*')\
                .order('created_at', desc=True)\
                .range(offset, offset + limit - 1)\
                .execute()

            return result.data if result.data else []
        except Exception as e:
            logger.error(f"❌ Ошибка получения ленты: {e}")
            return []

    async def get_user_travel_photos(
        self,
        telegram_id: int,
        limit: int = 50
    ) -> List[Dict]:
        """
        Получить фотографии конкретного пользователя

        Args:
            telegram_id: ID пользователя в Telegram
            limit: Максимальное количество записей

        Returns:
            Список фотографий пользователя
        """
        try:
            result = self.client.table('travel_feed')\
                .select('*')\
                .eq('telegram_id', telegram_id)\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()

            return result.data if result.data else []
        except Exception as e:
            logger.error(f"❌ Ошибка получения фотографий пользователя: {e}")
            return []

    async def delete_travel_photo(self, photo_id: int) -> bool:
        """
        Удалить фотографию из ленты

        Args:
            photo_id: ID записи в таблице travel_feed

        Returns:
            True если удалено успешно, False иначе
        """
        try:
            result = self.client.table('travel_feed')\
                .delete()\
                .eq('id', photo_id)\
                .execute()

            logger.info(f"✅ Фото удалено из ленты: {photo_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Ошибка удаления фото: {e}")
            return False

    # ==================== SUPABASE STORAGE ====================

    def upload_photo_to_storage(
        self,
        file_path: str,
        bucket_name: str = 'travel-photos'
    ) -> Optional[str]:
        """
        Загрузить фотографию в Supabase Storage

        Args:
            file_path: Путь к файлу на диске
            bucket_name: Название bucket в Storage

        Returns:
            URL загруженной фотографии или None
        """
        try:
            # Генерируем уникальное имя файла
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            file_name = f"{timestamp}_{os.path.basename(file_path)}"

            # Читаем файл
            with open(file_path, 'rb') as f:
                file_data = f.read()

            # Загружаем в Storage
            result = self.client.storage.from_(bucket_name).upload(
                file_name,
                file_data,
                {'content-type': 'image/jpeg'}
            )

            # Получаем публичный URL
            public_url = self.client.storage.from_(bucket_name).get_public_url(file_name)

            logger.info(f"✅ Фото загружено в Storage: {file_name}")
            return public_url

        except Exception as e:
            logger.error(f"❌ Ошибка загрузки фото в Storage: {e}")
            return None

    def delete_photo_from_storage(
        self,
        photo_url: str,
        bucket_name: str = 'travel-photos'
    ) -> bool:
        """
        Удалить фотографию из Supabase Storage

        Args:
            photo_url: URL фотографии
            bucket_name: Название bucket в Storage

        Returns:
            True если удалено успешно, False иначе
        """
        try:
            # Извлекаем имя файла из URL
            file_name = photo_url.split('/')[-1]

            # Удаляем из Storage
            self.client.storage.from_(bucket_name).remove([file_name])

            logger.info(f"✅ Фото удалено из Storage: {file_name}")
            return True

        except Exception as e:
            logger.error(f"❌ Ошибка удаления фото из Storage: {e}")
            return False

    # ==================== СТАТИСТИКА ====================

    async def get_feed_stats(self) -> Dict[str, Any]:
        """
        Получить статистику ленты

        Returns:
            Словарь со статистикой
        """
        try:
            # Общее количество фото
            total = self.client.table('travel_feed').select('id', count='exact').execute()
            total_count = total.count if hasattr(total, 'count') else 0

            # Количество уникальных пользователей
            users = self.client.table('travel_feed')\
                .select('telegram_id')\
                .execute()

            unique_users = len(set(item['telegram_id'] for item in users.data)) if users.data else 0

            return {
                'total_photos': total_count,
                'unique_users': unique_users,
            }
        except Exception as e:
            logger.error(f"❌ Ошибка получения статистики: {e}")
            return {
                'total_photos': 0,
                'unique_users': 0,
            }

    def close(self):
        """Закрыть соединение с базой данных"""
        # Supabase client не требует явного закрытия соединения
        logger.info("🔒 Соединение с базой данных закрыто")


# Создаем глобальный экземпляр для использования в приложении
try:
    db = Database()
except Exception as e:
    logger.error(f"❌ Не удалось инициализировать базу данных: {e}")
    db = None
