import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import DomainCard from '../components/DomainCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MyDomainsPage = () => {
  const { user } = useAuth();
  const [domains, setDomains] = useState([]);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUserDomains = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const domainsData = await userAPI.getUserDomains();
        setDomains(domainsData);
        setFilteredDomains(domainsData);
      } catch (error) {
        console.error('Error fetching user domains:', error);
        setError('Failed to load your domains');
        setDomains([]);
        setFilteredDomains([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserDomains();
    }
  }, [user]);

  useEffect(() => {
    let filtered = domains;

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(domain => domain.status === activeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(domain => 
        domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.extension.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDomains(filtered);
  }, [domains, activeFilter, searchTerm]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      available: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-gray-100 text-gray-800',
      transferred: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getFilterCount = (status) => {
    if (status === 'all') return domains.length;
    return domains.filter(domain => domain.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-green py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-green py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">My Domains</h1>
          <p className="text-gray-600">
            Manage your domain portfolio and track their performance.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-96">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search your domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent"
                />
                <svg 
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Add Domain Button */}
            <a 
              href="/#/sell-domain" 
              className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              + List New Domain
            </a>
          </div>

          {/* Status Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Domains' },
              { key: 'available', label: 'Available' },
              { key: 'pending', label: 'Pending' },
              { key: 'sold', label: 'Sold' },
              { key: 'transferred', label: 'Transferred' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-accent-teal text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {filter.label} ({getFilterCount(filter.key)})
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredDomains.length} of {domains.length} domains
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Domains Grid */}
        {filteredDomains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDomains.map(domain => (
              <div key={domain.id} className="relative">
                <DomainCard domain={domain} />
                
                {/* Status overlay */}
                <div className="absolute top-4 right-4">
                  {getStatusBadge(domain.status)}
                </div>

                {/* Owner actions */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white bg-opacity-95 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex flex-wrap gap-2">
                      {domain.status === 'available' && (
                        <>
                          <button className="flex-1 text-xs bg-accent-teal text-white px-3 py-2 rounded hover:bg-opacity-90 transition-colors">
                            Edit Listing
                          </button>
                          <button className="flex-1 text-xs bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 transition-colors">
                            Remove
                          </button>
                        </>
                      )}
                      {domain.status === 'pending' && (
                        <button className="w-full text-xs bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition-colors">
                          View Transaction
                        </button>
                      )}
                      {domain.status === 'sold' && (
                        <button className="w-full text-xs bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors">
                          Transfer Domain
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {domains.length === 0 ? (
              /* No domains at all */
              <div className="bg-white rounded-lg shadow-sm p-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No domains in your portfolio</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start building your domain portfolio by purchasing domains from our marketplace or listing your own domains for sale.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/#/buy-domain" 
                    className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    Browse Domains
                  </a>
                  <a 
                    href="/#/sell-domain" 
                    className="bg-white border border-accent-teal text-accent-teal hover:bg-light-green font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    List Your Domain
                  </a>
                </div>
              </div>
            ) : (
              /* No domains match current filter */
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No domains found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? `No domains match "${searchTerm}" in the ${activeFilter} category.`
                    : `You don't have any ${activeFilter} domains.`
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setActiveFilter('all');
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                  <a 
                    href="/#/buy-domain" 
                    className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Browse Marketplace
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Stats */}
        {domains.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Portfolio Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{domains.length}</p>
                <p className="text-sm text-gray-600">Total Domains</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{getFilterCount('available')}</p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{getFilterCount('pending')}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  ${domains.reduce((total, domain) => total + (domain.price || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Value</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDomainsPage;