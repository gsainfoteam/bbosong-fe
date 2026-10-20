import { type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { type AdminMachine, formatMachineCode } from '../../../viewmodels';
import { MachineStatusBadge } from '../machine-status-badge';

export function MachineTable({ machines, renderActions, showLinks = false }: MachineTable.Props) {
  const { t } = useTranslation('admin');
  // Keep translations for API enum values during i18next extraction.
  // t('WASHER'); t('DRYER'); t('MALE'); t('FEMALE');
  return (
    <div className="border-border overflow-x-auto rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-left text-sm">
        <thead className="bg-bg text-text-secondary dark:bg-slate-800 dark:text-slate-400">
          <tr>
            {[
              t('machine'),
              t('room'),
              t('status'),
              ...(showLinks ? [t('registrationLink')] : []),
              ...(renderActions ? [t('actions')] : []),
            ].map((label) => (
              <th key={label} className="px-5 py-3 font-medium whitespace-nowrap" scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border divide-y dark:divide-slate-800">
          {machines.map((machine) => (
            <tr key={machine.uuid}>
              <td className="px-5 py-4">
                <div
                  className="font-mono text-sm font-medium tracking-wide whitespace-nowrap"
                  title={`${t('building', { location: machine.location })} · ${t(machine.gender)} · ${t(machine.type)} #${machine.index}`}
                >
                  {formatMachineCode(machine)}
                </div>
                <div className="text-text-secondary mt-1 font-mono text-xs dark:text-slate-400">
                  {machine.uuid}
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                {t('building', { location: machine.location })} · {t(machine.gender)}
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <MachineStatusBadge isAvailable={machine.isAvailable} status={machine.status} />
              </td>
              {showLinks && (
                <td className="px-5 py-4">
                  {machine.shortUrl ? (
                    <a
                      className="text-primary break-all underline underline-offset-4"
                      href={machine.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {machine.shortUrl}
                    </a>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">{t('missingLink')}</span>
                  )}
                </td>
              )}
              {renderActions && (
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">{renderActions(machine)}</div>
                </td>
              )}
            </tr>
          ))}
          {!machines.length && (
            <tr>
              <td
                colSpan={3 + Number(showLinks) + Number(!!renderActions)}
                className="text-text-secondary px-5 py-12 text-center dark:text-slate-400"
              >
                {t('noMachines')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export namespace MachineTable {
  export type Props = {
    machines: AdminMachine[];
    renderActions?: (machine: AdminMachine) => ReactNode;
    showLinks?: boolean;
  };
}
