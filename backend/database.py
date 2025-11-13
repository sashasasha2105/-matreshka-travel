#!/usr/bin/env python3
"""
Модуль для работы с базой данных Supabase
"""

import os
import logging
from typing import Optional, Dict, List, Any
from supabase import create_client, Client
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

logger = logging.getLogger(__name__)


class Database:
    """Класс для работы с Supabase"""

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

    async def update_user(self, telegram_id: int, user_data: Dict[str, Any]) -> Optional[Dict]:
        """
        Обновить данные пользователя

        Args:
            telegram_id: ID пользователя в Telegram
            user_data: Словарь с новыми данными

        Returns:
            Словарь с обновленными данными или None
        """
        try:
            result = self.client.table('users')\
                .update(user_data)\
                .eq('telegram_id', telegram_id)\
                .execute()

            logger.info(f"✅ Пользователь обновлен: {telegram_id}")
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"❌ Ошибка обновления пользователя: {e}")
            return None

    # ==================== ПУТЕШЕСТВИЯ ====================

    async def create_trip(self, trip_data: Dict[str, Any]) -> Optional[Dict]:
        """
        Создать новое путешествие

        Args:
            trip_data: Словарь с данными путешествия
                - user_id: ID пользователя (из таблицы users)
                - region: Регион путешествия
                - start_date: Дата начала
                - end_date: Дата окончания
                - status: Статус (planned, active, completed)

        Returns:
            Словарь с данными созданного путешествия или None
        """
        try:
            result = self.client.table('trips').insert(trip_data).execute()
            logger.info(f"✅ Путешествие создано для пользователя: {trip_data.get('user_id')}")
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"❌ Ошибка создания путешествия: {e}")
            return None

    async def get_user_trips(self, user_id: int) -> List[Dict]:
        """
        Получить все путешествия пользователя

        Args:
            user_id: ID пользователя (из таблицы users)

        Returns:
            Список путешествий
        """
        try:
            result = self.client.table('trips')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .execute()

            return result.data if result.data else []
        except Exception as e:
            logger.error(f"❌ Ошибка получения путешествий: {e}")
            return []

    async def update_trip(self, trip_id: int, trip_data: Dict[str, Any]) -> Optional[Dict]:
        """
        Обновить данные путешествия

        Args:
            trip_id: ID путешествия
            trip_data: Словарь с новыми данными

        Returns:
            Словарь с обновленными данными или None
        """
        try:
            result = self.client.table('trips')\
                .update(trip_data)\
                .eq('id', trip_id)\
                .execute()

            logger.info(f"✅ Путешествие обновлено: {trip_id}")
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"❌ Ошибка обновления путешествия: {e}")
            return None

    # ==================== ФОТОГРАФИИ ====================

    async def create_photo(self, photo_data: Dict[str, Any]) -> Optional[Dict]:
        """
        Сохранить информацию о фотографии

        Args:
            photo_data: Словарь с данными фотографии
                - user_id: ID пользователя
                - photo_url: URL фотографии

        Returns:
            Словарь с данными сохраненной фотографии или None
        """
        try:
            # Оставляем только нужные поля
            clean_data = {
                'user_id': photo_data['user_id'],
                'photo_url': photo_data['photo_url']
            }
            result = self.client.table('photos').insert(clean_data).execute()
            logger.info(f"✅ Фотография сохранена для пользователя: {clean_data.get('user_id')}")
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"❌ Ошибка сохранения фотографии: {e}")
            return None

    async def get_user_photos(self, user_id: int, limit: int = 50) -> List[Dict]:
        """
        Получить фотографии пользователя

        Args:
            user_id: ID пользователя
            limit: Максимальное количество фотографий

        Returns:
            Список фотографий
        """
        try:
            result = self.client.table('photos')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()

            return result.data if result.data else []
        except Exception as e:
            logger.error(f"❌ Ошибка получения фотографий: {e}")
            return []

    # ==================== ОБЩИЕ МЕТОДЫ ====================

    async def execute_query(self, table: str, query_type: str, **kwargs) -> Any:
        """
        Выполнить произвольный запрос к базе данных

        Args:
            table: Название таблицы
            query_type: Тип запроса (select, insert, update, delete)
            **kwargs: Дополнительные параметры запроса

        Returns:
            Результат запроса
        """
        try:
            if query_type == 'select':
                result = self.client.table(table).select(kwargs.get('columns', '*')).execute()
            elif query_type == 'insert':
                result = self.client.table(table).insert(kwargs.get('data')).execute()
            elif query_type == 'update':
                result = self.client.table(table)\
                    .update(kwargs.get('data'))\
                    .eq(kwargs.get('column'), kwargs.get('value'))\
                    .execute()
            elif query_type == 'delete':
                result = self.client.table(table)\
                    .delete()\
                    .eq(kwargs.get('column'), kwargs.get('value'))\
                    .execute()
            else:
                logger.error(f"❌ Неизвестный тип запроса: {query_type}")
                return None

            return result.data if result.data else None
        except Exception as e:
            logger.error(f"❌ Ошибка выполнения запроса: {e}")
            return None

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
