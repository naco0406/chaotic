import { Save } from 'lucide-react';
import type { FC } from 'react';
import { Button } from '../common/Button';

interface EditControlsProps {
  hasUnsavedChanges: boolean;
  onClear: () => void;
  onSave: () => void;
}

export const EditControls: FC<EditControlsProps> = ({
  hasUnsavedChanges,
  onSave,
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-50 via-sky-50 to-rose-50 rounded-full px-4 py-2 cute-shadow flex items-center gap-2 border border-white/60 flex-nowrap">
      {/* <Button
        size="sm"
        variant="ghost"
        icon={Trash2}
        onClick={onClear}
        title="모두 지우기"
        className="pl-3 pr-4 shrink-0 whitespace-nowrap"
      >
        모두 지우기
      </Button>
      <div className="w-px h-6 bg-gray-300" /> */}
      <div className="flex items-center gap-4 shrink-0 whitespace-nowrap">
        <span
          className={`text-xs font-semibold ${hasUnsavedChanges ? 'text-rose-500' : 'text-emerald-500'
            }`}
        >
          {hasUnsavedChanges ? '저장 필요' : '모든 변경사항 저장됨'}
        </span>
        <div className="w-px h-6 bg-gray-300" />
        <Button
          size="sm"
          icon={Save}
          onClick={onSave}
          className="shrink-0 whitespace-nowrap"
        >
          저장
        </Button>
      </div>
    </div>
  );
};
