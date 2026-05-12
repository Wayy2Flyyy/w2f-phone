import type { PhoneAppDescriptor } from '../../types/phone';
import { Icon } from '../../utils/icons';

interface Props {
  app: PhoneAppDescriptor;
  badge?: number;
  onClick: () => void;
}

export function AppIcon({ app, badge, onClick }: Props) {
  return (
    <button type="button" className="w2f-app-icon" onClick={onClick}>
      <div className="square" style={{ background: app.color }}>
        <Icon name={app.icon} />
      </div>
      <div className="label">{app.label}</div>
      {badge != null && badge > 0 && <span className="badge">{badge > 99 ? '99+' : badge}</span>}
    </button>
  );
}
