import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../utils/api';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting to login with email:', email);
      
      const response = await authAPI.login(email, password);
      console.log('Login response:', response);
      
      localStorage.setItem('token', response.access_token);
      
      const userData = await authAPI.getCurrentUser();
      console.log('User data retrieved:', userData);
      setUser(userData);
      
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      console.error('Login error response:', err.response);
      console.error('Login error data:', err.response?.data);
      
      // Parse error message more carefully
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.log('Final login error message:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Registering user with data:', userData);
      console.log('API URL for registration:', process.env.REACT_APP_BACKEND_URL + '/auth/register');
      
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      return response;
    } catch (err) {
      console.error('Registration error details:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      // Parse error message more carefully
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.log('Final error message:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
