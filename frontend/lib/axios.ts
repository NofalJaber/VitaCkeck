import axios from 'axios';

// Auth API
const authApi = axios.create({
  baseURL: 'http://localhost:8080/api/auth',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
const userApi = axios.create({
  baseURL: 'http://localhost:8080/api/user',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tests API
const testsApi = axios.create({
  baseURL: 'http://localhost:8080/api/tests',
  withCredentials: true,
});

export { authApi, userApi, testsApi };