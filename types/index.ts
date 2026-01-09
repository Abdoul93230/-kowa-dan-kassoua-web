// types/index.ts

export interface ContactInfo {
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  memberSince: string;
  responseTime: string; // ex: "< 1h", "< 24h"
  responseRate: number; // pourcentage
  location: string;
  bio?: string;
  contactInfo: ContactInfo;
  totalListings: number;
  categories: string[]; // catégories principales du vendeur
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface Item {
  id: number;
  title: string;
  price: string;
  location: string;
  images: string[]; // multiple images
  mainImage: string;
  category: string;
  subcategory?: string;
  type: 'product' | 'service';
  rating: number;
  totalReviews: number;
  seller: Seller;
  sellerId: string;
  promoted: boolean;
  featured: boolean;
  postedTime: string;
  postedDate: string;
  lastUpdated?: string;
  description: string;
  condition?: 'new' | 'used' | 'refurbished';
  brand?: string;
  views: number;
  favorites: number;
  
  // Pour les produits
  quantity?: number;
  warranty?: string;
  returnPolicy?: string;
  delivery?: {
    available: boolean;
    cost: string;
    areas: string[];
    estimatedTime: string;
  };
  
  // Pour les services
  availability?: {
    days: string[];
    hours: string;
  };
  serviceArea?: string[];
  duration?: string;
  
  // Détails additionnels
  specifications?: Record<string, string>;
  tags: string[];
  status: 'active' | 'pending' | 'sold' | 'expired';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
  description: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface Filters {
  showProducts: boolean;
  showServices: boolean;
  priceMin: string;
  priceMax: string;
  location: string;
  condition: 'all' | 'new' | 'used';
  minRating: number;
  promotedOnly: boolean;
}

export type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'rating';

export type ViewMode = 'grid' | 'list';
