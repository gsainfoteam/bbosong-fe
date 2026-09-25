import { useState } from 'react';

import { DropDown } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

// location 네임스페이스의 키로 전달하면 DropDown이 번역해 표시
const ITEMS: DropDown.Props['items'] = ['a', 'b'];

const meta: Meta<typeof DropDown> = {
  title: 'Common/DropDown',
  component: DropDown,
  parameters: {
    layout: 'padded',
  },
  args: {
    items: ITEMS,
  },
  // 선택값을 스토리 내부 상태로 관리해 실제 사용 흐름을 재현
  render: function Render({ value, ...args }) {
    const [selected, setSelected] = useState(value);

    return <DropDown {...args} value={selected} onSelect={setSelected} />;
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DropDown>;

export const Default: Story = {
  args: {
    value: 'a',
  },
};

// placeholder를 넘기지 않으면 common:dropDown.placeholder가 표시됨
export const Placeholder: Story = {};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: '생활관을 선택해 주세요',
  },
};

export const Disabled: Story = {
  args: {
    value: 'a',
    disabled: true,
  },
};
