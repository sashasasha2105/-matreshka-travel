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

// Hero секцию НЕ трогаем - оставляем как было!

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
