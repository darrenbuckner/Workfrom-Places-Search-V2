// useScrollLock.js
import { useEffect } from 'react';

export const useScrollLock = (isLocked) => {
  useEffect(() => {
    // Get original body style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    if (isLocked) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to prevent scrolling while maintaining position
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup function to restore original state
    return () => {
      if (isLocked) {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = originalStyle;
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isLocked]);
};