import { useEffect, useRef, useState } from 'react';

import { createFileRoute, Outlet, useRouter, useRouterState } from '@tanstack/react-router';

import { z } from 'zod';

import { SplashScreen } from '@/common/components';
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

/** 로그인 후 돌아갈 수 있는 경로인지 확인한다. /auth 자신으로 돌아가면 화면이 그대로 남는다 */
function isReturnPath(path: string | undefined): path is string {
  if (!path || !redirectSearchSchema.safeParse(path).success) return false;

  return !/^\/auth(?:[/?#]|$)/.test(path);
}

/** 후보 중 홈('/')이 아닌 첫 유효 경로를 고른다. 홈은 경로를 모를 때의 기본값이라 가장 낮은 우선순위다 */
function pickReturnPath(...candidates: (string | undefined)[]): string {
  return candidates.filter(isReturnPath).find((path) => path !== '/') ?? '/';
}

function Redirect() {
  const { redirect: redirectSearch, redirectUr } = Route.useSearch();
  const router = useRouter();
  const redirectCache = useAuthRedirect((state) => state.redirect);
  const [redirect] = useState(() => pickReturnPath(redirectSearch, redirectUr, redirectCache));

  useEffect(() => {
    void router.navigate({ href: redirect, replace: true });
    return () => useAuthRedirect.getState().clearRedirect();
  }, [router, redirect]);

  return <SplashScreen />;
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
  const canResumeConsentFlow = isConsentFlowRoute && !token && !!idpToken && !!requiredConsents;

  useEffect(() => {
    if (!isReturnPath(redirectTarget)) return;

    // 앱 재시작(네이티브 콜백 리로드 등)으로 `/`에서 다시 시작해 생긴 기본값이 저장해 둔 원래 경로를 덮지 않게 한다
    const { redirect: cached, setRedirect } = useAuthRedirect.getState();
    if (redirectTarget === '/' && isReturnPath(cached)) return;
    setRedirect(redirectTarget);
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
  }, [idpToken, token, canResumeConsentFlow, logIn, logInMutation.isPending]);

  if (user === undefined) {
    if (canResumeConsentFlow) return <Outlet />;
    return <SplashScreen />;
  }
  if (user !== null) return <Redirect />;
  return <Outlet />;
}
