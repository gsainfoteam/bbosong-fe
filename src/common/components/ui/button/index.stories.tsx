import { QrCode } from 'lucide-react';

import { Button } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const VARIANTS = [
  'primary',
  'secondary',
  'outline',
  'danger',
  'tone-sky',
  'tone-orange',
  'text',
] as const satisfies readonly NonNullable<Button.Props['variant']>[];

const SIZES = ['l', 'm', 's'] as const satisfies readonly NonNullable<Button.Props['size']>[];

const meta = {
  title: 'Common/Button',
  component: Button,
  args: { children: '등록하기' },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-2">
      {SIZES.map((size) => (
        <Button key={size} {...args} size={size}>
          <QrCode size={17} aria-hidden />
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };

export const Loading: Story = { args: { loading: true, children: '등록 중…' } };

export const WideFloat: Story = { args: { wide: true, float: true, size: 'l' } };

export const Inverse: Story = {
  args: { variant: 'inverse', size: 'l', wide: true, children: '돌아가기' },
  decorators: [
    (Story) => (
      <div className="rounded-card bg-[#121316] p-5">
        <Story />
      </div>
    ),
  ],
};
