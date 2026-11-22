import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Gender,
  Location,
  type DailySessionStat,
  type DailySessionStatsFilter,
  type DailySessionStatsRange,
} from '../../../viewmodels';
import { buttonClass, inputClass, panelClass, secondaryButtonClass } from '../../styles';

const RANGES = [7, 14, 30, 90] as const satisfies readonly DailySessionStatsRange[];

function toChartData(data: DailySessionStat[]) {
  return data.map((row) => {
    const total = row.registeredCount + row.unregisteredCount;
    return {
      ...row,
      registeredRatio: total === 0 ? null : Math.round((row.registeredCount / total) * 1000) / 10,
    };
  });
}

function formatRegisteredRatio(value: number) {
  return `${value.toFixed(1)}%`;
}

export function DailySessionStatsPanel({
  days,
  onDaysChange,
  filter,
  onFilterChange,
  data,
  isLoading,
  isError,
}: DailySessionStatsPanel.Props) {
  const { t } = useTranslation('admin');
  const chartData = toChartData(data);
  const showDots = chartData.length <= 14;

  return (
    <div className={panelClass}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">{t('dailySessionStats')}</h2>
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label={t('dailySessionStatsRange')}
        >
          <span className="text-ink2 text-sm dark:text-slate-400">
            {t('dailySessionStatsRange')}
          </span>
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              aria-pressed={days === range}
              className={days === range ? buttonClass : secondaryButtonClass}
              disabled={isLoading}
              onClick={() => onDaysChange(range)}
            >
              {t('rangeDays', { count: range })}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:max-w-md">
        <select
          className={inputClass}
          aria-label={t('location')}
          value={filter.location ?? ''}
          disabled={isLoading}
          onChange={(event) =>
            onFilterChange({
              ...filter,
              location: event.target.value === '' ? undefined : (event.target.value as Location),
            })
          }
        >
          <option value="">{t('allLocations')}</option>
          {Object.values(Location).map((value) => (
            <option key={value} value={value}>
              {t('building', { location: value })}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          aria-label={t('gender')}
          value={filter.gender ?? ''}
          disabled={isLoading}
          onChange={(event) =>
            onFilterChange({
              ...filter,
              gender: event.target.value === '' ? undefined : (event.target.value as Gender),
            })
          }
        >
          <option value="">{t('allGenders')}</option>
          {Object.values(Gender).map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div role="status" className="text-sm">
          {t('loading')}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-6 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {t('requestFailed')}
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-track)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="count" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="ratio"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => formatRegisteredRatio(value)}
              />
              <Tooltip
                formatter={(value, name, item) => {
                  if (item.dataKey === 'registeredRatio') {
                    return value == null
                      ? ['—', name]
                      : [formatRegisteredRatio(Number(value)), name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Line
                yAxisId="count"
                name={t('registeredSessions')}
                type="monotone"
                dataKey="registeredCount"
                stroke="var(--color-sky-ring)"
                strokeWidth={2}
                dot={showDots}
                isAnimationActive={false}
              />
              <Line
                yAxisId="count"
                name={t('unregisteredSessions')}
                type="monotone"
                dataKey="unregisteredCount"
                stroke="var(--color-orange-ring)"
                strokeWidth={2}
                dot={showDots}
                isAnimationActive={false}
              />
              <Line
                yAxisId="ratio"
                name={t('registeredSessionRatio')}
                type="monotone"
                dataKey="registeredRatio"
                stroke="var(--color-live)"
                strokeWidth={2}
                strokeDasharray="4 4"
                connectNulls={false}
                dot={showDots}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export namespace DailySessionStatsPanel {
  export type Props = {
    days: DailySessionStatsRange;
    onDaysChange: (days: DailySessionStatsRange) => void;
    filter: DailySessionStatsFilter;
    onFilterChange: (filter: DailySessionStatsFilter) => void;
    data: DailySessionStat[];
    isLoading?: boolean;
    isError?: boolean;
  };
}
