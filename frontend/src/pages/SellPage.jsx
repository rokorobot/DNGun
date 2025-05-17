import React from 'react';

const SellPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Sell Your Domain Name</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            List your domain with us and connect with serious buyers from around the world.
          </p>
          <div className="max-w-md mx-auto">
            <div className="rounded-md bg-white p-2">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter your domain name"
                  className="flex-1 border-0 py-3 px-4 focus:outline-none focus:ring-0 text-gray-900"
                />
                <button
                  type="button"
                  className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-md transition-all duration-300"
                >
                  List Domain
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="w-full h-16 md:h-24 bg-primary relative overflow-hidden">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 25.6831L60 19.2623C120 12.8416 240 0 360 0C480 0 600 12.8416 720 28.9869C840 45.1321 960 64.6618 1080 70.7962C1200 77.1238 1320 70.8893 1380 67.7721L1440 64.6618V138H1380C1320 138 1200 138 1080 138C960 138 840 138 720 138C600 138 480 138 360 138C240 138 120 138 60 138H0V25.6831Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why Sell With Us</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We make selling domains simple, secure, and profitable for domain owners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-light-green rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-accent-teal rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Maximum Value</h3>
              <p className="text-gray-600">
                Our global marketplace connects you with serious buyers willing to pay premium prices for quality domains.
              </p>
            </div>
            
            <div className="bg-light-green rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-accent-teal rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Secure Transactions</h3>
              <p className="text-gray-600">
                Our escrow service ensures safe transfers and guarantees payment before ownership is transferred.
              </p>
            </div>
            
            <div className="bg-light-green rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-accent-teal rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Fast Process</h3>
              <p className="text-gray-600">
                Our streamlined listing and transfer process means you can sell your domains quickly and efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-light-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Selling your domain with us is a simple, three-step process.
            </p>
          </div>
          
          <div className="relative">
            {/* Progress Bar */}
            <div className="hidden md:block absolute top-24 left-0 w-full h-1 bg-gray-200">
              <div className="w-full h-full bg-accent-teal"></div>
            </div>
            
            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="md:absolute md:top-0 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 w-12 h-12 bg-accent-teal rounded-full flex items-center justify-center text-white mx-auto md:mx-0 mb-4 md:mb-0 z-10">
                  <span className="text-lg font-semibold">1</span>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm text-center md:mt-8">
                  <h3 className="text-xl font-semibold text-primary mb-4">List Your Domain</h3>
                  <p className="text-gray-600">
                    Add your domain to our marketplace by entering basic information and setting your price.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="md:absolute md:top-0 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 w-12 h-12 bg-accent-teal rounded-full flex items-center justify-center text-white mx-auto md:mx-0 mb-4 md:mb-0 z-10">
                  <span className="text-lg font-semibold">2</span>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm text-center md:mt-8">
                  <h3 className="text-xl font-semibold text-primary mb-4">Receive Offers</h3>
                  <p className="text-gray-600">
                    Get notifications when buyers express interest or make offers on your domain.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="md:absolute md:top-0 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 w-12 h-12 bg-accent-teal rounded-full flex items-center justify-center text-white mx-auto md:mx-0 mb-4 md:mb-0 z-10">
                  <span className="text-lg font-semibold">3</span>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm text-center md:mt-8">
                  <h3 className="text-xl font-semibold text-primary mb-4">Get Paid</h3>
                  <p className="text-gray-600">
                    When you accept an offer, our secure escrow service handles the payment and domain transfer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We believe in fair and clear commission structures with no hidden fees.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto">
            <div className="bg-primary px-6 py-8 text-center">
              <h3 className="text-2xl font-bold text-white">Seller Commission</h3>
              <p className="text-xl text-gray-300 mt-2">Only pay when your domain sells</p>
            </div>
            
            <div className="px-6 py-8">
              <div className="flex justify-between items-center border-b border-gray-200 py-4">
                <div>
                  <h4 className="font-semibold text-primary">Standard Plan</h4>
                  <p className="text-sm text-gray-600">For most domain sellers</p>
                </div>
                <div className="text-xl font-bold text-primary">10%</div>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-200 py-4">
                <div>
                  <h4 className="font-semibold text-primary">Premium Plan</h4>
                  <p className="text-sm text-gray-600">For high-volume sellers</p>
                </div>
                <div className="text-xl font-bold text-primary">8%</div>
              </div>
              
              <div className="flex justify-between items-center py-4">
                <div>
                  <h4 className="font-semibold text-primary">Enterprise Plan</h4>
                  <p className="text-sm text-gray-600">For domain portfolio owners</p>
                </div>
                <div className="text-xl font-bold text-primary">Custom</div>
              </div>
              
              <div className="mt-8 text-center">
                <button className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-8 py-3 rounded-full transition-all duration-300">
                  Start Selling Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-light-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about selling domains.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-primary mb-2">How long does it take to sell a domain?</h3>
              <p className="text-gray-600">
                Selling time varies depending on factors like domain quality, pricing, and market demand. Some premium domains sell within days, while others may take months. Our marketplace is designed to maximize visibility and connect you with serious buyers.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-primary mb-2">How do I price my domain?</h3>
              <p className="text-gray-600">
                Domain pricing depends on factors like length, keywords, extension, and market demand. We provide pricing guidance based on similar domain sales, but sellers have full control over listing prices. You can also use our domain appraisal tool for a more accurate estimate.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-primary mb-2">When do I get paid after a sale?</h3>
              <p className="text-gray-600">
                Upon successful domain transfer, funds are released to your account immediately. You can withdraw funds via various payment methods, including bank transfer and PayPal. Standard processing times apply depending on your chosen payment method.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-primary mb-2">How secure is the domain transfer process?</h3>
              <p className="text-gray-600">
                Our escrow service ensures secure transfers by holding payment until the domain transfer is complete. This protects both buyers and sellers from fraud. Our transfer specialists oversee the process to ensure everything goes smoothly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to sell your domain?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of successful domain sellers on our marketplace.
          </p>
          <button className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-8 py-3 rounded-full transition-all duration-300">
            List Your Domain Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default SellPage;
