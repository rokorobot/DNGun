import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
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

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  register: async (userData) => {
    console.log('API register called with:', userData);
    console.log('Full API URL:', api.defaults.baseURL + '/auth/register');
    try {
      const response = await api.post('/auth/register', userData);
      console.log('API register success:', response.data);
      return response.data;
    } catch (error) {
      console.error('API register error:', error.response || error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Domain API methods
export const domainAPI = {
  getAllDomains: async (params) => {
    const response = await api.get('/domains', { params });
    return response.data;
  },
  
  getDomainById: async (id) => {
    const response = await api.get(`/domains/${id}`);
    return response.data;
  },
  
  getDomainByName: async (name, extension) => {
    const response = await api.get(`/domains/name/${name}/extension/${extension}`);
    return response.data;
  },
  
  searchDomains: async (query) => {
    const response = await api.get(`/domains/search`, { params: { q: query } });
    return response.data;
  },
  
  createDomain: async (domainData) => {
    const response = await api.post('/domains', domainData);
    return response.data;
  },
};

// Transaction API methods
export const transactionAPI = {
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },
  
  completeTransaction: async (id) => {
    const response = await api.put(`/transactions/${id}/complete`);
    return response.data;
  },
  
  getUserTransactions: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },
};

// User API methods
export const userAPI = {
  getUserDomains: async () => {
    const response = await api.get('/users/me/domains');
    return response.data;
  },
  
  getUserSellingDomains: async () => {
    const response = await api.get('/users/me/domains/selling');
    return response.data;
  },
  
  getUserOwnedDomains: async () => {
    const response = await api.get('/users/me/domains/owned');
    return response.data;
  },
};

export default api;
