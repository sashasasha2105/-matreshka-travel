"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { WorldMap } from "./WorldMap";
import { MatreshkaSplashScreenProps, MapDot } from "@/types";
import { findNearestNeighbors } from "@/lib/utils";

const SPLASH_DURATION = 4000; // 4 секунды

export function MatreshkaSplashScreen({
  regions,
  onFinish,
  duration = SPLASH_DURATION,
  lineColor = "#6366f1",
}: MatreshkaSplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Генерируем линии между ближайшими регионами
  const mapDots = useMemo<MapDot[]>(() => {
    const dots: MapDot[] = [];

    regions.forEach((region, index) => {
      // Находим 2 ближайших соседа для каждого региона
      const neighbors = findNearestNeighbors(index, regions, 2);

      neighbors.forEach((neighborIndex) => {
        const neighbor = regions[neighborIndex];
        // Добавляем линию только если она еще не была добавлена в обратном направлении
        const isDuplicate = dots.some(
          (dot) =>
            (dot.start.lat === neighbor.lat &&
              dot.start.lng === neighbor.lng &&
              dot.end.lat === region.lat &&
              dot.end.lng === region.lng) ||
            (dot.start.lat === region.lat &&
              dot.start.lng === region.lng &&
              dot.end.lat === neighbor.lat &&
              dot.end.lng === neighbor.lng)
        );

        if (!isDuplicate) {
          dots.push({
            start: { lat: region.lat, lng: region.lng },
            end: { lat: neighbor.lat, lng: neighbor.lng },
          });
        }
      });
    });

    return dots;
  }, [regions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onFinish();
      }, 500); // Даем время на fade-out анимацию
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  if (!isVisible) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 bg-matreshka-dark"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-matreshka-dark overflow-hidden"
    >
      {/* Фоновый градиент */}
      <div className="absolute inset-0 bg-gradient-to-b from-matreshka-dark via-matreshka-darker to-matreshka-dark" />

      {/* Светящийся эффект в центре */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-matreshka-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      </div>

      {/* Контейнер карты */}
      <div className="relative z-10 w-full max-w-7xl px-4">
        {/* Логотип / Название */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-matreshka-accent to-white bg-clip-text text-transparent mb-4">
            Матрёшка
          </h1>
          <p className="text-lg md:text-xl text-white/60">
            Путешествуй по России
          </p>
        </motion.div>

        {/* Карта мира с анимацией */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative"
        >
          {/* Фокус на России через transform и clip */}
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="transform origin-center"
              style={{
                transform: "scale(1.8) translate(-15%, -5%)",
              }}
            >
              <WorldMap
                dots={mapDots}
                lineColor={lineColor}
                dotColor={lineColor}
                backgroundColor="transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Индикатор загрузки */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="mt-8 flex justify-center"
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-matreshka-primary"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <span className="text-white/40 text-sm">Загрузка...</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
