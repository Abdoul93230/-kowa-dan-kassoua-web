// app/categories/[slug]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from "../../../components/home/Header";
import { Footer } from '../../../components/home/Footer';
import { Breadcrumb } from '../../../components/CategoryPage/Breadcrumb';
import { FiltersSidebar } from '../../../components/CategoryPage/FiltersSidebar';
import { ItemCard } from '../../../components/CategoryPage/ItemCard';
import { mockItems, categories } from '../../../../lib/mockData';
import { Item } from '../../../../types/index';
import { 
  SlidersHorizontal, 
  Grid3x3,
  List,
  ArrowUpDown,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {filterItems,ITEMS_PER_PAGE,sortItems,getTotalPages} from '../../../lib/utilitis/filterUtils'
import { Filters } from '../../../../types/index';




// Main Category Page Component
export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // Déballer params avec React.use()
  const { slug } = use(params);
  
  const searchParams = useSearchParams();
  const queryParam = searchParams?.get('q') || '';
  const locationParam = searchParams?.get('location') || 'all';
  const urlType = searchParams?.get('type'); // 'product' ou 'service'
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recent');
  const [filters, setFilters] = useState<Filters>({
    showProducts: true,
    showServices: true,
    priceMin: '',
    priceMax: '',
    location: locationParam,
    condition: 'all',
    minRating: 0,
    promotedOnly: false
  });
  
  // Mettre à jour les filtres quand les paramètres changent
  useEffect(() => {
    const query = searchParams?.get('q') || '';
    const location = searchParams?.get('location') || 'all';
    const type = searchParams?.get('type'); // 'product' ou 'service'
    
    setSearchQuery(query);
    
    // Appliquer le filtre de type depuis l'URL
    setFilters(prev => ({
      ...prev,
      location,
      showProducts: type === 'service' ? false : true,
      showServices: type === 'product' ? false : true,
    }));
  }, [searchParams]);

  const itemsPerPage = ITEMS_PER_PAGE;

// Récupérer tous les items ou filtrer par catégorie
const allItems: Item[] = slug === 'tous' 
  ? Object.values(mockItems).flat() 
  : (mockItems[slug] || Object.values(mockItems).flat());

// Fonction pour normaliser les chaînes (enlever accents et mettre en minuscules)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Enlève les accents
};

// Filtrer par sous-catégorie si spécifié dans l'URL
const subcategoryParam = searchParams?.get('subcategory');
const subcategoryFilteredItems = subcategoryParam 
  ? allItems.filter(item => 
      item.subcategory && 
      normalizeString(item.subcategory) === normalizeString(subcategoryParam)
    )
  : allItems;

// Fonction de recherche complète dans tous les attributs
const performSearch = (items: Item[], query: string): Item[] => {
  if (query.trim() === '') return items;
  
  const searchTerm = query.toLowerCase();
  
  return items.filter(item => {
    // Recherche dans les champs textuels principaux
    const titleMatch = item.title.toLowerCase().includes(searchTerm);
    const descriptionMatch = item.description.toLowerCase().includes(searchTerm);
    const locationMatch = item.location.toLowerCase().includes(searchTerm);
    const categoryMatch = item.category.toLowerCase().includes(searchTerm);
    const subcategoryMatch = item.subcategory?.toLowerCase().includes(searchTerm);
    
    // Recherche dans le prix (ex: "1000", "1000 fcfa")
    const priceMatch = item.price.toLowerCase().includes(searchTerm);
    
    // Recherche dans les tags
    const tagsMatch = item.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm)
    );
    
    // Recherche dans la marque
    const brandMatch = item.brand?.toLowerCase().includes(searchTerm);
    
    // Recherche dans la condition
    const conditionMatch = item.condition?.toLowerCase().includes(searchTerm);
    
    // Recherche dans les spécifications (ex: "128GB", "4K", etc.)
    const specsMatch = item.specifications ? 
      Object.entries(item.specifications).some(([key, value]) => 
        key.toLowerCase().includes(searchTerm) || 
        value.toLowerCase().includes(searchTerm)
      ) : false;
    
    // Recherche dans le nom du vendeur
    const sellerMatch = item.seller.name.toLowerCase().includes(searchTerm);
    
    // Recherche dans les zones de livraison (pour produits)
    const deliveryMatch = item.delivery?.areas.some(area => 
      area.toLowerCase().includes(searchTerm)
    ) || false;
    
    // Recherche dans les zones de service (pour services)
    const serviceAreaMatch = item.serviceArea?.some(area => 
      area.toLowerCase().includes(searchTerm)
    ) || false;
    
    // Recherche dans le type (produit/service)
    const typeMatch = item.type.toLowerCase().includes(searchTerm);
    
    // Retourner true si au moins un champ correspond
    return titleMatch || descriptionMatch || locationMatch || categoryMatch || 
           subcategoryMatch || priceMatch || tagsMatch || brandMatch || 
           conditionMatch || specsMatch || sellerMatch || deliveryMatch || 
           serviceAreaMatch || typeMatch;
  });
};

// Filtrer par recherche textuelle d'abord
const searchFilteredItems = performSearch(subcategoryFilteredItems, searchQuery);

// Appliquer les filtres supplémentaires
let filteredItems = filterItems(searchFilteredItems, filters);

// Si aucun résultat avec le filtre de localisation ET qu'il y a une recherche active,
// réessayer sans le filtre de localisation
if (filteredItems.length === 0 && searchQuery.trim() !== '' && filters.location !== 'all') {
  const filtersWithoutLocation = { ...filters, location: 'all' };
  filteredItems = filterItems(searchFilteredItems, filtersWithoutLocation);
}


  const sortedItems = sortItems(filteredItems,sortBy);

  const totalPages = getTotalPages(sortedItems.length);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

  // Compter produits et services
  const productsCount = filteredItems.filter(i => i.type === 'product').length;
  const servicesCount = filteredItems.filter(i => i.type === 'service').length;
  
  // Trouver le nom de la catégorie et sous-catégorie
  const currentCategory = categories.find(cat => cat.slug === slug);
  const currentSubcategory = currentCategory?.subcategories?.find(
    sub => sub.slug === subcategoryParam
  );
  
  const categoryName = searchQuery 
    ? `Résultats pour "${searchQuery}"` 
    : subcategoryParam && currentSubcategory
      ? `${currentCategory?.name} - ${currentSubcategory.name}`
      : (slug === 'tous' ? 'Toutes les catégories' : (currentCategory?.name || 'Catégorie'));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb category="Électronique" />

        {/* En-tête de catégorie */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {categoryName}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <p className="text-lg">
              <span className="font-semibold text-[#ec5a13]">{filteredItems.length}</span> résultats
            </p>
            <span className="text-gray-400">•</span>
            <p className="text-sm">
              {productsCount} produits, {servicesCount} services
            </p>
            {filters.location !== 'all' && (
              <>
                <span className="text-gray-400">•</span>
                <p className="text-sm">
                  📍 {filters.location}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de]"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtres
            {(filters.promotedOnly || filters.minRating > 0 || filters.condition !== 'all' || 
              !filters.showProducts || !filters.showServices) && (
              <Badge className="ml-2 bg-[#ec5a13] hover:bg-[#d94f0f]">Actifs</Badge>
            )}
          </Button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="rating">Mieux notés</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-[#ec5a13] hover:bg-[#d94f0f]' : 'hover:bg-[#ffe9de]'}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-[#ec5a13] hover:bg-[#d94f0f]' : 'hover:bg-[#ffe9de]'}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar de filtres - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FiltersSidebar 
                filters={filters} 
                setFilters={setFilters}
                urlType={urlType}
              />
            </div>
          </aside>

          {/* Sidebar de filtres - Mobile */}
          {showFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white overflow-y-auto shadow-2xl">
                <FiltersSidebar 
                  onClose={() => setShowFilters(false)} 
                  isMobile 
                  filters={filters}
                  setFilters={setFilters}
                  urlType={urlType}
                />
              </div>
            </div>
          )}

          {/* Grille de produits/services */}
          <main className="flex-1">
            {currentItems.length === 0 ? (
              <Card className="p-12 text-center shadow-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-[#ffe9de] rounded-full flex items-center justify-center">
                    <SlidersHorizontal className="h-10 w-10 text-[#ec5a13]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Aucun résultat trouvé</h3>
                  <p className="text-gray-600 max-w-md">
                    Essayez de modifier vos filtres ou critères de recherche pour voir plus de résultats.
                  </p>
                  <Button 
                    onClick={() => setFilters({
                      showProducts: true,
                      showServices: true,
                      priceMin: '',
                      priceMax: '',
                      location: 'all',
                      condition: 'all',
                      minRating: 0,
                      promotedOnly: false
                    })}
                    className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'flex flex-col gap-4'
                }>
                  {currentItems.map((item) => (
                    <ItemCard key={item.id} item={item} viewMode={viewMode} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} sur {totalPages} - Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, sortedItems.length)} sur {sortedItems.length} résultats
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage(currentPage - 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Précédent
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          // Afficher seulement certaines pages pour éviter trop de boutons
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                onClick={() => {
                                  setCurrentPage(pageNum);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={currentPage === pageNum ? 'bg-[#ec5a13] hover:bg-[#d94f0f]' : 'hover:bg-[#ffe9de]'}
                                size="sm"
                              >
                                {pageNum}
                              </Button>
                            );
                          } else if (
                            pageNum === currentPage - 2 ||
                            pageNum === currentPage + 2
                          ) {
                            return <span key={pageNum} className="px-2">...</span>;
                          }
                          return null;
                        })}
                      </div>

                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => {
                          setCurrentPage(currentPage + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}