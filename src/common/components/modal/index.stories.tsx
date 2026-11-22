import { Modal } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/Modal',
  component: Modal,
  args: {
    title: '기기를 삭제할까요?',
    description: '삭제한 기기는 되돌릴 수 없어요.',
    onConfirm: () => {},
    onClose: () => {},
  },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

// 버튼 라벨을 넘기지 않으면 확인/취소가 표시됨
export const Default: Story = {};

export const CustomLabels: Story = {
  args: { confirmText: '삭제', cancelText: '닫기' },
};

export const WithChildren: Story = {
  args: {
    description: undefined,
    children: <p className="text-sm">본문에 원하는 요소를 자유롭게 넣을 수 있어요.</p>,
  },
};

// 되돌릴 수 없는 동작은 위험 버튼으로 확인받는다
export const Danger: Story = {
  args: {
    title: '정말 탈퇴하시겠어요?',
    description: '탈퇴하면 이 계정으로 로그인할 수 없고 푸시 알림도 더 이상 받을 수 없습니다.',
    confirmText: '탈퇴하기',
    confirmVariant: 'danger',
  },
};

export const Pending: Story = { args: { isPending: true } };

// 안내만 하는 모달은 확인 버튼 하나만 보여줌
export const ConfirmOnly: Story = { args: { description: undefined, hideCancel: true } };
