// app/categories/[slug]/page.tsx
'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from "../../../components/home/Header";
import { Footer } from '../../../components/home/Footer';
import { Breadcrumb } from '../../../components/CategoryPage/Breadcrumb';
import { FiltersSidebar } from '../../../components/CategoryPage/FiltersSidebar';
import { ItemCard } from '../../../components/CategoryPage/ItemCard';
import { categories } from '@/lib/mockData';
import { Item } from '@/types/index';
import { 
  SlidersHorizontal, 
  Grid3x3,
  List,
  ArrowUpDown,
  Loader2,
  AlertCircle
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
import { Filters } from '@/types/index';
import { getProducts } from '@/lib/api/products';



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
    showProducts: urlType === 'service' ? false : true,
    showServices: urlType === 'product' ? false : true,
    priceMin: '',
    priceMax: '',
    location: locationParam,
    condition: 'all',
    minRating: 0,
    promotedOnly: false
  });
  
  // États pour l'API
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
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

  // Récupérer la sous-catégorie depuis l'URL
  const subcategoryParam = searchParams?.get('subcategory');

  // Charger les produits depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Construire les filtres API
        const apiFilters: any = {
          page: currentPage,
          limit: 20,
          status: 'active'
        };

        // Catégorie
        if (slug !== 'tous') {
          apiFilters.category = slug;
        }

        // Sous-catégorie
        if (subcategoryParam) {
          apiFilters.subcategory = subcategoryParam;
        }

        // Type (produit/service)
        if (filters.showProducts && !filters.showServices) {
          apiFilters.type = 'product';
        } else if (filters.showServices && !filters.showProducts) {
          apiFilters.type = 'service';
        }

        // Location
        if (filters.location && filters.location !== 'all') {
          apiFilters.location = filters.location;
        }

        // Condition
        if (filters.condition && filters.condition !== 'all') {
          apiFilters.condition = filters.condition;
        }

        // Prix
        if (filters.priceMin) {
          apiFilters.minPrice = parseFloat(filters.priceMin);
        }
        if (filters.priceMax) {
          apiFilters.maxPrice = parseFloat(filters.priceMax);
        }

        // Recherche
        if (searchQuery.trim()) {
          apiFilters.search = searchQuery.trim();
        }

        // Tri
        const sortMap: Record<string, string> = {
          'recent': '-createdAt',
          'price-asc': 'price',
          'price-desc': '-price',
          'rating': '-seller.rating'
        };
        apiFilters.sort = sortMap[sortBy] || '-createdAt';

        console.log('🔍 Filtres API:', apiFilters);

        // Appeler l'API
        const response = await getProducts(apiFilters);
        
        setItems(response.data);
        setPagination(response.pagination);
        
      } catch (err: any) {
        console.error('❌ Erreur chargement produits:', err);
        setError(err.message || 'Erreur lors du chargement des produits');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, subcategoryParam, currentPage, sortBy, filters, searchQuery]);

  // Compter produits et services
  const productsCount = items.filter(i => i.type === 'product').length;
  const servicesCount = items.filter(i => i.type === 'service').length;
  
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
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <Header />
      </Suspense>
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb category="Électronique" />

        {/* En-tête de catégorie */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {categoryName}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <p className="text-lg">
              <span className="font-semibold text-[#ec5a13]">{pagination.total}</span> résultats
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
            {/* Loading */}
            {loading && (
              <Card className="p-12 text-center shadow-sm">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 text-[#ec5a13] animate-spin" />
                  <h3 className="text-xl font-semibold text-gray-900">Chargement...</h3>
                  <p className="text-gray-600">Récupération des produits et services</p>
                </div>
              </Card>
            )}

            {/* Error */}
            {error && !loading && (
              <Card className="p-12 text-center shadow-sm border-red-200">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Erreur de chargement</h3>
                  <p className="text-gray-600 max-w-md">{error}</p>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white"
                  >
                    Réessayer
                  </Button>
                </div>
              </Card>
            )}

            {/* No results */}
            {!loading && !error && items.length === 0 && (
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
                    onClick={() => {
                      setFilters({
                        showProducts: true,
                        showServices: true,
                        priceMin: '',
                        priceMax: '',
                        location: 'all',
                        condition: 'all',
                        minRating: 0,
                        promotedOnly: false
                      });
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </Card>
            )}

            {/* Products Grid */}
            {!loading && !error && items.length > 0 && (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'flex flex-col gap-4'
                }>
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} viewMode={viewMode} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-600">
                      Page {pagination.page} sur {pagination.pages} - {pagination.total} résultats
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
                        {[...Array(pagination.pages)].map((_, i) => {
                          const pageNum = i + 1;
                          // Afficher seulement certaines pages pour éviter trop de boutons
                          if (
                            pageNum === 1 ||
                            pageNum === pagination.pages ||
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
                        disabled={currentPage === pagination.pages}
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