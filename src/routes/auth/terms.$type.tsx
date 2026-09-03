import { createFileRoute } from '@tanstack/react-router';

import { z } from 'zod';

import { TermsDetailFrame } from '@/features/auth';

export const Route = createFileRoute('/auth/terms/$type')({
  component: TermsDetailFrame,
  params: z.object({
    type: z.enum(['privacy', 'tos']),
  }),
  validateSearch: z.object({
    version: z.string().length(6, 'Version must be 6 characters long'),
  }),
});
