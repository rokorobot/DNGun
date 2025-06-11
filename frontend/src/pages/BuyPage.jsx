import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import DomainCard from '../components/DomainCard';
import { domainCategories } from '../data/domains';
import { domainAPI } from '../utils/api';

const BuyPage = () => {
  const [allDomains, setAllDomains] = useState([]);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setIsLoading(true);
        const domains = await domainAPI.getAllDomains();
        setAllDomains(domains);
        setFilteredDomains(domains);
      } catch (error) {
        console.error('Error fetching domains:', error);
        setAllDomains([]);
        setFilteredDomains([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomains();
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredDomains(allDomains);
    } else {
      const filtered = allDomains.filter(domain => domain.category === filter);
      setFilteredDomains(filtered);
    }
  };

  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    setSortOption(sortValue);
    
    let sortedDomains = [...filteredDomains];
    
    switch(sortValue) {
      case 'price-low':
        sortedDomains.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedDomains.sort((a, b) => b.price - a.price);
        break;
      case 'alphabetical':
        sortedDomains.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        sortedDomains.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
    
    setFilteredDomains(sortedDomains);
  };

  const handlePriceRangeChange = (e, index) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(e.target.value);
    setPriceRange(newPriceRange);
    
    const filtered = allDomains.filter(domain => {
      const matchesCategory = activeFilter === 'all' || domain.category === activeFilter;
      const matchesPrice = domain.price >= newPriceRange[0] && domain.price <= newPriceRange[1];
      return matchesCategory && matchesPrice;
    });
    
    setFilteredDomains(filtered);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Find Your Perfect Domain Name</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Search our extensive collection of premium domains to establish your online presence.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar isLarge={true} bgColor="light" />
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="w-full h-16 md:h-24 bg-primary relative overflow-hidden">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 25.6831L60 19.2623C120 12.8416 240 0 360 0C480 0 600 12.8416 720 28.9869C840 45.1321 960 64.6618 1080 70.7962C1200 77.1238 1320 70.8893 1380 67.7721L1440 64.6618V138H1380C1320 138 1200 138 1080 138C960 138 840 138 720 138C600 138 480 138 360 138C240 138 120 138 60 138H0V25.6831Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Domain Listing Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-1/4">
              <div className="bg-light-green rounded-lg p-6 sticky top-6">
                <h3 className="text-xl font-semibold text-primary mb-4">Filters</h3>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-primary mb-2">Category</h4>
                  <div className="space-y-2">
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeFilter === 'all' ? 'bg-accent-teal text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => handleFilterChange('all')}
                    >
                      All Domains
                    </button>
                    {domainCategories.map(category => (
                      <button
                        key={category.id}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeFilter === category.name.toLowerCase().replace(/[^a-z0-9]/g, '-') ? 'bg-accent-teal text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => handleFilterChange(category.name.toLowerCase().replace(/\s+/g, '-').replace('3-', 'three-'))}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-primary mb-2">Price Range</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Minimum: ${priceRange[0]}</label>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="500"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceRangeChange(e, 0)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Maximum: ${priceRange[1]}</label>
                      <input
                        type="range"
                        min="1000"
                        max="30000"
                        step="500"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(e, 1)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Domain Extension Filter (could be expanded) */}
                <div>
                  <h4 className="font-medium text-primary mb-2">Domain Extension</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-accent-teal" checked={true} readOnly />
                      <span className="ml-2 text-gray-700">.com</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-accent-teal" checked={true} readOnly />
                      <span className="ml-2 text-gray-700">.io</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-accent-teal" checked={true} readOnly />
                      <span className="ml-2 text-gray-700">.co</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-accent-teal" />
                      <span className="ml-2 text-gray-700">.net</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-accent-teal" />
                      <span className="ml-2 text-gray-700">.org</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full lg:w-3/4">
              {/* Sort and Results Info */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <p className="text-gray-600 mb-4 sm:mb-0">
                  {isLoading ? 'Loading...' : `Showing ${filteredDomains.length} domains`}
                </p>
                <div className="flex items-center">
                  <label htmlFor="sort" className="mr-2 text-gray-600">Sort by:</label>
                  <select
                    id="sort"
                    className="border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-teal"
                    value={sortOption}
                    onChange={handleSortChange}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price (Low to High)</option>
                    <option value="price-high">Price (High to Low)</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>
              
              {/* Loading State */}
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-teal"></div>
                </div>
              ) : (
                <>
                  {/* Domain Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDomains.map(domain => (
                      <DomainCard key={domain.id} domain={domain} />
                    ))}
                  </div>

                  {/* Empty State */}
                  {filteredDomains.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-light-green rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-primary mb-2">No domains found</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Try adjusting your filters or search criteria to find domains that match your needs.
                      </p>
                    </div>
                  )}

                  {/* Pagination (could be expanded with real functionality) */}
                  {filteredDomains.length > 0 && (
                    <div className="mt-8 flex justify-center">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                        <a href="#" aria-current="page" className="z-10 bg-accent-teal border-accent-teal text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                          1
                        </a>
                        <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                          2
                        </a>
                        <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                          3
                        </a>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                        <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                          8
                        </a>
                        <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                          9
                        </a>
                        <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                          10
                        </a>
                        <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-light-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8">Trusted by Businesses Worldwide</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="w-32 h-12 bg-gray-300 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600">COMPANY 1</span>
            </div>
            <div className="w-32 h-12 bg-gray-300 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600">COMPANY 2</span>
            </div>
            <div className="w-32 h-12 bg-gray-300 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600">COMPANY 3</span>
            </div>
            <div className="w-32 h-12 bg-gray-300 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600">COMPANY 4</span>
            </div>
            <div className="w-32 h-12 bg-gray-300 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600">COMPANY 5</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuyPage;