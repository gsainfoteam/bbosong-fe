import { type SubmitEvent, useState } from 'react';

import { useTranslation } from 'react-i18next';

import {
  formatMachineCode,
  shiftPowerQueryStart,
  toDatetimeLocalValue,
  useAdminMachines,
  useAdminPower,
} from '../../viewmodels';
import { AdminPage, PowerLookbackButtons, PowerRecordResults } from '../components';
import { buttonClass, inputClass, panelClass } from '../styles';

export function AdminPowerScreen() {
  const { t } = useTranslation('admin');
  const machines = useAdminMachines();
  const [startedAtInput, setStartedAtInput] = useState('');
  const [selection, setSelection] = useState<{ uuid: string; startedAt?: string }>({ uuid: '' });
  const power = useAdminPower(selection.uuid, selection.startedAt);
  function search(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = startedAtInput ? Date.parse(startedAtInput) : Number.NaN;
    const next = {
      uuid: String(new FormData(event.currentTarget).get('uuid')),
      startedAt: Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined,
    };
    if (next.uuid === selection.uuid && next.startedAt === selection.startedAt)
      void power.refetch();
    else setSelection(next);
  }
  function lookback(minutes: 60 | 30 | 10) {
    if (!selection.uuid) return;
    const parsed = startedAtInput ? Date.parse(startedAtInput) : Number.NaN;
    const base = Number.isFinite(parsed) ? new Date(parsed).toISOString() : selection.startedAt;
    const startedAt = shiftPowerQueryStart(base, minutes);
    setStartedAtInput(toDatetimeLocalValue(startedAt));
    setSelection((current) => ({ ...current, startedAt }));
  }
  return (
    <AdminPage
      title={t('power')}
      description={t('powerDescription')}
      isLoading={machines.isLoading}
      isError={machines.isError}
      isRefreshing={machines.isFetching}
      onRefresh={() => {
        void machines.refetch();
        if (selection.uuid) void power.refetch();
      }}
    >
      <form
        className={`${panelClass} grid items-end gap-4 md:grid-cols-[2fr_2fr_auto]`}
        onSubmit={search}
      >
        <label className="block space-y-2 text-sm">
          <span>{t('machine')}</span>
          <select name="uuid" required className={inputClass} defaultValue="">
            <option value="" disabled>
              {t('selectMachine')}
            </option>
            {machines.machines.map((machine) => (
              <option key={machine.uuid} value={machine.uuid}>
                {formatMachineCode(machine)}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2 text-sm">
          <span>{t('startedAt')}</span>
          <input
            name="startedAt"
            type="datetime-local"
            className={inputClass}
            value={startedAtInput}
            onChange={(event) => setStartedAtInput(event.target.value)}
          />
        </label>
        <button
          type="submit"
          className={buttonClass}
          disabled={power.isFetching || !machines.machines.length}
        >
          {power.isFetching ? t('loading') : t('searchRecords')}
        </button>
        <p className="text-text-secondary text-sm leading-6 md:col-span-3 dark:text-slate-400">
          {t('powerRangeHint')}
        </p>
        <div className="md:col-span-3">
          <PowerLookbackButtons
            disabled={!selection.uuid || power.isFetching}
            onLookback={lookback}
          />
        </div>
      </form>
      <PowerRecordResults
        uuid={selection.uuid}
        records={power.data ?? []}
        isLoading={power.isLoading}
        isError={power.isError}
      />
    </AdminPage>
  );
}
