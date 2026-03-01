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

/**
 * Formate une date ISO en format relatif en français
 * 
 * Exemples:
 * - Il y a quelques secondes
 * - Il y a 5 minutes
 * - Il y a 2 heures
 * - Il y a 3 jours
 * - Il y a 2 semaines
 * - Le 15 janvier 2026
 * 
 * @param isoDate Date au format ISO 8601 (ex: "2026-03-01T11:04:45.301Z")
 * @returns Date formatée en français
 */
export function formatRelativeDate(isoDate: string): string {
  if (!isoDate) return '';

  const date = new Date(isoDate);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  // Moins d'une minute
  if (diffInSeconds < 60) {
    return 'Il y a quelques secondes';
  }

  // Moins d'une heure
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 
      ? 'Il y a 1 minute' 
      : `Il y a ${diffInMinutes} minutes`;
  }

  // Moins d'un jour
  if (diffInHours < 24) {
    return diffInHours === 1 
      ? 'Il y a 1 heure' 
      : `Il y a ${diffInHours} heures`;
  }

  // Moins d'une semaine
  if (diffInDays < 7) {
    return diffInDays === 1 
      ? 'Il y a 1 jour' 
      : `Il y a ${diffInDays} jours`;
  }

  // Moins d'un mois
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 
      ? 'Il y a 1 semaine' 
      : `Il y a ${diffInWeeks} semaines`;
  }

  // Moins d'un an
  if (diffInMonths < 12) {
    return diffInMonths === 1 
      ? 'Il y a 1 mois' 
      : `Il y a ${diffInMonths} mois`;
  }

  // Plus d'un an - afficher la date complète
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `Le ${day} ${month} ${year}`;
}
