import { useState } from 'react';

import { SelectBuilding } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

// location 네임스페이스의 키로 전달하면 DropDown이 번역해 표시
const BUILDINGS: SelectBuilding.Props['dropDownProps']['items'] = ['a', 'b'];

const meta: Meta<typeof SelectBuilding> = {
  title: 'User/SelectBuilding',
  component: SelectBuilding,
  parameters: {
    layout: 'padded',
  },
  args: {
    onOpenMap: (building: string) => console.log(building),
  },
  // 드롭다운 선택값을 스토리 내부 상태로 관리해 실제 사용 흐름을 재현
  render: function Render({ dropDownProps, ...args }) {
    const [selected, setSelected] = useState(dropDownProps.value);

    return (
      <SelectBuilding
        {...args}
        dropDownProps={{ ...dropDownProps, value: selected, onSelect: setSelected }}
      />
    );
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SelectBuilding>;

export const Default: Story = {
  args: {
    dropDownProps: {
      items: BUILDINGS,
      onSelect: () => {},
      value: BUILDINGS[0],
    },
  },
};

// placeholder를 넘기지 않으면 common:dropDown.placeholder가 표시됨
export const Placeholder: Story = {
  args: {
    dropDownProps: {
      items: BUILDINGS,
      onSelect: () => {},
    },
  },
};

export const Disabled: Story = {
  args: {
    dropDownProps: {
      items: BUILDINGS,
      onSelect: () => {},
      value: BUILDINGS[0],
      disabled: true,
    },
  },
};
