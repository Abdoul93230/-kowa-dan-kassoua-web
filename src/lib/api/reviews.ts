import { api } from './auth';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewsResponse {
  success: boolean;
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface ReviewStatsResponse {
  success: boolean;
  data: ReviewStats;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
}

/**
 * Créer un nouvel avis pour un produit
 */
export const createReview = async (data: CreateReviewData): Promise<{ success: boolean; data: Review; message: string }> => {
  try {
    const response = await api.post<{ success: boolean; data: Review; message: string }>('/reviews', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur création avis:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la création de l\'avis'
    );
  }
};

/**
 * Récupérer les avis d'un produit
 */
export const getProductReviews = async (
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewsResponse> => {
  try {
    const response = await api.get<ReviewsResponse>(`/reviews/product/${productId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur récupération avis:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la récupération des avis'
    );
  }
};

/**
 * Récupérer les statistiques d'avis d'un produit
 */
export const getReviewStats = async (productId: string): Promise<ReviewStatsResponse> => {
  try {
    const response = await api.get<ReviewStatsResponse>(`/reviews/product/${productId}/stats`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur récupération stats avis:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la récupération des statistiques'
    );
  }
};

/**
 * Supprimer un avis
 */
export const deleteReview = async (reviewId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(`/reviews/${reviewId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur suppression avis:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la suppression de l\'avis'
    );
  }
};

/**
 * Marquer un avis comme utile
 */
export const markReviewHelpful = async (reviewId: string): Promise<{ success: boolean; data: { helpful: number } }> => {
  try {
    const response = await api.post<{ success: boolean; data: { helpful: number } }>(`/reviews/${reviewId}/helpful`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur marquage avis utile:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors du marquage de l\'avis'
    );
  }
};
