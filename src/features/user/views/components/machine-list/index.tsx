import { cn } from '@/common/utils';
import { useLongPress } from '@/common/viewmodels';
import { MachineBox } from '@/features/user';

export function MachineList({
  machines,
  onMachineLongPress,
  className,
  ...props
}: MachineList.Props) {
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
        <MachineListItem
          key={`machine-list-${machine.type}-${machine.id}`}
          machine={machine}
          onLongPress={onMachineLongPress ? () => onMachineLongPress(machine) : undefined}
        />
      ))}
    </div>
  );
}

function MachineListItem({
  machine,
  onLongPress,
}: {
  machine: MachineList.Item;
  onLongPress?: () => void;
}) {
  const longPress = useLongPress(onLongPress);

  return (
    <div
      {...longPress}
      className={cn(
        // 길게 누르는 칸은 텍스트 선택·iOS 길게 누르기 메뉴가 뜨지 않게 하고, 눌린 느낌을 준다
        onLongPress &&
          'touch-manipulation transition duration-120 select-none [-webkit-touch-callout:none] active:scale-[0.97]',
      )}
    >
      <MachineBox machine={machine} />
    </div>
  );
}

export namespace MachineList {
  export type Item = MachineBox.Props['machine'] & {
    /** 기기 UUID. 관리자가 기기 등록 화면으로 바로 가는 데 쓴다. */
    uuid?: string;
  };

  export type Props = {
    machines: Item[];
    /**
     * 기기를 길게 눌렀을 때. 없으면 길게 누르기를 쓰지 않는다. (관리자에게만 넘긴다)
     */
    onMachineLongPress?: (machine: Item) => void;
    className?: string;
  };
}
