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

import { type DailyRoomSubscriptionStat, type DailySessionStatsRange } from '../../../viewmodels';
import { buttonClass, panelClass, secondaryButtonClass } from '../../styles';

const RANGES = [7, 14, 30, 90] as const satisfies readonly DailySessionStatsRange[];

export function DailyRoomSubscriptionStatsPanel({
  days,
  onDaysChange,
  data,
  isLoading,
  isError,
}: DailyRoomSubscriptionStatsPanel.Props) {
  const { t } = useTranslation('admin');
  const chartData = data;
  const showDots = chartData.length <= 14;

  return (
    <div className={panelClass}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">{t('dailyRoomSubscriptionStats')}</h2>
        <div
          className="flex flex-wrap items-center gap-2"
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
              disabled={isLoading}
              onClick={() => onDaysChange(range)}
            >
              {t('rangeDays', { count: range })}
            </button>
          ))}
        </div>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                name={t('subscriptionRequests')}
                type="monotone"
                dataKey="subscriptionCount"
                stroke="#4f7df3"
                strokeWidth={2}
                dot={showDots}
                isAnimationActive={false}
              />
              <Line
                name={t('subscriptionRequestUsers')}
                type="monotone"
                dataKey="subscriptionUserCount"
                stroke="#4f7df3"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={showDots}
                isAnimationActive={false}
              />
              <Line
                name={t('notificationsSent')}
                type="monotone"
                dataKey="notificationCount"
                stroke="#10b981"
                strokeWidth={2}
                dot={showDots}
                isAnimationActive={false}
              />
              <Line
                name={t('notificationUsers')}
                type="monotone"
                dataKey="notificationUserCount"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
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

export namespace DailyRoomSubscriptionStatsPanel {
  export type Props = {
    days: DailySessionStatsRange;
    onDaysChange: (days: DailySessionStatsRange) => void;
    data: DailyRoomSubscriptionStat[];
    isLoading?: boolean;
    isError?: boolean;
  };
}
