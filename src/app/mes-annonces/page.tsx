'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/home/Header';
import { Footer } from '../../components/home/Footer';
import { mockItems } from '../../../lib/mockData';
import { Item } from '../../../types/index';
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
  Pause,
  Play,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Récupérer toutes les annonces de l'utilisateur connecté (simulé)
  const allItems: Item[] = Object.values(mockItems).flat();
  const myListings = allItems.filter(item => item.sellerId === 'seller_001'); // Simuler l'utilisateur connecté

  // Statistiques
  const stats = {
    total: myListings.length,
    active: myListings.filter(item => item.status === 'active').length,
    expired: myListings.filter(item => item.status === 'expired').length,
    totalViews: myListings.reduce((sum, item) => sum + item.views, 0),
    // totalFavorites: myListings.reduce((sum, item) => sum + item.favorites, 0),
  };

  // Filtrer les annonces
  const filteredListings = myListings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleEdit = (item: Item) => {
    // Stocker les données dans localStorage pour pré-remplir le formulaire
    localStorage.setItem('editItem', JSON.stringify(item));
    router.push(`/publish?edit=${item.id}`);
  };

  const handleDelete = (itemId: number) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      // Logique de suppression (à implémenter avec l'API backend)
      console.log('Suppression de l\'annonce:', itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleView = (itemId: number) => {
    router.push(`/items/${itemId}`);
  };

  const handleToggleStatus = (itemId: number, currentStatus: string) => {
    // Logique pour activer/désactiver une annonce
    console.log('Toggle status pour:', itemId, currentStatus);
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
      case 'expired':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            <XCircle className="h-3 w-3 mr-1" />
            Expiré
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <Header />
      </Suspense>

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
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-white border-2 border-green-200 hover:border-green-400 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <p className="text-xs sm:text-sm text-gray-600">Actives</p>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.active}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-white border-2 border-gray-200 hover:border-gray-400 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                <p className="text-xs sm:text-sm text-gray-600">Expirées</p>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.expired}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-white border-2 border-blue-200 hover:border-blue-400 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <p className="text-xs sm:text-sm text-gray-600">Vues</p>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalViews}</p>
            </Card>
            {/* <Card className="p-3 sm:p-4 bg-white border-2 border-amber-200 hover:border-amber-400 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                <p className="text-xs sm:text-sm text-gray-600">Favoris</p>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalFavorites}</p>
            </Card> */}
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
                      <Button
                        onClick={() => handleDelete(item.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(item.id, item.status)}
                          >
                            {item.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
