import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Gender, Location, MachineType, type useAdminMachines } from '../../../viewmodels';
import { inputClass } from '../../styles';

export function MachineFilters({ filters }: MachineFilters.Props) {
  const { t } = useTranslation('admin');
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="relative">
        <span className="sr-only">{t('search')}</span>
        <Search size={16} className="text-text-secondary absolute top-3 left-3" />
        <input
          className={`${inputClass} pl-9`}
          value={filters.search}
          onChange={(event) => filters.setSearch(event.target.value)}
          placeholder={t('searchPlaceholder')}
        />
      </label>
      <select
        className={inputClass}
        aria-label={t('location')}
        value={filters.location}
        onChange={(event) => filters.setLocation(event.target.value)}
      >
        <option value="">{t('allLocations')}</option>
        {Object.values(Location).map((value) => (
          <option key={value} value={value}>
            {t('building', { location: value })}
          </option>
        ))}
      </select>
      <select
        className={inputClass}
        aria-label={t('gender')}
        value={filters.gender}
        onChange={(event) => filters.setGender(event.target.value)}
      >
        <option value="">{t('allGenders')}</option>
        {Object.values(Gender).map((value) => (
          <option key={value} value={value}>
            {t(value)}
          </option>
        ))}
      </select>
      <select
        className={inputClass}
        aria-label={t('type')}
        value={filters.type}
        onChange={(event) => filters.setType(event.target.value)}
      >
        <option value="">{t('allTypes')}</option>
        {Object.values(MachineType).map((value) => (
          <option key={value} value={value}>
            {t(value)}
          </option>
        ))}
      </select>
    </div>
  );
}
export namespace MachineFilters {
  export type Props = { filters: ReturnType<typeof useAdminMachines>['filters'] };
}
