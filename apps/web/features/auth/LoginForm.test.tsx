import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/lib/api/errors';
import { renderWithProviders, testUser } from '@/tests/test-utils';
import { LoginForm } from './LoginForm';

const replace = vi.fn();
const refresh = vi.fn();
let search = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(search),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    replace.mockReset();
    refresh.mockReset();
    search = '';
  });

  it('shows the demo accounts hint', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByText(/demo accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@parapo\.local/)).toBeInTheDocument();
    expect(screen.getByText(/juan@parapo\.local/)).toBeInTheDocument();
  });

  it('validates required fields and email format without calling the API', async () => {
    const user = userEvent.setup();
    const { session } = renderWithProviders(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'x');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(session.login).not.toHaveBeenCalled();
  });

  it('submits credentials and redirects to the safe next path', async () => {
    search = 'next=%2Ftrips';
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(testUser);
    renderWithProviders(<LoginForm />, { login });

    await user.type(screen.getByLabelText('Email'), 'juan@parapo.local');
    await user.type(screen.getByLabelText('Password'), 'Commuter#2026');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(login).toHaveBeenCalledWith('juan@parapo.local', 'Commuter#2026'));
    expect(replace).toHaveBeenCalledWith('/trips');
  });

  it('ignores open-redirect next values', async () => {
    search = 'next=%2F%2Fevil.example';
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />, { login: vi.fn().mockResolvedValue(testUser) });
    await user.type(screen.getByLabelText('Email'), 'a@b.co');
    await user.type(screen.getByLabelText('Password'), 'pw');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/plan'));
  });

  it('shows the generic server error on failed login', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new ApiError(401, 'Invalid email or password'));
    renderWithProviders(<LoginForm />, { login });

    await user.type(screen.getByLabelText('Email'), 'a@b.co');
    await user.type(screen.getByLabelText('Password'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(replace).not.toHaveBeenCalled();
  });

  it('fills the demo credentials from the hint', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    await user.click(screen.getByRole('button', { name: /fill in admin credentials/i }));
    expect(screen.getByLabelText('Email')).toHaveValue('admin@parapo.local');
    expect(screen.getByLabelText('Password')).toHaveValue('Admin#2026');
  });
});
