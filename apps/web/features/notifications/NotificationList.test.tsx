import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notificationsApi } from '@/lib/api/endpoints';
import type { AppNotification } from '@/lib/api/types';
import { renderWithProviders } from '@/tests/test-utils';
import { NotificationBell } from './NotificationBell';
import { NotificationList } from './NotificationList';

vi.mock('@/lib/api/endpoints', () => ({
  notificationsApi: { list: vi.fn(), markRead: vi.fn(), markAllRead: vi.fn() },
}));
vi.mock('next/link', () => ({ default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a> }));

const api = vi.mocked(notificationsApi);
const n = (id: string, readAt: string | null): AppNotification => ({
  id,
  title: `Fare update ${id}`,
  body: 'New matrix published',
  url: '/fares',
  readAt,
  createdAt: '2026-10-01T08:00:00Z',
});

describe('notifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('marks one notification read and refreshes the list', async () => {
    const user = userEvent.setup();
    api.list.mockResolvedValueOnce({ items: [n('a', null), n('b', '2026-10-02T00:00:00Z')], unread: 1 });
    api.markRead.mockResolvedValue(undefined);
    renderWithProviders(<NotificationList />);

    expect(await screen.findByText('1 unread')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /mark ".*" as read/i })).toHaveLength(1);

    api.list.mockResolvedValue({ items: [n('a', '2026-10-03T00:00:00Z'), n('b', '2026-10-02T00:00:00Z')], unread: 0 });
    await user.click(screen.getByRole('button', { name: 'Mark "Fare update a" as read' }));

    await waitFor(() => expect(api.markRead).toHaveBeenCalledWith('a'));
    expect(await screen.findByText('All caught up')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark ".*" as read/i })).not.toBeInTheDocument();
  });

  it('marks everything read', async () => {
    const user = userEvent.setup();
    api.list.mockResolvedValueOnce({ items: [n('a', null), n('b', null)], unread: 2 });
    api.markAllRead.mockResolvedValue(undefined);
    renderWithProviders(<NotificationList />);

    await screen.findByText('2 unread');
    api.list.mockResolvedValue({ items: [n('a', 'x'), n('b', 'x')], unread: 0 });
    await user.click(screen.getByRole('button', { name: 'Mark all as read' }));

    await waitFor(() => expect(api.markAllRead).toHaveBeenCalledOnce());
    expect(await screen.findByText('All caught up')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
  });

  it('shows an empty state', async () => {
    api.list.mockResolvedValue({ items: [], unread: 0 });
    renderWithProviders(<NotificationList />);
    expect(await screen.findByText('No notifications yet')).toBeInTheDocument();
  });

  it('bell shows the unread count in its accessible name', async () => {
    api.list.mockResolvedValue({ items: [n('a', null)], unread: 3 });
    renderWithProviders(<NotificationBell />);
    expect(await screen.findByRole('link', { name: 'Notifications, 3 unread' })).toBeInTheDocument();
    expect(screen.getByTestId('unread-badge')).toHaveTextContent('3');
  });
});
