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
        className="group overflow-hidden border-gray-200 hover:border-[#ec5a13] hover:shadow-xl transition-all duration-300 cursor-pointer bg-white p-0"
      >
        {/* Version mobile - style grille */}
        <div className="md:hidden">
          {/* Image container */}
          <div className="relative h-48 overflow-hidden bg-gray-200">
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
            <Badge className="absolute top-2 left-2 bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-1 shadow-lg text-xs px-2 py-1">
              <Clock className="h-3 w-3" />
              <span className="font-medium">Il y a {item.postedTime}</span>
            </Badge>
            
            {/* Badge en vedette en bas */}
            {item.promoted && (
              <Badge className="absolute bottom-2 left-2 bg-[#ec5a13] hover:bg-orange-600 text-[10px] px-2 py-0.5 shadow-lg">
                ⭐ Vedette
              </Badge>
            )}
            
            {/* Quick actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            {/* Icône produit/service + Titre */}
            <div className="flex items-start gap-2 mb-2">
              <div className={`flex-shrink-0 mt-0.5 ${
                isService ? 'text-blue-600' : 'text-[#ec5a13]'
              }`}>
                {isService ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    <path d="M19.707 14.707A1 1 0 0019 13h-1v-1a1 1 0 00-2 0v1h-1a1 1 0 000 2h1v1a1 1 0 002 0v-1h1a1 1 0 00.707-1.707z"/>
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
                    <circle cx="6.5" cy="6.5" r="1.5"/>
                    <circle cx="17.5" cy="6.5" r="1.5"/>
                    <circle cx="6.5" cy="17.5" r="1.5"/>
                    <circle cx="17.5" cy="17.5" r="1.5"/>
                  </svg>
                )}
              </div>
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#ec5a13] transition-colors line-clamp-2 leading-tight flex-1">
                {item.title}
              </h3>
            </div>

            {/* Localité + Distance */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#ec5a13] flex-shrink-0" />
                <span className="text-xs text-gray-700 font-semibold truncate">{item.location}</span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <Navigation className="h-3 w-3 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-bold text-blue-600">{distance.toFixed(1)} km</span>
              </div>
            </div>

            {/* Nom de la boutique + Note */}
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs text-gray-600 font-medium truncate">{item.seller.name}</span>
              {item.seller.verified && (
                <CheckCircle className="h-3 w-3 text-[#ec5a13] flex-shrink-0" />
              )}
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-gray-700">{item.rating}</span>
              </div>
            </div>

            {/* Prix */}
            <div className="pt-2 border-t-2 border-gray-100">
              <p className="text-lg font-extrabold text-[#ec5a13]">{item.price.replace(/À partir de /gi, '')}</p>
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
            
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {item.promoted && (
                <Badge className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white border-0 shadow-md">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  En vedette
                </Badge>
              )}
              <Badge 
                variant="secondary" 
                className={`${isService ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'} border-0 shadow-md`}
              >
                {isService ? <Briefcase className="h-3 w-3 mr-1" /> : <Package className="h-3 w-3 mr-1" />}
                {isService ? 'Service' : 'Produit'}
              </Badge>
            </div>
            
            {/* Quick actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Badge variant="outline" className="mb-2 text-xs font-medium">{item.category}</Badge>
                <h3 className="font-semibold text-xl text-gray-900 group-hover:text-[#ec5a13] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {!isService && item.condition && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {item.condition === 'new' ? 'Neuf' : 'Occasion'}
                  </Badge>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-[#ec5a13]">{item.price}</p>
                {isService && <p className="text-xs text-gray-500 mt-1">Tarif indicatif</p>}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                <span className="text-xs text-gray-500">({item.totalReviews})</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">{item.seller.name}</span>
              {item.seller.verified && (
                <CheckCircle className="h-4 w-4 text-[#ec5a13]" />
              )}
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Eye className="h-3 w-3" />
                  <span>{item.views}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Il y a {item.postedTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      onClick={handleCardClick}
      className="group cursor-pointer overflow-hidden border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white p-0"
    >
      {/* Image container */}
      <div className="relative h-48 sm:h-52 md:h-56 lg:h-60 overflow-hidden bg-gray-200">
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
        <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-1 sm:gap-1.5 shadow-lg text-xs px-2 sm:px-3 py-1 sm:py-1.5">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="font-medium">Il y a {item.postedTime}</span>
        </Badge>
        
        {/* Badge en vedette en bas */}
        {item.promoted && (
          <Badge className="absolute bottom-2 left-2 sm:left-3 bg-[#ec5a13] hover:bg-orange-600 text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 shadow-lg">
            ⭐ Vedette
          </Badge>
        )}
        
        {/* Quick actions - visible on hover */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Icône produit/service + Titre */}
        <div className="flex items-start gap-2 mb-2 sm:mb-3">
          <div className={`flex-shrink-0 mt-0.5 ${
            isService ? 'text-blue-600' : 'text-[#ec5a13]'
          }`}>
            {isService ? (
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                <path d="M19.707 14.707A1 1 0 0019 13h-1v-1a1 1 0 00-2 0v1h-1a1 1 0 000 2h1v1a1 1 0 002 0v-1h1a1 1 0 00.707-1.707z"/>
              </svg>
            ) : (
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
                <circle cx="6.5" cy="6.5" r="1.5"/>
                <circle cx="17.5" cy="6.5" r="1.5"/>
                <circle cx="6.5" cy="17.5" r="1.5"/>
                <circle cx="17.5" cy="17.5" r="1.5"/>
              </svg>
            )}
          </div>
          <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 group-hover:text-[#ec5a13] transition-colors line-clamp-2 leading-tight flex-1">
            {item.title}
          </h3>
        </div>

        {/* Localité + Distance */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-[#ec5a13] flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-700 font-semibold truncate">{item.location}</span>
          </div>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1">
            <Navigation className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-blue-600">{distance.toFixed(1)} km</span>
          </div>
        </div>

        {/* Nom de la boutique + Note */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">{item.seller.name}</span>
          {item.seller.verified && (
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-[#ec5a13] flex-shrink-0" />
          )}
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold text-gray-700">{item.rating}</span>
          </div>
        </div>

        {/* Prix */}
        <div className="pt-2 sm:pt-3 border-t-2 border-gray-100">
          <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#ec5a13]">{item.price.replace(/À partir de /gi, '')}</p>
        </div>
      </div>
    </Card>
  );
}