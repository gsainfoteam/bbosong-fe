import { useMemo } from 'react';
import { useFindMap } from './use-find-map';
import { useFindMachines } from './use-find-machines';
import type { MapScreen } from '../views';


export function useMapScreenViewModel(): MapScreen.Props {
  const { laundryRoomLayouts } = useFindMap();
  const serverMachines = useFindMachines() || [];

  const mergedLayouts = useMemo(() => {
    return laundryRoomLayouts.map((layout) => ({
      ...layout,
      machines: layout.machines.map((mapMachine) => {
        // 스웨거 기준 매칭: mapMachine.id -> API의 index
        // 타입(WASHER/DRYER)과 동(location A/B)이 모두 일치하는 기기 찾기
        const liveData = serverMachines.find(
          (sm: any) =>
            sm.index === mapMachine.id &&
            sm.type === mapMachine.type &&
            sm.location.toLowerCase() === layout.label.toLowerCase()
        );

        return {
          ...mapMachine,
          uuid: liveData?.uuid,
          status: liveData?.status || 'IDLE',
          isAvailable: liveData?.isAvailable ?? false,
        };
      }),
    }));
  }, [laundryRoomLayouts, serverMachines]);

  return {
    laundryRoomLayouts: mergedLayouts,
  };
}