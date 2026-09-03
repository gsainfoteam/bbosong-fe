import { TermsDetailScreen } from '@/features/auth';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof TermsDetailScreen> = {
  title: 'Auth/TermsDetailScreen',
  component: TermsDetailScreen,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TermsDetailScreen>;

export const Privacy: Story = {
  args: {
    title: '개인정보처리방침',
    termsUrl: 'https://terms.gistory.me/embedded/moving-out/privacy/260301/',
    onBack: () => {},
  },
};

export const TermsOfService: Story = {
  args: {
    title: '이용약관',
    termsUrl: 'https://terms.gistory.me/embedded/moving-out/tos/260301/',
    onBack: () => {},
  },
};
