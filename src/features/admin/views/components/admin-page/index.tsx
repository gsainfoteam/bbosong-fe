import { type ReactNode } from 'react';

import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { secondaryButtonClass } from '../../styles';

export function AdminPage({
  title,
  description,
  children,
  onRefresh,
  isRefreshing,
  isLoading,
  isError,
}: AdminPage.Props) {
  const { t } = useTranslation('admin');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div
          className="border-border rounded-xl border p-12 text-center text-sm dark:border-slate-800"
          role="status"
        >
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
    return children;
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-text-secondary mt-2 text-sm leading-6 dark:text-slate-400">
            {description}
          </p>
        </div>
        {onRefresh && (
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {t('refresh')}
          </button>
        )}
      </div>
      {renderContent()}
    </section>
  );
}
export namespace AdminPage {
  export type Props = {
    title: string;
    description: string;
    children: ReactNode;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    isLoading?: boolean;
    isError?: boolean;
  };
}
