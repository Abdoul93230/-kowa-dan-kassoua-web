import { api } from './auth';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  type: 'product' | 'service';
  price: string;
  location: string;
  condition?: 'new' | 'used' | 'refurbished';
  quantity?: string;
  images: string[];
  mainImage: string;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    phone: string;
    email?: string;
    whatsapp?: string;
    businessType: string;
    businessName: string;
    description?: string;
    location: string;
    rating?: number;
    totalSales?: number;
    memberSince?: string;
  };
  sellerId: string;
  views: number;
  favorites: number;
  rating: number;
  totalReviews: number;
  promoted: boolean;
  featured: boolean;
  postedTime: string;
  postedDate: string;
  delivery?: {
    available: boolean;
    cost?: string;
    areas?: string[];
    estimatedTime?: string;
  };
  availability?: {
    days: string[];
    openingTime: string;
    closingTime: string;
  };
  serviceArea?: string[];
  specifications?: Record<string, string>;
  status: 'active' | 'pending' | 'sold' | 'expired';
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  type?: 'product' | 'service';
  condition?: 'new' | 'used' | 'refurbished';
  location?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  seller?: string;
  status?: string;
  sort?: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
  message?: string;
}

export interface StatsResponse {
  success: boolean;
  data: {
    totalActive: number;
    totalSold: number;
    totalViews: number;
    totalFavorites: number;
  };
}

/**
 * Créer une nouvelle annonce
 */
export const createProduct = async (productData: {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  type: 'product' | 'service';
  price: string;
  location: string;
  condition?: 'new' | 'used' | 'refurbished';
  quantity?: string;
  images: string[]; // Base64 images
  delivery?: {
    available: boolean;
    cost?: string;
    areas?: string[];
    estimatedTime?: string;
  };
  availability?: {
    days: string[];
    openingTime: string;
    closingTime: string;
  };
  serviceArea?: string[];
  specifications?: Record<string, string>;
  promoted?: boolean;
  featured?: boolean;
}): Promise<ProductResponse> => {
  const response = await api.post('/products', productData);
  return response.data;
};

/**
 * Obtenir tous les produits avec filtres
 */
export const getProducts = async (filters?: ProductFilters): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await api.get(`/products?${params.toString()}`);
  return response.data;
};

/**
 * Obtenir un produit par ID
 */
export const getProductById = async (id: string): Promise<ProductResponse> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/**
 * Mettre à jour un produit
 */
export const updateProduct = async (
  id: string,
  productData: {
    title?: string;
    description?: string;
    category?: string;
    subcategory?: string;
    type?: 'product' | 'service';
    price?: string;
    location?: string;
    condition?: 'new' | 'used' | 'refurbished';
    quantity?: string;
    delivery?: {
      available: boolean;
      cost?: string;
      areas?: string[];
      estimatedTime?: string;
    };
    availability?: {
      days: string[];
      openingTime: string;
      closingTime: string;
    };
    serviceArea?: string[];
    specifications?: Record<string, string>;
    status?: string;
    newImages?: string[]; // Nouvelles images à ajouter (base64)
    deleteImages?: string[]; // URLs des images à supprimer
  }
): Promise<ProductResponse> => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

/**
 * Supprimer un produit
 */
export const deleteProduct = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

/**
 * Obtenir mes annonces
 */
export const getMyProducts = async (
  status?: string,
  page: number = 1,
  limit: number = 20
): Promise<ProductsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }
  
  const response = await api.get(`/products/my/listings?${params.toString()}`);
  return response.data;
};

/**
 * Obtenir mes statistiques
 */
export const getMyStats = async (): Promise<StatsResponse> => {
  const response = await api.get('/products/my/stats');
  return response.data;
};

/**
 * Promouvoir un produit
 */
export const promoteProduct = async (
  id: string,
  promoted: boolean,
  featured: boolean
): Promise<ProductResponse> => {
  const response = await api.patch(`/products/${id}/promote`, {
    promoted,
    featured,
  });
  return response.data;
};

/**
 * Activer/désactiver une annonce
 */
export const toggleProductStatus = async (id: string): Promise<ProductResponse> => {
  const response = await api.patch(`/products/${id}/toggle-status`);
  return response.data;
};

/**
 * Convertir un fichier en base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convertir plusieurs fichiers en base64
 */
export const filesToBase64 = async (files: File[]): Promise<string[]> => {
  const base64Promises = files.map(file => fileToBase64(file));
  return Promise.all(base64Promises);
};
