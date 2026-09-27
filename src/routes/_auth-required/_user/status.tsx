import { createFileRoute } from '@tanstack/react-router';

import { MainScreen } from '@/features/user';
import { useMainScreenViewModel } from '@/features/user/viewmodels';

export const Route = createFileRoute('/_auth-required/_user/status')({
  component: RouteComponent,
});

function RouteComponent() {
  const viewModelProps = useMainScreenViewModel();
  return <MainScreen {...viewModelProps} />;
}