/**
 * Готовые пакеты путешествий по России
 */

const TRAVEL_PACKAGES = [
    {
        id: 'golden-ring-classic',
        name: 'Золотое кольцо России',
        duration: '5 дней / 4 ночи',
        price: 900,
        oldPrice: null,
        image: 'city_photos/GOLDRING.jpg',
        description: 'Путешествие по древним городам России с посещением главных достопримечательностей',
        cities: ['Москва', 'Владимир', 'Суздаль', 'Ярославль', 'Кострома'],
        routes: [
            {
                id: 1,
                name: 'Маршрут 1: Комфорт',
                programs: [
                    {
                        name: 'Экскурсия "Владимирские святыни"',
                        description: 'Посещение Успенского и Дмитриевского соборов',
                        duration: '3 часа',
                        link: 'https://www.tripadvisor.ru',
                        mapLink: 'https://2gis.ru/vladimir/geo/70000001057919154',
                        coordinates: { lat: 56.1296, lon: 40.4138 }
                    },
                    {
                        name: 'Экскурсия по Суздальскому кремлю',
                        description: 'Древнейшая часть города с уникальной архитектурой',
                        duration: '2.5 часа',
                        link: 'https://www.tripadvisor.ru',
                        mapLink: 'https://2gis.ru/suzdal/geo/4504235284644536',
                        coordinates: { lat: 56.4204, lon: 40.4467 }
                    }
                ]
            },
            {
                id: 2,
                name: 'Маршрут 2: Эконом',
                programs: [
                    {
                        name: 'Обзорная экскурсия по Владимиру',
                        description: 'Знакомство с городом и его историей',
                        duration: '2 часа',
                        link: 'https://www.tripadvisor.ru',
                        mapLink: 'https://2gis.ru/vladimir',
                        coordinates: { lat: 56.1290, lon: 40.4060 }
                    },
                    {
                        name: 'Прогулка по Суздалю',
                        description: 'Посещение основных достопримечательностей',
                        duration: '2 часа',
                        link: 'https://www.tripadvisor.ru',
                        mapLink: 'https://2gis.ru/suzdal',
                        coordinates: { lat: 56.4186, lon: 40.4456 }
                    }
                ]
            }
        ]
    },
    {
        id: 'caucasus-mountains',
        name: 'Кавказ - горы и традиции',
        duration: '6 дней / 5 ночей',
        price: 900,
        oldPrice: null,
        image: 'city_photos/kazan.jpg',
        description: 'Путешествие по самым красивым местам Северного Кавказа с посещением горных курортов',
        cities: ['Пятигорск', 'Кисловодск', 'Минеральные Воды', 'Домбай'],
        routes: [
            {
                id: 1,
                name: 'Маршрут 1: Комфорт плюс',
                programs: [
                    {
                        name: 'Экскурсия в Домбай',
                        description: 'Посещение горнолыжного курорта, канатные дороги',
                        duration: '8 часов',
                        link: 'https://www.dombay.info',
                        mapLink: 'https://2gis.ru/dombay',
                        coordinates: { lat: 43.2971, lon: 41.6240 }
                    },
                    {
                        name: 'Прогулка по Кисловодскому парку',
                        description: 'Крупнейший рукотворный парк Европы',
                        duration: '3 часа',
                        link: 'https://visit-kmv.ru',
                        mapLink: 'https://2gis.ru/kislovodsk/geo/4504416886926398',
                        coordinates: { lat: 43.9061, lon: 42.7132 }
                    },
                    {
                        name: 'Озеро Провал и грот Дианы',
                        description: 'Природные достопримечательности Пятигорска',
                        duration: '2 часа',
                        link: 'https://visit-kmv.ru',
                        mapLink: 'https://2gis.ru/pyatigorsk/firm/70000001019506506',
                        coordinates: { lat: 44.0428, lon: 43.0988 }
                    }
                ]
            },
            {
                id: 2,
                name: 'Маршрут 2: Стандарт',
                programs: [
                    {
                        name: 'Обзорная экскурсия по Пятигорску',
                        description: 'Места Лермонтова, смотровая площадка',
                        duration: '3 часа',
                        link: 'https://visit-kmv.ru',
                        mapLink: 'https://2gis.ru/pyatigorsk',
                        coordinates: { lat: 44.0391, lon: 43.0707 }
                    },
                    {
                        name: 'Нарзанная галерея',
                        description: 'Дегустация минеральных вод',
                        duration: '1.5 часа',
                        link: 'https://visit-kmv.ru',
                        mapLink: 'https://2gis.ru/kislovodsk/firm/70000001031594835',
                        coordinates: { lat: 43.9083, lon: 42.7190 }
                    }
                ]
            }
        ]
    },
    {
        id: 'ural-mountains',
        name: 'Урал - сердце России',
        duration: '5 дней / 4 ночи',
        price: 900,
        oldPrice: null,
        image: 'city_photos/Снимок экрана 2025-10-07 в 13.34.49.png',
        description: 'Путешествие по живописным местам Урала с посещением природных парков и исторических городов',
        cities: ['Екатеринбург', 'Невьянск', 'Нижний Тагил'],
        routes: [
            {
                id: 1,
                name: 'Маршрут 1: Классический',
                programs: [
                    {
                        name: 'Обзорная экскурсия по Екатеринбургу',
                        description: 'Храм на Крови, плотина, исторический центр',
                        duration: '3.5 часа',
                        link: 'https://екатеринбург.рф',
                        mapLink: 'https://2gis.ru/ekaterinburg/geo/4504723122082063',
                        coordinates: { lat: 56.8431, lon: 60.6454 }
                    },
                    {
                        name: 'Невьянская падающая башня',
                        description: 'Уникальный памятник промышленной архитектуры',
                        duration: '2.5 часа',
                        link: 'https://башня-невьянск.рф',
                        mapLink: 'https://2gis.ru/nevyansk/firm/70000001063669767',
                        coordinates: { lat: 57.4921, lon: 60.2053 }
                    },
                    {
                        name: 'Музей-заповедник горнозаводского дела',
                        description: 'История горного дела на Урале',
                        duration: '2 часа',
                        link: 'https://museum-nt.ru',
                        mapLink: 'https://2gis.ru/nizhnytagil/firm/70000001022172655',
                        coordinates: { lat: 57.9148, lon: 59.9642 }
                    },
                    {
                        name: 'Природный парк "Оленьи Ручьи"',
                        description: 'Пешие прогулки, скалы, пещеры',
                        duration: '6 часов',
                        link: 'https://olen-park.ru',
                        mapLink: 'https://2gis.ru/ekaterinburg',
                        coordinates: { lat: 56.5217, lon: 59.3614 }
                    }
                ]
            },
            {
                id: 2,
                name: 'Маршрут 2: Бюджетный',
                programs: [
                    {
                        name: 'Прогулка по центру Екатеринбурга',
                        description: 'Плотина, Набережная, Исторический сквер',
                        duration: '2.5 часа',
                        link: 'https://екатеринбург.рф',
                        mapLink: 'https://2gis.ru/ekaterinburg',
                        coordinates: { lat: 56.8389, lon: 60.6057 }
                    },
                    {
                        name: 'Посещение Невьянска',
                        description: 'Падающая башня и музей',
                        duration: '3 часа',
                        link: 'https://башня-невьянск.рф',
                        mapLink: 'https://2gis.ru/nevyansk',
                        coordinates: { lat: 57.4921, lon: 60.2053 }
                    }
                ]
            }
        ]
    }
];
