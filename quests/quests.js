/**
 * Система игровых заданий Матрешка
 * Позволяет пользователям фотографировать достопримечательности и получать бонусы
 */

(function() {
    'use strict';

    // Хранилище заданий
    const QUESTS_STORAGE_KEY = 'matreshka_quests';
    const COMPLETED_QUESTS_KEY = 'matreshka_completed_quests';

    // Класс управления заданиями
    class QuestsSystem {
        constructor() {
            this.quests = [];
            this.completedQuests = this.loadCompletedQuests();
            this.currentQuest = null;
            this.init();
        }

        init() {
            console.log('🎯 Инициализация системы заданий');
            this.generateQuests();
            this.updateQuestsBadge();
        }

        // Генерация заданий на основе оплаченных регионов
        generateQuests() {
            this.quests = [];

            // Получаем оплаченные регионы
            const paidRegions = window.paidRegions || [];

            if (paidRegions.length === 0) {
                console.log('📭 Нет оплаченных регионов - нет заданий');
                return;
            }

            // Для каждого оплаченного региона создаем задания
            paidRegions.forEach(paidRegion => {
                const regionData = window.RUSSIA_REGIONS_DATA?.[paidRegion.id];

                if (!regionData || !regionData.attractions) return;

                // Берем до 3 достопримечательностей для заданий
                const attractions = regionData.attractions.slice(0, 3);

                attractions.forEach((attraction, index) => {
                    const questId = `${paidRegion.id}_${index}`;

                    // Проверяем, не выполнено ли уже задание
                    const isCompleted = this.completedQuests.includes(questId);

                    // Выбираем случайного партнера для награды
                    const partner = regionData.partners && regionData.partners.length > 0
                        ? regionData.partners[Math.floor(Math.random() * regionData.partners.length)]
                        : null;

                    this.quests.push({
                        id: questId,
                        regionId: paidRegion.id,
                        regionName: regionData.name,
                        title: `Сфотографируй ${attraction.name}`,
                        description: `Найди и сфотографируй достопримечательность "${attraction.name}" в городе ${regionData.name}`,
                        attraction: attraction.name,
                        partner: partner,
                        rewardText: partner ? `QR-код на бонус в "${partner.name}"` : 'QR-код на бонус',
                        status: isCompleted ? 'completed' : 'available',
                        photo: isCompleted ? this.getQuestPhoto(questId) : null,
                        completedDate: isCompleted ? this.getCompletionDate(questId) : null,
                        qrCode: isCompleted ? this.getQuestQR(questId) : null
                    });
                });
            });

            console.log(`✅ Сгенерировано заданий: ${this.quests.length}`);
        }

        // Загрузка выполненных заданий
        loadCompletedQuests() {
            try {
                const data = localStorage.getItem(COMPLETED_QUESTS_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('Ошибка загрузки выполненных заданий:', e);
                return [];
            }
        }

        // Сохранение выполненного задания
        saveCompletedQuest(questId, photoData) {
            if (!this.completedQuests.includes(questId)) {
                this.completedQuests.push(questId);
                localStorage.setItem(COMPLETED_QUESTS_KEY, JSON.stringify(this.completedQuests));
            }

            // Сохраняем фото и дату
            localStorage.setItem(`quest_photo_${questId}`, photoData);
            localStorage.setItem(`quest_date_${questId}`, new Date().toISOString());
        }

        // Получение фото задания
        getQuestPhoto(questId) {
            return localStorage.getItem(`quest_photo_${questId}`);
        }

        // Получение даты выполнения
        getCompletionDate(questId) {
            const date = localStorage.getItem(`quest_date_${questId}`);
            return date ? new Date(date) : null;
        }

        // Получение QR-кода задания
        getQuestQR(questId) {
            return localStorage.getItem(`quest_qr_${questId}`);
        }

        // Генерация QR-кода
        generateQRCode(quest) {
            // Простой QR-код с данными о бонусе
            const qrData = {
                questId: quest.id,
                region: quest.regionName,
                partner: quest.partner ? quest.partner.name : 'Партнер',
                bonus: quest.partner ? quest.partner.description : 'Специальный бонус',
                date: new Date().toISOString()
            };

            // Используем QRCode.js библиотеку для генерации
            const canvas = document.createElement('canvas');
            const qr = new QRious({
                element: canvas,
                value: JSON.stringify(qrData),
                size: 300,
                level: 'H'
            });

            return canvas.toDataURL();
        }

        // Обновление бейджа с количеством доступных заданий
        updateQuestsBadge() {
            const badge = document.getElementById('questsBadge');
            const availableQuests = this.quests.filter(q => q.status === 'available').length;

            if (badge) {
                if (availableQuests > 0) {
                    badge.textContent = availableQuests;
                    badge.style.display = 'block';
                } else {
                    badge.style.display = 'none';
                }
            }
        }

        // Отрисовка списка заданий
        render() {
            const container = document.querySelector('.quests-content');
            if (!container) return;

            // Обновляем список заданий
            this.generateQuests();

            container.innerHTML = `
                <div class="quests-header">
                    <div class="quests-title">🎯 Игровые задания</div>
                    <div class="quests-subtitle">Фотографируй достопримечательности и получай QR-коды на бонусы</div>
                </div>

                <div class="quests-info">
                    <div class="quests-info-title">📸 Как это работает?</div>
                    <div class="quests-info-text">
                        После покупки пакета региона вам становятся доступны задания -
                        сфотографируйте указанные достопримечательности и получите
                        QR-код на бонус в заведении партнеров!
                    </div>
                    <div class="quests-reward">
                        <span class="reward-icon">🎁</span>
                        <span class="reward-text">За каждое задание: QR-код на бонус</span>
                    </div>
                </div>

                <div class="quests-list" id="questsList">
                    ${this.renderQuestsList()}
                </div>
            `;

            this.updateQuestsBadge();
        }

        // Отрисовка списка карточек заданий
        renderQuestsList() {
            if (this.quests.length === 0) {
                return `
                    <div class="quests-empty">
                        <div class="quests-empty-icon">🎯</div>
                        <div class="quests-empty-text">Пока нет доступных заданий</div>
                        <div class="quests-empty-hint">Купите пакет региона, чтобы получить задания</div>
                    </div>
                `;
            }

            return this.quests.map(quest => this.renderQuestCard(quest)).join('');
        }

        // Отрисовка карточки задания
        renderQuestCard(quest) {
            const statusClass = quest.status;
            const statusText = {
                'available': '✨ Доступно',
                'completed': '✅ Выполнено',
                'locked': '🔒 Закрыто'
            }[quest.status];

            const completedInfo = quest.status === 'completed' && quest.completedDate
                ? `<div class="quest-completed-date">Выполнено: ${new Date(quest.completedDate).toLocaleDateString('ru-RU')}</div>`
                : '';

            const photoPreview = quest.photo
                ? `<img src="${quest.photo}" class="quest-photo-preview" alt="Фото достопримечательности">`
                : '';

            const actions = quest.status === 'available'
                ? `
                    <div class="quest-actions">
                        <button class="quest-btn quest-btn-primary" onclick="window.matryoshkaQuests.openPhotoUpload('${quest.id}')">
                            📸 Загрузить фото
                        </button>
                        <button class="quest-btn quest-btn-secondary" onclick="openRoute('${quest.attraction}')">
                            🗺️ На карте
                        </button>
                    </div>
                `
                : quest.status === 'completed'
                ? `
                    <div class="quest-actions">
                        <button class="quest-btn quest-btn-success" disabled>
                            ✅ Задание выполнено
                        </button>
                    </div>
                `
                : '';

            return `
                <div class="quest-card ${statusClass}">
                    <div class="quest-header">
                        <div class="quest-title-row">
                            <div class="quest-title">${quest.title}</div>
                            <div class="quest-location">📍 ${quest.regionName}</div>
                        </div>
                        <div class="quest-status ${statusClass}">${statusText}</div>
                    </div>
                    <div class="quest-description">${quest.description}</div>
                    <div class="quest-reward-badge">
                        <span class="reward-icon">🎁</span>
                        <span class="reward-text">${quest.rewardText}</span>
                    </div>
                    ${completedInfo}
                    ${photoPreview}
                    ${quest.qrCode ? `
                        <div class="quest-qr-container">
                            <div class="quest-qr-title">✅ Ваш QR-код на бонус:</div>
                            <img src="${quest.qrCode}" class="quest-qr-code" alt="QR код">
                            <div class="quest-qr-info">
                                ${quest.partner ? `📍 ${quest.partner.name}<br>${quest.partner.emoji} ${quest.partner.type}` : ''}
                            </div>
                            <button class="quest-btn quest-btn-primary" onclick="window.matryoshkaQuests.showQRFullscreen('${quest.id}')">
                                🔍 Показать QR-код
                            </button>
                        </div>
                    ` : ''}
                    ${actions}
                </div>
            `;
        }

        // Открытие модального окна загрузки фото
        openPhotoUpload(questId) {
            this.currentQuest = this.quests.find(q => q.id === questId);
            if (!this.currentQuest) return;

            const modal = this.createPhotoUploadModal();
            document.body.appendChild(modal);

            setTimeout(() => modal.classList.add('active'), 10);
        }

        // Создание модального окна загрузки
        createPhotoUploadModal() {
            const modal = document.createElement('div');
            modal.className = 'photo-upload-modal';
            modal.id = 'photoUploadModal';

            modal.innerHTML = `
                <div class="photo-upload-content">
                    <button class="photo-upload-close" onclick="window.matryoshkaQuests.closePhotoUpload()">✕</button>

                    <div class="photo-upload-header">
                        <div class="photo-upload-title">📸 Загрузить фото</div>
                        <div class="photo-upload-subtitle">${this.currentQuest.attraction}</div>
                    </div>

                    <div class="photo-upload-zone" id="photoUploadZone">
                        <div class="upload-icon">📷</div>
                        <div class="upload-text">Нажмите или перетащите фото</div>
                        <div class="upload-hint">JPG, PNG до 5MB</div>
                        <input type="file" id="photoFileInput" accept="image/*" style="display: none;">
                    </div>

                    <div class="photo-preview-container" id="photoPreviewContainer" style="display: none;">
                        <img id="photoPreview" class="photo-preview-img" alt="Предпросмотр">
                    </div>

                    <div class="photo-upload-actions">
                        <button class="quest-btn quest-btn-secondary" onclick="window.matryoshkaQuests.closePhotoUpload()">
                            Отмена
                        </button>
                        <button class="quest-btn quest-btn-primary" id="submitPhotoBtn" disabled onclick="window.matryoshkaQuests.submitPhoto()">
                            ✅ Отправить
                        </button>
                    </div>
                </div>
            `;

            // Обработчики событий
            const zone = modal.querySelector('#photoUploadZone');
            const fileInput = modal.querySelector('#photoFileInput');

            zone.addEventListener('click', () => fileInput.click());

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.handlePhotoSelect(file);
            });

            // Drag & drop
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('dragover');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('dragover');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file) this.handlePhotoSelect(file);
            });

            return modal;
        }

        // Обработка выбора фото
        handlePhotoSelect(file) {
            if (!file.type.startsWith('image/')) {
                showToast('❌ Пожалуйста, выберите изображение');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showToast('❌ Размер файла не должен превышать 5MB');
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const preview = document.getElementById('photoPreview');
                const previewContainer = document.getElementById('photoPreviewContainer');
                const submitBtn = document.getElementById('submitPhotoBtn');

                preview.src = e.target.result;
                previewContainer.style.display = 'block';
                submitBtn.disabled = false;

                // Сохраняем данные фото
                this.currentPhotoData = e.target.result;
            };

            reader.readAsDataURL(file);
        }

        // Отправка фото и выполнение задания
        submitPhoto() {
            if (!this.currentPhotoData || !this.currentQuest) return;

            showLoader('Обработка фото...');

            setTimeout(() => {
                // Генерируем QR-код для награды
                const qrCode = this.generateQRCode(this.currentQuest);

                // Сохраняем выполненное задание
                this.saveCompletedQuest(this.currentQuest.id, this.currentPhotoData);

                // Сохраняем QR-код
                localStorage.setItem(`quest_qr_${this.currentQuest.id}`, qrCode);

                // Закрываем модалку
                this.closePhotoUpload();

                hideLoader();

                // Показываем успех с информацией о QR-коде
                const partnerName = this.currentQuest.partner ? this.currentQuest.partner.name : 'партнеров';
                showToast(`✅ Задание выполнено! Получен QR-код на бонус в "${partnerName}"`, 4000);

                // Перерисовываем список заданий
                this.render();
            }, 1500);
        }

        // Закрытие модального окна
        closePhotoUpload() {
            const modal = document.getElementById('photoUploadModal');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
            this.currentPhotoData = null;
        }

        // Показать QR-код в полноэкранном режиме
        showQRFullscreen(questId) {
            const quest = this.quests.find(q => q.id === questId);
            if (!quest || !quest.qrCode) return;

            const modal = document.createElement('div');
            modal.className = 'qr-fullscreen-modal active';
            modal.innerHTML = `
                <div class="qr-fullscreen-content">
                    <button class="qr-close-btn" onclick="this.closest('.qr-fullscreen-modal').remove()">✕</button>
                    <div class="qr-fullscreen-header">
                        <div class="qr-fullscreen-title">🎁 QR-код на бонус</div>
                        <div class="qr-fullscreen-subtitle">${quest.partner ? quest.partner.name : ''}</div>
                    </div>
                    <div class="qr-fullscreen-code">
                        <img src="${quest.qrCode}" alt="QR код">
                    </div>
                    <div class="qr-fullscreen-info">
                        ${quest.partner ? `
                            <div class="qr-partner-info">
                                <div class="qr-partner-name">${quest.partner.emoji} ${quest.partner.name}</div>
                                <div class="qr-partner-type">${quest.partner.type}</div>
                                <div class="qr-partner-desc">${quest.partner.description}</div>
                            </div>
                        ` : ''}
                        <div class="qr-instructions">
                            📱 Покажите этот QR-код сотруднику заведения для получения бонуса
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Вибрация Telegram
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            }
        }
    }

    // Глобальная инициализация
    window.matryoshkaQuests = new QuestsSystem();

    console.log('✅ Система заданий Матрешка инициализирована');
})();

// Функция показа секции заданий
function showQuests() {
    console.log('🎯 Открываем задания');

    // Скрываем все секции
    document.getElementById('mainSection').style.display = 'none';
    document.getElementById('regionDetails').style.display = 'none';
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('cartSection').style.display = 'none';

    // Показываем задания
    const questsSection = document.getElementById('questsSection');
    questsSection.style.display = 'block';

    // Обновляем навигацию
    updateBottomNav('quests');

    // Рендерим задания
    if (window.matryoshkaQuests) {
        window.matryoshkaQuests.render();
    }

    // Скроллим наверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Функция скрытия заданий
function hideQuests() {
    console.log('🎯 Закрываем задания');

    document.getElementById('questsSection').style.display = 'none';
    document.getElementById('mainSection').style.display = 'block';

    // Обновляем навигацию
    updateBottomNav(null);

    // Скроллим наверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Обработчик кнопки "Назад" в заданиях
document.addEventListener('DOMContentLoaded', function() {
    const questsBackBtn = document.getElementById('questsBackBtn');
    if (questsBackBtn) {
        questsBackBtn.addEventListener('click', hideQuests);
    }
});
