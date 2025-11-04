import type { BackgroundConfig } from '../types/background';
import { STORAGE_KEYS } from '../utils/storage';
import { useLocalStorage } from './useLocalStorage';

const initialBackgroundConfig: BackgroundConfig = {
  images: [],
  uploadedImages: [],
  backgroundColor: '#fdf2f8',
  showGrid: false,
  gridSize: 20,
};

export const useBackground = () => {
  const [config, setConfigState] = useLocalStorage<BackgroundConfig>(
    STORAGE_KEYS.BACKGROUND_CONFIG,
    initialBackgroundConfig
  );

  const updateConfig = (
    value:
      | BackgroundConfig
      | ((prev: BackgroundConfig) => BackgroundConfig)
  ): BackgroundConfig => {
    let nextConfig = config;
    setConfigState((prev) => {
      nextConfig = typeof value === 'function' ? value(prev) : value;
      return nextConfig;
    });
    return nextConfig;
  };

  return {
    config: {
      ...initialBackgroundConfig,
      ...config,
      images: config.images ?? [],
      uploadedImages: config.uploadedImages ?? [],
    },
    updateConfig,
  };
};
