import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth-required')({
  component: AuthRequiredLayout,
});

function AuthRequiredLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
