import { TermsDetailScreen } from './terms-detail-screen';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Auth/Screens/TermsDetail',
  component: TermsDetailScreen,
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'phone', isRotated: false } },
  args: {
    title: '개인정보 처리 방침',
    termsUrl: 'https://terms.gistory.me/embedded/bbosong/privacy/260902/',
    onBack: () => console.log('Back'),
  },
} satisfies Meta<typeof TermsDetailScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Privacy: Story = {};

export const TermsOfService: Story = {
  args: {
    title: '이용 약관',
    termsUrl: 'https://terms.gistory.me/embedded/bbosong/tos/260902/',
  },
};
