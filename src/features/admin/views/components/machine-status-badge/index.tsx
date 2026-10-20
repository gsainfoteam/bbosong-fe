import { useTranslation } from 'react-i18next';

import { type AdminMachine } from '../../../viewmodels';

export function MachineStatusBadge({ isAvailable, status }: MachineStatusBadge.Props) {
  const { t } = useTranslation('admin');
  // Keep translations for API enum values during i18next extraction.
  // t('IDLE'); t('WASH'); t('RINSE'); t('SPIN'); t('DRY');
  const label = isAvailable ? t(status) : t('unavailable');
  const tone = !isAvailable
    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
    : status === 'IDLE'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}

export namespace MachineStatusBadge {
  export type Props = Pick<AdminMachine, 'isAvailable' | 'status'>;
}
