import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';
import { LaundryRoomMap, Indicator } from '@/features/user';

import { type LaundryRoomLayout } from '../../viewmodels';

export function MapScreen({ laundryRoomLayouts, className }: MapScreen.Props) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-row-reverse">
        <Indicator />
      </div>

      {laundryRoomLayouts.map((layout) => (
        <div key={layout.label} className="w-full">
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
  export type Props = {
    laundryRoomLayouts: LaundryRoomLayout[];
    className?: string;
  };
}
