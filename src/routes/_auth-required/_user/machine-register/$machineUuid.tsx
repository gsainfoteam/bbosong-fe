import { createFileRoute } from '@tanstack/react-router';

import { MachineRegisterFrame } from '@/features/user';

export const Route = createFileRoute('/_auth-required/_user/machine-register/$machineUuid')({
  component: MachineRegisterFrame,
});
