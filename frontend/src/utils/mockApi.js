// Mock API implementation for when the backend is not available
import { featuredDomains, threeLetterDomains, premiumDomains, allDomains } from '../data/domains';

// Mock users data
const users = [
  {
    id: "1",
    email: "admin@dngun.com",
    username: "admin",
    full_name: "Admin User",
    created_at: new Date().toISOString(),
    domains_owned: [],
    domains_for_sale: []
  },
  {
    id: "2",
    email: "user@example.com",
    username: "testuser",
    full_name: "Test User",
    created_at: new Date().toISOString(),
    domains_owned: [],
    domains_for_sale: []
  }
];

// Mock authentication
export const mockAuthAPI = {
  login: async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check credentials (in a real app, this would be done on the server)
    if (email === "admin@dngun.com" && password === "admin123") {
      return {
        access_token: "mock_token_admin",
        token_type: "bearer"
      };
    }
    
    if (email === "user@example.com" && password === "password123") {
      return {
        access_token: "mock_token_user",
        token_type: "bearer"
      };
    }
    
    // Invalid credentials
    throw new Error("Incorrect email or password");
  },
  
  register: async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if email is already in use
    if (users.some(user => user.email === userData.email)) {
      throw new Error("Email already registered");
    }
    
    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      email: userData.email,
      username: userData.username,
      full_name: userData.full_name || "",
      created_at: new Date().toISOString(),
      domains_owned: [],
      domains_for_sale: []
    };
    
    // Add user to the mock database
    users.push(newUser);
    
    return newUser;
  },
  
  getCurrentUser: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token === "mock_token_admin") {
      return users[0];
    }
    
    if (token === "mock_token_user") {
      return users[1];
    }
    
    // Invalid token
    throw new Error("Invalid token");
  }
};

// Mock domain API
export const mockDomainAPI = {
  getAllDomains: async (params) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredDomains = [...allDomains];
    
    // Apply filters if provided
    if (params) {
      if (params.category) {
        filteredDomains = filteredDomains.filter(domain => domain.category === params.category);
      }
      
      if (params.status) {
        filteredDomains = filteredDomains.filter(domain => domain.status === params.status);
      }
      
      if (params.price_min !== undefined) {
        filteredDomains = filteredDomains.filter(domain => domain.price >= params.price_min);
      }
      
      if (params.price_max !== undefined) {
        filteredDomains = filteredDomains.filter(domain => domain.price <= params.price_max);
      }
      
      if (params.search) {
        filteredDomains = filteredDomains.filter(domain => 
          domain.name.toLowerCase().includes(params.search.toLowerCase())
        );
      }
    }
    
    return filteredDomains;
  },
  
  getDomainById: async (id) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const domain = allDomains.find(d => d.id === parseInt(id));
    
    if (!domain) {
      throw new Error("Domain not found");
    }
    
    return domain;
  },
  
  getDomainByName: async (name, extension) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const domain = allDomains.find(d => 
      d.name.split('.')[0].toLowerCase() === name.toLowerCase() && 
      d.extension.toLowerCase() === extension.toLowerCase()
    );
    
    if (!domain) {
      throw new Error("Domain not found");
    }
    
    return domain;
  },
  
  searchDomains: async (query) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!query) return [];
    
    // Find exact matches
    const exactMatches = allDomains.filter(domain => 
      domain.name.toLowerCase().includes(query.toLowerCase())
    );
    
    // If we have enough exact matches, return them
    if (exactMatches.length >= 5) {
      return exactMatches;
    }
    
    // Otherwise, generate some additional suggestions
    const results = [...exactMatches];
    const extensions = ['.com', '.net', '.org', '.io', '.co'];
    const baseQuery = query.split('.')[0].toLowerCase();
    
    // Add suggestions with different extensions
    extensions.forEach(ext => {
      const domainName = `${baseQuery}${ext}`;
      
      // Check if this suggestion already exists in results
      if (!results.some(d => d.name.toLowerCase() === domainName.toLowerCase())) {
        results.push({
          id: Math.floor(Math.random() * 10000) + 1000,
          name: domainName,
          price: Math.floor(Math.random() * 5000) + 1000,
          category: ext === '.com' ? 'premium' : 'standard',
          extension: ext,
          status: 'available'
        });
      }
    });
    
    // Add suggestions with prefixes/suffixes
    const prefixes = ['get', 'my', 'the', 'best'];
    const suffixes = ['online', 'digital', 'web', 'app', 'site'];
    
    // Add prefix suggestions
    prefixes.forEach(prefix => {
      const domainName = `${prefix}${baseQuery}.com`;
      
      if (!results.some(d => d.name.toLowerCase() === domainName.toLowerCase())) {
        results.push({
          id: Math.floor(Math.random() * 10000) + 1000,
          name: domainName,
          price: Math.floor(Math.random() * 3000) + 800,
          category: 'standard',
          extension: '.com',
          status: 'available'
        });
      }
    });
    
    // Add suffix suggestions
    suffixes.forEach(suffix => {
      const domainName = `${baseQuery}${suffix}.com`;
      
      if (!results.some(d => d.name.toLowerCase() === domainName.toLowerCase())) {
        results.push({
          id: Math.floor(Math.random() * 10000) + 1000,
          name: domainName,
          price: Math.floor(Math.random() * 3000) + 800,
          category: 'standard',
          extension: '.com',
          status: 'available'
        });
      }
    });
    
    return results;
  },
  
  createDomain: async (domainData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if domain already exists
    if (allDomains.some(d => d.name === domainData.name && d.extension === domainData.extension)) {
      throw new Error("Domain already exists");
    }
    
    // Create new domain
    const newDomain = {
      id: allDomains.length + 1,
      ...domainData,
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0
    };
    
    // Add domain to the mock database
    allDomains.push(newDomain);
    
    return newDomain;
  }
};

// Mock transaction API
export const mockTransactionAPI = {
  createTransaction: async (transactionData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the domain
    const domain = allDomains.find(d => d.id === transactionData.domain_id);
    
    if (!domain) {
      throw new Error("Domain not found");
    }
    
    if (domain.status !== 'available') {
      throw new Error("Domain is not available for purchase");
    }
    
    // Create transaction
    const transaction = {
      id: Math.floor(Math.random() * 10000) + 1,
      ...transactionData,
      transaction_fee: Math.round(transactionData.amount * 0.1),
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    
    // Update domain status
    domain.status = 'pending';
    
    return transaction;
  },
  
  completeTransaction: async (id) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this would update the transaction status and domain ownership
    return {
      id,
      status: 'completed',
      updated_at: new Date().toISOString()
    };
  },
  
  getUserTransactions: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return empty array as mock data
    return [];
  }
};

// Mock user API
export const mockUserAPI = {
  getUserDomains: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a few random domains as mock data
    return allDomains.slice(0, 3);
  },
  
  getUserSellingDomains: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a few random domains as mock data
    return allDomains.slice(3, 6);
  },
  
  getUserOwnedDomains: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a few random domains as mock data
    return allDomains.slice(0, 3);
  }
};