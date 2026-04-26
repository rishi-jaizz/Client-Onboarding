import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken } = res.data.data;
        Cookies.set('accessToken', accessToken, { expires: 7 });
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ─── Auth API ─────────────────────────────────────────────────
export const authAPI = {
  signup: (data: SignupData) => api.post('/auth/signup', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: ChangePasswordData) => api.post('/auth/change-password', data),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

// ─── Client API ───────────────────────────────────────────────
export const clientAPI = {
  getClient: () => api.get('/clients/me'),
  updateClient: (data: Partial<ClientUpdateData>) => api.patch('/clients/me', data),
  deleteClient: () => api.delete('/clients/me'),
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/clients/me/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Profile API ──────────────────────────────────────────────
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: Partial<ProfileData>) => api.put('/profile', data),
  getCompleteProfile: () => api.get('/profile/complete'),
};

// ─── Onboarding API ───────────────────────────────────────────
export const onboardingAPI = {
  getSteps: () => api.get('/onboarding/steps'),
  getStep: (stepNumber: number) => api.get(`/onboarding/steps/${stepNumber}`),
  updateStep: (stepNumber: number, data: StepUpdateData) => api.patch(`/onboarding/steps/${stepNumber}`, data),
  startOnboarding: () => api.post('/onboarding/start'),
  completeStep: (stepNumber: number, metadata?: Record<string, unknown>) =>
    api.post(`/onboarding/complete-step/${stepNumber}`, { metadata }),
  getProgress: () => api.get('/onboarding/progress'),
};

// ─── Document API ─────────────────────────────────────────────
export const documentAPI = {
  uploadDocument: (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    return api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getDocuments: (params?: { status?: string; documentType?: string }) =>
    api.get('/documents', { params }),
  getDocument: (id: string) => api.get(`/documents/${id}`),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
};

// ─── Types ────────────────────────────────────────────────────
export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  industry?: string;
  country?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ClientUpdateData {
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  industry: string;
  country: string;
}

export interface ProfileData {
  businessType: string;
  taxId: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bio: string;
  annualRevenue: string;
  employeeCount: string;
}

export interface StepUpdateData {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  metadata?: Record<string, unknown>;
}
