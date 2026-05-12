import type { PhoneNotification } from '../../types/phone';
import { EmptyState } from '../common/EmptyState';
import { Header } from '../common/Header';
import { Button } from '../common/Button';
import { formatRelativeTime } from '../../utils/format';
import { Icon } from '../../utils/icons';

interface Props {
  notifications: PhoneNotification[];
  onClose: () => void;
  onClearAll: () => void;
  onTap?: (n: PhoneNotification) => void;
}

export function NotificationCenter({ notifications, onClose, onClearAll, onTap }: Props) {
  return (
    <div className="w2f-nc">
      <Header
        title="Notifications"
        onBack={onClose}
        right={
          <Button variant="ghost" onClick={onClearAll} disabled={notifications.length === 0}>
            Clear
          </Button>
        }
      />
      <div className="w2f-scroll" style={{ marginTop: 6 }}>
        {notifications.length === 0 ? (
          <EmptyState icon="bell" title="No notifications" description="You're all caught up." />
        ) : (
          <div className="w2f-stack-sm" style={{ padding: '6px 14px' }}>
            {notifications.map((n, i) => (
              <button
                key={i}
                className="w2f-list-row"
                style={{ borderRadius: 14, border: '1px solid var(--w2f-line)', marginBottom: 6, background: 'rgba(255,255,255,0.02)' }}
                onClick={() => onTap?.(n)}
              >
                <div className="avatar"><Icon name="bell" size={16} /></div>
                <div className="text">
                  <div className="title">{n.title}</div>
                  <div className="subtitle">{n.message ?? ''}</div>
                </div>
                <div className="meta">{formatRelativeTime(n.createdAt)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
