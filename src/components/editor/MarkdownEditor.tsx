import { forwardRef, useImperativeHandle, useRef } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface MarkdownEditorHandle {
  insertText: (before: string, after?: string, placeholder?: string) => void;
}

export const MarkdownEditor = forwardRef<
  MarkdownEditorHandle,
  MarkdownEditorProps
>(({ value, onChange, placeholder }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (
    before: string,
    after: string = '',
    placeholder: string = ''
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;

    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  useImperativeHandle(ref, () => ({
    insertText,
  }));

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-full p-4 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none resize-none font-mono"
    />
  );
});
