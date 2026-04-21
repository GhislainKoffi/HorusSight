import axios from 'axios';

/**
 * Axios client for the frontend.
 * Automatically attaches the JWT token from localStorage.
 * Base URL is /api — works with Next.js API Routes.
 */
const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  // localStorage is only available on the client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
