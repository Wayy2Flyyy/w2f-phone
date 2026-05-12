import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from '../common/Header';
import { SearchBar } from '../common/SearchBar';
import { EmptyState } from '../common/EmptyState';
import { Icon } from '../../utils/icons';
import { fetchNui, isOk } from '../../utils/nui';
import type { ConversationSummary, PhoneMessage, Result } from '../../types/phone';
import { mockConversations, mockMessages } from '../../data/mockData';
import { formatPhoneNumber, formatRelativeTime } from '../../utils/format';
import { useNuiEvent } from '../../hooks/useNuiEvent';

interface Props {
  myNumber: string;
  onBack: () => void;
  initialConversation?: string | null;
  onSelectedConversation?: (otherNumber: string | null) => void;
}

export function MessagesApp({ myNumber, onBack, initialConversation, onSelectedConversation }: Props) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [open, setOpen] = useState<string | null>(initialConversation ?? null);
  const [messages, setMessages] = useState<PhoneMessage[]>([]);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadConvs = useCallback(async () => {
    const res = await fetchNui<Result<ConversationSummary[]>>('getConversations', {}, { ok: true, data: mockConversations });
    if (isOk(res)) setConversations(res.data ?? []);
  }, []);

  const loadMsgs = useCallback(async (other: string) => {
    const res = await fetchNui<Result<PhoneMessage[]>>('getMessages', { otherNumber: other, limit: 200 }, { ok: true, data: mockMessages });
    if (isOk(res)) setMessages(res.data ?? []);
    await fetchNui<Result>('markConversationRead', { otherNumber: other });
  }, []);

  useEffect(() => { void loadConvs(); }, [loadConvs]);
  useEffect(() => {
    if (open) {
      void loadMsgs(open);
      onSelectedConversation?.(open);
    } else {
      onSelectedConversation?.(null);
    }
  }, [open, loadMsgs, onSelectedConversation]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useNuiEvent<PhoneMessage>('phone:messageReceived', (m) => {
    if (open && (m.senderNumber === open || m.receiverNumber === open)) {
      setMessages((cur) => [...cur, m]);
    }
    void loadConvs();
  });

  const filtered = conversations.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.displayName.toLowerCase().includes(q) || c.otherNumber.toLowerCase().includes(q);
  });

  const send = async () => {
    setError(null);
    const text = draft.trim();
    if (!text || !open) return;
    setDraft('');
    const res = await fetchNui<Result<PhoneMessage>>('sendMessage', { receiver: open, message: text });
    if (!isOk(res)) {
      setError(res.message ?? res.code);
      return;
    }
    if (res.data) setMessages((cur) => [...cur, res.data!]);
    void loadConvs();
  };

  if (open) {
    return (
      <>
        <Header
          title={open}
          subtitle={formatPhoneNumber(open)}
          onBack={() => setOpen(null)}
          right={<button className="w2f-iconbtn" onClick={() => { setOpen(null); }}><Icon name="close" /></button>}
        />
        <div className="w2f-scroll" ref={scrollRef}>
          <div className="w2f-bubble-thread">
            {messages.map((m) => (
              <div key={m.id} className={`w2f-bubble ${m.senderNumber === myNumber ? 'out' : 'in'}`}>
                {m.message}
                <div className="w2f-bubble-meta" style={{ textAlign: m.senderNumber === myNumber ? 'right' : 'left', marginTop: 2 }}>
                  {formatRelativeTime(m.createdAt)}
                </div>
              </div>
            ))}
            {error && <div className="w2f-bubble in" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--w2f-danger)' }}>Error: {error}</div>}
          </div>
        </div>
        <div className="w2f-compose">
          <input
            value={draft}
            placeholder="Message"
            maxLength={500}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void send(); }}
          />
          <button onClick={() => void send()} aria-label="Send"><Icon name="chevronRight" size={16} /></button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Messages" onBack={onBack} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search conversations" />
      <div className="w2f-scroll">
        {filtered.length === 0 ? (
          <EmptyState icon="messages" title="No conversations" description="Send a message from Contacts to start a chat." />
        ) : (
          <div className="w2f-list">
            {filtered.map((c) => (
              <button key={c.otherNumber} className="w2f-list-row" onClick={() => setOpen(c.otherNumber)}>
                <div className="avatar">{c.displayName.charAt(0).toUpperCase()}</div>
                <div className="text">
                  <div className="title">{c.displayName}</div>
                  <div className="subtitle">{c.lastFromMe ? 'You: ' : ''}{c.lastMessage}</div>
                </div>
                <div className="meta" style={{ textAlign: 'right' }}>
                  <div>{formatRelativeTime(c.lastAt)}</div>
                  {c.unread > 0 && <div className="unread" style={{ marginTop: 4 }}>{c.unread}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
