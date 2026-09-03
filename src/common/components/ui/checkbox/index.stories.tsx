import React, { useState } from 'react';

import { Checkbox } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Checkbox> = {
  title: 'Common/UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: '체크박스 체크 상태 (제어 컴포넌트)',
    },
    defaultChecked: {
      control: 'boolean',
      description: '체크박스 초기 체크 상태 (비제어 컴포넌트)',
    },
    disabled: {
      control: 'boolean',
      description: '체크박스 비활성화 여부',
    },
    onChange: {
      action: 'changed',
      description: '체크 상태 변경 시 호출되는 콜백',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// 비제어 컴포넌트
export const Uncontrolled: Story = {
  args: {
    defaultChecked: false,
  },
};

export const UncontrolledChecked: Story = {
  args: {
    defaultChecked: true,
  },
};

// 제어 컴포넌트
export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div className="flex flex-col gap-4">
        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <div className="text-sm text-gray-600">상태: {checked ? '체크됨' : '체크 안 됨'}</div>
      </div>
    );
  },
};

export const ControlledChecked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);

    return (
      <div className="flex flex-col gap-4">
        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <div className="text-sm text-gray-600">상태: {checked ? '체크됨' : '체크 안 됨'}</div>
      </div>
    );
  },
};

// 비활성화 상태
export const Disabled: Story = {
  args: {
    disabled: true,
    checked: false,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};

// 여러 개의 체크박스
export const Multiple: Story = {
  render: () => {
    const [items, setItems] = useState([
      { id: '1', label: '옵션 1', checked: false },
      { id: '2', label: '옵션 2', checked: true },
      { id: '3', label: '옵션 3', checked: false },
    ]);

    const handleChange = (id: string) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
      );
    };

    return (
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <label key={item.id} className="flex cursor-pointer items-center gap-2">
            <Checkbox checked={item.checked} onChange={() => handleChange(item.id)} />
            <span className="text-sm">{item.label}</span>
          </label>
        ))}
      </div>
    );
  },
};

// 비제어 컴포넌트 여러 개
export const MultipleUncontrolled: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox defaultChecked={false} />
          <span className="text-sm">옵션 1</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox defaultChecked={true} />
          <span className="text-sm">옵션 2</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox defaultChecked={false} />
          <span className="text-sm">옵션 3</span>
        </label>
      </div>
    );
  },
};

// 라벨과 함께 사용
export const WithLabel: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <span className="text-sm">이용약관에 동의합니다</span>
      </label>
    );
  },
};

// htmlFor를 사용한 라벨 연결
export const WithHtmlFor: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div className="flex flex-col gap-4">
        <label htmlFor="terms-checkbox" className="flex cursor-pointer items-center gap-2">
          <Checkbox
            id="terms-checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span className="text-sm">이용약관에 동의합니다</span>
        </label>
        <div className="text-sm text-gray-600">상태: {checked ? '체크됨' : '체크 안 됨'}</div>
      </div>
    );
  },
};

// ref 사용 예제
export const WithRef: Story = {
  render: () => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    const handleFocus = () => {
      checkboxRef.current?.focus();
    };

    return (
      <div className="flex flex-col gap-4">
        <Checkbox ref={checkboxRef} defaultChecked={false} />
        <button
          type="button"
          onClick={handleFocus}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          포커스하기
        </button>
      </div>
    );
  },
};
