import type { ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
  hint?: string;
}

export function FormField({ label, hint, children }: Props) {
  return (
    <div className="w2f-field">
      <label>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--w2f-muted)' }}>{hint}</div>}
    </div>
  );
}
