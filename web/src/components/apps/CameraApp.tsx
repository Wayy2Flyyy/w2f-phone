import { useState } from 'react';
import { Header } from '../common/Header';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { fetchNui } from '../../utils/nui';
import { Icon } from '../../utils/icons';

interface CapResult { ok: boolean; code?: string; message?: string; data?: { url?: string } }

export function CameraApp({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<{ status: 'idle' | 'capturing' | 'error' | 'success'; message?: string }>({ status: 'idle' });

  const capture = async () => {
    setState({ status: 'capturing', message: 'Requesting capture...' });
    const res = await fetchNui<CapResult>('requestCameraCapture', {});
    if (!res.ok) {
      setState({ status: 'error', message: res.message ?? res.code ?? 'Camera unavailable.' });
      return;
    }
    setState({ status: 'success', message: 'Captured.' });
  };

  return (
    <>
      <Header title="Camera" onBack={onBack} />
      <div className="w2f-scroll w2f-pad-x" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10 }}>
        <Card>
          <div className="w2f-row space-between">
            <div style={{ fontWeight: 600 }}>Photo capture</div>
            <span className="w2f-foundation-pill">Foundation</span>
          </div>
          <div style={{
            aspectRatio: '4 / 3',
            background: 'linear-gradient(180deg, #0b1238, #04081c)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--w2f-muted)',
            fontSize: 12,
          }}>
            <div className="w2f-row" style={{ gap: 8 }}>
              <Icon name="camera" size={20} />
              {state.status === 'capturing' ? 'Capturing...' : 'Viewfinder preview'}
            </div>
          </div>
          <Button variant="primary" fullWidth onClick={capture} disabled={state.status === 'capturing'} leadingIcon={<Icon name="camera" size={16} />}>
            {state.status === 'capturing' ? 'Capturing...' : 'Capture photo'}
          </Button>
          {state.message && (
            <div className={state.status === 'error' ? 'w2f-danger-text' : 'w2f-muted'} style={{ fontSize: 12, textAlign: 'center' }}>
              {state.message}
            </div>
          )}
        </Card>
        <div className="w2f-muted" style={{ fontSize: 11, textAlign: 'center' }}>
          Capture requires a media provider configured in <span className="w2f-mono">config/media.lua</span> and server convars.
        </div>
      </div>
    </>
  );
}
