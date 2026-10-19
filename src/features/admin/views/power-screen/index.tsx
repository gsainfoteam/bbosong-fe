import { type FormEvent, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useAdminMachines, useAdminPower } from '../../viewmodels';
import { AdminPage } from '../components';
import { buttonClass, inputClass, panelClass } from '../styles';

export function AdminPowerScreen() {
  const { t, i18n } = useTranslation('admin');
  const machines = useAdminMachines();
  const [selection, setSelection] = useState<{ uuid: string; startedAt?: string }>({ uuid: '' });
  const power = useAdminPower(selection.uuid, selection.startedAt);
  const records = (power.data ?? [])
    .slice()
    .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
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
  const formatDate = (value: string | number) =>
    new Date(value).toLocaleString(i18n.resolvedLanguage, {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
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
                {t('building', { location: machine.location })} · {t(machine.gender)} ·{' '}
                {t(machine.type)} #{machine.index}
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
      {!selection.uuid ? (
        <div
          className={`${panelClass} text-text-secondary py-12 text-center text-sm dark:text-slate-400`}
        >
          {t('selectMachineHint')}
        </div>
      ) : power.isLoading ? (
        <div role="status" className={`${panelClass} text-sm`}>
          {t('loading')}
        </div>
      ) : power.isError ? (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-6 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {t('requestFailed')}
        </div>
      ) : !records.length ? (
        <div
          className={`${panelClass} text-text-secondary py-12 text-center text-sm dark:text-slate-400`}
        >
          {t('noRecords')}
        </div>
      ) : (
        <>
          <div className={panelClass}>
            <h2 className="mb-6 text-base font-semibold">{t('powerChart')}</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={records.map((record) => ({
                    time: Date.parse(record.recordedAt),
                    power: record.power,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                  <XAxis
                    dataKey="time"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value: number) =>
                      new Date(value).toLocaleTimeString(i18n.resolvedLanguage, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    }
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip labelFormatter={(value) => formatDate(Number(value))} />
                  <Line
                    name={t('powerValue')}
                    type="monotone"
                    dataKey="power"
                    stroke="#4f7df3"
                    strokeWidth={2}
                    dot={records.length < 30}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={panelClass}>
            <h2 className="mb-4 text-base font-semibold">
              {t('recordCount', { count: records.length })}
            </h2>
            <p className="text-text-secondary mb-4 text-sm dark:text-slate-400">
              {t('recentRecordsHint')}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th scope="col" className="px-3 py-3 font-medium">
                      {t('recordedAt')}
                    </th>
                    <th scope="col" className="px-3 py-3 font-medium">
                      {t('powerValue')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records
                    .slice(-100)
                    .reverse()
                    .map((record) => (
                      <tr
                        key={record.uuid}
                        className="border-border border-t dark:border-slate-800"
                      >
                        <td className="px-3 py-3">{formatDate(record.recordedAt)}</td>
                        <td className="px-3 py-3 tabular-nums">
                          {record.power.toLocaleString(i18n.resolvedLanguage)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminPage>
  );
}
