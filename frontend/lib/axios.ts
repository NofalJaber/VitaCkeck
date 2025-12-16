import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/auth', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add an interceptor to attach the token to every request automatically
// (We will use this later for protected routes)
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;