// lib/utils/filterUtils.ts
import { Item, Filters } from '@/types/index';

export function filterItems(items: Item[], filters: Filters): Item[] {
  return items.filter(item => {
    // Filtre type
    if (!filters.showProducts && item.type === 'product') return false;
    if (!filters.showServices && item.type === 'service') return false;

    // Filtre condition (seulement pour les produits)
    if (item.type === 'product' && filters.condition !== 'all') {
      if (item.condition !== filters.condition) return false;
    }

    // Filtre prix
    if (filters.priceMin || filters.priceMax) {
      const itemPrice = parseInt(item.price.replace(/\D/g, ''));
      if (filters.priceMin && itemPrice < parseInt(filters.priceMin)) return false;
      if (filters.priceMax && itemPrice > parseInt(filters.priceMax)) return false;
    }

    // Filtre note
    if (filters.minRating > 0 && item.rating < filters.minRating) return false;

    // Filtre promotion
    if (filters.promotedOnly && !item.promoted) return false;

    // Filtre localisation - recherche flexible
    if (filters.location !== 'all' && filters.location.trim() !== '') {
      const locationFilter = filters.location.toLowerCase().trim();
      const itemLocation = item.location.toLowerCase();
      
      // Ne filtre que si la localisation de l'item ne contient pas le terme recherché
      if (!itemLocation.includes(locationFilter)) {
        return false;
      }
    }

    return true;
  });
}

export function sortItems(items: Item[], sortBy: string): Item[] {
  const sorted = [...items];
  
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/\D/g, ''));
        const priceB = parseInt(b.price.replace(/\D/g, ''));
        return priceA - priceB;
      });
    case 'price-desc':
      return sorted.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/\D/g, ''));
        const priceB = parseInt(b.price.replace(/\D/g, ''));
        return priceB - priceA;
      });
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'recent':
    default:
      return sorted;
  }
}

export const ITEMS_PER_PAGE = 10;

export function paginateItems(items: Item[], page: number): Item[] {
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
}

export function getTotalPages(itemsCount: number): number {
  return Math.ceil(itemsCount / ITEMS_PER_PAGE);
}