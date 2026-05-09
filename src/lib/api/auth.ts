// lib/api/auth.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Configuration axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variables pour gérer le refresh automatique
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer le refresh automatique des tokens
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si l'erreur n'est pas 401 ou si c'est déjà une tentative de retry, rejeter
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si c'est une route de refresh ou d'authentification, ne pas retry
    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      // Pour login/register, rejeter l'erreur directement (pas de déconnexion)
      // L'erreur sera gérée par le composant (ex: "Mot de passe incorrect")
      return Promise.reject(error);
    }

    // Si un refresh est déjà en cours, mettre cette requête en attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      console.warn('⚠️ Pas de refresh token - Déconnexion');
      await handleLogout();
      return Promise.reject(error);
    }

    try {
      // Tenter de rafraîchir le token
      console.log('🔄 Rafraîchissement automatique du token...');
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken } = response.data.data;

      // Sauvegarder le nouveau token
      localStorage.setItem('accessToken', accessToken);

      // Mettre à jour le header de la requête originale
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Traiter toutes les requêtes en attente
      processQueue(null, accessToken);

      // Réessayer la requête originale
      console.log('✅ Token rafraîchi avec succès');
      return api(originalRequest);
    } catch (refreshError) {
      // Si le refresh échoue, déconnecter l'utilisateur
      console.error('❌ Échec du rafraîchissement du token');
      processQueue(refreshError, null);
      await handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Fonction pour gérer la déconnexion automatique
const handleLogout = async () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Déclencher l'événement pour mettre à jour le Header
  window.dispatchEvent(new Event('storage'));
  
  // Rediriger vers la page de connexion avec un message
  if (typeof window !== 'undefined') {
    window.location.href = '/login?session_expired=true';
  }
};

// Types
export interface RegisterData {
  // Étape 1
  name: string;
  phone: string;          // Format: "+227 12345678"
  whatsapp?: string;      // Format: "+227 98765432"
  email?: string;
  password: string;
  // Étape 2
  businessType: 'individual' | 'professional';
  businessName: string;
  description?: string;
  location: string;
  avatar?: string | null;
}

export interface LoginData {
  loginType: 'phone' | 'email';
  phone?: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      phone: string;
      email?: string;
      avatar?: string;
      businessName: string;
      businessType: string;
      location: string;
      role: string;
      verified: boolean;
      sellerStats?: {
        rating: number;
        totalReviews: number;
        responseTime: string;
        responseRate: number;
        totalListings: number;
        categories: string[];
      };
      memberSince: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

// ===============================================
// 📝 INSCRIPTION
// ===============================================
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Sauvegarder les tokens
    if (response.data.success && response.data.data.tokens) {
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de l\'inscription'
    );
  }
};

// ===============================================
// 🔐 CONNEXION
// ===============================================
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Sauvegarder les tokens
    if (response.data.success && response.data.data.tokens) {
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la connexion'
    );
  }
};

// ===============================================
// 🚪 DÉCONNEXION
// ===============================================
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  } finally {
    // Nettoyer le localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// ===============================================
// 👤 OBTENIR PROFIL
// ===============================================
export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la récupération du profil'
    );
  }
};

// ===============================================
// 🔄 REFRESH TOKEN
// ===============================================
export const refreshToken = async (): Promise<string> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await api.post('/auth/refresh', { refreshToken });
    
    const newAccessToken = response.data.data.accessToken;
    localStorage.setItem('accessToken', newAccessToken);
    
    return newAccessToken;
  } catch (error) {
    // Si le refresh échoue, déconnecter l'utilisateur
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    throw error;
  }
};

// ===============================================
// 🔐 MOT DE PASSE OUBLIÉ
// ===============================================
/**
 * Demander un code de réinitialisation
 * @param identifier - Email ou numéro de téléphone
 */
export const forgotPassword = async (identifier: string) => {
  try {
    const response = await api.post('/auth/forgot-password', { identifier });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la demande de réinitialisation'
    );
  }
};

/**
 * Vérifier le code de réinitialisation (sans changer le mot de passe)
 * @param identifier - Email ou numéro de téléphone
 * @param code - Code OTP reçu
 */
export const verifyResetCode = async (identifier: string, code: string) => {
  try {
    const response = await api.post('/auth/verify-reset-code', {
      identifier,
      code
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la vérification du code'
    );
  }
};

/**
 * Réinitialiser le mot de passe avec le code OTP
 * @param identifier - Email ou numéro de téléphone
 * @param code - Code OTP reçu
 * @param newPassword - Nouveau mot de passe
 */
export const resetPassword = async (identifier: string, code: string, newPassword: string) => {
  try {
    const response = await api.post('/auth/reset-password', {
      identifier,
      code,
      newPassword
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la réinitialisation'
    );
  }
};

// ===============================================
// 🔍 UTILITAIRES
// ===============================================
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const formatPhoneForAPI = (countryCode: string, number: string): string => {
  // Nettoyer le numéro (enlever espaces et caractères non-numériques)
  const cleanNumber = number.replace(/\D/g, '');
  
  console.log('📱 Formatage téléphone:', { countryCode, number, cleanNumber });
  
  if (!cleanNumber) {
    throw new Error('Le numéro de téléphone est requis');
  }
  
  if (cleanNumber.length < 6) {
    throw new Error('Le numéro de téléphone doit contenir au moins 6 chiffres');
  }
  
  const formatted = `${countryCode} ${cleanNumber}`;
  console.log('✅ Téléphone formaté:', formatted);
  return formatted;
};

// ===============================================
// 📱 OTP (INSCRIPTION UNIQUEMENT)
// ===============================================
/**
 * Envoyer un code OTP pour inscription
 * @param phone - Numéro de téléphone
 * @note Pour réinitialisation de mot de passe, utiliser forgotPassword()
 */
export const sendOTP = async (phone: string) => {
  try {
    console.log('📤 Envoi OTP avec téléphone:', phone);
    const response = await api.post('/auth/send-otp', { phone });
    console.log('✅ Réponse OTP:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur envoi OTP:', error.response?.data);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de l\'envoi du code'
    );
  }
};

export const verifyOTP = async (phone: string, code: string) => {
  try {
    const response = await api.post('/auth/verify-otp', { phone, code });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      'Erreur lors de la vérification du code'
    );
  }
};

// ── QuickAuth helpers ─────────────────────────────────────────────────────────

export const checkPhone = async (phone: string): Promise<{ success: boolean; data: { exists: boolean } }> => {
  try {
    const response = await api.post('/auth/check-phone', { phone });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erreur de vérification');
  }
};

export const quickRegister = async (data: { name: string; phone: string }): Promise<{
  success: boolean;
  data: { user: any; tokens: { accessToken: string; refreshToken: string } };
  devTempPassword?: string;
}> => {
  try {
    const response = await api.post('/auth/quick-register', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la création du compte');
  }
};

// ── Profil utilisateur ────────────────────────────────────────────────────────

export const updateProfile = async (data: {
  name?: string;
  email?: string;
  whatsapp?: string;
  description?: string;
  businessType?: string;
  businessName?: string;
  location?: string;
  avatarFile?: File | null;
}) => {
  try {
    const { avatarFile, ...fields } = data;
    if (avatarFile) {
      const form = new FormData();
      Object.entries(fields).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, v as string);
      });
      form.append('avatar', avatarFile);
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(`${API_URL}/auth/profile`, form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    }
    const response = await api.put('/auth/profile', fields);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
  }
};

export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  try {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
  }
};

/**
 * Récupérer le profil public d'un vendeur
 */
export const getSellerProfile = async (sellerId: string) => {
  try {
    const response = await api.get(`/auth/seller/${sellerId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur récupération profil vendeur:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la récupération du profil vendeur'
    );
  }
};
