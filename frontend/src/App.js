import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import axios from 'axios';

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";

// Pages
import HomePage from "./pages/HomePage";
import BuyPage from "./pages/BuyPage";
import SellPage from "./pages/SellPage";
import DomainDetailPage from "./pages/DomainDetailPage";

// API utilities
import { domainAPI } from "./utils/api";

// Context
import { AuthProvider } from "./context/AuthContext";

// Set axios defaults
axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/api';

// Mock search results page
const SearchResultsPage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');
  
  // Generate mock search results based on the query
  const generateSearchResults = (searchQuery) => {
    if (!searchQuery) return [];
    
    const extensions = ['.com', '.net', '.org', '.io', '.co'];
    const results = [];
    
    // Generate results with the exact query
    results.push({
      id: 1,
      name: `${searchQuery}.com`,
      price: Math.floor(Math.random() * 5000) + 1000,
      category: 'premium',
      extension: '.com',
      status: 'available'
    });
    
    // Generate results with different extensions
    extensions.slice(1).forEach((ext, index) => {
      results.push({
        id: index + 2,
        name: `${searchQuery}${ext}`,
        price: Math.floor(Math.random() * 3000) + 500,
        category: 'standard',
        extension: ext,
        status: 'available'
      });
    });
    
    // Generate results with prefixes/suffixes
    const prefixes = ['get', 'my', 'the', 'best'];
    const suffixes = ['online', 'digital', 'web', 'app', 'site'];
    
    // Add prefix results
    prefixes.forEach((prefix, index) => {
      results.push({
        id: results.length + 1,
        name: `${prefix}${searchQuery}.com`,
        price: Math.floor(Math.random() * 2000) + 800,
        category: 'standard',
        extension: '.com',
        status: Math.random() > 0.3 ? 'available' : 'taken'
      });
    });
    
    // Add suffix results
    suffixes.forEach((suffix, index) => {
      results.push({
        id: results.length + 1,
        name: `${searchQuery}${suffix}.com`,
        price: Math.floor(Math.random() * 2000) + 800,
        category: 'standard',
        extension: '.com',
        status: Math.random() > 0.3 ? 'available' : 'taken'
      });
    });
    
    return results;
  };
  
  const searchResults = generateSearchResults(query);
  
  // Format price with commas and currency symbol
  const formatPrice = (price) => {
    return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-6">
            Search Results for "{query}"
          </h1>
          
          <div className="max-w-3xl">
            <form className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  defaultValue={query}
                  className="w-full py-3 px-4 pl-4 pr-12 bg-white border-2 border-gray-200 focus:border-accent-teal rounded-full focus:outline-none focus:ring-0 text-gray-900"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <button
                    type="submit"
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-accent-teal text-white hover:bg-opacity-90 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {searchResults.length > 0 ? (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">Found <span className="font-semibold">{searchResults.length}</span> domains matching your search</p>
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-gray-600">Sort by:</label>
                <select
                  id="sort"
                  className="border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-teal"
                  defaultValue="relevance"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
            
            <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((domain) => (
                    <tr key={domain.id} className="hover:bg-light-green transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-medium text-primary">{domain.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {domain.status === 'available' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Taken
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {domain.status === 'available' ? (
                          <div className="text-lg font-bold text-primary">{formatPrice(domain.price)}</div>
                        ) : (
                          <div className="text-sm text-gray-500">Make Offer</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {domain.status === 'available' ? (
                          <a href={`/domain/${domain.name}`} className="px-4 py-2 bg-accent-teal text-white text-sm rounded-full hover:bg-opacity-90 transition-colors">
                            Buy Now
                          </a>
                        ) : (
                          <a href={`/domain/${domain.name}`} className="px-4 py-2 border border-accent-teal text-accent-teal text-sm rounded-full hover:bg-light-green transition-colors">
                            Details
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-light-green rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">Looking for something specific?</h2>
              <p className="text-gray-700 mb-4">
                Our domain experts can help you find the perfect domain for your business or project.
              </p>
              <button className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-2 rounded-full transition-all duration-300">
                Contact Our Team
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-light-green p-8 rounded-lg text-center">
            <div className="w-16 h-16 bg-accent-teal rounded-full flex items-center justify-center text-white mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">Your search for "{query}" returned no results</h3>
            <p className="text-gray-700 mb-6">
              Try another search term or browse our categories to find the perfect domain.
            </p>
            <a href="/buy-domain" className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-full transition-all duration-300">
              Browse Domains
            </a>
          </div>
        )}
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
      <AuthProvider>
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
      </AuthProvider>
    </div>
  );
}

export default App;
