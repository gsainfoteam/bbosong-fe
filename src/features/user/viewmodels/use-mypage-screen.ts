import type { MyPageScreen } from '../views';
import { useFindMachines } from './use-find-machines';


export function useMypageScreenViewModel(): MyPageScreen.Props {
  const machinesData = useFindMachines() || [];
  
  // 내 기기 목록 임시 처리 (실제로는 /machine/me API의 GetUsingMachineResDto 활용 추천)
  const myUsingMachines = machinesData.filter((m: any) => m.status === 'RUNNING');

  const countAvailable = (location: 'A' | 'B', type: 'WASHER' | 'DRYER') => {
    return machinesData.filter(
      (m: any) => m.location === location && m.type === type && m.isAvailable === true
    ).length;
  };

  return {
    userName: '박동희', // 추후 /auth/me API 응답 값으로 교체
    
    // 1. MainScreen과 동일하게 데이터 포장해주기
    usingMachineList: myUsingMachines.map((m: any) => ({
      machine: m,
      location: m.location,
      onClear: () => {
        console.log(`사용 종료: ${m.uuid}`);
      },
    })),
    
    roomStatusList: {
      // 2. 숫자 타입 충돌을 피하기 위해 임시로 as any 붙이기
      aWasher: countAvailable('A', 'WASHER') as any,
      aDryer: countAvailable('A', 'DRYER') as any,
      bWasher: countAvailable('B', 'WASHER') as any,
      bDryer: countAvailable('B', 'DRYER') as any,
      onBoxClick: (roomType: string) => {
        console.log(`${roomType} 블록 클릭됨 - 라우팅 로직 연결`);
      },
    },
  };
}