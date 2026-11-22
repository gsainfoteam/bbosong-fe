import { Button } from '../ui';

import { Sheet } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/Sheet',
  component: Sheet,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 고르거나 권하는 건 아래 시트. 묻는 건 가운데 다이얼로그(Modal)를 쓴다. */
export const Default: Story = {
  args: { open: true, 'aria-label': '세탁이 끝나면 알려드릴까요?' },
  render: (args) => (
    <div className="h-[480px]">
      <Sheet {...args}>
        <h2 className="text-heading mb-1">세탁이 끝나면 알려드릴까요?</h2>
        <p className="text-body text-ink2 mb-6">기기를 등록했어요. 끝나면 바로 알려 드려요.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary">나중에</Button>
          <Button>알림 받기</Button>
        </div>
      </Sheet>
    </div>
  ),
};
