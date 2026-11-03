import { type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import {
  type AdminMachine,
  formatMachineCode,
  formatMachineLastSeen,
  formatThinqRemainingParts,
  getMachineOperatingMinutes,
  getMachineThinqRemainingMinutes,
  useMachineTiming,
} from '../../../viewmodels';
import { MachineStatusBadge, ThinqRemaining } from '@/features/admin';

export function MachineTable({
  machines,
  renderActions,
  showLinks = false,
  showTiming = false,
  showThinq = false,
}: MachineTable.Props) {
  const { t, i18n } = useTranslation('admin');
  const now = useMachineTiming((showTiming || showThinq) && machines.length > 0);
  const rows = machines.map((machine) => ({
    machine,
    lastSeen: showTiming
      ? formatMachineLastSeen(machine.lastSeenAt, now, i18n.resolvedLanguage ?? 'ko')
      : null,
    thinqUpdated: showThinq
      ? formatMachineLastSeen(machine.thinqUpdatedAt, now, i18n.resolvedLanguage ?? 'ko')
      : null,
    operatingMinutes: getMachineOperatingMinutes(machine, now),
    thinqRemaining: formatThinqRemainingParts(getMachineThinqRemainingMinutes(machine)),
  }));
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
              ...(showTiming ? [t('lastSeenAt'), t('operatingTime')] : []),
              ...(showThinq ? [t('thinqStatus')] : []),
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
          {rows.map(({ machine, lastSeen, thinqUpdated, operatingMinutes, thinqRemaining }) => (
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
              {showTiming && (
                <>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {lastSeen ? (
                      <time dateTime={lastSeen.dateTime} title={lastSeen.absolute}>
                        {lastSeen.relative}
                        <span className="text-text-secondary mt-1 block text-xs dark:text-slate-400">
                          {lastSeen.absolute}
                        </span>
                      </time>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {operatingMinutes === null
                      ? '-'
                      : t('operatingDuration', {
                          hours: String(Math.floor(operatingMinutes / 60)),
                          minutes: String(operatingMinutes % 60),
                        })}
                  </td>
                </>
              )}
              {showThinq && (
                <td className="px-5 py-4 whitespace-nowrap">
                  {machine.thinqDeviceId ? (
                    <div className="space-y-1">
                      <div>{machine.thinqCurrentState ?? t('thinqStateUnknown')}</div>
                      <div className="text-text-secondary text-xs dark:text-slate-400">
                        <ThinqRemaining remaining={thinqRemaining} />
                      </div>
                      {thinqUpdated ? (
                        <time
                          className="text-text-secondary block text-xs dark:text-slate-400"
                          dateTime={thinqUpdated.dateTime}
                          title={thinqUpdated.absolute}
                        >
                          {t('thinqUpdatedAt')}: {thinqUpdated.relative}
                        </time>
                      ) : (
                        <div className="text-text-secondary text-xs dark:text-slate-400">
                          {t('thinqUpdatedAt')}: -
                        </div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
              )}
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
                colSpan={
                  3 +
                  2 * Number(showTiming) +
                  Number(showThinq) +
                  Number(showLinks) +
                  Number(!!renderActions)
                }
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
    showTiming?: boolean;
    showThinq?: boolean;
  };
}
