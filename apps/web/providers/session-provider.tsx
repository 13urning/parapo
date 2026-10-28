'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';
import type { FareCategory, User } from '@/lib/api/types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  fareCategory: FareCategory;
}

export interface SessionContextValue {
  user: User | null;
  isLoading: boolean;
  /** True when /auth/me answered 401 (e.g. a stale cookie). */
  isUnauthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}

/** Session state is server state: it lives in React Query and is exposed through context. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const user = await authApi.login({ email, password });
      qc.setQueryData(queryKeys.session, user);
      return user;
    },
    [qc],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const user = await authApi.register(input);
      qc.setQueryData(queryKeys.session, user);
      return user;
    },
    [qc],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      qc.clear();
    }
  }, [qc]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user: query.data ?? null,
      isLoading: query.isPending,
      isUnauthenticated: query.error instanceof ApiError && query.error.status === 401,
      login,
      register,
      logout,
    }),
    [query.data, query.isPending, query.error, login, register, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
