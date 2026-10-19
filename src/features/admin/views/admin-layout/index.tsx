import { Link, Outlet } from '@tanstack/react-router';

import {
  ArrowLeft,
  ChartNoAxesCombined,
  LayoutDashboard,
  Link2,
  ShieldCheck,
  WashingMachine,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LanguageToggle, Loading } from '@/common/components';
import { NotFoundPage } from '@/common/pages';

import { useAdminAccess } from '../../viewmodels';

export function AdminLayout() {
  const { isAdmin, isLoading, user } = useAdminAccess();
  const { t } = useTranslation('admin');
  if (isLoading) return <Loading />;
  if (!isAdmin) return <NotFoundPage />;
  const menus = [
    { to: '/admin', label: t('overview'), icon: LayoutDashboard },
    { to: '/admin/machines', label: t('machines'), icon: WashingMachine },
    { to: '/admin/links', label: t('links'), icon: Link2 },
    { to: '/admin/power', label: t('power'), icon: ChartNoAxesCombined },
    { to: '/admin/permissions', label: t('permissions'), icon: ShieldCheck },
  ] as const;
  return (
    <div className="bg-bg text-text-primary min-h-dvh dark:bg-slate-950 dark:text-slate-100">
      <aside className="border-border border-b bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-b-0 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 px-6 py-7">
          <span className="bg-primary flex size-10 items-center justify-center rounded-xl text-white">
            <WashingMachine size={22} />
          </span>
          <div>
            <div className="text-lg font-bold tracking-tight">BBOSONG</div>
            <div className="text-text-secondary mt-1 text-xs dark:text-slate-400">
              {t('administration')}
            </div>
          </div>
        </div>
        <nav
          aria-label={t('navigation')}
          className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col"
        >
          {menus.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === '/admin' }}
              activeProps={{
                className: 'bg-primary-light text-primary dark:bg-blue-950 dark:text-blue-300',
                'aria-current': 'page',
              }}
              inactiveProps={{
                className:
                  'text-text-secondary hover:bg-bg dark:text-slate-400 dark:hover:bg-slate-800',
              }}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-border hidden border-t p-5 lg:mt-auto lg:block dark:border-slate-800">
          <Link
            to="/"
            className="text-text-secondary flex items-center gap-2 text-sm dark:text-slate-400"
          >
            <ArrowLeft size={16} />
            {t('backToService')}
          </Link>
        </div>
      </aside>
      <div className="lg:ml-64">
        <header className="border-border flex h-18 items-center justify-between gap-3 border-b bg-white px-5 sm:px-8 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={18} className="text-primary" />
            {t('adminOnly')}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-text-secondary hidden text-sm sm:block dark:text-slate-400">
              {user?.name}
            </span>
            <LanguageToggle />
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
