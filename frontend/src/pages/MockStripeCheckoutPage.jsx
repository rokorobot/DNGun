import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../utils/paymentAPI';

const MockStripeCheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Extract session ID from URL parameter
    const sessionIdFromUrl = searchParams.get('session_id');
    
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
      fetchPaymentData(sessionIdFromUrl);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchPaymentData = async (sessionId) => {
    try {
      const data = await paymentAPI.checkPaymentStatus(sessionId);
      setPaymentData(data);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Complete the mock payment in the backend
      await paymentAPI.completeMockPayment(sessionId);
      
      // Small delay to simulate processing
      setTimeout(() => {
        // Redirect to success page with session ID
        navigate(`/payment/success?session_id=${sessionId}`);
      }, 1500);
    } catch (error) {
      console.error('Error completing mock payment:', error);
      setProcessing(false);
      // Still redirect to success page for demo, but log the error
      setTimeout(() => {
        navigate(`/payment/success?session_id=${sessionId}`);
      }, 1500);
    }
  };

  const handleCancel = () => {
    // Redirect back to domain page
    if (paymentData?.domain_name) {
      navigate(`/domain/${paymentData.domain_name}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Session Not Found</h2>
            <p className="text-gray-600 mb-6">The payment session could not be loaded.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        {/* Stripe-like Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-900">stripe</span>
          </div>
          <p className="text-sm text-gray-600">Demo Payment (Test Mode)</p>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Order Summary */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Domain:</span>
                <span className="font-medium">{paymentData.domain_name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${paymentData.amount.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-semibold text-gray-900">${paymentData.amount.toLocaleString()} {paymentData.currency.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Demo Mode</h3>
                <p className="text-sm text-blue-700">
                  This is a demonstration of the payment flow. No real payment will be processed.
                  In production, this would be handled by Stripe's secure payment system.
                </p>
              </div>
            </div>
          </div>

          {/* Mock Payment Form */}
          <form onSubmit={handlePaymentSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number (Demo)
              </label>
              <input
                type="text"
                value="4242 4242 4242 4242"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry (Demo)
                </label>
                <input
                  type="text"
                  value="12/25"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVC (Demo)
                </label>
                <input
                  type="text"
                  value="123"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  `Pay $${paymentData.amount.toLocaleString()}`
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={processing}
                className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 In production, this would be secured by Stripe's PCI-compliant payment processing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockStripeCheckoutPage;