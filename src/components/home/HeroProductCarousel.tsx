'use client';

import { Star, Clock, Navigation, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockItems } from '../../../lib/mockData';
import { Item } from '../../../types';
import Link from 'next/link';

const allItems: Item[] = Object.values(mockItems).flat();

export function HeroProductCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fonction pour calculer la distance
  const getDistance = (itemId: number) => {
    const distances = [0.5, 1.2, 2.3, 3.5, 4.8, 5.1, 6.7, 8.2, 10.5];
    return distances[itemId % distances.length];
  };

  // Gestion du scroll du carousel
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 450;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, []);

  return (
    <div className="mt-6 sm:mt-8 relative w-full">
      {/* Bouton gauche */}
      <button
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={`absolute left-0 sm:left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 md:p-4 rounded-full transition-all shadow-lg sm:shadow-2xl ${
          canScrollLeft
            ? 'bg-white hover:bg-[#ec5a13] hover:text-white border border-gray-200 sm:border-2 hover:border-[#ec5a13] hover:scale-110'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 sm:border-2 opacity-50'
        }`}
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
      </button>

      {/* Bouton droit */}
      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={`absolute right-0 sm:right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 md:p-4 rounded-full transition-all shadow-lg sm:shadow-2xl ${
          canScrollRight
            ? 'bg-white hover:bg-[#ec5a13] hover:text-white border border-gray-200 sm:border-2 hover:border-[#ec5a13] hover:scale-110'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 sm:border-2 opacity-50'
        }`}
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-8 sm:px-10 md:px-12 lg:px-16"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allItems.slice(0, 8).map((item) => {
          const distance = getDistance(item.id);
          return (
            <Link href={`/items/${item.id}`} key={item.id} className="flex-shrink-0 w-[calc(100vw-80px)] sm:w-[calc(50vw-60px)] md:w-[calc(33.333vw-50px)] lg:w-[calc(25vw-60px)] max-w-[340px]">
              <Card className="group cursor-pointer overflow-hidden border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] h-full bg-white p-0 gap-0">
                <div className="relative h-40 sm:h-44 md:h-48 lg:h-52 xl:h-56 overflow-hidden bg-gray-200">
                  <img
                    src={item.mainImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Badge de temps en haut à gauche */}
                  <Badge className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-1 sm:gap-1.5 shadow-lg text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium">Il y a {item.postedTime}</span>
                  </Badge>
                  
                  {item.promoted && (
                    <Badge className="absolute top-12 sm:top-14 md:top-16 left-2 sm:left-3 md:left-4 bg-[#ec5a13] hover:bg-orange-600 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg">
                      ⭐ En vedette
                    </Badge>
                  )}
                </div>

                <div className="p-2 sm:p-3 md:p-4">
                  {/* Icône produit/service + Titre */}
                  <div className="flex items-start gap-2 mb-2 sm:mb-3">
                    <div className={`flex-shrink-0 mt-0.5 ${
                      item.type === 'service' ? 'text-blue-600' : 'text-[#ec5a13]'
                    }`}>
                      {item.type === 'service' ? (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 group-hover:text-[#ec5a13] transition-colors line-clamp-2 leading-tight flex-1">
                      {item.title}
                    </h3>
                  </div>

                  {/* Localité + Note */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-[#ec5a13] flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 font-semibold truncate">{item.location}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
                      <span className="text-xs sm:text-sm font-bold text-gray-700">{item.rating}</span>
                    </div>
                  </div>

                  {/* Nom de la boutique */}
                  <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">{item.seller.name}</span>
                  </div>

                  {/* Prix - Plus visible */}
                  <div className="pt-2 sm:pt-3 border-t-2 border-gray-100">
                    <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#ec5a13]">{item.price.replace(/À partir de /gi, '')}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      
      {/* Bouton Voir toutes les annonces */}
      <div className="flex justify-center mt-4 sm:mt-6">
        <Link href="/categories/tous">
          <button className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white border-2 border-[#ec5a13] text-[#ec5a13] rounded-lg hover:bg-[#ec5a13] hover:text-white transition-colors duration-200 font-semibold text-xs sm:text-sm">
            Voir toutes les annonces
          </button>
        </Link>
      </div>
    </div>
  );
}
