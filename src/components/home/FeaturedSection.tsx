'use client';

import { Star, MapPin, Clock, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockItems } from '../../../lib/mockData';
import { Item } from '../../../types';
import Link from "next/link";
import { useRouter } from 'next/navigation';


const allItems: Item[] = Object.values(mockItems).flat();

// Fonction pour calculer une distance aléatoire (à remplacer par vraie géolocalisation plus tard)
const getDistance = (itemId: number) => {
  const distances = [0.5, 1.2, 2.3, 3.5, 4.8, 5.1, 6.7, 8.2, 10.5];
  return distances[itemId % distances.length];
};

export function FeaturedSection() {
  const router = useRouter();
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* En-tête avec indication de localisation */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Navigation className="h-6 w-6 text-[#ec5a13]" />
            <span className="text-sm font-semibold text-[#ec5a13] uppercase tracking-wide">
              Autour de vous
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Annonces récentes près de chez vous
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les dernières offres dans un rayon de <span className="font-semibold text-[#ec5a13]">10 km</span> autour de votre position
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allItems.slice(0, 9).map((item) => {
            const distance = getDistance(item.id);
            return (
            <Link href={`/items/${item.id}`} key={item.id}>
            <Card
              className="group cursor-pointer overflow-hidden border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-56 overflow-hidden bg-gray-200">
                <img
                  src={item.mainImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Badge de distance en haut à gauche */}
                <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 shadow-md">
                  <Navigation className="h-3 w-3" />
                  <span className="font-semibold">{distance} km</span>
                </Badge>
                
                {item.promoted && (
                  <Badge className="absolute top-12 left-3 bg-[#ec5a13] hover:bg-orange-600">
                    En vedette
                  </Badge>
                )}
                <Badge
                  className={`absolute top-3 right-3 font-semibold ${
                    item.type === 'service' 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.type === 'service' ? '🛠️ Service' : '📦 Produit'}
                </Badge>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-[#ec5a13] transition-colors line-clamp-1">
                  {item.title}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{item.seller.name}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 text-[#ec5a13]" />
                  <span className="font-medium">{item.location}</span>
                  <span className="text-xs text-gray-400 ml-1">• {distance} km</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold text-[#ec5a13]">{item.price}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Il y a {item.postedTime}</span>
                  </div>
                </div>
              </div>
            </Card>
            </Link>
          )})}
        </div>

        <div className="text-center mt-10">
          <button 
            onClick={() => router.push('/categories/tous')}
            className="btn-primary px-8 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Voir toutes les offres
          </button>
        </div>
      </div>
    </section>
  );
}
