import { useEffect, useState } from 'react';
import { Header } from '../common/Header';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { fetchNui, isOk } from '../../utils/nui';
import type { Result, VehicleRow } from '../../types/phone';
import { mockVehicles } from '../../data/mockData';
import { Icon } from '../../utils/icons';

function stateLabel(s: number): { label: string; tone: 'success' | 'warn' | 'danger' } {
  if (s === 1) return { label: 'Garaged', tone: 'success' };
  if (s === 2) return { label: 'Impounded', tone: 'danger' };
  return { label: 'Out', tone: 'warn' };
}

export function VehiclesApp({ onBack, onShare }: { onBack: () => void; onShare?: (v: VehicleRow) => void }) {
  const [list, setList] = useState<VehicleRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetchNui<Result<VehicleRow[]>>('getVehicles', {}, { ok: true, data: mockVehicles });
      setLoaded(true);
      if (isOk(res)) setList(res.data ?? []);
    })();
  }, []);

  return (
    <>
      <Header title="Vehicles" onBack={onBack} />
      <div className="w2f-scroll w2f-pad-x" style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10 }}>
        {!loaded && <EmptyState icon="car" title="Loading..." />}
        {loaded && list.length === 0 && (
          <EmptyState icon="car" title="No vehicles" description="You don't own any vehicles yet." />
        )}
        {list.map((v) => {
          const st = stateLabel(v.state);
          return (
            <Card key={v.plate}>
              <div className="w2f-row space-between">
                <div>
                  <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{v.model}</div>
                  <div className="w2f-muted w2f-mono" style={{ fontSize: 12 }}>{v.plate}</div>
                </div>
                <div className={`w2f-pill ${st.tone}`}>{st.label}</div>
              </div>
              <div className="w2f-row space-between" style={{ fontSize: 12 }}>
                <div className="w2f-muted">{v.garage ?? '—'}</div>
                <div className="w2f-row" style={{ gap: 12 }}>
                  {v.fuel != null && <span>⛽ {Math.round(v.fuel)}%</span>}
                  {v.engine != null && <span>🔧 {Math.round((v.engine / 1000) * 100)}%</span>}
                </div>
              </div>
              <div className="w2f-row" style={{ gap: 6, marginTop: 4 }}>
                <button className="w2f-btn ghost" disabled title="Set waypoint - dealership/impound integration coming soon">
                  <Icon name="location" size={14} /> Locate
                </button>
                {onShare && (
                  <button className="w2f-btn ghost" onClick={() => onShare(v)}>
                    <Icon name="share" size={14} /> Share
                  </button>
                )}
              </div>
            </Card>
          );
        })}
        {loaded && list.length > 0 && (
          <div className="w2f-muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 6 }}>
            Locate / dealership / impound integrations are foundation-only.
          </div>
        )}
      </div>
    </>
  );
}
