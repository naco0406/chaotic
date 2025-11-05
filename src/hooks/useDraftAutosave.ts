import { useEffect, useRef } from 'react';

interface DraftPayload {
  title: string;
  author: string;
  content: string;
}

type SaveHandler = (payload: DraftPayload) => void;

export const useDraftAutosave = (
  payload: DraftPayload,
  onSave: SaveHandler,
  delay = 1000
) => {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const { title, author, content } = payload;
    if (!title && !content && !author) {
      return;
    }

    if (typeof timeoutRef.current === 'number') {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      onSave(payload);
    }, delay);

    return () => {
      if (typeof timeoutRef.current === 'number') {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [payload.author, payload.content, payload.title, delay, onSave]);
};
