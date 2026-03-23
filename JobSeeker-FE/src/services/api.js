import axios from 'axios';

const API_BASE_URL = 'http://localhost:3800';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (formData) => api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  logout: () => api.post('/auth/logout'),
};

// ─── User ──────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/user/me'),
  updateSeekerProfile: (data) => api.put('/user/seeker-profile', data),
  updateRecruiterProfile: (formData) => api.put('/user/recruiter-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.put('/user/password', data),
  getPendingRecruiters: () => api.get('/user/'),
  approveRecruiter: (id) => api.put(`/user/approve-recruiter/${id}`),
};

// ─── Job ───────────────────────────────────────────────
export const jobAPI = {
  getJobs: (params) => api.get('/job/', { params }),
  getJobById: (id) => api.get(`/job/${id}`),
  postJob: (data) => api.post('/job/', data),
  getMyJobs: (params) => api.get('/job/recruiter/my-jobs', { params }),
  getApplicants: (jobId) => api.get(`/job/${jobId}/applicants`),
};

// ─── Application ───────────────────────────────────────
export const applicationAPI = {
  apply: (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/application/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },
  getMyApplications: (params) => api.get('/application/me', { params }),
  updateStatus: (id, status) => api.put(`/application/${id}/status`, { status }),
};

// ─── Seeker ────────────────────────────────────────────
export const seekerAPI = {
  uploadCV: (formData) => api.post('/seeker/cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─── Category ──────────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/category/'),
};

export default api;
