import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useToken } from '@/features/auth';

import { findAdminUsers } from '../models';

export function useAdminUsers() {
  const token = useToken((state) => state.token);
  const query = useQuery({
    queryKey: ['admin-users', token],
    queryFn: ({ signal }) => findAdminUsers(signal),
    enabled: !!token,
    retry: false,
  });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [pushStatus, setPushStatus] = useState('');
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data ?? []).filter(
      (user) =>
        (!role || user.role === role) &&
        (!pushStatus || user.pushSubscriptions.length > 0 === (pushStatus === 'registered')) &&
        (!term ||
          [user.name, user.email, user.studentNumber, user.uuid].some((value) =>
            value.toLowerCase().includes(term),
          )),
    );
  }, [query.data, search, role, pushStatus]);

  return {
    ...query,
    filtered,
    filters: { search, setSearch, role, setRole, pushStatus, setPushStatus },
  };
}
