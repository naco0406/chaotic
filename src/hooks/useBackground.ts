import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import type { BackgroundConfig } from '../types/background';
import { db } from '../lib/firebase';

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

const backgroundDocRef = doc(db, 'backgroundConfigs', 'default');

const fetchBackgroundConfig = async (): Promise<BackgroundConfig> => {
  try {
    const snapshot = await getDoc(backgroundDocRef);
    if (snapshot.exists()) {
      return normalizeConfig(snapshot.data() as BackgroundConfig);
    }

    await setDoc(backgroundDocRef, initialBackgroundConfig);
    return initialBackgroundConfig;
  } catch (error) {
    console.error('Failed to load background config', error);
    return initialBackgroundConfig;
  }
};

export const useBackground = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['background-config'],
    queryFn: fetchBackgroundConfig,
    placeholderData: initialBackgroundConfig,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const unsubscribe = onSnapshot(
      backgroundDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          queryClient.setQueryData(
            ['background-config'],
            normalizeConfig(snapshot.data() as BackgroundConfig)
          );
        } else {
          setDoc(backgroundDocRef, initialBackgroundConfig).catch((error) => {
            console.error('Failed to initialize background config', error);
          });
        }
      },
      (error) => {
        console.error('Background config subscription failed', error);
      }
    );

    return unsubscribe;
  }, [queryClient]);

  const updateConfig = useCallback(
    async (
      value:
        | BackgroundConfig
        | ((prev: BackgroundConfig) => BackgroundConfig)
    ): Promise<BackgroundConfig> => {
      const base =
        queryClient.getQueryData<BackgroundConfig>(['background-config']) ??
        initialBackgroundConfig;
      const resolved = typeof value === 'function' ? value(base) : value;
      const normalized = normalizeConfig(resolved);

      await setDoc(backgroundDocRef, normalized);
      queryClient.setQueryData(['background-config'], normalized);

      return normalized;
    },
    [queryClient]
  );

  return {
    config: query.data ?? initialBackgroundConfig,
    isLoading: query.status === 'pending',
    updateConfig,
  };
};
