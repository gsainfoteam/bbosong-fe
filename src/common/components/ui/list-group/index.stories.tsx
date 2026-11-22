import { ListGroup, ListRow } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/ListGroup',
  component: ListGroup,
  decorators: [
    (Story) => (
      <div className="w-[350px] bg-white p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 읽기만 하는 값 */
export const Account: Story = {
  render: () => (
    <ListGroup>
      <ListRow label="이름" value="김지스트" />
      <ListRow label="학번" value="20245017" />
      <ListRow label="성별" value="남성" />
    </ListGroup>
  ),
};

/** 누르는 줄(화살표, 버튼, 링크) */
export const Actions: Story = {
  render: () => (
    <div className="flex flex-col gap-2.5">
      <ListGroup>
        <ListRow asChild chevron label="피드백 보내기">
          <a href="https://example.com" />
        </ListRow>
        <ListRow label="로그아웃" onClick={() => {}} />
      </ListGroup>
      <ListGroup>
        <ListRow danger label="회원 탈퇴" onClick={() => {}} />
      </ListGroup>
    </div>
  ),
};
