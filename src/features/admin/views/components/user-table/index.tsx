import { useTranslation } from 'react-i18next';

import { type AdminUserWithSubscriptions } from '../../../viewmodels';
import { secondaryButtonClass } from '../../styles';

export function UserTable({ users, currentUserUuid, isPending, onSelect }: UserTable.Props) {
  const { t, i18n } = useTranslation('admin');
  const formatDate = (value: string) => new Date(value).toLocaleString(i18n.resolvedLanguage);
  return (
    <div className="border-border overflow-x-auto rounded-xl border bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-left text-sm">
        <thead className="bg-bg text-text-secondary dark:bg-slate-800 dark:text-slate-400">
          <tr>
            {[
              t('user'),
              t('studentNumber'),
              t('gender'),
              t('role'),
              t('pushDevices'),
              t('actions'),
            ].map((label) => (
              <th key={label} scope="col" className="px-5 py-3 font-medium whitespace-nowrap">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border divide-y dark:divide-slate-800">
          {users.map((user) => (
            <tr key={user.uuid}>
              <td className="px-5 py-4">
                <div className="font-medium">{user.name}</div>
                <div className="text-text-secondary mt-1 break-all dark:text-slate-400">
                  {user.email}
                </div>
                <div className="text-text-secondary mt-1 font-mono text-xs dark:text-slate-400">
                  {user.uuid}
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">{user.studentNumber}</td>
              <td className="px-5 py-4 whitespace-nowrap">{t(user.gender)}</td>
              <td className="px-5 py-4 whitespace-nowrap">{t(user.role)}</td>
              <td className="min-w-64 px-5 py-4">
                {user.pushSubscriptions.length ? (
                  <details>
                    <summary className="text-primary cursor-pointer">
                      {t('pushDeviceCount', { count: user.pushSubscriptions.length })}
                    </summary>
                    <ul className="mt-3 space-y-3">
                      {user.pushSubscriptions.map((device) => (
                        <li
                          key={device.uuid}
                          className="bg-bg rounded-lg p-3 text-xs dark:bg-slate-800"
                        >
                          <div className="break-all">{device.userAgent || t('unknownDevice')}</div>
                          <dl className="mt-2 space-y-2">
                            <div>
                              <dt className="text-text-secondary dark:text-slate-400">
                                {t('pushRegisteredAt')}
                              </dt>
                              <dd className="mt-1">{formatDate(device.createdAt)}</dd>
                            </div>
                            <div>
                              <dt className="text-text-secondary dark:text-slate-400">
                                {t('lastPushSentAt')}
                              </dt>
                              <dd className="mt-1">
                                {device.lastActivatedAt
                                  ? formatDate(device.lastActivatedAt)
                                  : t('noSuccessfulPush')}
                              </dd>
                            </div>
                          </dl>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <span className="text-text-secondary dark:text-slate-400">
                    {t('noPushDevices')}
                  </span>
                )}
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                {user.uuid === currentUserUuid ? (
                  <span className="text-text-secondary dark:text-slate-400">
                    {t('currentUser')}
                  </span>
                ) : (
                  <button
                    type="button"
                    className={secondaryButtonClass}
                    disabled={isPending}
                    onClick={() => onSelect(user)}
                  >
                    {t('changeRole')}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {!users.length && (
            <tr>
              <td
                colSpan={6}
                className="text-text-secondary px-5 py-12 text-center dark:text-slate-400"
              >
                {t('noUsers')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export namespace UserTable {
  export type Props = {
    users: AdminUserWithSubscriptions[];
    currentUserUuid?: string;
    isPending?: boolean;
    onSelect: (user: AdminUserWithSubscriptions) => void;
  };
}
