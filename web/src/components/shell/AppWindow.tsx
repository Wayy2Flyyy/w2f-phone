import type { ReactNode } from 'react';

export function AppWindow({ children }: { children: ReactNode }) {
  return <div className="w2f-app-window">{children}</div>;
}
