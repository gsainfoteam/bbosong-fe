import { useState } from 'react';

import { useSearch } from '@tanstack/react-router';

import { LoginScreen, useAuth, useAuthRedirect } from '@/features/auth';

export function IdpLoginFrame() {
  const { idpLogIn } = useAuth();
  const { redirect, redirectUr } = useSearch({ from: '/auth' });
  const [isPending, setIsPending] = useState(false);

  const handleLogin = () => {
    setIsPending(true);
    useAuthRedirect.getState().setRedirect(redirect ?? redirectUr);
    idpLogIn();
  };

  return <LoginScreen onLogin={handleLogin} isPending={isPending} />;
}
