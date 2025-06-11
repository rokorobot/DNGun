import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TestPage = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        setLoading(true);
        console.log('Testing connection to:', 'http://localhost:8002/test');
        
        // Use fetch API instead of axios
        const response = await fetch('http://localhost:8002/test');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        setMessage(data.message);
        setError(null);
      } catch (err) {
        console.error('Error connecting to backend:', err);
        setError('Failed to connect to backend: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    testBackendConnection();
  }, []);

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-6">Backend Connection Test</h1>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-teal"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        ) : (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p>Backend connection successful! Message: {message}</p>
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary mb-4">API Configuration</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-left overflow-auto">
            {`REACT_APP_BACKEND_URL: ${process.env.REACT_APP_BACKEND_URL || 'Not set'}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestPage;