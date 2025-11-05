import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import type { SiteSettings } from '../types/site';
import { db } from '../lib/firebase';

const defaultSettings: SiteSettings = {
  heroTitle: '모두의 마음을 담은 편지 정원',
  heroDescription:
    '친구들과 가족, 동료들이 한 사람을 위해 남기는 다정한 이야기들을 한 곳에 모아요.',
  heroHighlight: '당신에게 닿을 작은 편지를 자유롭게 꾸며 보세요.',
  footerNote: '모든 편지는 작성자와 수신자만의 진심을 담고 있습니다.',
};

const normalizeSettings = (settings?: Partial<SiteSettings>): SiteSettings => ({
  heroTitle:
    typeof settings?.heroTitle === 'string'
      ? settings.heroTitle
      : defaultSettings.heroTitle,
  heroDescription:
    typeof settings?.heroDescription === 'string'
      ? settings.heroDescription
      : defaultSettings.heroDescription,
  heroHighlight:
    typeof settings?.heroHighlight === 'string'
      ? settings.heroHighlight
      : defaultSettings.heroHighlight,
  footerNote:
    typeof settings?.footerNote === 'string'
      ? settings.footerNote
      : defaultSettings.footerNote,
});

const siteSettingsDocRef = doc(db, 'siteSettings', 'default');

const fetchSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const snapshot = await getDoc(siteSettingsDocRef);
    if (snapshot.exists()) {
      return normalizeSettings(snapshot.data() as Partial<SiteSettings>);
    }

    await setDoc(siteSettingsDocRef, defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Failed to load site settings', error);
    return defaultSettings;
  }
};

export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
    placeholderData: defaultSettings,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const unsubscribe = onSnapshot(
      siteSettingsDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          queryClient.setQueryData(
            ['site-settings'],
            normalizeSettings(snapshot.data() as Partial<SiteSettings>)
          );
        } else {
          setDoc(siteSettingsDocRef, defaultSettings).catch((error) => {
            console.error('Failed to initialize site settings', error);
          });
        }
      },
      (error) => {
        console.error('Site settings subscription failed', error);
      }
    );

    return unsubscribe;
  }, [queryClient]);

  const updateSettings = useCallback(
    async (updates: SiteSettings) => {
      const nextSettings = normalizeSettings(updates);
      try {
        await setDoc(siteSettingsDocRef, nextSettings);
        queryClient.setQueryData(['site-settings'], nextSettings);
      } catch (error) {
        console.error('Failed to save site settings', error);
      }
    },
    [queryClient]
  );

  return {
    settings: query.data ?? defaultSettings,
    updateSettings,
  };
};
