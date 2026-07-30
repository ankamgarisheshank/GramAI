import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Basic Error Boundary & Refresh Logic
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
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

export default api;
