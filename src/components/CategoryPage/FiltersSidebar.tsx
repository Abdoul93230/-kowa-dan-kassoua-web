'use client';

import { 
  ChevronRight, 
  SlidersHorizontal, 
  Star, 
  MapPin, 
  Clock,
  Grid3x3,
  List,
  ArrowUpDown,
  X,
  Package,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function FiltersSidebar({ 
  onClose, 
  isMobile = false,
  filters,
  setFilters,
  urlType
}: { 
  onClose?: () => void; 
  isMobile?: boolean;
  filters: any;
  setFilters: (filters: any) => void;
  urlType?: string | null;
}) {
  return (
    <div className={`bg-white ${isMobile ? 'p-4' : 'rounded-lg border border-gray-200 p-6 shadow-sm'}`}>
      {isMobile && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-900">Filtres</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Type de contenu */}
      <div className="mb-6">
        <Label className="text-sm font-semibold text-gray-900 mb-3 block">Type</Label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-[#ec5a13] focus:ring-[#ec5a13]" 
              checked={filters.showProducts}
              onChange={(e) => setFilters({...filters, showProducts: e.target.checked})}
            />
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Produits</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-[#ec5a13] focus:ring-[#ec5a13]" 
              checked={filters.showServices}
              onChange={(e) => setFilters({...filters, showServices: e.target.checked})}
            />
            <Briefcase className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Services</span>
          </label>
        </div>
      </div>

      {/* Prix */}
      <div className="mb-6">
        <Label className="text-sm font-semibold text-gray-900 mb-3 block">Prix (FCFA)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
            className="text-sm focus:border-[#ec5a13] focus:ring-[#ec5a13]"
          />
          <span className="text-gray-500">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
            className="text-sm focus:border-[#ec5a13] focus:ring-[#ec5a13]"
          />
        </div>
      </div>

      {/* Localisation */}
      <div className="mb-6">
        <Label className="text-sm font-semibold text-gray-900 mb-3 block">Localisation</Label>
        <Select 
          value={filters.location} 
          onValueChange={(value) => setFilters({...filters, location: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Toutes les villes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les villes</SelectItem>
            <SelectItem value="dakar">Dakar, Sénégal</SelectItem>
            <SelectItem value="abidjan">Abidjan, Côte d'Ivoire</SelectItem>
            <SelectItem value="lome">Lomé, Togo</SelectItem>
            <SelectItem value="cotonou">Cotonou, Bénin</SelectItem>
            <SelectItem value="ouagadougou">Ouagadougou, Burkina Faso</SelectItem>
            <SelectItem value="niamey">Niamey, Niger</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* État (seulement pour les produits) */}
      {filters.showProducts && (
        <div className="mb-6">
          <Label className="text-sm font-semibold text-gray-900 mb-3 block">État</Label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="condition" 
                className="border-gray-300 text-[#ec5a13] focus:ring-[#ec5a13]" 
                checked={filters.condition === 'all'}
                onChange={() => setFilters({...filters, condition: 'all'})}
              />
              <span className="text-sm text-gray-700">Tous</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="condition" 
                className="border-gray-300 text-[#ec5a13] focus:ring-[#ec5a13]" 
                checked={filters.condition === 'new'}
                onChange={() => setFilters({...filters, condition: 'new'})}
              />
              <span className="text-sm text-gray-700">Neuf</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="condition" 
                className="border-gray-300 text-[#ec5a13] focus:ring-[#ec5a13]" 
                checked={filters.condition === 'used'}
                onChange={() => setFilters({...filters, condition: 'used'})}
              />
              <span className="text-sm text-gray-700">Occasion</span>
            </label>
          </div>
        </div>
      )}

      {/* Note minimale */}
      <div className="mb-6">
        <Label className="text-sm font-semibold text-gray-900 mb-3 block">Note minimale</Label>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="rating" 
                className="border-gray-300 text-[#ec5a13] focus:ring-[#ec5a13]" 
                checked={filters.minRating === rating}
                onChange={() => setFilters({...filters, minRating: rating})}
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm text-gray-700 ml-1">& plus</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Promotions */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="rounded border-gray-300 text-[#ec5a13] focus:ring-[#ec5a13]" 
            checked={filters.promotedOnly}
            onChange={(e) => setFilters({...filters, promotedOnly: e.target.checked})}
          />
          <span className="text-sm text-gray-700">Offres en vedette uniquement</span>
        </label>
      </div>

      <Button 
        className="w-full bg-[#ec5a13] hover:bg-[#d94f0f] text-white"
        onClick={onClose}
      >
        Appliquer les filtres
      </Button>
      
      <Button 
        variant="ghost" 
        className="w-full mt-2"
        onClick={() => setFilters({
          showProducts: urlType === 'service' ? false : true,
          showServices: urlType === 'product' ? false : true,
          priceMin: '',
          priceMax: '',
          location: 'all',
          condition: 'all',
          minRating: 0,
          promotedOnly: false
        })}
      >
        Réinitialiser
      </Button>
    </div>
  );
}