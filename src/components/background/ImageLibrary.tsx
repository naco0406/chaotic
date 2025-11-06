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
  onImageUpload: (file: File) => Promise<void>;
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      await Promise.all(files.map((file) => onImageUpload(file)));
    } catch (error) {
      console.error('Image upload failed', error);
      setUploadError('이미지 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    );
    await processFiles(validFiles);
    e.target.value = '';
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    await processFiles(droppedFiles);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const renderLibraryTab = () => (
    <>
      <div
        className="relative mb-4 overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-white via-sky-50 to-emerald-50 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] cursor-pointer transition-colors hover:border-emerald-300"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload size={32} className="mx-auto mb-2 text-sky-400" />
        <p className="text-sm font-semibold text-slate-700">
          클릭하거나 이미지를 드래그해 올려주세요
        </p>
        <p className="text-xs text-slate-400">
          PNG, JPG, GIF 지원 · 최대 10MB
        </p>
        {isUploading && (
          <p className="text-xs text-emerald-500 mt-2">
            사진을 업로드하는 중이에요...
          </p>
        )}
        {uploadError && (
          <p className="text-xs text-rose-500 mt-2">
            {uploadError}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {uploadedImages.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-slate-100 bg-white/80">
            <ImageIcon size={48} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-500">
              아직 앨범이 비어 있어요. 사진이나 스티커를 올려주세요!
            </p>
          </div>
        ) : (
          uploadedImages.map((imageUrl, index) => (
            <motion.button
              type="button"
              key={index}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group w-full rounded-2xl border border-transparent ring-1 ring-slate-100 ring-offset-1 ring-offset-white bg-white/80 transition-all duration-200 hover:ring-emerald-200 hover:ring-offset-2"
              onClick={() => onImageSelect(imageUrl)}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-[18px] bg-slate-50">
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </motion.button>
          ))
        )}
      </div>
    </>
  );

  const renderLayersTab = () => (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
      {elements.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500 rounded-2xl border border-slate-100 bg-white/80">
          아직 편지 배경에 놓인 장식이 없어요
        </div>
      ) : (
        elements
          .slice()
          .sort((a, b) => b.zIndex - a.zIndex)
          .map((element) => (
            <div
              key={element.id}
              role="button"
              tabIndex={0}
              onClick={() => onLayerSelect(element.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onLayerSelect(element.id);
                }
              }}
              className={`group rounded-2xl border border-transparent ring-1 ring-slate-100 ring-offset-1 ring-offset-white bg-white/90 p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:ring-emerald-200 ${
                selectedId === element.id
                  ? 'ring-emerald-300 ring-offset-2 shadow-[0_18px_45px_-30px_rgba(16,185,129,0.9)]'
                  : ''
              }`}
            >
              <img
                src={element.imageUrl}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover border border-white/80 shadow-inner"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  레이어 #{element.zIndex + 1}
                </p>
                <p className="text-xs text-slate-500">
                  {Math.round(element.width)}px ·{' '}
                  {Math.round(element.height)}px
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  title="앞으로"
                  className="p-1.5 rounded-full border border-transparent text-emerald-600 hover:bg-emerald-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerReorder(element.id, 'up');
                  }}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  title="뒤로"
                  className="p-1.5 rounded-full border border-transparent text-sky-500 hover:bg-sky-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerReorder(element.id, 'down');
                  }}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  title="맨 앞으로"
                  className="p-1.5 rounded-full border border-transparent text-amber-500 hover:bg-amber-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerReorder(element.id, 'front');
                  }}
                >
                  <LayersIcon size={16} />
                </button>
                <button
                  title="복제"
                  className="p-1.5 rounded-full border border-transparent text-cyan-500 hover:bg-cyan-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerDuplicate(element.id);
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
              <button
                title="삭제"
                className="p-1.5 rounded-full border border-transparent text-rose-500 hover:bg-rose-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onLayerDelete(element.id);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="flex-1 space-y-4 overflow-y-auto pr-1">
      <section className="rounded-2xl border border-white/70 bg-white/85 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          배경 색상
        </p>
        <div className="grid grid-cols-4 gap-3">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              className={`h-10 rounded-xl border-2 transition-all duration-200 ${backgroundColor === color ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-200/40' : 'border-transparent hover:border-slate-200'}`}
              style={{ backgroundColor: color }}
              onClick={() => onSettingsChange({ backgroundColor: color })}
              title={color}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/85 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">그리드 표시</span>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => onSettingsChange({ showGrid: e.target.checked })}
              className="accent-emerald-500"
            />
          </label>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">
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
            className="w-full accent-sky-500"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/85 p-4 space-y-3">
        <label className="flex items-center justify-between text-sm text-slate-700 font-semibold">
          스냅
          <input
            type="checkbox"
            checked={editorOptions.snapToGrid}
            onChange={(e) =>
              onEditorOptionsChange({ snapToGrid: e.target.checked })
            }
            className="accent-emerald-500"
          />
        </label>

        <label className="flex items-center justify-between text-sm text-slate-700 font-semibold">
          비율 잠금
          <input
            type="checkbox"
            checked={editorOptions.lockAspectRatio}
            onChange={(e) =>
              onEditorOptionsChange({ lockAspectRatio: e.target.checked })
            }
            className="accent-sky-500"
          />
        </label>
      </section>
    </div>
  );

  const tabs = [
    { key: 'library', label: '이미지', icon: ImageIcon },
    { key: 'layers', label: '레이어', icon: LayersIcon },
    { key: 'settings', label: '설정', icon: SettingsIcon },
  ] as const;

  return (
    <div className="h-full rounded-[32px] border border-white/70 bg-white/85 px-5 py-6 backdrop-blur flex flex-col gap-5 shadow-[0_35px_80px_-40px_rgba(15,23,42,0.45)]">
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition-all py-2.5 ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-emerald-400 via-sky-400 to-pink-400 text-white shadow-lg shadow-emerald-200/40 border-white/80'
                : 'bg-white/70 text-slate-500 border-white/80 hover:border-emerald-200 hover:text-emerald-500'
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
