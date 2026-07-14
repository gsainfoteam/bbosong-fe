import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth-required/_user/mypage')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <span>My Page</span>
  );
}
