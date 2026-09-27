import { createFileRoute } from '@tanstack/react-router';
import { MypageScreen } from '@/features/user';
import { useMypageScreenViewModel } from '@/features/user/viewmodels'; 

export const Route = createFileRoute('/_auth-required/_user/status')({
  component: RouteComponent,
});

function RouteComponent() {
  const viewModelProps = useMypageScreenViewModel();
  return <MypageScreen {...viewModelProps} />;
}