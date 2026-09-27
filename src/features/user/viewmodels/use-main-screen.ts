import { useState } from 'react';
import { useFindMachines } from './use-find-machines';
import type { MainScreen } from '../views';


export function useMainScreenViewModel(): MainScreen.Props {
  // 스웨거: GetMachineResDto 배열 반환
  const machinesData = useFindMachines() || [];
  
  // 스웨거 명세에 맞춰 location ('A' | 'B') 사용
  const [selectedLocation, setSelectedLocation] = useState<'A' | 'B'>('A');

  // 1. 내가 사용 중인 기기
  const myUsingMachines = machinesData.filter((m: any) => m.status === 'RUNNING' /* 임시 조건 */);

  // 2. 현재 선택된 동(location)의 기기만 필터링
  const currentBuildingMachines = machinesData.filter(
    (m: any) => m.location === selectedLocation
  );

  return {
    usingMachineList: {
      // 배열 안의 요소들을 { machine, onClear } 형태로 변환
      machineList: myUsingMachines.map((m: any) => ({
        machine: m,
        location: m.location,
        onClear: () => {
          // TODO: 스웨거의 /machine/{uuid}/register (DELETE) API 호출 등을 연결
          console.log(`기기 알림 해제 또는 사용 종료: ${m.uuid}`);
        },
      })),
    },
    selectBuilding: {
      dropDownProps: {
        value: selectedLocation as any,
        items: ['A', 'B'] as any, // options 대신 items!
        onSelect: (val: string) => setSelectedLocation(val as 'A' | 'B'),
      },
      onOpenMap: () => {
        console.log('지도 모달 열기');
      },
    },
    machines: {
      machines: currentBuildingMachines as any,
    },
  };
}