'use client';

import { ArrowRight, TrendingUp, Users, Shield, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Construire l'URL de recherche
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (location) params.append('location', location);
    
    // Rediriger vers la page de catégories avec les filtres
    router.push(`/categories/tous?${params.toString()}`);
  };

  const handlePopularSearch = (category: string) => {
    setSearchQuery(category);
    router.push(`/categories/${category.toLowerCase()}`);
  };

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Arrière-plan avec vraie image */}
      <div className="absolute inset-0">
        {/* Image de fond - Marché/Commerce local */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback en cas d'erreur de chargement
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Overlay dégradé pour lisibilité - Réduit */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-orange-50/40 to-white/70"></div>
          {/* Overlay radial centré */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/10 to-white/40"></div>
        </div>
        
        {/* Motif de points léger par dessus */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="1" fill="#ec5a13" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
      </div>
      
      {/* Éléments décoratifs flous */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-300 rounded-full blur-3xl opacity-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Trouvez tout ce dont vous avez besoin
            <span className="text-[#ec5a13]"> près de chez vous</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Produits, services, opportunités... Découvrez des milliers d'annonces dans votre région
          </p>

          {/* Barre de recherche améliorée */}
          <div className="max-w-3xl mx-auto mb-10">
            <form onSubmit={handleSearch}>
              <div className="bg-white rounded-2xl shadow-xl p-2 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-2">
                  {/* Champ de recherche principal */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Que recherchez-vous ?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#ec5a13] focus:bg-white transition-all text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  {/* Champ de localisation */}
                  <div className="md:w-64 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Localisation"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#ec5a13] focus:bg-white transition-all text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  {/* Bouton de recherche */}
                  <Button 
                    type="submit"
                    size="lg" 
                    className="btn-primary px-8 py-4 rounded-xl text-base font-semibold whitespace-nowrap"
                  >
                    Rechercher
                  </Button>
                </div>
              </div>
            </form>

            {/* Suggestions de recherche */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-gray-600 font-medium">Populaire :</span>
              <button 
                type="button"
                onClick={() => handlePopularSearch('Electronique')}
                className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-[#ec5a13] hover:text-[#ec5a13] hover:bg-orange-50 transition-colors"
              >
                Téléphones
              </button>
              <button 
                type="button"
                onClick={() => handlePopularSearch('Immobilier')}
                className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-[#ec5a13] hover:text-[#ec5a13] hover:bg-orange-50 transition-colors"
              >
                Immobilier
              </button>
              <button 
                type="button"
                onClick={() => handlePopularSearch('Services à domicile')}
                className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-[#ec5a13] hover:text-[#ec5a13] hover:bg-orange-50 transition-colors"
              >
                Services
              </button>
              <button 
                type="button"
                onClick={() => handlePopularSearch('Automobile')}
                className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-[#ec5a13] hover:text-[#ec5a13] hover:bg-orange-50 transition-colors"
              >
                Véhicules
              </button>
            </div>
          </div>

          {/* Statistiques/Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3 mx-auto">
                <TrendingUp className="h-6 w-6 text-[#ec5a13]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">+10k annonces</h3>
              <p className="text-gray-600 text-sm">Mises à jour chaque jour</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3 mx-auto">
                <Users className="h-6 w-6 text-[#ec5a13]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Communauté active</h3>
              <p className="text-gray-600 text-sm">Des milliers d'utilisateurs</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3 mx-auto">
                <Shield className="h-6 w-6 text-[#ec5a13]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">100% gratuit</h3>
              <p className="text-gray-600 text-sm">Publiez sans frais</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
