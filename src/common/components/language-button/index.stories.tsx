import { LanguageButton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/LanguageButton',
  component: LanguageButton,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LanguageButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
