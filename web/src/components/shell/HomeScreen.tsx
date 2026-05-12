import type { PhoneAppDescriptor } from '../../types/phone';
import { AppIcon } from './AppIcon';
import { Dock } from './Dock';

interface Props {
  apps: PhoneAppDescriptor[];
  dockIds: string[];
  badges?: Record<string, number>;
  onOpenApp: (route: string) => void;
}

export function HomeScreen({ apps, dockIds, badges, onOpenApp }: Props) {
  const dockSet = new Set(dockIds);
  const gridApps = apps.filter((a) => !dockSet.has(a.id));

  return (
    <div className="w2f-home">
      <div className="w2f-app-grid">
        {gridApps.map((app) => (
          <AppIcon
            key={app.id}
            app={app}
            badge={badges?.[app.id]}
            onClick={() => onOpenApp(app.route)}
          />
        ))}
      </div>
      <Dock apps={apps} dockIds={dockIds} onOpenApp={onOpenApp} badges={badges} />
    </div>
  );
}
