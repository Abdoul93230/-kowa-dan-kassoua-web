'use client';

import { Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCityName } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Item } from '@/types';
import { mockItems } from '@/lib/mockData';
import Link from "next/link";
import { useEffect, useRef, useState } from 'react';

export function ProductsCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const allItems: Item[] = Object.values(mockItems).flat();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 450;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      // Mettre à jour les boutons après le scroll
      setTimeout(() => {
        updateScrollButtons();
      }, 100);
    }
  };

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      
      // Vérifier régulièrement pour s'assurer que les boutons sont à jour
      const interval = setInterval(updateScrollButtons, 500);
      
      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
        clearInterval(interval);
      };
    }
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 relative">
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
          className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-12 sm:px-14 md:px-16"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allItems.slice(0, 12).map((item) => (
            <Link href={`/items/${item.id}`} key={item.id}>
              <Card className="group cursor-pointer min-w-[240px] sm:min-w-[260px] md:min-w-[280px] max-w-[240px] sm:max-w-[260px] md:max-w-[280px] overflow-hidden border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden bg-gray-200">
                  <img
                    src={item.mainImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {item.promoted && (
                    <Badge className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-[#ec5a13] hover:bg-orange-600 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                      En vedette
                    </Badge>
                  )}
                  <Badge
                    className={`absolute top-1.5 sm:top-2 right-1.5 sm:right-2 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 ${
                      item.type === 'service'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.type === 'service' ? '🛠️ Service' : '📦 Produit'}
                  </Badge>
                </div>

                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 group-hover:text-[#ec5a13] transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{getCityName(item.location)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <p className="text-lg sm:text-xl font-bold text-[#ec5a13] truncate">{item.price}</p>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{item.rating}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/categories/tous">
            <button className="btn-primary px-8 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg">
              Voir toutes les annonces
            </button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
