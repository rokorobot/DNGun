import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../utils/api';

const TransactionStatus = ({ transaction, onComplete, domain }) => {
  const [currentTransaction, setCurrentTransaction] = useState(transaction);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setCurrentTransaction(transaction);
      
      // If transaction is completed, notify parent
      if (transaction.status === 'completed' && onComplete) {
        onComplete(transaction);
      }
    }
  }, [transaction, onComplete]);

  // Get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Payment Processing',
          color: 'bg-blue-100 text-blue-800',
          icon: 'loading',
          description: 'Your payment is being processed...'
        };
      case 'processing':
        return {
          label: 'Transaction Processing',
          color: 'bg-yellow-100 text-yellow-800',
          icon: 'loading',
          description: 'Your transaction is being processed...'
        };
      case 'transfer_initiated':
        return {
          label: 'Domain Transfer Initiated',
          color: 'bg-yellow-100 text-yellow-800',
          icon: 'loading',
          description: 'Domain transfer process has been initiated...'
        };
      case 'transfer_in_progress':
        return {
          label: 'Domain Transfer In Progress',
          color: 'bg-yellow-100 text-yellow-800',
          icon: 'loading',
          description: 'Domain is being transferred to your account...'
        };
      case 'completed':
        return {
          label: 'Transaction Completed',
          color: 'bg-green-100 text-green-800',
          icon: 'success',
          description: 'Your domain purchase has been completed successfully!'
        };
      case 'failed':
        return {
          label: 'Transaction Failed',
          color: 'bg-red-100 text-red-800',
          icon: 'error',
          description: 'There was an issue processing your transaction.'
        };
      case 'refunded':
        return {
          label: 'Transaction Refunded',
          color: 'bg-gray-100 text-gray-800',
          icon: 'info',
          description: 'Your transaction has been refunded.'
        };
      default:
        return {
          label: 'Processing',
          color: 'bg-gray-100 text-gray-800',
          icon: 'loading',
          description: 'Processing your transaction...'
        };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Format amount
  const formatAmount = (amount) => {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  // Get progress percentage based on status
  const getProgressPercentage = (status) => {
    switch (status) {
      case 'pending': return 20;
      case 'processing': return 40;
      case 'transfer_initiated': return 60;
      case 'transfer_in_progress': return 80;
      case 'completed': return 100;
      case 'failed': return 25;
      default: return 20;
    }
  };

  if (!currentTransaction) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-teal"></div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentTransaction.status);
  const fullDomainName = domain ? `${domain.name}${domain.extension}` : currentTransaction.domain_id;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Transaction Status</h2>
      
      {/* Transaction Info */}
      <div className="mb-6 bg-light-green p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Transaction ID</p>
            <p className="font-medium">{currentTransaction.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Domain</p>
            <p className="font-medium">{fullDomainName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="font-medium">{formatAmount(currentTransaction.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-medium capitalize">{currentTransaction.payment_method?.replace('_', ' ') || 'Credit Card'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Transaction Fee</p>
            <p className="font-medium">{formatAmount(currentTransaction.transaction_fee || currentTransaction.amount * 0.1)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-medium">{formatTimestamp(currentTransaction.created_at)}</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Progress Steps for Dan.com-like Experience */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Transaction Progress</h3>
        <div className="relative">
          {/* Animated Progress bar */}
          <div className="overflow-hidden h-3 mb-6 text-xs flex rounded bg-gray-200">
            <div
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-in-out bg-gradient-to-r from-accent-teal to-primary"
              style={{ width: `${getProgressPercentage(currentTransaction.status)}%` }}
            ></div>
          </div>
          
          {/* Enhanced Steps */}
          <div className="flex justify-between">
            {[
              { label: 'Payment', status: 'pending', description: 'Secure payment processing' },
              { label: 'Verification', status: 'processing', description: 'Verifying transaction details' },
              { label: 'Transfer Setup', status: 'transfer_initiated', description: 'Preparing domain transfer' },
              { label: 'Domain Transfer', status: 'transfer_in_progress', description: 'Transferring ownership' },
              { label: 'Completed', status: 'completed', description: 'Domain successfully transferred' }
            ].map((step, index) => {
              const stepStatuses = ['pending', 'processing', 'transfer_initiated', 'transfer_in_progress', 'completed'];
              const currentStepIndex = stepStatuses.indexOf(currentTransaction.status);
              const thisStepIndex = stepStatuses.indexOf(step.status);
              
              const isCompleted = currentStepIndex > thisStepIndex;
              const isActive = currentStepIndex === thisStepIndex;
              const isPending = currentStepIndex < thisStepIndex;

              return (
                <div key={index} className="flex flex-col items-center relative group">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center transition-all duration-500 ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-accent-teal text-white animate-pulse' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isActive ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-xs mt-2 text-center max-w-16">
                    <div className={`font-medium ${isActive ? 'text-accent-teal' : 'text-gray-600'}`}>
                      {step.label}
                    </div>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                    {step.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Current Status with Dan.com-style messaging */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary mb-2">Current Status</h3>
        <div className={`p-6 rounded-lg ${statusInfo.color} border-l-4 ${
          currentTransaction.status === 'completed' ? 'border-green-500' :
          currentTransaction.status === 'failed' ? 'border-red-500' :
          'border-blue-500'
        }`}>
          <div className="flex items-center mb-2">
            {statusInfo.icon === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : statusInfo.icon === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current mr-3"></div>
            )}
            <span className="text-xl font-bold">{statusInfo.label}</span>
          </div>
          <p className="text-sm mb-2">{statusInfo.description}</p>
          
          {/* Real-time updates styling */}
          {currentTransaction.status !== 'completed' && currentTransaction.status !== 'failed' && (
            <div className="mt-3 flex items-center text-sm">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse mr-2"></div>
              <span>Live updates in progress...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Transaction Summary */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Transaction Summary</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Domain Amount:</span>
            <span className="font-medium">{formatAmount(currentTransaction.amount)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Transaction Fee:</span>
            <span className="font-medium">{formatAmount(currentTransaction.transaction_fee || currentTransaction.amount * 0.1)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-800">Total Paid:</span>
            <span className="font-bold text-primary">{formatAmount(currentTransaction.amount + (currentTransaction.transaction_fee || currentTransaction.amount * 0.1))}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {currentTransaction.status === 'completed' && (
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">🎉 Congratulations!</h4>
            <p className="text-gray-700">Your domain <strong>{fullDomainName}</strong> has been successfully purchased and will be transferred to your account. You'll receive a confirmation email with next steps.</p>
          </div>
          
          <button
            onClick={() => onComplete && onComplete(currentTransaction)}
            className="bg-gradient-to-r from-accent-teal to-primary hover:from-primary hover:to-accent-teal text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Continue to Dashboard
          </button>
        </div>
      )}

      {currentTransaction.status === 'failed' && (
        <div className="mt-6 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-red-800 mb-2">❌ Transaction Failed</h4>
            <p className="text-red-700">We encountered an issue processing your transaction. Please try again or contact our support team for assistance.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-2 rounded-md transition-colors duration-300 mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => onComplete && onComplete(currentTransaction)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-md transition-colors duration-300"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionStatus;
