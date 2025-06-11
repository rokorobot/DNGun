import React, { useState } from 'react';
import TransactionStatus from './TransactionStatus';
import { transactionAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TransactionModal = ({ isOpen, onClose, domain, seller }) => {
  const [transaction, setTransaction] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleInitiateTransaction = async () => {
    setProcessingPayment(true);
    setError(null);
    
    try {
      // Create transaction via real backend API
      const transactionData = {
        domain_id: domain.id,
        amount: domain.price,
        payment_method: 'credit_card'
      };
      
      const newTransaction = await transactionAPI.createTransaction(transactionData);
      
      // Simulate payment processing delay (in real app, this would be actual payment processing)
      setTimeout(() => {
        setTransaction(newTransaction);
        setProcessingPayment(false);
        
        // Start the automated transaction progression similar to Dan.com
        simulateTransactionFlow(newTransaction);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating transaction:', error);
      setError(error.response?.data?.detail || 'Failed to create transaction. Please try again.');
      setProcessingPayment(false);
    }
  };

  // Simulate Dan.com-like transaction progression
  const simulateTransactionFlow = (initialTransaction) => {
    let currentTransaction = { ...initialTransaction };
    
    // Step 1: Processing (after payment)
    setTimeout(() => {
      currentTransaction = { ...currentTransaction, status: 'processing' };
      setTransaction({ ...currentTransaction });
    }, 1000);
    
    // Step 2: Transfer initiated
    setTimeout(() => {
      currentTransaction = { ...currentTransaction, status: 'transfer_initiated' };
      setTransaction({ ...currentTransaction });
    }, 3000);
    
    // Step 3: Transfer in progress
    setTimeout(() => {
      currentTransaction = { ...currentTransaction, status: 'transfer_in_progress' };
      setTransaction({ ...currentTransaction });
    }, 5000);
    
    // Step 4: Transfer completed
    setTimeout(() => {
      currentTransaction = { ...currentTransaction, status: 'completed' };
      setTransaction({ ...currentTransaction });
      
      // Update backend transaction status (in real app, this would be done by backend services)
      updateBackendTransaction(currentTransaction.id, 'completed');
    }, 8000);
  };

  // Update backend transaction status
  const updateBackendTransaction = async (transactionId, status) => {
    try {
      await transactionAPI.completeTransaction(transactionId);
    } catch (error) {
      console.error('Error updating backend transaction:', error);
    }
  };

  const handleTransactionComplete = () => {
    // Wait a moment before closing
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  const fullDomainName = domain.extension ? `${domain.name}${domain.extension}` : domain.name;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Domain Purchase</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {!transaction ? (
          <div>
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Transaction Error</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Domain Information</h3>
              <div className="bg-light-green p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Domain Name</p>
                    <p className="font-medium">{fullDomainName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-medium">${domain.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium capitalize">{domain.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Extension</p>
                    <p className="font-medium">{domain.extension}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Payment Information</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="mb-4">
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent-teal focus:border-accent-teal"
                    defaultValue="4242 4242 4242 4242"
                    disabled={processingPayment}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent-teal focus:border-accent-teal"
                      defaultValue="12/25"
                      disabled={processingPayment}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      id="cvc"
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent-teal focus:border-accent-teal"
                      defaultValue="123"
                      disabled={processingPayment}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    id="nameOnCard"
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent-teal focus:border-accent-teal"
                    defaultValue={user?.full_name || 'John Doe'}
                    disabled={processingPayment}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Summary</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Domain Price</span>
                  <span>${domain.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Transaction Fee</span>
                  <span>${(domain.price * 0.10).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2">
                  <span>Total</span>
                  <span>${(domain.price * 1.10).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-md transition-colors duration-300 mr-2"
                disabled={processingPayment}
              >
                Cancel
              </button>
              
              <button
                onClick={handleInitiateTransaction}
                className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-2 rounded-md transition-colors duration-300 flex items-center"
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Complete Purchase'
                )}
              </button>
            </div>
          </div>
        ) : (
          <TransactionStatus 
            transaction={transaction}
            onComplete={handleTransactionComplete}
            domain={domain}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionModal;
