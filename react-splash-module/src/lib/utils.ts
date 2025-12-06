import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Утилита для объединения классов Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Вычисляет расстояние между двумя точками на карте (упрощенная формула)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * Находит N ближайших соседей для точки
 */
export function findNearestNeighbors(
  currentIndex: number,
  points: Array<{ lat: number; lng: number }>,
  n: number = 2
): number[] {
  const current = points[currentIndex];
  const distances = points
    .map((point, index) => ({
      index,
      distance: calculateDistance(current.lat, current.lng, point.lat, point.lng),
    }))
    .filter((item) => item.index !== currentIndex)
    .sort((a, b) => a.distance - b.distance);

  return distances.slice(0, n).map((item) => item.index);
}
