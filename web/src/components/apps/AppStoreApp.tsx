import { useEffect, useState } from 'react';
import { Header } from '../common/Header';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Icon } from '../../utils/icons';
import { fetchNui, isOk } from '../../utils/nui';
import type { PhoneAppDescriptor, Result } from '../../types/phone';

export function AppStoreApp({ onBack }: { onBack: () => void }) {
  const [apps, setApps] = useState<PhoneAppDescriptor[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetchNui<Result<PhoneAppDescriptor[]>>('getAvailableApps', {});
      if (isOk(res)) setApps(res.data ?? []);
    })();
  }, []);
  return (
    <>
      <Header title="App Store" onBack={onBack} />
      <div className="w2f-scroll w2f-pad-x" style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10 }}>
        <div className="w2f-muted" style={{ fontSize: 12 }}>
          Visible apps are server-controlled. Install / uninstall is foundation; you can hide non-essential apps in Settings.
        </div>
        {apps.map((a) => (
          <Card key={a.id}>
            <div className="w2f-row space-between">
              <div className="w2f-row" style={{ gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Icon name={a.icon} size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{a.label}</div>
                  <div className="w2f-muted" style={{ fontSize: 11 }}>{a.custom ? 'Custom app' : 'Built-in'}{a.foundation ? ' · foundation' : ''}</div>
                </div>
              </div>
              <Button variant="ghost" disabled>
                <Icon name="check" size={14} /> Installed
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
