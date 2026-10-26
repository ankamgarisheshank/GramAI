import { useQuery } from '@tanstack/react-query';
import { AnalyticsAPI, type DashboardMetrics } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export const useAdminDashboard = () => {
  const { user, token } = useAuthStore();
  const isAdminOrOfficer = user && [1, 2, 3, 5].includes(user.role_id);

  return useQuery<DashboardMetrics>({
    queryKey: ['adminDashboard', user?.id],
    queryFn: async () => {
      const res = await AnalyticsAPI.getDashboard();
      return res.data?.data;
    },
    enabled: !!token && !!isAdminOrOfficer,
    refetchInterval: 30000, // gentle 30-second polling for live operations
    staleTime: 10000,
  });
};
