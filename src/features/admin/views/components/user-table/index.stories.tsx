import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Gender, UserRole } from '../../../viewmodels';

import { UserTable } from '.';

const meta = { title: 'Admin/UserTable', component: UserTable } satisfies Meta<typeof UserTable>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    currentUserUuid: '123e4567-e89b-12d3-a456-426614174000',
    onSelect: () => {},
    users: [
      {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        name: '관리자',
        email: 'admin@example.com',
        studentNumber: '20260001',
        gender: Gender.MALE,
        role: UserRole.ADMIN,
        pushSubscriptions: [
          {
            uuid: 'device-1',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
            createdAt: '2026-10-20T01:00:00Z',
            lastActivatedAt: '2026-10-20T03:15:00Z',
          },
          {
            uuid: 'device-2',
            userAgent: null,
            createdAt: '2026-10-20T02:00:00Z',
            lastActivatedAt: null,
          },
        ],
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174001',
        name: '김뽀송',
        email: 'bbosong@example.com',
        studentNumber: '20260002',
        gender: Gender.FEMALE,
        role: UserRole.USER,
        pushSubscriptions: [],
      },
    ],
  },
};
export const Empty: Story = { args: { users: [], onSelect: () => {} } };
