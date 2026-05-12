import { Icon } from '../../utils/icons';
import { useClock } from '../../hooks/useClock';
import { formatClock } from '../../utils/format';

export function StatusBar({ network }: { network?: string }) {
  const now = useClock();
  return (
    <div className="w2f-status-bar">
      <div className="left">
        <span className="time">{formatClock(now)}</span>
        {network && <span style={{ fontSize: 11, color: 'var(--w2f-muted)' }}>{network}</span>}
      </div>
      <div className="right">
        <Icon name="signal" size={14} />
        <Icon name="wifi" size={14} />
        <Icon name="battery" size={16} />
      </div>
    </div>
  );
}
