import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { domainAPI } from '../utils/api';
import StripePaymentModal from '../components/StripePaymentModal';
import { useAuth } from '../context/AuthContext';

const DomainDetailPage = () => {
  const { domainName } = useParams();
  const [domain, setDomain] = useState(null);
  const [similarDomains, setSimilarDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('buy');
  const [paymentOption, setPaymentOption] = useState('full');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        setIsLoading(true);
        
        // Parse domain name and extension from the URL parameter
        const lastDotIndex = domainName.lastIndexOf('.');
        const name = lastDotIndex > 0 ? domainName.substring(0, lastDotIndex) : domainName;
        const extension = lastDotIndex > 0 ? domainName.substring(lastDotIndex) : '.com';
        
        // Try to get domain by name and extension
        let foundDomain;
        try {
          foundDomain = await domainAPI.getDomainByName(name, extension);
        } catch (error) {
          // If not found, try to get all domains and find by full name
          const allDomains = await domainAPI.getAllDomains();
          foundDomain = allDomains.find(d => `${d.name}${d.extension}` === domainName);
        }
        
        if (foundDomain) {
          setDomain(foundDomain);
          
          // Fetch similar domains in the same category
          const allDomains = await domainAPI.getAllDomains();
          const similar = allDomains
            .filter(d => d.category === foundDomain.category && d.id !== foundDomain.id)
            .slice(0, 4);
          setSimilarDomains(similar);
        } else {
          // Domain not found, create a placeholder
          setDomain({
            id: 'not-found',
            name: name,
            extension: extension,
            price: 1499,
            category: 'premium',
            description: 'Domain not found in our database.',
            status: 'not-available'
          });
        }
      } catch (error) {
        console.error('Error fetching domain data:', error);
        setDomain(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (domainName) {
      fetchDomainData();
    }
  }, [domainName]);

  // Format price with commas and currency symbol
  const formatPrice = (price) => {
    return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePurchaseClick = () => {
    if (!user) {
      alert('Please log in to purchase a domain');
      return;
    }
    setShowTransactionModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-teal"></div>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Domain Not Found</h1>
          <p className="text-gray-600 mb-8">The domain you're looking for doesn't exist.</p>
          <Link to="/buy-domain" className="bg-accent-teal text-white px-6 py-3 rounded-md hover:bg-opacity-90">
            Browse All Domains
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-light-green py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-accent-teal transition-colors">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to="/buy-domain" className="ml-2 text-gray-500 hover:text-accent-teal transition-colors">
                  Domains
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-gray-700 font-medium">
                  {domain.name}{domain.extension}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Domain Info */}
            <div className="col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                {domain.name}{domain.extension}
              </h1>
              
              <div className="mb-8 flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  domain.category === 'premium' ? 'bg-accent-khaki text-primary-dark' :
                  domain.category === 'three-letter' ? 'bg-accent-teal text-white' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {domain.category === 'three-letter' ? '3-Letter Domain' : 
                   domain.category === 'premium' ? 'Premium Domain' : 
                   'Domain'}
                </span>
                {domain.status && (
                  <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    domain.status === 'available' ? 'bg-green-100 text-green-800' :
                    domain.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {domain.status}
                  </span>
                )}
              </div>
              
              <div className="bg-light-green rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-primary mb-4">Domain Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm text-gray-500">Domain Name</h3>
                    <p className="text-lg font-medium text-primary">{domain.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Extension</h3>
                    <p className="text-lg font-medium text-primary">{domain.extension}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Category</h3>
                    <p className="text-lg font-medium text-primary capitalize">{domain.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Character Length</h3>
                    <p className="text-lg font-medium text-primary">{domain.name.length}</p>
                  </div>
                </div>
                {domain.description && (
                  <div className="mt-4">
                    <h3 className="text-sm text-gray-500">Description</h3>
                    <p className="text-gray-700">{domain.description}</p>
                  </div>
                )}
              </div>
              
              {domain.status === 'available' && (
                <div className="bg-white rounded-lg border border-gray-200 mb-8 overflow-hidden">
                  <div className="flex border-b border-gray-200">
                    <button
                      className={`flex-1 py-4 px-6 text-center font-medium ${
                        selectedTab === 'buy' ? 'text-accent-teal border-b-2 border-accent-teal' : 'text-gray-500 hover:text-primary'
                      }`}
                      onClick={() => setSelectedTab('buy')}
                    >
                      Buy Now
                    </button>
                    <button
                      className={`flex-1 py-4 px-6 text-center font-medium ${
                        selectedTab === 'lease' ? 'text-accent-teal border-b-2 border-accent-teal' : 'text-gray-500 hover:text-primary'
                      }`}
                      onClick={() => setSelectedTab('lease')}
                    >
                      Lease to Own
                    </button>
                    <button
                      className={`flex-1 py-4 px-6 text-center font-medium ${
                        selectedTab === 'offer' ? 'text-accent-teal border-b-2 border-accent-teal' : 'text-gray-500 hover:text-primary'
                      }`}
                      onClick={() => setSelectedTab('offer')}
                    >
                      Make Offer
                    </button>
                  </div>
                  
                  <div className="p-6">
                    {selectedTab === 'buy' && (
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-4">Payment Options</h3>
                        <div className="space-y-4 mb-6">
                          <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-light-green">
                            <input
                              type="radio"
                              name="paymentOption"
                              value="full"
                              checked={paymentOption === 'full'}
                              onChange={() => setPaymentOption('full')}
                              className="h-5 w-5 text-accent-teal focus:ring-accent-teal"
                            />
                            <div className="ml-3">
                              <span className="block font-medium text-primary">Full Payment</span>
                              <span className="block text-sm text-gray-500">Pay the entire amount now</span>
                            </div>
                            <span className="ml-auto font-semibold text-primary">{formatPrice(domain.price)}</span>
                          </label>
                          
                          <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-light-green">
                            <input
                              type="radio"
                              name="paymentOption"
                              value="installment"
                              checked={paymentOption === 'installment'}
                              onChange={() => setPaymentOption('installment')}
                              className="h-5 w-5 text-accent-teal focus:ring-accent-teal"
                            />
                            <div className="ml-3">
                              <span className="block font-medium text-primary">Installment Plan</span>
                              <span className="block text-sm text-gray-500">Pay in 12 monthly installments</span>
                            </div>
                            <span className="ml-auto font-semibold text-primary">{formatPrice(Math.round(domain.price / 12))} /mo</span>
                          </label>
                        </div>
                        
                        <div className="mt-6">
                          <button 
                            onClick={handlePurchaseClick}
                            className="w-full bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-md transition-all duration-300"
                          >
                            Proceed to Checkout
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedTab === 'lease' && (
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-4">Lease to Own Options</h3>
                        <p className="text-gray-600 mb-4">
                          Lease this domain with an option to purchase at any time during the lease period.
                        </p>
                        
                        <div className="space-y-4 mb-6">
                          <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-light-green">
                            <input
                              type="radio"
                              name="leaseOption"
                              value="12"
                              checked={true}
                              className="h-5 w-5 text-accent-teal focus:ring-accent-teal"
                            />
                            <div className="ml-3">
                              <span className="block font-medium text-primary">12-Month Lease</span>
                              <span className="block text-sm text-gray-500">Down payment + monthly payments</span>
                            </div>
                            <span className="ml-auto font-semibold text-primary">{formatPrice(Math.round(domain.price * 0.10))} + {formatPrice(Math.round(domain.price * 0.08))} /mo</span>
                          </label>
                          
                          <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-light-green">
                            <input
                              type="radio"
                              name="leaseOption"
                              value="24"
                              className="h-5 w-5 text-accent-teal focus:ring-accent-teal"
                            />
                            <div className="ml-3">
                              <span className="block font-medium text-primary">24-Month Lease</span>
                              <span className="block text-sm text-gray-500">Down payment + monthly payments</span>
                            </div>
                            <span className="ml-auto font-semibold text-primary">{formatPrice(Math.round(domain.price * 0.15))} + {formatPrice(Math.round(domain.price * 0.04))} /mo</span>
                          </label>
                        </div>
                        
                        <div className="mt-6">
                          <button className="w-full bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-md transition-all duration-300">
                            Start Lease Agreement
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedTab === 'offer' && (
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-4">Make an Offer</h3>
                        <p className="text-gray-600 mb-4">
                          Submit your best offer for this domain. The seller will review your offer and respond.
                        </p>
                        
                        <div className="mb-4">
                          <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Offer
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="text"
                              name="offerAmount"
                              id="offerAmount"
                              className="focus:ring-accent-teal focus:border-accent-teal block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                              placeholder="0.00"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">USD</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="offerMessage" className="block text-sm font-medium text-gray-700 mb-1">
                            Message to Seller (Optional)
                          </label>
                          <textarea
                            id="offerMessage"
                            name="offerMessage"
                            rows={3}
                            className="focus:ring-accent-teal focus:border-accent-teal block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Explain why you're interested in this domain..."
                          ></textarea>
                        </div>
                        
                        <div className="mt-6">
                          <button className="w-full bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-md transition-all duration-300">
                            Submit Offer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="bg-light-green rounded-lg p-6">
                <h2 className="text-xl font-semibold text-primary mb-4">Why this domain is valuable</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-accent-teal flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{domain.extension === '.com' ? 'Premium .com extension - the most recognized and trusted domain extension' : `${domain.extension} extension - increasingly popular for modern websites`}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-accent-teal flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{domain.name.length < 8 ? 'Short and memorable - easy for customers to remember and type' : 'Descriptive and meaningful - clearly communicates your brand purpose'}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-accent-teal flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Brand-building potential - establish a strong online identity</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-accent-teal flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Instantly creates credibility and trustworthiness for your business</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Purchase Summary */}
            <div className="mt-8 lg:mt-0">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-6">
                <div className="bg-primary px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Domain Summary</h2>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-primary">{domain.name}{domain.extension}</h3>
                    <p className="text-gray-500 capitalize">{domain.category} Domain</p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Price</span>
                      <span className="font-medium text-primary">{formatPrice(domain.price)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Transaction Fee</span>
                      <span className="font-medium text-primary">{formatPrice(Math.round(domain.price * 0.05))}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      <span className="text-gray-800 font-semibold">Total</span>
                      <span className="font-bold text-primary">{formatPrice(Math.round(domain.price * 1.05))}</span>
                    </div>
                  </div>
                  
                  {domain.status === 'available' && (
                    <div className="mt-6">
                      <button 
                        onClick={handlePurchaseClick}
                        className="w-full bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-md transition-all duration-300 mb-3"
                      >
                        Buy Now
                      </button>
                      <button className="w-full bg-white border border-accent-teal text-accent-teal hover:bg-light-green font-medium px-6 py-3 rounded-md transition-all duration-300">
                        Make an Offer
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-6 text-center">
                    <p className="flex items-center justify-center text-gray-600 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Secure payment & transfer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Domains Section */}
      {similarDomains.length > 0 && (
        <section className="py-12 bg-light-green">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary mb-8">Similar Domains You Might Like</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarDomains.map(similarDomain => (
                <Link 
                  key={similarDomain.id}
                  to={`/domain/${similarDomain.name}${similarDomain.extension}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 block"
                >
                  <h3 className="text-lg font-semibold text-primary hover:text-accent-teal transition-colors">
                    {similarDomain.name}{similarDomain.extension}
                  </h3>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{similarDomain.category === 'three-letter' ? '3-Letter' : similarDomain.category}</span>
                    <span className="font-bold text-primary">{formatPrice(similarDomain.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-teal mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure Transactions</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-teal mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Fast Transfers</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-teal mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Multiple Payment Options</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-teal mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Transaction Modal */}
      {showTransactionModal && (
        <EnhancedTransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          domain={domain}
          seller={{ id: domain.seller_id, username: 'Domain Seller', email: 'seller@example.com' }}
        />
      )}
    </div>
  );
};

export default DomainDetailPage;