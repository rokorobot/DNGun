import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    
    if (!hasConsented) {
      // Show cookie consent after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'full');
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setIsVisible(false);
  };

  const handleManageCookies = () => {
    // Could open a more detailed cookie management modal
    // For now, just setting essential cookies
    localStorage.setItem('cookieConsent', 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-lg border-t border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-start">
          <div className="mr-4 mb-3 md:mb-0 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-light-green flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary">We use cookies</h3>
            <p className="mt-1 text-sm text-gray-600">
              Our website uses cookies and similar technologies, to enable essential services and functionality on our site and to collect data on how visitors interact with our site, products, and services. By clicking 'accept all cookies', you agree to our use of these tools for advertising, analytics and support, and consent to our <a href="/privacy" className="text-accent-teal hover:underline">Privacy Policy</a>.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button 
                onClick={handleManageCookies}
                className="text-primary hover:text-accent-teal font-medium"
              >
                Manage cookies
              </button>
              <button 
                onClick={handleEssentialOnly}
                className="bg-white border border-gray-300 text-primary hover:border-accent-teal font-medium px-6 py-2 rounded-full transition-all duration-300"
              >
                Essential only
              </button>
              <button 
                onClick={handleAcceptAll}
                className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-2 rounded-full transition-all duration-300"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
