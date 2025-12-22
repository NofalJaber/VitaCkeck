import axios from 'axios';
import Cookies from 'js-cookie';

const authApi = axios.create({
  baseURL: 'http://localhost:8080/api/auth', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add an interceptor to attach the token to every request automatically
// (We will use this later for protected routes)
authApi.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Users API
const usersApi = axios.create({
  baseURL: 'http://localhost:8080/api/users', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

usersApi.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { authApi, usersApi };