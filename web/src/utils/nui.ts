import type { Result } from '../types/phone';

declare global {
  interface Window {
    GetParentResourceName?: () => string;
  }
}

const DEFAULT_TIMEOUT_MS = 8000;

export const isBrowser = (): boolean =>
  typeof window === 'undefined' || typeof window.GetParentResourceName !== 'function';

export const getResourceName = (): string => {
  if (typeof window !== 'undefined' && typeof window.GetParentResourceName === 'function') {
    return window.GetParentResourceName();
  }
  return 'w2f-phone';
};

export async function fetchNui<TRes = unknown, TBody = unknown>(
  eventName: string,
  data?: TBody,
  mockData?: TRes,
  options: { timeoutMs?: number } = {},
): Promise<TRes> {
  if (isBrowser()) {
    // eslint-disable-next-line no-console
    console.log(`[W2F PHONE MOCK NUI] ${eventName}`, data);
    if (mockData !== undefined) return mockData;
    return { ok: true } as unknown as TRes;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`https://${getResourceName()}/${eventName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(data ?? {}),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, code: 'HTTP_ERR', message: `HTTP ${response.status}` } as unknown as TRes;
    }

    const text = await response.text();
    if (!text) return { ok: true } as unknown as TRes;
    try {
      return JSON.parse(text) as TRes;
    } catch {
      return { ok: true } as unknown as TRes;
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, code: 'TIMEOUT', message: 'Request timed out' } as unknown as TRes;
    }
    return {
      ok: false,
      code: 'NETWORK',
      message: err instanceof Error ? err.message : 'Unknown error',
    } as unknown as TRes;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const isOk = <T,>(res: Result<T>): res is { ok: true; data?: T } =>
  res && (res as { ok?: boolean }).ok === true;
