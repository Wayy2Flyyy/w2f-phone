import { useEffect, useState } from 'react';
import { Header } from '../common/Header';
import { EmptyState } from '../common/EmptyState';
import { fetchNui, isOk } from '../../utils/nui';
import type { MediaItem, Result } from '../../types/phone';
import { mockMedia } from '../../data/mockData';
import { formatRelativeTime } from '../../utils/format';

export function GalleryApp({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetchNui<Result<MediaItem[]>>('getMedia', {}, { ok: true, data: mockMedia });
      setLoaded(true);
      if (isOk(res)) setItems(res.data ?? []);
    })();
  }, []);

  return (
    <>
      <Header title="Gallery" onBack={onBack} />
      <div className="w2f-scroll w2f-pad-x" style={{ paddingTop: 10 }}>
        {!loaded && <EmptyState icon="image" title="Loading..." />}
        {loaded && items.length === 0 && (
          <EmptyState
            icon="image"
            title="No media yet"
            description="Photos and videos taken with the Camera app appear here."
            foundation
          />
        )}
        {items.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {items.map((m) => (
              <div key={m.id} style={{ aspectRatio: '1 / 1', borderRadius: 12, overflow: 'hidden', background: 'var(--w2f-surface-2)', position: 'relative' }}>
                <img src={m.thumbnail ?? m.url} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 4, left: 4, right: 4, fontSize: 9, color: 'rgba(255,255,255,0.85)' }}>
                  {formatRelativeTime(m.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
