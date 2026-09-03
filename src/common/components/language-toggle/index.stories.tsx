import { useTranslation } from 'react-i18next';

import { LanguageToggle } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof LanguageToggle> = {
  title: 'Common/LanguageToggle',
  component: LanguageToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LanguageToggle>;

export const Default: Story = {};

function InContextContent() {
  const { i18n: i18nInstance } = useTranslation();

  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="text-text-secondary text-sm">
        {i18nInstance.language === 'ko'
          ? '언어 변경 버튼을 클릭하면 한국어와 영어가 전환됩니다.'
          : 'Click the language toggle button to switch between Korean and English.'}
      </div>
      <LanguageToggle />
    </div>
  );
}

export const InContext: Story = {
  render: () => <InContextContent />,
};
