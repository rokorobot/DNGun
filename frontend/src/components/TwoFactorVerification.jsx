import React, { useState } from 'react';
import { authAPI } from '../utils/api';

const TwoFactorVerification = ({ isOpen, onClose, onSuccess, purpose = 'verification' }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (useBackupCode && !backupCode) {
      setError('Please enter a backup code');
      return;
    }
    
    if (!useBackupCode && (!verificationCode || verificationCode.length !== 6)) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      let response;
      if (useBackupCode) {
        response = await authAPI.verifyBackupCode(backupCode);
      } else {
        response = await authAPI.verify2FA(verificationCode);
      }
      
      if (response.valid) {
        onSuccess(useBackupCode ? backupCode : verificationCode);
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">Two-Factor Authentication</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-blue-800 text-sm font-medium">
                {purpose === 'transaction' 
                  ? 'This transaction requires 2FA verification for security.'
                  : 'Please verify your identity to continue.'
                }
              </span>
            </div>
          </div>

          {!useBackupCode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit code from your authenticator app:
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={handleKeyPress}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-accent-teal"
                maxLength={6}
                autoFocus
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter backup code:
              </label>
              <input
                type="text"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="XXXX-XXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-accent-teal"
                autoFocus
              />
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setUseBackupCode(!useBackupCode)}
              className="text-sm text-accent-teal hover:text-opacity-80 underline"
            >
              {useBackupCode ? 'Use authenticator app instead' : 'Use backup code instead'}
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={isLoading || (!useBackupCode && verificationCode.length !== 6) || (useBackupCode && !backupCode)}
            className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerification;