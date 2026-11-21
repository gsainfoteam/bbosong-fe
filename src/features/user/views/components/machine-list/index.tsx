import { cn } from '@/common/utils';
import { type MachineView } from '@/features/user/viewmodels';

import { MachineCell } from '../machine-cell';

const CELL_SIZE = 66;

// 양 끝 칸을 제목·빈 자리 글자 끝선에 맞추려고 칸 폭을 고정하고 남는 폭을 칸 사이로 나눈다.
export function MachineList({ machines, className, ...props }: MachineList.Props) {
  return (
    <div
      className={cn('grid grid-cols-[repeat(4,66px)] justify-between gap-y-[18px]', className)}
      {...props}
    >
      {machines.map((machine) => (
        <MachineCell key={machine.uuid} machine={machine} size={CELL_SIZE} />
      ))}
    </div>
  );
}

export namespace MachineList {
  export type Props = {
    machines: MachineView[];
    className?: string;
  };
}
