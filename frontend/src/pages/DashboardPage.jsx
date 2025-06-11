import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, transactionAPI } from '../utils/api';
import DomainCard from '../components/DomainCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [userDomains, setUserDomains] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's domains and transactions
        const [domainsData, transactionsData] = await Promise.all([
          userAPI.getUserDomains().catch(() => []),
          transactionAPI.getUserTransactions().catch(() => [])
        ]);
        
        setUserDomains(domainsData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-gray-600">
            Manage your domains, track transactions, and explore new opportunities.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent-teal rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Domains</p>
                <p className="text-2xl font-semibold text-primary">{userDomains.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent-khaki rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Transactions</p>
                <p className="text-2xl font-semibold text-primary">{transactions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-semibold text-primary">
                  ${userDomains.reduce((total, domain) => total + (domain.price || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Domains */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">My Domains</h2>
            <a 
              href="/#/my-domains" 
              className="text-accent-teal hover:text-opacity-80 font-medium"
            >
              View All →
            </a>
          </div>
          
          {userDomains.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDomains.slice(0, 6).map(domain => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No domains yet</h3>
              <p className="text-gray-600 mb-6">Start building your domain portfolio by browsing our marketplace.</p>
              <a 
                href="/#/buy-domain" 
                className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Browse Domains
              </a>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6">Recent Activity</h2>
          
          {transactions.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {transactions.slice(0, 5).map(transaction => (
                  <div key={transaction.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.domain_name}</p>
                        <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">${transaction.amount?.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600">Your transaction history will appear here once you start buying or selling domains.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a 
                href="/#/buy-domain" 
                className="block w-full text-left px-4 py-3 bg-light-green hover:bg-opacity-80 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-accent-teal mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="font-medium text-gray-900">Browse Domains</span>
                </div>
              </a>
              <a 
                href="/#/sell-domain" 
                className="block w-full text-left px-4 py-3 bg-light-green hover:bg-opacity-80 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-accent-teal mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium text-gray-900">List Domain for Sale</span>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Account Settings</h3>
            <div className="space-y-3">
              <a 
                href="/#/profile" 
                className="block w-full text-left px-4 py-3 bg-light-green hover:bg-opacity-80 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-accent-teal mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium text-gray-900">Edit Profile</span>
                </div>
              </a>
              <a 
                href="/#/payment/test" 
                className="block w-full text-left px-4 py-3 bg-light-green hover:bg-opacity-80 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-accent-teal mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-medium text-gray-900">Payment Settings</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;