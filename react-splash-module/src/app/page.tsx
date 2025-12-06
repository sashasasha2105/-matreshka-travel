"use client";

import { useState } from "react";
import { MatreshkaEntryFlow } from "@/components";
import { MATRESHKA_REGIONS } from "@/data/regions";

export default function Home() {
  const [isFlowComplete, setIsFlowComplete] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleComplete = (regionId?: string) => {
    setIsFlowComplete(true);
    setSelectedRegion(regionId || null);
  };

  // Для демонстрации: можно перезапустить flow
  const handleRestart = () => {
    setIsFlowComplete(false);
    setSelectedRegion(null);
  };

  return (
    <main className="min-h-screen bg-matreshka-dark">
      {!isFlowComplete ? (
        <MatreshkaEntryFlow
          regions={MATRESHKA_REGIONS}
          onComplete={handleComplete}
        />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-matreshka-primary/10 border border-matreshka-primary/20 mb-6">
                <span className="text-5xl">✅</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Добро пожаловать!
              </h1>
              {selectedRegion && (
                <p className="text-lg text-white/60 mb-2">
                  Вы выбрали:{" "}
                  <span className="text-matreshka-primary font-semibold">
                    {
                      MATRESHKA_REGIONS.find((r) => r.id === selectedRegion)
                        ?.name
                    }
                  </span>
                </p>
              )}
              <p className="text-white/40">
                {selectedRegion
                  ? "Приветственный бонус активирован!"
                  : "Вы можете начать изучать регионы"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-matreshka-darker border border-matreshka-border rounded-xl">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Интеграция в основной проект
                </h2>
                <div className="text-left space-y-2 text-sm text-white/60">
                  <p>
                    <strong className="text-white/80">1. iframe:</strong>{" "}
                    Встройте этот модуль через iframe
                  </p>
                  <p>
                    <strong className="text-white/80">2. postMessage:</strong>{" "}
                    Слушайте событие <code>MATRESHKA_COMPLETE</code>
                  </p>
                  <p>
                    <strong className="text-white/80">3. Компоненты:</strong>{" "}
                    Импортируйте компоненты напрямую
                  </p>
                </div>
              </div>

              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-matreshka-primary hover:bg-matreshka-primary/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-matreshka-primary/25 hover:shadow-xl hover:shadow-matreshka-primary/30 hover:-translate-y-0.5"
              >
                🔄 Перезапустить демо
              </button>

              <div className="pt-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white/60 text-sm transition-colors"
                >
                  Документация →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
