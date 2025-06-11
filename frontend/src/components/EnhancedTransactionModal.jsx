import React, { useState } from 'react';
import TransactionChat from './TransactionChat';
import { transactionAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const EnhancedTransactionModal = ({ isOpen, onClose, domain, seller }) => {
  const [transaction, setTransaction] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('payment'); // payment, chat, completed
  const { user } = useAuth();

  const handleInitiateTransaction = async () => {
    setProcessingPayment(true);
    setError(null);
    
    try {
      // Create transaction via real backend API
      const transactionData = {
        domain_id: domain.id,
        amount: domain.price,
        payment_method: 'escrow_transfer'
      };
      
      const newTransaction = await transactionAPI.createTransaction(transactionData);
      
      // Add domain information to transaction for chat
      const enhancedTransaction = {
        ...newTransaction,
        domain: domain,
        seller_id: domain.seller_id,
        buyer_id: user?.id
      };
      
      setTransaction(enhancedTransaction);
      setCurrentStep('chat');
      setProcessingPayment(false);
      
    } catch (error) {
      console.error('Error creating transaction:', error);
      setError(error.response?.data?.detail || 'Failed to create transaction. Please try again.');
      setProcessingPayment(false);
    }
  };

  const handleTransactionComplete = () => {
    setCurrentStep('completed');
    setTimeout(() => {
      onClose();
    }, 5000);
  };

  const handleBotAction = (action) => {
    // Handle bot actions that might update transaction state
    console.log('Bot action:', action);
  };

  if (!isOpen) return null;

  const fullDomainName = domain.extension ? `${domain.name}${domain.extension}` : domain.name;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-primary">
            {currentStep === 'payment' && 'Domain Purchase'}
            {currentStep === 'chat' && 'Transaction in Progress'}
            {currentStep === 'completed' && 'Transaction Completed'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          {currentStep === 'payment' && (
            <div className="p-6">
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

              {/* Enhanced Secure Transaction Notice */}
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">🛡️ Secure Escrow Service</h3>
                    <p className="text-gray-700 mb-3">
                      This transaction is protected by our secure escrow service. Your payment will be held safely until the domain is successfully transferred to you.
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-2">How it works:</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        <li>1. 💰 You transfer payment to our secure escrow</li>
                        <li>2. 🔔 We notify the seller to transfer the domain</li>
                        <li>3. 📤 Seller transfers domain to DNGun</li>
                        <li>4. ✅ We verify domain ownership</li>
                        <li>5. 📥 Domain is transferred to your account</li>
                        <li>6. 💸 Payment is released to seller</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

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
                      <p className="text-sm text-gray-600">Registry</p>
                      <p className="font-medium">{getRegistryFromExtension(domain.extension)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-primary mb-4">Transaction Summary</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Domain Price</span>
                    <span>${domain.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Escrow Service Fee</span>
                    <span>${(domain.price * 0.03).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Transaction Fee</span>
                    <span>${(domain.price * 0.07).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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
                  className="bg-gradient-to-r from-accent-teal to-primary hover:from-primary hover:to-accent-teal text-white font-medium px-8 py-2 rounded-md transition-all duration-300 flex items-center"
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
                    <>
                      🛡️ Start Secure Transaction
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'chat' && transaction && (
            <div className="p-6">
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Transaction Chat Active</h3>
                    <p className="text-sm text-blue-600">Our bot will guide you through the secure transfer process</p>
                  </div>
                </div>
              </div>
              
              <TransactionChat 
                transaction={transaction}
                onBotAction={handleBotAction}
                currentUser={user}
              />
            </div>
          )}

          {currentStep === 'completed' && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">🎉 Transaction Completed!</h3>
              <p className="text-gray-600 mb-4">
                Your domain <strong>{fullDomainName}</strong> has been successfully transferred to your account.
              </p>
              <p className="text-sm text-gray-500">This window will close automatically in 5 seconds...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function getRegistryFromExtension(extension) {
    const registryMap = {
      '.com': 'Namecheap',
      '.net': 'Namecheap', 
      '.org': 'Namecheap',
      '.io': 'Namesilo',
      '.co': 'GoDaddy'
    };
    return registryMap[extension] || 'Namecheap';
  }
};

export default EnhancedTransactionModal;