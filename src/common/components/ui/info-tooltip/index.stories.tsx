import { type Meta, type StoryObj } from '@storybook/react-vite';

import { InfoTooltip } from './index';

const meta = {
  title: 'Common/InfoTooltip',
  component: InfoTooltip,
} satisfies Meta<typeof InfoTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '알림 신청',
    content: '그날 알림 신청에 성공한 건수입니다.',
  },
  render: (args) => (
    <div className="flex items-center gap-2 pt-16 text-sm">
      <span>알림 신청</span>
      <InfoTooltip {...args} />
    </div>
  ),
};
