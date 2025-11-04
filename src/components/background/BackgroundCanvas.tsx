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
  snapToGrid?: boolean;
  gridSize?: number;
  lockAspectRatio?: boolean;
  showGuides?: boolean;
}

export const BackgroundCanvas: FC<BackgroundCanvasProps> = ({
  config,
  editable = false,
  selectedId,
  onSelectImage,
  onUpdateImage,
  onRemoveImage,
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

  return (
    <div
      className="relative w-full h-full rounded-3xl border border-purple-100 bg-gradient-to-br from-white/80 via-white to-white/90 overflow-hidden"
      style={{ background: config.backgroundColor }}
      onClick={handleCanvasClick}
    >
      {shouldShowGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(0deg, rgba(216, 180, 254, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(216, 180, 254, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: `${resolvedGridSize}px ${resolvedGridSize}px`,
          }}
        />
      )}

      <div className="absolute inset-0 overflow-hidden">
        {config.images
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((image) => (
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
            />
          ))}

        {config.images.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-400 pointer-events-none">
            <p className="text-lg font-semibold mb-2">
              라이브러리에서 이미지를 추가해보세요 ✨
            </p>
            <p className="text-sm text-purple-300">
              더블클릭으로 선택, 드래그로 이동할 수 있어요
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
