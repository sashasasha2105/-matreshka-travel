// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
    console.log('Telegram Web App инициализирован');
}

// Глобальная лента путешествий
let globalTravelFeed = [
    {
        id: 1,
        author: 'Путешественник',
        avatar: '👤',
        time: '2 часа назад',
        title: 'Красоты Санкт-Петербурга',
        image: './assets/travel1.jpg',
        text: 'Удивительное путешествие по культурной столице России. Эрмитаж поразил своими коллекциями!'
    },
    {
        id: 2,
        author: 'Путешественник',
        avatar: '👤',
        time: '5 часов назад',
        title: 'Золотое кольцо России',
        image: './assets/travel2.jpg',
        text: 'Проехал все города Золотого кольца. Особенно впечатлил Суздаль с его древними храмами.'
    }
];

// Глобальные переменные

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
        userNameEl.innerHTML = `Привет, ${user.first_name}!`;
    } else {
        userNameEl.innerHTML = 'Добро пожаловать!';
    }
}

// Функция поиска регионов
function searchRegions(query) {
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

// Функция загрузки регионов с пагинацией
function loadRegions() {
    console.log('🔄 Вызвана loadRegions()');
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

    if (currentPage === 0) {
        // Первая загрузка - очищаем все и показываем первые 6
        regionsGrid.innerHTML = '';
        const regionsToShow = filteredRegions.slice(0, REGIONS_PER_PAGE);

        regionsToShow.forEach((region, index) => {
            const regionCard = createRegionCard(region, index);
            regionsGrid.appendChild(regionCard);
        });
    } else {
        // Дополнительная загрузка - добавляем следующие 6
        const startIndex = currentPage * REGIONS_PER_PAGE;
        const endIndex = startIndex + REGIONS_PER_PAGE;
        const regionsToShow = filteredRegions.slice(startIndex, endIndex);

        regionsToShow.forEach((region, index) => {
            const regionCard = createRegionCard(region, startIndex + index);
            regionsGrid.appendChild(regionCard);
        });
    }

    // Обновляем кнопку "Показать больше"
    updateLoadMoreButton();

    // Загружаем ленту путешествий после первой загрузки
    if (currentPage === 0) {
        loadTravelFeed();
    }
}

// Создание карточки региона
function createRegionCard(region, animationIndex) {
    const regionCard = document.createElement('div');
    regionCard.className = 'region-card';
    regionCard.onclick = () => showRegionDetails(region.id);

    regionCard.innerHTML = `
        <img src="${region.image}" alt="${region.name}" class="region-image" loading="lazy">
        <div class="region-content">
            <div class="region-name">${region.name}</div>
            <div class="region-description">${region.description}</div>
            <div class="region-stats">
                <span>👥 ${region.population}</span>
                <span>📐 ${region.area}</span>
            </div>
        </div>
    `;

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
            <button class="load-more-btn" onclick="loadMoreRegions()">
                <span class="load-more-icon">⬇️</span>
                <span class="load-more-text">Показать еще ${nextBatchSize} ${nextBatchSize === 1 ? 'регион' : nextBatchSize < 5 ? 'региона' : 'регионов'}</span>
                <span class="load-more-count">(осталось ${remainingRegions})</span>
            </button>
        `;
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

    // Имитируем загрузку для плавности
    setTimeout(() => {
        loadRegions();
    }, 800);
}

// Функция загрузки ленты путешествий
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
        postElement.className = 'feed-post';

        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-avatar">${post.avatar}</div>
                <div class="post-author">
                    <div class="post-name">${post.author}</div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            <div class="post-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="post-content">
                <div class="post-title">${post.title}</div>
                <div class="post-text">${post.text}</div>
            </div>
        `;

        // Анимация появления через CSS
        postElement.style.animation = `fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 100 + 500}ms forwards`;
        postElement.style.opacity = '0';

        travelFeed.appendChild(postElement);
    });
}

// Функция загрузки пакетов путешествий
function loadTravelPackages() {
    const packagesContainer = document.createElement('div');
    packagesContainer.className = 'packages-section';
    packagesContainer.innerHTML = `
        <div class="packages-header">
            <h2 class="packages-title">
                <span class="packages-icon">🎒</span>
                Готовые пакеты путешествий
                <span class="packages-subtitle">Лучшие маршруты по России</span>
            </h2>
        </div>
        <div class="packages-grid" id="packagesGrid">
            ${generatePackagesHTML()}
        </div>
    `;

    // Вставляем после регионов но перед лентой путешествий
    const travelFeedSection = document.querySelector('.travel-feed-section');
    if (travelFeedSection) {
        travelFeedSection.parentNode.insertBefore(packagesContainer, travelFeedSection);
    }
}

// Генерация HTML для пакетов
function generatePackagesHTML() {
    return travelPackages.map((pkg, index) => `
        <div class="package-card" onclick="showPackageDetails('${pkg.id}')" style="animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 200}ms forwards; opacity: 0;">
            <div class="package-image-container">
                <img src="${pkg.image}" alt="${pkg.name}" class="package-image" loading="lazy">
                <div class="package-overlay">
                    <div class="package-price">${pkg.price}</div>
                    <div class="package-duration">⏱️ ${pkg.duration}</div>
                </div>
            </div>
            <div class="package-content">
                <div class="package-header">
                    <div class="package-emoji">${pkg.emoji}</div>
                    <div class="package-info">
                        <div class="package-name">${pkg.name}</div>
                        <div class="package-description">${pkg.description}</div>
                    </div>
                </div>
                <div class="package-highlights">
                    ${pkg.highlights.map(highlight => `<span class="package-highlight">✨ ${highlight}</span>`).join('')}
                </div>
                <div class="package-regions">
                    <strong>Города:</strong> ${pkg.regions.join(' • ')}
                </div>
            </div>
        </div>
    `).join('');
}

// Показать детали пакета (заглушка)
function showPackageDetails(packageId) {
    const pkg = travelPackages.find(p => p.id === packageId);
    if (!pkg) return;

    // Показываем уведомление о том, что функция в разработке
    showToast(`🎒 Пакет "${pkg.name}" скоро будет доступен для бронирования!`);
}

// Функция показа уведомлений
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'matryoshka-toast';
    toast.textContent = message;

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #ffcc00, #ff8e53)',
        color: '#1a1a2e',
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '14px',
        zIndex: '10000',
        boxShadow: '0 8px 32px rgba(255, 204, 0, 0.3)',
        animation: 'fadeInUp 0.3s ease-out'
    });

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Функция добавления поста в ленту
function addToGlobalFeed(travel) {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
    const userName = user.first_name || 'Путешественник';

    const newPost = {
        id: Date.now(),
        author: userName,
        avatar: '👤',
        time: 'только что',
        title: travel.title,
        image: travel.image,
        text: travel.text
    };

    // Добавляем в начало ленты
    globalTravelFeed.unshift(newPost);

    // Перезагружаем ленту
    loadTravelFeed();

    console.log('🌟 Путешествие добавлено в ленту:', newPost);
}

// Функция показа деталей региона
function showRegionDetails(regionId) {
    const region = russiaRegions.find(r => r.id === regionId);
    if (!region) return;

    // Сохраняем ID текущего региона
    window.currentRegionId = regionId;

    // Показываем лоадер
    showLoader('Загрузка информации о регионе...');

    setTimeout(() => {
        try {
            // Скрываем главную страницу
            const mainSection = document.getElementById('mainSection');
            if (mainSection) mainSection.style.display = 'none';

            // Показываем детали региона
            const detailsSection = document.getElementById('regionDetails');
            if (detailsSection) detailsSection.style.display = 'block';

            // Заполняем данные
            const regionTitle = document.getElementById('regionTitle');
            const regionDescription = document.getElementById('regionDescription');
            const regionImage = document.getElementById('regionImage');
            const regionAbout = document.getElementById('regionAbout');

            if (regionTitle) regionTitle.innerHTML = `${region.emoji} ${region.name}`;
            if (regionDescription) regionDescription.textContent = region.description;
            if (regionImage) regionImage.src = region.image;
            if (regionAbout) regionAbout.textContent = region.about;

            // Обновляем breadcrumbs
            updateBreadcrumbs(region.name);

            // Заполняем достопримечательности
            loadAttractions(region.attractions);

            // Загружаем партнеров
            loadPartners(region.partners);

            // Загружаем интерактивную карту 2GIS
            load2GISMap(region).catch(mapError => {
                console.warn('⚠️ Ошибка загрузки карты:', mapError);
                // Fallback к старой системе
                loadMapFallback(region);
            });

            hideLoader();

            // Уведомление Telegram
            if (tg && tg.showAlert) {
                tg.showAlert(`Добро пожаловать в ${region.name}!`);
            }
        } catch (error) {
            console.error('❌ Ошибка отображения региона:', error);
            hideLoader();
        }
    }, 800);
}

// Функция загрузки достопримечательностей (скрытое описание с кнопкой раскрыть)
function loadAttractions(attractions) {
    const attractionsList = document.getElementById('attractionsList');
    if (!attractionsList) return;

    attractionsList.innerHTML = '';
    attractions.forEach((attraction, index) => {
        const li = document.createElement('li');
        const uniqueId = `attraction-${index}`;
        li.innerHTML = `
            <div class="attraction-header">
                <span class="attraction-name">${attraction.name}</span>
                <button class="action-btn route-btn" onclick="openRoute('${attraction.name}')">
                    <span class="route-icon">🗺️</span>
                    <span class="route-text">Маршрут</span>
                </button>
            </div>
            <div class="attraction-info-auto" id="${uniqueId}" style="display: none;">${attraction.info}</div>
            <button class="toggle-description-btn" onclick="toggleAttractionDescription('${uniqueId}', this)">
                <span class="toggle-icon">▼</span>
                <span class="toggle-text">Раскрыть описание</span>
            </button>
        `;
        li.style.opacity = '0';
        li.style.transform = 'translateX(-30px)';
        attractionsList.appendChild(li);

        // Анимация появления через CSS
        li.style.animation = `fadeInLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 100}ms forwards`;
    });
}

// Функция переключения видимости описания достопримечательности
function toggleAttractionDescription(elementId, button) {
    const infoElement = document.getElementById(elementId);
    const icon = button.querySelector('.toggle-icon');
    const text = button.querySelector('.toggle-text');

    if (infoElement.style.display === 'none') {
        infoElement.style.display = 'block';
        infoElement.style.animation = 'fadeInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        icon.textContent = '▲';
        text.textContent = 'Скрыть описание';
    } else {
        infoElement.style.display = 'none';
        icon.textContent = '▼';
        text.textContent = 'Раскрыть описание';
    }
}

// Функция загрузки партнеров с QR-кодами
function loadPartners(partners) {
    const partnersGrid = document.getElementById('partnersGrid');
    if (!partnersGrid) return;

    partnersGrid.innerHTML = '';

    partners.forEach((partner, index) => {
        const card = document.createElement('div');
        card.className = 'partner-card';
        card.innerHTML = `
            <div class="partner-image">${partner.emoji}</div>
            <div class="partner-info">
                <div class="partner-name">${partner.name}</div>
                <div class="partner-type">${partner.type}</div>
                <div class="partner-description">${partner.description}</div>
                <div class="partner-rating">
                    <span>⭐</span>
                    <span>${partner.rating}</span>
                    <span style="color: rgba(255,255,255,0.5);">(отзывы)</span>
                </div>
                <button class="partner-qr-btn">
                    <span class="qr-btn-icon">📱</span>
                    Получить QR
                </button>
            </div>
        `;
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        partnersGrid.appendChild(card);

        // Добавляем обработчик для кнопки QR
        const qrButton = card.querySelector('.partner-qr-btn');
        if (qrButton) {
            qrButton.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('🔲 Клик по кнопке QR для:', partner.name);

                // Используем полноценную систему QR от matryoshkaQR
                if (window.matryoshkaQR) {
                    window.matryoshkaQR.showQRCode(partner);
                } else {
                    // Fallback на простой QR
                    showStaticQR(partner.name);
                }
            });
        }

        // Анимация появления
        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
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

    if (attraction && attraction.gisLink) {
        // Открываем ссылку на 2GIS
        window.open(attraction.gisLink, '_blank');
        console.log('🗺️ Открываем 2GIS для:', attractionName);
    } else {
        // Fallback - поиск по названию в 2GIS
        const searchQuery = encodeURIComponent(attractionName);
        const cityName = regionData.name || 'moscow';
        const routeUrl = `https://2gis.ru/search/${searchQuery}`;
        window.open(routeUrl, '_blank');
        console.log('🗺️ Открываем поиск 2GIS для:', attractionName);
    }
}

// Функция получения текущего региона
function getCurrentRegionId() {
    // Пытаемся получить из URL или глобальной переменной
    if (window.currentRegionId) {
        return window.currentRegionId;
    }
    return null;
}

// Функция загрузки интерактивной карты 2GIS
async function load2GISMap(regionData) {
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

// Функция возврата на главную
function goBack() {
    const detailsSection = document.getElementById('regionDetails');
    const mainSection = document.getElementById('mainSection');

    // Закрываем QR код если открыт
    closeStaticQR();

    // Очищаем карту при выходе
    if (window.matryoshka2GIS) {
        window.matryoshka2GIS.destroy();
    }

    if (detailsSection) detailsSection.style.display = 'none';
    if (mainSection) mainSection.style.display = 'block';
}

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


// Показать профиль
function showProfile() {
    // Скрываем главную страницу и детали региона
    document.getElementById('mainSection').style.display = 'none';
    document.getElementById('regionDetails').style.display = 'none';

    // Показываем профиль
    const profileSection = document.getElementById('profileSection');
    profileSection.style.display = 'block';

    // Инициализируем профиль Матрешка
    if (window.matryoshkaProfile) {
        window.matryoshkaProfile.loadProfileData();
    } else {
        // Запускаем инициализацию профиля
        setTimeout(() => {
            if (window.initProfile) {
                window.initProfile();
            }
        }, 100);
    }
}

// Скрыть профиль
function hideProfile() {
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('mainSection').style.display = 'block';
}

// Функция совместимости для старого кода (удалена встроенная версия)

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🪆 Матрешка - инициализация приложения');

    // Загружаем данные регионов
    loadRegionsData();

    // Отображаем информацию о пользователе
    displayUserInfo();

    // Загружаем регионы
    loadRegions();

    // Загружаем пакеты путешествий
    setTimeout(() => {
        loadTravelPackages();
    }, 1000);

    // Обработчик кнопки "Назад"
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }

    // Обработчик кнопки "Назад" в профиле
    const profileBackBtn = document.getElementById('profileBackBtn');
    if (profileBackBtn) {
        profileBackBtn.addEventListener('click', hideProfile);
    }

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
// КНОПКА "НАВЕРХ"
// ========================================

(function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!scrollToTopBtn) return;

    // Показываем/скрываем кнопку при скролле
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrolled > 400) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
        
        // Добавляем небольшую задержку для плавности
        scrollTimeout = setTimeout(() => {
            // Дополнительная логика если нужна
        }, 100);
    }, { passive: true });

    // Плавная прокрутка наверх при клике
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    console.log('✅ Кнопка "Наверх" инициализирована');
})();
