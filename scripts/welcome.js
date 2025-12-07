// Russian regions data
const regions = [
    { name: 'Москва', icon: '🏛️' },
    { name: 'Санкт-Петербург', icon: '🌉' },
    { name: 'Московская область', icon: '🏘️' },
    { name: 'Краснодарский край', icon: '🌴' },
    { name: 'Республика Татарстан', icon: '🕌' },
    { name: 'Свердловская область', icon: '🏔️' },
    { name: 'Новосибирская область', icon: '🌲' },
    { name: 'Ростовская область', icon: '🌾' },
    { name: 'Республика Башкортостан', icon: '🏞️' },
    { name: 'Красноярский край', icon: '❄️' },
    { name: 'Приморский край', icon: '🌊' },
    { name: 'Пермский край', icon: '⛰️' },
    { name: 'Волгоградская область', icon: '🏛️' },
    { name: 'Челябинская область', icon: '🏭' },
    { name: 'Самарская область', icon: '🚀' },
    { name: 'Нижегородская область', icon: '🎭' },
    { name: 'Республика Дагестан', icon: '🗻' },
    { name: 'Ставропольский край', icon: '⛲' },
    { name: 'Иркутская область', icon: '🦌' },
    { name: 'Саратовская область', icon: '🌻' },
    { name: 'Тюменская область', icon: '🛢️' },
    { name: 'Кемеровская область', icon: '⛏️' },
    { name: 'Алтайский край', icon: '🏔️' },
    { name: 'Хабаровский край', icon: '🐅' },
    { name: 'Омская область', icon: '🏛️' },
    { name: 'Республика Крым', icon: '🏖️' },
    { name: 'Калининградская область', icon: '🏰' },
    { name: 'Воронежская область', icon: '🌳' },
    { name: 'Ленинградская область', icon: '🏡' },
    { name: 'Тульская область', icon: '🎨' },
    { name: 'Белгородская область', icon: '🌾' },
    { name: 'Рязанская область', icon: '🌲' },
    { name: 'Пензенская область', icon: '🏛️' },
    { name: 'Липецкая область', icon: '🏭' },
    { name: 'Тверская область', icon: '🌳' },
    { name: 'Тамбовская область', icon: '🌻' },
    { name: 'Ярославская область', icon: '⛪' },
    { name: 'Астраханская область', icon: '🐟' },
    { name: 'Республика Карелия', icon: '🌲' },
    { name: 'Архангельская область', icon: '❄️' },
    { name: 'Мурманская область', icon: '🌌' },
    { name: 'Калужская область', icon: '🚀' },
    { name: 'Владимирская область', icon: '⛪' },
    { name: 'Вологодская область', icon: '🧈' },
    { name: 'Курская область', icon: '🌾' },
    { name: 'Ульяновская область', icon: '✈️' },
    { name: 'Республика Коми', icon: '🌲' },
    { name: 'Забайкальский край', icon: '🏔️' },
    { name: 'Камчатский край', icon: '🌋' },
    { name: 'Сахалинская область', icon: '🏝️' }
].sort((a, b) => a.name.localeCompare(b.name, 'ru'));

let selectedRegion = null;

// DOM elements
const selectButton = document.getElementById('selectButton');
const selectText = document.getElementById('selectText');
const dropdownMenu = document.getElementById('dropdownMenu');
const searchInput = document.getElementById('searchInput');
const regionsList = document.getElementById('regionsList');
const continueBtn = document.getElementById('continueBtn');
const skipBtn = document.getElementById('skipBtn');

// Render regions list
function renderRegions(filter = '') {
    const filtered = regions.filter(region =>
        region.name.toLowerCase().includes(filter.toLowerCase())
    );

    regionsList.innerHTML = filtered.map(region => `
        <div class="dropdown-item ${selectedRegion === region.name ? 'selected' : ''}"
             data-region="${region.name}">
            <span class="region-icon">${region.icon}</span>
            <span>${region.name}</span>
        </div>
    `).join('');

    // Add click handlers
    regionsList.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => selectRegion(item.dataset.region));
    });
}

// Select region
function selectRegion(regionName) {
    selectedRegion = regionName;
    const region = regions.find(r => r.name === regionName);

    selectText.textContent = `${region.icon} ${region.name}`;
    selectText.classList.remove('placeholder');

    closeDropdown();
    continueBtn.disabled = false;
    continueBtn.classList.add('success');
    setTimeout(() => continueBtn.classList.remove('success'), 300);
}

// Toggle dropdown
function toggleDropdown() {
    const isActive = dropdownMenu.classList.toggle('active');
    selectButton.classList.toggle('active');

    if (isActive) {
        searchInput.focus();
        searchInput.value = '';
        renderRegions();
    }
}

// Close dropdown
function closeDropdown() {
    dropdownMenu.classList.remove('active');
    selectButton.classList.remove('active');
}

// Event listeners
selectButton.addEventListener('click', toggleDropdown);

searchInput.addEventListener('input', (e) => {
    renderRegions(e.target.value);
});

searchInput.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!selectButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
        closeDropdown();
    }
});

// Continue button
continueBtn.addEventListener('click', () => {
    if (selectedRegion) {
        // Save selection to localStorage
        localStorage.setItem('userRegion', selectedRegion);
        localStorage.setItem('welcomeCompleted', 'true');

        // Автоматически активируем бонусный пакет региона
        const activationDate = new Date();
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        localStorage.setItem('regionBonusActive', 'true');
        localStorage.setItem('regionBonusRegion', selectedRegion);
        localStorage.setItem('regionBonusActivated', activationDate.toISOString());
        localStorage.setItem('regionBonusExpires', expirationDate.toISOString());

        // Устанавливаем флаг что бонус только что активирован
        sessionStorage.setItem('bonusJustActivated', 'true');

        // Закрываем overlay вместо редиректа
        const overlay = document.getElementById('welcomeOverlay');
        if (overlay) {
            console.log('🔥 ЗАКРЫВАЕМ OVERLAY');

            // Отключаем pointer-events сразу
            overlay.style.pointerEvents = 'none';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s ease-out';

            // СРАЗУ разблокируем прокрутку body
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.documentElement.style.overflow = '';

            console.log('✅ Overflow разблокирован');

            // Скроллим главную страницу вверх
            window.scrollTo({ top: 0, behavior: 'smooth' });

            setTimeout(() => {
                console.log('🗑️ УДАЛЯЕМ OVERLAY');

                // Удаляем все элементы внутри overlay ПЕРЕД его удалением
                overlay.querySelectorAll('*').forEach(el => el.remove());

                // Теперь удаляем сам overlay
                overlay.remove();

                // Финальная очистка - убираем все возможные блокировки
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.height = '';
                document.documentElement.style.overflow = '';

                console.log('✅ OVERLAY УДАЛЕН, страница разблокирована');

                // Показываем бонусную плашку
                if (window.showRegionBonusBanner) {
                    window.showRegionBonusBanner();
                }
            }, 500);
        } else {
            // Fallback если не overlay режим
            window.location.href = 'index.html';
        }
    }
});

// Skip button
skipBtn.addEventListener('click', () => {
    localStorage.setItem('welcomeCompleted', 'true');

    // Закрываем overlay
    const overlay = document.getElementById('welcomeOverlay');
    if (overlay) {
        console.log('🔥 ПРОПУСКАЕМ - закрываем overlay');

        // Отключаем pointer-events сразу
        overlay.style.pointerEvents = 'none';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s ease-out';

        // СРАЗУ разблокируем прокрутку body
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.documentElement.style.overflow = '';

        setTimeout(() => {
            console.log('🗑️ УДАЛЯЕМ OVERLAY (пропуск)');

            // Удаляем содержимое overlay
            overlay.querySelectorAll('*').forEach(el => el.remove());
            overlay.remove();

            // Финальная очистка
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.documentElement.style.overflow = '';

            console.log('✅ Страница разблокирована');
        }, 500);
    } else {
        // Fallback если не overlay режим
        window.location.href = 'index.html';
    }
});

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particlesContainer.appendChild(particle);
    }
}

// Initialize
renderRegions();
createParticles();
