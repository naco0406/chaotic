import { useCallback, useSyncExternalStore } from 'react';
import type { BackgroundConfig } from '../types/background';
import { STORAGE_KEYS, getFromStorage, setToStorage } from '../utils/storage';

const initialBackgroundConfig: BackgroundConfig = {
  images: [],
  uploadedImages: [],
  backgroundColor: '#fdf2f8',
  showGrid: false,
  gridSize: 20,
};

const normalizeConfig = (config?: BackgroundConfig): BackgroundConfig => ({
  ...initialBackgroundConfig,
  ...config,
  images: (config?.images ?? []).map((image, index) => ({
    ...image,
    rotation: typeof image.rotation === 'number' ? image.rotation : 0,
    zIndex: typeof image.zIndex === 'number' ? image.zIndex : index,
  })),
  uploadedImages: config?.uploadedImages ?? [],
});

const loadInitialState = (): BackgroundConfig => {
  if (typeof window === 'undefined') {
    return initialBackgroundConfig;
  }
  return getFromStorage(
    STORAGE_KEYS.BACKGROUND_CONFIG,
    initialBackgroundConfig
  );
};

let backgroundState = normalizeConfig(loadInitialState());
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setBackgroundState = (next: BackgroundConfig, persist = true) => {
  backgroundState = normalizeConfig(next);
  if (persist && typeof window !== 'undefined') {
    setToStorage(STORAGE_KEYS.BACKGROUND_CONFIG, backgroundState);
  }
  emit();
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (
      event.key === STORAGE_KEYS.BACKGROUND_CONFIG &&
      event.newValue
    ) {
      try {
        const parsed = JSON.parse(event.newValue) as BackgroundConfig;
        setBackgroundState(parsed, false);
      } catch {
        // ignore malformed storage data
      }
    }
  });
}

export const useBackground = () => {
  const config = useSyncExternalStore(
    subscribe,
    () => backgroundState,
    () => backgroundState
  );

  const updateConfig = useCallback(
    (
      value:
        | BackgroundConfig
        | ((prev: BackgroundConfig) => BackgroundConfig)
    ): BackgroundConfig => {
      const resolved =
        typeof value === 'function' ? value(backgroundState) : value;
      setBackgroundState(resolved);
      return backgroundState;
    },
    []
  );

  return {
    config,
    updateConfig,
  };
};
