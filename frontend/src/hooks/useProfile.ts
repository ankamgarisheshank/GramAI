import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfilesAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export interface CitizenProfileData {
  id?: string;
  user_id?: string;
  full_name: string;
  age?: number | null;
  gender?: string | null;
  occupation?: string | null;
  income?: number | null;
  caste_category?: string | null;
  education?: string | null;
  land_holding_acres?: number;
  disability_status?: boolean;
  address?: string | null;
  district_id?: number | null;
  mandal_id?: number | null;
  village_id?: number | null;
  completion_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export const useProfile = () => {
  const { user, token } = useAuthStore();

  return useQuery<CitizenProfileData | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      try {
        const res = await ProfilesAPI.get();
        return res.data?.data || null;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null; // Profile doesn't exist yet
        }
        throw err;
      }
    },
    enabled: !!token && !!user?.id,
    staleTime: 30000,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: Partial<CitizenProfileData>) => {
      const res = await ProfilesAPI.update(data);
      return res.data?.data;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', user?.id], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
};
