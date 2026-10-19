import { type Meta, type StoryObj } from '@storybook/react-vite';

import { AdminDialog } from '.';

const meta = { title: 'Admin/AdminDialog', component: AdminDialog } satisfies Meta<
  typeof AdminDialog
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { title: '기기 삭제', children: <p>이 기기를 삭제하시겠습니까?</p>, onClose: () => {} },
};
