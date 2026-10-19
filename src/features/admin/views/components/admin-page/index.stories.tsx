import { type Meta, type StoryObj } from '@storybook/react-vite';

import { AdminPage } from '.';

const meta = { title: 'Admin/AdminPage', component: AdminPage } satisfies Meta<typeof AdminPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    title: '기기 관리',
    description: '등록된 세탁기와 건조기를 관리합니다.',
    children: <div>기기 목록</div>,
    onRefresh: () => {},
  },
};
export const Loading: Story = { args: { ...Default.args, isLoading: true } };
export const Error: Story = { args: { ...Default.args, isError: true } };
