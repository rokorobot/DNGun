import React, { useState } from 'react';
import { paymentAPI } from '../utils/paymentAPI';
import LoadingSpinner from './LoadingSpinner';

const StripePaymentModal = ({ 
  isOpen, 
  onClose, 
  domain, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Initiate Stripe checkout (this will redirect to Stripe)
      await paymentAPI.initiateDomainPurchase(domain);
      
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.detail || error.message || 'Payment failed');
      setIsProcessing(false);
      
      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-primary">Secure Payment</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Domain Details */}
          <div className="bg-light-green rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-primary mb-2">Domain Purchase</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Domain:</span>
                <span className="font-medium">{domain?.name}{domain?.extension}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium capitalize">{domain?.category}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-800">Total:</span>
                <span className="text-accent-teal">${domain?.price?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-7V6a3 3 0 00-3-3H6a3 3 0 00-3 3v1" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Escrow Protection</h4>
                <p className="text-sm text-blue-700">
                  Your payment will be held securely in escrow until the domain transfer is complete. 
                  This protects both you and the seller.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Process */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-gray-800">Payment Process:</h4>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-accent-teal text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                <span>Secure payment via Stripe</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-accent-teal text-white rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                <span>Payment held in escrow</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-accent-teal text-white rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                <span>Domain transfer initiated</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-accent-teal text-white rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                <span>Payment released upon completion</span>
              </li>
            </ol>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">Payment Error</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Payment Methods */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-gray-800">Accepted Payment Methods:</h4>
            <div className="flex space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  VISA
                </div>
                <span>Visa</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  MC
                </div>
                <span>Mastercard</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                  AMEX
                </div>
                <span>American Express</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-accent-teal hover:bg-opacity-90 text-white font-medium px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Pay ${domain?.price?.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Secured by Stripe • Your payment information is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentModal;