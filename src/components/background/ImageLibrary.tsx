import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Image as ImageIcon,
  Layers as LayersIcon,
  Settings as SettingsIcon,
  Trash2,
  Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FC } from 'react';
import type { ImageElement } from '../../types/background';

type SidebarTab = 'library' | 'layers' | 'settings';

interface EditorOptions {
  snapToGrid: boolean;
  lockAspectRatio: boolean;
}

interface ImageLibraryProps {
  uploadedImages: string[];
  elements: ImageElement[];
  selectedId: string | null;
  backgroundColor: string;
  showGrid: boolean;
  gridSize: number;
  editorOptions: EditorOptions;
  onImageSelect: (imageUrl: string) => void;
  onImageUpload: (imageUrl: string) => void;
  onLayerSelect: (id: string) => void;
  onLayerDelete: (id: string) => void;
  onLayerDuplicate: (id: string) => void;
  onLayerReorder: (
    id: string,
    direction: 'up' | 'down' | 'front' | 'back'
  ) => void;
  onSettingsChange: (settings: {
    backgroundColor?: string;
    showGrid?: boolean;
    gridSize?: number;
  }) => void;
  onEditorOptionsChange: (options: Partial<EditorOptions>) => void;
}

const COLOR_PRESETS = [
  '#fdf2f8',
  '#faf5ff',
  '#ecfeff',
  '#fefcbf',
  '#ffe4e6',
  '#e0f2fe',
  '#fef3c7',
  '#e4f9f5',
];

export const ImageLibrary: FC<ImageLibraryProps> = ({
  uploadedImages,
  elements,
  selectedId,
  backgroundColor,
  showGrid,
  gridSize,
  editorOptions,
  onImageSelect,
  onImageUpload,
  onLayerSelect,
  onLayerDelete,
  onLayerDuplicate,
  onLayerReorder,
  onSettingsChange,
  onEditorOptionsChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('library');

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);

    droppedFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const renderLibraryTab = () => (
    <>
      <div
        className="border-2 border-dashed border-purple-200 rounded-xl p-4 mb-4 text-center hover:border-purple-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload size={32} className="mx-auto mb-2 text-purple-400" />
        <p className="text-sm text-gray-600">
          클릭하거나 이미지를 드래그해서 업로드
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {uploadedImages.length === 0 ? (
          <div className="text-center py-10">
            <ImageIcon size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">
              아직 업로드된 이미지가 없어요
            </p>
          </div>
        ) : (
          uploadedImages.map((imageUrl, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-300"
              onClick={() => onImageSelect(imageUrl)}
            >
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))
        )}
      </div>
    </>
  );

  const renderLayersTab = () => (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
      {elements.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500">
          캔버스에 배치된 이미지가 없어요
        </div>
      ) : (
        elements
          .slice()
          .sort((a, b) => b.zIndex - a.zIndex)
          .map((element) => (
            <div
              key={element.id}
              className={`rounded-2xl border p-3 flex items-center gap-3 ${
                selectedId === element.id
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-purple-100 bg-white'
              }`}
            >
              <img
                src={element.imageUrl}
                alt=""
                className="w-14 h-14 rounded-xl object-cover border border-purple-100"
                onClick={() => onLayerSelect(element.id)}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-800">
                  레이어 #{element.zIndex + 1}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round(element.width)}px ·{' '}
                  {Math.round(element.height)}px
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  title="앞으로"
                  className="p-1 rounded-full hover:bg-purple-100"
                  onClick={() => onLayerReorder(element.id, 'up')}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  title="뒤로"
                  className="p-1 rounded-full hover:bg-purple-100"
                  onClick={() => onLayerReorder(element.id, 'down')}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  title="맨 앞으로"
                  className="p-1 rounded-full hover:bg-purple-100"
                  onClick={() => onLayerReorder(element.id, 'front')}
                >
                  <LayersIcon size={16} />
                </button>
                <button
                  title="복제"
                  className="p-1 rounded-full hover:bg-purple-100"
                  onClick={() => onLayerDuplicate(element.id)}
                >
                  <Copy size={16} />
                </button>
              </div>
              <button
                title="삭제"
                className="p-1 rounded-full hover:bg-red-100 text-red-500"
                onClick={() => onLayerDelete(element.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="flex-1 space-y-6 overflow-y-auto pr-1">
      <section>
        <p className="text-sm font-semibold text-purple-700 mb-2">
          배경 색상
        </p>
        <div className="grid grid-cols-4 gap-3">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              className={`h-10 rounded-xl border-2 transition-all ${
                backgroundColor === color
                  ? 'border-purple-500 scale-105'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onSettingsChange({ backgroundColor: color })}
              title={color}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <label className="flex items-center justify-between text-sm font-semibold text-purple-700">
          <span>그리드 표시</span>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => onSettingsChange({ showGrid: e.target.checked })}
            className="accent-purple-500"
          />
        </label>

        <label className="block text-xs text-gray-500">
          그리드 간격 ({gridSize}px)
        </label>
        <input
          type="range"
          min={10}
          max={80}
          step={5}
          value={gridSize}
          onChange={(e) =>
            onSettingsChange({ gridSize: Number(e.target.value) })
          }
          className="w-full accent-purple-500"
        />
      </section>

      <section className="space-y-4">
        <label className="flex items-center justify-between text-sm text-purple-700 font-semibold">
          스냅
          <input
            type="checkbox"
            checked={editorOptions.snapToGrid}
            onChange={(e) =>
              onEditorOptionsChange({ snapToGrid: e.target.checked })
            }
            className="accent-purple-500"
          />
        </label>

        <label className="flex items-center justify-between text-sm text-purple-700 font-semibold">
          비율 잠금
          <input
            type="checkbox"
            checked={editorOptions.lockAspectRatio}
            onChange={(e) =>
              onEditorOptionsChange({ lockAspectRatio: e.target.checked })
            }
            className="accent-purple-500"
          />
        </label>
      </section>
    </div>
  );

  const tabs = [
    { key: 'library', label: '라이브러리', icon: ImageIcon },
    { key: 'layers', label: '레이어', icon: LayersIcon },
    { key: 'settings', label: '설정', icon: SettingsIcon },
  ] as const;

  return (
    <div className="bg-white/90 backdrop-blur rounded-3xl p-4 cute-shadow h-full flex flex-col space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center justify-center gap-2 rounded-2xl py-2 text-sm font-semibold ${
              activeTab === tab.key
                ? 'bg-purple-500 text-white'
                : 'bg-purple-50 text-purple-500'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'library' && renderLibraryTab()}
      {activeTab === 'layers' && renderLayersTab()}
      {activeTab === 'settings' && renderSettingsTab()}
    </div>
  );
};
