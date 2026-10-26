import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SchemesAPI, AdminSchemesAPI } from '../lib/api';

export const useSchemes = (search?: string) => {
  return useQuery({
    queryKey: ['schemes', search],
    queryFn: async () => {
      const { data } = await SchemesAPI.list(search);
      return data.data; // assuming StandardResponse format
    },
  });
};

export const useScheme = (id: string) => {
  return useQuery({
    queryKey: ['scheme', id],
    queryFn: async () => {
      const { data } = await SchemesAPI.get(id);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useSavedSchemes = () => {
  return useQuery({
    queryKey: ['savedSchemes'],
    queryFn: async () => {
      const { data } = await SchemesAPI.getSaved();
      return data.data;
    },
  });
};

export const useSaveScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SchemesAPI.save(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSchemes'] });
    },
  });
};

export const useUnsaveScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SchemesAPI.unsave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSchemes'] });
    },
  });
};

export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data } = await SchemesAPI.getApplications();
      return data.data;
    },
  });
};

export const useApplyScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SchemesAPI.apply(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

export const useAdminSchemes = () => {
  return useQuery({
    queryKey: ['adminSchemes'],
    queryFn: async () => {
      const { data } = await AdminSchemesAPI.list();
      return data.data;
    },
  });
};

export const useCreateScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => AdminSchemesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSchemes'] });
    },
  });
};

export const useUpdateScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => AdminSchemesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSchemes'] });
    },
  });
};
