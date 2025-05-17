// Mock data for domain listings
export const featuredDomains = [
  {
    id: 1,
    name: "webcreator.com",
    price: 5999,
    category: "premium",
    extension: ".com",
    featured: true,
  },
  {
    id: 2,
    name: "digitalspace.co",
    price: 2499,
    category: "premium",
    extension: ".co",
    featured: true,
  },
  {
    id: 3,
    name: "shopease.com",
    price: 3999,
    category: "premium",
    extension: ".com",
    featured: true,
  },
  {
    id: 4,
    name: "techstart.io",
    price: 1899,
    category: "premium",
    extension: ".io",
    featured: true,
  },
  {
    id: 5,
    name: "promarketing.com",
    price: 4599,
    category: "premium",
    extension: ".com",
    featured: true,
  },
  {
    id: 6,
    name: "cryptohub.io",
    price: 2799,
    category: "premium",
    extension: ".io",
    featured: true,
  },
];

export const threeLetterDomains = [
  {
    id: 7,
    name: "abc.com",
    price: 8999,
    category: "three-letter",
    extension: ".com",
  },
  {
    id: 8,
    name: "xyz.com",
    price: 7499,
    category: "three-letter",
    extension: ".com",
  },
  {
    id: 9,
    name: "pqr.com",
    price: 6799,
    category: "three-letter",
    extension: ".com",
  },
  {
    id: 10,
    name: "def.com",
    price: 9199,
    category: "three-letter",
    extension: ".com",
  },
  {
    id: 11,
    name: "mno.co",
    price: 4299,
    category: "three-letter",
    extension: ".co",
  },
  {
    id: 12,
    name: "jkl.io",
    price: 3699,
    category: "three-letter",
    extension: ".io",
  },
];

export const premiumDomains = [
  {
    id: 13,
    name: "digitalmarketing.com",
    price: 12999,
    category: "premium",
    extension: ".com",
  },
  {
    id: 14,
    name: "investmentfirm.com",
    price: 9499,
    category: "premium",
    extension: ".com",
  },
  {
    id: 15,
    name: "onlinecourses.com",
    price: 17999,
    category: "premium",
    extension: ".com",
  },
  {
    id: 16,
    name: "cybersecurity.co",
    price: 7999,
    category: "premium",
    extension: ".co",
  },
  {
    id: 17,
    name: "ecommerceplatform.com",
    price: 14599,
    category: "premium",
    extension: ".com",
  },
  {
    id: 18,
    name: "smarttechnology.io",
    price: 8899,
    category: "premium",
    extension: ".io",
  },
];

export const popularDomains = [
  ...featuredDomains.slice(0, 3),
  ...threeLetterDomains.slice(0, 3),
];

export const allDomains = [
  ...featuredDomains,
  ...threeLetterDomains,
  ...premiumDomains,
];

export const domainCategories = [
  {
    id: 1,
    name: "Popular Domains",
    description: "Get a domain that is popular and in demand.",
    icon: "popular-icon",
    count: popularDomains.length,
  },
  {
    id: 2,
    name: "3-Letter Domains",
    description: "3-letter domain names are short, sweet, and super easy to remember.",
    icon: "letter-icon",
    count: threeLetterDomains.length,
  },
  {
    id: 3,
    name: "Premium Domains",
    description: "Premium domain names are usually short, easy to brand, and use a popular extension like .com.",
    icon: "premium-icon",
    count: premiumDomains.length,
  },
];
