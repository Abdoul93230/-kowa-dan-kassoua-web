'use client';

import { 
  Star, 
  MapPin, 
  Clock,
  Package,
  Briefcase
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Item } from '../../../types/index';



export function ItemCard({ item, viewMode }: { item: Item; viewMode: 'grid' | 'list' }) {
  const isService = item.type === 'service';
  
  if (viewMode === 'list') {
    return (
      <Card className="flex flex-col md:flex-row gap-4 p-4 border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="relative w-full md:w-48 h-48 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
          <img
            src={item.mainImage}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          />
          {item.promoted && (
            <Badge className="absolute top-2 left-2 bg-emerald-600 hover:bg-emerald-700">
              En vedette
            </Badge>
          )}
          <Badge 
            variant="secondary" 
            className={`absolute top-2 right-2 ${isService ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
          >
            {isService ? <Briefcase className="h-3 w-3 mr-1" /> : <Package className="h-3 w-3 mr-1" />}
            {isService ? 'Service' : 'Produit'}
          </Badge>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div>
              <Badge variant="secondary" className="mb-2">{item.category}</Badge>
              <h3 className="font-semibold text-lg text-slate-900 hover:text-emerald-600 transition-colors">
                {item.title}
              </h3>
              {!isService && item.condition && (
                <Badge variant="outline" className="mt-1">
                  {item.condition === 'new' ? 'Neuf' : 'Occasion'}
                </Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">{item.price}</p>
              {isService && <p className="text-xs text-slate-500 mt-1">Tarif indicatif</p>}
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{item.description}</p>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-slate-700">{item.rating}</span>
            </div>
            <span className="text-slate-400">•</span>
            <span className="text-sm text-slate-600">{item.seller.name}</span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>Il y a {item.postedTime}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group cursor-pointer overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="relative h-56 overflow-hidden bg-slate-200">
        <img
          src={item.mainImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {item.promoted && (
          <Badge className="absolute top-3 left-3 bg-emerald-600 hover:bg-emerald-700">
            En vedette
          </Badge>
        )}
        <Badge 
          variant="secondary" 
          className={`absolute top-3 right-3 ${isService ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
        >
          {isService ? <Briefcase className="h-3 w-3 mr-1" /> : <Package className="h-3 w-3 mr-1" />}
          {isService ? 'Service' : 'Produit'}
        </Badge>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 flex-1">
            {item.title}
          </h3>
        </div>

        {!isService && item.condition && (
          <Badge variant="outline" className="mb-2 text-xs">
            {item.condition === 'new' ? 'Neuf' : 'Occasion'}
          </Badge>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-slate-700">{item.rating}</span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="text-sm text-slate-600 truncate">{item.seller.name}</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-2xl font-bold text-emerald-600">{item.price}</p>
            {isService && <p className="text-xs text-slate-500">Tarif indicatif</p>}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            <span>Il y a {item.postedTime}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}