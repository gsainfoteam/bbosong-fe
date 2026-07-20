import { cn } from '@/common/utils';
import { RoomStatusGrid, WelcomeMessage } from '@/features/user';

import { UsingMachineList } from '../';

export function MypageScreen({userName, usingMachineList, roomStatusList, className, ...props}: MyPageScreen.Props) {

  return (
    <div className={cn('flex flex-col gap-10', className)} {...props}>
      <WelcomeMessage text={userName} />
      <UsingMachineList userName={userName} machineList={usingMachineList} />
      <RoomStatusGrid
        aWasher={roomStatusList.aWasher}
        aDryer={roomStatusList.aDryer}
        bWasher={roomStatusList.bWasher}
        bDryer={roomStatusList.bDryer}
        onBoxClick={roomStatusList.onBoxClick}
      />
    </div>
  );
}

export namespace MyPageScreen {
  export type Props = {
    userName: string;
    usingMachineList: UsingMachineList.Props['machineList'];
    roomStatusList: RoomStatusGrid.Props;
    className?: string;
  }
}