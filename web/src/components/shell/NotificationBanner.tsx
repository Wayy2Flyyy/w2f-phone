import type { PhoneNotification } from '../../types/phone';
import { Icon } from '../../utils/icons';
import type { IconKey } from '../../utils/icons';

const iconForApp: Record<string, IconKey> = {
  messages: 'messages',
  phone: 'phone',
  bank: 'bank',
  share: 'share',
  police: 'shield',
  system: 'bell',
};

export function NotificationBanner({ notif, onDismiss, onTap }: {
  notif: PhoneNotification;
  onDismiss: () => void;
  onTap?: () => void;
}) {
  return (
    <div className="w2f-banner" onClick={onTap} role="button" tabIndex={0}>
      <div className="icon-wrap">
        <Icon name={iconForApp[notif.app] ?? 'bell'} size={16} />
      </div>
      <div className="body">
        <div className="ttl">{notif.title}</div>
        {notif.message && <div className="msg">{notif.message}</div>}
      </div>
      <button className="w2f-iconbtn" style={{ width: 24, height: 24 }} onClick={(e) => { e.stopPropagation(); onDismiss(); }} aria-label="Dismiss">
        <Icon name="close" size={12} />
      </button>
    </div>
  );
}
