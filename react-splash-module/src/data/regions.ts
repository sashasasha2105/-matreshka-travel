/**
 * Данные регионов для Matreshka Splash Screen
 * Конвертировано из основного проекта с добавлением координат
 */

import { Region } from '@/types';

export const MATRESHKA_REGIONS: Region[] = [
  {
    id: 'moscow',
    name: 'Москва',
    lat: 55.7558,
    lng: 37.6173,
    description: 'Столица России, сердце нашей великой Родины',
    emoji: '🏛️',
  },
  {
    id: 'spb',
    name: 'Санкт-Петербург',
    lat: 59.9343,
    lng: 30.3351,
    description: 'Северная Венеция, культурная столица России',
    emoji: '🎭',
  },
  {
    id: 'kazan',
    name: 'Казань',
    lat: 55.7887,
    lng: 49.1221,
    description: 'Столица Татарстана, третья столица России',
    emoji: '🕌',
  },
  {
    id: 'sochi',
    name: 'Сочи',
    lat: 43.6028,
    lng: 39.7342,
    description: 'Курортная столица России на берегу Черного моря',
    emoji: '🏖️',
  },
  {
    id: 'ekaterinburg',
    name: 'Екатеринбург',
    lat: 56.8389,
    lng: 60.6057,
    description: 'Столица Урала, город на границе Европы и Азии',
    emoji: '⛰️',
  },
  {
    id: 'vladivostok',
    name: 'Владивосток',
    lat: 43.1198,
    lng: 131.8869,
    description: 'Ворота в Тихий океан',
    emoji: '🌊',
  },
  {
    id: 'irkutsk',
    name: 'Иркутск',
    lat: 52.2978,
    lng: 104.2964,
    description: 'Ворота Байкала, жемчужина Сибири',
    emoji: '🏔️',
  },
  {
    id: 'kaliningrad',
    name: 'Калининград',
    lat: 54.7104,
    lng: 20.4522,
    description: 'Янтарный край на берегу Балтики',
    emoji: '⚓',
  },
  {
    id: 'nizhnynovgorod',
    name: 'Нижний Новгород',
    lat: 56.2965,
    lng: 43.9361,
    description: 'Столица Поволжья',
    emoji: '🏰',
  },
  {
    id: 'novosibirsk',
    name: 'Новосибирск',
    lat: 55.0084,
    lng: 82.9357,
    description: 'Столица Сибири',
    emoji: '🌉',
  },
  {
    id: 'krasnoyarsk',
    name: 'Красноярск',
    lat: 56.0153,
    lng: 92.8932,
    description: 'Сердце Сибири на Енисее',
    emoji: '🏞️',
  },
  {
    id: 'volgograd',
    name: 'Волгоград',
    lat: 48.7080,
    lng: 44.5133,
    description: 'Город-герой на великой реке',
    emoji: '⚔️',
  },
];

/**
 * Получить регион по ID
 */
export function getRegionById(id: string): Region | undefined {
  return MATRESHKA_REGIONS.find((region) => region.id === id);
}

/**
 * Получить случайный регион
 */
export function getRandomRegion(): Region {
  const randomIndex = Math.floor(Math.random() * MATRESHKA_REGIONS.length);
  return MATRESHKA_REGIONS[randomIndex];
}
