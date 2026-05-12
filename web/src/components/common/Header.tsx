import type { ReactNode } from 'react';
import { Icon } from '../../utils/icons';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function Header({ title, subtitle, onBack, right }: Props) {
  return (
    <div className="w2f-header">
      <div className="left">
        {onBack && (
          <button className="w2f-iconbtn" onClick={onBack} aria-label="Back">
            <Icon name="arrowLeft" />
          </button>
        )}
        <div>
          <h1>{title}</h1>
          {subtitle && <div className="subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="right">{right}</div>
    </div>
  );
}
