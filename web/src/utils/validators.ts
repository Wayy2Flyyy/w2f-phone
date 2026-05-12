export const isNonEmpty = (s: unknown): s is string =>
  typeof s === 'string' && s.trim().length > 0;

export const isPhoneNumber = (s: unknown): s is string =>
  typeof s === 'string' && /^[\d\s-]{3,16}$/.test(s);

export const clampLen = (s: string, max: number) => (s.length > max ? s.slice(0, max) : s);
