/**
 * Модуль управления пакетами путешествий
 */

// Загрузка и отображение пакетов
function loadTravelPackages() {
    console.log('📦 Загрузка пакетов путешествий...');
    console.log('🔍 window.TRAVEL_PACKAGES:', window.TRAVEL_PACKAGES);
    console.log('🔍 typeof TRAVEL_PACKAGES:', typeof TRAVEL_PACKAGES);

    const packagesGrid = document.getElementById('packagesGrid');
    if (!packagesGrid) {
        console.error('❌ Контейнер packagesGrid не найден');
        return;
    }

    if (typeof TRAVEL_PACKAGES === 'undefined') {
        console.error('❌ TRAVEL_PACKAGES не загружены');
        console.error('Попробуем загрузить через 100ms...');
        setTimeout(loadTravelPackages, 100);
        return;
    }

    if (!TRAVEL_PACKAGES || !Array.isArray(TRAVEL_PACKAGES)) {
        console.error('❌ TRAVEL_PACKAGES не является массивом:', TRAVEL_PACKAGES);
        return;
    }

    console.log(`✅ Найдено ${TRAVEL_PACKAGES.length} пакетов`);

    packagesGrid.innerHTML = TRAVEL_PACKAGES.map(pkg => `
        <div class="package-card" onclick="showPackageModal('${pkg.id}')">
            <div class="package-image" style="background-image: url('${pkg.image}')"></div>
            <div class="package-content">
                <h3 class="package-name">${pkg.name}</h3>
                <div class="package-duration">${pkg.duration}</div>
                <div class="package-cities">
                    ${pkg.cities.slice(0, 3).map(city => `<span class="city-tag">${city}</span>`).join('')}
                    ${pkg.cities.length > 3 ? `<span class="city-tag">+${pkg.cities.length - 3}</span>` : ''}
                </div>
                <p class="package-description">${pkg.description}</p>
                <div class="package-footer">
                    <div class="package-price">
                        ${pkg.oldPrice ? `<span class="old-price">${pkg.oldPrice.toLocaleString()} ₽</span>` : ''}
                        <span class="current-price">${pkg.price.toLocaleString()} ₽</span>
                    </div>
                    <button class="package-btn">Подробнее</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Показ модального окна с деталями пакета
function showPackageModal(packageId) {
    const pkg = TRAVEL_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    const modal = document.createElement('div');
    modal.className = 'package-modal';
    modal.id = 'packageModal';

    modal.innerHTML = `
        <div class="package-modal-content">
            <button class="package-modal-close" onclick="closePackageModal()">✕</button>

            <div class="package-modal-header">
                <div class="package-modal-image" style="background-image: url('${pkg.image}')"></div>
                <div class="package-modal-info">
                    <h2 class="package-modal-title">${pkg.name}</h2>
                    <div class="package-modal-duration">${pkg.duration}</div>
                    <div class="package-modal-price">
                        ${pkg.oldPrice ? `<span class="modal-old-price">${pkg.oldPrice.toLocaleString()} ₽</span>` : ''}
                        <span class="modal-current-price">${pkg.price.toLocaleString()} ₽</span>
                    </div>
                </div>
            </div>

            <div class="package-modal-body">
                <div class="package-section">
                    <h3 class="package-section-title">Описание</h3>
                    <p class="package-section-text">${pkg.description}</p>
                </div>

                <div class="package-section">
                    <h3 class="package-section-title">Города в маршруте</h3>
                    <div class="package-cities-list">
                        ${pkg.cities.map(city => `<span class="package-city-item">${city}</span>`).join('')}
                    </div>
                </div>

                <div class="package-section">
                    <h3 class="package-section-title">Выберите вариант путешествия</h3>
                    <div class="package-routes">
                        ${pkg.routes.map(route => `
                            <div class="package-route-card" onclick="event.stopPropagation(); toggleRoute(${route.id}, '${pkg.id}')">
                                <div class="package-route-header">
                                    <h4 class="package-route-name">${route.name}</h4>
                                    <span class="package-route-toggle">▼</span>
                                </div>
                                <div class="package-route-details" id="route-${pkg.id}-${route.id}" style="display: none;">
                                    <div class="package-route-section">
                                        <h5>Гостиницы</h5>
                                        ${route.hotels.map(hotel => `
                                            <div class="package-item">
                                                <div class="package-item-name">${hotel.name} - ${hotel.city}</div>
                                                <div class="package-item-links">
                                                    <a href="${hotel.link}" target="_blank" class="package-link">Сайт</a>
                                                    <a href="${hotel.mapLink}" target="_blank" class="package-link">На карте</a>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div class="package-route-section">
                                        <h5>Программа</h5>
                                        ${route.programs.map(program => `
                                            <div class="package-item">
                                                <div class="package-item-name">${program.name}</div>
                                                <div class="package-item-desc">${program.description}</div>
                                                <div class="package-item-duration">Продолжительность: ${program.duration}</div>
                                                <div class="package-item-links">
                                                    <a href="${program.link}" target="_blank" class="package-link">Подробнее</a>
                                                    <a href="${program.mapLink}" target="_blank" class="package-link">На карте</a>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="package-modal-footer">
                    <button class="package-book-btn" onclick="bookPackage('${pkg.id}')">Забронировать путешествие</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    // Закрытие по клику вне модалки
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePackageModal();
        }
    });
}

// Закрытие модального окна
function closePackageModal() {
    const modal = document.getElementById('packageModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Переключение отображения деталей маршрута
function toggleRoute(routeId, packageId) {
    const routeDetails = document.getElementById(`route-${packageId}-${routeId}`);
    const toggle = event.currentTarget.querySelector('.package-route-toggle');

    if (routeDetails.style.display === 'none') {
        routeDetails.style.display = 'block';
        toggle.textContent = '▲';
    } else {
        routeDetails.style.display = 'none';
        toggle.textContent = '▼';
    }
}

// Бронирование пакета
function bookPackage(packageId) {
    const pkg = TRAVEL_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    // Показываем уведомление
    showNotification(`Спасибо за интерес к "${pkg.name}"! Скоро с вами свяжется менеджер.`);
    closePackageModal();
}

// Показ уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'package-notification';
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadTravelPackages();
});
