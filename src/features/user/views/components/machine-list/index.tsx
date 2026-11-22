import { cn } from '@/common/utils';
import { useLongPress } from '@/common/viewmodels';
import { type MachineView } from '@/features/user/viewmodels';

import { MachineCell } from '../machine-cell';

const CELL_SIZE = 62;

// 양 끝 칸을 제목·빈 자리 글자 끝선에 맞추려고 칸 폭을 고정하고 남는 폭을 칸 사이로 나눈다.
export function MachineList({
  machines,
  onMachineLongPress,
  className,
  ...props
}: MachineList.Props) {
  return (
    <div
      className={cn('grid grid-cols-[repeat(4,62px)] justify-between gap-y-3.5', className)}
      {...props}
    >
      {machines.map((machine) => (
        <MachineListItem
          key={machine.uuid}
          machine={machine}
          onLongPress={onMachineLongPress && (() => onMachineLongPress(machine))}
        />
      ))}
    </div>
  );
}

function MachineListItem({
  machine,
  onLongPress,
}: {
  machine: MachineView;
  onLongPress?: () => void;
}) {
  const longPress = useLongPress(onLongPress);

  return (
    <MachineCell
      machine={machine}
      size={CELL_SIZE}
      {...longPress}
      className={cn(
        // iOS는 길게 누르면 글자 선택과 공유 메뉴를 띄워 길게 누르기를 가로챈다.
        onLongPress &&
          'touch-manipulation transition duration-120 select-none [-webkit-touch-callout:none] active:scale-[0.97]',
      )}
    />
  );
}

export namespace MachineList {
  export type Props = {
    machines: MachineView[];
    onMachineLongPress?: (machine: MachineView) => void;
    className?: string;
  };
}
