import { useEffect } from 'react';

export function useInteract(callback) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE') {
        callback();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}
