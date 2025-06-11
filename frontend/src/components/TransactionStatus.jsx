import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../utils/api';

const TransactionStatus = ({ transaction, onComplete }) => {
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
          label: 'Transaction Pending',
          color: 'bg-yellow-100 text-yellow-800',
          icon: 'loading'
        };
      case 'completed':
        return {
          label: 'Transaction Completed',
          color: 'bg-green-100 text-green-800',
          icon: 'success'
        };
      case 'failed':
        return {
          label: 'Transaction Failed',
          color: 'bg-red-100 text-red-800',
          icon: 'error'
        };
      case 'refunded':
        return {
          label: 'Transaction Refunded',
          color: 'bg-gray-100 text-gray-800',
          icon: 'info'
        };
      default:
        return {
          label: 'Unknown Status',
          color: 'bg-gray-100 text-gray-800',
          icon: 'info'
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

  if (!currentTransaction) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-teal"></div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentTransaction.status);

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
            <p className="text-sm text-gray-600">Domain ID</p>
            <p className="font-medium">{currentTransaction.domain_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="font-medium">{formatAmount(currentTransaction.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-medium capitalize">{currentTransaction.payment_method.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Transaction Fee</p>
            <p className="font-medium">{formatAmount(currentTransaction.transaction_fee)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-medium">{formatTimestamp(currentTransaction.created_at)}</p>
          </div>
        </div>
      </div>
      
      {/* Progress Steps for Domain Transfer Process */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Transaction Progress</h3>
        <div className="relative">
          {/* Progress bar */}
          <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
            <div
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                currentTransaction.status === 'completed' ? 'bg-green-500 w-full' :
                currentTransaction.status === 'pending' ? 'bg-yellow-500 w-1/2' :
                currentTransaction.status === 'failed' ? 'bg-red-500 w-1/4' :
                'bg-accent-teal w-1/4'
              }`}
            ></div>
          </div>
          
          {/* Steps */}
          <div className="flex justify-between">
            {[
              { label: 'Initiated', status: 'completed' },
              { label: 'Processing', status: currentTransaction.status === 'pending' || currentTransaction.status === 'completed' ? 'completed' : 'pending' },
              { label: 'Transfer', status: currentTransaction.status === 'completed' ? 'completed' : 'pending' },
              { label: 'Completed', status: currentTransaction.status === 'completed' ? 'completed' : 'pending' }
            ].map((step, index) => {
              const isActive = step.status === 'completed';
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`rounded-full h-6 w-6 flex items-center justify-center ${
                    isActive ? 'bg-accent-teal text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isActive ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-xs mt-1">{step.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Current Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary mb-2">Current Status</h3>
        <div className={`p-4 rounded-lg ${statusInfo.color}`}>
          <div className="flex items-center">
            {statusInfo.icon === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : statusInfo.icon === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
            )}
            <span className="font-semibold">{statusInfo.label}</span>
          </div>
          <p className="mt-1 text-sm">
            {currentTransaction.status === 'pending' && 'Your transaction is being processed. This usually takes a few minutes.'}
            {currentTransaction.status === 'completed' && 'Your domain purchase has been completed successfully!'}
            {currentTransaction.status === 'failed' && 'There was an issue processing your transaction. Please contact support.'}
            {currentTransaction.status === 'refunded' && 'Your transaction has been refunded.'}
          </p>
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
            <span className="font-medium">{formatAmount(currentTransaction.transaction_fee)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-800">Total Paid:</span>
            <span className="font-bold text-primary">{formatAmount(currentTransaction.amount + currentTransaction.transaction_fee)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {currentTransaction.status === 'completed' && (
        <div className="mt-6 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-800 mb-2">🎉 Congratulations!</h4>
            <p className="text-green-700">Your domain purchase has been completed successfully. The domain will be transferred to your account shortly.</p>
          </div>
          
          <button
            onClick={() => onComplete && onComplete(currentTransaction)}
            className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-2 rounded-md transition-colors duration-300"
          >
            Continue
          </button>
        </div>
      )}

      {currentTransaction.status === 'failed' && (
        <div className="mt-6 text-center">
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
