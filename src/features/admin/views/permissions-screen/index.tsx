import { type FormEvent, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  type AdminUserWithSubscriptions,
  UserRole,
  updateRoleSchema,
  useAdminAccess,
  useAdminActions,
  useAdminUsers,
} from '../../viewmodels';
import { AdminDialog, AdminPage, UserTable } from '../components';
import { buttonClass, inputClass, secondaryButtonClass } from '../styles';

export function AdminPermissionsScreen() {
  const { t } = useTranslation('admin');
  // t('ADMIN'); t('USER');
  const { user } = useAdminAccess();
  const actions = useAdminActions();
  const query = useAdminUsers();
  const [selected, setSelected] = useState<AdminUserWithSubscriptions | null>(null);
  const [role, setRole] = useState<(typeof UserRole)[keyof typeof UserRole]>(UserRole.USER);
  const [change, setChange] = useState<{
    targetUserUuid: string;
    targetRole: (typeof UserRole)[keyof typeof UserRole];
  } | null>(null);

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = updateRoleSchema(user?.uuid).safeParse({
      targetUserUuid: selected?.uuid,
      targetRole: role,
    });
    if (!result.success) {
      toast.error(t('invalidUser'));
      return;
    }
    setChange(result.data);
  }
  function close() {
    setChange(null);
    setSelected(null);
  }
  async function save() {
    if (!change) return;
    try {
      await actions.updateRole.mutateAsync({ body: change });
      close();
    } catch {
      /* The mutation reports the API error. */
    }
  }

  return (
    <>
      <AdminPage
        title={t('permissions')}
        description={t('permissionsDescription')}
        isLoading={query.isLoading}
        isError={query.isError}
        isRefreshing={query.isFetching}
        onRefresh={() => void query.refetch()}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block space-y-2 text-sm">
            <span>{t('userSearch')}</span>
            <input
              type="search"
              value={query.filters.search}
              onChange={(event) => query.filters.setSearch(event.target.value)}
              placeholder={t('userSearchPlaceholder')}
              className={inputClass}
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span>{t('role')}</span>
            <select
              value={query.filters.role}
              onChange={(event) => query.filters.setRole(event.target.value)}
              className={inputClass}
            >
              <option value="">{t('allRoles')}</option>
              {Object.values(UserRole).map((value) => (
                <option key={value} value={value}>
                  {t(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2 text-sm">
            <span>{t('pushDevices')}</span>
            <select
              value={query.filters.pushStatus}
              onChange={(event) => query.filters.setPushStatus(event.target.value)}
              className={inputClass}
            >
              <option value="">{t('allPushStatuses')}</option>
              <option value="registered">{t('hasPushDevices')}</option>
              <option value="unregistered">{t('noPushDevices')}</option>
            </select>
          </label>
        </div>
        <p className="text-text-secondary text-sm dark:text-slate-400">
          {t('userCount', { count: query.filtered.length })}
        </p>
        <UserTable
          users={query.filtered}
          currentUserUuid={user?.uuid}
          isPending={actions.isPending}
          onSelect={(target) => {
            setSelected(target);
            setRole(target.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN);
            setChange(null);
          }}
        />
        <p className="text-text-secondary text-sm leading-6 dark:text-slate-400">
          {t('permissionsHint')} {t('selfRoleHint')}
        </p>
      </AdminPage>
      {selected && (
        <AdminDialog title={t('changeRole')} onClose={close} isPending={actions.isPending}>
          {change && <p className="mb-4 text-sm leading-6">{t('roleConfirm')}</p>}
          <div className="bg-bg rounded-lg p-4 dark:bg-slate-800">
            <p className="font-medium">{selected.name}</p>
            <p className="mt-1 text-sm break-all">{selected.email}</p>
            <p className="mt-2 font-mono text-xs break-all">{selected.uuid}</p>
            <p className="mt-3 text-sm">
              {t('role')}: {t(selected.role)}
            </p>
          </div>
          {change ? (
            <>
              <p className="mt-4 font-medium">
                {t('targetRole')}: {t(change.targetRole)}
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={actions.isPending}
                  onClick={() => setChange(null)}
                >
                  {t('back')}
                </button>
                <button
                  type="button"
                  className={buttonClass}
                  disabled={actions.isPending}
                  onClick={() => void save()}
                >
                  {actions.isPending ? t('saving') : t('confirm')}
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={review} className="mt-4">
              <fieldset disabled={actions.isPending} className="space-y-5">
                <label className="block space-y-2 text-sm">
                  <span>{t('targetRole')}</span>
                  <select
                    name="targetRole"
                    value={role}
                    onChange={(event) => setRole(event.target.value as typeof role)}
                    className={inputClass}
                  >
                    {Object.values(UserRole).map((value) => (
                      <option key={value} value={value}>
                        {t(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex justify-end gap-2">
                  <button type="button" className={secondaryButtonClass} onClick={close}>
                    {t('cancel')}
                  </button>
                  <button type="submit" className={buttonClass} disabled={role === selected.role}>
                    {t('reviewChange')}
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </AdminDialog>
      )}
    </>
  );
}
