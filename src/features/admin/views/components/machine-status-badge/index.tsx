import { useTranslation } from 'react-i18next';

import { type AdminMachine } from '../../../viewmodels';

function getTone({ isAvailable, status }: MachineStatusBadge.Props) {
  if (!isAvailable) return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
  if (status === 'IDLE') {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
  }
  return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
}

export function MachineStatusBadge({ isAvailable, status }: MachineStatusBadge.Props) {
  const { t } = useTranslation('admin');
  // Keep translations for API enum values during i18next extraction.
  // t('IDLE'); t('WASH'); t('RINSE'); t('SPIN'); t('DRY');
  const label = isAvailable ? t(status) : t('unavailable');
  const tone = getTone({ isAvailable, status });
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}

export namespace MachineStatusBadge {
  export type Props = Pick<AdminMachine, 'isAvailable' | 'status'>;
}
