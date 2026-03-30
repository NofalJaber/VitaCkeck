import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Auth API
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
const userApi = axios.create({
  baseURL: `${API_BASE_URL}/api/user`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tests API
const testsApi = axios.create({
  baseURL: `${API_BASE_URL}/api/tests`,
  withCredentials: true,
});

export { authApi, userApi, testsApi };