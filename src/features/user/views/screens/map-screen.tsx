import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';
import { type Machine, LaundryRoomMap, Indicator } from '@/features/user';

export function MapScreen({ laundryRoomLayouts, className }: MapScreen.Props) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-row-reverse">
        <Indicator />
      </div>

      {laundryRoomLayouts.map((layout) => (
        <div className="w-full">
          <p className="mb-1.5">
            {t(layout.label)} {t('location.laundryRoom')}
          </p>
          <LaundryRoomMap machines={layout.machines} doorX={layout.doorX} />
        </div>
      ))}
    </div>
  );
}

export namespace MapScreen {
  interface LaundryRoomMachines {
    label: 'location.a' | 'location.b';
    machines: Machine[];
    doorX?: number;
  }

  export type Props = {
    laundryRoomLayouts: LaundryRoomMachines[];
    className?: string;
  };
}
