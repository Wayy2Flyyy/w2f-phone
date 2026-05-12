import { useCallback, useEffect, useState } from 'react';
import { Header } from '../common/Header';
import { EmptyState } from '../common/EmptyState';
import { Icon } from '../../utils/icons';
import { fetchNui, isOk } from '../../utils/nui';
import type { CallRecord, Result } from '../../types/phone';
import { mockCalls } from '../../data/mockData';
import { formatPhoneNumber, formatRelativeTime } from '../../utils/format';

interface Props {
  onBack: () => void;
  prefillNumber?: string | null;
  onStartCall: (number: string) => void;
}

const PAD = ['1','2','3','4','5','6','7','8','9','*','0','#'];

export function PhoneApp({ onBack, prefillNumber, onStartCall }: Props) {
  const [tab, setTab] = useState<'pad' | 'history'>(prefillNumber ? 'pad' : 'history');
  const [number, setNumber] = useState(prefillNumber ?? '');
  const [history, setHistory] = useState<CallRecord[]>([]);

  const load = useCallback(async () => {
    const res = await fetchNui<Result<CallRecord[]>>('getCallHistory', { limit: 50 }, { ok: true, data: mockCalls });
    if (isOk(res)) setHistory(res.data ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <>
      <Header
        title="Phone"
        onBack={onBack}
        right={
          <div className="w2f-row">
            <button className={`w2f-iconbtn ${tab === 'pad' ? '' : ''}`} onClick={() => setTab('pad')} aria-label="Keypad"><Icon name="keypad" size={16} /></button>
            <button className={`w2f-iconbtn`} onClick={() => setTab('history')} aria-label="History"><Icon name="phone" size={16} /></button>
          </div>
        }
      />

      {tab === 'pad' ? (
        <div className="w2f-scroll">
          <div style={{ padding: 24, textAlign: 'center', fontSize: 28, letterSpacing: '0.04em' }} className="w2f-mono">
            {number || <span className="w2f-muted">555-XXXXXXX</span>}
          </div>
          <div className="w2f-keypad">
            {PAD.map((k) => (
              <button key={k} onClick={() => setNumber((n) => (n + k).slice(0, 16))}>{k}</button>
            ))}
          </div>
          <div className="w2f-call-bar">
            <button className="w2f-iconbtn" onClick={() => setNumber((n) => n.slice(0, -1))} aria-label="Backspace"><Icon name="close" size={16} /></button>
            <button className="start" onClick={() => number && onStartCall(number)} aria-label="Call"><Icon name="phone" size={26} /></button>
            <button className="w2f-iconbtn" onClick={() => setNumber('')} aria-label="Clear"><Icon name="trash" size={16} /></button>
          </div>
        </div>
      ) : (
        <div className="w2f-scroll">
          {history.length === 0 ? (
            <EmptyState icon="phone" title="No calls yet" description="Your call history will show here." />
          ) : (
            <div className="w2f-list">
              {history.map((c) => (
                <div key={c.id} className="w2f-list-row">
                  <div className="avatar"><Icon name="phone" size={16} /></div>
                  <div className="text">
                    <div className="title">{formatPhoneNumber(c.direction === 'out' ? c.receiverNumber : c.callerNumber)}</div>
                    <div className="subtitle">
                      {c.direction === 'out' ? 'Outgoing' : 'Incoming'} · {c.state}{c.duration ? ` · ${c.duration}s` : ''}
                    </div>
                  </div>
                  <div className="meta">{formatRelativeTime(c.createdAt)}</div>
                  <button className="w2f-iconbtn" onClick={() => onStartCall(c.direction === 'out' ? c.receiverNumber : c.callerNumber)}>
                    <Icon name="phone" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
