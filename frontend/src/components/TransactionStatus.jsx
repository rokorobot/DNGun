import React, { useState, useEffect } from 'react';
import { TRANSACTION_STATES, transactionBot } from '../utils/transactionBot';

const TransactionStatus = ({ transactionId, onComplete }) => {
  const [transaction, setTransaction] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Get initial transaction state
    const initialTransaction = transactionBot.getTransaction(transactionId);
    if (initialTransaction) {
      setTransaction(initialTransaction);
      
      // Determine current step
      const stepIndex = getStepIndex(initialTransaction.state);
      setCurrentStep(stepIndex);
    }
    
    // Subscribe to transaction updates
    const unsubscribe = transactionBot.subscribe(transactionId, (update) => {
      const updatedTransaction = transactionBot.getTransaction(transactionId);
      setTransaction(updatedTransaction);
      
      // Update current step
      const stepIndex = getStepIndex(update.state);
      setCurrentStep(stepIndex);
      
      // Notify parent component when completed
      if (update.state === TRANSACTION_STATES.COMPLETED && onComplete) {
        onComplete(updatedTransaction);
      }
    });
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [transactionId, onComplete]);

  // Get step index from transaction state
  const getStepIndex = (state) => {
    const states = [
      TRANSACTION_STATES.INITIATED,
      TRANSACTION_STATES.PAYMENT_PENDING,
      TRANSACTION_STATES.PAYMENT_CONFIRMED,
      TRANSACTION_STATES.TRANSFER_INITIATED,
      TRANSACTION_STATES.TRANSFER_IN_PROGRESS,
      TRANSACTION_STATES.TRANSFER_COMPLETED,
      TRANSACTION_STATES.COMPLETED
    ];
    
    return states.indexOf(state);
  };

  // Get friendly name for transaction state
  const getStateLabel = (state) => {
    switch (state) {
      case TRANSACTION_STATES.INITIATED:
        return 'Transaction Initiated';
      case TRANSACTION_STATES.PAYMENT_PENDING:
        return 'Payment Pending';
      case TRANSACTION_STATES.PAYMENT_CONFIRMED:
        return 'Payment Confirmed';
      case TRANSACTION_STATES.TRANSFER_INITIATED:
        return 'Transfer Initiated';
      case TRANSACTION_STATES.TRANSFER_IN_PROGRESS:
        return 'Transfer In Progress';
      case TRANSACTION_STATES.TRANSFER_COMPLETED:
        return 'Transfer Completed';
      case TRANSACTION_STATES.COMPLETED:
        return 'Transaction Completed';
      case TRANSACTION_STATES.FAILED:
        return 'Transaction Failed';
      default:
        return state;
    }
  };

  if (!transaction) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-teal"></div>
      </div>
    );
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Format amount
  const formatAmount = (amount) => {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Transaction Status</h2>
      
      {/* Transaction Info */}
      <div className="mb-6 bg-light-green p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Transaction ID</p>
            <p className="font-medium">{transaction.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Domain</p>
            <p className="font-medium">{transaction.domainName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="font-medium">{formatAmount(transaction.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-medium">{transaction.paymentMethod}</p>
          </div>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="relative">
          {/* Progress bar */}
          <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
            <div
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent-teal transition-all duration-500"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            ></div>
          </div>
          
          {/* Steps */}
          <div className="flex justify-between">
            {[
              TRANSACTION_STATES.INITIATED,
              TRANSACTION_STATES.PAYMENT_CONFIRMED,
              TRANSACTION_STATES.TRANSFER_INITIATED,
              TRANSACTION_STATES.TRANSFER_COMPLETED,
              TRANSACTION_STATES.COMPLETED
            ].map((state, index) => {
              const isActive = getStepIndex(transaction.state) >= getStepIndex(state);
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`rounded-full h-6 w-6 flex items-center justify-center ${isActive ? 'bg-accent-teal text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {isActive ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-xs mt-1">{getStateLabel(state).split(' ')[0]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Current Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary mb-2">Current Status</h3>
        <div className={`p-4 rounded-lg ${
          transaction.state === TRANSACTION_STATES.COMPLETED 
            ? 'bg-green-100 text-green-800' 
            : transaction.state === TRANSACTION_STATES.FAILED
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
        }`}>
          <div className="flex items-center">
            {transaction.state === TRANSACTION_STATES.COMPLETED ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : transaction.state === TRANSACTION_STATES.FAILED ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
            )}
            <span className="font-semibold">{getStateLabel(transaction.state)}</span>
          </div>
          <p className="mt-1 text-sm">
            {transaction.history[transaction.history.length - 1].details}
          </p>
        </div>
      </div>
      
      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-semibold text-primary mb-2">Transaction History</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transaction.history.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimestamp(entry.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      entry.state === TRANSACTION_STATES.COMPLETED 
                        ? 'bg-green-100 text-green-800' 
                        : entry.state === TRANSACTION_STATES.FAILED
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getStateLabel(entry.state)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;
