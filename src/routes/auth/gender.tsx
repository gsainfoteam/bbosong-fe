import { createFileRoute, Navigate } from '@tanstack/react-router';

import { useAuthContext } from 'react-oauth2-code-pkce';

import { GenderSelectFrame } from '@/features/auth';

export const Route = createFileRoute('/auth/gender')({
  component: GenderComponent,
});

function GenderComponent() {
  const { token } = useAuthContext();

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <GenderSelectFrame />;
}
