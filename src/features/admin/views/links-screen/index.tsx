import { Copy, Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAdminActions, useAdminMachines } from '../../viewmodels';
import { AdminPage, MachineFilters, MachineTable } from '../components';
import { buttonClass, panelClass, secondaryButtonClass } from '../styles';

export function AdminLinksScreen() {
  const { t } = useTranslation('admin');
  const query = useAdminMachines();
  const actions = useAdminActions();
  const missing = query.machines.filter((machine) => !machine.shortUrl).length;
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t('copied'));
    } catch {
      toast.error(t('copyFailed'));
    }
  }
  return (
    <AdminPage
      title={t('links')}
      description={t('linksDescription')}
      isLoading={query.isLoading}
      isError={query.isError}
      isRefreshing={query.isFetching}
      onRefresh={() => void query.refetch()}
    >
      <div className={`${panelClass} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <h2 className="text-base font-semibold">{t('missingLinksCount', { count: missing })}</h2>
          <p className="text-text-secondary mt-2 text-sm leading-6 dark:text-slate-400">
            {t('backfillDescription')}
          </p>
        </div>
        <button
          type="button"
          className={buttonClass}
          disabled={actions.isPending || missing === 0}
          onClick={() => actions.backfill.mutate(undefined)}
        >
          <Link2 size={16} />
          {actions.isPending ? t('saving') : t('backfill')}
        </button>
      </div>
      {actions.backfill.data && (
        <div
          className="bg-primary-light text-primary rounded-lg p-4 text-sm dark:bg-blue-950 dark:text-blue-300"
          role="status"
        >
          {t('backfillResult', {
            created: String(actions.backfill.data.created),
            failed: String(actions.backfill.data.failedUuids.length),
          })}
          {actions.backfill.data.failedUuids.length > 0 && (
            <ul className="mt-3 list-inside list-disc font-mono text-xs">
              {actions.backfill.data.failedUuids.map((uuid) => (
                <li key={uuid}>{uuid}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <MachineFilters filters={query.filters} />
      <MachineTable
        machines={query.filtered}
        showLinks
        renderActions={(machine) =>
          machine.shortUrl ? (
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => void copy(machine.shortUrl!)}
            >
              <Copy size={14} />
              {t('copy')}
            </button>
          ) : (
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={actions.isPending}
              onClick={() =>
                actions.ensureLink.mutate({ params: { path: { uuid: machine.uuid } } })
              }
            >
              {t('createLink')}
            </button>
          )
        }
      />
    </AdminPage>
  );
}
