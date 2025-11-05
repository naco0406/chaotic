import { memo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Copy, Maximize2, RotateCw, X } from 'lucide-react';
import type { FC, PointerEvent as ReactPointerEvent } from 'react';
import type { ImageElement as ImageElementType } from '../../types/background';

interface ImageElementProps {
  image: ImageElementType;
  isSelected: boolean;
  editable: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  lockAspectRatio?: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ImageElementType>) => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
}

const ImageElementComponent: FC<ImageElementProps> = ({
  image,
  isSelected,
  editable,
  snapToGrid = false,
  gridSize = 20,
  lockAspectRatio = true,
  onSelect,
  onUpdate,
  onRemove,
  onDuplicate,
}) => {
  const rotationValue =
    typeof image.rotation === 'number' ? image.rotation : 0;
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    initialXPx: 0,
    initialYPx: 0,
    canvasRect: null as DOMRect | null,
  });
  const resizeStartRef = useRef({
    width: 0,
    height: 0,
    pointerX: 0,
    pointerY: 0,
  });
  const rotateStartRef = useRef({
    baseRotation: 0,
    startPointerAngle: 0,
    centerX: 0,
    centerY: 0,
  });
  const previousUserSelect = useRef<string>('');
  const pointerIdRef = useRef<number | null>(null);
  const actionRef = useRef<'idle' | 'drag' | 'resize' | 'rotate'>('idle');

  const clampPercentage = (value: number) => Math.max(0, Math.min(100, value));
  const snapValue = (value: number) =>
    snapToGrid ? Math.round(value / gridSize) * gridSize : value;

  const lockBodyInteraction = (cursor: string) => {
    previousUserSelect.current = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = cursor;
    window.getSelection()?.removeAllRanges();
  };

  const releaseBodyInteraction = () => {
    document.body.style.userSelect = previousUserSelect.current;
    document.body.style.cursor = '';
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }
    if (actionRef.current === 'drag') {
      const dragStart = dragStartRef.current;
      if (!dragStart.canvasRect) return;
      const dx = event.clientX - dragStart.pointerX;
      const dy = event.clientY - dragStart.pointerY;
      const nextXPx = snapValue(dragStart.initialXPx + dx);
      const nextYPx = snapValue(dragStart.initialYPx + dy);
      const nextXPercent = clampPercentage(
        (nextXPx / dragStart.canvasRect.width) * 100
      );
      const nextYPercent = clampPercentage(
        (nextYPx / dragStart.canvasRect.height) * 100
      );
      onUpdate({
        x: nextXPercent,
        y: nextYPercent,
      });
    } else if (actionRef.current === 'resize') {
      const dx = event.clientX - resizeStartRef.current.pointerX;
      const dy = event.clientY - resizeStartRef.current.pointerY;
      const aspectRatio =
        resizeStartRef.current.width / resizeStartRef.current.height || 1;

      let newWidth = resizeStartRef.current.width + dx;
      let newHeight = lockAspectRatio
        ? newWidth / aspectRatio
        : resizeStartRef.current.height + dy;

      newWidth = snapValue(Math.max(60, newWidth));
      newHeight = snapValue(Math.max(60, newHeight));

      onUpdate({
        width: newWidth,
        height: newHeight,
      });
    } else if (actionRef.current === 'rotate') {
      const { centerX, centerY, startPointerAngle, baseRotation } =
        rotateStartRef.current;
      const currentAngle = Math.atan2(
        event.clientY - centerY,
        event.clientX - centerX
      );
      const deltaDeg = ((currentAngle - startPointerAngle) * 180) / Math.PI;
      onUpdate({ rotation: baseRotation + deltaDeg });
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }
    pointerIdRef.current = null;
    actionRef.current = 'idle';
    releaseBodyInteraction();
    if (elementRef.current?.hasPointerCapture(event.pointerId)) {
      elementRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editable) return;
    event.preventDefault();
    event.stopPropagation();
    const canvasRect = elementRef.current?.parentElement?.getBoundingClientRect();
    if (!canvasRect) return;
    pointerIdRef.current = event.pointerId;
    actionRef.current = 'drag';
    onSelect();
    lockBodyInteraction('grabbing');
    elementRef.current?.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      initialXPx: (image.x / 100) * canvasRect.width,
      initialYPx: (image.y / 100) * canvasRect.height,
      canvasRect,
    };
  };

  const handleResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editable) return;
    event.preventDefault();
    event.stopPropagation();
    pointerIdRef.current = event.pointerId;
    actionRef.current = 'resize';
    onSelect();
    lockBodyInteraction('nwse-resize');
    elementRef.current?.setPointerCapture(event.pointerId);
    resizeStartRef.current = {
      width: image.width,
      height: image.height,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
  };

  const handleRotateStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editable) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    pointerIdRef.current = event.pointerId;
    actionRef.current = 'rotate';
    onSelect();
    elementRef.current?.setPointerCapture(event.pointerId);
    rotateStartRef.current = {
      baseRotation: rotationValue,
      startPointerAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX),
      centerX,
      centerY,
    };
    lockBodyInteraction('grabbing');
  };

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        left: `${image.x}%`,
        top: `${image.y}%`,
        width: `${image.width}px`,
        height: `${image.height}px`,
        transform: `translate(-50%, -50%) rotate(${rotationValue}deg)`,
        zIndex: image.zIndex,
        cursor: editable ? 'move' : 'default',
        userSelect: 'none',
      }}
      className={`${
        isSelected && editable ? 'ring-2 ring-sky-300 ring-offset-2 ring-offset-lime-50' : ''
      }`}
      onPointerDown={beginDrag}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <img
        src={image.imageUrl}
        alt=""
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />

      {isSelected && editable && (
        <>
          <div className="absolute -top-5 right-0 flex gap-1">
            <button
              className="bg-white text-sky-500 rounded-full p-1 shadow hover:bg-sky-50"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.();
              }}
            >
              <Copy size={14} />
            </button>
            <button
              className="bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
            >
              <X size={14} />
            </button>
          </div>

          <div
            className="absolute -bottom-3 -right-3 bg-cyan-500 text-white rounded-full p-1 cursor-nwse-resize"
            onPointerDown={handleResizeStart}
          >
            <Maximize2 size={16} />
          </div>

          <div
            className="absolute -top-3 -left-3 bg-amber-400 text-white rounded-full p-1 cursor-grab"
            onPointerDown={handleRotateStart}
          >
            <RotateCw size={16} />
          </div>
        </>
      )}
    </motion.div>
  );
};

export const ImageElement = memo(ImageElementComponent);
