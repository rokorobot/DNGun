import axios from 'axios';
import { mockAuthAPI, mockDomainAPI, mockTransactionAPI, mockUserAPI } from './mockApi';
import { paymentAPI } from './paymentAPI';

// Flag to determine if we should use mock APIs
const USE_MOCK_API = false;

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
    if (USE_MOCK_API) {
      return mockAuthAPI.login(email, password);
    }
    
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
    
    if (USE_MOCK_API) {
      return mockAuthAPI.register(userData);
    }
    
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
    if (USE_MOCK_API) {
      return mockAuthAPI.getCurrentUser();
    }
    
    const response = await api.get('/users/me');
    return response.data;
  },

  // Setup 2FA
  setup2FA: async () => {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },

  // Enable 2FA
  enable2FA: async (totpCode) => {
    const response = await api.post('/auth/2fa/enable', {
      totp_code: totpCode
    });
    return response.data;
  },

  // Verify 2FA code
  verify2FA: async (totpCode) => {
    const response = await api.post('/auth/2fa/verify', {
      totp_code: totpCode
    });
    return response.data;
  },

  // Verify backup code
  verifyBackupCode: async (backupCode) => {
    const response = await api.post('/auth/2fa/verify-backup', {
      backup_code: backupCode
    });
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (password, totpCode = null, backupCode = null) => {
    const response = await api.post('/auth/2fa/disable', {
      password,
      totp_code: totpCode,
      backup_code: backupCode
    });
    return response.data;
  },

  // Get 2FA status
  get2FAStatus: async () => {
    const response = await api.get('/auth/2fa/status');
    return response.data;
  },

  // Regenerate backup codes
  regenerateBackupCodes: async (totpCode) => {
    const response = await api.post('/auth/2fa/regenerate-backup-codes', {
      totp_code: totpCode
    });
    return response.data;
  }
};

// Domain API methods
export const domainAPI = {
  getAllDomains: async (params) => {
    if (USE_MOCK_API) {
      return mockDomainAPI.getAllDomains(params);
    }
    
    const response = await api.get('/domains', { params });
    return response.data;
  },
  
  getDomainById: async (id) => {
    if (USE_MOCK_API) {
      return mockDomainAPI.getDomainById(id);
    }
    
    const response = await api.get(`/domains/${id}`);
    return response.data;
  },
  
  getDomainByName: async (name, extension) => {
    if (USE_MOCK_API) {
      return mockDomainAPI.getDomainByName(name, extension);
    }
    
    const response = await api.get(`/domains/name/${name}/extension/${extension}`);
    return response.data;
  },
  
  searchDomains: async (query) => {
    if (USE_MOCK_API) {
      return mockDomainAPI.searchDomains(query);
    }
    
    const response = await api.get(`/domains/search`, { params: { q: query } });
    return response.data;
  },
  
  createDomain: async (domainData) => {
    if (USE_MOCK_API) {
      return mockDomainAPI.createDomain(domainData);
    }
    
    const response = await api.post('/domains', domainData);
    return response.data;
  },
};

// Transaction API methods
export const transactionAPI = {
  createTransaction: async (transactionData) => {
    if (USE_MOCK_API) {
      return mockTransactionAPI.createTransaction(transactionData);
    }
    
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },
  
  completeTransaction: async (id) => {
    if (USE_MOCK_API) {
      return mockTransactionAPI.completeTransaction(id);
    }
    
    const response = await api.put(`/transactions/${id}/complete`);
    return response.data;
  },

  updateTransactionStatus: async (id, status, message = null) => {
    if (USE_MOCK_API) {
      return mockTransactionAPI.updateTransactionStatus(id, status);
    }
    
    const response = await api.put(`/transactions/${id}/status`, {
      status,
      message
    });
    return response.data;
  },

  addTransactionChatMessage: async (id, message, senderType = 'user') => {
    if (USE_MOCK_API) {
      return mockTransactionAPI.addTransactionChatMessage(id, message, senderType);
    }
    
    const response = await api.post(`/transactions/${id}/chat`, {
      message,
      sender_type: senderType
    });
    return response.data;
  },

  getTransactionChatMessages: async (id) => {
    if (USE_MOCK_API) {
      return mockTransactionAPI.getTransactionChatMessages(id);
    }
    
    const response = await api.get(`/transactions/${id}/chat`);
    return response.data;
  },
  
  getUserTransactions: async () => {
    if (USE_MOCK_API) {
      return mockTransactionAPI.getUserTransactions();
    }
    
    const response = await api.get('/transactions');
    return response.data;
  },
};

// User API methods
export const userAPI = {
  getUserDomains: async () => {
    if (USE_MOCK_API) {
      return mockUserAPI.getUserDomains();
    }
    
    const response = await api.get('/users/me/domains');
    return response.data;
  },
  
  getUserSellingDomains: async () => {
    if (USE_MOCK_API) {
      return mockUserAPI.getUserSellingDomains();
    }
    
    const response = await api.get('/users/me/domains/selling');
    return response.data;
  },
  
  getUserOwnedDomains: async () => {
    if (USE_MOCK_API) {
      return mockUserAPI.getUserOwnedDomains();
    }
    
    const response = await api.get('/users/me/domains/owned');
    return response.data;
  },
};

export default api;
