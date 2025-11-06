import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { nanoid } from 'nanoid';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { BackgroundCanvas } from '../components/background/BackgroundCanvas';
import { EditControls } from '../components/background/EditControls';
import { ImageLibrary } from '../components/background/ImageLibrary';
import { Button } from '../components/common/Button';
import { useBackground } from '../hooks/useBackground';
import { useUnsavedChangesPrompt } from '../hooks/useUnsavedChangesPrompt';
import { storage } from '../lib/firebase';
import type { BackgroundConfig, ImageElement } from '../types/background';

const createImageElement = (
  imageUrl: string,
  zIndex: number
): ImageElement => ({
  id: nanoid(),
  imageUrl,
  x: 50,
  y: 50,
  width: 220,
  height: 220,
  rotation: 0,
  zIndex,
});

export const BackgroundEditor: FC = () => {
  const navigate = useNavigate();
  const { config, updateConfig, isLoading: isBackgroundLoading } = useBackground();
  const [draftConfig, setDraftConfig] = useState<BackgroundConfig>(config);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorOptions, setEditorOptions] = useState({
    snapToGrid: true,
    lockAspectRatio: true,
  });
  const [isDirty, setIsDirty] = useState(false);
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve());

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(draftConfig) !== JSON.stringify(config);
  }, [draftConfig, config]);

  useUnsavedChangesPrompt(
    hasUnsavedChanges && !isSaving,
    '변경사항을 저장하지 않았어요. 이동하시겠어요?'
  );

  useEffect(() => {
    if (!hasUnsavedChanges && isDirty) {
      setIsDirty(false);
    }
  }, [hasUnsavedChanges, isDirty]);

  useEffect(() => {
    if (isBackgroundLoading || isDirty) return;
    setDraftConfig(config);
    setSelectedImageId(null);
  }, [config, isBackgroundLoading, isDirty]);

  const persistUploadedImage = useCallback(
    async (downloadUrl: string) => {
      const queue = uploadQueueRef.current.catch(() => undefined);
      const persistPromise = queue.then(async () => {
        await updateConfig((prev) => ({
          ...prev,
          uploadedImages: [...prev.uploadedImages, downloadUrl],
        }));
      });
      uploadQueueRef.current = persistPromise;
      await persistPromise;
    },
    [updateConfig]
  );

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const uniqueId = nanoid();
    const extension = file.name.split('.').pop();
    const cleanedExt = extension?.replace(/[^a-zA-Z0-9]/g, '') ?? '';
    const safeExt = cleanedExt ? `.${cleanedExt}` : '';
    const storageRef = ref(
      storage,
      `background-images/${uniqueId}-${Date.now()}${safeExt}`
    );
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    setDraftConfig((prev) => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, downloadUrl],
    }));
    setIsDirty(true);
    try {
      await persistUploadedImage(downloadUrl);
    } catch (error) {
      setDraftConfig((prev) => {
        const nextImages = [...prev.uploadedImages];
        const index = nextImages.lastIndexOf(downloadUrl);
        if (index !== -1) {
          nextImages.splice(index, 1);
        }
        return {
          ...prev,
          uploadedImages: nextImages,
        };
      });
      throw error;
    }
  }, [persistUploadedImage]);

  const handleImageSelect = (imageUrl: string) => {
    const newImage = createImageElement(imageUrl, draftConfig.images.length);
    setDraftConfig((prev) => ({
      ...prev,
      images: [...prev.images, newImage],
    }));
    setSelectedImageId(newImage.id);
    setIsDirty(true);
  };

  const updateImages = useCallback(
    (updater: (images: ImageElement[]) => ImageElement[]) => {
      setDraftConfig((prev) => ({
        ...prev,
        images: updater(prev.images),
      }));
      setIsDirty(true);
    },
    []
  );

  const handleImageUpdate = (id: string, updates: Partial<ImageElement>) => {
    updateImages((images) =>
      images.map((image) =>
        image.id === id ? { ...image, ...updates } : image
      )
    );
  };

  const handleImageDelete = useCallback(
    (id: string) => {
      updateImages((images) =>
        images
          .filter((image) => image.id !== id)
          .map((image, index) => ({ ...image, zIndex: index }))
      );
      if (selectedImageId === id) {
        setSelectedImageId(null);
      }
    },
    [selectedImageId, updateImages]
  );

  const handleDuplicate = (id: string) => {
    let duplicatedId: string | null = null;
    let duplicated = false;
    setDraftConfig((prev) => {
      const target = prev.images.find((image) => image.id === id);
      if (!target) {
        return prev;
      }
      const duplicatedImage: ImageElement = {
        ...target,
        id: nanoid(),
        x: Math.min(95, target.x + 5),
        y: Math.min(95, target.y + 5),
        zIndex: prev.images.length,
      };
      duplicatedId = duplicatedImage.id;
      duplicated = true;
      return {
        ...prev,
        images: [...prev.images, duplicatedImage],
      };
    });
    if (duplicated) {
      setIsDirty(true);
    }
    if (duplicatedId) {
      setSelectedImageId(duplicatedId);
    }
  };

  const handleLayerReorder = (
    id: string,
    direction: 'up' | 'down' | 'front' | 'back'
  ) => {
    updateImages((images) => {
      const sorted = [...images].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex((image) => image.id === id);
      if (index === -1) return images;
      const [current] = sorted.splice(index, 1);
      if (direction === 'up') {
        sorted.splice(Math.min(sorted.length, index + 1), 0, current);
      } else if (direction === 'down') {
        sorted.splice(Math.max(0, index - 1), 0, current);
      } else if (direction === 'front') {
        sorted.push(current);
      } else {
        sorted.unshift(current);
      }
      return sorted.map((image, idx) => ({ ...image, zIndex: idx }));
    });
  };

  const handleClear = () => {
    setDraftConfig((prev) => ({
      ...prev,
      images: [],
    }));
    setSelectedImageId(null);
    setIsDirty(true);
  };

  const handleReset = () => {
    setDraftConfig(config);
    setSelectedImageId(null);
    setIsDirty(false);
  };

  const handleSave = useCallback(async () => {
    if (isSaving || !hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      await updateConfig(draftConfig);
      setIsDirty(false);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 1500);
    } catch (error) {
      console.error('Failed to save background config', error);
    } finally {
      setIsSaving(false);
    }
  }, [draftConfig, hasUnsavedChanges, isSaving, updateConfig]);

  const handleKeyboard = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }

      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedImageId
      ) {
        event.preventDefault();
        handleImageDelete(selectedImageId);
      }
    },
    [handleImageDelete, selectedImageId]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  const handleSettingsChange = useCallback(
    (settings: {
      backgroundColor?: string;
      showGrid?: boolean;
      gridSize?: number;
    }) => {
      setDraftConfig((prev) => ({ ...prev, ...settings }));
      setIsDirty(true);
    },
    []
  );

  if (isBackgroundLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-sky-50 to-rose-50">
        <div className="bg-white/80 backdrop-blur rounded-3xl px-8 py-6 cute-shadow text-center space-y-2">
          <p className="text-lg font-semibold text-emerald-600">
            배경 데이터를 불러오는 중이에요
          </p>
          <p className="text-sm text-slate-500">
            잠시만 기다려 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-rose-50 flex flex-col lg:flex-row gap-6 p-4 md:p-8"
    >
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate('/')}
          >
            돌아가기
          </Button>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <EditControls
            hasUnsavedChanges={hasUnsavedChanges}
            onClear={handleClear}
            onSave={() => {
              void handleSave();
            }}
            onReset={handleReset}
          />
        </div>

        <div className="rounded-[40px] bg-white/70 backdrop-blur border border-white/60 h-[75vh] mt-20 p-6 relative overflow-hidden">
          <BackgroundCanvas
            config={draftConfig}
            editable
            selectedId={selectedImageId}
            onSelectImage={setSelectedImageId}
            onUpdateImage={handleImageUpdate}
            onRemoveImage={handleImageDelete}
            onDuplicateImage={handleDuplicate}
            snapToGrid={editorOptions.snapToGrid}
            gridSize={draftConfig.gridSize}
            lockAspectRatio={editorOptions.lockAspectRatio}
            showGuides
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: savedIndicator ? 1 : 0, y: savedIndicator ? 0 : 20 }}
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 rounded-full px-6 py-2 text-sm font-semibold text-emerald-500 cute-shadow"
        >
          저장되었습니다!
        </motion.div>
      </div>

      <div className="w-full lg:w-96">
        <ImageLibrary
          uploadedImages={draftConfig.uploadedImages}
          elements={draftConfig.images}
          selectedId={selectedImageId}
          backgroundColor={draftConfig.backgroundColor}
          showGrid={draftConfig.showGrid}
          gridSize={draftConfig.gridSize}
          editorOptions={editorOptions}
          onImageSelect={handleImageSelect}
          onImageUpload={handleImageUpload}
          onLayerSelect={setSelectedImageId}
          onLayerDelete={handleImageDelete}
          onLayerDuplicate={handleDuplicate}
          onLayerReorder={handleLayerReorder}
          onSettingsChange={handleSettingsChange}
          onEditorOptionsChange={(options) =>
            setEditorOptions((prev) => ({ ...prev, ...options }))
          }
        />
      </div>
    </motion.div>
  );
};
