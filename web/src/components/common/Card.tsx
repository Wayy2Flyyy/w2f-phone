import type { CSSProperties, ReactNode } from 'react';

export function Card({
  children,
  tone,
  style,
  className,
}: {
  children: ReactNode;
  tone?: 'gold' | 'accent';
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={`w2f-card ${tone ?? ''} ${className ?? ''}`.trim()} style={style}>
      {children}
    </div>
  );
}
