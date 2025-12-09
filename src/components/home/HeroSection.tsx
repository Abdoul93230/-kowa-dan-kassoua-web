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
    <section className="relative py-12 lg:py-20 overflow-hidden">
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
        {/* Bandeau dynamique carousel élargi - Au-dessus de la barre de recherche */}
        <div className="max-w-6xl mx-auto mb-10 overflow-hidden">
          <div className="relative bg-gradient-to-r from-[#ec5a13] via-orange-600 to-amber-500 rounded-3xl shadow-2xl border-4 border-orange-200 p-1.5">
            {/* Bordure dorée style marché */}
            <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white rounded-2xl p-10 md:p-12 lg:p-16 relative overflow-hidden">
              {/* Motif décoratif arrière-plan - Plus visible */}
              <div className="absolute inset-0 opacity-8">
                <div className="absolute top-0 left-0 w-32 h-32 border-8 border-[#ec5a13] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 border-8 border-orange-400 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 border-8 border-amber-400 rounded-full"></div>
                <div className="absolute top-10 right-20 w-20 h-20 bg-orange-200 rounded-full blur-xl"></div>
                <div className="absolute bottom-10 left-20 w-28 h-28 bg-amber-200 rounded-full blur-xl"></div>
              </div>
              
              {/* Carousel animé - Plus grand */}
              <div className="relative h-24 md:h-28 flex items-center justify-center">
                  {carouselMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 transition-all duration-700 ${
                        index === currentSlide
                          ? 'opacity-100 translate-y-0 scale-100'
                          : index < currentSlide
                          ? 'opacity-0 -translate-y-12 scale-95'
                          : 'opacity-0 translate-y-12 scale-95'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#ec5a13] via-orange-600 to-amber-600 rounded-2xl text-white shadow-2xl transform hover:scale-110 transition-transform">
                          {message.icon}
                        </div>
                        <div className="text-center md:text-left">
                          <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-[#ec5a13] via-orange-600 to-amber-600 bg-clip-text text-transparent mb-1">
                            {message.title}
                          </h3>
                          <p className="text-sm md:text-base lg:text-lg text-gray-700 font-medium">
                            {message.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Indicateurs de pagination - Plus visibles */}
                <div className="flex justify-center gap-3 mt-6">
                  {carouselMessages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 shadow-md ${
                        index === currentSlide
                          ? 'w-12 bg-gradient-to-r from-[#ec5a13] to-orange-600 shadow-lg'
                          : 'w-2.5 bg-orange-300 hover:bg-orange-400 hover:w-6'
                      }`}
                      aria-label={`Slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Badge "Nouveau" ou "Tendance" animé */}
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg animate-bounce">
                    🔥 Tendance
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche - Container plus petit */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
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
        </div>

        {/* Carousel de produits - Section élargie */}
        <div className="max-w-7xl mx-auto">
          <HeroProductCarousel />
        </div>
      </div>
    </section>
  );
}
