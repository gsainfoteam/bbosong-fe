import { MypageScreen } from './mypage-screen';
import { PHONE } from './story-fixtures';

import type { Meta, StoryObj } from '@storybook/react-vite';

const log = (name: string) => () => console.log(name);

const meta = {
  title: 'User/Screens/MyPage',
  component: MypageScreen,
  parameters: { layout: 'fullscreen' },
  globals: PHONE,
  args: {
    user: {
      name: '김지스트',
      studentNumber: '20245017',
      email: 'gist@gm.gist.ac.kr',
      gender: 'male',
      role: 'user',
    },
    notification: {
      status: 'granted',
      onEnable: log('Enable notification'),
      onTurnOffHint: log('Turn off hint'),
    },
    onBack: log('Back'),
    onLogout: log('Logout'),
    onWithdraw: log('Withdraw'),
  },
} satisfies Meta<typeof MypageScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Admin: Story = {
  args: { user: { ...meta.args.user, role: 'admin' } },
};

export const NotificationOff: Story = {
  args: { notification: { ...meta.args.notification, status: 'default' } },
};

export const NeedsInstall: Story = {
  args: {
    notification: {
      ...meta.args.notification,
      status: 'needs-install',
      onInstall: log('Install'),
    },
  },
};

export const NeedsInstallIOS: Story = {
  args: {
    notification: {
      ...meta.args.notification,
      status: 'needs-install',
      installGuide:
        "Safari에서 이 페이지를 열고, 공유 버튼 → '홈 화면에 추가' → '추가'를 눌러 주세요. 설치 후 홈 화면의 앱 아이콘으로 다시 열어 주세요.",
    },
  },
};

export const NotificationDenied: Story = {
  args: { notification: { ...meta.args.notification, status: 'denied' } },
};

export const NotificationUnsupported: Story = {
  args: { notification: { ...meta.args.notification, status: 'unsupported' } },
};

export const LoggingOut: Story = {
  args: { isLoggingOut: true },
};
