import { type FormEvent, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { formatMachineCode, useAdminMachines, useAdminPower } from '../../viewmodels';
import { AdminPage, PowerRecordResults } from '../components';
import { buttonClass, inputClass, panelClass } from '../styles';

export function AdminPowerScreen() {
  const { t } = useTranslation('admin');
  const machines = useAdminMachines();
  const [selection, setSelection] = useState<{ uuid: string; startedAt?: string }>({ uuid: '' });
  const power = useAdminPower(selection.uuid, selection.startedAt);
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const startedAt = String(form.get('startedAt') ?? '');
    const next = {
      uuid: String(form.get('uuid')),
      startedAt: startedAt ? new Date(startedAt).toISOString() : undefined,
    };
    if (next.uuid === selection.uuid && next.startedAt === selection.startedAt)
      void power.refetch();
    else setSelection(next);
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
          <input name="startedAt" type="datetime-local" className={inputClass} />
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
