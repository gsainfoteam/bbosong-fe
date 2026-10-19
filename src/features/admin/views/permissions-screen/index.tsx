import { type FormEvent, useState } from 'react';

import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { UserRole, updateRoleSchema, useAdminAccess, useAdminActions } from '../../viewmodels';
import { AdminDialog, AdminPage } from '../components';
import { buttonClass, inputClass, panelClass, secondaryButtonClass } from '../styles';

export function AdminPermissionsScreen() {
  const { t } = useTranslation('admin');
  // t('ADMIN'); t('USER');
  const { user } = useAdminAccess();
  const actions = useAdminActions();
  const [change, setChange] = useState<{
    targetUserUuid: string;
    targetRole: (typeof UserRole)[keyof typeof UserRole];
  } | null>(null);
  const [uuid, setUuid] = useState('');
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = updateRoleSchema(user?.uuid).safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      toast.error(t('invalidUser'));
      return;
    }
    setChange(result.data);
  }
  async function save() {
    if (!change) return;
    try {
      await actions.updateRole.mutateAsync({ body: change });
      setChange(null);
    } catch {
      /* The mutation reports the API error. */
    }
  }
  const updated = actions.updateRole.data;
  return (
    <AdminPage title={t('permissions')} description={t('permissionsDescription')}>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className={panelClass}>
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck size={20} className="text-primary" />
            {t('changeRole')}
          </h2>
          <form onSubmit={review}>
            <fieldset disabled={actions.isPending} className="space-y-5">
              <label className="block space-y-2 text-sm">
                <span>{t('targetUserUuid')}</span>
                <input
                  name="targetUserUuid"
                  required
                  value={uuid}
                  onChange={(event) => {
                    setUuid(event.target.value);
                    actions.updateRole.reset();
                  }}
                  className={`${inputClass} font-mono`}
                  placeholder="123e4567-e89b-12d3-a456-426614174000"
                  autoComplete="off"
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span>{t('targetRole')}</span>
                <select name="targetRole" className={inputClass}>
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {t(role)}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className={buttonClass}>
                {t('reviewChange')}
              </button>
            </fieldset>
          </form>
        </div>
        <div className="border-border rounded-xl border p-5 dark:border-slate-800">
          <h2 className="text-base font-semibold">{t('permissionsGuide')}</h2>
          <p className="text-text-secondary mt-3 text-sm leading-7 dark:text-slate-400">
            {t('permissionsHint')}
          </p>
          <p className="text-text-secondary mt-3 text-sm leading-7 dark:text-slate-400">
            {t('selfRoleHint')}
          </p>
        </div>
      </div>
      {updated && (
        <div className={panelClass} role="status">
          <h2 className="mb-4 text-base font-semibold">{t('updatedUser')}</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-text-secondary dark:text-slate-400">{t('name')}</dt>
              <dd className="mt-1">{updated.name}</dd>
            </div>
            <div>
              <dt className="text-text-secondary dark:text-slate-400">{t('targetRole')}</dt>
              <dd className="mt-1">{t(updated.role)}</dd>
            </div>
            <div>
              <dt className="text-text-secondary dark:text-slate-400">{t('email')}</dt>
              <dd className="mt-1 break-all">{updated.email}</dd>
            </div>
            <div>
              <dt className="text-text-secondary dark:text-slate-400">{t('targetUserUuid')}</dt>
              <dd className="mt-1 font-mono break-all">{updated.uuid}</dd>
            </div>
          </dl>
        </div>
      )}
      {change && (
        <AdminDialog
          title={t('changeRole')}
          onClose={() => setChange(null)}
          isPending={actions.isPending}
        >
          <p className="text-sm leading-6">{t('roleConfirm')}</p>
          <div className="bg-bg mt-4 rounded-lg p-4 dark:bg-slate-800">
            <div className="font-mono text-sm break-all">{change.targetUserUuid}</div>
            <div className="mt-3 font-medium">{t(change.targetRole)}</div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={actions.isPending}
              onClick={() => setChange(null)}
            >
              {t('cancel')}
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
        </AdminDialog>
      )}
    </AdminPage>
  );
}
