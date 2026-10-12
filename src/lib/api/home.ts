// ─── Accueil : une seule requête pour tout l'écran ──────────────────────────
// Utilisable côté serveur (rendu de la page, mis en cache 60 s par Next) et côté
// navigateur (changement de ville / d'onglet). Données publiques : pas de jeton.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface CardItem {
  id: string;
  title: string;
  price: string;
  location: string;
  mainImage?: string;
  images?: string[];
  category?: string;
  categorySlug?: string;
  type: 'product' | 'service';
  condition?: 'new' | 'used' | 'refurbished';
  promoted?: boolean;
  featured?: boolean;
  views?: number;
  favorites?: number;
  createdAt?: string;
  sellerId?: string;
  seller?: { id: string; name: string; businessName?: string; avatar?: string; verified?: boolean };
}

export interface HomeCategory {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  totalCount?: number;
  productsCount?: number;
  servicesCount?: number;
}

export interface HomeSeller {
  _id: string;
  name: string;
  businessName?: string;
  avatar?: string;
  location?: string;
  productCount: number;
  isOnline?: boolean;
}

export interface HomeData {
  latest: CardItem[];
  trending: CardItem[];
  services: CardItem[];
  categories: HomeCategory[];
  sellers: HomeSeller[];
  stats: { totalProducts: number; totalUsers: number; totalCities: number };
  cities: string[];
}

export type FeedType = 'all' | 'product' | 'service';

const homeQuery = (location?: string, type?: FeedType) => {
  const params = new URLSearchParams();
  if (location && location !== 'all') params.set('location', location);
  if (type && type !== 'all') params.set('type', type);
  const qs = params.toString();
  return `${API_URL}/home${qs ? `?${qs}` : ''}`;
};

// Côté serveur : rendu de la page d'accueil, réutilisé 60 s (ISR)
export async function fetchHomeServer(): Promise<HomeData | null> {
  try {
    // 5 s maximum : si l'API est lente, la page s'affiche quand même et le navigateur prend le relais
    const res = await fetch(homeQuery(), { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null; // le navigateur prendra le relais
  }
}

// Côté navigateur
export async function getHome(location?: string, type?: FeedType, signal?: AbortSignal): Promise<HomeData> {
  const res = await fetch(homeQuery(location, type), { signal });
  if (!res.ok) throw new Error(`Accueil indisponible (${res.status})`);
  const json = await res.json();
  return json.data;
}

// Grille « Récemment publiées » filtrée par type (format carte, sans comptage)
export async function getLatest(type: FeedType, location?: string, signal?: AbortSignal): Promise<CardItem[]> {
  const params = new URLSearchParams({ limit: '20', view: 'card', withTotal: '0' });
  if (type !== 'all') params.set('type', type);
  if (location && location !== 'all') params.set('location', location);
  const res = await fetch(`${API_URL}/products?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Annonces indisponibles (${res.status})`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}
