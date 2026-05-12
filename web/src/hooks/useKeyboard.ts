import { useEffect } from 'react';

export function useKeyboard(key: string, handler: (e: KeyboardEvent) => void, when = true): void {
  useEffect(() => {
    if (!when) return undefined;
    const fn = (e: KeyboardEvent) => {
      if (e.key === key) handler(e);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [key, handler, when]);
}
