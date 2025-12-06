"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WelcomeMatreshkaModalProps } from "@/types";
import { cn } from "@/lib/utils";

export function WelcomeMatreshkaModal({
  isOpen,
  regions,
  onRegionSelected,
  onSkip,
}: WelcomeMatreshkaModalProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");

  const handleSubmit = () => {
    if (selectedRegionId) {
      onRegionSelected(selectedRegionId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onSkip();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-matreshka-darker border border-matreshka-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Декоративный градиент сверху */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-matreshka-primary to-transparent" />

            {/* Светящийся эффект */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-matreshka-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-matreshka-secondary/20 rounded-full blur-3xl" />

            {/* Контент */}
            <div className="relative p-8">
              {/* Заголовок */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-matreshka-primary/10 border border-matreshka-primary/20 mb-4"
                >
                  <span className="text-3xl">🪆</span>
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-2">
                  Добро пожаловать в Матрёшку!
                </h2>
                <p className="text-white/60">
                  Выберите свой регион для получения приветственного бонуса
                </p>
              </div>

              {/* Селектор региона */}
              <div className="mb-6">
                <label
                  htmlFor="region-select"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  Ваш регион
                </label>
                <div className="relative">
                  <select
                    id="region-select"
                    value={selectedRegionId}
                    onChange={(e) => setSelectedRegionId(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 bg-matreshka-dark border rounded-xl",
                      "text-white appearance-none cursor-pointer",
                      "focus:outline-none focus:ring-2 focus:ring-matreshka-primary/50",
                      "transition-all duration-200",
                      selectedRegionId
                        ? "border-matreshka-primary/50"
                        : "border-matreshka-border hover:border-matreshka-border"
                    )}
                  >
                    <option value="" disabled>
                      Выберите регион...
                    </option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.emoji} {region.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-white/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Бонус информация */}
              {selectedRegionId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-matreshka-primary/10 border border-matreshka-primary/20 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-matreshka-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xl">🎁</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        Приветственный бонус
                      </p>
                      <p className="text-xs text-white/60">
                        Скидка 10% на первое бронирование
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Кнопки */}
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedRegionId}
                  className={cn(
                    "w-full px-6 py-3 rounded-xl font-semibold",
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-matreshka-primary/50",
                    selectedRegionId
                      ? "bg-matreshka-primary hover:bg-matreshka-primary/90 text-white shadow-lg shadow-matreshka-primary/25 hover:shadow-xl hover:shadow-matreshka-primary/30 hover:-translate-y-0.5"
                      : "bg-matreshka-primary/20 text-white/40 cursor-not-allowed"
                  )}
                >
                  Продолжить
                </button>

                <button
                  onClick={onSkip}
                  className="w-full px-6 py-3 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 focus:outline-none"
                >
                  Пропустить и начать изучать Матрёшку
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
