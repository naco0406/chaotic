import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ClipboardEvent,
  type DragEvent,
} from 'react';
import { createUploadPlaceholder } from '../../utils/uploadPlaceholder';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export interface MarkdownEditorHandle {
  insertText: (before: string, after?: string, placeholder?: string) => void;
  replaceText: (target: string, replacement: string) => void;
}

export const MarkdownEditor = forwardRef<
  MarkdownEditorHandle,
  MarkdownEditorProps
>(({ value, onChange, placeholder, onImageUpload }, ref) => {
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
    const currentValue = textarea.value;
    const selectedText = currentValue.substring(start, end) || placeholder;

    const newText =
      currentValue.substring(0, start) +
      before +
      selectedText +
      after +
      currentValue.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const replaceText = (target: string, replacement: string) => {
    const textarea = textareaRef.current;
    if (!textarea || !target) return;

    const currentValue = textarea.value;
    const index = currentValue.indexOf(target);

    if (index === -1) {
      if (!replacement) {
        return;
      }
      const needsNewline =
        currentValue.length > 0 && !currentValue.endsWith('\n');
      onChange(
        `${currentValue}${needsNewline ? '\n' : ''}${replacement}`
      );
      return;
    }

    const nextValue =
      currentValue.substring(0, index) +
      replacement +
      currentValue.substring(index + target.length);

    onChange(nextValue);

    setTimeout(() => {
      textarea.focus();
      const cursorPos = index + replacement.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  useImperativeHandle(ref, () => ({
    insertText,
    replaceText,
  }));

  const handleUploadedFiles = async (files: File[]) => {
    if (!onImageUpload || files.length === 0) {
      return;
    }
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const placeholder = createUploadPlaceholder(file.name);
      insertText('', '', placeholder.markdown);
      try {
        const downloadUrl = await onImageUpload(file);
        if (!downloadUrl) {
          replaceText(placeholder.markdown, '');
          continue;
        }
        const altText = file.name.replace(/\.[^/.]+$/, '') || '이미지 설명';
        replaceText(
          placeholder.markdown,
          `![${altText}](${downloadUrl})`
        );
      } catch (error) {
        console.error(error);
        const message =
          error instanceof Error
            ? error.message
            : '이미지 업로드에 실패했어요. 다시 시도해주세요.';
        replaceText(placeholder.markdown, `> ⚠️ ${message}`);
        alert(message);
      }
    }
  };

  const handleDragOver = (event: DragEvent<HTMLTextAreaElement>) => {
    if (!onImageUpload) return;
    const hasImage = Array.from(event.dataTransfer?.items ?? []).some(
      (item) => item.kind === 'file' && item.type.startsWith('image/')
    );
    if (hasImage) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = async (event: DragEvent<HTMLTextAreaElement>) => {
    if (!onImageUpload) return;
    const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
      file.type.startsWith('image/')
    );
    if (files.length === 0) return;
    event.preventDefault();
    await handleUploadedFiles(files);
  };

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!onImageUpload) return;
    const items = Array.from(event.clipboardData?.items ?? []);
    const files = items
      .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter((file): file is File => !!file);
    if (files.length === 0) return;
    event.preventDefault();
    await handleUploadedFiles(files);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPaste={handlePaste}
      placeholder={placeholder}
      className="w-full h-full p-4 rounded-2xl border-2 border-emerald-200 bg-white/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:outline-none resize-none font-mono text-slate-800"
    />
  );
});
