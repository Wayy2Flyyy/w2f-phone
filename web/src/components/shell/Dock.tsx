import type { PhoneAppDescriptor } from '../../types/phone';
import { AppIcon } from './AppIcon';

interface Props {
  apps: PhoneAppDescriptor[];
  dockIds: string[];
  onOpenApp: (route: string) => void;
  badges?: Record<string, number>;
}

export function Dock({ apps, dockIds, onOpenApp, badges }: Props) {
  const dockApps = dockIds
    .map((id) => apps.find((a) => a.id === id))
    .filter((a): a is PhoneAppDescriptor => Boolean(a))
    .slice(0, 4);

  return (
    <div className="w2f-dock">
      {dockApps.map((app) => (
        <AppIcon
          key={app.id}
          app={app}
          badge={badges?.[app.id]}
          onClick={() => onOpenApp(app.route)}
        />
      ))}
    </div>
  );
}
