import { ConsentScreen } from '@/features/auth';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ConsentScreen> = {
  title: 'Auth/ConsentScreen',
  component: ConsentScreen,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConsentScreen>;

export const NoneChecked: Story = {
  args: {
    allChecked: false,
    onAllChange: () => {},
    privacyChecked: false,
    onPrivacyChange: () => {},
    tosChecked: false,
    onTosChange: () => {},
    onPrivacyTermsClick: () => {},
    onTosTermsClick: () => {},
    onSubmit: (e) => e.preventDefault(),
    isSubmitDisabled: true,
  },
};

export const AllChecked: Story = {
  args: {
    allChecked: true,
    onAllChange: () => {},
    privacyChecked: true,
    onPrivacyChange: () => {},
    tosChecked: true,
    onTosChange: () => {},
    onPrivacyTermsClick: () => {},
    onTosTermsClick: () => {},
    onSubmit: (e) => e.preventDefault(),
    isSubmitDisabled: false,
  },
};

export const PartialChecked: Story = {
  args: {
    allChecked: false,
    onAllChange: () => {},
    privacyChecked: true,
    onPrivacyChange: () => {},
    tosChecked: false,
    onTosChange: () => {},
    onPrivacyTermsClick: () => {},
    onTosTermsClick: () => {},
    onSubmit: (e) => e.preventDefault(),
    isSubmitDisabled: true,
  },
};
