import { createFileRoute, Navigate } from '@tanstack/react-router';

import { useAuthContext } from 'react-oauth2-code-pkce';

import { ConsentFrame, useAuthPrompt } from '@/features/auth';

export const Route = createFileRoute('/auth/consent')({
  component: ConsentComponent,
});

function ConsentComponent() {
  const { token } = useAuthContext();
  const requiredConsents = useAuthPrompt((state) => state.requiredConsents);

  if (!token || !requiredConsents) {
    return <Navigate to="/auth" replace />;
  }

  return <ConsentFrame />;
}
