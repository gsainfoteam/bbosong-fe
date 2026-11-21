import { MachineVessel } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const STATES = [
  'idle',
  'running',
  'paused',
  'detecting',
  'elapsed',
  'off',
  'loading',
] as const satisfies readonly MachineVessel.State[];

const meta = {
  title: 'User/MachineVessel',
  component: MachineVessel,
  args: { type: 'washer', id: 3, state: 'running', level: 0.6 },
} satisfies Meta<typeof MachineVessel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mine: Story = { args: { mine: true } };

// 상태 × 종류 × 내 것 여부를 한 장에 놓고 비교한다.
export const AllStates: Story = {
  render: (args) => (
    <div className="grid grid-cols-[auto_repeat(4,66px)] items-center gap-x-4 gap-y-3 text-[12px]">
      <span />
      <span>washer</span>
      <span>washer mine</span>
      <span>dryer</span>
      <span>dryer mine</span>
      {STATES.map((state) => (
        <div key={state} className="contents">
          <span className="text-ink-2">{state}</span>
          {(['washer', 'dryer'] as const).flatMap((type) =>
            [false, true].map((mine) => (
              <MachineVessel
                key={`${type}-${mine}`}
                {...args}
                type={type}
                state={state}
                mine={mine}
              />
            )),
          )}
        </div>
      ))}
    </div>
  ),
};
