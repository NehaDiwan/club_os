import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://club-os-3d1c.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  getUsers: () => api.get('/auth/users'),
};

export const eventService = {
  createEvent: (payload) => api.post('/events', payload),
  getEvents: () => api.get('/events'),
  updateEvent: (id, payload) => api.put(`/events/${id}`, payload),
  deleteEvent: (id, params = {}) => api.delete(`/events/${id}`, { params }),
};

export const expenseService = {
  createPrepaid: (formData) =>
    api.post('/expenses/prepaid', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createPostpaid: (formData) =>
    api.post('/expenses/postpaid', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyExpenses: () => api.get('/expenses/my'),
  getAllExpenses: (params) => api.get('/expenses/all', { params }),
  approve: (id, comment = '') => api.put(`/expenses/${id}/approve`, { comment }),
  reject: (id, comment = '') => api.put(`/expenses/${id}/reject`, { comment }),
  complete: (id, formData) =>
    api.put(`/expenses/${id}/complete`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const analyticsService = {
  getEventAnalytics: (eventId) => api.get(`/analytics/event/${eventId}`),
};

export default api;
