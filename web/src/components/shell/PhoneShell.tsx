import type { CSSProperties, ReactNode } from 'react';
import type { PhoneWallpaper } from '../../types/phone';

interface Props {
  children: ReactNode;
  wallpaper?: PhoneWallpaper;
  browserPreview?: boolean;
}

function wallpaperStyle(w?: PhoneWallpaper): CSSProperties {
  if (!w) return { background: 'linear-gradient(180deg, #020514 0%, #0b1f4a 100%)' };
  if (w.kind === 'gradient') {
    return {
      background: `linear-gradient(180deg, ${w.from ?? '#020514'} 0%, ${w.to ?? '#0b1f4a'} 100%)`,
    };
  }
  if (w.url) {
    return { backgroundImage: `url("${w.url}")`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  return { background: 'linear-gradient(180deg, #020514 0%, #0b1f4a 100%)' };
}

export function PhoneShell({ children, wallpaper, browserPreview }: Props) {
  return (
    <div className={`w2f-phone-root ${browserPreview ? 'is-browser-preview' : ''}`}>
      <div className="w2f-shell">
        <div className="w2f-side-btn top" />
        <div className="w2f-side-btn middle" />
        <div className="w2f-side-btn power" />
        <div className="w2f-screen">
          <div className="w2f-screen-wallpaper" style={wallpaperStyle(wallpaper)} />
          <div className="w2f-notch" />
          <div className="w2f-screen-content">{children}</div>
          <div className="w2f-home-indicator" />
        </div>
      </div>
    </div>
  );
}
