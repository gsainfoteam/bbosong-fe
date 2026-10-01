import { MyMachineFrame } from '@/features/user';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth-required/_user/')({
  // beforeLoad: () => {
  //   throw redirect({
  //     to: '/status',
  //     replace: true,
  //   });
  // },
  
  component: () => (
    <div className="bg-bg h-dvh w-full px-3 py-6">
      <MyMachineFrame />
    </div>
  ),
});