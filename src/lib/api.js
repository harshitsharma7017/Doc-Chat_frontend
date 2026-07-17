import axios from 'axios';

// Create an Axios instance pointing to our Node.js backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
});

// Axios Interceptor: This runs automatically before EVERY request.
// If we have a JWT token saved in LocalStorage, it automatically attaches it
// to the "Authorization: Bearer <token>" header!
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
