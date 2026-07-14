import { Outlet } from '@tanstack/react-router';

import { Layout } from '@/common/components/layout';

export function UserLayoutFrame() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
