import React, { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const TwoFactorSetup = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('initial'); // initial, setup, verify, complete
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetup = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authAPI.setup2FA();
      setQrCode(response.setup_qr_uri);
      setBackupCodes(response.recovery_codes);
      setStep('setup');
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to setup 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await authAPI.enable2FA(verificationCode);
      setStep('complete');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dngun-backup-codes.txt';
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">
            {step === 'initial' && 'Enable Two-Factor Authentication'}
            {step === 'setup' && 'Scan QR Code'}
            {step === 'verify' && 'Verify Setup'}
            {step === 'complete' && '2FA Enabled Successfully!'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {step === 'initial' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🛡️ Enhanced Security</h3>
              <p className="text-gray-600 mb-4">
                Two-Factor Authentication adds an extra layer of security to your account, especially important for domain transactions.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">What you'll need:</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• Authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>• Your smartphone or device</li>
                  <li>• A secure place to store backup codes</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-md transition-colors mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSetup}
                disabled={isLoading}
                className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-2 rounded-md transition-colors flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Setting up...
                  </>
                ) : (
                  'Start Setup'
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'setup' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Scan QR Code</h3>
              <p className="text-gray-600 mb-4">
                Open your authenticator app and scan this QR code:
              </p>
              
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <img src={qrCode} alt="2FA QR Code" className="max-w-64 max-h-64" />
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Save Backup Codes</h4>
                <p className="text-yellow-700 mb-3">
                  Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                </p>
                
                <div className="bg-white border border-gray-200 rounded p-3 mb-3">
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="text-gray-800">{code}</div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={copyBackupCodes}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1 rounded"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={downloadBackupCodes}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1 rounded"
                  >
                    💾 Download
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Enter Verification Code</h3>
              <p className="text-gray-600 mb-4">
                Enter the 6-digit code from your authenticator app:
              </p>
              
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-accent-teal"
                maxLength={6}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setStep('initial')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-md transition-colors mr-2"
              >
                Back
              </button>
              <button
                onClick={handleVerifyAndEnable}
                disabled={isLoading || verificationCode.length !== 6}
                className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">2FA Enabled Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Your account is now protected with two-factor authentication. You'll need to enter a code from your authenticator app when signing in.
            </p>
            <p className="text-sm text-gray-500">This window will close automatically...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;