import { CloudAlert, SearchX } from 'lucide-react';

import { Button } from '../ui';

import { StatusScreen } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/StatusScreen',
  component: StatusScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    icon: CloudAlert,
    title: '문제가 생겼어요',
    description: '잠시 후 다시 시도해 주세요.',
  },
} satisfies Meta<typeof StatusScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Error: Story = {
  args: {
    detail: 'Failed to fetch',
    children: (
      <>
        <Button size="l" variant="secondary">
          홈으로
        </Button>
        <Button size="l">다시 시도</Button>
      </>
    ),
  },
};

export const Retry: Story = {
  args: { children: <Button size="l">다시 시도</Button> },
};

export const NotFound: Story = {
  args: {
    icon: SearchX,
    title: '페이지를 찾을 수 없어요',
    description: '주소가 바뀌었거나 없는 페이지예요.',
    children: <Button size="l">홈으로</Button>,
  },
};
