import { createFileRoute } from '@tanstack/react-router';

import { WasherPowerChart } from '@/common/components';

export const Route = createFileRoute('/_auth-required/_user/test')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="mx-auto max-w-5xl">
        <WasherPowerChart />
      </div>
    </div>
  );
}