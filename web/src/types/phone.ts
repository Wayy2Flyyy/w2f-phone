export type Result<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; code: string; message?: string };

export interface PhoneDevice {
  phoneId: string;
  phoneNumber: string;
  deviceName: string;
  ownerCitizenId: string | null;
  isStolen: boolean;
  locked: boolean;
}

export interface PhoneIdentity {
  citizenid: string | null;
  name: string;
  job?: {
    name: string;
    label?: string;
    grade?: { name?: string; level?: number } | number;
    onduty?: boolean;
    isboss?: boolean;
    type?: string;
  } | null;
}

export interface PhoneMoney {
  cash: number;
  bank: number;
  crypto: number;
}

export interface PhoneAppDescriptor {
  id: string;
  label: string;
  icon: string;
  color: string;
  order: number;
  route: string;
  supportsBadge?: boolean;
  custom?: boolean;
  foundation?: boolean;
}

export interface PhoneTheme {
  id: string;
  label: string;
  bg: string;
  surface: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  danger: string;
  success: string;
  gold: string;
}

export interface PhoneWallpaper {
  id: string;
  label: string;
  kind: 'gradient' | 'image';
  from?: string;
  to?: string;
  url?: string;
}

export interface PhoneSettings {
  theme?: string;
  wallpaper?: string;
  deviceName?: string;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  hiddenApps?: string[];
  visibleApps?: string[];
  dockApps?: string[];
  lockEnabled?: boolean;
}

export interface PhoneBootstrap {
  device: PhoneDevice;
  identity: PhoneIdentity;
  money: PhoneMoney;
  apps: PhoneAppDescriptor[];
  dock: string[];
  settings: PhoneSettings;
  installedApps: string[];
  themes: PhoneTheme[];
  wallpapers: PhoneWallpaper[];
  config: {
    theme: string;
    wallpaper: string;
    sounds: boolean;
    animations: boolean;
    notifications: boolean;
    policeEnabled: boolean;
    mediaEnabled: boolean;
    mediaProvider: string;
  };
  serverTime: number;
}

export interface Contact {
  id: number;
  name: string;
  number: string;
  avatar?: string | null;
  favourite: boolean;
  blocked: boolean;
  notes?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ConversationSummary {
  otherNumber: string;
  displayName: string;
  lastMessage: string;
  lastFromMe: boolean;
  lastAt: number;
  unread: number;
}

export interface PhoneMessage {
  id: number;
  conversationId: string;
  senderPhoneId: string | null;
  senderNumber: string;
  receiverNumber: string;
  message: string;
  attachments: unknown[];
  read: boolean;
  createdAt: number;
}

export interface CallRecord {
  id: number;
  callerNumber: string;
  receiverNumber: string;
  state: 'incoming' | 'outgoing' | 'active' | 'missed' | 'declined' | 'ended';
  type: 'voice' | 'video';
  speaker: boolean;
  video: boolean;
  duration?: number;
  direction?: 'in' | 'out';
  createdAt: number;
}

export interface BankSnapshot {
  accountName: string;
  citizenid: string | null;
  cash: number;
  bank: number;
  crypto: number;
  total: number;
  recentTransactions: Array<{ id: string; label: string; amount: number; at: number }>;
}

export interface VehicleRow {
  plate: string;
  model: string;
  garage: string | null;
  state: number;
  fuel: number | null;
  engine: number | null;
}

export interface PhoneNotification {
  id?: number;
  app: string;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
  read?: boolean;
  createdAt?: number;
}

export interface Note {
  id: number;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MediaItem {
  id: number;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

export type ShareKind = 'contact' | 'number' | 'location' | 'vehicle' | 'invoice' | 'media';

export interface SharePayload {
  kind: ShareKind;
  payload: Record<string, unknown>;
  from?: string;
  preview?: string;
  createdAt?: number;
}

export type NuiAction =
  | { action: 'phone:open'; data: PhoneBootstrap }
  | { action: 'phone:close' }
  | { action: 'phone:notification'; data: PhoneNotification }
  | { action: 'phone:messageReceived'; data: PhoneMessage }
  | { action: 'phone:callIncoming'; data: CallRecord }
  | { action: 'phone:callOutgoing'; data: CallRecord }
  | { action: 'phone:callAccepted'; data: CallRecord }
  | { action: 'phone:callDeclined'; data: CallRecord }
  | { action: 'phone:callEnded'; data: CallRecord }
  | { action: 'phone:shareReceived'; data: SharePayload }
  | { action: 'phone:updateSettings'; data: PhoneSettings }
  | { action: 'phone:updateAppData'; app: string; data: unknown };
