'use client';

import { Star, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockItems } from '../../../lib/mockData';
import { Item } from '../../../types';
import Link from "next/link";
import { useEffect, useRef, useState } from 'react';

const allItems: Item[] = Object.values(mockItems).flat();

export function ProductsCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Découvrez nos annonces
            </h2>
            <p className="text-lg text-gray-600">
              Produits et services populaires
            </p>
          </div>

          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                canScrollLeft
                  ? 'border-[#ec5a13] text-[#ec5a13] hover:bg-orange-50'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
            >
              ←
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                canScrollRight
                  ? 'border-[#ec5a13] text-[#ec5a13] hover:bg-orange-50'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allItems.slice(0, 12).map((item) => (
            <Link href={`/items/${item.id}`} key={item.id}>
              <Card className="group cursor-pointer min-w-[280px] max-w-[280px] overflow-hidden border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <img
                    src={item.mainImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {item.promoted && (
                    <Badge className="absolute top-2 left-2 bg-[#ec5a13] hover:bg-orange-600 text-xs">
                      En vedette
                    </Badge>
                  )}
                  <Badge
                    className={`absolute top-2 right-2 text-xs font-semibold ${
                      item.type === 'service'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.type === 'service' ? '🛠️ Service' : '📦 Produit'}
                  </Badge>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-base text-gray-900 mb-2 group-hover:text-[#ec5a13] transition-colors line-clamp-2 min-h-[3rem]">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <p className="text-xl font-bold text-[#ec5a13]">{item.price}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-gray-700">{item.rating}</span>
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
