import { useEffect, useRef, useState } from 'react';

import { createFileRoute, Navigate, Outlet, useRouterState } from '@tanstack/react-router';

import { z } from 'zod';

import { Loading } from '@/common/components';
import { useAuth, useAuthPrompt, useAuthRedirect, useToken } from '@/features/auth';

const redirectSearchSchema = z
  .string()
  .min(1, 'Redirect cannot be empty')
  .refine(
    (val) => val.startsWith('/') && !val.startsWith('//'),
    'Redirect must be a relative path',
  );

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
  validateSearch: z.object({
    redirect: redirectSearchSchema.optional(),
    redirectUr: redirectSearchSchema.optional(),
  }),
});

function Redirect() {
  const { redirect: redirectSearch, redirectUr } = Route.useSearch();
  const redirectCache = useAuthRedirect((state) => state.redirect);
  const [redirect] = useState(redirectSearch ?? redirectUr ?? redirectCache ?? '/');

  useEffect(() => {
    return () => useAuthRedirect.getState().clearRedirect();
  }, []);

  return <Navigate to={redirect} replace />;
}

function AuthLayout() {
  const { user, idpToken, logIn, logInMutation } = useAuth();
  const token = useToken((state) => state.token);
  const { redirect: redirectSearch, redirectUr } = Route.useSearch();
  const requiredConsents = useAuthPrompt((state) => state.requiredConsents);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const attemptedIdpToken = useRef<string | null>(null);
  const redirectTarget = redirectSearch ?? redirectUr;
  const isConsentFlowRoute =
    pathname === '/auth/consent' ||
    pathname === '/auth/gender' ||
    pathname.startsWith('/auth/terms/');
  const canResumeConsentFlow =
    isConsentFlowRoute && !token && !!idpToken && !!requiredConsents;

  useEffect(() => {
    if (redirectTarget) {
      useAuthRedirect.getState().setRedirect(redirectTarget);
    }
  }, [redirectTarget]);

  // 최초 로그인은 auth 레이아웃에서 한 번만 시도한다. useAuth를 쓰는 하위 화면의
  // 각 mutation이 별도로 빈 body 로그인을 발생시키지 않도록 한다.
  useEffect(() => {
    if (!idpToken) {
      attemptedIdpToken.current = null;
      return;
    }

    if (
      !token &&
      !canResumeConsentFlow &&
      attemptedIdpToken.current !== idpToken &&
      !logInMutation.isPending
    ) {
      attemptedIdpToken.current = idpToken;
      logIn({ body: {} });
    }
  }, [
    idpToken,
    token,
    canResumeConsentFlow,
    logIn,
    logInMutation.isPending,
  ]);

  if (user === undefined) {
    if (canResumeConsentFlow) return <Outlet />;
    return <Loading />;
  }
  if (user !== null) return <Redirect />;
  return <Outlet />;
}
