import { cn } from '@/common/utils';
import { MachineBox } from '@/features/user';

export function MachineList({ machines, className, ...props }: MachineList.Props) {
  return (
    <div
      className={cn(
        className,
        // 아이콘은 62로 고정하고 남는 폭은 칸 사이로 나눈다
        'grid w-full grid-cols-[repeat(4,62px)] items-start justify-between gap-x-1 gap-y-3.5',
      )}
      {...props}
    >
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
