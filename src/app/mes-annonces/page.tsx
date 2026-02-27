'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuth';
import { getMyProducts, getMyStats, deleteProduct, toggleProductStatus, type Product } from '@/lib/api/product';
import { Header } from '../../components/home/Header';
import { Footer } from '../../components/home/Footer';
import {
  Package,
  Briefcase,
  Edit2,
  Trash2,
  Eye,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Heart,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function MyListingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthGuard();
  
  const [myListings, setMyListings] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalSold: 0,
    totalViews: 0,
    totalFavorites: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const itemsPerPage = 20;

  // Charger les données
  useEffect(() => {
    if (!authLoading && user) {
      // Reset à la page 1 si le filtre change
      setCurrentPage(1);
      setMyListings([]);
      loadData(1);
    }
  }, [authLoading, user, filterStatus]);

  const loadData = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      // Charger les annonces et les stats en parallèle
      const [productsResponse, statsResponse] = await Promise.all([
        getMyProducts(filterStatus === 'all' ? undefined : filterStatus, page, itemsPerPage),
        getMyStats()
      ]);
      
      if (append) {
        // Append à la liste existante
        setMyListings(prev => [...prev, ...productsResponse.data]);
      } else {
        // Remplacer la liste
        setMyListings(productsResponse.data);
      }
      
      setTotalPages(productsResponse.pagination.pages);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };
  
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadData(nextPage, true); // append = true
  };

  // Filtrer localement par recherche et type
  const filteredListings = myListings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleEdit = (item: Product) => {
    // Stocker les données dans localStorage pour pré-remplir le formulaire
    localStorage.setItem('editItem', JSON.stringify(item));
    router.push(`/publish?edit=${item.id}`);
  };

  const handleDelete = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };
  
  const handleToggleStatus = async (itemId: string) => {
    try {
      setTogglingStatus(itemId);
      await toggleProductStatus(itemId);
      
      // Recharger les données pour refléter le changement
      setCurrentPage(1);
      setMyListings([]);
      await loadData(1);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert('Erreur lors du changement de statut de l\'annonce');
    } finally {
      setTogglingStatus(null);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteProduct(itemToDelete);
      
      // Recharger les données (reset à page 1)
      setCurrentPage(1);
      setMyListings([]);
      await loadData(1);
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (itemId: string) => {
    router.push(`/items/${itemId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'sold':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Vendu
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            <XCircle className="h-3 w-3 mr-1" />
            Expiré
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
          <Header />
        </Suspense>
        <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#ec5a13] mx-auto mb-4" />
            <p className="text-gray-600">Chargement de vos annonces...</p>
          </div>
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

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="bg-[#ffe9de] border-b-4 border-[#ec5a13]">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-[#ec5a13]">Mes Annonces</h1>
              <p className="text-gray-700 text-sm sm:text-base">Gérez vos produits et services publiés</p>
            </div>
            <Button
              onClick={() => router.push('/publish')}
              className="bg-[#ec5a13] text-white hover:bg-[#d94f0f] font-semibold px-6 py-3"
            >
              <Package className="h-5 w-5 mr-2" />
              Nouvelle annonce
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Card className="p-3 sm:p-4 bg-white border-2 border-[#ec5a13]/20 hover:border-[#ec5a13] transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#ec5a13]" />
                <p className="text-xs sm:text-sm text-gray-600">Actives</p>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalActive}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-white border-2 border-blue-200 hover:border-blue-400 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <p className="text-xs sm:text-sm text-gray-600">Vendues</p>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalSold}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-white border-2 border-purple-200 hover:border-purple-400 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <p className="text-xs sm:text-sm text-gray-600">Vues</p>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalViews}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-white border-2 border-pink-200 hover:border-pink-400 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                <p className="text-xs sm:text-sm text-gray-600">Favoris</p>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalFavorites}</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="container mx-auto px-4 py-6">
        <Card className="p-4 sm:p-6 mb-6 border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher dans mes annonces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px] h-12">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px] h-12">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="product">Produits</SelectItem>
                  <SelectItem value="service">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Liste des annonces */}
        {filteredListings.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-md mx-auto">
              <div className="bg-[#ffe9de] w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-[#ec5a13]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Aucune annonce trouvée'
                  : 'Aucune annonce publiée'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Aucune annonce ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                  : 'Commencez dès maintenant à vendre vos produits ou offrir vos services sur notre plateforme.'}
              </p>
              <Button
                onClick={() => router.push('/publish')}
                className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white px-6 sm:px-8 py-3 text-base sm:text-lg"
              >
                <Package className="h-5 w-5 mr-2" />
                {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Voir toutes mes annonces'
                  : 'Publier ma première annonce'}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{filteredListings.length}</span> annonce{filteredListings.length > 1 ? 's' : ''} trouvée{filteredListings.length > 1 ? 's' : ''}
                {currentPage < totalPages && (
                  <span className="ml-2 text-xs text-gray-500">
                    (page {currentPage} sur {totalPages})
                  </span>
                )}
              </p>
            </div>
            {filteredListings.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-[#ec5a13]/30"
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  {/* Image */}
                  <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden group">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.promoted && (
                      <Badge className="absolute top-2 left-2 bg-amber-500 text-white shadow-lg">
                        ⭐ Vedette
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2">
                      {item.type === 'service' ? (
                        <Badge className="bg-blue-600 text-white shadow-lg text-sm px-2.5 py-1">
                          <span className="mr-1">🛠️</span>
                          Service
                        </Badge>
                      ) : (
                        <Badge className="bg-[#ec5a13] text-white shadow-lg text-sm px-2.5 py-1">
                          <span className="mr-1">📦</span>
                          Produit
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">
                          {item.title}
                        </h3>
                        <p className="text-lg sm:text-xl font-bold text-[#ec5a13] mb-2">
                          {item.price}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{item.location}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Il y a {item.postedTime}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{item.views.toLocaleString()} vues</span>
                      </div>
                      {/* <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{item.favorites} favoris</span>
                      </div> */}
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span>{item.rating} ({item.totalReviews} avis)</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleView(item.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        onClick={() => handleEdit(item)}
                        variant="outline"
                        size="sm"
                        className="border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de] flex-1 sm:flex-none"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none"
                            disabled={togglingStatus === item.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(item.id)}
                            disabled={togglingStatus === item.id || item.status === 'sold'}
                          >
                            {togglingStatus === item.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Chargement...
                              </>
                            ) : item.status === 'active' ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2 text-orange-500" />
                                Désactiver l'annonce
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                Activer l'annonce
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Bouton Charger plus */}
            {currentPage < totalPages && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px] border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de]"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      Charger plus
                      <span className="ml-2 text-xs text-gray-500">
                        ({currentPage}/{totalPages})
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </main>

      <Footer />
    </div>
  );
}
