import { api } from './auth';

export interface FavoriteResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface FavoritesListResponse {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Ajouter un produit aux favoris
 */
export const addFavorite = async (productId: string): Promise<FavoriteResponse> => {
  try {
    const response = await api.post(`/favorites/${productId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur ajout favori:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de l\'ajout aux favoris'
    );
  }
};

/**
 * Retirer un produit des favoris
 */
export const removeFavorite = async (productId: string): Promise<FavoriteResponse> => {
  try {
    const response = await api.delete(`/favorites/${productId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur suppression favori:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la suppression du favori'
    );
  }
};

/**
 * Obtenir mes favoris
 */
export const getMyFavorites = async (
  page: number = 1,
  limit: number = 20
): Promise<FavoritesListResponse> => {
  try {
    const response = await api.get(`/favorites?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur récupération favoris:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la récupération des favoris'
    );
  }
};

/**
 * Obtenir les IDs des favoris (pour vérification rapide)
 */
export const getFavoriteIds = async (): Promise<string[]> => {
  try {
    const response = await api.get('/favorites/ids');
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Erreur récupération IDs favoris:', error);
    // Retourner un tableau vide en cas d'erreur au lieu de throw
    return [];
  }
};

/**
 * Vérifier si un produit est dans mes favoris
 */
export const checkFavorite = async (productId: string): Promise<boolean> => {
  try {
    const response = await api.get(`/favorites/check/${productId}`);
    return response.data.data.isFavorite;
  } catch (error: any) {
    console.error('❌ Erreur vérification favori:', error);
    return false;
  }
};

/**
 * Toggle favori (ajouter ou retirer)
 */
export const toggleFavorite = async (productId: string, isFavorite: boolean): Promise<FavoriteResponse> => {
  if (isFavorite) {
    return removeFavorite(productId);
  } else {
    return addFavorite(productId);
  }
};
