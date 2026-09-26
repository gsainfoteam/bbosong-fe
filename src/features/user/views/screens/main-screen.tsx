import { Header } from '@/common/components';
import { MachineList, SelectBuilding, UsingMachineList } from '@/features/user';
import { cn } from '@/common/utils';

export function MainScreen({
  usingMachineList,
  selectBuilding,
  machines,
  className,
  ...props
}: MainScreen.Props) {
  return (
    <div className={cn(className, 'bg-bg h-dvh w-full')} {...props}>
      <Header className="mb-6" />
      <div className="flex flex-col gap-6 px-4">
        <UsingMachineList
          machineList={usingMachineList.machineList}
          className={usingMachineList.className}
        />
        <SelectBuilding
          dropDownProps={selectBuilding.dropDownProps}
          onOpenMap={selectBuilding.onOpenMap}
          className={selectBuilding.className}
        />
        {/*waser*/}
        <MachineList
          machines={machines.machines.filter((machine) => machine.type === 'washer')}
          className={machines.className}
        />
        {/*dryer*/}
        <MachineList
          machines={machines.machines.filter((machine) => machine.type === 'dryer')}
          className={machines.className}
        />
      </div>
    </div>
  );
}

export namespace MainScreen {
  export type Props = {
    usingMachineList: UsingMachineList.Props;
    selectBuilding: SelectBuilding.Props;
    machines: MachineList.Props;
    className?: string;
  };
}
