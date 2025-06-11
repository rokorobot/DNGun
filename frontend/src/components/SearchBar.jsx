import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { domainAPI } from '../utils/api';

const SearchBar = ({ isLarge = false, bgColor = "white" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      setIsLoading(true);
      
      try {
        // Call the backend API to search for domains
        await domainAPI.searchDomains(searchTerm.trim());
        
        // Navigate to search results page with the query parameter
        navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      } catch (error) {
        console.error('Error searching for domains:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const searchBgColor = bgColor === "white" ? "bg-white" : "bg-light-green";
  const inputClass = `w-full py-3 px-4 ${isLarge ? 'pl-6 pr-16' : 'pl-4 pr-12'} ${searchBgColor} border-2 border-gray-200 focus:border-accent-teal rounded-full focus:outline-none focus:ring-0 text-gray-900 ${isLarge ? 'text-lg' : 'text-base'}`;
  const buttonClass = `absolute inset-y-0 right-0 flex items-center ${isLarge ? 'pr-6' : 'pr-4'}`;

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        placeholder="Think of a domain name"
        className={inputClass}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        disabled={isLoading}
      />
      <div className={buttonClass}>
        <button
          type="submit"
          className="h-10 w-10 flex items-center justify-center rounded-full bg-accent-teal text-white hover:bg-opacity-90 focus:outline-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
