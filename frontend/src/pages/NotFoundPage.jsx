import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen bg-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-5xl font-bold text-primary mb-6">404</h1>
      <h2 className="text-2xl font-semibold text-primary-dark mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <Link to="/" className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-8 py-3 rounded-full transition-all duration-300 inline-block">
        Back to Homepage
      </Link>
    </div>
  </div>
);

export default NotFoundPage;