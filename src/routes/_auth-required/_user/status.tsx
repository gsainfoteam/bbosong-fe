import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth-required/_user/status')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <span>Status</span>
  );
}
