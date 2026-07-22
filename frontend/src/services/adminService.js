// Dedicated admin API client — isolated from the marketplace `api` instance.
// Uses a separate `admin_token` so the admin session never mixes with a user
// session in the same browser.
import axios from 'axios';

export const ADMIN_TOKEN_KEY = 'admin_token';
export const ADMIN_USER_KEY = 'admin_user';

// withCredentials:false — admin auth is Bearer-only, so the browser never sends
// the marketplace httpOnly cookie on admin requests (which `protect` would
// otherwise prefer over the admin Bearer token). Keeps the two sessions isolated.
const adminApi = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: false,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/admin/login')) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

const unwrap = (res) => res.data;
const fail = (error) => {
  throw error.response?.data?.message || error.message || 'Request failed';
};

const adminService = {
  async login(email, password) {
    try {
      const res = await adminApi.post('/admin/login', { email, password });
      return res.data;
    } catch (error) { return fail(error); }
  },
  async getStats() {
    try { return unwrap(await adminApi.get('/admin/stats')); } catch (e) { return fail(e); }
  },
  async getUsers(params = {}) {
    try { return unwrap(await adminApi.get('/admin/users', { params })); } catch (e) { return fail(e); }
  },
  async getWorkers(params = {}) {
    try { return unwrap(await adminApi.get('/admin/workers', { params })); } catch (e) { return fail(e); }
  },
  async getJobs(params = {}) {
    try { return unwrap(await adminApi.get('/admin/jobs', { params })); } catch (e) { return fail(e); }
  },
  async getConversations(params = {}) {
    try { return unwrap(await adminApi.get('/admin/conversations', { params })); } catch (e) { return fail(e); }
  },
  async setUserStatus(id, isActive) {
    try { return unwrap(await adminApi.patch(`/admin/users/${id}/status`, { isActive })); } catch (e) { return fail(e); }
  },
  async deleteUser(id) {
    try { return unwrap(await adminApi.delete(`/admin/users/${id}`)); } catch (e) { return fail(e); }
  },
  async moderateJob(id, status) {
    try { return unwrap(await adminApi.patch(`/admin/jobs/${id}/status`, { status })); } catch (e) { return fail(e); }
  },
};

export default adminService;
