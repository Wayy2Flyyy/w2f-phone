import type {
  BankSnapshot,
  CallRecord,
  Contact,
  ConversationSummary,
  MediaItem,
  Note,
  PhoneBootstrap,
  PhoneMessage,
  PhoneNotification,
  VehicleRow,
} from '../types/phone';

export const mockBootstrap: PhoneBootstrap = {
  device: {
    phoneId: 'phn_demo',
    phoneNumber: '555-1234567',
    deviceName: 'Demo Phone',
    ownerCitizenId: 'DEMO123',
    isStolen: false,
    locked: false,
  },
  identity: {
    citizenid: 'DEMO123',
    name: 'Alex Doe',
    job: { name: 'police', label: 'LSPD', grade: 3, onduty: true, type: 'leo' },
  },
  money: { cash: 480, bank: 12340, crypto: 0 },
  apps: [
    { id: 'phone', label: 'Phone', icon: 'phone', color: '#22c55e', order: 1, route: 'phone' },
    { id: 'messages', label: 'Messages', icon: 'messages', color: '#3b82f6', order: 2, route: 'messages', supportsBadge: true },
    { id: 'contacts', label: 'Contacts', icon: 'contacts', color: '#0ea5e9', order: 3, route: 'contacts' },
    { id: 'bank', label: 'Bank', icon: 'bank', color: '#eab308', order: 4, route: 'bank' },
    { id: 'vehicles', label: 'Vehicles', icon: 'car', color: '#f97316', order: 5, route: 'vehicles' },
    { id: 'gallery', label: 'Gallery', icon: 'image', color: '#a855f7', order: 6, route: 'gallery' },
    { id: 'camera', label: 'Camera', icon: 'camera', color: '#e5e7eb', order: 7, route: 'camera', foundation: true },
    { id: 'notes', label: 'Notes', icon: 'note', color: '#f59e0b', order: 8, route: 'notes' },
    { id: 'share', label: 'W2F Share', icon: 'share', color: '#06b6d4', order: 9, route: 'share' },
    { id: 'appstore', label: 'App Store', icon: 'store', color: '#60a5fa', order: 10, route: 'appstore' },
    { id: 'settings', label: 'Settings', icon: 'cog', color: '#9ca3af', order: 11, route: 'settings' },
    { id: 'police', label: 'Police', icon: 'shield', color: '#1d4ed8', order: 12, route: 'police' },
  ],
  dock: ['phone', 'messages', 'contacts', 'settings'],
  settings: { theme: 'dark', wallpaper: 'w2f_default' },
  installedApps: [],
  themes: [
    { id: 'dark', label: 'W2F Dark', bg: '#06080f', surface: '#0e1322', accent: '#2d7fff', accentSoft: '#5dd2ff', text: '#f4f7ff', muted: '#8693a8', danger: '#ef4444', success: '#22c55e', gold: '#f5c44e' },
  ],
  wallpapers: [
    { id: 'w2f_default', label: 'W2F Signature', kind: 'gradient', from: '#020514', to: '#0b1f4a' },
    { id: 'w2f_aurora', label: 'Aurora', kind: 'gradient', from: '#0b1f4a', to: '#5dd2ff' },
    { id: 'w2f_carbon', label: 'Carbon', kind: 'gradient', from: '#06080f', to: '#1a1d24' },
  ],
  config: {
    theme: 'dark',
    wallpaper: 'w2f_default',
    sounds: true,
    animations: true,
    notifications: true,
    policeEnabled: true,
    mediaEnabled: true,
    mediaProvider: 'fivemanage',
  },
  serverTime: Math.floor(Date.now() / 1000),
};

export const mockContacts: Contact[] = [
  { id: 1, name: 'Sam Reyes', number: '555-2200012', favourite: true, blocked: false, createdAt: 0, updatedAt: 0 },
  { id: 2, name: 'Dispatch', number: '555-9111000', favourite: true, blocked: false, createdAt: 0, updatedAt: 0 },
  { id: 3, name: 'Tina @ Bennys', number: '555-0808088', favourite: false, blocked: false, createdAt: 0, updatedAt: 0 },
];

export const mockConversations: ConversationSummary[] = [
  { otherNumber: '555-2200012', displayName: 'Sam Reyes', lastMessage: 'On my way over.', lastFromMe: false, lastAt: Math.floor(Date.now() / 1000) - 120, unread: 2 },
  { otherNumber: '555-9111000', displayName: 'Dispatch', lastMessage: 'Code 4. All units stand down.', lastFromMe: true, lastAt: Math.floor(Date.now() / 1000) - 1800, unread: 0 },
];

export const mockMessages: PhoneMessage[] = [
  { id: 1, conversationId: 'demo', senderPhoneId: null, senderNumber: '555-2200012', receiverNumber: '555-1234567', message: 'Hey, you around?', attachments: [], read: false, createdAt: Math.floor(Date.now() / 1000) - 200 },
  { id: 2, conversationId: 'demo', senderPhoneId: 'phn_demo', senderNumber: '555-1234567', receiverNumber: '555-2200012', message: 'Yeah, what\'s up?', attachments: [], read: true, createdAt: Math.floor(Date.now() / 1000) - 180 },
  { id: 3, conversationId: 'demo', senderPhoneId: null, senderNumber: '555-2200012', receiverNumber: '555-1234567', message: 'On my way over.', attachments: [], read: false, createdAt: Math.floor(Date.now() / 1000) - 120 },
];

export const mockCalls: CallRecord[] = [
  { id: 1, callerNumber: '555-1234567', receiverNumber: '555-2200012', state: 'ended', type: 'voice', speaker: false, video: false, duration: 60, direction: 'out', createdAt: Math.floor(Date.now() / 1000) - 3600 },
];

export const mockBank: BankSnapshot = {
  accountName: 'Alex Doe',
  citizenid: 'DEMO123',
  cash: 480,
  bank: 12340,
  crypto: 0,
  total: 12820,
  recentTransactions: [],
};

export const mockVehicles: VehicleRow[] = [
  { plate: 'W2F-001', model: 'sultanrs', garage: 'Pillbox', state: 1, fuel: 82, engine: 940 },
  { plate: 'AC-2050', model: 'kuruma', garage: 'Mission Row', state: 0, fuel: 41, engine: 720 },
];

export const mockNotes: Note[] = [
  { id: 1, title: 'Plates to run', body: 'AC-2050\nW2F-777', pinned: true, createdAt: 0, updatedAt: 0 },
];

export const mockMedia: MediaItem[] = [];

export const mockNotifications: PhoneNotification[] = [
  { app: 'messages', title: 'Sam Reyes', message: 'On my way over.', createdAt: Math.floor(Date.now() / 1000) - 120 },
];
