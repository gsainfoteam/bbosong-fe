import { cn } from '@/common/utils';
import { MachineBox } from '@/features/user';

export function MachineList({machines, className, ...props}: MachineList.Props) {
  return (
    <div className={cn(className, "w-full grid grid-cols-4 gap-2 items-start")} {...props}>
      {machines.map((machine) => (
        <MachineBox key={`machine-list-${machine.type}-${machine.id}`} machine={machine} />
      ))}
    </div>
  )
}

export namespace MachineList {
  export type Props = {
    machines: MachineBox.Props['machine'][];
    className?: string;
  }
}
