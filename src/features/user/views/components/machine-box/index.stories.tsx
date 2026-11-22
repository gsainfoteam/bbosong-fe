import { MachineBox } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/MachineBox',
  component: MachineBox,
  args: { className: 'w-16' },
  argTypes: {
    machine: { control: 'object' },
  },
} satisfies Meta<typeof MachineBox>;

export default meta;

type Story = StoryObj<typeof meta>;

type Machine = MachineBox.Props['machine'];

const washer = (id: number, rest: Omit<Machine, 'type' | 'id'>): Machine => ({
  type: 'washer',
  id,
  ...rest,
});
const dryer = (id: number, rest: Omit<Machine, 'type' | 'id'>): Machine => ({
  type: 'dryer',
  id,
  ...rest,
});

export const Idle: Story = { args: { machine: washer(1, { status: 'idle' }) } };

/** 남은 시간 ÷ 전체 시간(지난 시간 + 남은 시간)만큼 물결이 찬다. */
export const Running: Story = {
  args: {
    machine: washer(2, {
      status: 'using',
      elapsedMinutes: 17,
      remainingDisplay: { kind: 'minutes', minutes: 41 },
    }),
  },
};

/** 남은 비율이 6% 아래로 내려가도 바닥(6%)에서 멈춘다. 이때가 "거의 끝남"이다. */
export const AlmostDone: Story = {
  args: {
    machine: washer(3, {
      status: 'using',
      elapsedMinutes: 90,
      remainingDisplay: { kind: 'minutes', minutes: 4 },
    }),
  },
};

export const Calculating: Story = {
  args: {
    machine: washer(4, {
      status: 'using',
      elapsedMinutes: 1,
      remainingDisplay: { kind: 'detecting' },
    }),
  },
};

/** 남은 시간을 모르면 지난 시간만 보여 준다. */
export const ElapsedOnly: Story = {
  args: { machine: washer(5, { status: 'using', elapsedMinutes: 72 }) },
};

export const Disabled: Story = { args: { machine: washer(7, { status: 'disabled' }) } };

export const Loading: Story = { args: { machine: washer(8, { status: 'loading' }) } };

export const Mine: Story = {
  args: {
    machine: washer(9, {
      status: 'using',
      mine: true,
      elapsedMinutes: 17,
      remainingDisplay: { kind: 'minutes', minutes: 23 },
    }),
  },
};

export const DryerIdle: Story = { args: { machine: dryer(1, { status: 'idle' }) } };

export const DryerRunning: Story = {
  args: {
    machine: dryer(2, {
      status: 'using',
      elapsedMinutes: 18,
      remainingDisplay: { kind: 'minutes', minutes: 52 },
    }),
  },
};

export const DryerMine: Story = {
  args: {
    machine: dryer(9, {
      status: 'using',
      mine: true,
      elapsedMinutes: 9,
      remainingDisplay: { kind: 'minutes', minutes: 63 },
    }),
  },
};

/** 상태 × 기기를 한눈에 본다. 그리드 칸(62) 그대로. */
export const Matrix: Story = {
  args: { machine: washer(1, { status: 'idle' }) },
  render: () => {
    const states: [string, Omit<Machine, 'type' | 'id'>][] = [
      ['비어 있음', { status: 'idle' }],
      [
        '돌아가는 중',
        { status: 'using', elapsedMinutes: 17, remainingDisplay: { kind: 'minutes', minutes: 41 } },
      ],
      [
        '거의 끝남',
        { status: 'using', elapsedMinutes: 90, remainingDisplay: { kind: 'minutes', minutes: 4 } },
      ],
      ['계산 중', { status: 'using', elapsedMinutes: 1, remainingDisplay: { kind: 'detecting' } }],
      ['시간 모름', { status: 'using', elapsedMinutes: 72 }],
      ['사용 불가', { status: 'disabled' }],
      ['불러오는 중', { status: 'loading' }],
      [
        '내 빨래',
        {
          status: 'using',
          mine: true,
          elapsedMinutes: 17,
          remainingDisplay: { kind: 'minutes', minutes: 23 },
        },
      ],
    ];

    return (
      <div className="grid grid-cols-[4rem_repeat(8,4.5rem)] items-start gap-y-5">
        <span />
        {states.map(([name]) => (
          <span key={name} className="text-caption text-ink2 text-center font-bold">
            {name}
          </span>
        ))}
        {(['washer', 'dryer'] as const).map((type) => (
          <div key={type} className="contents">
            <span className="text-label pt-6">{type === 'washer' ? '세탁기' : '건조기'}</span>
            {states.map(([name, rest], index) => (
              <MachineBox key={name} machine={{ type, id: index + 1, ...rest }} className="w-16" />
            ))}
          </div>
        ))}
      </div>
    );
  },
};
