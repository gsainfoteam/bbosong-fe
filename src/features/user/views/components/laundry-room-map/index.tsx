import { cn } from '@/common/utils';
import { type Machine } from '@/features/user';

export function LaundryRoomMap({
  machines,
  doorX = 150,
  className,
  ...props
}: LaundryRoomMap.Props) {
  // 문 X 좌표를 기준으로 양개형 문 아치를 그리는 수식 계산
  const dX = doorX;
  const leftDoorPath = `M ${dX} 400 A 50 50 0 0 0 ${dX - 50} 350 L ${dX - 50} 400 Z`;
  const rightDoorPath = `M ${dX} 400 A 50 50 0 0 1 ${dX + 50} 350 L ${dX + 50} 400 Z`;

  return (
    <div className={cn('relative aspect-2/1 w-full', className)}>
      <svg viewBox="0 0 800 400" className="h-full w-full overflow-hidden select-none" {...props}>
        {/* 세탁실 내부 바닥 영역 (직각 회색) */}
        <rect width="800" height="400" fill="#d9d9d9" />

        {/* 하단 양개형 출입문 실루엣 */}
        <path d={leftDoorPath} fill="#000000" />
        <path d={rightDoorPath} fill="#000000" />

        {/* 기기 배치도 렌더링 레이어 */}
        <g>
          {machines.map((device) => {
            const { id, type, x, y } = device;

            // key에 대응하는 기존의 id를 type+id로 대체
            const elementKey = `${type}${id}`;

            return (
              <g key={elementKey}>
                {/* 기기 도형 마커 (세탁기: 직각 사각형, 건조기: 원형) */}
                {type === 'WASHER' ? (
                  <rect
                    x={x - 25}
                    y={y - 25}
                    width={50}
                    height={50}
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth={3}
                  />
                ) : (
                  <circle cx={x} cy={y} r={25} fill="#ffffff" stroke="#000000" strokeWidth={3} />
                )}

                {/* 기기 식별 숫자 (id) */}
                <text
                  x={x}
                  y={y + 10}
                  textAnchor="middle"
                  fontSize={28}
                  fontWeight="bold"
                  fill="#000000"
                >
                  {id}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export namespace LaundryRoomMap {
  export type Props = {
    machines: Machine[];
    doorX?: number;
    className?: string;
  };
}
