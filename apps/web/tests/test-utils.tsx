import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { SessionContext, type SessionContextValue } from '@/providers/session-provider';
import type { User } from '@/lib/api/types';

export const testUser: User = {
  id: 'u1',
  name: 'Juan',
  email: 'juan@parapo.local',
  role: 'COMMUTER',
  fareCategory: 'STUDENT',
  createdAt: '2026-01-01T00:00:00Z',
};

export function renderWithProviders(ui: ReactElement, session: Partial<SessionContextValue> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const value: SessionContextValue = {
    user: testUser,
    isLoading: false,
    isUnauthenticated: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    ...session,
  };
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
    </QueryClientProvider>
  );
  return { ...render(ui, { wrapper: Wrapper }), client, session: value };
}
