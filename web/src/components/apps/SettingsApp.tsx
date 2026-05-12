import { useState } from 'react';
import { Header } from '../common/Header';
import { Card } from '../common/Card';
import { Toggle } from '../common/Toggle';
import { Input } from '../common/Input';
import { FormField } from '../common/FormField';
import { Button } from '../common/Button';
import { fetchNui, isOk } from '../../utils/nui';
import type { PhoneBootstrap, PhoneSettings, Result } from '../../types/phone';

interface Props {
  bootstrap: PhoneBootstrap;
  settings: PhoneSettings;
  onSettingsChange: (s: PhoneSettings) => void;
  onBack: () => void;
}

export function SettingsApp({ bootstrap, settings, onSettingsChange, onBack }: Props) {
  const [draft, setDraft] = useState<PhoneSettings>({
    theme: settings.theme ?? bootstrap.config.theme,
    wallpaper: settings.wallpaper ?? bootstrap.config.wallpaper,
    deviceName: settings.deviceName ?? bootstrap.device.deviceName,
    notificationsEnabled: settings.notificationsEnabled ?? true,
    soundEnabled: settings.soundEnabled ?? true,
    vibrationEnabled: settings.vibrationEnabled ?? true,
    hiddenApps: settings.hiddenApps ?? [],
    lockEnabled: settings.lockEnabled ?? bootstrap.device.locked,
  });
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  const save = async () => {
    setSaveState('saving');
    const res = await fetchNui<Result<PhoneSettings>>('saveSettings', { settings: draft });
    if (isOk(res)) {
      onSettingsChange(res.data ?? draft);
      setSaveState('ok');
    } else {
      setSaveState('err');
    }
  };

  const toggleAppHidden = (appId: string) => {
    const cur = new Set(draft.hiddenApps ?? []);
    if (cur.has(appId)) cur.delete(appId);
    else cur.add(appId);
    setDraft({ ...draft, hiddenApps: Array.from(cur) });
  };

  // Apps required by the system cannot be hidden.
  const REQUIRED = new Set(['phone', 'messages', 'contacts', 'settings']);

  return (
    <>
      <Header title="Settings" onBack={onBack} />
      <div className="w2f-scroll w2f-pad-x" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Device</div>
          <FormField label="Device name">
            <Input
              value={draft.deviceName ?? ''}
              maxLength={32}
              onChange={(e) => setDraft({ ...draft, deviceName: e.target.value })}
            />
          </FormField>
          <div className="w2f-row space-between">
            <div className="w2f-muted">Phone number</div>
            <div className="w2f-mono">{bootstrap.device.phoneNumber}</div>
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 600 }}>Appearance</div>
          <FormField label="Theme">
            <div className="w2f-row wrap" style={{ gap: 6 }}>
              {bootstrap.themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`w2f-pill ${draft.theme === t.id ? 'warn' : ''}`}
                  style={{ cursor: 'pointer', border: `1px solid ${draft.theme === t.id ? 'var(--w2f-gold)' : 'var(--w2f-line)'}` }}
                  onClick={() => setDraft({ ...draft, theme: t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Wallpaper">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {bootstrap.wallpapers.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, wallpaper: w.id })}
                  style={{
                    border: `2px solid ${draft.wallpaper === w.id ? 'var(--w2f-accent)' : 'var(--w2f-line)'}`,
                    borderRadius: 14,
                    background: `linear-gradient(180deg, ${w.from ?? '#020514'} 0%, ${w.to ?? '#0b1f4a'} 100%)`,
                    height: 70,
                    padding: 0,
                    color: 'white',
                    fontSize: 11,
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                  }}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </FormField>
        </Card>

        <Card>
          <div style={{ fontWeight: 600 }}>Notifications</div>
          <div className="w2f-row space-between" style={{ marginTop: 6 }}>
            <span>Notifications enabled</span>
            <Toggle on={!!draft.notificationsEnabled} onChange={(v) => setDraft({ ...draft, notificationsEnabled: v })} />
          </div>
          <div className="w2f-row space-between" style={{ marginTop: 6 }}>
            <span>Sounds</span>
            <Toggle on={!!draft.soundEnabled} onChange={(v) => setDraft({ ...draft, soundEnabled: v })} />
          </div>
          <div className="w2f-row space-between" style={{ marginTop: 6 }}>
            <span>Vibration</span>
            <Toggle on={!!draft.vibrationEnabled} onChange={(v) => setDraft({ ...draft, vibrationEnabled: v })} />
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 600 }}>Apps visibility</div>
          <div className="w2f-muted" style={{ fontSize: 11, marginBottom: 6 }}>Phone, Messages, Contacts and Settings are always visible.</div>
          <div className="w2f-stack-sm">
            {bootstrap.apps.map((a) => {
              const required = REQUIRED.has(a.id);
              const hidden = (draft.hiddenApps ?? []).includes(a.id);
              return (
                <div key={a.id} className="w2f-row space-between">
                  <div>{a.label}{required && <span className="w2f-muted" style={{ marginLeft: 6, fontSize: 11 }}>(required)</span>}</div>
                  <Toggle on={!hidden} onChange={() => !required && toggleAppHidden(a.id)} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 600 }}>Security</div>
          <div className="w2f-row space-between" style={{ marginTop: 6 }}>
            <span>Lock screen</span>
            <Toggle on={!!draft.lockEnabled} onChange={(v) => setDraft({ ...draft, lockEnabled: v })} />
          </div>
        </Card>

        <div className="w2f-row space-between">
          <div className="w2f-muted" style={{ fontSize: 11 }}>
            {saveState === 'ok' && <span className="w2f-success-text">Saved.</span>}
            {saveState === 'err' && <span className="w2f-danger-text">Save failed.</span>}
          </div>
          <Button variant="primary" onClick={save} disabled={saveState === 'saving'}>
            {saveState === 'saving' ? 'Saving...' : 'Save settings'}
          </Button>
        </div>
        <div style={{ height: 12 }} />
      </div>
    </>
  );
}
