/**
 * Готовые пакеты путешествий по России
 */

const TRAVEL_PACKAGES = [
    {
        id: 'golden-ring-classic',
        name: 'Золотое кольцо России - Классический',
        duration: '5 дней / 4 ночи',
        price: 25900,
        oldPrice: 35900,
        image: 'city_photos/GOLDRING.jpg',
        description: 'Путешествие по древним городам России с посещением главных достопримечательностей',
        cities: ['Москва', 'Владимир', 'Суздаль', 'Ярославль', 'Кострома'],
        routes: [
            {
                id: 1,
                name: 'Маршрут 1: Комфорт',
                hotels: [
                    {
                        name: 'Гостиница "Золотое кольцо" 4*',
                        city: 'Владимир',
                        link: 'https://www.booking.com',
                        mapLink: 'https://2gis.ru/vladimir/firm/70000001018194711'
                    },
                    {
                        name: 'Отель "Пушкарская слобода" 4*',
                        city: 'Суздаль',
                        link: 'https://www.booking.com',
                        mapLink: 'https://2gis.ru/suzdal/firm/70000001045558503'
                    }
                ],
                programs: [
                    {
                        name: 'Экскурсия "Владимирские святыни"',
                        description: 'Посещение Успенского и Дмитриевского соборов',
                        duration: '3 часа',
                        link: 'https://www.tripadvisor.ru',
                        mapLink: 'https://2gis.ru/vladimir/geo/70000001057919154'
                    },
                    {
                        name: 'Экскурсия по Суздальскому кремлю',
                        description: 'Древнейшая часть города с уникальной архитектурой',
                        duration: '2.5 часа',
                        link: 'https://www.tripadvisor.ru',
                        mapLink: 'https://2gis.ru/suzdal/geo/4504235284644536'
                    }
                ]
            },
            {
                id: 2,
                name: 'Маршрут 2: Эконом',
                hotels: [
                    {
                        name: 'Гостиница "Заря" 3*',
                        city: 'Владимир',
                        link: 'https://www.booking.com',
                        mapLink: 'https://2gis.ru/vladimir/firm/70000001018428266'
                    },
                    {
                        name: 'Мини-отель "Светлый терем" 3*',
                        city: 'Суздаль',
                        link: 'https://www.booking.com',
                        mapLink: 'https://2gis.ru/suzdal'
                    }
                ],
                programs: [
                    {
                        name: 'Обзорная экскурсия по Владимиру',
                        description: 'Знакомство с городом и его историей',
                        duration: '2 часа',
                        link: 'https://www.tripadvisor.ru',
                        mapLink: 'https://2gis.ru/vladimir'
                    },
                    {
                        name: 'Прогулка по Суздалю',
                        description: 'Посещение основных достопримечательностей',
                        duration: '2 часа',
                        link: 'https://www.tripadvisor.ru',
                        mapLink: 'https://2gis.ru/suzdal'
                    }
                ]
            }
        ]
    },
    {
        id: 'spb-express',
        name: 'Санкт-Петербург Экспресс',
        duration: '3 дня / 2 ночи',
        price: 18900,
        oldPrice: 26900,
        image: 'city_photos/__medium_утр.jpg.jpg',
        description: 'Интенсивное знакомство с Северной столицей за 3 дня',
        cities: ['Санкт-Петербург', 'Петергоф', 'Пушкин'],
        routes: [
            {
                id: 1,
                name: 'Маршрут 1: Премиум',
                hotels: [
                    {
                        name: 'Отель "Астория" 5*',
                        city: 'Санкт-Петербург',
                        link: 'https://www.booking.com',
                        mapLink: 'https://2gis.ru/spb/firm/5348267584968002'
                    }
                ],
                programs: [
                    {
                        name: 'Обзорная экскурсия по Петербургу',
                        description: 'Дворцовая площадь, Невский проспект, Петропавловская крепость',
                        duration: '4 часа',
                        link: 'https://www.sputnik8.com',
                        mapLink: 'https://2gis.ru/spb/geo/4504735310190933'
                    },
                    {
                        name: 'Эрмитаж - главный музей России',
                        description: 'Экскурсия по залам Эрмитажа с гидом',
                        duration: '3 часа',
                        link: 'https://www.hermitagemuseum.org',
                        mapLink: 'https://2gis.ru/spb/firm/5348139525657555'
                    },
                    {
                        name: 'Петергоф - Русский Версаль',
                        description: 'Посещение дворцово-паркового ансамбля с фонтанами',
                        duration: '4 часа',
                        link: 'https://peterhofmuseum.ru',
                        mapLink: 'https://2gis.ru/spb/firm/70000001023143971'
                    }
                ]
            },
            {
                id: 2,
                name: 'Маршрут 2: Стандарт',
                hotels: [
                    {
                        name: 'Отель "Невский Форум" 4*',
                        city: 'Санкт-Петербург',
                        link: 'https://www.booking.com',
                        mapLink: 'https://2gis.ru/spb/firm/5348165887890948'
                    }
                ],
                programs: [
                    {
                        name: 'Обзорная экскурсия по центру',
                        description: 'Главные достопримечательности Петербурга',
                        duration: '3 часа',
                        link: 'https://www.sputnik8.com',
                        mapLink: 'https://2gis.ru/spb'
                    },
                    {
                        name: 'Посещение Эрмитажа',
                        description: 'Самостоятельный осмотр с аудиогидом',
                        duration: '2.5 часа',
                        link: 'https://www.hermitagemuseum.org',
                        mapLink: 'https://2gis.ru/spb/firm/5348139525657555'
                    }
                ]
            }
        ]
    },
    {
        id: 'kazan-weekend',
        name: 'Казань - выходные в столице Татарстана',
        duration: '2 дня / 1 ночь',
        price: 12900,
        oldPrice: 18900,
        image: 'city_photos/kazan.jpg',
        description: 'Короткое, но насыщенное знакомство с третьей столицей России',
        cities: ['Казань', 'Свияжск'],
        routes: [
            {
                id: 1,
                name: 'Маршрут 1: Делюкс',
                hotels: [
                    {
                        name: 'Отель "Ногай" 5*',
                        city: 'Казань',
                        link: 'https://www.booking.com',
                        mapLink: 'https://2gis.ru/kazan/firm/70000001019472524'
                    }
                ],
                programs: [
                    {
                        name: 'Экскурсия по Казанскому Кремлю',
                        description: 'Посещение мечети Кул-Шариф, Благовещенского собора',
                        duration: '2.5 часа',
                        link: 'https://kazan-kremlin.ru',
                        mapLink: 'https://2gis.ru/kazan/firm/70000001020796215'
                    },
                    {
                        name: 'Экскурсия на остров-град Свияжск',
                        description: 'Древний город на острове с уникальной историей',
                        duration: '5 часов',
                        link: 'https://www.visit-tatarstan.com',
                        mapLink: 'https://2gis.ru/sviyazhsk'
                    },
                    {
                        name: 'Прогулка по улице Баумана',
                        description: 'Казанский Арбат с кафе, ресторанами и сувенирами',
                        duration: '1.5 часа',
                        link: 'https://www.visit-tatarstan.com',
                        mapLink: 'https://2gis.ru/kazan/geo/4504235284397051'
                    }
                ]
            },
            {
                id: 2,
                name: 'Маршрут 2: Бюджетный',
                hotels: [
                    {
                        name: 'Хостел "Kremlin" 3*',
                        city: 'Казань',
                        link: 'https://www.booking.com',
                        mapLink: 'https://2gis.ru/kazan'
                    }
                ],
                programs: [
                    {
                        name: 'Самостоятельная прогулка по Кремлю',
                        description: 'Осмотр территории с аудиогидом',
                        duration: '2 часа',
                        link: 'https://kazan-kremlin.ru',
                        mapLink: 'https://2gis.ru/kazan/firm/70000001020796215'
                    },
                    {
                        name: 'Прогулка по центру города',
                        description: 'Улица Баумана, набережная Казанки',
                        duration: '2 часа',
                        link: 'https://www.visit-tatarstan.com',
                        mapLink: 'https://2gis.ru/kazan'
                    }
                ]
            }
        ]
    },
    {
        id: 'baikal-adventure',
        name: 'Байкал - жемчужина Сибири',
        duration: '7 дней / 6 ночей',
        price: 42900,
        oldPrice: 59900,
        image: 'city_photos/baikal.jpg',
        description: 'Удивительное путешествие к самому глубокому озеру планеты',
        cities: ['Иркутск', 'Листвянка', 'Остров Ольхон'],
        routes: [
            {
                id: 1,
                name: 'Маршрут 1: Активный',
                hotels: [
                    {
                        name: 'База отдыха "Байкальская Ривьера" 4*',
                        city: 'Листвянка',
                        link: 'https://www.booking.com',
                        mapLink: 'https://2gis.ru/listvyanka'
                    },
                    {
                        name: 'Гостевой дом на Ольхоне',
                        city: 'Остров Ольхон',
                        link: 'https://www.booking.com',
                        mapLink: 'https://2gis.ru/olkhon'
                    }
                ],
                programs: [
                    {
                        name: 'Экскурсия по Иркутску',
                        description: 'Знакомство с сибирским Парижем',
                        duration: '3 часа',
                        link: 'https://www.irkutsk.ru',
                        mapLink: 'https://2gis.ru/irkutsk'
                    },
                    {
                        name: 'Круиз по Байкалу',
                        description: 'Водное путешествие с посещением бухт',
                        duration: '6 часов',
                        link: 'https://www.baikaltravel.ru',
                        mapLink: 'https://2gis.ru/listvyanka'
                    },
                    {
                        name: 'Джип-тур по острову Ольхон',
                        description: 'Посещение скалы Шаманка, мыса Хобой',
                        duration: '8 часов',
                        link: 'https://www.olkhon.ru',
                        mapLink: 'https://2gis.ru/olkhon'
                    },
                    {
                        name: 'Байкальский нерпинарий',
                        description: 'Представление с участием байкальских нерп',
                        duration: '1.5 часа',
                        link: 'https://www.baikaltravel.ru',
                        mapLink: 'https://2gis.ru/listvyanka/firm/70000001021527764'
                    }
                ]
            },
            {
                id: 2,
                name: 'Маршрут 2: Спокойный',
                hotels: [
                    {
                        name: 'Турбаза "Байкал" 3*',
                        city: 'Листвянка',
                        link: 'https://www.booking.com',
                        mapLink: 'https://2gis.ru/listvyanka'
                    }
                ],
                programs: [
                    {
                        name: 'Обзорная экскурсия по Иркутску',
                        description: 'Центр города, набережная Ангары',
                        duration: '2.5 часа',
                        link: 'https://www.irkutsk.ru',
                        mapLink: 'https://2gis.ru/irkutsk'
                    },
                    {
                        name: 'Отдых на Байкале',
                        description: 'Свободное время, прогулки по берегу',
                        duration: 'весь день',
                        link: 'https://www.baikaltravel.ru',
                        mapLink: 'https://2gis.ru/listvyanka'
                    },
                    {
                        name: 'Музей Байкала',
                        description: 'Знакомство с уникальной экосистемой озера',
                        duration: '1.5 часа',
                        link: 'https://www.baikaltravel.ru',
                        mapLink: 'https://2gis.ru/listvyanka'
                    }
                ]
            }
        ]
    }
];
