import { type FormEvent, useState } from 'react';

import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  type AdminMachine,
  Gender,
  Location,
  MachineType,
  createMachineSchema,
  createMultipleMachinesSchema,
  formatMachineCode,
  shiftPowerQueryStart,
  toDatetimeLocalValue,
  updateMachineSchema,
  useAdminActions,
  useAdminMachines,
  useAdminPower,
} from '../../viewmodels';
import {
  AdminDialog,
  AdminPage,
  MachineFilters,
  MachineStatusBadge,
  MachineTable,
  PowerLookbackButtons,
  PowerRecordResults,
} from '../components';
import { buttonClass, inputClass, secondaryButtonClass } from '../styles';

export function AdminMachinesScreen() {
  const { t } = useTranslation('admin');
  const query = useAdminMachines();
  const actions = useAdminActions();
  const [mode, setMode] = useState<'single' | 'multiple' | null>(null);
  const [editing, setEditing] = useState<AdminMachine | null>(null);
  const [confirm, setConfirm] = useState<{
    machine: AdminMachine;
    action: 'delete' | 'commission';
  } | null>(null);
  const [powerTarget, setPowerTarget] = useState<AdminMachine | null>(null);
  const [startedAt, setStartedAt] = useState<string | undefined>();
  const [startedAtInput, setStartedAtInput] = useState('');
  const power = useAdminPower(powerTarget?.uuid ?? '', startedAt);
  const powerMachine =
    query.machines.find((machine) => machine.uuid === powerTarget?.uuid) ?? powerTarget;

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (mode === 'multiple') {
      const result = createMultipleMachinesSchema.safeParse(values);
      if (!result.success) {
        toast.error(t('invalidRange'));
        return;
      }
      try {
        await actions.createMultiple.mutateAsync({ params: { query: result.data } });
        setMode(null);
      } catch {
        /* The mutation reports the API error. */
      }
    } else {
      const result = createMachineSchema.safeParse(values);
      if (!result.success) {
        toast.error(t('invalidForm'));
        return;
      }
      try {
        await actions.create.mutateAsync({ params: { query: result.data } });
        setMode(null);
      } catch {
        /* The mutation reports the API error. */
      }
    }
  }
  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const values = new FormData(event.currentTarget);
    const result = updateMachineSchema.safeParse({
      ...Object.fromEntries(values),
      isAvailable: values.get('isAvailable') === 'on',
    });
    if (!result.success) {
      toast.error(t('invalidForm'));
      return;
    }
    try {
      await actions.update.mutateAsync({
        params: { path: { uuid: editing.uuid } },
        body: result.data,
      });
      setEditing(null);
    } catch {
      /* The mutation reports the API error. */
    }
  }
  function searchPower(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = startedAtInput ? Date.parse(startedAtInput) : Number.NaN;
    const next = Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined;
    if (next === startedAt) void power.refetch();
    else setStartedAt(next);
  }
  function lookback(minutes: 60 | 30 | 10) {
    const next = shiftPowerQueryStart(startedAt, minutes);
    setStartedAtInput(toDatetimeLocalValue(next));
    setStartedAt(next);
  }
  function closePower() {
    setPowerTarget(null);
    setStartedAt(undefined);
    setStartedAtInput('');
  }
  async function confirmAction() {
    if (!confirm) return;
    try {
      const variables = { params: { path: { uuid: confirm.machine.uuid } } };
      if (confirm.action === 'delete') await actions.remove.mutateAsync(variables);
      else await actions.commission.mutateAsync(variables);
      setConfirm(null);
    } catch {
      /* The mutation reports the API error. */
    }
  }
  return (
    <AdminPage
      title={t('machines')}
      description={t('machinesDescription')}
      isLoading={query.isLoading}
      isError={query.isError}
      isRefreshing={query.isFetching}
      onRefresh={() => void query.refetch()}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-text-secondary text-sm dark:text-slate-400">
          {t('machineCount', { count: query.filtered.length })}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => setMode('multiple')}
            disabled={actions.isPending}
          >
            {t('createMultiple')}
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={() => setMode('single')}
            disabled={actions.isPending}
          >
            <Plus size={16} />
            {t('createMachine')}
          </button>
        </div>
      </div>
      <MachineFilters filters={query.filters} />
      <MachineTable
        machines={query.filtered}
        renderActions={(machine) => (
          <>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => {
                setStartedAt(undefined);
                setPowerTarget(machine);
              }}
            >
              {t('power')}
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => setEditing(machine)}
              disabled={actions.isPending}
            >
              {t('edit')}
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => setConfirm({ machine, action: 'commission' })}
              disabled={actions.isPending}
            >
              {t('commission')}
            </button>
            <button
              type="button"
              className={`${secondaryButtonClass} text-red-600 dark:text-red-400`}
              onClick={() => setConfirm({ machine, action: 'delete' })}
              disabled={actions.isPending}
            >
              {t('delete')}
            </button>
          </>
        )}
      />
      {mode && (
        <AdminDialog
          title={mode === 'single' ? t('createMachine') : t('createMultiple')}
          onClose={() => setMode(null)}
          isPending={actions.isPending}
        >
          <form onSubmit={(event) => void create(event)} className="space-y-4">
            <fieldset disabled={actions.isPending} className="space-y-4">
              <label className="block space-y-2 text-sm">
                <span>{t('location')}</span>
                <select name="location" className={inputClass}>
                  {Object.values(Location).map((value) => (
                    <option key={value} value={value}>
                      {t('building', { location: value })}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2 text-sm">
                <span>{t('gender')}</span>
                <select name="gender" className={inputClass}>
                  {Object.values(Gender).map((value) => (
                    <option key={value} value={value}>
                      {t(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2 text-sm">
                <span>{t('type')}</span>
                <select name="type" className={inputClass}>
                  {Object.values(MachineType).map((value) => (
                    <option key={value} value={value}>
                      {t(value)}
                    </option>
                  ))}
                </select>
              </label>
              {mode === 'single' ? (
                <>
                  <label className="block space-y-2 text-sm">
                    <span>{t('index')}</span>
                    <input
                      name="index"
                      type="number"
                      min={1}
                      step={1}
                      defaultValue={1}
                      required
                      className={inputClass}
                    />
                  </label>
                  <label className="block space-y-2 text-sm">
                    <span>{t('matterPayload')}</span>
                    <input name="matterPayload" className={inputClass} placeholder="MT:…" />
                  </label>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-2 text-sm">
                      <span>{t('startIndex')}</span>
                      <input
                        name="startIndex"
                        type="number"
                        min={1}
                        max={29}
                        step={1}
                        defaultValue={1}
                        required
                        className={inputClass}
                      />
                    </label>
                    <label className="block space-y-2 text-sm">
                      <span>{t('endIndex')}</span>
                      <input
                        name="endIndex"
                        type="number"
                        min={2}
                        max={30}
                        step={1}
                        defaultValue={2}
                        required
                        className={inputClass}
                      />
                    </label>
                  </div>
                  <p className="text-text-secondary text-sm leading-6 dark:text-slate-400">
                    {t('rangeHint')}
                  </p>
                </>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() => setMode(null)}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className={buttonClass}>
                  {actions.isPending ? t('saving') : t('create')}
                </button>
              </div>
            </fieldset>
          </form>
        </AdminDialog>
      )}
      {editing && (
        <AdminDialog
          title={`${t('editMachine')} · ${formatMachineCode(editing)}`}
          onClose={() => setEditing(null)}
          isPending={actions.isPending}
        >
          <form onSubmit={(event) => void update(event)}>
            <fieldset disabled={actions.isPending} className="space-y-4">
              <label className="flex items-center gap-3 text-sm">
                <input
                  name="isAvailable"
                  type="checkbox"
                  defaultChecked={editing.isAvailable}
                  className="accent-primary size-4"
                />
                {t('isAvailable')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-2 text-sm">
                  <span>{t('posX')}</span>
                  <input
                    name="posX"
                    type="number"
                    step={1}
                    defaultValue={editing.posX ?? ''}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-2 text-sm">
                  <span>{t('posY')}</span>
                  <input
                    name="posY"
                    type="number"
                    step={1}
                    defaultValue={editing.posY ?? ''}
                    className={inputClass}
                  />
                </label>
              </div>
              <label className="block space-y-2 text-sm">
                <span>{t('matterPayload')}</span>
                <input name="matterPayload" className={inputClass} placeholder="MT:…" />
              </label>
              <p className="text-text-secondary text-sm leading-6 dark:text-slate-400">
                {t('editHint')}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() => setEditing(null)}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className={buttonClass}>
                  {actions.isPending ? t('saving') : t('save')}
                </button>
              </div>
            </fieldset>
          </form>
        </AdminDialog>
      )}
      {confirm && (
        <AdminDialog
          title={confirm.action === 'delete' ? t('deleteMachine') : t('commission')}
          onClose={() => setConfirm(null)}
          isPending={actions.isPending}
        >
          <p className="text-sm leading-6">
            {formatMachineCode(confirm.machine)} ·{' '}
            {t('building', { location: confirm.machine.location })} · {t(confirm.machine.gender)} ·{' '}
            {t(confirm.machine.type)} #{confirm.machine.index}
          </p>
          <p className="text-text-secondary mt-3 text-sm leading-6 dark:text-slate-400">
            {confirm.action === 'delete' ? t('deleteConfirm') : t('commissionConfirm')}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              disabled={actions.isPending}
              className={secondaryButtonClass}
              onClick={() => setConfirm(null)}
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              disabled={actions.isPending}
              className={`${buttonClass} ${confirm.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              onClick={() => void confirmAction()}
            >
              {actions.isPending ? t('saving') : t('confirm')}
            </button>
          </div>
        </AdminDialog>
      )}
      {powerMachine && (
        <AdminDialog
          wide
          title={`${t('power')} · ${formatMachineCode(powerMachine)}`}
          onClose={closePower}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="text-text-secondary text-sm dark:text-slate-400">{t('status')}</span>
            <MachineStatusBadge
              isAvailable={powerMachine.isAvailable}
              status={powerMachine.status}
            />
          </div>
          <form
            className="mb-4 grid items-end gap-4 sm:grid-cols-[1fr_auto]"
            onSubmit={searchPower}
          >
            <label className="block space-y-2 text-sm">
              <span>{t('startedAt')}</span>
              <input
                name="startedAt"
                type="datetime-local"
                className={inputClass}
                value={startedAtInput}
                onChange={(event) => setStartedAtInput(event.target.value)}
              />
            </label>
            <button type="submit" className={buttonClass} disabled={power.isFetching}>
              {power.isFetching ? t('loading') : t('searchRecords')}
            </button>
            <p className="text-text-secondary text-sm leading-6 sm:col-span-2 dark:text-slate-400">
              {t('powerRangeHint')}
            </p>
            <div className="sm:col-span-2">
              <PowerLookbackButtons disabled={power.isFetching} onLookback={lookback} />
            </div>
          </form>
          <div className="space-y-4">
            <PowerRecordResults
              uuid={powerMachine.uuid}
              records={power.data ?? []}
              isLoading={power.isLoading}
              isError={power.isError}
            />
          </div>
        </AdminDialog>
      )}
    </AdminPage>
  );
}
