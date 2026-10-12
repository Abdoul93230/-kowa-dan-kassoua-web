'use client';

// En-tête de l'accueil : salutation, chiffres réels, recherche avec ville
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import type { HomeCategory, HomeData } from '@/lib/api/home';
import { formatCompact } from '@/lib/format';

interface HomeHeroProps {
  stats?: HomeData['stats'];
  cities: string[];
  city: string;
  onCityChange: (city: string) => void;
  popular: HomeCategory[];
}

export function HomeHero({ stats, cities, city, onCityChange, popular }: HomeHeroProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  // Calculée dans le navigateur (heure locale) : évite un décalage avec l'heure du serveur
  const [greeting, setGreeting] = useState('Bienvenue');

  useEffect(() => {
    setGreeting(new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir');
  }, []);

  const firstName = (user?.name || '').trim().split(/\s+/)[0];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city !== 'all') params.set('location', city);
    router.push(`/categories/tous${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Halo d'ambiance */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#ffe9de] via-[#fff5f0] to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />

      <div className="container relative mx-auto max-w-7xl px-4 pb-6 pt-8 sm:pt-12">
        <p className="text-sm font-semibold text-[#b3420e]" suppressHydrationWarning>
          {greeting}{firstName ? `, ${firstName}` : ''} 👋
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-black leading-[1.1] tracking-tight text-gray-900 sm:text-5xl">
          Achetez et vendez <span className="text-[#ec5a13]">près de chez vous</span>, au Niger.
        </h1>

        {stats && stats.totalProducts > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <strong className="font-bold text-gray-900">{formatCompact(stats.totalProducts)}</strong> annonces en ligne
            </span>
            {stats.totalUsers > 0 ? (
              <span><strong className="font-bold text-gray-900">{formatCompact(stats.totalUsers)}</strong> membres</span>
            ) : null}
            {stats.totalCities > 0 ? (
              <span><strong className="font-bold text-gray-900">{stats.totalCities}</strong> villes</span>
            ) : null}
          </div>
        ) : null}

        {/* Recherche */}
        <form onSubmit={submit} role="search" className="mt-6 max-w-3xl">
          <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-[0_18px_40px_-24px_rgba(236,90,19,0.45)] sm:flex-row sm:items-center">
            <label className="relative flex flex-1 items-center">
              <span className="sr-only">Que recherchez-vous ?</span>
              <Search className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Téléphone, moto, plombier…"
                enterKeyHint="search"
                className="h-12 w-full rounded-xl bg-gray-50 pl-10 pr-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ec5a13]"
              />
            </label>

            <Select value={city} onValueChange={onCityChange}>
              <SelectTrigger className="!h-12 w-full rounded-xl border-orange-100 bg-orange-50/60 font-semibold text-gray-900 sm:w-52" aria-label="Ville">
                <MapPin className="h-4 w-4 text-[#ec5a13]" />
                <SelectValue placeholder="Tout le Niger" />
              </SelectTrigger>
              <SelectContent className="max-h-80 rounded-xl">
                <SelectItem value="all">Tout le Niger</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              type="submit"
              className="h-12 rounded-xl bg-[#ec5a13] px-6 text-[15px] font-bold text-white shadow-md shadow-orange-500/30 transition hover:bg-[#d44f11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec5a13] focus-visible:ring-offset-2"
            >
              Rechercher
            </button>
          </div>
        </form>

        {/* Recherches populaires : les catégories les plus fournies */}
        {popular.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-gray-500">Populaire :</span>
            {popular.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => router.push(`/categories/${cat.slug}${city !== 'all' ? `?location=${encodeURIComponent(city)}` : ''}`)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 transition hover:border-[#ec5a13] hover:bg-orange-50 hover:text-[#ec5a13]"
              >
                {cat.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
