import { useCallback, useState } from 'react';

interface HistoryState<T> {
  stack: T[];
  pointer: number;
}

export const useUndoRedo = <T>(initialState: T) => {
  const [historyState, setHistoryState] = useState<HistoryState<T>>({
    stack: [initialState],
    pointer: 0,
  });

  const setState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setHistoryState((prev) => {
        const base = prev.stack[prev.pointer];
        const nextValue = typeof value === 'function'
          ? (value as (prevState: T) => T)(base)
          : value;
        const nextStack = [...prev.stack.slice(0, prev.pointer + 1), nextValue];
        return {
          stack: nextStack,
          pointer: nextStack.length - 1,
        };
      });
    },
    []
  );

  const undo = useCallback(() => {
    setHistoryState((prev) =>
      prev.pointer > 0
        ? { ...prev, pointer: prev.pointer - 1 }
        : prev
    );
  }, []);

  const redo = useCallback(() => {
    setHistoryState((prev) =>
      prev.pointer < prev.stack.length - 1
        ? { ...prev, pointer: prev.pointer + 1 }
        : prev
    );
  }, []);

  const reset = useCallback((state: T) => {
    setHistoryState({
      stack: [state],
      pointer: 0,
    });
  }, []);

  const { stack, pointer } = historyState;
  const canUndo = pointer > 0;
  const canRedo = pointer < stack.length - 1;

  return {
    state: stack[pointer],
    setState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
};
