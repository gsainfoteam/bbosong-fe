import { createFileRoute } from '@tanstack/react-router';
import { QrScanFrame } from '@/features/user';

export const Route = createFileRoute('/_auth-required/_user/machine-register/')({
  component: QrScanFrame,
});
