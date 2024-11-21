import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Replace with your actual API URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const processData = async (data: any) => {
  const response = await api.post('/bfhl', data);
  return response.data;
};

export const getOperationCode = async () => {
  const response = await api.get('/bfhl');
  return response.data;
};