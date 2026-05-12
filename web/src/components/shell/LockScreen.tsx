import type { PhoneBootstrap, PhoneNotification } from '../../types/phone';
import { useClock } from '../../hooks/useClock';
import { formatClock, formatDateLong, formatRelativeTime } from '../../utils/format';
import { Icon } from '../../utils/icons';

interface Props {
  bootstrap: PhoneBootstrap;
  notifications: PhoneNotification[];
  onUnlock: () => void;
}

export function LockScreen({ bootstrap, notifications, onUnlock }: Props) {
  const now = useClock(15000);

  return (
    <div className="w2f-lock" onClick={onUnlock} role="button" tabIndex={0}>
      <div className="device-name">{bootstrap.device.deviceName}</div>
      <div className="time">{formatClock(now)}</div>
      <div className="date">{formatDateLong(now)}</div>
      {bootstrap.device.isStolen && <div className="stolen-pill">Stolen device</div>}

      <div className="notif-preview">
        {notifications.slice(0, 3).map((n, i) => (
          <div key={i} className="w2f-banner" style={{ width: '100%' }}>
            <div className="icon-wrap"><Icon name="bell" size={16} /></div>
            <div className="body">
              <div className="ttl">{n.title}</div>
              <div className="msg">{n.message ?? ''}</div>
            </div>
            <div className="w2f-muted" style={{ fontSize: 11 }}>{formatRelativeTime(n.createdAt)}</div>
          </div>
        ))}
      </div>

      <div className="unlock-cta">
        <Icon name="lock" size={18} />
        <div className="swipe" />
        Swipe up to unlock
      </div>
    </div>
  );
}
