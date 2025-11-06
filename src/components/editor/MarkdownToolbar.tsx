import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react';
import { useRef, type ChangeEvent, type FC } from 'react';

interface MarkdownToolbarProps {
  onInsert: (before: string, after?: string, placeholder?: string) => void;
  onImageUpload?: (file: File) => Promise<void> | void;
}

export const MarkdownToolbar: FC<MarkdownToolbarProps> = ({
  onInsert,
  onImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageButton = () => {
    if (!onImageUpload) {
      onInsert('![', '](url)', '이미지 설명');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!onImageUpload) return;
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith('image/')
    );
    for (const file of files) {
      try {
        await onImageUpload(file);
      } catch (error) {
        console.error(error);
      }
    }
    event.target.value = '';
  };

  const tools = [
    {
      icon: Bold,
      title: '굵게',
      action: () => onInsert('**', '**', '굵은 텍스트'),
    },
    {
      icon: Italic,
      title: '기울임',
      action: () => onInsert('*', '*', '기울인 텍스트'),
    },
    {
      icon: Heading1,
      title: '제목 1',
      action: () => onInsert('# ', '', '제목 1'),
    },
    {
      icon: Heading2,
      title: '제목 2',
      action: () => onInsert('## ', '', '제목 2'),
    },
    {
      icon: Heading3,
      title: '제목 3',
      action: () => onInsert('### ', '', '제목 3'),
    },
    {
      icon: Link2,
      title: '링크',
      action: () => onInsert('[', '](url)', '링크 텍스트'),
    },
    {
      icon: Image,
      title: '이미지',
      action: handleImageButton,
    },
    { icon: Code, title: '코드', action: () => onInsert('`', '`', '코드') },
    {
      icon: Quote,
      title: '인용문',
      action: () => onInsert('> ', '', '인용문'),
    },
    {
      icon: List,
      title: '목록',
      action: () => onInsert('- ', '', '목록 항목'),
    },
    {
      icon: ListOrdered,
      title: '번호 목록',
      action: () => onInsert('1. ', '', '목록 항목'),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {tools.map((tool) => (
        <button
          key={tool.title}
          type="button"
          onClick={tool.action}
          title={tool.title}
          aria-label={tool.title}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 transition-colors"
        >
          <tool.icon size={18} />
        </button>
      ))}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
