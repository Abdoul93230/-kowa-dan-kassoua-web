'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toggleFavorite as toggleFavoriteAPI, getFavoriteIds } from '@/lib/api/favorites';
import { useAuth } from '@/hooks/useAuth';

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  loading: boolean;
  isToggling: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  // Charger les favoris quand l'utilisateur est connecté
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavorites(new Set());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const favoriteIds = await getFavoriteIds();
        setFavorites(new Set(favoriteIds));
      } catch (error) {
        console.error('Erreur chargement favoris:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  // Vérifier si un produit est en favoris
  const isFavorite = useCallback((productId: string) => {
    return favorites.has(productId);
  }, [favorites]);

  // Toggle favori
  const toggleFavorite = useCallback(async (productId: string) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour gérer vos favoris');
    }

    // Éviter les clics multiples
    if (toggling.has(productId)) {
      return;
    }

    const wasFavorite = favorites.has(productId);

    // Optimistic update
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (wasFavorite) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    // Marquer comme en cours
    setToggling(prev => new Set(prev).add(productId));

    try {
      await toggleFavoriteAPI(productId, wasFavorite);
    } catch (error) {
      // Rollback en cas d'erreur
      setFavorites(prev => {
        const newSet = new Set(prev);
        if (wasFavorite) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });
      
      console.error('Erreur toggle favori:', error);
      throw error;
    } finally {
      // Retirer du set de toggling
      setToggling(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [favorites, toggling, user]);

  return (
    <FavoritesContext.Provider value={{
      favorites: Array.from(favorites),
      isFavorite,
      toggleFavorite,
      loading,
      isToggling: (productId: string) => toggling.has(productId)
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
