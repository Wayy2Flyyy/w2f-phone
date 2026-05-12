import type { ReactNode } from 'react';
import { Icon } from '../../utils/icons';
import type { IconKey } from '../../utils/icons';

export function EmptyState({
  icon = 'star',
  title,
  description,
  action,
  foundation,
}: {
  icon?: IconKey;
  title: string;
  description?: string;
  action?: ReactNode;
  foundation?: boolean;
}) {
  return (
    <div className="w2f-empty">
      <div className="icon-wrap"><Icon name={icon} /></div>
      <div className="title">{title}</div>
      {description && <div className="desc">{description}</div>}
      {foundation && <span className="w2f-foundation-pill">Foundation</span>}
      {action}
    </div>
  );
}
