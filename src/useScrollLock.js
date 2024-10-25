// useScrollLock.js
import { useEffect } from 'react';

export const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (!isLocked) return;

    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
};