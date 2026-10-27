import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApplicationsAPI } from '../lib/api';

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { scheme_id: string; form_data: any }) => ApplicationsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
  });
};

export const useMyApplications = () => {
  return useQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const { data } = await ApplicationsAPI.getMyApplications();
      return data.data; // StandardResponse wrap
    },
  });
};

export const useApplication = (applicationId: string) => {
  return useQuery({
    queryKey: ['application', applicationId],
    queryFn: async () => {
      const { data } = await ApplicationsAPI.getDetails(applicationId);
      return data.data; // StandardResponse wrap
    },
    enabled: !!applicationId,
  });
};

export const useUpdateApplicationDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, formData }: { applicationId: string; formData: any }) =>
      ApplicationsAPI.updateDraft(applicationId, formData),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => ApplicationsAPI.submit(applicationId),
    onSuccess: (_, applicationId) => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
      queryClient.invalidateQueries({ queryKey: ['officerApplications'] });
    },
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, documentType, file }: { applicationId: string, documentType: string, file: File }) => 
      ApplicationsAPI.uploadDocument(applicationId, documentType, file),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ['applicationDocuments', applicationId] });
    },
  });
};

export const useApplicationDocuments = (applicationId: string) => {
  return useQuery({
    queryKey: ['applicationDocuments', applicationId],
    queryFn: async () => {
      const { data } = await ApplicationsAPI.getDocuments(applicationId);
      return data; // Not standard response wrapped per my API design for this endpoint
    },
    enabled: !!applicationId,
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, documentId }: { applicationId: string, documentId: string }) => 
      ApplicationsAPI.deleteDocument(applicationId, documentId),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ['applicationDocuments', applicationId] });
    },
  });
};
