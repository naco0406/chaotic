import { memo, useMemo } from 'react';
import type { FC, MouseEvent } from 'react';
import type {
  BackgroundConfig,
  ImageElement as ImageElementType,
} from '../../types/background';
import { ImageElement } from './ImageElement';

interface BackgroundCanvasProps {
  config: BackgroundConfig;
  editable?: boolean;
  selectedId?: string | null;
  onSelectImage?: (id: string | null) => void;
  onUpdateImage?: (id: string, updates: Partial<ImageElementType>) => void;
  onRemoveImage?: (id: string) => void;
  onDuplicateImage?: (id: string) => void;
  snapToGrid?: boolean;
  gridSize?: number;
  lockAspectRatio?: boolean;
  showGuides?: boolean;
}

const BackgroundCanvasComponent: FC<BackgroundCanvasProps> = ({
  config,
  editable = false,
  selectedId,
  onSelectImage,
  onUpdateImage,
  onRemoveImage,
  onDuplicateImage,
  snapToGrid = false,
  gridSize,
  lockAspectRatio = true,
  showGuides = false,
}) => {
  const handleCanvasClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && onSelectImage) {
      onSelectImage(null);
    }
  };

  const shouldShowGrid = config.showGrid || showGuides;
  const resolvedGridSize = gridSize ?? config.gridSize ?? 20;

  const orderedImages = useMemo(
    () => [...config.images].sort((a, b) => a.zIndex - b.zIndex),
    [config.images]
  );

  return (
    <div
      className="relative w-full h-full rounded-3xl border border-emerald-100 bg-gradient-to-br from-white/85 via-white to-slate-50 overflow-hidden select-none"
      style={{
        background: config.backgroundColor,
        pointerEvents: editable ? 'auto' : 'none',
      }}
      onClick={handleCanvasClick}
    >
      {shouldShowGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              backgroundImage: `
              linear-gradient(0deg, rgba(125, 211, 252, 0.35) 1px, transparent 1px),
              linear-gradient(90deg, rgba(167, 243, 208, 0.35) 1px, transparent 1px)
            `,
            backgroundSize: `${resolvedGridSize}px ${resolvedGridSize}px`,
          }}
        />
      )}

      <div className="absolute inset-0 overflow-hidden">
        {orderedImages.map((image) => (
          <ImageElement
            key={image.id}
            image={image}
            isSelected={selectedId === image.id}
            editable={editable}
            snapToGrid={snapToGrid}
            gridSize={resolvedGridSize}
            lockAspectRatio={lockAspectRatio}
            onSelect={() => onSelectImage?.(image.id)}
            onUpdate={(updates) => onUpdateImage?.(image.id, updates)}
            onRemove={() => onRemoveImage?.(image.id)}
            onDuplicate={() => onDuplicateImage?.(image.id)}
          />
        ))}

        {config.images.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-500 pointer-events-none">
            <p className="text-lg font-semibold mb-2">
              편지를 환하게 만들 장식을 올려보세요 ✨
            </p>
            <p className="text-sm text-emerald-400">
              앨범에서 이미지를 고르고 드래그로 위치를 맞출 수 있어요
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const BackgroundCanvas = memo(BackgroundCanvasComponent);
