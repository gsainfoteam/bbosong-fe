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

import { panelClass } from '../../styles';

export function PowerRecordResults({
  uuid,
  records,
  isLoading,
  isError,
}: PowerRecordResults.Props) {
  const { t, i18n } = useTranslation('admin');
  const sorted = records
    .slice()
    .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
  const formatDate = (value: string | number) =>
    new Date(value).toLocaleString(i18n.resolvedLanguage, {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  if (!uuid) {
    return (
      <div
        className={`${panelClass} text-text-secondary py-12 text-center text-sm dark:text-slate-400`}
      >
        {t('selectMachineHint')}
      </div>
    );
  }
  if (isLoading) {
    return (
      <div role="status" className={`${panelClass} text-sm`}>
        {t('loading')}
      </div>
    );
  }
  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-xl bg-red-50 p-6 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
      >
        {t('requestFailed')}
      </div>
    );
  }
  if (!sorted.length) {
    return (
      <div
        className={`${panelClass} text-text-secondary py-12 text-center text-sm dark:text-slate-400`}
      >
        {t('noRecords')}
      </div>
    );
  }
  return (
    <>
      <div className={panelClass}>
        <h2 className="mb-6 text-base font-semibold">{t('powerChart')}</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sorted.map((record) => ({
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
                dot={sorted.length < 30}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className={panelClass}>
        <h2 className="mb-4 text-base font-semibold">
          {t('recordCount', { count: sorted.length })}
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
              {sorted
                .slice(-100)
                .reverse()
                .map((record) => (
                  <tr key={record.uuid} className="border-border border-t dark:border-slate-800">
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
  );
}
export namespace PowerRecordResults {
  export type Record = {
    uuid: string;
    recordedAt: string;
    power: number;
  };
  export type Props = {
    uuid: string;
    records: Record[];
    isLoading: boolean;
    isError: boolean;
  };
}
