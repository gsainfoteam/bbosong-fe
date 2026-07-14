import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth-required/_user/map')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <span>Map</span>
  );
}
