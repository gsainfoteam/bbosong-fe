import { useState } from 'react';

import { ConsentScreen } from './consent-screen';

import type { Meta, StoryObj } from '@storybook/react-vite';

function ConsentDemo({ privacy = false, tos = false }: { privacy?: boolean; tos?: boolean }) {
  const [state, setState] = useState({ privacy, tos });
  const all = state.privacy && state.tos;

  return (
    <ConsentScreen
      allChecked={all}
      onAllChange={(checked) => setState({ privacy: checked, tos: checked })}
      privacyChecked={state.privacy}
      onPrivacyChange={(checked) => setState((prev) => ({ ...prev, privacy: checked }))}
      tosChecked={state.tos}
      onTosChange={(checked) => setState((prev) => ({ ...prev, tos: checked }))}
      onPrivacyTermsClick={() => console.log('View privacy')}
      onTosTermsClick={() => console.log('View terms')}
      onSubmit={(e) => e.preventDefault()}
      isSubmitDisabled={!all}
    />
  );
}

const meta = {
  title: 'Auth/Screens/Consent',
  component: ConsentDemo,
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'phone', isRotated: false } },
} satisfies Meta<typeof ConsentDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoneChecked: Story = {};

export const PartialChecked: Story = {
  args: { privacy: true },
};

export const AllChecked: Story = {
  args: { privacy: true, tos: true },
};
