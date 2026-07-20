import { createFileRoute } from '@tanstack/react-router';

import { MypageFrame } from '@/features/user';

export const Route = createFileRoute('/_auth-required/_user/mypage')({
  component: MypageFrame,
});
