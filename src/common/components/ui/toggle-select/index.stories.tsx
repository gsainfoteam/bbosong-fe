import { useState } from 'react';

import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ToggleSelect } from './index';

const meta = {
  title: 'Common/ToggleSelect',
  component: ToggleSelect,
} satisfies Meta<typeof ToggleSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

// 기본 메뉴형 탭 데모
export const Default: Story = {
  args: {
    available: true,
    stateList: [],
    state: '',
    onChange: () => {},
  },
  render: (args) => {
    // 데모용 정적 표시 문자열 목록
    const translatedStates = ['세탁실 현황', '마이페이지', '약도'];

    // TS2345 에러 방지를 위해 제네릭 <string> 명시
    const [state, setState] = useState<string>(translatedStates[0]);

    return (
      <ToggleSelect
        {...args}
        stateList={translatedStates}
        state={state}
        onChange={(newState) => {
          console.log(`Changed to: ${newState}`);
          setState(newState);
        }}
      />
    );
  },
};

// A동, B동 두 개 요소만 있는 빌딩 탭 데모
export const BuildingSelect: Story = {
  args: {
    available: true,
    stateList: [],
    state: '',
    onChange: () => {},
  },
  render: (args) => {
    // A동, B동 데모용 정적 표시 문자열
    const bldgStates = ['A동', 'B동'];

    // TS2345 에러 방지를 위해 제네릭 <string> 명시
    const [state, setState] = useState<string>(bldgStates[0]);

    return (
      <ToggleSelect
        {...args}
        stateList={bldgStates}
        state={state}
        onChange={(newState) => {
          console.log(`Building changed to: ${newState}`);
          setState(newState);
        }}
      />
    );
  },
};

// 비활성화 데모 스토리
export const Disabled: Story = {
  args: {
    available: false,
    stateList: ['A동', 'B동'],
    state: 'A동',
    onChange: () => {},
  },
};
