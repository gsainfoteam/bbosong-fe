import { Outlet } from '@tanstack/react-router';

import { Layout } from '@/common/components/layout';
import { PostInstallPermissionSheet } from '@/features/push-notification';

export function UserLayoutFrame() {
  return (
    <Layout>
      <Outlet />
      <PostInstallPermissionSheet />
    </Layout>
  );
}
