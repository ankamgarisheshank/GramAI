import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OfficerAPI, AdminAPI } from '../lib/api';

export interface OfficerApplicationItem {
  id: string;
  application_id: string;
  scheme_id: string;
  scheme_name: string;
  applicant_id: string;
  applicant_name: string;
  applicant_phone?: string;
  applicant_email?: string;
  submitted_at?: string;
  reviewed_at?: string;
  decision_at?: string;
  status: string;
  district_name?: string;
  mandal_name?: string;
  village_name?: string;
  total_documents: number;
  pending_documents: number;
  verified_documents: number;
  rejected_documents: number;
  created_at: string;
}

export interface OfficerDocumentItem {
  id: string;
  application_id: string;
  document_type: string;
  original_filename: string;
  stored_filename: string;
  content_type: string;
  file_size: number;
  verification_status: string;
  officer_remarks?: string;
  uploaded_at?: string;
  verified_at?: string;
}

export interface OfficerApplicationDetailData {
  id: string;
  application_id: string;
  scheme_id: string;
  scheme: any;
  user_id: string;
  applicant_name: string;
  applicant_phone?: string;
  applicant_email?: string;
  status: string;
  assigned_officer_id?: string;
  officer_remarks?: string;
  form_data?: any;
  eligibility_result?: any;
  submitted_at?: string;
  reviewed_at?: string;
  decision_at?: string;
  created_at: string;
  district_name?: string;
  mandal_name?: string;
  village_name?: string;
  documents: OfficerDocumentItem[];
  required_document_types: string[];
}

export interface OfficerApplicationFilters {
  status?: string;
  scheme_id?: string;
  search?: string;
  district_id?: number;
  mandal_id?: number;
  village_id?: number;
  skip?: number;
  limit?: number;
}

export const useOfficerApplications = (filters?: OfficerApplicationFilters) => {
  return useQuery({
    queryKey: ['officerApplications', filters],
    queryFn: async () => {
      const res = await OfficerAPI.getApplications(filters);
      return res.data.data as OfficerApplicationItem[];
    },
  });
};

export const useOfficerApplication = (applicationId: string) => {
  return useQuery({
    queryKey: ['officerApplication', applicationId],
    queryFn: async () => {
      const res = await OfficerAPI.getApplication(applicationId);
      return res.data.data as OfficerApplicationDetailData;
    },
    enabled: !!applicationId,
  });
};

export const useStartReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applicationId: string) => {
      const res = await OfficerAPI.startReview(applicationId);
      return res.data.data;
    },
    onSuccess: (_, applicationId) => {
      queryClient.invalidateQueries({ queryKey: ['officerApplications'] });
      queryClient.invalidateQueries({ queryKey: ['officerApplication', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
};

export const useVerifyDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      documentId,
      data,
    }: {
      documentId: string;
      data: { verification_status: string; officer_remarks?: string };
    }) => {
      const res = await OfficerAPI.verifyDocument(documentId, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officerApplications'] });
      queryClient.invalidateQueries({ queryKey: ['officerApplication'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
};

export const useApproveApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      officer_remarks,
    }: {
      applicationId: string;
      officer_remarks?: string;
    }) => {
      const res = await OfficerAPI.approveApplication(applicationId, { officer_remarks });
      return res.data.data;
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ['officerApplications'] });
      queryClient.invalidateQueries({ queryKey: ['officerApplication', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
};

export const useRejectApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      officer_remarks,
    }: {
      applicationId: string;
      officer_remarks: string;
    }) => {
      const res = await OfficerAPI.rejectApplication(applicationId, { officer_remarks });
      return res.data.data;
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ['officerApplications'] });
      queryClient.invalidateQueries({ queryKey: ['officerApplication', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
};

export const useAdminApplications = (filters?: { status?: string; search?: string; scheme_id?: string }) => {
  return useQuery({
    queryKey: ['adminApplications', filters],
    queryFn: async () => {
      const res = await AdminAPI.getApplications(filters);
      return res.data.data as OfficerApplicationItem[];
    },
  });
};
