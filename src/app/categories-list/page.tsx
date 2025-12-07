'use client';

import { useState } from 'react';
import { Header } from '../../components/home/Header';
import { Footer } from '../../components/home/Footer';
import { categories } from '../../../lib/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Smartphone, 
  UtensilsCrossed, 
  Home, 
  Car, 
  Shirt, 
  Briefcase, 
  BookOpen, 
  Heart,
  Search,
  ChevronRight,
  Grid3x3,
  Package,
  Wrench
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Map des icônes par slug de catégorie
const iconMap: Record<string, any> = {
  'electronique': Smartphone,
  'alimentation': UtensilsCrossed,
  'immobilier': Home,
  'vehicules': Car,
  'mode': Shirt,
  'emploi': Briefcase,
  'education': BookOpen,
  'loisirs': Heart,
};

export default function CategoriesListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les catégories selon la recherche
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.subcategories?.some(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCategoryClick = (slug: string) => {
    router.push(`/categories/${slug}`);
  };

  const handleSubcategoryClick = (categorySlug: string, subSlug: string) => {
    router.push(`/categories/${categorySlug}?subcategory=${subSlug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-[#ffe9de] p-4 rounded-full">
              <Grid3x3 className="h-12 w-12 text-[#ec5a13]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Toutes les catégories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Explorez nos catégories et trouvez exactement ce que vous cherchez parmi des milliers d'annonces
          </p>

          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-gray-300 focus:border-[#ec5a13] focus:ring-[#ec5a13]"
              />
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center bg-white shadow-sm border-gray-200">
            <div className="text-3xl font-bold text-[#ec5a13] mb-2">
              {categories.length}
            </div>
            <div className="text-gray-600">Catégories principales</div>
          </Card>
          <Card className="p-6 text-center bg-white shadow-sm border-gray-200">
            <div className="text-3xl font-bold text-[#ec5a13] mb-2">
              {categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)}
            </div>
            <div className="text-gray-600">Sous-catégories</div>
          </Card>
          <Card className="p-6 text-center bg-white shadow-sm border-gray-200">
            <div className="text-3xl font-bold text-[#ec5a13] mb-2">
              {categories.reduce((acc, cat) => acc + cat.count, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Annonces au total</div>
          </Card>
        </div>

        {/* Liste des catégories */}
        {filteredCategories.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-[#ffe9de] rounded-full flex items-center justify-center">
                <Search className="h-10 w-10 text-[#ec5a13]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Aucune catégorie trouvée</h3>
              <p className="text-gray-600 max-w-md">
                Essayez avec d'autres mots-clés
              </p>
              <Button 
                onClick={() => setSearchQuery('')}
                className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white"
              >
                Réinitialiser la recherche
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCategories.map((category) => {
              const IconComponent = iconMap[category.slug] || Package;
              
              return (
                <Card 
                  key={category.id} 
                  className="group hover:shadow-xl transition-all duration-300 border-gray-200 bg-white overflow-hidden"
                >
                  {/* En-tête de la catégorie */}
                  <div 
                    className="p-6 bg-gradient-to-r from-[#ffe9de] to-white border-b border-gray-200 cursor-pointer"
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <IconComponent className="h-8 w-8 text-[#ec5a13]" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#ec5a13] transition-colors">
                            {category.name}
                          </h2>
                          <p className="text-sm text-gray-600 mb-3">
                            {category.description}
                          </p>
                          <Badge className="bg-[#ec5a13] text-white">
                            {category.count.toLocaleString()} annonces
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-[#ec5a13] transition-colors flex-shrink-0 ml-4" />
                    </div>
                  </div>

                  {/* Sous-catégories */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="p-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Sous-catégories
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategoryClick(category.slug, sub.slug)}
                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#ec5a13] hover:bg-[#ffe9de] transition-all duration-200 text-left group/sub"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 group-hover/sub:text-[#ec5a13]">
                                {sub.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {sub.count} annonces
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover/sub:text-[#ec5a13] flex-shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bouton voir tout */}
                  <div className="px-6 pb-6">
                    <Button
                      onClick={() => handleCategoryClick(category.slug)}
                      className="w-full bg-white border-2 border-[#ec5a13] text-[#ec5a13] hover:bg-[#ec5a13] hover:text-white transition-all"
                    >
                      Voir toutes les annonces de {category.name}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
