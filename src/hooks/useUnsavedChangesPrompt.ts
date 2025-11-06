import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export const useUnsavedChangesPrompt = (
  shouldBlock: boolean,
  message = '변경사항이 저장되지 않았어요. 페이지를 떠나시겠어요?'
) => {
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (!shouldBlock || blocker.state !== 'blocked') {
      return;
    }

    const confirmLeave = window.confirm(message);

    if (confirmLeave) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker, message, shouldBlock]);

  useEffect(() => {
    if (typeof window === 'undefined' || !shouldBlock) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldBlock]);
};
