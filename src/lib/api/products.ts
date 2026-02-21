// lib/api/products.ts
import { api } from './auth';

// ===============================================
// 📦 TYPES
// ===============================================
export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  type?: 'product' | 'service';
  condition?: string;
  location?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  seller?: string;
  status?: 'active' | 'expired' | 'sold';
  sort?: string; // '-createdAt', 'price', '-price', '-views', etc.
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductsResponse {
  success: boolean;
  data: any[]; // Type Item from @/types/index
  pagination: PaginationInfo;
}

export interface ProductResponse {
  success: boolean;
  data: any; // Type Item from @/types/index
}

// ===============================================
// 📋 RÉCUPÉRER LES PRODUITS (AVEC FILTRES)
// ===============================================
/**
 * Récupérer la liste des produits avec filtres et pagination
 * @param filters - Filtres de recherche
 * @returns Liste de produits avec pagination
 */
export const getProducts = async (filters?: ProductFilters): Promise<ProductsResponse> => {
  try {
    // Construire les query params
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.subcategory) params.append('subcategory', filters.subcategory);
      if (filters.type) params.append('type', filters.type);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.location) params.append('location', filters.location);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.seller) params.append('seller', filters.seller);
      if (filters.status) params.append('status', filters.status);
      if (filters.sort) params.append('sort', filters.sort);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    
    const response = await api.get<ProductsResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur récupération produits:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la récupération des produits'
    );
  }
};

// ===============================================
// 🔍 RÉCUPÉRER UN PRODUIT PAR ID
// ===============================================
/**
 * Récupérer les détails d'un produit
 * @param id - ID du produit
 * @returns Détails du produit
 */
export const getProductById = async (id: string): Promise<ProductResponse> => {
  try {
    const response = await api.get<ProductResponse>(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur récupération produit:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la récupération du produit'
    );
  }
};

// ===============================================
// ✏️ METTRE À JOUR UN PRODUIT
// ===============================================
/**
 * Mettre à jour un produit existant
 * @param id - ID du produit
 * @param data - Données à mettre à jour
 * @returns Produit mis à jour
 */
export const updateProduct = async (id: string, data: any): Promise<ProductResponse> => {
  try {
    const response = await api.put<ProductResponse>(`/products/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur mise à jour produit:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la mise à jour du produit'
    );
  }
};

// ===============================================
// 🗑️ SUPPRIMER UN PRODUIT
// ===============================================
/**
 * Supprimer un produit
 * @param id - ID du produit
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/products/${id}`);
  } catch (error: any) {
    console.error('❌ Erreur suppression produit:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la suppression du produit'
    );
  }
};

// ===============================================
// 🔄 CHANGER LE STATUT D'UN PRODUIT
// ===============================================
/**
 * Activer/Désactiver un produit
 * @param id - ID du produit
 * @returns Produit mis à jour
 */
export const toggleProductStatus = async (id: string): Promise<ProductResponse> => {
  try {
    const response = await api.patch<ProductResponse>(`/products/${id}/toggle-status`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur changement statut:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors du changement de statut'
    );
  }
};

// ===============================================
// ⭐ PROMOUVOIR UN PRODUIT
// ===============================================
/**
 * Promouvoir un produit
 * @param id - ID du produit
 * @param duration - Durée en jours
 * @returns Produit mis à jour
 */
export const promoteProduct = async (id: string, duration: number): Promise<ProductResponse> => {
  try {
    const response = await api.patch<ProductResponse>(`/products/${id}/promote`, { duration });
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur promotion produit:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la promotion du produit'
    );
  }
};

// ===============================================
// 📊 RÉCUPÉRER MES PRODUITS
// ===============================================
/**
 * Récupérer mes annonces (utilisateur connecté)
 * @param filters - Filtres de recherche
 * @returns Liste de mes produits
 */
export const getMyProducts = async (filters?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ProductsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/products/my/listings?${queryString}` : '/products/my/listings';
    
    const response = await api.get<ProductsResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur récupération mes produits:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la récupération de vos annonces'
    );
  }
};

// ===============================================
// 📈 RÉCUPÉRER MES STATISTIQUES
// ===============================================
/**
 * Récupérer les statistiques de mes annonces
 * @returns Statistiques
 */
export const getMyStats = async (): Promise<any> => {
  try {
    const response = await api.get('/products/my/stats');
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur récupération stats:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la récupération des statistiques'
    );
  }
};

// ===============================================
// 📍 RÉCUPÉRER LES LOCALISATIONS
// ===============================================
/**
 * Récupérer les localisations uniques des produits actifs
 * @returns Liste des localisations
 */
export const getLocations = async (): Promise<string[]> => {
  try {
    const response = await api.get<{ success: boolean; data: string[] }>('/products/locations');
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Erreur récupération localisations:', error);
    // Retourner une liste par défaut en cas d'erreur
    return [];
  }
};
