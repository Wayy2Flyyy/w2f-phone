import { useEffect, useState } from 'react';

export function useClock(updateMs = 15_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, updateMs);
    return () => window.clearInterval(id);
  }, [updateMs]);
  return now;
}
