import { Link } from '@tanstack/react-router';

import { ArrowUpRight, CircleAlert, CircleCheck, Link2, WashingMachine } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Gender, Location, getMachineStats, useAdminMachines } from '../../viewmodels';
import { AdminPage } from '../components';
import { panelClass } from '../styles';

export function AdminOverviewScreen() {
  const { t } = useTranslation('admin');
  const query = useAdminMachines();
  const stats = getMachineStats(query.machines);
  const cards = [
    { label: t('totalMachines'), value: stats.total, icon: WashingMachine, color: 'text-primary' },
    {
      label: t('availableMachines'),
      value: stats.available,
      icon: CircleCheck,
      color: 'text-emerald-600',
    },
    {
      label: t('runningMachines'),
      value: stats.running,
      icon: WashingMachine,
      color: 'text-blue-500',
    },
    {
      label: t('unavailableMachines'),
      value: stats.unavailable,
      icon: CircleAlert,
      color: 'text-red-500',
    },
  ];
  return (
    <AdminPage
      title={t('overview')}
      description={t('overviewDescription')}
      isLoading={query.isLoading}
      isError={query.isError}
      isRefreshing={query.isFetching}
      onRefresh={() => void query.refetch()}
    >
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={panelClass}>
            <div className="text-text-secondary flex items-center justify-between gap-2 text-sm dark:text-slate-400">
              <span>{label}</span>
              <Icon size={20} className={color} />
            </div>
            <div className="mt-5 text-3xl font-bold">
              {value}
              <span className="text-text-secondary ml-2 text-sm font-normal dark:text-slate-400">
                {t('unit')}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className={panelClass}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold">{t('roomOverview')}</h2>
          <Link to="/admin/machines" className="text-primary flex items-center gap-1 text-sm">
            {t('manage')}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.values(Location).flatMap((location) =>
            Object.values(Gender).map((gender) => {
              const room = getMachineStats(
                query.machines.filter(
                  (machine) => machine.location === location && machine.gender === gender,
                ),
              );
              return (
                <div
                  key={`${location}-${gender}`}
                  className="bg-bg rounded-lg p-4 dark:bg-slate-800"
                >
                  <div className="mb-3 font-medium">
                    {t('building', { location })} · {t(gender)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-text-secondary dark:text-slate-400">{t('IDLE')}</div>
                      <div className="mt-2 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                        {room.available}
                      </div>
                    </div>
                    <div>
                      <div className="text-text-secondary dark:text-slate-400">{t('running')}</div>
                      <div className="text-primary mt-2 text-xl font-semibold">{room.running}</div>
                    </div>
                    <div>
                      <div className="text-text-secondary dark:text-slate-400">
                        {t('unavailable')}
                      </div>
                      <div className="mt-2 text-xl font-semibold text-red-500">
                        {room.unavailable}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </div>
      <div className={`${panelClass} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <Link2 size={22} className="text-amber-500" />
          <div>
            <h2 className="text-base font-semibold">{t('linkCheck')}</h2>
            <p className="text-text-secondary mt-2 text-sm dark:text-slate-400">
              {t('missingLinksCount', { count: stats.missingLinks })}
            </p>
          </div>
        </div>
        <Link
          to="/admin/links"
          className="text-primary flex items-center gap-1 text-sm font-medium"
        >
          {t('links')}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </AdminPage>
  );
}
