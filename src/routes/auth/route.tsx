import { useEffect, useState } from 'react';

import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';

import { z } from 'zod';

import { Loading } from '@/common/components';
import { useAuth, useAuthRedirect } from '@/features/auth';

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
  validateSearch: z.object({
    redirect: z
      .string()
      .min(1, 'Redirect cannot be empty')
      .refine(
        (val) => val.startsWith('/') && !val.startsWith('//'),
        'Redirect must be a relative path',
      )
      .optional(),
  }),
});

function Redirect() {
  const { redirect: redirectSearch } = Route.useSearch();
  const redirectCache = useAuthRedirect((state) => state.redirect);
  const [redirect] = useState(redirectSearch ?? redirectCache ?? '/');

  useEffect(() => {
    return () => useAuthRedirect.getState().clearRedirect();
  }, []);

  return <Navigate to={redirect} />;
}

function AuthLayout() {
  const { user } = useAuth();

  if (user === undefined) return <Loading />;
  if (user !== null) return <Redirect />;
  return <Outlet />;
}
