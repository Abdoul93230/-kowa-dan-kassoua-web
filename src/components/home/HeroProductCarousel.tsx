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
    <div className="mt-12 relative w-full">
      {/* Bouton gauche */}
      <button
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full transition-all shadow-2xl ${
          canScrollLeft
            ? 'bg-white hover:bg-[#ec5a13] hover:text-white border-2 border-gray-200 hover:border-[#ec5a13] hover:scale-110'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200 opacity-50'
        }`}
      >
        <ChevronLeft className="h-7 w-7" />
      </button>

      {/* Bouton droit */}
      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full transition-all shadow-2xl ${
          canScrollRight
            ? 'bg-white hover:bg-[#ec5a13] hover:text-white border-2 border-gray-200 hover:border-[#ec5a13] hover:scale-110'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200 opacity-50'
        }`}
      >
        <ChevronRight className="h-7 w-7" />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-6 px-16"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allItems.slice(0, 12).map((item) => {
          const distance = getDistance(item.id);
          return (
            <Link href={`/items/${item.id}`} key={item.id} className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px] lg:w-[360px] xl:w-[380px]">
              <Card className="group cursor-pointer overflow-hidden border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] h-full bg-white">
                <div className="relative h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64 overflow-hidden bg-gray-200">
                  <img
                    src={item.mainImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Badge de distance en haut à gauche */}
                  <Badge className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 sm:gap-1.5 shadow-lg text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5">
                    <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-bold">{distance} km</span>
                  </Badge>
                  
                  {item.promoted && (
                    <Badge className="absolute top-12 sm:top-14 md:top-16 left-2 sm:left-3 md:left-4 bg-[#ec5a13] hover:bg-orange-600 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg">
                      ⭐ En vedette
                    </Badge>
                  )}
                  <Badge
                    className={`absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg ${
                      item.type === 'service' 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.type === 'service' ? '🛠️ Service' : '📦 Produit'}
                  </Badge>
                </div>

                <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-900 mb-2 sm:mb-3 group-hover:text-[#ec5a13] transition-colors line-clamp-1 leading-tight min-h-[24px] sm:min-h-[28px]">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400" />
                      <span className="text-sm sm:text-base font-bold text-gray-700">{item.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm sm:text-base text-gray-600 font-medium truncate">{item.seller.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#ec5a13] flex-shrink-0" />
                    <span className="font-semibold truncate">{item.location}</span>
                    <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">• {distance} km</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t-2 border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#ec5a13] truncate">{item.price}</p>
                      {item.negotiable && (
                        <span className="text-xs text-green-600 font-semibold whitespace-nowrap">Négociable</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="whitespace-nowrap hidden sm:inline">Il y a {item.postedTime}</span>
                      <span className="whitespace-nowrap sm:hidden">{item.postedTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      
      {/* Bouton Voir toutes les annonces */}
      <div className="flex justify-center mt-6 sm:mt-8">
        <Link href="/items">
          <button className="px-6 py-3 bg-white border-2 border-[#ec5a13] text-[#ec5a13] rounded-lg hover:bg-[#ec5a13] hover:text-white transition-colors duration-200 font-semibold text-sm sm:text-base">
            Voir toutes les annonces
          </button>
        </Link>
      </div>
    </div>
  );
}
