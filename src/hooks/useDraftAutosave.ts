import { useEffect, useRef } from 'react';

type SaveHandler = (title: string, content: string) => void;

export const useDraftAutosave = (
  title: string,
  content: string,
  onSave: SaveHandler,
  delay = 1000
) => {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!title && !content) {
      return;
    }

    if (typeof timeoutRef.current === 'number') {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      onSave(title, content);
    }, delay);

    return () => {
      if (typeof timeoutRef.current === 'number') {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [title, content, delay, onSave]);
};
