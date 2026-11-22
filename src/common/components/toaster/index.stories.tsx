import { toast } from 'sonner';

import { Button } from '../ui';

import { Toaster } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/Toaster',
  component: Toaster,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="h-[420px] p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 토스트는 먹색 면이다. 성공은 초록 점, 실패는 빨간 점이 앞에 붙는다. */
export const Default: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <div className="flex flex-col items-start gap-2">
        <Button onClick={() => toast.success('기기를 등록하였습니다.')}>성공</Button>
        <Button
          variant="secondary"
          onClick={() => toast.error('다른 사용자에게 등록된 기기입니다.')}
        >
          실패
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success('빈 건조기 알림을 취소했어요.', {
              action: { label: '되돌리기', onClick: () => toast.success('되돌렸어요.') },
            })
          }
        >
          되돌리기 액션
        </Button>
        <Button variant="outline" onClick={() => toast('아이콘 없는 안내')}>
          일반
        </Button>
      </div>
    </>
  ),
};
