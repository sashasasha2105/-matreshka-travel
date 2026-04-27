// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;
let isTelegramWebApp = false;

// 🔥 АВТООЧИСТКА ОТКЛЮЧЕНА - пользователь может очистить вручную через кнопку в корзине
console.log('💾 Автоочистка localStorage отключена - данные сохраняются между сессиями');

if (tg) {
    isTelegramWebApp = true;

    // Разворачиваем приложение на весь экран
    tg.expand();

    // Отключаем подтверждение при закрытии
    tg.enableClosingConfirmation();

    // Устанавливаем цвета темы
    if (tg.setHeaderColor) {
        tg.setHeaderColor('secondary_bg_color');
    }
    if (tg.setBackgroundColor) {
        tg.setBackgroundColor('#FCFCFD');
    }

    // Готовность приложения
    tg.ready();

    console.log('✅ Telegram Web App инициализирован', {
        version: tg.version,
        platform: tg.platform,
        colorScheme: tg.colorScheme,
        viewportHeight: tg.viewportHeight,
        isExpanded: tg.isExpanded
    });

    // Настраиваем BackButton для навигации
    if (tg.BackButton) {
        tg.BackButton.onClick(() => {
            // Проверяем что сейчас показано
            const regionDetails = document.getElementById('regionDetails');
            const profileSection = document.getElementById('profileSection');

            if (regionDetails && regionDetails.style.display !== 'none') {
                goBack();
                tg.BackButton.hide();
            } else if (profileSection && profileSection.style.display !== 'none') {
                hideProfile();
                tg.BackButton.hide();
            }
        });
    }
} else {
    console.log('ℹ️ Приложение запущено вне Telegram');
}

// Глобальная лента путешествий (пустая по умолчанию)
let globalTravelFeed = [];

// Система управления состоянием вкладок
let currentActiveSection = 'main'; // main, profile, cart, quests

// Сохранение текущей вкладки в sessionStorage
function saveCurrentSection(sectionName) {
    currentActiveSection = sectionName;
    sessionStorage.setItem('activeSection', sectionName);
    console.log('💾 Сохранена активная вкладка:', sectionName);
}

// Восстановление активной вкладки при загрузке
function restoreActiveSection() {
    const savedSection = sessionStorage.getItem('activeSection');
    if (savedSection) {
        console.log('🔄 Восстанавливаем вкладку:', savedSection);
        switch (savedSection) {
            case 'main':
                showMainSection();
                break;
            case 'feed':
                showFeed();
                break;
            case 'profile':
                showProfile();
                break;
            case 'cart':
                showCart();
                break;
            case 'quests':
                showQuests();
                break;
            default:
                showMainSection();
        }
    }
}

// Глобальные переменные

// Утилита debounce для оптимизации производительности
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Получаем данные регионов из внешнего файла
let russiaRegions = [];

// Загружаем данные при старте
function loadRegionsData() {
    if (window.RUSSIA_REGIONS_DATA) {
        russiaRegions = Object.values(window.RUSSIA_REGIONS_DATA);
        console.log('✅ Загружено регионов:', russiaRegions.length);
        console.log('📋 Первый регион:', russiaRegions[0]?.name);
    } else {
        console.warn('⚠️ Данные регионов не найдены');
        console.log('🔍 window.RUSSIA_REGIONS_DATA:', window.RUSSIA_REGIONS_DATA);
    }
}

// Системы поиска и пагинации
let searchQuery = '';
let currentPage = 0;
const REGIONS_PER_PAGE = 6;
let filteredRegions = [];

// Пакеты путешествий
const travelPackages = [
    {
        id: 'ural',
        name: 'Урал',
        description: 'Величественные горы и промышленные города',
        emoji: '⛰️',
        price: 'от 35 000 ₽',
        duration: '7 дней',
        image: './city_photos/Челябинская область.jpg',
        regions: ['Екатеринбург', 'Челябинск', 'Пермь'],
        highlights: ['Граница Европы и Азии', 'Уральские горы', 'Музей Ельцина']
    },
    {
        id: 'caucasus',
        name: 'Кавказ',
        description: 'Горные вершины и минеральные источники',
        emoji: '🏔️',
        price: 'от 45 000 ₽',
        duration: '8 дней',
        image: './city_photos/Кабардино-Балкария.jpg',
        regions: ['Сочи', 'Кисловодск', 'Домбай'],
        highlights: ['Эльбрус', 'Красная Поляна', 'Нарзанные источники']
    },
    {
        id: 'golden-ring',
        name: 'Золотое кольцо',
        description: 'Древние города и православные святыни',
        emoji: '⛪',
        price: 'от 25 000 ₽',
        duration: '5 дней',
        image: './city_photos/GOLDRING.jpg',
        regions: ['Суздаль', 'Владимир', 'Сергиев Посад'],
        highlights: ['Древние храмы', 'Музеи-заповедники', 'Народные промыслы']
    }
];

// Функция отображения пользователя
function displayUserInfo() {
    const userNameEl = document.getElementById('userName');
    if (!userNameEl) return;

    if (tg && tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        // Капитализируем первую букву имени
        const capitalizedName = user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1);
        userNameEl.innerHTML = `Привет, ${capitalizedName}!`;
    } else {
        userNameEl.innerHTML = 'Добро пожаловать!';
    }
}

// Функция поиска регионов (внутренняя, без debounce)
function searchRegionsInternal(query) {
    searchQuery = query.toLowerCase().trim();
    currentPage = 0; // Сбрасываем на первую страницу
    loadRegions();

    // Обновляем счетчик в реальном времени
    const regionsGrid = document.getElementById('regionsGrid');
    if (regionsGrid) {
        const totalRegions = getFilteredRegions().length;
        console.log(`🔍 Поиск: "${query}" - найдено ${totalRegions} регионов`);
    }
}

// Функция поиска регионов с debounce (публичная)
const searchRegions = debounce(searchRegionsInternal, 300);

// Функция фильтрации регионов
function getFilteredRegions() {
    if (!searchQuery) {
        return russiaRegions;
    }

    return russiaRegions.filter(region => {
        return region.name.toLowerCase().includes(searchQuery) ||
               region.description.toLowerCase().includes(searchQuery) ||
               region.about.toLowerCase().includes(searchQuery);
    });
}

// 🎯 НОВАЯ ФУНКЦИЯ ЗАГРУЗКИ РЕГИОНОВ - использует MinimalFocusCards
function loadRegions() {
    console.log('🔄 Вызвана loadRegions() - MinimalFocusCards');
    const regionsGrid = document.getElementById('regionsGrid');
    if (!regionsGrid) {
        console.error('❌ Элемент regionsGrid не найден!');
        return;
    }

    // Загружаем данные если еще не загружены
    if (russiaRegions.length === 0) {
        console.log('🔄 Перезагружаем данные регионов...');
        loadRegionsData();
    }

    console.log('📊 Доступно регионов:', russiaRegions.length);
    filteredRegions = getFilteredRegions();
    console.log('🔍 Отфильтровано регионов:', filteredRegions.length);

    // Проверяем есть ли результаты поиска
    if (filteredRegions.length === 0 && searchQuery) {
        // Показываем сообщение о пустом результате поиска
        regionsGrid.innerHTML = `
            <div class="search-empty">
                <div class="search-empty-icon">🔍</div>
                <div class="search-empty-title">Ничего не найдено</div>
                <div class="search-empty-text">По запросу "${searchQuery}" регионы не найдены</div>
                <button class="search-clear-btn" onclick="clearSearchAndReload()">
                    <span>✕</span>
                    <span>Очистить поиск</span>
                </button>
            </div>
        `;
        return;
    }

    // Конвертируем данные регионов в формат карточек
    const allRegions = filteredRegions.map(region => ({
        id: region.id,
        name: region.name,
        description: region.description,
        image: region.image,
        population: region.population,
        area: region.area,
        emoji: region.emoji
    }));

    // Рассчитываем сколько регионов показывать с учетом пагинации
    const regionsToDisplay = (currentPage + 1) * REGIONS_PER_PAGE;
    const regionsToShow = allRegions.slice(0, regionsToDisplay);

    // Если компонент уже существует, обновляем карточки
    if (window.minimalFocusCards) {
        window.minimalFocusCards.updateCards(regionsToShow);
    } else {
        // Создаём новый компонент
        const focusCards = new MinimalFocusCards({
            containerId: 'regionsGrid',
            cards: regionsToShow,
            onCardClick: (card, index) => {
                console.log('🎯 Клик на регион:', card.name);
                if (typeof showRegionDetails === 'function') {
                    showRegionDetails(card.id);
                }
            }
        });
        window.minimalFocusCards = focusCards;
    }

    console.log('✅ Загружено регионов:', regionsToShow.length, 'из', allRegions.length);

    // Обновляем кнопку "Показать еще"
    updateLoadMoreButton();

    // Загружаем ленту путешествий после первой загрузки
    if (currentPage === 0) {
        loadTravelFeed();
    }
}

// Функция очистки поиска и перезагрузки
function clearSearchAndReload() {
    const searchInput = document.getElementById('regionSearch');
    if (searchInput) {
        searchInput.value = '';
    }
    searchQuery = '';
    currentPage = 0;
    loadRegions();

    // Скрываем кнопку очистки
    const clearBtn = document.querySelector('.search-clear');
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
}

// Создание карточки региона с ТУРБО-ОПТИМИЗАЦИЕЙ + ACETERNITY EFFECTS
function createRegionCard(region, animationIndex) {
    const regionCard = document.createElement('div');
    regionCard.className = 'region-card aceternity-card spotlight-container ripple';
    regionCard.onclick = () => showRegionDetails(region.id);

    // Добавляем spotlight эффект
    const spotlight = document.createElement('div');
    spotlight.className = 'spotlight';
    regionCard.appendChild(spotlight);

    // 3D tilt эффект при движении мыши
    regionCard.addEventListener('mousemove', (e) => {
        const rect = regionCard.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
        regionCard.style.setProperty('--mouse-x', `${x}deg`);
        regionCard.style.setProperty('--mouse-y', `${y}deg`);

        // Перемещаем spotlight
        spotlight.style.left = `${e.clientX - rect.left - 200}px`;
        spotlight.style.top = `${e.clientY - rect.top - 200}px`;
    });

    regionCard.addEventListener('mouseleave', () => {
        regionCard.style.setProperty('--mouse-x', '0deg');
        regionCard.style.setProperty('--mouse-y', '0deg');
    });

    // Создаем контейнер для изображения с background-image (как у пакетов)
    const imageContainer = document.createElement('div');
    imageContainer.className = 'region-card-image shimmer';
    imageContainer.style.backgroundImage = `url('${region.image}')`;
    imageContainer.style.backgroundSize = 'cover';
    imageContainer.style.backgroundPosition = 'center';
    imageContainer.style.height = '200px';
    imageContainer.style.borderRadius = '12px 12px 0 0';
    imageContainer.style.position = 'relative';

    // Создаем контент
    const content = document.createElement('div');
    content.className = 'region-content';
    content.innerHTML = `
        <div class="region-name">${region.name}</div>
        <div class="region-description">${region.description}</div>
        <div class="region-stats">
            <span>👥 ${region.population}</span>
            <span>📐 ${region.area}</span>
        </div>
    `;

    regionCard.appendChild(imageContainer);
    regionCard.appendChild(content);

    // Анимация появления
    regionCard.style.animation = `fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${(animationIndex % REGIONS_PER_PAGE) * 100}ms forwards`;
    regionCard.style.opacity = '0';

    return regionCard;
}

// Функция обновления кнопки "Показать больше"
function updateLoadMoreButton() {
    let loadMoreBtn = document.getElementById('loadMoreBtn');

    if (!loadMoreBtn) {
        // Создаем кнопку если её нет
        loadMoreBtn = document.createElement('div');
        loadMoreBtn.id = 'loadMoreBtn';
        loadMoreBtn.className = 'load-more-container';

        const regionsGrid = document.getElementById('regionsGrid');
        regionsGrid.parentNode.insertBefore(loadMoreBtn, regionsGrid.nextSibling);
    }

    const displayedRegions = (currentPage + 1) * REGIONS_PER_PAGE;
    const hasMoreRegions = displayedRegions < filteredRegions.length;

    if (hasMoreRegions) {
        const remainingRegions = filteredRegions.length - displayedRegions;
        const nextBatchSize = Math.min(remainingRegions, REGIONS_PER_PAGE);

        loadMoreBtn.innerHTML = `
            <button class="load-more-btn">
                <span class="load-more-icon">⬇️</span>
                <span class="load-more-text">Показать еще ${nextBatchSize} ${nextBatchSize === 1 ? 'регион' : nextBatchSize < 5 ? 'региона' : 'регионов'}</span>
                <span class="load-more-count">(осталось ${remainingRegions})</span>
            </button>
        `;

        // ПРАВИЛЬНО: добавляем обработчик события
        const btn = loadMoreBtn.querySelector('.load-more-btn');
        if (btn) {
            // Удаляем старый обработчик если есть
            btn.replaceWith(btn.cloneNode(true));
            const newBtn = loadMoreBtn.querySelector('.load-more-btn');
            newBtn.addEventListener('click', loadMoreRegions);
        }

        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Функция загрузки дополнительных регионов
function loadMoreRegions() {
    currentPage++;

    // Показываем лоадер
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const originalContent = loadMoreBtn.innerHTML;

    loadMoreBtn.innerHTML = `
        <div class="load-more-loading">
            <div class="load-more-spinner"></div>
            <span>Загружаем регионы...</span>
        </div>
    `;

    // Загружаем сразу
    loadRegions();
}

// Функция загрузки ленты путешествий в стиле VK
function loadTravelFeed() {
    const travelFeed = document.getElementById('travelFeed');
    if (!travelFeed) return;

    if (globalTravelFeed.length === 0) {
        travelFeed.innerHTML = `
            <div class="feed-empty">
                <span class="empty-icon">📝</span>
                <p>Пока нет публикаций</p>
                <small>Станьте первым, кто поделится своим путешествием!</small>
            </div>
        `;
        return;
    }

    travelFeed.innerHTML = '';

    globalTravelFeed.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.className = 'travel-feed-card';

        // Генерируем grid для фотографий
        const imagesHTML = generatePhotoGridForFeed(post.images || [post.image]);

        postElement.innerHTML = `
            <div class="feed-card-header">
                <div class="feed-avatar">${post.avatar || '👤'}</div>
                <div class="feed-user-info">
                    <div class="feed-username">${post.author || 'Путешественник'}</div>
                    <div class="feed-timestamp">${post.time || 'только что'}</div>
                </div>
            </div>
            <div class="feed-card-content">
                <div class="feed-card-title">${post.title}</div>
                <div class="feed-card-text">${post.text}</div>
            </div>
            <div class="feed-card-images">
                ${imagesHTML}
            </div>
            <div class="feed-card-footer">
                <button class="feed-action-btn" onclick="toggleFeedLike(${post.id}, this)">
                    <span>❤️</span>
                    <span class="like-count">${post.likes || 0}</span>
                </button>
            </div>
        `;

        // Анимация появления через CSS
        postElement.style.animation = `fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 100 + 500}ms forwards`;
        postElement.style.opacity = '0';

        travelFeed.appendChild(postElement);
    });
}

// Генерация photo grid для ленты
function generatePhotoGridForFeed(images) {
    if (!images || images.length === 0) {
        return '';
    }

    if (images.length === 1) {
        return `<img src="${images[0]}" class="single-image" loading="lazy">`;
    }

    if (images.length === 2) {
        return `
            <div class="grid-two">
                ${images.map(img => `<img src="${img}" class="grid-image" loading="lazy">`).join('')}
            </div>
        `;
    }

    if (images.length === 3) {
        return `
            <div class="grid-three">
                <img src="${images[0]}" class="grid-image" loading="lazy">
                <div class="grid-column">
                    <img src="${images[1]}" class="grid-image" loading="lazy">
                    <img src="${images[2]}" class="grid-image" loading="lazy">
                </div>
            </div>
        `;
    }

    if (images.length >= 4) {
        return `
            <div class="grid-many">
                <img src="${images[0]}" class="grid-image" loading="lazy">
                <img src="${images[1]}" class="grid-image" loading="lazy">
                <img src="${images[2]}" class="grid-image" loading="lazy">
                <div class="grid-more">
                    <img src="${images[3]}" class="grid-image" loading="lazy">
                    ${images.length > 4 ? `<div class="more-overlay">+${images.length - 4}</div>` : ''}
                </div>
            </div>
        `;
    }
}

// Переключение лайка в ленте
function toggleFeedLike(postId, button) {
    const post = globalTravelFeed.find(p => p.id === postId);
    if (!post) return;

    post.likes = (post.likes || 0) + (button.classList.contains('liked') ? -1 : 1);
    button.classList.toggle('liked');
    button.querySelector('.like-count').textContent = post.likes;
}

// Функция загрузки пакетов путешествий перенесена в packages.js
// Используем функции из packages.js: loadTravelPackages(), showPackageModal()

// Функция показа уведомлений с поддержкой accessibility
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'matryoshka-toast';
    toast.textContent = message;

    // Добавляем ARIA атрибуты для accessibility
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1E1E24',
        color: '#FCFCFD',
        padding: '10px 20px',
        borderRadius: '6px',
        fontWeight: '500',
        fontSize: '13px',
        zIndex: '10000',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: 'none',
        animation: 'fadeInUp 0.3s ease-out',
        maxWidth: '85%',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, sans-serif',
        letterSpacing: '0'
    });

    document.body.appendChild(toast);

    // Автоматически удаляем после duration
    const timeoutId = setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duration);

    // Добавляем возможность закрыть по клику
    toast.addEventListener('click', () => {
        clearTimeout(timeoutId);
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    });

    // Добавляем курсор pointer для подсказки что можно кликнуть
    toast.style.cursor = 'pointer';
}

// Функция добавления поста в ленту
function addToGlobalFeed(travel) {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
    const userName = user.first_name || 'Путешественник';

    const newPost = {
        id: Date.now(),
        author: userName,
        avatar: '',
        time: 'только что',
        title: travel.title,
        image: travel.image,
        text: travel.text
    };

    // Добавляем в начало ленты
    globalTravelFeed.unshift(newPost);

    // Перезагружаем ленту
    loadTravelFeed();

    console.log('Путешествие добавлено в ленту:', newPost);
}

// ========================================
// УПРАВЛЕНИЕ ВИДИМОСТЬЮ СЕКЦИИ КОМАНДЫ
// ========================================

/**
 * Обновляет видимость секции команды
 * Команда видна только на главной странице
 */
function updateTeamVisibility() {
    const teamSection = document.querySelector('.team-section');
    const mainSection = document.getElementById('mainSection');

    if (!teamSection) return;

    // Показываем команду только если главная страница видна
    if (mainSection && mainSection.style.display !== 'none') {
        teamSection.style.display = 'block';
    } else {
        teamSection.style.display = 'none';
    }
}

// Функция показа деталей региона
function showRegionDetails(regionId) {
    const region = russiaRegions.find(r => r.id === regionId);
    if (!region) return;

    // Сохраняем ID текущего региона
    window.currentRegionId = regionId;

    try {
        // Используем новую систему навигации
        if (window.MatryoshkaNavigation) {
            window.MatryoshkaNavigation.navigate('regionDetails');
        } else {
            const mainSection = document.getElementById('mainSection');
            if (mainSection) mainSection.style.display = 'none';
            const detailsSection = document.getElementById('regionDetails');
            if (detailsSection) {
                detailsSection.classList.remove('hidden');
                detailsSection.style.display = 'block';
            }
        }

        const detailsSection = document.getElementById('regionDetails');
        if (!detailsSection) return;

        // Build the full template
        detailsSection.innerHTML = `
            <div class="region-details-header">
                <button class="back-btn" id="backBtn" onclick="goBack()">← Назад</button>
                <div class="breadcrumbs">
                    <a class="breadcrumb-item" onclick="goBack()">Главная</a>
                    <span class="breadcrumb-separator">›</span>
                    <span class="breadcrumb-item active" id="breadcrumbRegion">${region.name}</span>
                </div>
            </div>

            <div class="region-header">
                <h1 class="region-title" id="regionTitle">${region.name}</h1>
                <p class="region-subtitle" id="regionDescription">${region.description}</p>
            </div>

            <div class="region-image-container">
                <img class="region-image" id="regionImage" src="${region.image}" alt="${region.name}" loading="eager">
            </div>

            <div class="section">
                <h2 class="section-title">О регионе</h2>
                <div class="section-content">
                    <div class="region-about" id="regionAbout">${region.about}</div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Партнеры и скидки</h2>
                <div class="section-content" id="partnersGrid"></div>
            </div>

            <div class="section">
                <h2 class="section-title">Карта</h2>
                <div class="map-container" id="mapContainer">
                    <div class="map-placeholder" style="display:flex;align-items:center;justify-content:center;min-height:300px;color:var(--c-text-3);font-size:0.8rem;">
                        Загрузка карты...
                    </div>
                </div>
            </div>
        `;

        // Скрываем команду
        updateTeamVisibility();

        // Загружаем партнеров
        loadPartners(region.partners);

        // Загружаем интерактивную карту 2GIS
        load2GISMap(region).catch(mapError => {
            console.warn('Ошибка загрузки карты:', mapError);
            loadMapFallback(region);
        });

        // Показываем BackButton в Telegram
        if (tg && tg.BackButton) {
            tg.BackButton.show();
        }

        // Уведомление Telegram
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }

        // Скроллим наверх
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('❌ Ошибка отображения региона:', error);
    }
}


// Функция категоризации партнеров
function categorizePartners(partners) {
    const categories = {
        food: { title: 'Еда и напитки', emoji: '', partners: [] },
        entertainment: { title: 'Развлечения', emoji: '', partners: [] },
        souvenirs: { title: 'Сувениры и подарки', emoji: '', partners: [] }
    };

    // Ключевые слова для определения категорий
    const foodKeywords = ['кафе', 'ресторан', 'столовая', 'кофейня', 'кондитерская', 'кухн', 'еда', 'пицц', 'бургер', 'чай'];
    const entertainmentKeywords = ['театр', 'музей', 'парк', 'развлечен', 'аттракцион', 'кино', 'концерт', 'выставк', 'галере', 'экскурси'];
    const souvenirKeywords = ['сувенир', 'подарк', 'магазин', 'лавк', 'ремесл', 'handmade', 'изделия', 'промысл'];

    partners.forEach(partner => {
        const searchText = (partner.type + ' ' + partner.name + ' ' + (partner.description || '')).toLowerCase();

        // Определяем категорию по ключевым словам
        if (foodKeywords.some(keyword => searchText.includes(keyword))) {
            categories.food.partners.push(partner);
        } else if (entertainmentKeywords.some(keyword => searchText.includes(keyword))) {
            categories.entertainment.partners.push(partner);
        } else if (souvenirKeywords.some(keyword => searchText.includes(keyword))) {
            categories.souvenirs.partners.push(partner);
        } else {
            // По умолчанию отправляем в еду (т.к. большинство партнеров - еда)
            categories.food.partners.push(partner);
        }
    });

    return categories;
}

// Функция загрузки партнеров - С АККОРДЕОНАМИ ПО КАТЕГОРИЯМ
function loadPartners(partners) {
    const partnersGrid = document.getElementById('partnersGrid');
    if (!partnersGrid) return;

    partnersGrid.innerHTML = '';

    // Сохраняем партнеров в глобальную переменную для доступа из общей кнопки
    window.currentPartners = partners;

    // Проверяем статус оплаты для текущего региона
    const currentRegionId = getCurrentRegionId();
    const isPaid = isRegionPaid(currentRegionId);

    // Категоризируем партнеров
    const categories = categorizePartners(partners);

    // Создаем аккордеоны для каждой категории
    Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];

        // Пропускаем пустые категории
        if (category.partners.length === 0) return;

        // Создаем контейнер аккордеона
        const accordion = document.createElement('div');
        accordion.className = 'partners-accordion';

        // Создаем заголовок аккордеона
        const header = document.createElement('div');
        header.className = 'partners-accordion-header';
        header.innerHTML = `
            <div class="accordion-title">
                <span class="accordion-emoji">${category.emoji}</span>
                <span class="accordion-text">${category.title}</span>
                <span class="accordion-count">${category.partners.length}</span>
            </div>
            <div class="accordion-arrow">▼</div>
        `;

        // Создаем контейнер для карточек (изначально скрытый)
        const content = document.createElement('div');
        content.className = 'partners-accordion-content';
        content.style.display = 'none';

        // Добавляем карточки партнеров в контейнер
        category.partners.forEach((partner, index) => {
        const card = document.createElement('div');
        card.className = 'partner-card-minimal';

        // Формируем контент с highlight
        const descriptionWithHighlight = partner.description
            ? partner.description.replace(/(лучш\w+|авторск\w+|домашн\w+|качественн\w+|уютн\w+|аутентичн\w+|популярн\w+)/gi,
                '<span class="card-highlight">$1</span>')
            : partner.type;

        // Создаем кнопку QR для каждого партнера
        const qrButtonHTML = isPaid
            ? `<button class="partner-qr-btn-minimal" onclick='showPartnerQRByName("${partner.name.replace(/'/g, "\\'")}","${partner.emoji}")'>
                   <span class="qr-btn-text">QR-код</span>
               </button>`
            : `<button class="partner-qr-btn-minimal disabled" disabled title="Оплатите доступ для получения QR-кода">
                   <span class="qr-btn-text">QR-код</span>
               </button>`;

        card.innerHTML = `
            <div class="card-header">
                <div class="card-info">
                    <div class="card-name">${partner.name}</div>
                    <div class="card-designation">${partner.type}</div>
                    ${partner.rating ? `<div class="card-rating">${partner.rating}</div>` : ''}
                </div>
            </div>
            <div class="card-content">${descriptionWithHighlight}</div>
            ${partner.specialOffer ? `
                <div class="card-offer">
                    <div class="card-offer-text">${partner.specialOffer}</div>
                </div>
            ` : ''}
            <div class="card-actions">
                <button class="partner-route-btn-minimal" data-partner-index="${index}">
                    <span class="route-text">Маршрут</span>
                </button>
                ${qrButtonHTML}
            </div>
        `;

            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            content.appendChild(card);

            // Добавляем обработчик для кнопки маршрута
            const routeBtn = card.querySelector('.partner-route-btn-minimal');
            routeBtn.addEventListener('click', () => {
                openPartnerRoute(partner);
            });

            // Анимация появления при раскрытии аккордеона
            setTimeout(() => {
                card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }, 0);
        });

        // Обработчик клика на заголовок аккордеона
        header.addEventListener('click', () => {
            const isOpen = content.style.display !== 'none';

            if (isOpen) {
                // Закрываем
                content.style.display = 'none';
                header.classList.remove('active');
            } else {
                // Открываем
                content.style.display = 'grid';
                header.classList.add('active');

                // Анимация карточек при открытии
                const cards = content.querySelectorAll('.partner-card-minimal');
                cards.forEach((card, idx) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, idx * 80);
                });
            }
        });

        // Собираем аккордеон
        accordion.appendChild(header);
        accordion.appendChild(content);
        partnersGrid.appendChild(accordion);
    });

    // Добавляем кнопки оплаты внизу только если еще не оплачено
    if (!isPaid) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'partners-buttons-container';
        buttonsContainer.style.marginTop = '2rem';
        buttonsContainer.innerHTML = `
            <button class="partners-pay-btn" onclick="showPaymentModal()">
                <span class="pay-btn-text">Оплатить пакет региона</span>
                <span class="pay-btn-price">300 ₽</span>
            </button>
            <button class="partners-demo-btn" id="demoPurchaseBtn">
                <span class="demo-btn-icon">🎭</span>
                <span class="demo-btn-text">Демо-покупка</span>
            </button>
        `;
        partnersGrid.appendChild(buttonsContainer);

        // Добавляем обработчик для кнопки демо-покупки с stateful эффектом
        setTimeout(() => {
            const demoBtn = document.getElementById('demoPurchaseBtn');
            if (demoBtn) {
                demoBtn.addEventListener('click', handleDemoPurchaseStateful);
            }
        }, 0);
    }
}

// Функция показа QR для конкретного партнера по имени
function showPartnerQRByName(partnerName, partnerEmoji) {
    console.log('🔲 Показываем QR для партнера:', partnerName);

    // Используем систему QR
    if (typeof showQRModal === 'function') {
        showQRModal(partnerName, partnerEmoji);
    } else if (window.matryoshkaQR) {
        // Fallback на полноценную систему QR
        const partner = window.currentPartners?.find(p => p.name === partnerName);
        if (partner) {
            window.matryoshkaQR.showQRCode(partner);
        }
    } else {
        // Последний fallback
        showStaticQR(partnerName);
    }
}

// Функция показа QR для всех партнеров (оставляем для совместимости)
function showAllPartnersQR() {
    const partners = window.currentPartners || [];

    if (partners.length === 0) {
        showToast('❌ Партнеры не найдены');
        return;
    }

    console.log('🔲 Показываем общий QR-код для партнеров');

    // Используем полноценную систему QR от matryoshkaQR
    if (window.matryoshkaQR) {
        // Можно показать QR для первого партнера или создать общий QR
        window.matryoshkaQR.showQRCode(partners[0]);
    } else {
        // Fallback на простой QR
        showStaticQR('Партнеры региона');
    }
}

// Функция показа статического QR кода
function showStaticQR(partnerName) {
    console.log('🔲 Показываем QR-код для:', partnerName);

    // Создаем контейнер для QR кода если его нет
    let qrContainer = document.getElementById('staticQRContainer');
    if (!qrContainer) {
        qrContainer = document.createElement('div');
        qrContainer.id = 'staticQRContainer';
        qrContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(10px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(qrContainer);
    }

    qrContainer.innerHTML = `
        <div style="
            background: rgba(15, 5, 32, 0.98);
            border: 2px solid rgba(255, 204, 0, 0.4);
            border-radius: 24px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 16px 64px rgba(0,0,0,0.6);
            max-width: 90%;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        ">
            <div style="color: #ffcc00; font-weight: 700; margin-bottom: 15px; font-size: 1.2rem;">
                ${partnerName}
            </div>
            <img
                src="./city_photos/1614355077_html_c2a765adeec0a9fd.png"
                alt="QR Code"
                style="width: 200px; height: 200px; border-radius: 12px; background: white; padding: 10px;"
            />
            <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 12px;">
                Отсканируйте для получения информации
            </div>
            <button
                onclick="closeStaticQR()"
                style="
                    margin-top: 20px;
                    background: linear-gradient(135deg, rgba(255, 204, 0, 0.2), rgba(255, 107, 107, 0.2));
                    border: 1px solid rgba(255, 204, 0, 0.4);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                "
                onmouseover="this.style.background='linear-gradient(135deg, rgba(255, 204, 0, 0.3), rgba(255, 107, 107, 0.3))'"
                onmouseout="this.style.background='linear-gradient(135deg, rgba(255, 204, 0, 0.2), rgba(255, 107, 107, 0.2))'"
            >
                Закрыть
            </button>
        </div>
    `;

    // Показываем с анимацией
    setTimeout(() => {
        qrContainer.style.opacity = '1';
        const innerDiv = qrContainer.querySelector('div > div');
        if (innerDiv) innerDiv.style.transform = 'scale(1)';
    }, 50);

    // Закрытие по клику на фон
    qrContainer.onclick = (e) => {
        if (e.target === qrContainer) {
            closeStaticQR();
        }
    };
}

// Функция закрытия статического QR кода
function closeStaticQR() {
    const qrContainer = document.getElementById('staticQRContainer');
    if (qrContainer) {
        qrContainer.style.opacity = '0';
        setTimeout(() => {
            qrContainer.remove();
        }, 300);
    }
}

// Функция показа QR-кода партнера
function showPartnerQR(partnerData) {
    if (window.matryoshkaQR) {
        // Добавляем анимацию нажатия кнопки
        const btn = event.target;
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);

        // Показываем QR-код
        window.matryoshkaQR.showQRCode(partnerData);

        console.log('🔲 Показываем QR для:', partnerData.name);
    } else {
        console.error('❌ QR система не загружена');
        showToast('❌ QR-код временно недоступен');
    }
}


// Функция открытия маршрута для достопримечательности
function openRoute(attractionName) {
    // Получаем данные текущего региона
    const currentRegionId = getCurrentRegionId();
    const regionData = window.RUSSIA_REGIONS_DATA?.[currentRegionId];

    if (!regionData) {
        console.error('Регион не найден');
        return;
    }

    // Ищем достопримечательность
    const attraction = regionData.attractions.find(a => a.name === attractionName);

    // Показываем модальное окно выбора навигации
    showNavigationChoice({
        name: attractionName,
        coordinates: attraction?.coordinates,
        type: 'attraction'
    });
}

// Функция открытия маршрута для партнера
function openPartnerRoute(partner) {
    console.log('🗺️ Открываем маршрут для партнера:', partner.name);

    // Показываем модальное окно выбора навигации
    showNavigationChoice({
        name: partner.name,
        coordinates: partner.coordinates,
        type: 'partner'
    });
}

// Функция показа модального окна выбора навигации
function showNavigationChoice(place) {
    console.log('🗺️ showNavigationChoice вызвана для:', place);
    console.log('📍 Координаты:', place.coordinates);

    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.id = 'navigationModal';
    modal.className = 'navigation-modal';
    modal.setAttribute('data-auto-modal', ''); // Авто-инициализация ModalManager
    modal.innerHTML = `
        <div class="navigation-modal-overlay"></div>
        <div class="navigation-modal-content">
            <button class="navigation-modal-close">✕</button>

            <div class="navigation-modal-header">
                <h3 class="navigation-modal-title">🗺️ Выберите навигацию</h3>
                <p class="navigation-modal-subtitle">${place.name}</p>
            </div>

            <div class="navigation-options">
                <button class="navigation-option" data-nav="2gis">
                    <div class="navigation-option-icon" style="background: linear-gradient(135deg, #00a650, #008f45);">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="white">
                            <path d="M20 10C16.13 10 13 13.13 13 17c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                    </div>
                    <div class="navigation-option-info">
                        <div class="navigation-option-name">2GIS</div>
                        <div class="navigation-option-desc">Карты и навигация</div>
                    </div>
                </button>

                <button class="navigation-option" data-nav="yandex">
                    <div class="navigation-option-icon" style="background: linear-gradient(135deg, #fc3f1d, #ff0000);">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="white">
                            <text x="50%" y="55%" text-anchor="middle" font-size="24" font-weight="bold" font-family="Arial">Я</text>
                        </svg>
                    </div>
                    <div class="navigation-option-info">
                        <div class="navigation-option-name">Яндекс.Карты</div>
                        <div class="navigation-option-desc">Маршруты и навигация</div>
                    </div>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    console.log('✅ Модальное окно добавлено в DOM');

    // Добавляем обработчики событий
    const overlay = modal.querySelector('.navigation-modal-overlay');
    const closeBtn = modal.querySelector('.navigation-modal-close');
    const btn2gis = modal.querySelector('[data-nav="2gis"]');
    const btnYandex = modal.querySelector('[data-nav="yandex"]');

    overlay.addEventListener('click', closeNavigationModal);
    closeBtn.addEventListener('click', closeNavigationModal);

    btn2gis.addEventListener('click', () => {
        console.log('🗺️ Клик по 2GIS');
        openIn2GIS(place.name, place.coordinates);
    });

    btnYandex.addEventListener('click', () => {
        console.log('🗺️ Клик по Yandex');
        openInYandex(place.name, place.coordinates);
    });

    // Анимация появления
    setTimeout(() => {
        modal.classList.add('active');
        console.log('✅ Класс "active" добавлен, модальное окно должно быть видимым');
    }, 10);
}

// Функция закрытия модального окна навигации
function closeNavigationModal() {
    const modal = document.getElementById('navigationModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Функция открытия в 2GIS
function openIn2GIS(placeName, coordinates) {
    closeNavigationModal();

    // Всегда используем поиск по названию + город (как у достопримечательностей)
    const regionData = window.RUSSIA_REGIONS_DATA?.[getCurrentRegionId()];
    const cityName = regionData?.name || '';
    const searchQuery = encodeURIComponent(`${placeName} ${cityName}`);
    const url = `https://2gis.ru/search/${searchQuery}`;

    window.open(url, '_blank');
    console.log('🗺️ Открываем 2GIS:', url);
    showToast('🗺️ Открываем 2GIS');
}

// Функция открытия в Яндекс.Картах
function openInYandex(placeName, coordinates) {
    closeNavigationModal();

    // Всегда используем поиск по названию + город (как у достопримечательностей)
    const regionData = window.RUSSIA_REGIONS_DATA?.[getCurrentRegionId()];
    const cityName = regionData?.name || '';
    const searchQuery = encodeURIComponent(`${placeName} ${cityName}`);
    const url = `https://yandex.ru/maps/?text=${searchQuery}`;

    window.open(url, '_blank');
    console.log('🗺️ Открываем Яндекс.Карты:', url);
    showToast('🗺️ Открываем Яндекс.Карты');
}

// Функция получения текущего региона
function getCurrentRegionId() {
    // Пытаемся получить из URL или глобальной переменной
    if (window.currentRegionId) {
        return window.currentRegionId;
    }
    return null;
}

// ========================================
// СИСТЕМА ОПЛАТЫ РЕГИОНОВ
// ========================================

// Инициализация хранилища оплаченных регионов из sessionStorage
function initPaidRegions() {
    const saved = localStorage.getItem('paidRegions');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // Поддержка старого формата (массив ID)
            if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
                // Конвертируем старый формат в новый
                window.paidRegions = data.map(id => ({
                    id,
                    purchaseDate: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                }));
                // Сохраняем в новом формате
                localStorage.setItem('paidRegions', JSON.stringify(window.paidRegions));
            } else {
                window.paidRegions = data;
            }

            // Фильтруем истекшие
            const now = new Date();
            window.paidRegions = window.paidRegions.filter(region => {
                return new Date(region.expiresAt) > now;
            });

            // Сохраняем отфильтрованный список
            localStorage.setItem('paidRegions', JSON.stringify(window.paidRegions));
        } catch (e) {
            window.paidRegions = [];
        }
    } else {
        window.paidRegions = [];
    }
}

// Инициализируем при загрузке
initPaidRegions();

// Проверка, оплачен ли регион
function isRegionPaid(regionId) {
    initPaidRegions(); // Всегда загружаем актуальные данные и фильтруем истекшие
    return window.paidRegions.some(region => region.id === regionId);
}

// Отметить регион как оплаченный
function markRegionAsPaid(regionId) {
    initPaidRegions(); // Загружаем актуальные данные

    // Проверяем, не оплачен ли уже этот регион
    const existingRegion = window.paidRegions.find(r => r.id === regionId);
    if (existingRegion) {
        const expiresDate = new Date(existingRegion.expiresAt).toLocaleDateString('ru-RU');
        showToast(`Регион уже оплачен до ${expiresDate}`, 3000);
        return;
    }

    // Добавляем новый регион со сроком действия 7 дней
    const purchaseDate = new Date();
    const expiresAt = new Date(purchaseDate);
    expiresAt.setDate(expiresAt.getDate() + 7);

    const paidRegion = {
        id: regionId,
        purchaseDate: purchaseDate.toISOString(),
        expiresAt: expiresAt.toISOString()
    };

    window.paidRegions.push(paidRegion);

    // Сохраняем в sessionStorage
    localStorage.setItem('paidRegions', JSON.stringify(window.paidRegions));
    console.log('✅ Регион оплачен и сохранен:', regionId, paidRegion);
}

// Показать модальное окно оплаты
function showPaymentModal() {
    const currentRegionId = getCurrentRegionId();
    const regionData = window.RUSSIA_REGIONS_DATA?.[currentRegionId];
    const regionName = regionData?.name || 'региона';

    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.className = 'payment-modal';
    modal.setAttribute('data-auto-modal', ''); // Авто-инициализация ModalManager
    modal.innerHTML = `
        <div class="payment-modal-overlay"></div>
        <div class="payment-modal-content">
            <button class="payment-modal-close" onclick="closePaymentModal()">✕</button>

            <div class="payment-modal-header">
                <h3 class="payment-modal-title">💳 Оплата доступа</h3>
                <p class="payment-modal-subtitle">Пакет партнеров: ${regionName}</p>
                <div class="payment-modal-price">300 ₽</div>
            </div>

            <form class="payment-form" onsubmit="processPayment(event)">
                <div class="payment-form-group">
                    <label class="payment-label">Номер карты</label>
                    <input
                        type="text"
                        class="payment-input"
                        placeholder="0000 0000 0000 0000"
                        maxlength="19"
                        required
                    >
                </div>

                <div class="payment-form-row">
                    <div class="payment-form-group">
                        <label class="payment-label">Срок действия</label>
                        <input
                            type="text"
                            class="payment-input"
                            placeholder="MM/YY"
                            maxlength="5"
                            required
                        >
                    </div>
                    <div class="payment-form-group">
                        <label class="payment-label">CVV</label>
                        <input
                            type="text"
                            class="payment-input"
                            placeholder="***"
                            maxlength="3"
                            required
                        >
                    </div>
                </div>

                <button type="submit" class="payment-submit-btn">
                    <span class="payment-submit-icon">💳</span>
                    <span class="payment-submit-text">Оплатить 300 ₽</span>
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Анимация появления
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    // Закрытие по клику на overlay
    const overlay = modal.querySelector('.payment-modal-overlay');
    overlay.addEventListener('click', closePaymentModal);
}

// Закрыть модальное окно оплаты
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Обработка оплаты
function processPayment(event) {
    event.preventDefault();

    const currentRegionId = getCurrentRegionId();
    const regionData = window.RUSSIA_REGIONS_DATA?.[currentRegionId];

    // Имитация обработки платежа
    showLoader('Обработка платежа...');

    setTimeout(() => {
        // Отмечаем регион как оплаченный
        markRegionAsPaid(currentRegionId);

        hideLoader();
        closePaymentModal();

        // Показываем уведомление об успешной оплате
        showToast('Оплата прошла успешно', 3000);

        // Перезагружаем партнеров для обновления кнопок
        if (regionData && regionData.partners) {
            loadPartners(regionData.partners);
        }

        // 🔥 ОБНОВЛЯЕМ КОРЗИНУ
        if (window.matryoshkaCart) {
            window.matryoshkaCart.refresh();
            console.log('✅ Корзина обновлена после оплаты региона');
        }

        // Обновляем профиль если открыт
        if (window.matryoshkaProfile && window.matryoshkaProfile.updateCoupons) {
            window.matryoshkaProfile.updateCoupons();
        }

        // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Разблокируем скролл после оплаты
        if (window.ensureScrollEnabled) {
            window.ensureScrollEnabled();
        }
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.documentElement.style.overflow = 'auto';
    }, 2000);
}

// Демо-покупка со stateful эффектом
async function handleDemoPurchaseStateful(event) {
    const btn = event.currentTarget;
    const textSpan = btn.querySelector('.demo-btn-text');
    const iconSpan = btn.querySelector('.demo-btn-icon');

    if (btn.disabled) return;

    // Сохраняем оригинальный текст
    const originalText = textSpan ? textSpan.textContent : 'Демо-покупка';
    const originalIcon = iconSpan ? iconSpan.textContent : '🎭';

    // Переключаем в состояние загрузки
    btn.disabled = true;
    btn.classList.add('loading');
    if (iconSpan) iconSpan.textContent = '⏳';
    if (textSpan) textSpan.textContent = 'Обработка...';

    try {
        // Мгновенная оплата без задержек
        btn.classList.add('success');
        iconSpan.textContent = '';
        textSpan.textContent = 'Оплачено';

        // Показываем уведомление
        showToast('Оплата прошла успешно', 3000);

        // Выполняем логику покупки
        const currentRegionId = getCurrentRegionId();
        const regionData = window.RUSSIA_REGIONS_DATA?.[currentRegionId];

        // Отмечаем регион как оплаченный
        markRegionAsPaid(currentRegionId);

        // Перезагружаем партнеров для обновления кнопок
        if (regionData && regionData.partners) {
            loadPartners(regionData.partners);
        }

        // Обновляем корзину
        if (window.matryoshkaCart) {
            window.matryoshkaCart.refresh();
        }

        // Обновляем профиль
        if (window.matryoshkaProfile && window.matryoshkaProfile.updateCoupons) {
            window.matryoshkaProfile.updateCoupons();
        }

    } catch (error) {
        // Ошибка покупки
        btn.classList.remove('loading');
        btn.classList.add('error');
        iconSpan.textContent = '❌';
        textSpan.textContent = 'Ошибка';

        showToast('❌ Ошибка оплаты. Попробуйте позже.', 3000);

        // Возвращаем в исходное состояние
        setTimeout(() => {
            btn.classList.remove('error');
            btn.disabled = false;
            iconSpan.textContent = originalIcon;
            textSpan.textContent = originalText;
        }, 3000);
    }
}

// Демо-покупка (мгновенная)
function demoPurchase() {
    const currentRegionId = getCurrentRegionId();
    const regionData = window.RUSSIA_REGIONS_DATA?.[currentRegionId];

    // Отмечаем регион как оплаченный
    markRegionAsPaid(currentRegionId);

    // Показываем уведомление
    showToast('Оплата прошла успешно (Демо)', 3000);

    // Перезагружаем партнеров для обновления кнопок
    if (regionData && regionData.partners) {
        loadPartners(regionData.partners);
    }

    // 🔥 ОБНОВЛЯЕМ КОРЗИНУ
    if (window.matryoshkaCart) {
        window.matryoshkaCart.refresh();
        console.log('✅ Корзина обновлена после демо-покупки региона');
    }

    // Обновляем профиль если открыт
    if (window.matryoshkaProfile && window.matryoshkaProfile.updateCoupons) {
        window.matryoshkaProfile.updateCoupons();
    }

    // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Разблокируем скролл после покупки
    if (window.ensureScrollEnabled) {
        window.ensureScrollEnabled();
    }
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.documentElement.style.overflow = 'auto';
}

// Функция загрузки интерактивной карты 2GIS
async function load2GISMap(regionData) {
    console.log('🗺️ load2GISMap вызвана с данными:', regionData);
    console.log('📋 Партнёры в regionData:', regionData?.partners);
    console.log('📊 Количество партнёров:', regionData?.partners?.length);

    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) {
        console.warn('⚠️ Контейнер карты не найден');
        return;
    }

    // Показываем загрузчик
    mapContainer.innerHTML = `
        <div class="map-loading">
            <div class="map-loading-spinner"></div>
            <div class="map-loading-text">Загружаем карту региона...</div>
        </div>
    `;

    try {
        // Создаем интерактивную карту через наш модуль
        if (window.matryoshka2GIS) {
            console.log('✅ Модуль matryoshka2GIS найден, вызываем createMap...');
            await window.matryoshka2GIS.createMap(regionData, 'mapContainer');
        } else {
            throw new Error('Модуль карт не загружен');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки карты:', error);
        // Fallback к простой iframe карте
        loadMapFallback(regionData);
    }
}

// Функция загрузки карты (fallback)
function loadMapFallback(regionData) {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) return;

    // Получаем центр региона
    const center = getRegionCenterCoords(regionData.id);

    mapContainer.innerHTML = `
        <iframe
            src="https://widgets.2gis.com/widget?id=DgWidget_map&opt=%7B%22pos%22%3A%7B%22lat%22%3A${center.lat}%2C%22lon%22%3A${center.lon}%2C%22zoom%22%3A${center.zoom}%7D%2C%22opt%22%3A%7B%22city%22%3A%22${regionData.name}%22%7D%7D"
            width="100%"
            height="100%"
            frameborder="0"
            allowfullscreen=""
            style="border-radius: 16px;"
        ></iframe>
    `;
}

// Функция получения координат центра региона
function getRegionCenterCoords(regionId) {
    const centers = {
        'moscow': { lat: 55.7558, lon: 37.6176, zoom: 10 },
        'spb': { lat: 59.9311, lon: 30.3351, zoom: 10 },
        'kazan': { lat: 55.7887, lon: 49.1221, zoom: 11 },
        'sochi': { lat: 43.6028, lon: 39.7303, zoom: 11 },
        'ekaterinburg': { lat: 56.8431, lon: 60.6122, zoom: 11 },
        'volgograd': { lat: 48.7194, lon: 44.5018, zoom: 11 },
        'irkutsk': { lat: 52.2978, lon: 104.2964, zoom: 11 },
        'kaliningrad': { lat: 54.7065, lon: 20.5083, zoom: 11 },
        'nizhnynovgorod': { lat: 56.2965, lon: 44.0020, zoom: 11 },
        'chelyabinsk': { lat: 55.1644, lon: 61.4291, zoom: 11 },
        'karachaevo': { lat: 43.7681, lon: 42.0577, zoom: 10 },
        'stavropol': { lat: 45.0428, lon: 41.9734, zoom: 11 },
        'yaroslavl': { lat: 57.6261, lon: 39.8844, zoom: 11 },
        'kostroma': { lat: 57.7665, lon: 40.9266, zoom: 11 },
        'kabardino': { lat: 43.4806, lon: 43.4917, zoom: 10 }
    };

    return centers[regionId] || { lat: 55.7558, lon: 37.6176, zoom: 10 };
}

// 🔥 УДАЛЕНО: Функции теперь определены ТОЛЬКО в navigation.js
// Дублирование функций вызывало конфликты навигации

// Функция показа лоадера
function showLoader(text = 'Загрузка...') {
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loaderText');

    if (loader) loader.classList.add('active');
    if (loaderText) loaderText.textContent = text;
}

// Функция скрытия лоадера
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('active');
}


// 🔥 УДАЛЕНО: Функции showProfile и hideProfile теперь определены ТОЛЬКО в navigation.js

// Функция совместимости для старого кода (удалена встроенная версия)

/**
 * 🔥 УДАЛЕНО: Лента путешествий больше не отображается на главной странице
 * Доступна через отдельную вкладку "Лента" в нижней навигации
 */
function loadMainFeedSection() {
    // Пустая функция для совместимости
    console.log('ℹ️ Лента путешествий доступна через вкладку "Лента"');
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🪆 Матрешка - инициализация приложения');

    // Загружаем данные регионов
    loadRegionsData();

    // Отображаем информацию о пользователе
    displayUserInfo();

    // Загружаем регионы
    loadRegions();

    // 🍎 ИНИЦИАЛИЗАЦИЯ APPLE CARDS CAROUSEL для пакетов
    // Инициализация компонентов без задержки
    if (window.TRAVEL_PACKAGES && window.AppleCardsCarousel) {
        const packagesCarousel = new AppleCardsCarousel({
            containerId: 'applePackagesCarousel',
            title: 'Готовые пакеты путешествий',
            cards: window.TRAVEL_PACKAGES,
            showNavButtons: true,
            showDots: false,
            onCardClick: (card) => {
                console.log('🍎 Клик на пакет:', card.name);
                // Вызываем существующую функцию показа деталей пакета
                if (typeof showPackageModal === 'function') {
                    showPackageModal(card.id);
                }
            }
        });
        window.applePackagesCarousel = packagesCarousel;
        console.log('✅ Apple Cards Carousel инициализирован с', window.TRAVEL_PACKAGES.length, 'пакетами');
    } else {
        console.error('❌ TRAVEL_PACKAGES или AppleCardsCarousel не найдены');
    }

    // 🎨 ИНИЦИАЛИЗАЦИЯ ANIMATED TOOLTIP для команды
    if (window.AnimatedTooltip) {
        const teamMembers = [
            {
                id: 1,
                name: 'Егор Говоруха',
                designation: 'Капитан команды',
                image: 'assets/images/TeamPhotos/Говоруха Егор.png'
            },
            {
                id: 2,
                name: 'Юлия Антонова',
                designation: 'Дизайнер • Аналитик',
                image: 'assets/images/TeamPhotos/Антонова Юлия.png'
            },
            {
                id: 3,
                name: 'Михаил Флёр',
                designation: 'Аналитик',
                image: 'assets/images/TeamPhotos/Флёр Михаил.png'
            },
            {
                id: 4,
                name: 'Александр Цыпкайкин',
                designation: 'Программист-разработчик',
                image: 'assets/images/TeamPhotos/Цыпкайкин Александр.png'
            }
        ];

        const animatedTooltip = new AnimatedTooltip({
            containerId: 'animatedTooltipContainer',
            items: teamMembers
        });

        window.animatedTooltip = animatedTooltip;
        console.log('✅ Animated Tooltip инициализирован с', teamMembers.length, 'членами команды');
    }

    // 🔥 УДАЛЕНО: Лента путешествий больше не загружается на главную страницу

    // 🔥 ВОССТАНАВЛИВАЕМ ПОСЛЕДНЮЮ АКТИВНУЮ ВКЛАДКУ СРАЗУ
    restoreActiveSection();

    // Обработчик кнопки "Назад"
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }

    // 🔥 УДАЛЕНО: Обработчик для profileBackBtn уже есть в navigation.js

    // Инициализация Telegram Web App
    if (tg) {
        console.log('✅ Telegram Web App готов к работе');

        // Настройки главной кнопки
        if (tg.MainButton) {
            tg.MainButton.text = 'Главная';
            tg.MainButton.onClick(() => goBack());
        }
    }

    console.log('🚀 Матрешка - приложение готово к работе');

    // Скрываем лоадер после загрузки
    hideLoader();
});
// ========================================
// BREADCRUMBS НАВИГАЦИЯ
// ========================================

function updateBreadcrumbs(regionName) {
    const breadcrumbRegion = document.getElementById('breadcrumbRegion');
    if (breadcrumbRegion && regionName) {
        breadcrumbRegion.textContent = regionName;
    }
}

// ========================================
// ФУНКЦИИ ДЛЯ КОРЗИНЫ И НИЖНЕЙ НАВИГАЦИИ
// ========================================

// 🔥 УДАЛЕНО: Функции showCart, hideCart, showFeed теперь определены ТОЛЬКО в navigation.js

/**
 * Обновление активной кнопки в нижней навигации
 */
function updateBottomNav(activePage) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.dataset.page === activePage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 🔥 УДАЛЕНО: Обработчик для cartBackBtn уже есть в navigation.js
