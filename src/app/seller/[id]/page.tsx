'use client';

import { Suspense, useState, use, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { mockItems, sellers } from '@/lib/mockData';
import { Item } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Star,
  MapPin,
  Package,
  Briefcase,
  BadgeCheck,
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Globe,
  ArrowLeft,
  Filter,
  Grid3x3,
  List,
  Clock,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { SellerQRCode } from '@/components/seller/SellerQRCode';

export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sellerId = resolvedParams.id;
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  // Récupérer le vendeur
  const seller = sellers[sellerId];

  // Récupérer tous les items du vendeur
  const allItems: Item[] = Object.values(mockItems).flat();
  const sellerItems = allItems.filter(item => item.sellerId === sellerId);

  // Filtrer par type
  const filteredItems = filterType === 'all'
    ? sellerItems
    : sellerItems.filter(item => item.type === filterType);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Réinitialiser la page actuelle quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll vers le haut de la liste
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction pour calculer la distance
  const getDistance = (itemId: number) => {
    const distances = [0.5, 1.2, 2.3, 3.5, 4.8, 5.1, 6.7, 8.2, 10.5];
    return distances[itemId % distances.length];
  };

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
          <Header />
        </Suspense>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendeur introuvable</h1>
          <Link href="/">
            <Button className="bg-[#ec5a13] hover:bg-[#d94f0f]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <Header />
      </Suspense>

      {/* Hero Section avec info vendeur */}
      <div className="bg-[#ffe9de] border-b-4 border-[#ec5a13]">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <Link href="/">
            <Button variant="ghost" className="text-[#ec5a13] hover:bg-[#ec5a13]/10 mb-4 sm:mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar */}
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-xl">
              <AvatarImage src={seller.avatar} alt={seller.name} />
              <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-[#ec5a13]">
                {seller.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            {/* Infos vendeur */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{seller.name}</h1>
                {seller.verified && (
                  <Badge className="bg-white text-[#ec5a13] hover:bg-white/90">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-sm sm:text-base mb-3 sm:mb-4 text-gray-700">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{seller.rating.toFixed(1)}</span>
                  <span>({seller.totalReviews} avis)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#ec5a13]" />
                  <span>{seller.location}</span>
                </div>
              </div>

              {seller.bio && (
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 max-w-2xl mx-auto sm:mx-0">
                  {seller.bio}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-md mx-auto sm:mx-0 mb-6 sm:mb-8">
                <div className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-[#ec5a13]">{sellerItems.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Annonces</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-[#ec5a13]">{seller.totalReviews}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Avis</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-[#ec5a13]">{seller.responseRate}%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Réponse</div>
                </div>
              </div>

              {/* Boutons de contact */}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {seller.contactInfo.phone && (
                  <Button
                    variant="outline"
                    className="bg-white text-[#ec5a13] hover:bg-[#ec5a13] hover:text-white border-2 border-[#ec5a13]"
                    onClick={() => window.location.href = `tel:${seller.contactInfo.phone}`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                )}
                {seller.contactInfo.whatsapp && (
                  <Button
                    variant="outline"
                    className="bg-white text-green-700 hover:bg-green-600 hover:text-white border-2 border-green-600"
                    onClick={() => window.open(`https://wa.me/${seller.contactInfo.whatsapp?.replace(/\D/g, '')}`, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                {seller.contactInfo.email && (
                  <Button
                    variant="outline"
                    className="bg-white text-gray-700 hover:bg-gray-700 hover:text-white border-2 border-gray-300"
                    onClick={() => window.location.href = `mailto:${seller.contactInfo.email}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                )}

                {/* QR Code Button */}
                <SellerQRCode sellerId={sellerId} sellerName={seller.name} />

                {(seller.contactInfo.facebook || seller.contactInfo.instagram || seller.contactInfo.website) && (
                  <div className="flex gap-2">
                    {seller.contactInfo.facebook && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white border-2 border-blue-600 rounded-full"
                        onClick={() => window.open(seller.contactInfo.facebook, '_blank')}
                      >
                        <Facebook className="h-4 w-4" />
                      </Button>
                    )}
                    {seller.contactInfo.instagram && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-white text-pink-600 hover:bg-pink-600 hover:text-white border-2 border-pink-600 rounded-full"
                        onClick={() => window.open(seller.contactInfo.instagram, '_blank')}
                      >
                        <Instagram className="h-4 w-4" />
                      </Button>
                    )}
                    {seller.contactInfo.website && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-white text-gray-700 hover:bg-gray-700 hover:text-white border-2 border-gray-300 rounded-full"
                        onClick={() => window.open(seller.contactInfo.website, '_blank')}
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et Vue */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              Toutes les annonces
              {filteredItems.length > itemsPerPage && (
                <span className="ml-2 text-sm sm:text-base font-normal text-gray-600">
                  (page {currentPage} sur {totalPages})
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600">
              {filteredItems.length} annonce{filteredItems.length > 1 ? 's' : ''} trouvée{filteredItems.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="product">Produits</SelectItem>
                <SelectItem value="service">Services</SelectItem>
              </SelectContent>
            </Select>

            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Par page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 par page</SelectItem>
                <SelectItem value="12">12 par page</SelectItem>
                <SelectItem value="16">16 par page</SelectItem>
                <SelectItem value="24">24 par page</SelectItem>
              </SelectContent>
            </Select>

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
        </div>

        {/* Liste des annonces */}
        {filteredItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune annonce trouvée</h3>
            <p className="text-gray-600">Ce vendeur n'a pas d'annonces dans cette catégorie.</p>
          </Card>
        ) : (
          <>
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
              : 'flex flex-col gap-4'
            }>
              {paginatedItems.map((item) => {
                const distance = getDistance(item.id);
                const isService = item.type === 'service';

                // Mode liste
                if (viewMode === 'list') {
                  return (
                    <Link
                      key={item.id}
                      href={`/items/${item.id}`}
                      className="block group"
                    >
                      <Card className="group overflow-hidden border-gray-200 hover:border-[#ec5a13] hover:shadow-xl transition-all duration-300 cursor-pointer bg-white p-0 gap-0">
                        {/* Version mobile - style grille */}
                        <div className="md:hidden">
                          <div className="relative h-28 sm:h-32 md:h-36 lg:h-40 xl:h-44 overflow-hidden bg-gray-200">
                            <img
                              src={item.mainImage}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <Badge className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-white/90 backdrop-blur-sm text-gray-700 flex items-center gap-1 sm:gap-1.5 shadow-md text-xs px-2 py-1 rounded-lg border-0">
                              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              <span className="font-medium">Il y a {item.postedTime}</span>
                            </Badge>
                          </div>

                          <div className="p-3 flex flex-col gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm sm:text-base flex-shrink-0 w-4 sm:w-5">
                                {isService ? '🛠️' : '📦'}
                              </span>
                              <h3 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-[#ec5a13] transition-colors truncate flex-1">
                                {item.title}
                              </h3>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                              <div className="w-4 sm:w-5 flex-shrink-0 flex items-center justify-center">
                                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#ec5a13]" />
                              </div>
                              <span className="truncate">{item.location}</span>
                              <span className="text-gray-400">•</span>
                              <span className="whitespace-nowrap">{distance.toFixed(1)} km</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <div className="w-4 sm:w-5 flex-shrink-0"></div>
                              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#ec5a13]">{item.price.replace(/À partir de /gi, '')}</p>
                            </div>
                          </div>
                        </div>

                        {/* Version desktop - style liste */}
                        <div className="hidden md:flex">
                          <div className="relative w-64 h-auto flex-shrink-0 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                            <img
                              src={item.mainImage}
                              alt={item.title}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                          </div>

                          <div className="flex-1 flex flex-col p-5 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl flex-shrink-0 w-6">
                                {isService ? '🛠️' : '📦'}
                              </span>
                              <h3 className="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-[#ec5a13] transition-colors truncate flex-1">
                                {item.title}
                              </h3>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-6 flex-shrink-0 flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-[#ec5a13]" />
                              </div>
                              <span className="truncate">{item.location}</span>
                              <span className="text-gray-400">•</span>
                              <span className="whitespace-nowrap">{distance.toFixed(1)} km</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="w-6 flex-shrink-0"></div>
                              <p className="text-base sm:text-lg font-semibold text-[#ec5a13]">{item.price.replace(/À partir de /gi, '')}</p>
                            </div>

                            {item.description && (
                              <div className="flex items-start gap-2">
                                <div className="w-6 flex-shrink-0"></div>
                                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-100">
                              <div className="w-6 flex-shrink-0"></div>
                              <Clock className="h-3.5 w-3.5" />
                              <span>Il y a {item.postedTime}</span>
                              <span className="text-gray-400 mx-1">•</span>
                              <span>{item.views.toLocaleString()} vues</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                }

                // Mode grille
                return (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    className="block group"
                  >
                    <Card className="group cursor-pointer overflow-hidden border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] h-full bg-white p-0 gap-0">
                      <div className="relative h-28 sm:h-32 md:h-36 lg:h-40 xl:h-44 overflow-hidden bg-gray-200">
                        <img
                          src={item.mainImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Badge de temps en haut à gauche */}
                        <Badge className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-white/90 backdrop-blur-sm text-gray-700 flex items-center gap-1 sm:gap-1.5 shadow-md text-xs px-2 py-1 rounded-lg border-0">
                          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span className="font-medium">Il y a {item.postedTime}</span>
                        </Badge>
                      </div>

                      <div className="p-3 flex flex-col gap-2">
                        {/* Icône + Titre */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm sm:text-base flex-shrink-0 w-4 sm:w-5">
                            {item.type === 'service' ? '🛠️' : '📦'}
                          </span>
                          <h3 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-[#ec5a13] transition-colors truncate flex-1">
                            {item.title}
                          </h3>
                        </div>

                        {/* Localité + Distance */}
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                          <div className="w-4 sm:w-5 flex-shrink-0 flex items-center justify-center">
                            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#ec5a13]" />
                          </div>
                          <span className="truncate">{item.location}</span>
                          <span className="text-gray-400">•</span>
                          <span className="whitespace-nowrap">{distance.toFixed(1)} km</span>
                        </div>

                        {/* Prix */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 sm:w-5 flex-shrink-0"></div>
                          <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#ec5a13]">{item.price.replace(/À partir de /gi, '')}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>

                    {/* Première page */}
                    {currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(1);
                            }}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {currentPage > 4 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}

                    {/* Pages autour de la page actuelle */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === currentPage ||
                          page === currentPage - 1 ||
                          page === currentPage - 2 ||
                          page === currentPage + 1 ||
                          page === currentPage + 2;
                      })
                      .map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={currentPage === page}
                            className={currentPage === page ? 'bg-[#ec5a13] hover:bg-[#d94f0f]' : ''}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                    {/* Dernière page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(totalPages);
                            }}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
