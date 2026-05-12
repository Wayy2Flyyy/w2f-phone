import { useEffect, useRef } from 'react';

export function useNuiEvent<T = unknown>(action: string, handler: (data: T) => void): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const listener = (event: MessageEvent<unknown>) => {
      const msg = event.data as { action?: string; data?: T } | null | undefined;
      if (!msg || typeof msg !== 'object' || msg.action !== action) return;
      ref.current(msg.data as T);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [action]);
}
