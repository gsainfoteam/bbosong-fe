import { useMemo } from 'react';

import { useNowTick } from './machine-list-timing';
import { toMachineView } from './machine-view';
import { useFindMachines } from './use-find-machines';

type Usage = { machineUuid: string };

const NO_USAGE: readonly Usage[] = [];

export function useMachineViews(usingMachines: readonly Usage[] = NO_USAGE) {
  const { data: machines, isLoading, isError, refetch } = useFindMachines();
  const now = useNowTick((machines ?? []).some((machine) => machine.status !== 'IDLE'));

  const views = useMemo(() => {
    const mine = new Set(usingMachines.map((usage) => usage.machineUuid));
    return (machines ?? [])
      .map((machine) => toMachineView(machine, now, mine))
      .sort((a, b) => a.id - b.id);
  }, [machines, usingMachines, now]);

  return { views, isLoading, isError, refetch };
}
