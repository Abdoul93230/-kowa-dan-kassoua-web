import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extrait intelligemment le nom de la ville d'une localisation
 * Si la localisation contient "Niger", affiche seulement la ville
 * Sinon, affiche la localisation complète (pour les autres pays)
 * 
 * Exemples:
 * - "Maradi, Niger" → "Maradi"
 * - "Niamey, Niger" → "Niamey"
 * - "Dakar, Sénégal" → "Dakar, Sénégal"
 * - "Abidjan, Côte d'Ivoire" → "Abidjan, Côte d'Ivoire"
 * - "Maradi" → "Maradi"
 */
export function getCityName(location: string): string {
  if (!location) return '';
  
  const trimmedLocation = location.trim();
  
  // Vérifier si "Niger" est présent dans la localisation
  if (trimmedLocation.toLowerCase().includes('niger')) {
    // Si oui, extraire uniquement la partie avant la virgule
    const parts = trimmedLocation.split(',').map(part => part.trim());
    return parts[0] || trimmedLocation;
  }
  
  // Si "Niger" n'est pas présent, retourner la localisation telle quelle
  return trimmedLocation;
}
