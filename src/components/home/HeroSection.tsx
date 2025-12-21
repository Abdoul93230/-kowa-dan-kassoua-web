'use client';

import { ArrowRight, TrendingUp, Users, Shield, Search, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeroProductCarousel } from './HeroProductCarousel';

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSearchFixed, setIsSearchFixed] = useState(false);
  const router = useRouter();

  // Messages pour le carousel - Plus d'impact et d'informations
  const carouselMessages = [
    { 
      icon: <Sparkles className="h-6 w-6" />, 
      title: "🎯 Trouvez tout près de chez vous", 
      subtitle: "Produits, services et opportunités dans votre quartier"
    },
    { 
      icon: <TrendingUp className="h-6 w-6" />, 
      title: "📈 +10 000 annonces actives", 
      subtitle: "Nouvelles offres ajoutées chaque heure"
    },
    { 
      icon: <Users className="h-6 w-6" />, 
      title: "👥 Communauté de +50k membres", 
      subtitle: "Acheteurs et vendeurs vérifiés dans toute la région"
    },
    { 
      icon: <Shield className="h-6 w-6" />, 
      title: "✅ 100% Gratuit et Sécurisé", 
      subtitle: "Publiez et vendez sans frais, en toute confiance"
    },
    { 
      icon: <Sparkles className="h-6 w-6" />, 
      title: "🚀 Vente rapide garantie", 
      subtitle: "80% des annonces trouvent preneur en moins de 7 jours"
    },
  ];

  // Auto-rotation du carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselMessages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Gestion du scroll pour fixer la barre de recherche
  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-search-bar');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        setIsSearchFixed(rect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <section className="relative py-2 sm:py-3 overflow-hidden">
      {/* Arrière-plan avec vraie image - Style marché informel */}
      <div className="absolute inset-0">
        {/* Image de fond - Marché/Commerce local */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Overlay dégradé - Style marché chaleureux */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50/80 via-amber-50/70 to-white/85"></div>
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-orange-50/20 to-white/50"></div>
        </div>
        
        {/* Motif de points - évoquant un marché traditionnel */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="market-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="#ec5a13" />
                <circle cx="10" cy="10" r="1" fill="#f97316" />
                <circle cx="30" cy="30" r="1" fill="#fb923c" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#market-dots)" />
          </svg>
        </div>
      </div>
      
      {/* Éléments décoratifs - ambiance marché */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-orange-300 rounded-full blur-3xl opacity-25 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-amber-300 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-orange-200 rounded-full blur-2xl opacity-15"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Barre de recherche - Container plus petit */}
        <div id="hero-search-bar" className="max-w-4xl mx-auto">
          <div className="mb-2 sm:mb-3">
            <form onSubmit={handleSearch}>
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-1 sm:p-1.5 border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  {/* Champ de recherche principal */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Que recherchez-vous ?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#ec5a13] focus:bg-white transition-all text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"
                    />
                  </div>

                  {/* Champ de localisation */}
                  <div className="sm:w-48 md:w-64 relative">
                    <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Localisation"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#ec5a13] focus:bg-white transition-all text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"
                    />
                  </div>

                  {/* Bouton de recherche */}
                  <Button 
                    type="submit"
                    size="lg" 
                    className="btn-primary px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold whitespace-nowrap"
                  >
                    Rechercher
                  </Button>
                </div>
              </div>
            </form>

            {/* Suggestions de recherche */}
            <div className="mt-2 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center gap-1.5 text-xs px-2 sm:px-0">
              <span className="text-gray-600 font-semibold w-full sm:w-auto text-center sm:text-left mb-1 sm:mb-0">Populaire :</span>
              <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                <button 
                  type="button"
                  onClick={() => handlePopularSearch('Electronique')}
                  className="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-[#ec5a13] hover:text-[#ec5a13] hover:bg-orange-50 transition-colors text-xs sm:text-sm"
                >
                  Téléphones
                </button>
                <button 
                  type="button"
                  onClick={() => handlePopularSearch('Immobilier')}
                  className="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-[#ec5a13] hover:text-[#ec5a13] hover:bg-orange-50 transition-colors text-xs sm:text-sm"
                >
                  Immobilier
                </button>
                <button 
                  type="button"
                  onClick={() => handlePopularSearch('Services à domicile')}
                  className="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-[#ec5a13] hover:text-[#ec5a13] hover:bg-orange-50 transition-colors text-xs sm:text-sm"
                >
                  Services
                </button>
                <button 
                  type="button"
                  onClick={() => handlePopularSearch('Automobile')}
                  className="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-[#ec5a13] hover:text-[#ec5a13] hover:bg-orange-50 transition-colors text-xs sm:text-sm"
                >
                  Véhicules
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche fixe lors du scroll */}
      {isSearchFixed && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white shadow-lg border-b border-gray-200 py-2 sm:py-3 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearch}>
                <div className="flex gap-2">
                  {/* Champ de recherche principal */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Que recherchez-vous ?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 sm:py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ec5a13] focus:bg-white transition-all text-gray-900 placeholder:text-gray-500 text-sm"
                    />
                  </div>

                  {/* Champ de localisation - caché sur mobile */}
                  <div className="hidden sm:block w-48 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Localisation"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ec5a13] focus:bg-white transition-all text-gray-900 placeholder:text-gray-500 text-sm"
                    />
                  </div>

                  {/* Bouton de recherche */}
                  <Button 
                    type="submit"
                    size="lg" 
                    className="btn-primary px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap"
                  >
                    <Search className="h-4 w-4 sm:hidden" />
                    <span className="hidden sm:inline">Rechercher</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bandeau dynamique carousel élargi - Toute la largeur en bas de la barre de recherche */}
      <div className="w-full mt-3 sm:mt-4 mb-3 sm:mb-4 relative z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-[#ec5a13] via-orange-600 to-amber-500 rounded-2xl sm:rounded-3xl overflow-hidden" style={{boxShadow: '0 10px 40px rgba(236, 90, 19, 0.3), 0 0 0 2px rgba(251, 146, 60, 0.4), 0 0 0 4px rgba(253, 186, 116, 0.2)'}}>
            {/* Bordure dorée style marché */}
            <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white rounded-xl sm:rounded-2xl relative overflow-hidden">
              {/* Motif décoratif arrière-plan - Plus visible */}
              <div className="absolute inset-0 opacity-8 hidden lg:block pointer-events-none">
                <div className="absolute top-4 left-8 w-24 h-24 border-6 border-[#ec5a13] rounded-full"></div>
                <div className="absolute bottom-4 right-8 w-28 h-28 border-6 border-orange-400 rounded-full"></div>
                <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-orange-200 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-amber-200 rounded-full blur-xl"></div>
              </div>
              
              {/* Carousel animé avec défilement horizontal - un seul contenu visible */}
              <div className="relative py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8">
                <div className="relative overflow-hidden min-h-[100px] sm:min-h-[120px] md:min-h-[140px] flex items-center">
                  <div className="flex transition-transform duration-700 ease-in-out w-full">
                    {carouselMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`w-full flex-shrink-0 transition-all duration-700 ${
                          index === currentSlide
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-95'
                        }`}
                        style={{
                          transform: `translateX(-${currentSlide * 100}%)`
                        }}
                      >
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5 max-w-3xl mx-auto">
                          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#ec5a13] via-orange-600 to-amber-600 rounded-xl sm:rounded-2xl text-white shadow-2xl flex-shrink-0 transform hover:scale-110 transition-transform">
                            <div className="scale-110 sm:scale-125">
                              {message.icon}
                            </div>
                          </div>
                          <div className="text-center sm:text-left flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-[#ec5a13] via-orange-600 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2 leading-tight">
                              {message.title}
                            </h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-700 font-medium leading-relaxed">
                              {message.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indicateurs de pagination - Plus visibles et interactifs */}
                <div className="flex justify-center gap-2 mt-4 sm:mt-5">
                  {carouselMessages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 sm:h-2.5 md:h-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
                        index === currentSlide
                          ? 'w-10 sm:w-12 md:w-16 bg-gradient-to-r from-[#ec5a13] to-orange-600 shadow-lg'
                          : 'w-2 sm:w-2.5 md:w-3 bg-orange-300 hover:bg-orange-400 hover:w-6 sm:hover:w-8'
                      }`}
                      aria-label={`Slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Badge "Nouveau" ou "Tendance" animé */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-10">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-bold shadow-lg animate-bounce">
                  🔥 Tendance
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Carousel de produits - Section élargie */}
        <div className="max-w-7xl mx-auto">
          <HeroProductCarousel />
        </div>
      </div>
    </section>
  );
}
