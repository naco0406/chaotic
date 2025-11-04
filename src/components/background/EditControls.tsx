import {
  Eye,
  EyeOff,
  Redo2,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
} from 'lucide-react';
import type { FC } from 'react';
import { Button } from '../common/Button';

interface EditControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  isPreview: boolean;
  hasUnsavedChanges: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onTogglePreview: () => void;
  onReset: () => void;
}

export const EditControls: FC<EditControlsProps> = ({
  canUndo,
  canRedo,
  isPreview,
  hasUnsavedChanges,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onTogglePreview,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-full px-4 py-2 cute-shadow flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        icon={Undo2}
        disabled={!canUndo}
        onClick={onUndo}
        title="되돌리기"
      />
      <Button
        size="sm"
        variant="ghost"
        icon={Redo2}
        disabled={!canRedo}
        onClick={onRedo}
        title="다시실행"
      />
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <Button
        size="sm"
        variant="ghost"
        icon={isPreview ? EyeOff : Eye}
        onClick={onTogglePreview}
        title={isPreview ? '편집 모드' : '미리보기'}
      />
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <Button
        size="sm"
        variant="ghost"
        icon={Trash2}
        onClick={onClear}
        title="모두 지우기"
      />
      <Button
        size="sm"
        variant="ghost"
        icon={RotateCcw}
        onClick={onReset}
        title="초기화"
      />
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-semibold ${
            hasUnsavedChanges ? 'text-rose-500' : 'text-emerald-500'
          }`}
        >
          {hasUnsavedChanges ? '저장 필요' : '모든 변경사항 저장됨'}
        </span>
        <Button size="sm" icon={Save} onClick={onSave}>
          저장
        </Button>
      </div>
    </div>
  );
};
