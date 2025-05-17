import React from 'react';
import { Link } from 'react-router-dom';

const DomainCard = ({ domain }) => {
  // Format price with commas and currency symbol
  const formatPrice = (price) => {
    return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Link 
      to={`/domain/${domain.name}`} 
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 flex flex-col justify-between h-full"
    >
      <div>
        <h3 className="text-lg font-semibold text-primary group-hover:text-accent-teal transition-colors">
          {domain.name}
        </h3>
        <div className="mt-2 flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            domain.category === 'premium' ? 'bg-accent-khaki text-primary-dark' :
            domain.category === 'three-letter' ? 'bg-accent-teal text-white' :
            'bg-gray-100 text-gray-800'
          }`}>
            {domain.category === 'three-letter' ? '3-Letter' : 
             domain.category === 'premium' ? 'Premium' : 
             'Domain'}
          </span>
          {domain.featured && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
              Featured
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-lg font-bold text-primary-dark">
          {formatPrice(domain.price)}
        </span>
        <button className="px-3 py-1 bg-accent-teal text-white text-sm rounded-full hover:bg-opacity-90 transition-colors">
          Buy Now
        </button>
      </div>
    </Link>
  );
};

export default DomainCard;
