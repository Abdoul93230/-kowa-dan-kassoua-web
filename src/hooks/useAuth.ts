'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/api/auth';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  avatar?: string;
  businessType: 'individual' | 'professional';
  businessName: string;
  description?: string;
  location: string;
  rating?: number;
  totalSales?: number;
  memberSince?: string;
}

/**
 * Hook personnalisé pour gérer l'authentification
 * 
 * Features:
 * - État d'authentification réactif
 * - Synchronisation cross-tabs (via storage events)
 * - Fonctions login/logout/refresh
 * - Redirection automatique
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, loading, logout } = useAuth();
 *   
 *   if (loading) return <Spinner />;
 *   if (!isAuthenticated) return <LoginPrompt />;
 *   
 *   return <div>Bonjour {user.name}</div>;
 * }
 * ```
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Charger l'utilisateur depuis localStorage
   */
  const loadUser = () => {
    try {
      const isAuth = authApi.isAuthenticated();
      if (isAuth) {
        const currentUser = authApi.getCurrentUser();
        const accessToken = localStorage.getItem('accessToken');
        setUser(currentUser);
        setToken(accessToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Écouter les changements d'authentification (login/logout dans un autre onglet)
   */
  useEffect(() => {
    // Charger initial
    loadUser();

    // Écouter les changements de storage (cross-tabs)
    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * Connexion
   */
  const login = async (identifier: string, password: string) => {
    // Détecter si c'est un email ou un téléphone
    const isEmail = identifier.includes('@');
    const loginData = {
      loginType: isEmail ? 'email' as const : 'phone' as const,
      [isEmail ? 'email' : 'phone']: identifier,
      password
    };
    
    const response = await authApi.login(loginData);
    loadUser();
    return response;
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  /**
   * Rafraîchir le token manuellement (optionnel, l'interceptor le fait automatiquement)
   */
  const refreshTokenManually = async () => {
    try {
      await authApi.refreshToken();
      loadUser();
      return true;
    } catch (error) {
      console.error('Échec du refresh manuel:', error);
      await logout();
      return false;
    }
  };

  /**
   * Protéger une route (rediriger si non authentifié)
   */
  const requireAuth = (redirectTo: string = '/login') => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  };

  /**
   * Empêcher l'accès (rediriger si authentifié)
   * Utile pour les pages login/register
   */
  const requireGuest = (redirectTo: string = '/') => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  };

  return {
    // État
    user,
    token,
    isAuthenticated: !!user,
    loading,
    
    // Actions
    login,
    logout,
    refreshToken: refreshTokenManually,
    
    // Guards
    requireAuth,
    requireGuest,
    
    // Utilitaires
    reload: loadUser,
  };
}

/**
 * Hook pour protéger une page (redirection automatique si non authentifié)
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { user, loading } = useAuthGuard();
 *   
 *   if (loading) return <Spinner />;
 *   
 *   // Si on arrive ici, user est forcément connecté
 *   return <div>Page protégée pour {user.name}</div>;
 * }
 * ```
 */
export function useAuthGuard(redirectTo: string = '/login') {
  const auth = useAuth();

  useEffect(() => {
    auth.requireAuth(redirectTo);
  }, [auth.loading, auth.user]);

  return auth;
}

/**
 * Hook pour empêcher l'accès aux pages guest (login/register)
 * 
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { loading } = useGuestGuard();
 *   
 *   if (loading) return <Spinner />;
 *   
 *   // Si on arrive ici, user n'est PAS connecté
 *   return <LoginForm />;
 * }
 * ```
 */
export function useGuestGuard(redirectTo: string = '/') {
  const auth = useAuth();

  useEffect(() => {
    auth.requireGuest(redirectTo);
  }, [auth.loading, auth.user]);

  return auth;
}
