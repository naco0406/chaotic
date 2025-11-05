import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { nanoid } from 'nanoid';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundCanvas } from '../components/background/BackgroundCanvas';
import { EditControls } from '../components/background/EditControls';
import { ImageLibrary } from '../components/background/ImageLibrary';
import { Button } from '../components/common/Button';
import { useBackground } from '../hooks/useBackground';
import { useUndoRedo } from '../hooks/useUndoRedo';
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
  const { config, updateConfig } = useBackground();
  const {
    state: draftConfig,
    setState: setDraftConfig,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  } = useUndoRedo<BackgroundConfig>(config);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [editorOptions, setEditorOptions] = useState({
    snapToGrid: true,
    lockAspectRatio: true,
  });

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(draftConfig) !== JSON.stringify(config);
  }, [draftConfig, config]);

  const handleImageUpload = (imageUrl: string) => {
    setDraftConfig((prev) => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, imageUrl],
    }));
  };

  const handleImageSelect = (imageUrl: string) => {
    const newImage = createImageElement(imageUrl, draftConfig.images.length);
    setDraftConfig((prev) => ({
      ...prev,
      images: [...prev.images, newImage],
    }));
    setSelectedImageId(newImage.id);
    setIsPreview(false);
  };

  const updateImages = (
    updater: (images: ImageElement[]) => ImageElement[]
  ) => {
    setDraftConfig((prev) => ({
      ...prev,
      images: updater(prev.images),
    }));
  };

  const handleImageUpdate = (id: string, updates: Partial<ImageElement>) => {
    updateImages((images) =>
      images.map((image) =>
        image.id === id ? { ...image, ...updates } : image
      )
    );
  };

  const handleImageDelete = (id: string) => {
    updateImages((images) =>
      images
        .filter((image) => image.id !== id)
        .map((image, index) => ({ ...image, zIndex: index }))
    );
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  };

  const handleDuplicate = (id: string) => {
    const target = draftConfig.images.find((image) => image.id === id);
    if (!target) return;
    const duplicated: ImageElement = {
      ...target,
      id: nanoid(),
      x: Math.min(95, target.x + 5),
      y: Math.min(95, target.y + 5),
      zIndex: draftConfig.images.length,
    };
    setDraftConfig((prev) => ({
      ...prev,
      images: [...prev.images, duplicated],
    }));
    setSelectedImageId(duplicated.id);
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
  };

  const handleReset = () => {
    reset(config);
    setSelectedImageId(null);
    setIsPreview(false);
  };

  const handleSave = () => {
    updateConfig(draftConfig);
    reset(draftConfig);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 1500);
  };

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

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    },
    [redo, selectedImageId, undo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

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
          <Button
            variant="secondary"
            onClick={() => setIsPreview((prev) => !prev)}
          >
            {isPreview ? '편집으로 돌아가기' : '미리보기'}
          </Button>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <EditControls
            canUndo={canUndo}
            canRedo={canRedo}
            isPreview={isPreview}
            hasUnsavedChanges={hasUnsavedChanges}
            onUndo={undo}
            onRedo={redo}
            onClear={handleClear}
            onSave={handleSave}
            onTogglePreview={() => setIsPreview((prev) => !prev)}
            onReset={handleReset}
          />
        </div>

        <div className="rounded-[40px] bg-white/70 backdrop-blur border border-white/60 h-[75vh] mt-20 p-6 relative overflow-hidden">
          <BackgroundCanvas
            config={draftConfig}
            editable={!isPreview}
            selectedId={selectedImageId}
            onSelectImage={setSelectedImageId}
            onUpdateImage={handleImageUpdate}
            onRemoveImage={handleImageDelete}
            onDuplicateImage={handleDuplicate}
            snapToGrid={editorOptions.snapToGrid}
            gridSize={draftConfig.gridSize}
            lockAspectRatio={editorOptions.lockAspectRatio}
            showGuides={!isPreview}
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
          onSettingsChange={(settings) =>
            setDraftConfig((prev) => ({ ...prev, ...settings }))
          }
          onEditorOptionsChange={(options) =>
            setEditorOptions((prev) => ({ ...prev, ...options }))
          }
        />
      </div>
    </motion.div>
  );
};
