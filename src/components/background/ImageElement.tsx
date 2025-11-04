import { motion } from 'framer-motion';
import { Copy, Maximize2, RotateCw, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FC, MouseEvent } from 'react';
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

export const ImageElement: FC<ImageElementProps> = ({
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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
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
  const rotateStartRef = useRef({ angle: 0, x: 0, y: 0 });

  const clampPercentage = (value: number) => Math.max(0, Math.min(100, value));
  const snapValue = (value: number) =>
    snapToGrid ? Math.round(value / gridSize) * gridSize : value;

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!editable) return;
    e.stopPropagation();
    onSelect();

    const canvasRect = elementRef.current?.parentElement?.getBoundingClientRect();
    if (!canvasRect) return;

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      initialXPx: (image.x / 100) * canvasRect.width,
      initialYPx: (image.y / 100) * canvasRect.height,
      canvasRect,
    };
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: Event) => {
      const mouseEvent = e as globalThis.MouseEvent;
      if (isDragging) {
        const dragStart = dragStartRef.current;
        if (!dragStart.canvasRect) return;
        const dx = mouseEvent.clientX - dragStart.pointerX;
        const dy = mouseEvent.clientY - dragStart.pointerY;

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
      } else if (isResizing) {
        const dx = mouseEvent.clientX - resizeStartRef.current.pointerX;
        const dy = mouseEvent.clientY - resizeStartRef.current.pointerY;
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
      } else if (isRotating) {
        const rect = elementRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const angle =
          (Math.atan2(mouseEvent.clientY - centerY, mouseEvent.clientX - centerX) * 180) /
            Math.PI +
          90;

        onUpdate({ rotation: angle });
      }
    },
    [isDragging, isResizing, isRotating, onUpdate]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isRotating, handleMouseMove, handleMouseUp]);

  const handleResizeStart = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    resizeStartRef.current = {
      width: image.width,
      height: image.height,
      pointerX: e.clientX,
      pointerY: e.clientY,
    };
    setIsResizing(true);
  };

  const handleRotateStart = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    rotateStartRef.current = {
      angle: image.rotation,
      x: e.clientX,
      y: e.clientY,
    };
    setIsRotating(true);
  };

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        position: 'absolute',
        left: `${image.x}%`,
        top: `${image.y}%`,
        width: `${image.width}px`,
        height: `${image.height}px`,
        transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
        zIndex: image.zIndex,
        cursor: editable ? 'move' : 'default',
      }}
      className={`${isSelected && editable ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
      onMouseDown={handleMouseDown}
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
              className="bg-white text-purple-500 rounded-full p-1 shadow hover:bg-purple-50"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.();
              }}
            >
              <Copy size={14} />
            </button>
            <button
              className="bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
            >
              <X size={14} />
            </button>
          </div>

          <div
            className="absolute -bottom-3 -right-3 bg-blue-500 text-white rounded-full p-1 cursor-nwse-resize"
            onMouseDown={handleResizeStart}
          >
            <Maximize2 size={16} />
          </div>

          <div
            className="absolute -top-3 -left-3 bg-green-500 text-white rounded-full p-1 cursor-pointer"
            onMouseDown={handleRotateStart}
          >
            <RotateCw size={16} />
          </div>
        </>
      )}
    </motion.div>
  );
};
