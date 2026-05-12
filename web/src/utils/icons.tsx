import type { SVGProps } from 'react';

// All icons are pure inline SVG: no remote/CDN fetches, no icon-font dependencies.
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (props: IconProps) => {
  const { size = 22, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...rest,
  };
};

export const IconPhone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const IconMessages = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconContacts = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconBank = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 10l9-7 9 7" />
    <path d="M5 10v9h14v-9" />
    <path d="M9 19v-6h6v6" />
  </svg>
);

export const IconCar = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 17h14l-1.5-5.5A2 2 0 0 0 15.6 10H8.4a2 2 0 0 0-1.9 1.5L5 17z" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="16.5" cy="17.5" r="1.5" />
  </svg>
);

export const IconImage = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

export const IconCamera = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const IconNote = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export const IconShare = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const IconStore = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 9l1-5h16l1 5" />
    <path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
    <path d="M9 21V12h6v9" />
  </svg>
);

export const IconCog = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6z" />
  </svg>
);

export const IconStar = (p: IconProps) => (
  <svg {...base(p)}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconBell = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const IconBattery = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="7" width="18" height="10" rx="2" />
    <line x1="22" y1="11" x2="22" y2="13" />
    <rect x="4" y="9" width="13" height="6" rx="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconWifi = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12.55a11 11 0 0 1 14 0" />
    <path d="M2 8.82a15 15 0 0 1 20 0" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
    <circle cx="12" cy="20" r="1" />
  </svg>
);

export const IconSignal = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="16" width="3" height="5" />
    <rect x="8" y="12" width="3" height="9" />
    <rect x="14" y="8" width="3" height="13" />
    <rect x="20" y="4" width="3" height="17" />
  </svg>
);

export const IconHome = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12L12 3l9 9" />
    <path d="M5 10v10h14V10" />
  </svg>
);

export const IconLocation = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const IconFlag = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="4" y1="22" x2="4" y2="3" />
    <path d="M4 4h11l2 3-2 3H4z" />
  </svg>
);

export const IconSpeaker = (p: IconProps) => (
  <svg {...base(p)}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

export const IconKeypad = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="5" cy="5" r="1.5" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="19" cy="5" r="1.5" />
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
    <circle cx="5" cy="19" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
    <circle cx="19" cy="19" r="1.5" />
  </svg>
);

export const IconPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 17v5" />
    <path d="M5 8h14l-2 6H7z" />
    <path d="M9 8V4h6v4" />
  </svg>
);

export const IconBlock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
  </svg>
);

export const IconShieldCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const IconAlert = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </svg>
);

export type IconKey =
  | 'phone' | 'messages' | 'contacts' | 'bank' | 'car' | 'image' | 'camera'
  | 'note' | 'share' | 'store' | 'cog' | 'shield' | 'star' | 'search' | 'plus'
  | 'trash' | 'arrowLeft' | 'chevronRight' | 'check' | 'close' | 'bell'
  | 'lock' | 'battery' | 'wifi' | 'signal' | 'home' | 'location' | 'flag'
  | 'speaker' | 'keypad' | 'pin' | 'block' | 'shieldCheck' | 'alert';

export const ICONS: Record<IconKey, (p: IconProps) => JSX.Element> = {
  phone: IconPhone,
  messages: IconMessages,
  contacts: IconContacts,
  bank: IconBank,
  car: IconCar,
  image: IconImage,
  camera: IconCamera,
  note: IconNote,
  share: IconShare,
  store: IconStore,
  cog: IconCog,
  shield: IconShield,
  star: IconStar,
  search: IconSearch,
  plus: IconPlus,
  trash: IconTrash,
  arrowLeft: IconArrowLeft,
  chevronRight: IconChevronRight,
  check: IconCheck,
  close: IconClose,
  bell: IconBell,
  lock: IconLock,
  battery: IconBattery,
  wifi: IconWifi,
  signal: IconSignal,
  home: IconHome,
  location: IconLocation,
  flag: IconFlag,
  speaker: IconSpeaker,
  keypad: IconKeypad,
  pin: IconPin,
  block: IconBlock,
  shieldCheck: IconShieldCheck,
  alert: IconAlert,
};

export function Icon({ name, size, ...rest }: { name: IconKey | string; size?: number } & SVGProps<SVGSVGElement>) {
  const Cmp = (ICONS as Record<string, ((p: IconProps) => JSX.Element) | undefined>)[name];
  if (!Cmp) return <IconStar size={size} {...rest} />;
  return <Cmp size={size} {...rest} />;
}
