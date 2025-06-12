import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, domainAPI, authAPI } from '../utils/api';
import axios from 'axios';

const APITestPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const addResult = (test, success, data, error = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      data: success ? data : null,
      error: error || (success ? null : 'Failed'),
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testDirectLogin = async () => {
    try {
      setLoading(true);
      addResult('Direct Login Test Started', true, 'Testing login with debug info');
      
      const result = await authAPI.login(loginForm.email, loginForm.password);
      addResult('Direct Login', true, `Token received: ${result.access_token?.substring(0, 20)}...`);
    } catch (error) {
      addResult('Direct Login', false, null, `${error.message} - Status: ${error.response?.status}`);
    } finally {
      setLoading(false);
    }
  };

  const runAPITests = async () => {
    setLoading(true);
    setTestResults([]);

    // Test 1: Environment variables
    addResult('Environment Check', true, `REACT_APP_BACKEND_URL: ${process.env.REACT_APP_BACKEND_URL}`);

    // Test 2: Get all domains (public API)
    try {
      const domains = await domainAPI.getAllDomains();
      addResult('Get All Domains', true, `Found ${domains.length} domains`);
    } catch (error) {
      addResult('Get All Domains', false, null, error.message);
    }

    // Test 3: Direct API call test
    try {
      const directResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/domains`);
      addResult('Direct API Call', true, `Direct call successful: ${directResponse.data.length} domains`);
    } catch (error) {
      addResult('Direct API Call', false, null, `${error.message} - URL: ${error.config?.url}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    // Auto-run tests when component mounts
    runAPITests();
  }, []);

  return (
    <div className="min-h-screen bg-light-green py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-primary mb-6">API Debug & Test Page</h1>
          
          {/* Environment Debug */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">🔍 Environment Debug</h2>
            <div className="text-sm space-y-1">
              <div><strong>REACT_APP_BACKEND_URL:</strong> {process.env.REACT_APP_BACKEND_URL || 'NOT SET'}</div>
              <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</div>
              <div><strong>Window Origin:</strong> {window.location.origin}</div>
              <div><strong>Current Path:</strong> {window.location.pathname}</div>
            </div>
          </div>

          {/* Login Test Form */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">🔐 Direct Login Test</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({...prev, email: e.target.value}))}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({...prev, password: e.target.value}))}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={testDirectLogin}
                disabled={loading || !loginForm.email || !loginForm.password}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded"
              >
                Test Login
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Test credentials: rokoroko@seznam.cz / testpassword123
            </p>
          </div>

          {/* Test Controls */}
          <div className="mb-6">
            <button
              onClick={runAPITests}
              disabled={loading}
              className="bg-accent-teal hover:bg-opacity-90 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition-colors mr-4"
            >
              {loading ? 'Running Tests...' : 'Run API Tests'}
            </button>
            <button
              onClick={() => setTestResults([])}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Clear Results
            </button>
          </div>

          {/* Test Results */}
          <div>
            <h2 className="text-xl font-semibold mb-4">📊 Test Results</h2>
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`text-lg ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.success ? '✅' : '❌'}
                        </span>
                        <span className="font-medium">{result.test}</span>
                      </div>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    {result.data && (
                      <p className="mt-2 text-sm text-green-700">{result.data}</p>
                    )}
                    {result.error && (
                      <p className="mt-2 text-sm text-red-700">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Browser Console Notice */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">🔍 Debug Console</h3>
            <p className="text-sm text-gray-600">
              Check browser console (F12) for detailed API debug logs including URLs, headers, and responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITestPage;