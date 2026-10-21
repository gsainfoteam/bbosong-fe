// @vitest-environment jsdom
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MachineCompletionDialog } from '.';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/common/components', () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} />,
}));
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
});
afterEach(cleanup);

describe('completion confirmation dialog', () => {
  it('opens with an accessible title and description, and focuses No', () => {
    render(<MachineCompletionDialog isPending={false} onConfirm={vi.fn()} onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { name: 'confirmation.title' });
    expect(dialog.getAttribute('aria-describedby')).toBe(
      screen.getByText('confirmation.description').id,
    );
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'confirmation.no' }));
  });
  it('routes Yes and No to their respective actions', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<MachineCompletionDialog isPending={false} onConfirm={onConfirm} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'confirmation.yes' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'confirmation.no' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it('handles Escape as cancellation', () => {
    const onClose = vi.fn();
    render(<MachineCompletionDialog isPending={false} onConfirm={vi.fn()} onClose={onClose} />);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it('shows loading and prevents clicks and Escape while confirming', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<MachineCompletionDialog isPending onConfirm={onConfirm} onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-busy')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'registering' }));
    fireEvent.click(screen.getByRole('button', { name: 'confirmation.no' }));
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
