import { useCallback, useEffect, useState } from 'react';
import { Header } from '../common/Header';
import { SearchBar } from '../common/SearchBar';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { FormField } from '../common/FormField';
import { Icon } from '../../utils/icons';
import { fetchNui, isOk } from '../../utils/nui';
import type { Note, Result } from '../../types/phone';
import { mockNotes } from '../../data/mockData';
import { formatRelativeTime } from '../../utils/format';

export function NotesApp({ onBack }: { onBack: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<{ id?: number; title: string; body: string; pinned: boolean }>({ title: '', body: '', pinned: false });
  const [open, setOpen] = useState(false);

  const load = useCallback(async (q?: string) => {
    const res = await fetchNui<Result<Note[]>>('getNotes', { search: q ?? '' }, { ok: true, data: mockNotes });
    if (isOk(res)) setNotes(res.data ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const startNew = () => { setDraft({ title: '', body: '', pinned: false }); setOpen(true); };
  const startEdit = (n: Note) => { setDraft({ id: n.id, title: n.title, body: n.body, pinned: n.pinned }); setOpen(true); };

  const save = async () => {
    if (!draft.title.trim()) return;
    const endpoint = draft.id ? 'updateNote' : 'createNote';
    const res = await fetchNui<Result>(endpoint, { ...draft, title: draft.title.trim() });
    if (isOk(res)) { setOpen(false); void load(); }
  };

  const remove = async () => {
    if (!draft.id) return;
    const res = await fetchNui<Result>('deleteNote', { id: draft.id });
    if (isOk(res)) { setOpen(false); void load(); }
  };

  const filtered = notes.filter((n) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return n.title.toLowerCase().includes(q) || (n.body ?? '').toLowerCase().includes(q);
  });

  return (
    <>
      <Header
        title="Notes"
        onBack={onBack}
        right={<button className="w2f-iconbtn" onClick={startNew}><Icon name="plus" /></button>}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Search notes" />
      <div className="w2f-scroll">
        {filtered.length === 0 ? (
          <EmptyState icon="note" title="No notes" description="Tap + to create your first note." />
        ) : (
          <div className="w2f-stack-sm" style={{ padding: '0 14px 8px' }}>
            {filtered.map((n) => (
              <button key={n.id} className="w2f-card" style={{ textAlign: 'left', border: '1px solid var(--w2f-line)', background: 'rgba(255,255,255,0.03)' }} onClick={() => startEdit(n)}>
                <div className="w2f-row space-between">
                  <div style={{ fontWeight: 600 }}>{n.title}</div>
                  {n.pinned && <Icon name="pin" size={14} style={{ color: 'var(--w2f-gold)' }} />}
                </div>
                <div className="w2f-muted" style={{ fontSize: 12, whiteSpace: 'pre-line' }}>
                  {(n.body ?? '').slice(0, 120)}{(n.body ?? '').length > 120 ? '...' : ''}
                </div>
                <div className="w2f-muted" style={{ fontSize: 11 }}>{formatRelativeTime(n.updatedAt || n.createdAt)}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal
        title={draft.id ? 'Edit note' : 'New note'}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={save}
      >
        <FormField label="Title">
          <Input value={draft.title} maxLength={80} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </FormField>
        <FormField label="Body">
          <Textarea value={draft.body} maxLength={4000} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
        </FormField>
        <div className="w2f-row space-between">
          <label className="w2f-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={draft.pinned} onChange={(e) => setDraft({ ...draft, pinned: e.target.checked })} />
            <span>Pinned</span>
          </label>
          {draft.id && (
            <Button variant="danger" onClick={remove} leadingIcon={<Icon name="trash" size={14} />}>Delete</Button>
          )}
        </div>
      </Modal>
    </>
  );
}
