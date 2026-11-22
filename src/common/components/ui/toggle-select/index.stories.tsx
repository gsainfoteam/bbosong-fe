import { useState } from 'react';

import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ToggleSelect } from './index';

const meta = {
  title: 'Common/ToggleSelect',
  component: ToggleSelect,
  args: {
    stateList: ['A동', 'B동'],
    state: 'A동',
    onChange: () => {},
  },
  render: (args) => {
    const [state, setState] = useState(args.state);
    return <ToggleSelect {...args} state={state} onChange={setState} />;
  },
} satisfies Meta<typeof ToggleSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ThreeItems: Story = {
  args: { stateList: ['세탁실 현황', '내 정보', '지도'], state: '세탁실 현황' },
};

export const Small: Story = {
  args: { size: 's', stateList: ['한국어', 'English'], state: '한국어' },
  decorators: [
    (Story) => (
      <div className="bg-soft rounded-banner flex justify-end p-4">
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: { available: false },
};
