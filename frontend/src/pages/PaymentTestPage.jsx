import React, { useState, useEffect } from 'react';
import { domainAPI } from '../utils/api';
import { paymentAPI } from '../utils/paymentAPI';
import StripePaymentModal from '../components/StripePaymentModal';
import { useAuth } from '../context/AuthContext';

const PaymentTestPage = () => {
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const domainsData = await domainAPI.getAllDomains();
        setDomains(domainsData.slice(0, 5)); // Get first 5 domains for testing
      } catch (error) {
        console.error('Error fetching domains:', error);
      }
    };

    fetchDomains();
  }, []);

  const addTestResult = (message, success = true) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      message,
      success,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testPaymentFlow = async (domain) => {
    try {
      setSelectedDomain(domain);
      setShowPaymentModal(true);
      addTestResult(`Opening payment modal for ${domain.name}${domain.extension}`);
    } catch (error) {
      addTestResult(`Error testing payment for ${domain.name}${domain.extension}: ${error.message}`, false);
    }
  };

  const handleCheckSessionStatus = async () => {
    const sessionId = prompt('Enter Stripe session ID to check:');
    if (!sessionId) return;

    try {
      const status = await paymentAPI.checkPaymentStatus(sessionId);
      addTestResult(`Payment status checked: ${status.payment_status} for ${status.domain_name}`);
    } catch (error) {
      addTestResult(`Error checking payment status: ${error.message}`, false);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-light-green py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">Payment System Test</h1>
            <p className="text-gray-600 mb-6">Please log in to test the payment system.</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">Authentication required for payment testing.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-green py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-primary mb-6">Stripe Payment Integration Test</h1>
          
          {/* Environment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Environment Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Backend URL:</span>
                <span className="ml-2 text-blue-600">{process.env.REACT_APP_BACKEND_URL}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">User ID:</span>
                <span className="ml-2 text-blue-600">{user?.id}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Frontend Origin:</span>
                <span className="ml-2 text-blue-600">{window.location.origin}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Domains Available:</span>
                <span className="ml-2 text-blue-600">{domains.length}</span>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Test Controls</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCheckSessionStatus}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Check Payment Status
              </button>
              <button
                onClick={clearTestResults}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Available Domains for Testing */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Test Payment with Domains</h2>
            {domains.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-teal mx-auto mb-4"></div>
                <p className="text-gray-600">Loading domains...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {domains.map(domain => (
                  <div key={domain.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-primary mb-2">
                      {domain.name}{domain.extension}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Price: <span className="font-medium">${domain.price.toLocaleString()}</span></p>
                      <p>Category: <span className="font-medium capitalize">{domain.category}</span></p>
                      <p>Status: <span className="font-medium capitalize">{domain.status}</span></p>
                    </div>
                    <button
                      onClick={() => testPaymentFlow(domain)}
                      disabled={domain.status !== 'available'}
                      className="w-full mt-3 bg-accent-teal hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Test Payment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Test Results</h2>
            {testResults.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                No test results yet. Click "Test Payment" on any domain above to start testing.
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                {testResults.map(result => (
                  <div key={result.id} className={`flex items-start space-x-2 mb-2 last:mb-0 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    <span className="text-xs text-gray-500 mt-0.5 w-16 flex-shrink-0">{result.timestamp}</span>
                    <span className="text-sm">{result.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Integration Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Integration Notes</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Payment amounts are fetched from backend database (security)</li>
              <li>• Success/cancel URLs are built dynamically from frontend origin</li>
              <li>• Payments are held in escrow until domain transfer completion</li>
              <li>• Payment status can be polled after Stripe redirect</li>
              <li>• Test using Stripe test card: 4242 4242 4242 4242</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedDomain && (
        <StripePaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            addTestResult(`Payment modal closed for ${selectedDomain.name}${selectedDomain.extension}`);
          }}
          domain={selectedDomain}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
            addTestResult(`Payment initiated successfully for ${selectedDomain.name}${selectedDomain.extension}`, true);
          }}
          onPaymentError={(error) => {
            addTestResult(`Payment error for ${selectedDomain.name}${selectedDomain.extension}: ${error.message}`, false);
          }}
        />
      )}
    </div>
  );
};

export default PaymentTestPage;