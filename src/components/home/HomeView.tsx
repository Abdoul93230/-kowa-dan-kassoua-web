'use client';

// Accueil — même parcours que l'application mobile :
// à la une → catégories → tendances → publier → services → vendeurs → récemment publiées → l'app.
// Les données arrivent déjà rendues par le serveur ; la ville et le filtre se changent sans recharger.
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Gift, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AppPromoBar } from './AppPromoBar';
import { HomeHero } from './HomeHero';
import { FeaturedCarousel } from './FeaturedCarousel';
import { CategoryRail } from './CategoryRail';
import { ListingCard } from './ListingCard';
import { Rail, SectionHeader } from './Rail';
import { PublishBanner } from './PublishBanner';
import { ActiveSellers } from './ActiveSellers';
import { AppShowcase } from './AppShowcase';
import { getHome, getLatest, type CardItem, type FeedType, type HomeData } from '@/lib/api/home';
import { formatCompact, productImage } from '@/lib/format';
import { cn } from '@/lib/utils';

const CITY_KEY = 'taktak:city';
const EMPTY: HomeData = {
  latest: [], trending: [], services: [], categories: [], sellers: [],
  stats: { totalProducts: 0, totalUsers: 0, totalCities: 0 }, cities: [],
};

const FEEDS: { value: FeedType; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'product', label: 'Produits' },
  { value: 'service', label: 'Services' },
];

// À la une : les annonces avec photo d'abord (comme le carrousel mobile)
const pickFeatured = (trending: CardItem[], latest: CardItem[]) => {
  const withPhoto = [...trending, ...latest].filter((it, i, all) => productImage(it) && all.findIndex((x) => x.id === it.id) === i);
  return withPhoto.slice(0, 6);
};

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('container mx-auto max-w-7xl px-4', className)}>{children}</section>;
}

export function HomeView({ initial }: { initial: HomeData | null }) {
  const [data, setData] = useState<HomeData>(initial || EMPTY);
  const [loading, setLoading] = useState(!initial);
  const [city, setCity] = useState('all');
  const [feed, setFeed] = useState<FeedType>('all');
  const [latest, setLatest] = useState<CardItem[]>(initial?.latest || []);
  const [feedLoading, setFeedLoading] = useState(false);
  const firstCity = useRef(true);

  // Ville mémorisée (comme sur le mobile)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CITY_KEY);
      if (saved) setCity(saved);
    } catch { /* stockage indisponible */ }
  }, []);

  // Données de l'accueil : rechargées quand la ville change (ou si le serveur n'a rien pu fournir)
  useEffect(() => {
    if (firstCity.current && initial && city === 'all') { firstCity.current = false; return undefined; }
    firstCity.current = false;
    const ctrl = new AbortController();
    setLoading(true);
    getHome(city, 'all', ctrl.signal)
      .then((d) => { setData(d); setLatest(d.latest); setFeed('all'); })
      .catch(() => { /* on garde l'affichage précédent */ })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [city, initial]);

  const changeCity = useCallback((value: string) => {
    setCity(value);
    try { localStorage.setItem(CITY_KEY, value); } catch { /* ignore */ }
  }, []);

  const changeFeed = useCallback(async (value: FeedType) => {
    if (value === feed) return;
    setFeed(value);
    setFeedLoading(true);
    try {
      setLatest(await getLatest(value, city));
    } catch { /* garde la liste */ } finally {
      setFeedLoading(false);
    }
  }, [feed, city]);

  const featured = useMemo(() => pickFeatured(data.trending, data.latest), [data.trending, data.latest]);
  const shortcuts = useMemo(
    () => [...data.categories].sort((a, b) => (b.totalCount || 0) - (a.totalCount || 0)).slice(0, 5),
    [data.categories]
  );
  const cityLabel = city === 'all' ? 'tout le Niger' : city;
  const allHref = (type?: FeedType) => {
    const p = new URLSearchParams();
    if (type && type !== 'all') p.set('type', type);
    if (city !== 'all') p.set('location', city);
    return `/categories/tous${p.toString() ? `?${p}` : ''}`;
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <AppPromoBar />
      <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
        <Header />
      </Suspense>

      <main>
        <HomeHero
          stats={data.stats}
          cities={data.cities}
          city={city}
          onCityChange={changeCity}
          shortcuts={shortcuts}
          aside={featured.length ? <FeaturedCarousel items={featured} tone="dark" /> : null}
        />

        {/* Engagements — chevauche l'en-tête comme la carte de stats du profil mobile */}
        <Section className="relative z-10 -mt-9">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-gray-100 bg-gray-100 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.4)] lg:grid-cols-4">
            {[
              { icon: Sparkles, label: data.stats.totalProducts ? `${formatCompact(data.stats.totalProducts)} annonces` : 'Nouvelles annonces', sub: 'publiées chaque jour' },
              { icon: ShieldCheck, label: 'Membres vérifiés', sub: 'profils et avis réels' },
              { icon: MessageCircle, label: 'Messagerie sécurisée', sub: 'votre numéro reste privé' },
              { icon: Gift, label: '100 % gratuit', sub: 'sans commission' },
            ].map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-center gap-2.5 bg-white px-3 py-3.5 sm:gap-3 sm:px-5 sm:py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#ec5a13]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold leading-tight text-gray-900 sm:truncate sm:text-[14px]">{label}</span>
                  <span className="hidden truncate text-[12.5px] text-gray-500 sm:block">{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <div className={cn('transition-opacity duration-300', loading && 'opacity-60')}>
          {/* Catégories */}
          <Section className="mt-14">
            <SectionHeader title="Explorer par catégorie" subtitle={`Tout ce qui se vend et se propose à ${cityLabel}`} href="/categories-list" linkLabel="Tout voir" />
            <CategoryRail categories={data.categories} city={city} />
          </Section>

          {/* Tendances */}
          {data.trending.length ? (
            <Section className="mt-14">
              <SectionHeader title="Tendances 🔥" subtitle="Les annonces les plus consultées" href={allHref()} />
              <Rail label="Tendances" itemClassName="w-[172px] sm:w-[200px] lg:w-[228px]">
                {data.trending.map((item, i) => <ListingCard key={item.id} item={item} imageWidth={228} priority={i < 2} />)}
              </Rail>
            </Section>
          ) : null}

          {/* Publier */}
          <Section className="mt-14">
            <PublishBanner totalUsers={data.stats.totalUsers} />
          </Section>

          {/* Services */}
          {data.services.length ? (
            <Section className="mt-14">
              <SectionHeader title="Services à la une" subtitle="Artisans et prestataires de confiance" href={allHref('service')} accent="blue" />
              <Rail label="Services à la une" itemClassName="w-[172px] sm:w-[200px] lg:w-[228px]">
                {data.services.map((item) => <ListingCard key={item.id} item={item} imageWidth={228} />)}
              </Rail>
            </Section>
          ) : null}

          {/* Vendeurs actifs */}
          {data.sellers.length ? (
            <Section className="mt-14">
              <SectionHeader title="Vendeurs actifs" subtitle="Ils ont publié récemment" />
              <ActiveSellers sellers={data.sellers} />
            </Section>
          ) : null}

          {/* Récemment publiées */}
          <Section className="mt-14">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">Récemment publiées</h2>
                <p className="mt-0.5 text-sm text-gray-500">Les dernières annonces à {cityLabel}</p>
              </div>
              <div role="tablist" aria-label="Type d'annonce" className="flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
                {FEEDS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    role="tab"
                    aria-selected={feed === f.value}
                    onClick={() => changeFeed(f.value)}
                    className={cn(
                      'rounded-xl px-4 py-2 text-sm font-semibold transition',
                      feed === f.value
                        ? f.value === 'service' ? 'bg-blue-600 text-white shadow' : 'bg-[#ec5a13] text-white shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {latest.length ? (
              <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5', feedLoading && 'opacity-60')}>
                {latest.map((item) => <ListingCard key={item.id} item={item} imageWidth={240} />)}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                <p className="font-semibold text-gray-900">{loading || feedLoading ? 'Chargement des annonces…' : 'Aucune annonce pour le moment'}</p>
                <p className="mt-1 text-sm text-gray-500">Revenez bientôt, ou soyez le premier à publier ici.</p>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Link
                href={allHref(feed)}
                prefetch={false}
                className="group inline-flex h-12 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 font-bold text-gray-900 shadow-sm transition hover:border-[#ec5a13] hover:text-[#ec5a13]"
              >
                Voir toutes les annonces
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Section>

          {/* L'application */}
          <Section className="mb-16 mt-16">
            <AppShowcase items={data.latest.length ? data.latest : data.trending} />
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
