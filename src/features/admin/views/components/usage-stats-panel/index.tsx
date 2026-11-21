import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import {
  fillUsageStatsBuckets,
  Gender,
  Location,
  MachineType,
  type DailySessionStatsRange,
  type UsageStat,
  type UsageStatsDimension,
  type UsageStatsFilter,
} from '../../../viewmodels';
import { buttonClass, inputClass, panelClass, secondaryButtonClass } from '../../styles';
import { useEnumLabels } from '../../use-enum-labels';

const RANGES = [7, 14, 30, 90] as const satisfies readonly DailySessionStatsRange[];
const DIMENSIONS = ['hour', 'weekday'] as const satisfies readonly UsageStatsDimension[];

export function UsageStatsPanel({
  dimension,
  onDimensionChange,
  days,
  onDaysChange,
  filter,
  onFilterChange,
  data,
  isLoading,
  isError,
}: UsageStatsPanel.Props) {
  const { t } = useTranslation('admin');
  const labels = useEnumLabels();
  const weekdayLabels = [
    t('weekdayMon'),
    t('weekdayTue'),
    t('weekdayWed'),
    t('weekdayThu'),
    t('weekdayFri'),
    t('weekdaySat'),
    t('weekdaySun'),
  ];
  const chartData = fillUsageStatsBuckets(data, dimension).map(({ key, sessionCount }) => ({
    label:
      dimension === 'hour' ? t('hourLabel', { hour: String(key) }) : (weekdayLabels[key - 1] ?? ''),
    sessionCount,
  }));

  return (
    <div className={panelClass}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">{t('usageStats')}</h2>
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label={t('usageStatsDimension')}
        >
          {DIMENSIONS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={dimension === value}
              className={dimension === value ? buttonClass : secondaryButtonClass}
              onClick={() => onDimensionChange(value)}
            >
              {t(value === 'hour' ? 'usageByHour' : 'usageByWeekday')}
            </button>
          ))}
        </div>
      </div>

      <div
        className="mb-5 flex flex-wrap items-center gap-2"
        role="group"
        aria-label={t('dailySessionStatsRange')}
      >
        <span className="text-text-secondary text-sm dark:text-slate-400">
          {t('dailySessionStatsRange')}
        </span>
        {RANGES.map((range) => (
          <button
            key={range}
            type="button"
            aria-pressed={days === range}
            className={days === range ? buttonClass : secondaryButtonClass}
            onClick={() => onDaysChange(range)}
          >
            {t('rangeDays', { count: range })}
          </button>
        ))}
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <select
          className={inputClass}
          aria-label={t('location')}
          value={filter.location ?? ''}
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
              {labels.gender[value]}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          aria-label={t('type')}
          value={filter.type ?? ''}
          onChange={(event) =>
            onFilterChange({
              ...filter,
              type: event.target.value === '' ? undefined : (event.target.value as MachineType),
            })
          }
        >
          <option value="">{t('allTypes')}</option>
          {Object.values(MachineType).map((value) => (
            <option key={value} value={value}>
              {labels.machineType[value]}
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
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                interval={dimension === 'hour' ? 1 : 0}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [value, t('sessionCount')]} />
              <Bar
                name={t('sessionCount')}
                dataKey="sessionCount"
                fill="#4f7df3"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export namespace UsageStatsPanel {
  export type Props = {
    dimension: UsageStatsDimension;
    onDimensionChange: (dimension: UsageStatsDimension) => void;
    days: DailySessionStatsRange;
    onDaysChange: (days: DailySessionStatsRange) => void;
    filter: UsageStatsFilter;
    onFilterChange: (filter: UsageStatsFilter) => void;
    data: UsageStat[];
    isLoading?: boolean;
    isError?: boolean;
  };
}
