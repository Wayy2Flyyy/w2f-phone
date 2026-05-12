import { useCallback, useEffect, useMemo, useState } from 'react';
import { PhoneShell } from './components/shell/PhoneShell';
import { StatusBar } from './components/shell/StatusBar';
import { LockScreen } from './components/shell/LockScreen';
import { HomeScreen } from './components/shell/HomeScreen';
import { AppWindow } from './components/shell/AppWindow';
import { NotificationBanner } from './components/shell/NotificationBanner';
import { NotificationCenter } from './components/shell/NotificationCenter';
import { ContactsApp } from './components/apps/ContactsApp';
import { MessagesApp } from './components/apps/MessagesApp';
import { PhoneApp } from './components/apps/PhoneApp';
import { BankApp } from './components/apps/BankApp';
import { VehiclesApp } from './components/apps/VehiclesApp';
import { PoliceApp } from './components/apps/PoliceApp';
import { NotesApp } from './components/apps/NotesApp';
import { GalleryApp } from './components/apps/GalleryApp';
import { CameraApp } from './components/apps/CameraApp';
import { ShareApp } from './components/apps/ShareApp';
import { AppStoreApp } from './components/apps/AppStoreApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { fetchNui, isBrowser, isOk } from './utils/nui';
import { useNuiEvent } from './hooks/useNuiEvent';
import { usePhoneState } from './hooks/usePhoneState';
import { useNotifications } from './hooks/useNotifications';
import { useKeyboard } from './hooks/useKeyboard';
import { Button } from './components/common/Button';
import { Icon } from './utils/icons';
import type {
  CallRecord,
  ConversationSummary,
  PhoneBootstrap,
  PhoneMessage,
  PhoneNotification,
  Result,
  SharePayload,
} from './types/phone';
import { mockBootstrap, mockNotifications } from './data/mockData';
import { formatPhoneNumber, formatDuration } from './utils/format';

export function App() {
  const { state, ...api } = usePhoneState();
  const { banners, push, dismiss } = useNotifications();
  const [prefillNumber, setPrefillNumber] = useState<string | null>(null);
  const [messagesInitial, setMessagesInitial] = useState<string | null>(null);

  // Apply theme tokens from bootstrap to CSS variables.
  useEffect(() => {
    if (!state.bootstrap) return;
    const themeId = state.settings.theme ?? state.bootstrap.config.theme;
    const theme = state.bootstrap.themes.find((t) => t.id === themeId) ?? state.bootstrap.themes[0];
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--w2f-bg', theme.bg);
    root.style.setProperty('--w2f-surface', theme.surface);
    root.style.setProperty('--w2f-accent', theme.accent);
    root.style.setProperty('--w2f-accent-soft', theme.accentSoft);
    root.style.setProperty('--w2f-text', theme.text);
    root.style.setProperty('--w2f-muted', theme.muted);
    root.style.setProperty('--w2f-danger', theme.danger);
    root.style.setProperty('--w2f-success', theme.success);
    root.style.setProperty('--w2f-gold', theme.gold);
  }, [state.bootstrap, state.settings.theme]);

  // Browser preview: auto-open with mock bootstrap.
  useEffect(() => {
    if (isBrowser() && !state.visible) {
      api.open(mockBootstrap);
      mockNotifications.forEach((n) => api.pushNotif(n));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- NUI inbound events -----

  useNuiEvent<PhoneBootstrap>('phone:open', (data) => {
    if (data) api.open(data);
  });

  useNuiEvent<undefined>('phone:close', () => {
    api.close();
  });

  useNuiEvent<PhoneNotification>('phone:notification', (n) => {
    if (!n) return;
    api.pushNotif(n);
    push(n);
    if (n.app === 'messages') api.incUnread('messages');
    if (n.app === 'phone') api.incUnread('phone');
  });

  useNuiEvent<PhoneMessage>('phone:messageReceived', (m) => {
    if (!m) return;
    api.incUnread('messages');
  });

  useNuiEvent<CallRecord>('phone:callIncoming', (c) => { if (c) api.callIn(c); });
  useNuiEvent<CallRecord>('phone:callOutgoing', (c) => { if (c) api.callOut(c); });
  useNuiEvent<CallRecord>('phone:callAccepted', (c) => { if (c) api.callActive(c); });
  useNuiEvent<CallRecord>('phone:callDeclined', () => { api.callEnd(); });
  useNuiEvent<CallRecord>('phone:callEnded',    () => { api.callEnd(); });

  useNuiEvent<SharePayload>('phone:shareReceived', (p) => {
    if (p) api.shareIn(p);
  });

  // ----- Local close handling -----

  const closeFromUi = useCallback(async () => {
    await fetchNui<Result>('closePhone', {});
    api.close();
  }, [api]);

  useKeyboard('Escape', closeFromUi, state.visible && !isBrowser());

  // ----- Navigation helpers -----

  const navigate = useCallback((route: string | null) => {
    if (route === 'messages') api.resetUnread('messages');
    if (route === 'phone') api.resetUnread('phone');
    setMessagesInitial(null);
    setPrefillNumber(null);
    api.navigate(route);
  }, [api]);

  const goToMessages = useCallback((number: string) => {
    setMessagesInitial(number);
    api.navigate('messages');
  }, [api]);

  const goToPhoneAndCall = useCallback((number: string) => {
    setPrefillNumber(number);
    api.navigate('phone');
    // immediate dial
    void (async () => {
      const res = await fetchNui<Result<CallRecord>>('startCall', { target: number });
      if (isOk(res) && res.data) api.callOut(res.data);
    })();
  }, [api]);

  const acceptCall = useCallback(async () => {
    if (!state.incomingCall) return;
    const res = await fetchNui<Result<CallRecord>>('acceptCall', { callId: state.incomingCall.id });
    if (isOk(res) && res.data) api.callActive(res.data);
  }, [state.incomingCall, api]);
  const declineCall = useCallback(async () => {
    if (!state.incomingCall) return;
    await fetchNui<Result>('declineCall', { callId: state.incomingCall.id });
    api.callEnd();
  }, [state.incomingCall, api]);
  const endCall = useCallback(async () => {
    const call = state.activeCall ?? state.incomingCall;
    if (!call) return;
    await fetchNui<Result>('endCall', { callId: call.id });
    api.callEnd();
  }, [state.activeCall, state.incomingCall, api]);

  // ----- Badges -----

  const badges = useMemo<Record<string, number>>(() => ({
    messages: state.unread.messages,
    phone: state.unread.phone,
  }), [state.unread.messages, state.unread.phone]);

  if (!state.visible || !state.bootstrap) return null;

  const wallpaperId = state.settings.wallpaper ?? state.bootstrap.config.wallpaper;
  const wallpaper = state.bootstrap.wallpapers.find((w) => w.id === wallpaperId) ?? state.bootstrap.wallpapers[0];
  const visibleApps = state.bootstrap.apps.filter((a) => !(state.settings.hiddenApps ?? []).includes(a.id));
  const myNumber = state.bootstrap.device.phoneNumber;

  return (
    <PhoneShell wallpaper={wallpaper} browserPreview={isBrowser()}>
      <StatusBar network={state.bootstrap.device.isStolen ? 'W2F · Stolen' : 'W2F'} />

      <div className="w2f-banner-stack">
        {banners.map((b) => (
          <NotificationBanner key={b._bid} notif={b} onDismiss={() => dismiss(b._bid)} onTap={() => { dismiss(b._bid); navigate(b.app); }} />
        ))}
      </div>

      <div className="w2f-app-area">
        {!state.activeApp && (
          <HomeScreen
            apps={visibleApps}
            dockIds={(state.settings.dockApps && state.settings.dockApps.length > 0) ? state.settings.dockApps : state.bootstrap.dock}
            badges={badges}
            onOpenApp={(r) => navigate(r)}
          />
        )}

        {state.activeApp && (
          <AppWindow>
            {state.activeApp === 'contacts' && (
              <ContactsApp
                onBack={() => navigate(null)}
                onCall={goToPhoneAndCall}
                onMessage={goToMessages}
              />
            )}
            {state.activeApp === 'messages' && (
              <MessagesApp
                myNumber={myNumber}
                onBack={() => navigate(null)}
                initialConversation={messagesInitial}
                onSelectedConversation={() => { /* no-op */ }}
              />
            )}
            {state.activeApp === 'phone' && (
              <PhoneApp
                onBack={() => navigate(null)}
                prefillNumber={prefillNumber}
                onStartCall={goToPhoneAndCall}
              />
            )}
            {state.activeApp === 'bank' && <BankApp onBack={() => navigate(null)} />}
            {state.activeApp === 'vehicles' && (
              <VehiclesApp
                onBack={() => navigate(null)}
                onShare={(v) => {
                  navigate('share');
                  // After ShareApp mounts, user can choose target.
                  void v;
                }}
              />
            )}
            {state.activeApp === 'police' && state.bootstrap.config.policeEnabled && (
              <PoliceApp bootstrap={state.bootstrap} onBack={() => navigate(null)} />
            )}
            {state.activeApp === 'notes' && <NotesApp onBack={() => navigate(null)} />}
            {state.activeApp === 'gallery' && <GalleryApp onBack={() => navigate(null)} />}
            {state.activeApp === 'camera' && <CameraApp onBack={() => navigate(null)} />}
            {state.activeApp === 'share' && (
              <ShareApp onBack={() => navigate(null)} myNumber={myNumber} lastShareReceived={state.lastShare} />
            )}
            {state.activeApp === 'appstore' && <AppStoreApp onBack={() => navigate(null)} />}
            {state.activeApp === 'settings' && (
              <SettingsApp
                bootstrap={state.bootstrap}
                settings={state.settings}
                onSettingsChange={(s) => api.setSettings(s)}
                onBack={() => navigate(null)}
              />
            )}
          </AppWindow>
        )}
      </div>

      {state.notificationCenterOpen && (
        <NotificationCenter
          notifications={state.notifications}
          onClose={() => api.toggleNC()}
          onClearAll={async () => { await fetchNui<Result>('clearNotifications', {}); api.clearNotifs(); }}
          onTap={(n) => { api.toggleNC(); if (n.app) navigate(n.app); }}
        />
      )}

      {state.isLocked && (
        <LockScreen
          bootstrap={state.bootstrap}
          notifications={state.notifications.slice(0, 3)}
          onUnlock={() => api.unlock()}
        />
      )}

      {/* Incoming call overlay */}
      {state.incomingCall && (
        <div className="w2f-call-overlay">
          <div className="state">Incoming · {state.incomingCall.type}</div>
          <div className="who">{formatPhoneNumber(state.incomingCall.callerNumber)}</div>
          <div className="num">tap to answer or decline</div>
          <div className="actions">
            <button className="cta accept" onClick={acceptCall} aria-label="Accept"><Icon name="phone" size={26} /></button>
            <button className="cta decline" onClick={declineCall} aria-label="Decline"><Icon name="close" size={26} /></button>
          </div>
        </div>
      )}

      {/* Active call overlay */}
      {state.activeCall && !state.incomingCall && (
        <div className="w2f-call-overlay">
          <div className="state">{state.activeCall.state}</div>
          <div className="who">{formatPhoneNumber(state.activeCall.callerNumber === myNumber ? state.activeCall.receiverNumber : state.activeCall.callerNumber)}</div>
          <div className="num">{formatDuration(state.activeCall.duration)}</div>
          <div className="actions">
            <button className="cta end" onClick={endCall} aria-label="End"><Icon name="close" size={26} /></button>
          </div>
        </div>
      )}

      {/* Close affordance (covers no-keyboard preview). */}
      {isBrowser() && (
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 9 }}>
          <Button variant="ghost" onClick={() => api.close()}>Close (preview)</Button>
        </div>
      )}
    </PhoneShell>
  );
}
