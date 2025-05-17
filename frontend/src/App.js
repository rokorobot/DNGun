import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";

// Pages
import HomePage from "./pages/HomePage";
import BuyPage from "./pages/BuyPage";
import SellPage from "./pages/SellPage";
import DomainDetailPage from "./pages/DomainDetailPage";

// Mock search results page
const SearchResultsPage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');
  
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600 mb-8">This is a mock search results page. In a real implementation, this would display domains matching your search query.</p>
        <div className="bg-light-green p-8 rounded-lg text-center">
          <div className="w-16 h-16 bg-accent-teal rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">Your search for "{query}" returned no results</h3>
          <p className="text-gray-700">
            Try another search term or browse our categories to find the perfect domain.
          </p>
        </div>
      </div>
    </div>
  );
};

// Simple 404 page
const NotFoundPage = () => (
  <div className="min-h-screen bg-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-5xl font-bold text-primary mb-6">404</h1>
      <h2 className="text-2xl font-semibold text-primary-dark mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <a href="/" className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-8 py-3 rounded-full transition-all duration-300">
        Back to Homepage
      </a>
    </div>
  </div>
);

function App() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Simulate page load delay for initial animations
    setTimeout(() => {
      setIsPageLoaded(true);
    }, 300);
  }, []);

  return (
    <div className={`App transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/buy-domain" element={<BuyPage />} />
            <Route path="/sell-domain" element={<SellPage />} />
            <Route path="/domain/:domainName" element={<DomainDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <CookieConsent />
      </BrowserRouter>
    </div>
  );
}

export default App;
