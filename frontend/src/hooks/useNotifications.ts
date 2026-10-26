import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsAPI, type NotificationItem } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export const useNotifications = () => {
  const { user, token } = useAuthStore();
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data } = await NotificationsAPI.list();
      return data?.data || [];
    },
    enabled: !!token && !!user?.id,
    refetchInterval: 15000, // gentle polling for live notification updates
  });
};

export const useUnreadNotificationCount = () => {
  const { user, token } = useAuthStore();
  return useQuery<number>({
    queryKey: ['notifications', 'unread-count', user?.id],
    queryFn: async () => {
      const { data } = await NotificationsAPI.getUnreadCount();
      return data?.data?.unread_count ?? 0;
    },
    enabled: !!token && !!user?.id,
    refetchInterval: 15000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: (id: number) => NotificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', user?.id] });
    },
  });
};
