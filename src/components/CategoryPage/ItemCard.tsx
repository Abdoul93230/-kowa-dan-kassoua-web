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
  TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Item } from '../../../types/index';
import { useRouter } from 'next/navigation';

export function ItemCard({ item, viewMode }: { item: Item; viewMode: 'grid' | 'list' }) {
  const router = useRouter();
  const isService = item.type === 'service';
  
  const handleCardClick = () => {
    router.push(`/items/${item.id}`);
  };
  
  if (viewMode === 'list') {
    return (
      <Card 
        onClick={handleCardClick}
        className="group flex flex-col md:flex-row overflow-hidden border-gray-200 hover:border-[#ec5a13] hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
      >
        {/* Image container - fixes the spacing issue */}
        <div className="relative w-full md:w-64 h-64 md:h-auto flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
          <img
            src={item.mainImage}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              // Fallback for broken images
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
      </Card>
    );
  }

  return (
    <Card 
      onClick={handleCardClick}
      className="group cursor-pointer overflow-hidden border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white"
    >
      {/* Image container - fixes the spacing issue */}
      <div className="relative h-72 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
        <img
          src={item.mainImage}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            // Fallback for broken images
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop';
          }}
        />
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        
        {/* Badges */}
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
        
        {/* Quick actions - visible on hover */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#ec5a13] transition-colors line-clamp-2 flex-1">
            {item.title}
          </h3>
        </div>

        {!isService && item.condition && (
          <Badge variant="outline" className="mb-3 text-xs">
            {item.condition === 'new' ? 'Neuf' : 'Occasion'}
          </Badge>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-gray-700">{item.rating}</span>
            <span className="text-xs text-gray-500">({item.totalReviews})</span>
          </div>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 truncate">{item.seller.name}</span>
            {item.seller.verified && (
              <CheckCircle className="h-4 w-4 text-[#ec5a13]" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-xl font-bold text-[#ec5a13]">{item.price}</p>
            {isService && <p className="text-xs text-gray-500">Tarif indicatif</p>}
          </div>
          <div className="flex items-center gap-3">
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
    </Card>
  );
}