/* ================================================
   ИСПРАВЛЕНИЯ ДЛЯ ПРИЛОЖЕНИЯ
   ================================================ */

// 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Глобальная функция разблокировки скролла
window.ensureScrollEnabled = function() {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.documentElement.style.overflow = 'auto';
    console.log('✅ Скролл разблокирован принудительно');
};

// Вызываем разблокировку при любом переключении страниц
document.addEventListener('DOMContentLoaded', function() {
    // Слушаем все клики по навигации
    const navButtons = document.querySelectorAll('.nav-item, .bottom-nav button');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(() => {
                window.ensureScrollEnabled();
            }, 100);
        });
    });
});

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
