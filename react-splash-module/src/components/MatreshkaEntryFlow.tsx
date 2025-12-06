"use client";

import { useState, useCallback } from "react";
import { MatreshkaSplashScreen } from "./MatreshkaSplashScreen";
import { WelcomeMatreshkaModal } from "./WelcomeMatreshkaModal";
import { MatreshkaEntryFlowProps } from "@/types";

/**
 * Оркестратор для управления потоком: Splash Screen → Welcome Modal
 */
export function MatreshkaEntryFlow({
  regions,
  onComplete,
  skipSplash = false,
}: MatreshkaEntryFlowProps) {
  const [showSplash, setShowSplash] = useState(!skipSplash);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
    setShowWelcomeModal(true);
  }, []);

  const handleRegionSelected = useCallback(
    (regionId: string) => {
      setShowWelcomeModal(false);
      onComplete(regionId);

      // Отправляем событие в родительское окно (для iframe интеграции)
      if (typeof window !== "undefined" && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "MATRESHKA_COMPLETE",
            regionId,
            skipped: false,
          },
          "*"
        );
      }
    },
    [onComplete]
  );

  const handleSkip = useCallback(() => {
    setShowWelcomeModal(false);
    onComplete();

    // Отправляем событие в родительское окно (для iframe интеграции)
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "MATRESHKA_COMPLETE",
          regionId: null,
          skipped: true,
        },
        "*"
      );
    }
  }, [onComplete]);

  return (
    <>
      {showSplash && (
        <MatreshkaSplashScreen
          regions={regions}
          onFinish={handleSplashFinish}
        />
      )}

      <WelcomeMatreshkaModal
        isOpen={showWelcomeModal}
        regions={regions}
        onRegionSelected={handleRegionSelected}
        onSkip={handleSkip}
      />
    </>
  );
}
