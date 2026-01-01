'use client';

import { 
  Star, 
  MapPin, 
  Clock,
  Package,
  Briefcase,
  Heart,
  MessageCircle,
  Eye,
  CheckCircle,
  TrendingUp,
  Navigation
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Item } from '../../../types/index';
import { useRouter } from 'next/navigation';

export function ItemCard({ item, viewMode }: { item: Item; viewMode: 'grid' | 'list' }) {
  const router = useRouter();
  const isService = item.type === 'service';
  
  // Fonction pour calculer la distance
  const getDistance = (itemId: number) => {
    const distances = [0.5, 1.2, 2.3, 3.5, 4.8, 5.1, 6.7, 8.2, 10.5];
    return distances[itemId % distances.length];
  };
  
  const distance = getDistance(item.id);
  
  const handleCardClick = () => {
    router.push(`/items/${item.id}`);
  };
  
  if (viewMode === 'list') {
    return (
      <Card 
        onClick={handleCardClick}
        className="group overflow-hidden border-gray-200 hover:border-[#ec5a13] hover:shadow-xl transition-all duration-300 cursor-pointer bg-white p-0 gap-0"
      >
        {/* Version mobile - style grille */}
        <div className="md:hidden">
          {/* Image container */}
          <div className="relative h-28 sm:h-32 md:h-36 lg:h-40 xl:h-44 overflow-hidden bg-gray-200">
            <img
              src={item.mainImage}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop';
              }}
            />
            
            {/* Badge de temps en haut à gauche */}
            <Badge className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-white/90 backdrop-blur-sm text-gray-700 flex items-center gap-1 sm:gap-1.5 shadow-md text-xs px-2 py-1 rounded-lg border-0">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="font-medium">Il y a {item.postedTime}</span>
            </Badge>
            
            {/* Quick actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            {/* Icône + Titre */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm sm:text-base flex-shrink-0">
                {isService ? '🔧' : '📦'}
              </span>
              <h3 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-[#ec5a13] transition-colors truncate flex-1">
                {item.title}
              </h3>
            </div>

            {/* Localité + Distance */}
            <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-600">
              <MapPin className="h-3 w-3 text-[#ec5a13] flex-shrink-0" />
              <span className="truncate">{item.location}</span>
              <span className="text-gray-400">•</span>
              <span className="whitespace-nowrap">{distance.toFixed(1)} km</span>
            </div>

            {/* Prix */}
            <div>
              <p className="text-base sm:text-lg font-bold text-[#ec5a13]">{item.price.replace(/À partir de /gi, '')}</p>
            </div>
          </div>
        </div>

        {/* Version desktop - style liste */}
        <div className="hidden md:flex">
          {/* Image container */}
          <div className="relative w-64 h-auto flex-shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
            <img
              src={item.mainImage}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop';
              }}
            />
            
            {/* Badges overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            
            {/* Overlay gradient pour meilleure lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            
            {/* Quick actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col p-5">
            {/* Icône + Titre */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl flex-shrink-0">
                {isService ? '🔧' : '📦'}
              </span>
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-[#ec5a13] transition-colors truncate flex-1">
                {item.title}
              </h3>
            </div>

            {/* Localité + Distance */}
            <div className="flex items-center gap-1.5 mb-4 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-[#ec5a13] flex-shrink-0" />
              <span className="truncate">{item.location}</span>
              <span className="text-gray-400">•</span>
              <span className="whitespace-nowrap">{distance.toFixed(1)} km</span>
            </div>

            {/* Prix */}
            <div className="mb-4">
              <p className="text-xl sm:text-2xl font-bold text-[#ec5a13]">{item.price.replace(/À partir de /gi, '')}</p>
            </div>

            {/* Description (optionnelle) */}
            {item.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-100">
              <Clock className="h-3.5 w-3.5" />
              <span>Il y a {item.postedTime}</span>
              <span className="text-gray-400 mx-1">•</span>
              <Eye className="h-3.5 w-3.5" />
              <span>{item.views.toLocaleString()} vues</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      onClick={handleCardClick}
      className="group cursor-pointer overflow-hidden border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] h-full bg-white p-0 gap-0"
    >
      {/* Image container */}
      <div className="relative h-28 sm:h-32 md:h-36 lg:h-40 xl:h-44 overflow-hidden bg-gray-200">
        <img
          src={item.mainImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop';
          }}
        />
        
        {/* Badge de temps en haut à gauche */}
        <Badge className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-white/90 backdrop-blur-sm text-gray-700 flex items-center gap-1 sm:gap-1.5 shadow-md text-xs px-2 py-1 rounded-lg border-0">
          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="font-medium">Il y a {item.postedTime}</span>
        </Badge>
        
        {/* Quick actions - visible on hover */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Icône + Titre */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm sm:text-base flex-shrink-0">
            {isService ? '🔧' : '📦'}
          </span>
          <h3 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-[#ec5a13] transition-colors truncate flex-1">
            {item.title}
          </h3>
        </div>

        {/* Localité + Distance */}
        <div className="flex items-center gap-1.5 mb-3 text-xs sm:text-sm text-gray-600">
          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#ec5a13] flex-shrink-0" />
          <span className="truncate">{item.location}</span>
          <span className="text-gray-400">•</span>
          <span className="whitespace-nowrap">{distance.toFixed(1)} km</span>
        </div>

        {/* Prix */}
        <div>
          <p className="text-base sm:text-lg md:text-xl font-bold text-[#ec5a13]">{item.price.replace(/À partir de /gi, '')}</p>
        </div>
      </div>
    </Card>
  );
}