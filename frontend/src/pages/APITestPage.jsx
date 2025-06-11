import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, domainAPI } from '../utils/api';

const APITestPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, data, error = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      data: success ? data : null,
      error: error || (success ? null : 'Failed'),
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runAPITests = async () => {
    setLoading(true);
    setTestResults([]);

    // Test 1: Get all domains (public API)
    try {
      const domains = await domainAPI.getAllDomains();
      addResult('Get All Domains', true, `Found ${domains.length} domains`);
    } catch (error) {
      addResult('Get All Domains', false, null, error.message);
    }

    // Test 2: Get current user info (requires auth)
    if (isAuthenticated) {
      try {
        const userInfo = await userAPI.getUserDomains();
        addResult('Get User Domains', true, `User has ${userInfo.length} domains`);
      } catch (error) {
        addResult('Get User Domains', false, null, error.message);
      }

      try {
        const userData = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        if (userData.ok) {
          const userJson = await userData.json();
          addResult('Get User Info', true, `User: ${userJson.username}`);
        } else {
          addResult('Get User Info', false, null, `HTTP ${userData.status}`);
        }
      } catch (error) {
        addResult('Get User Info', false, null, error.message);
      }
    } else {
      addResult('Authentication Check', false, null, 'User not authenticated');
    }

    // Test 3: Test specific domain
    try {
      const domain = await domainAPI.getDomainByName('shopease', '.com');
      addResult('Get Specific Domain', true, `${domain.name}${domain.extension} - ${domain.status}`);
    } catch (error) {
      addResult('Get Specific Domain', false, null, error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    // Auto-run tests when component mounts
    runAPITests();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-light-green py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-primary mb-6">API Connectivity Test</h1>
          
          {/* User Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Authenticated:</span> 
                <span className={`ml-2 ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">User:</span> 
                <span className="ml-2">{user?.username || 'None'}</span>
              </div>
              <div>
                <span className="font-medium">Token:</span> 
                <span className="ml-2">{localStorage.getItem('token') ? 'Present' : 'Missing'}</span>
              </div>
              <div>
                <span className="font-medium">Backend URL:</span> 
                <span className="ml-2 text-xs">{process.env.REACT_APP_BACKEND_URL}</span>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-6">
            <button
              onClick={runAPITests}
              disabled={loading}
              className="bg-accent-teal hover:bg-opacity-90 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {loading ? 'Running Tests...' : 'Run API Tests'}
            </button>
          </div>

          {/* Test Results */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Click "Run API Tests" to start.</p>
            ) : (
              <div className="space-y-3">
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

          {/* Debug Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <div className="text-xs space-y-1">
              <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
              <div><strong>Backend URL:</strong> {process.env.REACT_APP_BACKEND_URL}</div>
              <div><strong>Window Origin:</strong> {window.location.origin}</div>
              <div><strong>Current Path:</strong> {window.location.pathname}</div>
              <div><strong>Local Storage Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITestPage;