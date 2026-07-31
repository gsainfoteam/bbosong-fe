import { useState } from 'react';

import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useTranslation } from 'react-i18next';

import { ToggleSelect } from './index';

const meta = {
  title: 'Common/ToggleSelect',
  component: ToggleSelect,
} satisfies Meta<typeof ToggleSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

// 기본 메뉴형 탭 데모 (i18n 연동)
export const Default: Story = {
  args: {
    available: true,
    stateList: [],
    state: '',
    onChange: () => {},
  },
  render: (args) => {
    const { t } = useTranslation();

    // i18n 번역 키 목록 정의
    const translatedStates = [t('nav.status'), t('nav.mypage'), t('nav.map')];

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

// A동, B동 두 개 요소만 있는 빌딩 탭 데모 (i18n 연동)
export const BuildingSelect: Story = {
  args: {
    available: true,
    stateList: [],
    state: '',
    onChange: () => {},
  },
  render: (args) => {
    const { t } = useTranslation();

    // A동, B동 번역 연동
    const bldgStates = [t('location.a'), t('location.b')];

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
