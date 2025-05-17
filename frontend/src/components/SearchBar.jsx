import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ isLarge = false, bgColor = "white" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
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
      />
      <div className={buttonClass}>
        <button
          type="submit"
          className="h-10 w-10 flex items-center justify-center rounded-full bg-accent-teal text-white hover:bg-opacity-90 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
