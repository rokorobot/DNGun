import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-accent-teal rounded-full"></div>
        <div className="w-16 h-16 border-4 border-transparent border-t-accent-khaki rounded-full animate-spin absolute top-0 left-0"></div>
        <div className="w-16 h-16 border-4 border-transparent border-l-primary-dark rounded-full animate-spin absolute top-0 left-0" style={{ animationDuration: '1.5s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
