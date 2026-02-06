'use client';

import { Star, Clock, Navigation, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockItems } from '@/lib/mockData';
import { Item } from '@/types';
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
            <Link href={`/items/${item.id}`} key={item.id} className="flex-shrink-0 w-[calc(100vw-80px)] sm:w-[calc(50vw-60px)] md:w-[calc(33.333vw-50px)] lg:w-[calc(25vw-60px)] xl:w-[calc(25vw-60px)] max-w-[340px]">
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
