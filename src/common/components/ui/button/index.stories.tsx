import { RefreshCw } from 'lucide-react';

import { Button } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { children: '등록하기' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'outline',
        'danger',
        'tone-washer',
        'tone-dryer',
        'text',
        'text-danger',
      ],
    },
    size: { control: 'inline-radio', options: ['l', 'm', 's'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary', children: '아니오' } };
export const Outline: Story = { args: { variant: 'outline', children: '다시 불러오기' } };
export const Danger: Story = { args: { variant: 'danger', children: '탈퇴하기' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true, children: '등록 중…' } };

/** 종류 × 상태 (M 48). 처리 중에는 글자만 바뀌고 폭은 그대로다. */
export const Matrix: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_repeat(3,10rem)] items-center gap-3">
      <span />
      <span className="text-caption text-ink2 font-bold">기본</span>
      <span className="text-caption text-ink2 font-bold">비활성</span>
      <span className="text-caption text-ink2 font-bold">처리 중</span>
      {(
        [
          ['primary', '주 버튼 · 화면당 하나', '등록하기'],
          ['secondary', '보조 · 취소/나중에', '아니오'],
          ['outline', '외곽선 · 부가 동작', '다시 불러오기'],
          ['danger', '위험 · 되돌릴 수 없을 때만', '탈퇴하기'],
        ] as const
      ).map(([variant, label, text]) => (
        <div key={variant} className="contents">
          <span className="text-label">{label}</span>
          <Button variant={variant}>{text}</Button>
          <Button variant={variant} disabled>
            {text}
          </Button>
          <Button variant={variant} loading>
            {text}
          </Button>
        </div>
      ))}
    </div>
  ),
};

/** L 56 · M 48 · S 36 */
export const Sizes: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Button size="l" className="w-full">
        QR 찍고 내 빨래 등록
      </Button>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1">
          아니오
        </Button>
        <Button className="flex-1">예</Button>
      </div>
      <div className="flex items-center gap-2">
        <Button size="s">알림 받기</Button>
        <Button size="s" variant="secondary">
          나중에
        </Button>
        <Button size="s" variant="outline">
          <RefreshCw size={14} aria-hidden />
          다시 불러오기
        </Button>
      </div>
    </div>
  ),
};

/** 색 있는 면 위에서는 같은 계열의 흰 버튼, 텍스트 버튼은 배경 없이 쓴다. */
export const OnTint: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <span className="bg-sky-tint rounded-button flex gap-2 p-2.5">
        <Button size="s" variant="tone-washer">
          허용하기
        </Button>
        <Button size="s" variant="tone-washer" disabled>
          허용하기
        </Button>
      </span>
      <span className="bg-orange-tint rounded-button flex gap-2 p-2.5">
        <Button size="s" variant="tone-dryer">
          허용하기
        </Button>
        <Button size="s" variant="tone-dryer" disabled>
          허용하기
        </Button>
      </span>
      <div className="flex gap-2">
        <Button size="s" variant="text">
          나중에
        </Button>
        <Button size="s" variant="text-danger">
          회원 탈퇴
        </Button>
      </div>
    </div>
  ),
};
