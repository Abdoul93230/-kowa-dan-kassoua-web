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
  id: number | string; // number pour mockData, string pour MongoDB ObjectId
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
  quantity?: string;
  views: number;
  favorites: number;
  
  // Pour les produits
  delivery?: {
    available: boolean;
    cost: string;
    areas: string[];
    estimatedTime: string;
  };
  
  // Pour les services
  availability?: {
    days: string[];
    openingTime: string;
    closingTime: string;
  };
  serviceArea?: string[];
  
  // Détails additionnels
  specifications?: Record<string, string>;
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

// Types pour le système de messagerie
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'audio' | 'offer';
  attachments?: string[];
  offerDetails?: {
    itemId: number;
    itemTitle: string;
    itemImage: string;
    price: string;
  };
}

export interface Conversation {
  id: string;
  participants: {
    buyer: {
      id: string;
      name: string;
      avatar?: string;
    };
    seller: Seller;
  };
  item?: {
    id: number;
    title: string;
    image: string;
    price: string;
  };
  lastMessage: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
}
