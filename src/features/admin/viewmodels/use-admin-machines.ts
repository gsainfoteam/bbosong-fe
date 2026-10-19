import { useMemo, useState } from 'react';

import { $api } from '@/common/lib';

import { ApiPaths, type AdminMachine, normalizeAdminMachine } from '../models';

export function useAdminMachines() {
  const query = $api.useQuery('get', ApiPaths.MachineController_getMachines, undefined, {
    refetchInterval: 30_000,
    retry: false,
  });
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [type, setType] = useState('');
  const machines = useMemo(
    () =>
      (query.data ?? [])
        .map(normalizeAdminMachine)
        .sort(
          (a, b) =>
            a.location.localeCompare(b.location) ||
            a.gender.localeCompare(b.gender) ||
            a.type.localeCompare(b.type) ||
            a.index - b.index,
        ),
    [query.data],
  );
  const filtered = useMemo(
    () =>
      machines.filter(
        (machine) =>
          (!location || machine.location === location) &&
          (!gender || machine.gender === gender) &&
          (!type || machine.type === type) &&
          (!search ||
            `${machine.uuid} ${machine.index} ${machine.shortCode ?? ''}`
              .toLowerCase()
              .includes(search.trim().toLowerCase())),
      ),
    [machines, location, gender, type, search],
  );

  return {
    ...query,
    machines,
    filtered,
    filters: { search, setSearch, location, setLocation, gender, setGender, type, setType },
  };
}

export function getMachineStats(machines: AdminMachine[]) {
  return {
    total: machines.length,
    available: machines.filter((machine) => machine.isAvailable && machine.status === 'IDLE')
      .length,
    running: machines.filter((machine) => machine.isAvailable && machine.status !== 'IDLE').length,
    unavailable: machines.filter((machine) => !machine.isAvailable).length,
    missingLinks: machines.filter((machine) => !machine.shortUrl).length,
  };
}
