import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, testUser } from '@/tests/test-utils';
import { AdminGuard } from './AdminGuard';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

describe('AdminGuard', () => {
  beforeEach(() => replace.mockReset());

  it('renders children for admins', () => {
    renderWithProviders(<AdminGuard><p>secret admin page</p></AdminGuard>, { user: { ...testUser, role: 'ADMIN' } });
    expect(screen.getByText('secret admin page')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('hides children and redirects commuters to /plan', async () => {
    renderWithProviders(<AdminGuard><p>secret admin page</p></AdminGuard>);
    expect(screen.queryByText('secret admin page')).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/plan'));
  });

  it('shows a loader and does not redirect while the session is still loading', () => {
    renderWithProviders(<AdminGuard><p>secret admin page</p></AdminGuard>, { user: null, isLoading: true });
    expect(screen.queryByText('secret admin page')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
