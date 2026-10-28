'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/keys';

export const NOTIFICATION_POLL_MS = 30_000;

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: notificationsApi.list,
    refetchInterval: NOTIFICATION_POLL_MS,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}
