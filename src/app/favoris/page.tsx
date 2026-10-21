'use client';

// Mes favoris — même ambiance que l'accueil ; accueil dédié pour les visiteurs non connectés
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, Heart, HeartCrack, LogIn, Scale, Search, Smartphone, Sparkles, WifiOff } from 'lucide-react';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { ListingCard } from '@/components/home/ListingCard';
import { Rail, SectionHeader } from '@/components/home/Rail';
import { getMyFavorites } from '@/lib/api/favorites';
import { getProducts } from '@/lib/api/products';
import type { CardItem } from '@/lib/api/home';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useQuickAuth } from '@/contexts/QuickAuthContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'product' | 'service';
const PAGE_SIZE = 48;
const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5';

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="aspect-square animate-pulse bg-gray-200" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-gray-200" />
        <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

// Annonces populaires, pour ne jamais laisser la page vide
function Suggestions({ title, subtitle }: { title: string; subtitle: string }) {
  const [items, setItems] = useState<CardItem[]>([]);
  useEffect(() => {
    getProducts({ limit: 12, status: 'active', sort: '-views', view: 'card' })
      .then((res) => setItems((res.data || []) as CardItem[]))
      .catch(() => setItems([]));
  }, []);
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <SectionHeader title={title} subtitle={subtitle} href="/categories/tous" />
      <Rail label={title} itemClassName="w-[172px] sm:w-[200px] lg:w-[228px]">
        {items.map((p) => <ListingCard key={p.id} item={p} imageWidth={228} />)}
      </Rail>
    </section>
  );
}

function Band({ count, children }: { count?: number; children?: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#060a14_0%,#10172b_60%,#2a1307_100%)]">
      <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(236,90,19,0.38),transparent)]" />
      <div className="container mx-auto max-w-7xl px-4 pb-8 pt-8 sm:pb-10 sm:pt-10">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Heart className="h-7 w-7 fill-[#ff8a4c] text-[#ff8a4c]" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Mes favoris</h1>
            <p className="mt-0.5 text-sm text-white/60">
              {count === undefined
                ? 'Gardez sous la main les annonces qui vous plaisent.'
                : count > 0
                  ? `${count} annonce${count > 1 ? 's' : ''} mise${count > 1 ? 's' : ''} de côté`
                  : 'Rien de côté pour le moment'}
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function FavorisPage() {
  const { user, loading: authLoading } = useAuth();
  const { openQuickAuth } = useQuickAuth();
  const { favorites: favoriteIds, toggleFavorite, loading: favLoading } = useFavorites();

  const [items, setItems] = useState<CardItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const sentinel = useRef<HTMLDivElement>(null);
  const knownIds = useRef<Set<string>>(new Set());

  const load = useCallback(async (pageToLoad: number) => {
    if (pageToLoad === 1) setStatus('loading');
    else setLoadingMore(true);
    try {
      const res = await getMyFavorites(pageToLoad, PAGE_SIZE, 'card');
      const list = (res.data || []) as CardItem[];
      setItems((prev) => {
        if (pageToLoad === 1) return list;
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...list.filter((p) => !seen.has(p.id))];
      });
      setTotal(res.pagination?.total ?? list.length);
      setPage(pageToLoad);
      setStatus('ready');
    } catch {
      if (pageToLoad === 1) setStatus('error');
    } finally {
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (user) load(1);
  }, [user, load]);

  // Retrait depuis le cœur d'une carte : l'annonce disparaît, avec possibilité d'annuler
  const favSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  useEffect(() => {
    const removed = [...knownIds.current].filter((id) => !favSet.has(id));
    knownIds.current = new Set(items.map((i) => String(i.id)).filter((id) => favSet.has(id)));
    if (removed.length === 1) {
      const id = removed[0];
      const removedItem = items.find((i) => String(i.id) === id);
      toast('Retiré de vos favoris', {
        description: removedItem?.title,
        action: { label: 'Annuler', onClick: () => toggleFavorite(id).catch(() => {}) },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favSet, items]);

  const visible = useMemo(() => items.filter((i) => favSet.has(String(i.id))), [items, favSet]);
  const counts = useMemo(
    () => ({
      all: visible.length,
      product: visible.filter((i) => i.type === 'product').length,
      service: visible.filter((i) => i.type === 'service').length,
    }),
    [visible]
  );
  const removedCount = items.length - visible.length;
  const totalCount = Math.max(0, total - removedCount);

  const normalized = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const shown = useMemo(() => {
    const q = normalized(query.trim());
    return visible.filter((i) => (tab === 'all' || i.type === tab) && (!q || normalized(`${i.title} ${i.location} ${i.category || ''}`).includes(q)));
  }, [visible, tab, query]);

  const hasMore = items.length < total;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || status !== 'ready' || loadingMore || !hasMore) return undefined;
    const obs = new IntersectionObserver((e) => e[0]?.isIntersecting && load(page + 1), { rootMargin: '1200px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [status, loadingMore, hasMore, page, load]);

  // ─── Visiteur non connecté ────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#f6f7fb]">
        <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
          <Header />
        </Suspense>
        <Band />
        <div className="container mx-auto max-w-7xl px-4 pb-16 pt-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] sm:p-10">
            <div className="relative mx-auto h-24 w-24">
              <span className="absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,#ff8a4c,#ec5a13)] shadow-[0_18px_40px_-14px_rgba(236,90,19,0.8)]" />
              <Heart className="absolute inset-0 m-auto h-11 w-11 fill-white text-white" />
              <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-amber-950 ring-4 ring-white">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight text-gray-900 sm:text-[28px]">Un coup de cœur ? Gardez-le.</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-gray-500">
              Connectez-vous pour enregistrer les annonces qui vous plaisent et les retrouver sur le site comme sur l&apos;application.
            </p>
            <ul className="mx-auto mt-6 grid max-w-lg gap-2 text-left text-sm text-gray-700 sm:grid-cols-3 sm:text-center">
              {[
                { icon: Heart, text: 'Tout au même endroit' },
                { icon: Scale, text: 'Comparez avant de décider' },
                { icon: Smartphone, text: 'Synchronisé avec l’app' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2.5 sm:flex-col sm:gap-1.5 sm:py-3">
                  <Icon className="h-4 w-4 shrink-0 text-[#ec5a13]" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => openQuickAuth('/favoris')}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ec5a13] px-6 text-[15px] font-bold text-white shadow-[0_14px_30px_-12px_rgba(236,90,19,0.75)] transition hover:bg-[#d44f11]"
              >
                <LogIn className="h-5 w-5" /> Se connecter
              </button>
              <Link href="/categories/tous" className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 px-6 text-[15px] font-bold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50">
                Parcourir les annonces
              </Link>
            </div>
          </div>
          <Suggestions title="Les annonces du moment" subtitle="De quoi trouver votre premier coup de cœur" />
        </div>
        <Footer />
      </div>
    );
  }

  const loading = authLoading || favLoading || status === 'loading';

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
        <Header />
      </Suspense>

      <Band count={loading || status === 'error' ? undefined : totalCount}>
        {!loading && status === 'ready' && totalCount > 0 ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div role="tablist" aria-label="Type d'annonces" className="inline-flex self-start rounded-full bg-white/10 p-1 ring-1 ring-white/10">
              {([
                { key: 'all', label: 'Tout' },
                { key: 'product', label: 'Produits' },
                { key: 'service', label: 'Services' },
              ] as { key: Tab; label: string }[]).map((t) => {
                const active = tab === t.key;
                if (t.key !== 'all' && counts[t.key] === 0 && !active) return null;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition',
                      active ? (t.key === 'service' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900') : 'text-white/70 hover:text-white'
                    )}
                  >
                    {t.label}
                    <span className={cn('rounded-full px-1.5 text-xs', active ? (t.key === 'service' ? 'bg-white/20' : 'bg-gray-100 text-gray-600') : 'bg-white/10')}>
                      {counts[t.key]}
                    </span>
                  </button>
                );
              })}
            </div>
            {totalCount > 6 ? (
              <label className="relative block sm:w-72">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Chercher dans mes favoris"
                  className="h-11 w-full rounded-full bg-white/10 pl-11 pr-4 text-sm text-white outline-none ring-1 ring-white/15 placeholder:text-white/45 focus:bg-white/15 focus:ring-white/30"
                />
              </label>
            ) : null}
          </div>
        ) : null}
      </Band>

      <div className="container mx-auto max-w-7xl px-4 pb-16 pt-6 sm:pt-8">
        {loading ? (
          <div className={GRID}>{Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : status === 'error' ? (
          <div className="mx-auto max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
              <WifiOff className="h-7 w-7" />
            </span>
            <p className="mt-4 text-lg font-black text-gray-900">Impossible de charger vos favoris</p>
            <p className="mt-1 text-sm text-gray-500">Vérifiez votre connexion internet puis réessayez.</p>
            <button type="button" onClick={() => load(1)} className="mt-5 inline-flex h-11 items-center rounded-full bg-[#ec5a13] px-5 text-sm font-bold text-white transition hover:bg-[#d44f11]">
              Réessayer
            </button>
          </div>
        ) : visible.length === 0 ? (
          <>
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ec5a13]">
                <HeartCrack className="h-8 w-8" />
              </span>
              <p className="mt-5 text-xl font-black tracking-tight text-gray-900">Pas encore de coup de cœur</p>
              <p className="mx-auto mt-1.5 max-w-sm text-[15px] text-gray-500">
                Touchez le <Heart className="inline h-4 w-4 fill-[#ec5a13] text-[#ec5a13]" /> sur une annonce pour la retrouver ici, sur le site comme sur l&apos;application.
              </p>
              <Link href="/categories/tous" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#ec5a13] px-5 text-sm font-bold text-white transition hover:bg-[#d44f11]">
                Découvrir les annonces <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Suggestions title="Les annonces du moment" subtitle="Les plus consultées en ce moment" />
          </>
        ) : shown.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
            <p className="text-lg font-black text-gray-900">Aucun favori ne correspond</p>
            <p className="mt-1 text-sm text-gray-500">Essayez un autre mot ou un autre onglet.</p>
            <button type="button" onClick={() => { setQuery(''); setTab('all'); }} className="mt-4 text-sm font-bold text-[#ec5a13] hover:underline">
              Tout afficher
            </button>
          </div>
        ) : (
          <>
            <div className={GRID}>
              {shown.map((item, i) => <ListingCard key={item.id} item={item} imageWidth={260} priority={i < 5} />)}
              {loadingMore ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={`s${i}`} />) : null}
            </div>
            <div ref={sentinel} aria-hidden className="h-px" />
            <p className="mt-10 text-center text-xs text-gray-400">
              Les annonces vendues ou retirées disparaissent automatiquement de vos favoris.
            </p>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
