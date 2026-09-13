import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach authorization token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fundbridge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking /api/users/me initially
      if (!error.config.url.includes('/users/me')) {
        // Only clear if token was actually invalid
        console.warn('Authentication token expired or invalid.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
