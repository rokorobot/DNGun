import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../utils/paymentAPI';
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('checking'); // checking, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No payment session found');
      setPaymentStatus('failed');
      return;
    }

    // Poll payment status
    handlePaymentVerification(sessionId);
  }, [searchParams]);

  const handlePaymentVerification = async (sessionId) => {
    try {
      setPaymentStatus('checking');
      
      const result = await paymentAPI.pollPaymentStatus(sessionId, 15, 1000); // 15 attempts, 1 second intervals
      
      if (result.success) {
        setPaymentData(result.status);
        setPaymentStatus('success');
        
        // Show success state for a moment, then redirect
        setTimeout(() => {
          navigate(`/domain/${result.status.domain_name || 'purchased'}`, {
            state: { paymentSuccess: true }
          });
        }, 3000);
        
      } else {
        setError(result.error || 'Payment verification failed');
        setPaymentStatus('failed');
      }
      
    } catch (error) {
      console.error('Payment verification error:', error);
      setError('Failed to verify payment');
      setPaymentStatus('failed');
    }
  };

  const renderCheckingState = () => (
    <div className="text-center">
      <LoadingSpinner />
      <h2 className="text-2xl font-bold text-primary mb-4">Verifying Your Payment</h2>
      <p className="text-gray-600 mb-6">
        Please wait while we confirm your payment with our secure payment processor...
      </p>
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-accent-teal"></div>
        <span>This usually takes just a few seconds</span>
      </div>
    </div>
  );

  const renderSuccessState = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h2>
      
      {paymentData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Purchase Details</h3>
          <div className="text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-green-700">Domain:</span>
              <span className="font-medium text-green-900">{paymentData.domain_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Amount:</span>
              <span className="font-medium text-green-900">
                ${paymentData.amount.toLocaleString()} {paymentData.currency.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Status:</span>
              <span className="font-medium text-green-900 capitalize">{paymentData.payment_status}</span>
            </div>
          </div>
        </div>
      )}
      
      <p className="text-gray-600 mb-6">
        Your domain purchase has been successfully processed! Your payment is now held securely in escrow 
        while the domain transfer is initiated.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
        <ol className="text-left text-sm text-blue-700 space-y-1">
          <li>1. 🔐 Your payment is held securely in our escrow service</li>
          <li>2. 📧 The seller will be notified to initiate domain transfer</li>
          <li>3. 🔄 You'll receive updates via our transaction chat system</li>
          <li>4. ✅ Payment is released to seller once transfer is confirmed</li>
        </ol>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">
        Redirecting you to domain details in a moment...
      </p>
    </div>
  );

  const renderFailedState = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-bold text-red-600 mb-4">Payment Issue</h2>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <p className="text-red-700 mb-4">
          {error || 'There was an issue processing your payment.'}
        </p>
        
        <div className="text-left text-sm text-red-600 space-y-1">
          <p><strong>Common reasons:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Payment was canceled during checkout</li>
            <li>Insufficient funds or payment method declined</li>
            <li>Payment session expired</li>
            <li>Technical issue with payment processor</li>
          </ul>
        </div>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-full transition-all duration-300"
        >
          Try Again
        </button>
        
        <p className="text-sm text-gray-500">
          If you continue to experience issues, please contact our support team.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-green py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {paymentStatus === 'checking' && renderCheckingState()}
          {paymentStatus === 'success' && renderSuccessState()}
          {paymentStatus === 'failed' && renderFailedState()}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;