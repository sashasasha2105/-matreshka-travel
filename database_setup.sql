-- =====================================================
-- SQL скрипт для настройки базы данных Supabase
-- Проект: Matreshka Travel - Лента путешествий
-- =====================================================

-- 1. СОЗДАНИЕ ТАБЛИЦЫ ДЛЯ ЛЕНТЫ ПУТЕШЕСТВИЙ
-- =====================================================

CREATE TABLE IF NOT EXISTS travel_feed (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  username TEXT,
  photo_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. СОЗДАНИЕ ИНДЕКСОВ ДЛЯ ОПТИМИЗАЦИИ
-- =====================================================

-- Индекс для быстрого поиска по пользователю
CREATE INDEX IF NOT EXISTS idx_travel_feed_telegram_id
  ON travel_feed(telegram_id);

-- Индекс для сортировки по дате (новые первыми)
CREATE INDEX IF NOT EXISTS idx_travel_feed_created_at
  ON travel_feed(created_at DESC);

-- 3. ВКЛЮЧЕНИЕ ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE travel_feed ENABLE ROW LEVEL SECURITY;

-- 4. СОЗДАНИЕ ПОЛИТИК БЕЗОПАСНОСТИ
-- =====================================================

-- Политика: все могут читать ленту
DROP POLICY IF EXISTS "Все могут читать ленту" ON travel_feed;
CREATE POLICY "Все могут читать ленту"
  ON travel_feed
  FOR SELECT
  USING (true);

-- Политика: все могут добавлять фото
DROP POLICY IF EXISTS "Пользователи могут добавлять фото" ON travel_feed;
CREATE POLICY "Пользователи могут добавлять фото"
  ON travel_feed
  FOR INSERT
  WITH CHECK (true);

-- Политика: все могут удалять (можно ограничить позже)
DROP POLICY IF EXISTS "Пользователи могут удалять записи" ON travel_feed;
CREATE POLICY "Пользователи могут удалять записи"
  ON travel_feed
  FOR DELETE
  USING (true);

-- 5. КОММЕНТАРИИ К ТАБЛИЦЕ И ПОЛЯМ
-- =====================================================

COMMENT ON TABLE travel_feed IS 'Лента фотографий путешествий пользователей';
COMMENT ON COLUMN travel_feed.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN travel_feed.telegram_id IS 'ID пользователя в Telegram';
COMMENT ON COLUMN travel_feed.username IS 'Username пользователя (@username)';
COMMENT ON COLUMN travel_feed.photo_url IS 'URL фотографии в Supabase Storage';
COMMENT ON COLUMN travel_feed.description IS 'Описание фотографии (опционально)';
COMMENT ON COLUMN travel_feed.created_at IS 'Дата и время добавления записи';

-- =====================================================
-- ГОТОВО! Теперь настройте Storage:
--
-- 1. Создайте bucket: travel-photos (public)
-- 2. Настройте политики Storage (см. SUPABASE_SETUP.md)
-- =====================================================
