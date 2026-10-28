import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('shows the range and disables Previous on the first page', () => {
    render(<Pagination page={1} pageSize={10} total={25} onPageChange={vi.fn()} />);
    expect(screen.getByText(/Showing 1-10 of 25/)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('disables Next on the last page and clamps the range', () => {
    render(<Pagination page={3} pageSize={10} total={25} onPageChange={vi.fn()} />);
    expect(screen.getByText(/Showing 21-25 of 25/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('emits page changes', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageSize={10} total={25} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
  });

  it('handles an empty list', () => {
    render(<Pagination page={1} pageSize={10} total={0} onPageChange={vi.fn()} />);
    expect(screen.getByText(/Showing 0-0 of 0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('disables both buttons while busy', () => {
    render(<Pagination page={2} pageSize={10} total={30} onPageChange={vi.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });
});
