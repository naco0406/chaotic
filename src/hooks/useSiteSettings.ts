import type { SiteSettings } from '../types/site';
import { STORAGE_KEYS } from '../utils/storage';
import { useLocalStorage } from './useLocalStorage';

const defaultSettings: SiteSettings = {
  heroTitle: '모두의 마음을 담은 편지 정원',
  heroDescription:
    '친구들과 가족, 동료들이 한 사람을 위해 남기는 다정한 이야기들을 한 곳에 모아요.',
  heroHighlight: '당신에게 닿을 작은 편지를 자유롭게 꾸며 보세요.',
  footerNote: '모든 편지는 작성자와 수신자만의 진심을 담고 있습니다.',
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useLocalStorage<SiteSettings>(
    STORAGE_KEYS.SITE_SETTINGS,
    defaultSettings
  );

  const updateSettings = (updates: SiteSettings) => {
    setSettings(updates);
  };

  return {
    settings,
    updateSettings,
  };
};
