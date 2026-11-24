import { useState } from 'react';

import { Button } from '../button';

import { CoachMark, coachMarkTarget } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/CoachMark',
  component: CoachMark,
  parameters: { layout: 'fullscreen' },
  args: {
    target: 'demo-list',
    title: '지금 비어 있는 기기를 확인해요',
    description: '세탁기·건조기의 남은 시간이 실시간으로 보여요.',
    step: 1,
    total: 2,
    nextLabel: '다음',
    skipLabel: '건너뛰기',
    onNext: () => {},
    onSkip: () => {},
  },
} satisfies Meta<typeof CoachMark>;
export default meta;
type Story = StoryObj<typeof meta>;

function Page() {
  return (
    <div className="flex min-h-dvh flex-col gap-4 p-5">
      <div {...coachMarkTarget('demo-list')} className="bg-soft rounded-banner p-6">
        기기 목록
      </div>
      <div className="flex-1" />
      <Button {...coachMarkTarget('demo-button')} type="button" size="l" wide>
        QR로 빨래 등록
      </Button>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <>
      <Page />
      <CoachMark {...args} />
    </>
  ),
};

export const Above: Story = {
  args: { target: 'demo-button', step: 2, title: '내 빨래로 등록하기' },
  render: (args) => (
    <>
      <Page />
      <CoachMark {...args} />
    </>
  ),
};

export const Tour: Story = {
  render: (args) => {
    const [index, setIndex] = useState(0);
    const steps = [
      { target: 'demo-list', title: '기기 목록' },
      { target: 'demo-button', title: '내 빨래로 등록하기' },
    ];
    const current = steps[index];

    return (
      <>
        <Page />
        {current && (
          <CoachMark
            {...args}
            {...current}
            step={index + 1}
            nextLabel={index === steps.length - 1 ? '완료' : '다음'}
            onNext={() => setIndex(index + 1)}
            onSkip={() => setIndex(steps.length)}
          />
        )}
      </>
    );
  },
};
