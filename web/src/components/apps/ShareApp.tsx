import { useState } from 'react';
import { Header } from '../common/Header';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { FormField } from '../common/FormField';
import { Icon } from '../../utils/icons';
import { fetchNui, isOk } from '../../utils/nui';
import type { Result, SharePayload, ShareKind } from '../../types/phone';
import { formatRelativeTime } from '../../utils/format';

interface Props {
  onBack: () => void;
  myNumber: string;
  lastShareReceived: SharePayload | null;
}

const KIND_LABEL: Record<ShareKind, string> = {
  number: 'Phone number',
  contact: 'Contact card',
  location: 'Location',
  vehicle: 'Vehicle (foundation)',
  invoice: 'Invoice (foundation)',
  media: 'Media (foundation)',
};

export function ShareApp({ onBack, myNumber, lastShareReceived }: Props) {
  const [target, setTarget] = useState('');
  const [kind, setKind] = useState<ShareKind>('number');
  const [extra, setExtra] = useState<{ name?: string; number?: string; lat?: string; lng?: string; label?: string }>({});
  const [status, setStatus] = useState<string | null>(null);

  const send = async () => {
    setStatus(null);
    let payload: Record<string, unknown> = {};
    if (kind === 'number') payload = { number: myNumber };
    if (kind === 'contact') payload = { name: extra.name, number: extra.number };
    if (kind === 'location') payload = { lat: Number(extra.lat ?? 0), lng: Number(extra.lng ?? 0), label: extra.label };

    const res = await fetchNui<Result<{ delivered: boolean; reason?: string }>>('sharePayload', {
      kind, targetNumber: target.trim(), payload,
    });
    if (!isOk(res)) {
      setStatus(res.message ?? res.code);
      return;
    }
    setStatus(res.data?.delivered ? 'Delivered.' : `Saved, recipient is offline.`);
  };

  return (
    <>
      <Header title="W2F Share" onBack={onBack} subtitle="Premium share for Qbox" />
      <div className="w2f-scroll w2f-pad-x" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10 }}>
        <Card tone="accent">
          <div style={{ fontWeight: 600 }}>Share</div>
          <FormField label="Target number">
            <Input value={target} onChange={(e) => setTarget(e.target.value)} maxLength={16} placeholder="555-1234567" />
          </FormField>
          <FormField label="What to share">
            <div className="w2f-row wrap" style={{ gap: 6 }}>
              {(Object.keys(KIND_LABEL) as ShareKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`w2f-pill ${k === kind ? 'warn' : ''}`}
                  style={{ cursor: 'pointer', border: `1px solid ${k === kind ? 'var(--w2f-gold)' : 'var(--w2f-line)'}` }}
                  onClick={() => setKind(k)}
                >
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>
          </FormField>

          {kind === 'contact' && (
            <>
              <FormField label="Name"><Input value={extra.name ?? ''} maxLength={64} onChange={(e) => setExtra({ ...extra, name: e.target.value })} /></FormField>
              <FormField label="Number"><Input value={extra.number ?? ''} maxLength={16} onChange={(e) => setExtra({ ...extra, number: e.target.value })} /></FormField>
            </>
          )}
          {kind === 'location' && (
            <>
              <FormField label="Latitude"><Input value={extra.lat ?? ''} onChange={(e) => setExtra({ ...extra, lat: e.target.value })} /></FormField>
              <FormField label="Longitude"><Input value={extra.lng ?? ''} onChange={(e) => setExtra({ ...extra, lng: e.target.value })} /></FormField>
              <FormField label="Label"><Input value={extra.label ?? ''} maxLength={80} onChange={(e) => setExtra({ ...extra, label: e.target.value })} /></FormField>
            </>
          )}

          <Button variant="primary" fullWidth onClick={send} leadingIcon={<Icon name="share" size={14} />} disabled={!target.trim()}>
            Send share
          </Button>
          {status && <div className="w2f-muted" style={{ fontSize: 12, textAlign: 'center' }}>{status}</div>}
        </Card>

        <Card>
          <div style={{ fontWeight: 600 }}>Recently received</div>
          {lastShareReceived ? (
            <div className="w2f-stack-sm" style={{ marginTop: 4 }}>
              <div className="w2f-row space-between">
                <div className="w2f-pill">{lastShareReceived.kind}</div>
                <div className="w2f-muted" style={{ fontSize: 11 }}>{formatRelativeTime(lastShareReceived.createdAt)}</div>
              </div>
              <div>{lastShareReceived.preview ?? JSON.stringify(lastShareReceived.payload)}</div>
              {lastShareReceived.from && <div className="w2f-muted" style={{ fontSize: 12 }}>From {lastShareReceived.from}</div>}
            </div>
          ) : (
            <div className="w2f-muted" style={{ fontSize: 12 }}>Nothing yet. Shares from other phones will land here.</div>
          )}
        </Card>

        <div className="w2f-muted" style={{ fontSize: 11, textAlign: 'center' }}>
          Vehicle / invoice / media share kinds are wired but require sibling resources to populate.
        </div>
      </div>
    </>
  );
}
