import { useEffect, useRef } from 'react';

interface DraftPayload {
  title: string;
  author: string;
  content: string;
}

type SaveHandler = (payload: DraftPayload) => Promise<void> | void;

export const useDraftAutosave = (
  payload: DraftPayload,
  onSave: SaveHandler,
  delay = 1000
) => {
  const timeoutRef = useRef<number | null>(null);
  const { title, author, content } = payload;

  useEffect(() => {
    if (!title && !content && !author) {
      return;
    }

    if (typeof timeoutRef.current === 'number') {
      window.clearTimeout(timeoutRef.current);
    }

    const nextPayload: DraftPayload = { title, author, content };
    timeoutRef.current = window.setTimeout(() => {
      void onSave(nextPayload);
    }, delay);

    return () => {
      if (typeof timeoutRef.current === 'number') {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [author, content, title, delay, onSave]);
};
