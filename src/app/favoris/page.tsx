'use client';

import { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { ItemCard } from '@/components/CategoryPage/ItemCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, ShoppingBag, Grid3x3, List } from 'lucide-react';
import { getMyFavorites } from '@/lib/api/favorites';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Item } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FavorisPage() {
  const router = useRouter();
  const [favoritesList, setFavoritesList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { favorites: favoritesIds } = useFavorites(); // IDs des favoris du contexte

  // Charger les favoris
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getMyFavorites(currentPage, 20);
        setFavoritesList(response.data);
        setTotalPages(response.pagination.pages);
      } catch (err: any) {
        console.error('❌ Erreur chargement favoris:', err);
        
        // Si erreur d'authentification, rediriger vers login
        if (err.message?.includes('authentification') || err.message?.includes('connecté')) {
          router.push('/login?redirect=/favoris');
          return;
        }
        
        setError(err.message || 'Erreur lors du chargement des favoris');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentPage, router]);

  // Filtrer les favoris affichés selon le contexte (synchronisation en temps réel)
  const displayedFavorites = favoritesList.filter(item => 
    favoritesIds.includes(String(item.id))
  );

  // Si tous les favoris de la page actuelle sont retirés, revenir à la page précédente
  useEffect(() => {
    if (!loading && favoritesList.length > 0 && displayedFavorites.length === 0 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [displayedFavorites.length, favoritesList.length, loading, currentPage]);

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
          <Header />
        </Suspense>
        <div className="container mx-auto px-4 py-16 flex-1">
          <Card className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-[#ec5a13] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement de vos favoris...</p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
          <Header />
        </Suspense>
        <div className="container mx-auto px-4 py-16 flex-1">
          <Card className="p-12 text-center border-red-200">
            <div className="text-red-500 mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-[#ec5a13] hover:bg-[#d94f0f]"
            >
              Réessayer
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <Header />
      </Suspense>

      {/* Bandeau orange */}
      <div className="border-b-4 border-[#ec5a13] bg-[#ffe9de]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#ec5a13] p-3 rounded-lg">
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#ec5a13]">
                Mes Favoris
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {displayedFavorites.length > 0 
                  ? `${displayedFavorites.length} article${displayedFavorites.length > 1 ? 's' : ''} en favoris`
                  : 'Aucun article en favoris pour le moment'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        {displayedFavorites.length === 0 ? (
          // État vide
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Aucun favori pour le moment
              </h2>
              <p className="text-gray-600 mb-8">
                Parcourez nos annonces et ajoutez vos produits préférés à vos favoris en cliquant sur l'icône ❤️
              </p>
              <Link href="/categories/tous">
                <Button className="bg-[#ec5a13] hover:bg-[#d94f0f]">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Parcourir les annonces
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            {/* Barre d'actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </p>
              </div>

              {/* Toggle vue liste/grille */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#ec5a13] hover:bg-[#d94f0f]' : ''}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-[#ec5a13] hover:bg-[#d94f0f]' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Grille de produits */}
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                : 'flex flex-col gap-4'
            }>
              {displayedFavorites.map((item) => (
                <ItemCard key={item.id} item={item} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de]"
                >
                  Précédent
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de]"
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
