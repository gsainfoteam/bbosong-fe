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

import { InfoTooltip } from '@/common/components/ui/info-tooltip';

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
  const series = [
    {
      dataKey: 'subscriptionCount',
      name: t('subscriptionRequests'),
      help: t('subscriptionRequestsHelp'),
      color: 'var(--color-sky-ring)',
      dashed: false,
    },
    {
      dataKey: 'subscriptionUserCount',
      name: t('subscriptionRequestUsers'),
      help: t('subscriptionRequestUsersHelp'),
      color: 'var(--color-sky-ring)',
      dashed: true,
    },
    {
      dataKey: 'notificationCount',
      name: t('notificationsSent'),
      help: t('notificationsSentHelp'),
      color: 'var(--color-live)',
      dashed: false,
    },
    {
      dataKey: 'notificationUserCount',
      name: t('notificationUsers'),
      help: t('notificationUsersHelp'),
      color: 'var(--color-live)',
      dashed: true,
    },
  ];

  return (
    <div className={panelClass}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">{t('dailyRoomSubscriptionStats')}</h2>
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
        <>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-track)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                {series.map((item) => (
                  <Line
                    key={item.dataKey}
                    name={item.name}
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke={item.color}
                    strokeWidth={2}
                    strokeDasharray={item.dashed ? '4 4' : undefined}
                    dot={showDots}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {series.map((item) => (
              <li key={item.dataKey} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block w-6 border-t-2"
                  style={{
                    borderColor: item.color,
                    borderStyle: item.dashed ? 'dashed' : 'solid',
                  }}
                />
                <span>{item.name}</span>
                <InfoTooltip label={item.name} content={item.help} />
              </li>
            ))}
          </ul>
        </>
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
