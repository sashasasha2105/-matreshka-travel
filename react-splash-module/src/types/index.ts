/**
 * Типы для модуля Matreshka Splash Screen
 */

export interface Region {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  emoji?: string;
}

export interface MapDot {
  start: {
    lat: number;
    lng: number;
  };
  end: {
    lat: number;
    lng: number;
  };
}

export interface MatreshkaSplashScreenProps {
  regions: Region[];
  onFinish: () => void;
  duration?: number; // milliseconds, default 4000
  lineColor?: string;
}

export interface WelcomeMatreshkaModalProps {
  isOpen: boolean;
  regions: Region[];
  onRegionSelected: (regionId: string) => void;
  onSkip: () => void;
}

export interface MatreshkaEntryFlowProps {
  regions: Region[];
  onComplete: (selectedRegionId?: string) => void;
  skipSplash?: boolean; // для тестирования
}
