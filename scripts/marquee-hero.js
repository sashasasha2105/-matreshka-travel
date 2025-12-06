/**
 * 3D Marquee Hero Section Script
 * Инициализирует 3D Marquee на главной странице
 */

// Фотографии регионов России - расширенный список
const regionImages = [
    "assets/images/city_photos/Moscow.jpg",
    "assets/images/city_photos/Piter.png",
    "assets/images/city_photos/kazan.jpg",
    "assets/images/city_photos/sochi.jpg",
    "assets/images/city_photos/Ecater.jpg",
    "assets/images/city_photos/GOLDRING.jpg",
    "assets/images/city_photos/кавказ.jpg",
    "assets/images/city_photos/Волгоградская республика.jpg",
    "assets/images/city_photos/байкал.jpg",
    "assets/images/city_photos/екб.jpg",
    "assets/images/city_photos/Иркутская область.jpg",
    "assets/images/city_photos/Калининград.jpg",
    "assets/images/city_photos/Костромская область.jpg",
    "assets/images/city_photos/Краснодар.jpg",
    "assets/images/city_photos/Нижегородская область.jpg",
    "assets/images/city_photos/Челябинская область.jpg",
    "assets/images/city_photos/Ярославская область.jpg",
    "assets/images/city_photos/Дагестан.jpeg",
    "assets/images/city_photos/Чечня.jpg",
    "assets/images/city_photos/ингушетия.jpg",
    "assets/images/city_photos/кострома.jpg",
    "assets/images/city_photos/нижний новгород.jpg",
    "assets/images/city_photos/ставрополь.jpg",
    "assets/images/city_photos/челябинск.jpg",
    "assets/images/city_photos/ярославль.jpg",
    "assets/images/city_photos/Кабардино-Балкария.jpg",
    // Дополнительные повторения для большего количества контента
    "assets/images/city_photos/Moscow.jpg",
    "assets/images/city_photos/Piter.png",
    "assets/images/city_photos/kazan.jpg",
    "assets/images/city_photos/sochi.jpg",
    "assets/images/city_photos/Ecater.jpg",
    "assets/images/city_photos/GOLDRING.jpg",
    "assets/images/city_photos/кавказ.jpg",
    "assets/images/city_photos/Волгоградская республика.jpg",
    "assets/images/city_photos/байкал.jpg",
    "assets/images/city_photos/екб.jpg",
    "assets/images/city_photos/Иркутская область.jpg",
    "assets/images/city_photos/Калининград.jpg",
    "assets/images/city_photos/Костромская область.jpg",
    "assets/images/city_photos/Краснодар.jpg",
    "assets/images/city_photos/Нижегородская область.jpg",
    "assets/images/city_photos/Челябинская область.jpg",
    "assets/images/city_photos/Ярославская область.jpg",
    "assets/images/city_photos/Дагестан.jpeg",
    "assets/images/city_photos/Чечня.jpg",
    "assets/images/city_photos/ингушетия.jpg",
];

// Партнеры с акциями и скидками (культурные заведения и достопримечательности)
const partners = [
    { emoji: '🎭', name: 'Большой театр', type: 'Театр', discount: '30%', offer: 'Билеты со скидкой' },
    { emoji: '🏛️', name: 'Эрмитаж', type: 'Музей', discount: '25%', offer: 'Экскурсия бесплатно' },
    { emoji: '🌊', name: 'Петергоф', type: 'Парк-музей', discount: '20%', offer: 'Фонтаны + парк' },
    { emoji: '🎪', name: 'Цирк на Цветном', type: 'Развлечения', discount: '20%', offer: 'Детский билет -50%' },
    { emoji: '🏰', name: 'Кремль', type: 'Исторический памятник', discount: '15%', offer: 'Аудиогид в подарок' },
    { emoji: '🎨', name: 'Третьяковская галерея', type: 'Галерея', discount: '20%', offer: 'Мастер-класс бесплатно' },
    { emoji: '🎼', name: 'Мариинский театр', type: 'Оперный театр', discount: '25%', offer: 'Экскурсия за кулисы' },
    { emoji: '🕌', name: 'Казанский кремль', type: 'Музей-заповедник', discount: '18%', offer: 'Экскурсия в подарок' },
    { emoji: '⛪', name: 'Храм Спаса на Крови', type: 'Собор-музей', discount: '15%', offer: 'Аудиогид включен' },
    { emoji: '🌿', name: 'Санаторий Кавказ', type: 'Оздоровление', discount: '15%', offer: 'SPA в подарок' },
    { emoji: '🏨', name: 'Отель Метрополь', type: 'Гостиница', discount: '25%', offer: 'Завтрак бесплатно' },
    { emoji: '🚗', name: 'Прокат авто', type: 'Аренда', discount: '15%', offer: 'День в подарок' },
    { emoji: '🎿', name: 'Роза Хутор', type: 'Горнолыжный курорт', discount: '30%', offer: 'Скипасс +1 день' },
    { emoji: '🏖️', name: 'Пляжный клуб', type: 'Отдых в Сочи', discount: '20%', offer: 'Шезлонг бесплатно' },
    { emoji: '🏺', name: 'Русский музей', type: 'Музей', discount: '22%', offer: 'Семейный билет -30%' },
    { emoji: '🎻', name: 'Филармония', type: 'Концертный зал', discount: '20%', offer: 'Балкон бесплатно' },
    { emoji: '🏯', name: 'Новодевичий монастырь', type: 'Музей-заповедник', discount: '18%', offer: 'Экскурсия включена' },
    { emoji: '🗿', name: 'Царское Село', type: 'Дворец-музей', discount: '25%', offer: 'Янтарная комната' },
    { emoji: '🎬', name: 'Мосфильм', type: 'Киностудия-музей', discount: '20%', offer: 'Экскурсия по павильонам' },
    { emoji: '🌌', name: 'Планетарий', type: 'Научно-просветительский', discount: '15%', offer: 'Сеанс в подарок' },
];

// Функция создания SVG карточки партнера
function createPartnerCard(partner) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
            <defs>
                <linearGradient id="grad-${partner.name}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:rgb(99,102,241);stop-opacity:1" />
                    <stop offset="100%" style="stop-color:rgb(192,132,252);stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#grad-${partner.name})" rx="16"/>
            <rect x="10" y="10" width="380" height="280" fill="rgba(255,255,255,0.1)" rx="12" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>

            <text x="200" y="80" font-size="60" text-anchor="middle" fill="white">${partner.emoji}</text>

            <text x="200" y="130" font-size="24" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">${partner.name}</text>
            <text x="200" y="155" font-size="14" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif">${partner.type}</text>

            <rect x="120" y="175" width="160" height="40" fill="rgba(255,255,255,0.2)" rx="20"/>
            <text x="200" y="200" font-size="22" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">СКИДКА ${partner.discount}</text>

            <text x="200" y="240" font-size="14" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif">${partner.offer}</text>

            <circle cx="40" cy="260" r="8" fill="rgba(255,255,255,0.5)"/>
            <circle cx="60" cy="260" r="8" fill="rgba(255,255,255,0.5)"/>
            <circle cx="80" cy="260" r="8" fill="rgba(255,255,255,0.5)"/>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

// Создаем массив изображений партнеров
const partnerImages = partners.map(createPartnerCard);

// Смешиваем фото регионов и карточки партнеров
const marqueeImages = [];
const totalImages = 120; // Значительно увеличили количество карточек для стабильной работы

for (let i = 0; i < totalImages; i++) {
    if (i % 3 === 0) {
        // Каждый третий - партнер
        marqueeImages.push(partnerImages[i % partnerImages.length]);
    } else {
        // Остальные - регионы
        marqueeImages.push(regionImages[i % regionImages.length]);
    }
}

function initMarqueeHero() {
    const grid = document.getElementById('marqueeGridMain');
    if (!grid) return;

    // Определяем количество колонок в зависимости от ширины экрана
    const isMobile = window.innerWidth <= 768;
    const numColumns = isMobile ? 2 : 4;
    const imagesPerColumn = Math.ceil(marqueeImages.length / numColumns);

    // Очищаем grid перед добавлением колонок
    grid.innerHTML = '';

    for (let col = 0; col < numColumns; col++) {
        const column = document.createElement('div');
        column.className = 'marquee-column-main';

        // Получаем изображения для этой колонки
        const columnImages = marqueeImages.slice(col * imagesPerColumn, (col + 1) * imagesPerColumn);

        // Увеличиваем количество повторений до 6 раз для бесшовной прокрутки
        const repeatedImages = [];
        for (let i = 0; i < 6; i++) {
            repeatedImages.push(...columnImages);
        }

        repeatedImages.forEach(imgSrc => {
            const item = document.createElement('div');
            item.className = 'marquee-item-main';

            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = 'Регион России или партнер';
            img.loading = 'lazy';

            // Добавляем обработку ошибок загрузки
            img.onerror = function() {
                this.style.display = 'none';
            };

            item.appendChild(img);
            column.appendChild(item);
        });

        grid.appendChild(column);
    }

    console.log(`✅ 3D Marquee инициализирован на главной странице (${numColumns} колонок, ${marqueeImages.length} изображений)`);
}

// Переинициализация при изменении размера окна
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const grid = document.getElementById('marqueeGridMain');
        if (grid) {
            const currentColumns = grid.children.length;
            const shouldHaveColumns = window.innerWidth <= 768 ? 2 : 4;

            // Переинициализируем только если количество колонок изменилось
            if (currentColumns !== shouldHaveColumns) {
                initMarqueeHero();
            }
        }
    }, 300);
});

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarqueeHero);
} else {
    initMarqueeHero();
}
