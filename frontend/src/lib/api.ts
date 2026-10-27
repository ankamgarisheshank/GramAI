import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const clean = envUrl.trim();
    return clean.endsWith('/api/v1') ? clean : `${clean.replace(/\/$/, '')}/api/v1`;
  }
  // In production builds, default to deployed Render production backend to prevent breaking live Vercel deployments
  if (import.meta.env.PROD) {
    return 'https://gramai-backend-p44j.onrender.com/api/v1';
  }
  // Local development fallback only
  return 'http://localhost:8000/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refresh_token: refreshToken });
          if (res.data.success) {
            const newAccessToken = res.data.data.access_token;
            const newRefreshToken = res.data.data.refresh_token;
            
            localStorage.setItem('access_token', newAccessToken);
            localStorage.setItem('refresh_token', newRefreshToken);
            
            api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            processQueue(null, newAccessToken);
            return api(originalRequest);
          }
        } catch (err) {
          processQueue(err, null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export const VoiceAPI = {
  transcribe: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob);
    return api.post('/voice/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  synthesize: (text: string) => api.post('/voice/synthesize', { text }),
  chat: (query: string) => api.post('/chat', { query })
};

export const SchemesAPI = {
  list: (search?: string) => api.get('/schemes', { params: { search } }),
  get: (id: string) => api.get(`/schemes/${id}`),
  getSaved: () => api.get('/schemes/saved/me'),
  save: (id: string) => api.post(`/schemes/${id}/save`),
  unsave: (id: string) => api.delete(`/schemes/${id}/save`),
  apply: (id: string) => api.post(`/schemes/${id}/apply`),
  getApplications: () => api.get('/schemes/applications/me'),
};

export const AdminSchemesAPI = {
  list: () => api.get('/admin/schemes'),
  create: (data: any) => api.post('/admin/schemes', data),
  update: (id: string, data: any) => api.put(`/admin/schemes/${id}`, data),
};

export const AgricultureAPI = {
  getMarketPrices: () => api.get('/agriculture/market-prices'),
  getWeather: (locationId: string) => api.get(`/agriculture/weather/${locationId}`),
};

export const RecommendationsAPI = {
  get: () => api.get('/recommendations/'),
};

export const ProfilesAPI = {
  update: (data: any) => api.put('/profiles/me', data),
  get: () => api.get('/profiles/me'),
};

export const AuthAPI = {
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) => api.post('/auth/reset-password', { token, new_password }),
};

export const ApplicationsAPI = {
  create: (data: { scheme_id: string; form_data: any }) => api.post('/applications', data),
  getMyApplications: () => api.get('/applications/me'),
  getDetails: (id: string) => api.get(`/applications/${id}`),
  updateDraft: (id: string, form_data: any) => api.put(`/applications/${id}`, { form_data }),
  submit: (id: string) => api.put(`/applications/${id}/submit`),
  uploadDocument: (id: string, documentType: string, file: File) => {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    return api.post(`/applications/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getDocuments: (id: string) => api.get(`/applications/${id}/documents`),
  deleteDocument: (applicationId: string, documentId: string) => api.delete(`/applications/${applicationId}/documents/${documentId}`),
};

export const OfficerAPI = {
  getApplications: (params?: {
    status?: string;
    scheme_id?: string;
    search?: string;
    district_id?: number;
    mandal_id?: number;
    village_id?: number;
    skip?: number;
    limit?: number;
  }) => api.get('/officer/applications', { params }),
  getApplication: (applicationId: string) => api.get(`/officer/applications/${applicationId}`),
  startReview: (applicationId: string) => api.put(`/officer/applications/${applicationId}/review`),
  verifyDocument: (documentId: string, data: { verification_status: string; officer_remarks?: string }) =>
    api.put(`/officer/documents/${documentId}/verify`, data),
  approveApplication: (applicationId: string, data?: { officer_remarks?: string }) =>
    api.put(`/officer/applications/${applicationId}/approve`, data || {}),
  rejectApplication: (applicationId: string, data: { officer_remarks: string }) =>
    api.put(`/officer/applications/${applicationId}/reject`, data),
  getDocumentBlob: (documentId: string) =>
    api.get(`/officer/documents/${documentId}/file`, { responseType: 'blob' }),
};

export const AdminAPI = {
  getApplications: (params?: { status?: string; scheme_id?: string; search?: string; skip?: number; limit?: number }) =>
    api.get('/admin/applications', { params }),
};

export interface NotificationItem {
  id: number;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationsAPI = {
  list: () => api.get('/notifications/'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
};

export interface RecentApplicationSummary {
  id: string;
  application_id: string;
  scheme_name: string;
  applicant_name: string;
  status: string;
  created_at?: string;
  submitted_at?: string;
  reviewed_at?: string;
  decision_at?: string;
}

export interface MonthlyTrendItem {
  month: string;
  applications: number;
  approved: number;
}

export interface DistrictDistributionItem {
  district_name: string;
  total_applications: number;
  pending: number;
}

export interface TopSchemeEngagement {
  scheme_id?: string;
  scheme_name: string;
  views: number;
  apply_clicks: number;
}

export interface DashboardMetrics {
  total_applications: number;
  submitted_applications: number;
  under_review_applications: number;
  approved_applications: number;
  rejected_applications: number;
  draft_applications: number;
  total_schemes: number;
  active_schemes: number;
  total_users: number;
  total_citizens: number;
  total_officers: number;
  total_saved_schemes: number;
  status_counts: Record<string, number>;
  recent_applications: RecentApplicationSummary[];
  application_trends: MonthlyTrendItem[];
  district_distribution: DistrictDistributionItem[];

  // Persona Demographics
  farmer_accounts?: number;
  student_accounts?: number;
  senior_accounts?: number;
  general_citizen_accounts?: number;

  // User Activity
  registrations_today?: number;
  registrations_this_week?: number;
  registrations_this_month?: number;
  active_users_24h?: number;

  // First-Party Scheme Engagement
  total_page_views?: number;
  unique_sessions?: number;
  scheme_detail_views?: number;
  apply_clicks?: number;
  external_link_clicks?: number;
  top_viewed_schemes?: TopSchemeEngagement[];
  engagement_by_event?: Record<string, number>;
  last_updated?: string;
  tracking_started_at?: string;
}

export const AnalyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

export default api;


