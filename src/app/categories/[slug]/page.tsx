// app/categories/[slug]/page.tsx
'use client';

import { useState } from 'react';
import { Header } from "../../../components/home/Header";
import { Footer } from '../../../components/home/Footer';
import { Breadcrumb } from '../../../components/CategoryPage/Breadcrumb';
import { FiltersSidebar } from '../../../components/CategoryPage/FiltersSidebar';
import { ItemCard } from '../../../components/CategoryPage/ItemCard';
import { mockItems } from '../../../../lib/mockData';
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
export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recent');
  const [filters, setFilters] = useState<Filters>({
    showProducts: true,
    showServices: true,
    priceMin: '',
    priceMax: '',
    location: 'all',
    condition: 'all',
    minRating: 0,
    promotedOnly: false
  });

  const itemsPerPage = ITEMS_PER_PAGE;

const allItems: Item[] = Object.values(mockItems).flat();
const filteredItems = filterItems(allItems, filters);


  const sortedItems = sortItems(filteredItems,sortBy);

  const totalPages = getTotalPages(sortedItems.length);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

  // Compter produits et services
  const productsCount = filteredItems.filter(i => i.type === 'product').length;
  const servicesCount = filteredItems.filter(i => i.type === 'service').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb category="Électronique" />

        {/* En-tête de catégorie */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Électronique
          </h1>
          <div className="flex items-center gap-4 text-slate-600">
            <p className="text-lg">
              <span className="font-semibold text-slate-900">{filteredItems.length}</span> résultats
            </p>
            <span className="text-slate-400">•</span>
            <p className="text-sm">
              {productsCount} produits, {servicesCount} services
            </p>
          </div>
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtres
            {(filters.promotedOnly || filters.minRating > 0 || filters.condition !== 'all' || 
              !filters.showProducts || !filters.showServices) && (
              <Badge className="ml-2 bg-emerald-600">Actifs</Badge>
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
                className={viewMode === 'grid' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
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
                />
              </div>
            </div>
          )}

          {/* Grille de produits/services */}
          <main className="flex-1">
            {currentItems.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <SlidersHorizontal className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Aucun résultat trouvé</h3>
                  <p className="text-slate-600 max-w-md">
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
                    className="bg-emerald-600 hover:bg-emerald-700"
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
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 bg-white p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600">
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
                                className={currentPage === pageNum ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
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