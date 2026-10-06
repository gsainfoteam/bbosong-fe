import { MypageScreen } from './mypage-screen';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/MyPageScreen',
  component: MypageScreen,
} satisfies Meta<typeof MypageScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      name: '홍길동',
      studentNumber: '20261234',
      email: 'bbosong@gm.gist.ac.kr',
      gender: 'male',
    },
    onLogout: () => console.log('로그아웃 실행'),
  },
};
