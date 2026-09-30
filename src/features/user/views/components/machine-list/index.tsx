import { cn } from '@/common/utils';
import { MachineBox } from '@/features/user';

export function MachineList({ machines, className, ...props }: MachineList.Props) {
  return (
    <div className={cn(className, 'grid w-full grid-cols-4 items-start gap-2')} {...props}>
      {machines.map((machine) => (
        <MachineBox key={`machine-list-${machine.type}-${machine.id}`} machine={machine} />
      ))}
    </div>
  );
}

export namespace MachineList {
  export type Props = {
    machines: MachineBox.Props['machine'][];
    className?: string;
  };
}
