import { useState } from 'react';

import { SelectBuilding } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const ROOMS: SelectBuilding.Room[] = [
  { value: 'a', washerFree: 2, dryerFree: 0 },
  { value: 'b', washerFree: 0, dryerFree: 1 },
];

const meta: Meta<typeof SelectBuilding> = {
  title: 'User/SelectBuilding',
  component: SelectBuilding,
  parameters: { layout: 'padded' },
  args: { value: 'a', rooms: ROOMS, gender: 'male', onSelect: () => {} },
  // 선택값을 스토리 내부 상태로 관리해 실제 사용 흐름을 재현
  render: function Render({ value, ...args }) {
    const [selected, setSelected] = useState(value);

    return <SelectBuilding {...args} value={selected} onSelect={setSelected} />;
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SelectBuilding>;

/** 제목을 누르면 아래 시트에서 세탁실을 바꾼다. 각 세탁실에는 빈 자리 수가 보인다. */
export const Default: Story = {};

export const Female: Story = { args: { gender: 'female' } };

export const Disabled: Story = { args: { disabled: true } };
