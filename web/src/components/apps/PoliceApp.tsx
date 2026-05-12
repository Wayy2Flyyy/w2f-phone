import { useState } from 'react';
import { Header } from '../common/Header';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Icon } from '../../utils/icons';
import { fetchNui, isOk } from '../../utils/nui';
import type { PhoneBootstrap, Result } from '../../types/phone';

export function PoliceApp({ bootstrap, onBack }: { bootstrap: PhoneBootstrap; onBack: () => void }) {
  const [status, setStatus] = useState<string | null>(null);
  const job = bootstrap.identity.job;

  const call = async (endpoint: 'openPoliceMdt' | 'openPoliceStatus' | 'triggerPolicePanic') => {
    setStatus(null);
    const res = await fetchNui<Result<{ launched?: boolean; dispatched?: boolean; reason?: string }>>(endpoint, {});
    if (!isOk(res)) {
      setStatus(res.message ?? res.code);
      return;
    }
    const d = res.data ?? {};
    if (d.reason === 'NO_W2F_POLICE') setStatus('w2f-police is not running on this server.');
    else if (d.launched === false && d.dispatched === false) setStatus('Not available right now.');
    else setStatus('Done.');
  };

  return (
    <>
      <Header title="Police" subtitle={job?.label ?? job?.name ?? 'Officer'} onBack={onBack} />
      <div className="w2f-scroll w2f-pad-x" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10 }}>
        <Card tone="accent">
          <div className="w2f-row space-between">
            <div>
              <div style={{ fontWeight: 600 }}>{bootstrap.identity.name}</div>
              <div className="w2f-muted" style={{ fontSize: 12 }}>
                {job?.label ?? job?.name ?? 'Officer'} · Grade {typeof job?.grade === 'number' ? job.grade : (job?.grade?.level ?? '—')}
              </div>
            </div>
            <div className={`w2f-pill ${job?.onduty ? 'success' : 'danger'}`}>{job?.onduty ? 'On duty' : 'Off duty'}</div>
          </div>
        </Card>

        <Card>
          <Button variant="primary" fullWidth leadingIcon={<Icon name="shieldCheck" size={16} />} onClick={() => call('openPoliceMdt')}>
            Open MDT
          </Button>
        </Card>
        <Card>
          <Button fullWidth leadingIcon={<Icon name="shield" size={16} />} onClick={() => call('openPoliceStatus')}>
            Officer Status
          </Button>
        </Card>
        <Card>
          <Button variant="danger" fullWidth leadingIcon={<Icon name="alert" size={16} />} onClick={() => call('triggerPolicePanic')}>
            Panic Button
          </Button>
          <div className="w2f-muted" style={{ fontSize: 11, marginTop: 6 }}>
            Sends an emergency dispatch to all on-duty units. Cooldown applies.
          </div>
        </Card>

        {status && (
          <div className="w2f-muted" style={{ textAlign: 'center', fontSize: 12 }}>{status}</div>
        )}
        <div className="w2f-muted" style={{ fontSize: 11, textAlign: 'center' }}>
          MDT / Status / Dispatch require w2f-police running.
        </div>
      </div>
    </>
  );
}
