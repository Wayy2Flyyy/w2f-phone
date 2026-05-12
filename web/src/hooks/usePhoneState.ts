import { useCallback, useMemo, useReducer } from 'react';
import type {
  CallRecord,
  PhoneBootstrap,
  PhoneMessage,
  PhoneNotification,
  PhoneSettings,
  SharePayload,
} from '../types/phone';

export interface PhoneState {
  visible: boolean;
  bootstrap: PhoneBootstrap | null;
  activeApp: string | null;          // current open app route
  notifications: PhoneNotification[];
  unread: { messages: number; phone: number };
  lastShare: SharePayload | null;
  incomingCall: CallRecord | null;
  activeCall: CallRecord | null;
  notificationCenterOpen: boolean;
  isLocked: boolean;
  settings: PhoneSettings;
}

type Action =
  | { type: 'OPEN'; bootstrap: PhoneBootstrap }
  | { type: 'CLOSE' }
  | { type: 'NAVIGATE'; app: string | null }
  | { type: 'BACK_HOME' }
  | { type: 'PUSH_NOTIF'; n: PhoneNotification }
  | { type: 'CLEAR_NOTIFS' }
  | { type: 'INC_UNREAD'; app: 'messages' | 'phone' }
  | { type: 'RESET_UNREAD'; app: 'messages' | 'phone' }
  | { type: 'SHARE_IN'; payload: SharePayload }
  | { type: 'CALL_IN'; call: CallRecord }
  | { type: 'CALL_OUT'; call: CallRecord }
  | { type: 'CALL_ACTIVE'; call: CallRecord }
  | { type: 'CALL_END' }
  | { type: 'TOGGLE_NC' }
  | { type: 'UNLOCK' }
  | { type: 'LOCK' }
  | { type: 'SETTINGS'; settings: PhoneSettings };

const initial: PhoneState = {
  visible: false,
  bootstrap: null,
  activeApp: null,
  notifications: [],
  unread: { messages: 0, phone: 0 },
  lastShare: null,
  incomingCall: null,
  activeCall: null,
  notificationCenterOpen: false,
  isLocked: true,
  settings: {},
};

function reducer(state: PhoneState, action: Action): PhoneState {
  switch (action.type) {
    case 'OPEN':
      return {
        ...state,
        visible: true,
        bootstrap: action.bootstrap,
        activeApp: null,
        settings: action.bootstrap.settings || {},
        isLocked: action.bootstrap.device.locked || action.bootstrap.device.isStolen,
        notificationCenterOpen: false,
      };
    case 'CLOSE':
      return { ...initial };
    case 'NAVIGATE':
      return { ...state, activeApp: action.app, notificationCenterOpen: false };
    case 'BACK_HOME':
      return { ...state, activeApp: null };
    case 'PUSH_NOTIF':
      return { ...state, notifications: [action.n, ...state.notifications].slice(0, 50) };
    case 'CLEAR_NOTIFS':
      return { ...state, notifications: [] };
    case 'INC_UNREAD':
      return { ...state, unread: { ...state.unread, [action.app]: state.unread[action.app] + 1 } };
    case 'RESET_UNREAD':
      return { ...state, unread: { ...state.unread, [action.app]: 0 } };
    case 'SHARE_IN':
      return { ...state, lastShare: action.payload };
    case 'CALL_IN':
      return { ...state, incomingCall: action.call };
    case 'CALL_OUT':
      return { ...state, activeCall: action.call, incomingCall: null };
    case 'CALL_ACTIVE':
      return { ...state, activeCall: action.call, incomingCall: null };
    case 'CALL_END':
      return { ...state, activeCall: null, incomingCall: null };
    case 'TOGGLE_NC':
      return { ...state, notificationCenterOpen: !state.notificationCenterOpen };
    case 'UNLOCK':
      return { ...state, isLocked: false };
    case 'LOCK':
      return { ...state, isLocked: true };
    case 'SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    default:
      return state;
  }
}

export function usePhoneState() {
  const [state, dispatch] = useReducer(reducer, initial);

  const api = useMemo(() => ({
    open: (b: PhoneBootstrap) => dispatch({ type: 'OPEN', bootstrap: b }),
    close: () => dispatch({ type: 'CLOSE' }),
    navigate: (app: string | null) => dispatch({ type: 'NAVIGATE', app }),
    backHome: () => dispatch({ type: 'BACK_HOME' }),
    pushNotif: (n: PhoneNotification) => dispatch({ type: 'PUSH_NOTIF', n }),
    clearNotifs: () => dispatch({ type: 'CLEAR_NOTIFS' }),
    incUnread: (a: 'messages' | 'phone') => dispatch({ type: 'INC_UNREAD', app: a }),
    resetUnread: (a: 'messages' | 'phone') => dispatch({ type: 'RESET_UNREAD', app: a }),
    shareIn: (p: SharePayload) => dispatch({ type: 'SHARE_IN', payload: p }),
    callIn: (c: CallRecord) => dispatch({ type: 'CALL_IN', call: c }),
    callOut: (c: CallRecord) => dispatch({ type: 'CALL_OUT', call: c }),
    callActive: (c: CallRecord) => dispatch({ type: 'CALL_ACTIVE', call: c }),
    callEnd: () => dispatch({ type: 'CALL_END' }),
    toggleNC: () => dispatch({ type: 'TOGGLE_NC' }),
    unlock: () => dispatch({ type: 'UNLOCK' }),
    lock: () => dispatch({ type: 'LOCK' }),
    setSettings: (s: PhoneSettings) => dispatch({ type: 'SETTINGS', settings: s }),
  }), []);

  const goBack = useCallback(() => {
    if (state.notificationCenterOpen) {
      dispatch({ type: 'TOGGLE_NC' });
    } else if (state.activeApp) {
      dispatch({ type: 'BACK_HOME' });
    }
  }, [state.activeApp, state.notificationCenterOpen]);

  return { state, ...api, goBack };
}
