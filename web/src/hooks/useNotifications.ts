import { useCallback, useEffect, useRef, useState } from 'react';
import type { PhoneNotification } from '../types/phone';

const MAX_BANNERS = 3;

let counter = 1;

export function useNotifications() {
  const [banners, setBanners] = useState<Array<PhoneNotification & { _bid: number }>>([]);
  const timeouts = useRef(new Map<number, number>());

  const dismiss = useCallback((bid: number) => {
    setBanners((cur) => cur.filter((b) => b._bid !== bid));
    const t = timeouts.current.get(bid);
    if (t) {
      window.clearTimeout(t);
      timeouts.current.delete(bid);
    }
  }, []);

  const push = useCallback((n: PhoneNotification) => {
    const bid = counter++;
    setBanners((cur) => [{ ...n, _bid: bid }, ...cur].slice(0, MAX_BANNERS));
    const t = window.setTimeout(() => dismiss(bid), 4500);
    timeouts.current.set(bid, t);
  }, [dismiss]);

  useEffect(() => {
    const tos = timeouts.current;
    return () => {
      tos.forEach((id) => window.clearTimeout(id));
      tos.clear();
    };
  }, []);

  return { banners, push, dismiss };
}
