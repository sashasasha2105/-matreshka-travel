/* ================================================
   ИСПРАВЛЕНИЯ ДЛЯ ПРИЛОЖЕНИЯ
   ================================================ */

// ========================================
// ФУНКЦИЯ ПОКАЗА ГЛАВНОЙ СТРАНИЦЫ
// ========================================
function showMainSection() {
    console.log('🏠 Переход на главную страницу');

    // Скрываем все секции
    document.getElementById('mainSection').style.display = 'block';
    document.getElementById('regionDetails').style.display = 'none';
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('cartSection').style.display = 'none';
    document.getElementById('questsSection').style.display = 'none';

    // Обновляем навигацию
    updateBottomNav('main');

    // Скроллим наверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// УЛУЧШЕННАЯ ЛЕНТА ПУТЕШЕСТВИЙ В СТИЛЕ VK
// ========================================
(function improveTravelFeed() {
    // Ждем загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const feedSection = document.querySelector('.travel-feed-section');
        if (!feedSection) return;

        // Уменьшаем hero секцию чтобы было больше места для ленты
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.minHeight = '400px'; // Было больше
        }

        // Улучшаем стили ленты
        const feed = document.querySelector('.travel-feed');
        if (feed) {
            feed.style.maxWidth = '680px';
            feed.style.margin = '0 auto';
            feed.style.padding = '0';
        }
    }
})();

// ========================================
// ИСПРАВЛЕНИЕ МОДАЛКИ ДОБАВЛЕНИЯ ФОТО
// ========================================
(function fixPhotoUpload() {
    // Переопределяем метод closeModal чтобы корректно очищать DOM
    const originalClose = MatryoshkaProfile.prototype.closeModal;

    if (MatryoshkaProfile.prototype && originalClose) {
        MatryoshkaProfile.prototype.closeModal = function(modal) {
            if (!modal) return;

            // Плавно скрываем
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.95)';

            setTimeout(() => {
                // Удаляем из DOM
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }

                // Очищаем все временные данные
                if (window.processedPhotosData) {
                    delete window.processedPhotosData;
                }

                // Восстанавливаем скролл body
                document.body.style.overflow = '';

                console.log('✅ Модалка корректно закрыта');
            }, 300);
        };
    }
})();

console.log('✅ Fixes.js загружен');
