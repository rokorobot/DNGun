import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import DomainCard from '../components/DomainCard';
import { domainCategories } from '../data/domains';
import { domainAPI } from '../utils/api';

const HeroIllustration = () => (
  <div className="w-full md:w-1/2 px-4 mt-10 md:mt-0 relative animate-float">
    <div className="absolute top-0 left-1/4 w-16 h-16 bg-light-green rounded-full opacity-70 animate-ping" style={{ animationDuration: '3s' }}></div>
    <div className="absolute top-1/4 right-1/4 w-8 h-8 bg-accent-khaki rounded-full opacity-50 animate-ping" style={{ animationDuration: '4s' }}></div>
    
    {/* UFO */}
    <div className="relative mx-auto w-64 h-64">
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-40 h-12 bg-accent-teal rounded-full opacity-60"></div>
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-32 h-8 rounded-full bg-primary"></div>
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-28 h-28 bg-light-green rounded-full flex items-center justify-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 bg-accent-teal rounded-full"></div>
        </div>
      </div>
      
      {/* Beams */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-1 h-24 bg-accent-teal opacity-60"></div>
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 rotate-15 w-1 h-20 bg-accent-teal opacity-40"></div>
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 -rotate-15 w-1 h-20 bg-accent-teal opacity-40"></div>
      
      {/* Stars */}
      <div className="absolute top-2 left-10 w-2 h-2 bg-white rounded-full"></div>
      <div className="absolute top-8 right-12 w-3 h-3 bg-white rounded-full"></div>
      <div className="absolute bottom-10 left-14 w-2 h-2 bg-white rounded-full"></div>
      <div className="absolute bottom-16 right-10 w-1 h-1 bg-white rounded-full"></div>
    </div>
    
    {/* Planet */}
    <div className="absolute bottom-6 right-8 w-20 h-20 bg-primary-dark rounded-full">
      <div className="absolute top-3 left-3 w-4 h-4 bg-accent-khaki rounded-full opacity-70"></div>
      <div className="absolute bottom-5 right-3 w-6 h-6 bg-accent-khaki rounded-full opacity-50"></div>
    </div>
  </div>
);

const HomePage = () => {
  const [featuredDomains, setFeaturedDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedDomains = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching domains from API...');
        
        const domains = await domainAPI.getAllDomains();
        console.log('Received domains:', domains);
        
        // Filter featured domains from the API response
        const featured = domains.filter(domain => domain.featured).slice(0, 6);
        console.log('Featured domains:', featured);
        
        // If no featured domains, show first 6 available domains
        if (featured.length === 0) {
          const availableDomains = domains.filter(domain => domain.status === 'available').slice(0, 6);
          setFeaturedDomains(availableDomains);
        } else {
          setFeaturedDomains(featured);
        }
      } catch (error) {
        console.error('Error fetching featured domains:', error);
        setError(error.message || 'Failed to load domains');
        setFeaturedDomains([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedDomains();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Claim your space in the digital world
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Find the perfect domain name for your ideas. Buy, sell, and manage domains with confidence.
              </p>
              <div className="max-w-md">
                <SearchBar isLarge={true} bgColor="light" />
              </div>
            </div>
            <HeroIllustration />
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="w-full h-24 md:h-32 bg-primary relative overflow-hidden">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 25.6831L60 19.2623C120 12.8416 240 0 360 0C480 0 600 12.8416 720 28.9869C840 45.1321 960 64.6618 1080 70.7962C1200 77.1238 1320 70.8893 1380 67.7721L1440 64.6618V138H1380C1320 138 1200 138 1080 138C960 138 840 138 720 138C600 138 480 138 360 138C240 138 120 138 60 138H0V25.6831Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Domain Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Discover Your Ideal Domain</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Whether you're building a business, creating a personal brand, or launching a new project, 
              we have the perfect domain waiting for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {domainCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Domains Section */}
      <section className="py-16 bg-light-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Featured Domains</h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                Handpicked premium domains that are ready for your next big idea.
              </p>
            </div>
            <a href="/buy-domain" className="mt-4 md:mt-0 bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-full transition-all duration-300 inline-flex items-center">
              View All Domains
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-teal"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDomains.map(domain => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes buying, selling, and managing domains simple and secure.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-light-green rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-accent-teal rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Find Your Domain</h3>
              <p className="text-gray-600">
                Search our extensive inventory of premium domains or let us help you acquire the perfect domain.
              </p>
            </div>
            
            <div className="bg-light-green rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-accent-teal rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Secure Payment</h3>
              <p className="text-gray-600">
                Complete your purchase with our secure payment system. We support multiple payment methods.
              </p>
            </div>
            
            <div className="bg-light-green rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-accent-teal rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Quick Transfer</h3>
              <p className="text-gray-600">
                Our streamlined domain transfer process ensures you get your domain quickly and without hassle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-light-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Thousands of businesses and individuals trust us for their domain needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent-khaki rounded-full flex items-center justify-center text-white">
                  <span className="text-lg font-semibold">JD</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-primary">John Doe</h4>
                  <p className="text-sm text-gray-500">Entrepreneur</p>
                </div>
              </div>
              <p className="text-gray-600">
                "I found the perfect domain name for my startup in just minutes. The process was seamless from search to checkout."
              </p>
              <div className="mt-4 flex text-accent-teal">
                ★★★★★
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent-teal rounded-full flex items-center justify-center text-white">
                  <span className="text-lg font-semibold">SJ</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-primary">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Digital Marketer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "DNGun.com made selling my domain portfolio easy and profitable. Their platform provides great visibility to potential buyers."
              </p>
              <div className="mt-4 flex text-accent-teal">
                ★★★★★
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                  <span className="text-lg font-semibold">RK</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-primary">Robert Kim</h4>
                  <p className="text-sm text-gray-500">Tech CEO</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The customer service was exceptional when I needed help with my domain transfer. Highly recommend!"
              </p>
              <div className="mt-4 flex text-accent-teal">
                ★★★★★
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to secure your digital space?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers who have found their perfect domain with us.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/buy-domain" className="bg-accent-teal hover:bg-opacity-90 text-white font-medium px-8 py-3 rounded-full transition-all duration-300">
              Find Your Domain
            </a>
            <a href="/sell-domain" className="bg-transparent border border-white hover:bg-white hover:text-primary text-white font-medium px-8 py-3 rounded-full transition-all duration-300">
              Sell Your Domain
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;