import { useEffect, useState } from 'react';
import { Header } from '../common/Header';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { fetchNui, isOk } from '../../utils/nui';
import type { BankSnapshot, Result } from '../../types/phone';
import { mockBank } from '../../data/mockData';
import { formatMoney } from '../../utils/format';

export function BankApp({ onBack }: { onBack: () => void }) {
  const [snap, setSnap] = useState<BankSnapshot | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetchNui<Result<BankSnapshot>>('getBankData', {}, { ok: true, data: mockBank });
      if (isOk(res)) setSnap(res.data ?? null);
    })();
  }, []);

  if (!snap) return <><Header title="Bank" onBack={onBack} /><EmptyState icon="bank" title="Loading..." /></>;

  return (
    <>
      <Header title="Bank" onBack={onBack} subtitle={snap.accountName} />
      <div className="w2f-scroll w2f-pad-x" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card tone="gold">
          <div className="w2f-muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total balance</div>
          <div className="w2f-balance">{formatMoney(snap.total)}</div>
          <div className="w2f-row space-between" style={{ marginTop: 8 }}>
            <div className="w2f-pill">Cash {formatMoney(snap.cash)}</div>
            <div className="w2f-pill">Bank {formatMoney(snap.bank)}</div>
          </div>
        </Card>

        <Card>
          <div className="w2f-row space-between">
            <div className="w2f-muted">Account</div>
            <div>{snap.accountName}</div>
          </div>
          <div className="w2f-divider" />
          <div className="w2f-row space-between">
            <div className="w2f-muted">Citizen ID</div>
            <div className="w2f-mono">{snap.citizenid ?? '-'}</div>
          </div>
          {snap.crypto > 0 && (
            <>
              <div className="w2f-divider" />
              <div className="w2f-row space-between">
                <div className="w2f-muted">Crypto</div>
                <div className="w2f-gold-text">{snap.crypto.toLocaleString()}</div>
              </div>
            </>
          )}
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Recent transactions</div>
          {snap.recentTransactions.length === 0 ? (
            <div className="w2f-muted" style={{ fontSize: 12 }}>
              No recent activity. Transaction history is hooked to your banking provider.
            </div>
          ) : (
            <div className="w2f-stack-sm">
              {snap.recentTransactions.map((t) => (
                <div key={t.id} className="w2f-row space-between">
                  <div>{t.label}</div>
                  <div className={t.amount >= 0 ? 'w2f-success-text' : 'w2f-danger-text'}>
                    {t.amount >= 0 ? '+' : ''}{formatMoney(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="w2f-muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 6 }}>
          Read-only. Use the W2F Banking app for transfers.
        </div>
      </div>
    </>
  );
}
