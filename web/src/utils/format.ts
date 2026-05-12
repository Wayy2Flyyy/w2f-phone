export function formatPhoneNumber(raw: string | undefined | null): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

export function formatMoney(n: number | undefined | null): string {
  const v = typeof n === 'number' ? n : 0;
  return `$${v.toLocaleString('en-US')}`;
}

export function formatRelativeTime(ts: number | undefined | null, nowSec?: number): string {
  if (!ts) return '';
  const now = typeof nowSec === 'number' ? nowSec : Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - ts);
  if (diff < 45) return 'just now';
  if (diff < 90) return '1 min ago';
  if (diff < 60 * 45) return `${Math.round(diff / 60)} min ago`;
  if (diff < 60 * 90) return '1 hour ago';
  if (diff < 60 * 60 * 22) return `${Math.round(diff / 3600)} hours ago`;
  if (diff < 60 * 60 * 36) return 'yesterday';
  return new Date(ts * 1000).toLocaleDateString();
}

export function formatClock(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDuration(seconds: number | undefined | null): string {
  const s = Math.max(0, Math.floor(seconds ?? 0));
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}
