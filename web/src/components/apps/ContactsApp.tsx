import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from '../common/Header';
import { SearchBar } from '../common/SearchBar';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { FormField } from '../common/FormField';
import { Icon } from '../../utils/icons';
import { fetchNui, isOk } from '../../utils/nui';
import type { Contact, Result } from '../../types/phone';
import { mockContacts } from '../../data/mockData';
import { formatPhoneNumber } from '../../utils/format';

interface Props {
  onBack: () => void;
  onCall: (number: string) => void;
  onMessage: (number: string) => void;
}

export function ContactsApp({ onBack, onCall, onMessage }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Contact | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<{ name: string; number: string }>({ name: '', number: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (q?: string) => {
    setBusy(true);
    const res = await fetchNui<Result<Contact[]>>('getContacts', { search: q ?? '' }, { ok: true, data: mockContacts });
    setBusy(false);
    if (isOk(res)) setContacts(res.data ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      c.name.toLowerCase().includes(q) || c.number.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const openCreate = () => {
    setDraft({ name: '', number: '' });
    setCreating(true);
  };
  const openEdit = (c: Contact) => {
    setDraft({ name: c.name, number: c.number });
    setEditing(c);
  };

  const save = async () => {
    const body = { name: draft.name.trim(), number: draft.number.trim() };
    if (!body.name || !body.number) return;
    if (editing) {
      const res = await fetchNui<Result>('updateContact', { id: editing.id, ...body });
      if (isOk(res)) { setEditing(null); void load(); }
    } else {
      const res = await fetchNui<Result>('addContact', body);
      if (isOk(res)) { setCreating(false); void load(); }
    }
  };

  const remove = async (c: Contact) => {
    const res = await fetchNui<Result>('deleteContact', { id: c.id });
    if (isOk(res)) { setEditing(null); void load(); }
  };

  const toggleFav = async (c: Contact) => {
    await fetchNui<Result>('toggleFavouriteContact', { id: c.id });
    void load();
  };

  return (
    <>
      <Header
        title="Contacts"
        onBack={onBack}
        right={<button className="w2f-iconbtn" onClick={openCreate} aria-label="Add contact"><Icon name="plus" /></button>}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Search name or number" />

      <div className="w2f-scroll">
        {filtered.length === 0 ? (
          <EmptyState
            icon="contacts"
            title={busy ? 'Loading...' : 'No contacts'}
            description="Tap + to add your first contact."
          />
        ) : (
          <div className="w2f-list">
            {filtered.map((c) => (
              <div key={c.id} className="w2f-list-row">
                <div className="avatar" style={{ background: c.favourite ? 'var(--w2f-accent)' : undefined }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <button className="text" style={{ background: 'transparent', border: 0, padding: 0 }} onClick={() => openEdit(c)}>
                  <div className="title">{c.name}{c.favourite && <Icon name="star" size={12} style={{ marginLeft: 6, color: 'var(--w2f-gold)' }} />}</div>
                  <div className="subtitle">{formatPhoneNumber(c.number)}{c.blocked && <span className="w2f-pill danger" style={{ marginLeft: 8 }}>Blocked</span>}</div>
                </button>
                <button className="w2f-iconbtn" onClick={() => onMessage(c.number)} aria-label="Message"><Icon name="messages" size={16} /></button>
                <button className="w2f-iconbtn" onClick={() => onCall(c.number)} aria-label="Call"><Icon name="phone" size={16} /></button>
                <button className="w2f-iconbtn" onClick={() => toggleFav(c)} aria-label="Favourite"><Icon name="star" size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        title={editing ? 'Edit contact' : 'New contact'}
        open={creating || !!editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        onConfirm={save}
        confirmLabel="Save"
      >
        <FormField label="Name">
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={64} />
        </FormField>
        <FormField label="Phone number">
          <Input value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value })} maxLength={16} placeholder="555-1234567" />
        </FormField>
        {editing && (
          <div className="w2f-row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
            <Button variant="danger" onClick={() => remove(editing)} leadingIcon={<Icon name="trash" size={14} />}>Delete</Button>
            <Button variant="ghost" onClick={async () => { await fetchNui<Result>('blockContact', { id: editing.id, blocked: !editing.blocked }); setEditing(null); void load(); }}>
              <Icon name="block" size={14} /> {editing.blocked ? 'Unblock' : 'Block'}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
