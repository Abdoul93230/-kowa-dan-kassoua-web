'use client';

// En-tête de l'accueil — même ambiance « nuit et braise » que l'application mobile :
// promesse, recherche avec ville, raccourcis catégories, et les annonces à la une.
import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { CategoryIcon } from '@/components/CategoryIcon';
import { useAuth } from '@/hooks/useAuth';
import type { HomeCategory, HomeData } from '@/lib/api/home';
import { formatCompact } from '@/lib/format';

interface HomeHeroProps {
  stats?: HomeData['stats'];
  cities: string[];
  city: string;
  onCityChange: (city: string) => void;
  shortcuts: HomeCategory[];
  /** Colonne de droite (annonces à la une) */
  aside?: ReactNode;
}

export function HomeHero({ stats, cities, city, onCityChange, shortcuts, aside }: HomeHeroProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  // Calculée dans le navigateur (heure locale) : évite un décalage avec l'heure du serveur
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir');
  }, []);

  const firstName = (user?.name || '').trim().split(/\s+/)[0];
  const cityQuery = city !== 'all' ? `?location=${encodeURIComponent(city)}` : '';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city !== 'all') params.set('location', city);
    router.push(`/categories/tous${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="relative isolate overflow-hidden rounded-b-[2rem] bg-[#070b16] text-white sm:rounded-b-[2.5rem]">
      {/* Fond : dégradé nuit → braise, halos et grille fine (comme l'en-tête du profil mobile) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,#060a14_0%,#10172b_55%,#2a1307_100%)]" />
      <div className="pointer-events-none absolute -right-32 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(236,90,19,0.45),transparent)] motion-safe:animate-[pulse_7s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -bottom-48 -left-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.28),transparent)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="container mx-auto grid max-w-7xl gap-7 px-4 pb-14 pt-6 sm:gap-10 sm:pb-20 sm:pt-14 lg:grid-cols-[1.08fr_1fr] lg:items-center lg:gap-12">
        <div className="min-w-0">
          {/* Signal en direct */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pl-2.5 pr-3.5 text-[13px] text-white/80 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {stats && stats.totalProducts > 0 ? (
              <span>
                <strong className="font-semibold text-white">{formatCompact(stats.totalProducts)}</strong> annonces en ligne au Niger
              </span>
            ) : (
              <span>La place de marché du Niger</span>
            )}
          </div>

          <p className="mt-5 text-sm font-semibold text-[#ffa87b] sm:mt-6" suppressHydrationWarning>
            {greeting ? `${greeting}${firstName ? `, ${firstName}` : ''} 👋` : ' '}
          </p>
          <h1 className="mt-2 text-balance text-white text-[2.15rem] font-black leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-[3.6rem]">
            Achetez et vendez{' '}
            <span className="bg-gradient-to-r from-[#ffb48a] via-[#ff8a4c] to-[#ec5a13] bg-clip-text text-transparent">
              près de chez vous.
            </span>
          </h1>
          <p className="mt-4 hidden max-w-xl leading-relaxed text-white/65 sm:block sm:text-lg">
            Produits, services et bonnes affaires de votre quartier. Discutez en toute sécurité dans la messagerie TakTak — gratuit et sans commission.
          </p>

          {/* Recherche */}
          <form onSubmit={submit} role="search" className="mt-6 sm:mt-8">
            <div className="flex flex-col gap-2 rounded-[1.4rem] bg-white p-2 shadow-[0_30px_80px_-30px_rgba(236,90,19,0.65)] ring-1 ring-white/10 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2">
                <label className="relative flex flex-1 items-center">
                  <span className="sr-only">Que recherchez-vous ?</span>
                  <Search className="pointer-events-none absolute left-4 h-5 w-5 text-gray-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Téléphone, moto, plombier…"
                    enterKeyHint="search"
                    className="h-12 w-full rounded-2xl bg-transparent pl-12 pr-2 text-[15.5px] text-gray-900 placeholder:text-gray-400 focus:outline-none sm:h-[52px]"
                  />
                </label>
                {/* Téléphone : bouton loupe dans la même ligne */}
                <button type="submit" aria-label="Rechercher" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ec5a13] text-white sm:hidden">
                  <Search className="h-5 w-5" />
                </button>
              </div>
              <div className="hidden h-8 w-px bg-gray-200 sm:block" />
              <Select value={city} onValueChange={onCityChange}>
                <SelectTrigger
                  className="!h-11 w-full rounded-xl border-0 bg-gray-50 font-semibold text-gray-900 shadow-none sm:!h-[52px] sm:w-48 sm:rounded-2xl sm:bg-transparent"
                  aria-label="Ville"
                >
                  <MapPin className="h-4 w-4 text-[#ec5a13]" />
                  {/* Libellé explicite : SelectValue restait vide sur certains écrans */}
                  <span className="truncate">{city === 'all' ? 'Tout le Niger' : city}</span>
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
                className="hidden h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#ec5a13] px-7 sm:flex text-[15px] font-bold text-white transition hover:bg-[#d44f11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec5a13] focus-visible:ring-offset-2"
              >
                Rechercher
              </button>
            </div>
          </form>

          {/* Raccourcis : catégories les plus fournies, avec leurs icônes 3D */}
          {shortcuts.length ? (
            <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:mt-5 sm:flex-wrap sm:overflow-visible sm:px-0">
              {shortcuts.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => router.push(`/categories/${cat.slug}${cityQuery}`)}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pl-1.5 pr-3.5 text-[13.5px] font-medium text-white/85 backdrop-blur transition hover:border-white/25 hover:bg-white/[0.12] hover:text-white"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition group-hover:scale-110">
                    <CategoryIcon item={cat} size={20} />
                  </span>
                  {cat.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
    </section>
  );
}
