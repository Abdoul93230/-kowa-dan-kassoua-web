import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  active: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  color?: string;
  subcategories: Subcategory[];
  active: boolean;
  order: number;
  productsCount: number;
  servicesCount: number;
  totalCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  count: number;
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
}

/**
 * Récupérer toutes les catégories actives
 */
export const getCategories = async (includeInactive = false): Promise<CategoriesResponse> => {
  try {
    const response = await axios.get(`${API_URL}/categories`, {
      params: { includeInactive: includeInactive ? 'true' : 'false' }
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur getCategories:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des catégories');
  }
};

/**
 * Récupérer une catégorie par son slug
 */
export const getCategoryBySlug = async (slug: string): Promise<CategoryResponse> => {
  try {
    const response = await axios.get(`${API_URL}/categories/${slug}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur getCategoryBySlug:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la catégorie');
  }
};

/**
 * Créer une nouvelle catégorie (Admin uniquement)
 */
export const createCategory = async (
  categoryData: Partial<Category>,
  token: string
): Promise<CategoryResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/categories`,
      categoryData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur createCategory:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de la catégorie');
  }
};

/**
 * Mettre à jour une catégorie (Admin uniquement)
 */
export const updateCategory = async (
  id: string,
  updates: Partial<Category>,
  token: string
): Promise<CategoryResponse> => {
  try {
    const response = await axios.put(
      `${API_URL}/categories/${id}`,
      updates,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur updateCategory:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la catégorie');
  }
};

/**
 * Supprimer (désactiver) une catégorie (Admin uniquement)
 */
export const deleteCategory = async (id: string, token: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/categories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur deleteCategory:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la catégorie');
  }
};

/**
 * Ajouter une sous-catégorie (Admin uniquement)
 */
export const addSubcategory = async (
  categoryId: string,
  subcategoryData: Partial<Subcategory>,
  token: string
): Promise<CategoryResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/categories/${categoryId}/subcategories`,
      subcategoryData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur addSubcategory:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout de la sous-catégorie');
  }
};

/**
 * Mettre à jour une sous-catégorie (Admin uniquement)
 */
export const updateSubcategory = async (
  categoryId: string,
  subcategoryId: string,
  updates: Partial<Subcategory>,
  token: string
): Promise<CategoryResponse> => {
  try {
    const response = await axios.put(
      `${API_URL}/categories/${categoryId}/subcategories/${subcategoryId}`,
      updates,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur updateSubcategory:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la sous-catégorie');
  }
};

/**
 * Supprimer une sous-catégorie (Admin uniquement)
 */
export const deleteSubcategory = async (
  categoryId: string,
  subcategoryId: string,
  token: string
): Promise<CategoryResponse> => {
  try {
    const response = await axios.delete(
      `${API_URL}/categories/${categoryId}/subcategories/${subcategoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur deleteSubcategory:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la sous-catégorie');
  }
};

/**
 * Mettre à jour les statistiques d'une catégorie (Admin uniquement)
 */
export const updateCategoryStats = async (
  categoryId: string,
  token: string
): Promise<CategoryResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/categories/${categoryId}/update-stats`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur updateCategoryStats:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour des statistiques');
  }
};

/**
 * Mettre à jour les statistiques de toutes les catégories (Admin uniquement)
 */
export const updateAllCategoriesStats = async (token: string): Promise<CategoriesResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/categories/update-all-stats`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur updateAllCategoriesStats:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour des statistiques');
  }
};
