import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'danger' | 'success' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'default',
  leadingIcon,
  trailingIcon,
  children,
  fullWidth,
  className,
  style,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`w2f-btn ${variant !== 'default' ? variant : ''} ${className ?? ''}`.trim()}
      style={{ width: fullWidth ? '100%' : undefined, ...style }}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
