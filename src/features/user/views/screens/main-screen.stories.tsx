import { useState } from 'react';

import { MainScreen } from './main-screen';

import type { DropDown } from '@/common/components';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/MainScreen',
  component: MainScreen,
} satisfies Meta<typeof MainScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    usingMachineList: {
      machineList: [
        {
          machine: { type: 'washer', id: 3 },
          location: 'a',
          onClear: () => console.log('Clear washer 3'),
        },
        {
          machine: { type: 'dryer', id: 1 },
          location: 'b',
          onClear: () => console.log('Clear dryer 1'),
        },
      ],
    },
    selectBuilding: {
      dropDownProps: {
        items: ['a', 'b'],
        value: 'a',
        onSelect: (item) => console.log(`Select ${item}`),
      },
      onOpenMap: (building) => console.log(`Open map ${building}`),
    },
    machines: {
      machines: [
        { type: 'washer', id: 1, status: 'idle' },
        { type: 'washer', id: 2, status: 'using' },
        { type: 'washer', id: 3, status: 'disabled' },
        { type: 'dryer', id: 1, status: 'idle' },
        { type: 'dryer', id: 2, status: 'using' },
        { type: 'dryer', id: 3, status: 'disabled' },
      ],
    },
  },
  // 생활관 선택을 스토리 내부 상태로 관리해 실제 사용 흐름을 재현
  render: function Render({ selectBuilding, ...args }) {
    const [building, setBuilding] = useState<DropDown.Props['value']>(
      selectBuilding.dropDownProps.value,
    );

    return (
      <MainScreen
        {...args}
        selectBuilding={{
          ...selectBuilding,
          dropDownProps: {
            ...selectBuilding.dropDownProps,
            value: building,
            onSelect: setBuilding,
          },
        }}
      />
    );
  },
};

export const NoUsingMachine: Story = {
  args: {
    ...Default.args,
    usingMachineList: {
      machineList: [],
    },
  },
};
