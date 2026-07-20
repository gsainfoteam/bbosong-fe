import { t } from 'i18next';

import { cn } from '@/common/utils';
import { RoomStatusBox } from '@/features/user';

export function RoomStatusGrid({
  aWasher,
  aDryer,
  bWasher,
  bDryer,
  onBoxClick,
  className,
  ...props
}: RoomStatusGrid.Props) {
  return (
    <div className={cn('', className)} {...props}>
      <p className='mb-3'>{t('user.mypage.roomStatusTitle')}</p>
      <div className='grid grid-cols-2 gap-2'>
        <RoomStatusBox
          building="a"
          machine="washer"
          count={aWasher.count}
          toggleState={aWasher.toggleState}
          onChange={() => onBoxClick('a', 'washer')}
        />
        <RoomStatusBox
          building="a"
          machine="dryer"
          count={aDryer.count}
          toggleState={aDryer.toggleState}
          onChange={() => onBoxClick('a', 'dryer')}
        />
        <RoomStatusBox
          building="b"
          machine="washer"
          count={bWasher.count}
          toggleState={bWasher.toggleState}
          onChange={() => onBoxClick('b', 'washer')}
        />
        <RoomStatusBox
          building="b"
          machine="dryer"
          count={bDryer.count}
          toggleState={bDryer.toggleState}
          onChange={() => onBoxClick('b', 'dryer')}
        />
      </div>
    </div>
  );
}

export namespace RoomStatusGrid {
  export type BoxData = {
    count: number;
    toggleState: boolean;
  };
  export type Props = {
    aWasher: BoxData;
    aDryer: BoxData;
    bWasher: BoxData;
    bDryer: BoxData;
    onBoxClick: (building: 'a' | 'b', machine: 'washer' | 'dryer') => void;
    className?: string;
  };
}
