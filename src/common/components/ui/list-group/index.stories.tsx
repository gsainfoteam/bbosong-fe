import { ChevronRight } from 'lucide-react';

import { ToggleBoolean } from '../toggle-boolean';

import { ListGroup, ListRow } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/ListGroup',
  component: ListGroup,
  args: { title: '계정', children: null },
} satisfies Meta<typeof ListGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Values: Story = {
  render: (args) => (
    <ListGroup {...args}>
      <ListRow label="이름" value="김지스트" />
      <ListRow label="학번" value="20245017" />
      <ListRow label="이메일" value="gist@gm.gist.ac.kr" />
    </ListGroup>
  ),
};

export const Controls: Story = {
  args: { title: '설정' },
  render: (args) => (
    <ListGroup {...args}>
      <ListRow label="세탁 완료 알림" trailing={<ToggleBoolean state onChange={() => {}} />} />
      <ListRow
        asChild
        label="관리자 콘솔"
        trailing={<ChevronRight size={18} className="text-ink-3" aria-hidden />}
      >
        <button type="button" />
      </ListRow>
    </ListGroup>
  ),
};

export const Danger: Story = {
  args: { title: undefined },
  render: (args) => (
    <ListGroup {...args}>
      <ListRow asChild tone="danger" label="회원 탈퇴">
        <button type="button" />
      </ListRow>
    </ListGroup>
  ),
};
