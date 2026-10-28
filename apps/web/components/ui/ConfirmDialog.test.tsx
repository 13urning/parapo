import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

const setup = (props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog open title="Delete it?" description="This is permanent." confirmLabel="Yes, delete" onConfirm={onConfirm} onCancel={onCancel} {...props} />,
  );
  return { onConfirm, onCancel };
};

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    setup({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is an accessible, labelled modal dialog', () => {
    setup();
    const dialog = screen.getByRole('dialog', { name: 'Delete it?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveTextContent('This is permanent.');
  });

  it('moves focus into the dialog', () => {
    setup();
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
  });

  it('calls onConfirm and onCancel from the buttons', async () => {
    const { onConfirm, onCancel } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('cancels on Escape', async () => {
    const { onCancel } = setup();
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('traps Tab focus inside the dialog', async () => {
    setup();
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const confirm = screen.getByRole('button', { name: 'Yes, delete' });
    cancel.focus();
    await userEvent.tab();
    expect(confirm).toHaveFocus();
    await userEvent.tab();
    expect(cancel).toHaveFocus();
  });

  it('disables actions and marks the confirm button busy while loading', () => {
    setup({ loading: true });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Yes, delete/ })).toHaveAttribute('aria-busy', 'true');
  });
});
