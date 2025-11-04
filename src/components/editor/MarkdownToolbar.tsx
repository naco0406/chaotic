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
import type { FC } from 'react';
import { Button } from '../common/Button';

interface MarkdownToolbarProps {
  onInsert: (before: string, after?: string, placeholder?: string) => void;
}

export const MarkdownToolbar: FC<MarkdownToolbarProps> = ({ onInsert }) => {
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
      action: () => onInsert('![', '](url)', '이미지 설명'),
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
    <div className="bg-white rounded-2xl p-2 cute-shadow flex flex-wrap gap-1">
      {tools.map((tool) => (
        <Button
          key={tool.title}
          size="sm"
          variant="ghost"
          icon={tool.icon}
          onClick={tool.action}
          title={tool.title}
        />
      ))}
    </div>
  );
};
