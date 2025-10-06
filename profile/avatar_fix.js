/**
 * Чистовая система работы с аватаркой
 * Автоматически находит и настраивает загрузку аватарки
 */

console.log('✨ Инициализация системы аватарки');

// Ищем и настраиваем аватарку каждые 100мс
setInterval(function() {
    const avatarInput = document.querySelector('#avatarUpload');
    const avatarImg = document.querySelector('#currentAvatar');

    if (avatarInput && avatarImg && !avatarInput.hasAttribute('data-avatar-ready')) {
        console.log('✅ Настраиваем загрузку аватарки');

        // Помечаем что уже обработали
        avatarInput.setAttribute('data-avatar-ready', 'true');

        // Убираем старые обработчики
        avatarInput.onchange = null;

        // Новый обработчик загрузки
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];

            if (!file) return;

            if (!file.type.startsWith('image/')) {
                console.warn('Выбран не файл изображения');
                return;
            }

            try {
                // Очищаем старое изображение
                avatarImg.src = '';
                avatarImg.removeAttribute('src');

                // Создаем URL для нового изображения
                const imageUrl = URL.createObjectURL(file);

                // Применяем стили для корректного отображения
                avatarImg.style.cssText = `
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    width: 120px !important;
                    height: 120px !important;
                    object-fit: cover !important;
                    border: 2px solid rgba(255, 204, 0, 0.3) !important;
                    border-radius: 20px !important;
                    transition: all 0.3s ease !important;
                    max-width: none !important;
                    max-height: none !important;
                `;

                // Устанавливаем новое изображение
                avatarImg.src = imageUrl;
                avatarImg.setAttribute('src', imageUrl);

                // Обновляем все аватарки на странице
                const allAvatars = document.querySelectorAll('.profile-avatar, .current-avatar, [class*="avatar"]');
                allAvatars.forEach((avatar) => {
                    if (avatar.tagName === 'IMG' && avatar !== avatarImg) {
                        avatar.src = imageUrl;
                        avatar.style.transition = 'all 0.3s ease';
                    }
                });

                // Сохраняем для использования при сохранении профиля
                window.selectedAvatarData = imageUrl;
                window.selectedAvatarFile = file;

                console.log('✅ Аватарка успешно загружена');

            } catch (error) {
                console.error('Ошибка загрузки аватарки:', error);
            }
        });

        console.log('✅ Система аватарки готова');
    }
}, 100);