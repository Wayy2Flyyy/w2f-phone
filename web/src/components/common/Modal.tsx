import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Button } from './Button';

interface Props {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
}

export function Modal({ title, children, open, onClose, onConfirm, confirmLabel = 'Save', confirmVariant = 'primary' }: Props) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="w2f-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w2f-modal" role="dialog" aria-modal="true">
        <h2>{title}</h2>
        {children}
        <div className="actions">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {onConfirm && (
            <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
