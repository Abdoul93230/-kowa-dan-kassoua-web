'use client';

// Toutes les catégories — icônes 3D, sous-catégories cliquables, recherche instantanée
// (sans accents) et choix Produits / Services, comme dans l'application mobile.
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, Package, Search, SlidersHorizontal, Wrench, X } from 'lucide-react';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { CategoryIcon } from '@/components/CategoryIcon';
import { getCategories, type Category } from '@/lib/api/categories';
import { filterCategoriesForType } from '@/lib/categoryTypes';
import { formatCompact } from '@/lib/format';
import { cn } from '@/lib/utils';

type TypeFilter = 'all' | 'product' | 'service';
const TYPES: { value: TypeFilter; label: string; icon: typeof Package }[] = [
  { value: 'all', label: 'Tout', icon: SlidersHorizontal },
  { value: 'product', label: 'Produits', icon: Package },
  { value: 'service', label: 'Services', icon: Wrench },
];
const MAX_SUBS = 6;

// Recherche insensible aux accents et à la casse
const fold = (v?: string) => (v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const countOf = (cat: Category, type: TypeFilter) =>
  type === 'product' ? cat.productsCount || 0
    : type === 'service' ? cat.servicesCount || 0
      : cat.totalCount ?? (cat.productsCount || 0) + (cat.servicesCount || 0);

function CategoryCard({ cat, type, query }: { cat: Category; type: TypeFilter; query: string }) {
  const [expanded, setExpanded] = useState(false);
  const q = fold(query);
  const typeQs = type !== 'all' ? `type=${type}` : '';
  const href = (sub?: string) => {
    const p = [typeQs, sub ? `subcategory=${sub}` : ''].filter(Boolean).join('&');
    return `/categories/${cat.slug}${p ? `?${p}` : ''}`;
  };
  const count = countOf(cat, type);

  // Recherche : on montre en priorité les sous-catégories qui correspondent
  const subs = useMemo(() => {
    const all = cat.subcategories || [];
    if (!q || fold(cat.name).includes(q)) return all;
    return all.filter((s) => fold(s.name).includes(q));
  }, [cat, q]);
  const shown = expanded ? subs : subs.slice(0, MAX_SUBS);
  const hidden = subs.length - shown.length;

  return (
    <article className="group flex flex-col rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] transition hover:border-orange-100 hover:shadow-[0_26px_50px_-30px_rgba(236,90,19,0.4)]">
      <Link href={href()} prefetch={false} className="flex items-center gap-4 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec5a13]">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50 transition group-hover:scale-105">
          <CategoryIcon item={cat} size={44} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-black tracking-tight text-gray-900">{cat.name}</span>
          <span className="mt-0.5 block text-sm text-gray-500">
            {count ? `${formatCompact(count)} annonce${count > 1 ? 's' : ''}` : 'Soyez le premier à publier'}
          </span>
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition group-hover:bg-[#ec5a13] group-hover:text-white">
          <ChevronRight className="h-5 w-5" />
        </span>
      </Link>

      {subs.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {shown.map((s) => {
            const match = q && fold(s.name).includes(q);
            return (
              <Link
                key={s.slug}
                href={href(s.slug)}
                prefetch={false}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-[13px] font-semibold transition',
                  match ? 'border-[#ec5a13] bg-orange-50 text-[#c2410c]' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50">
                  <CategoryIcon item={s} parentSlug={cat.slug} size={18} />
                </span>
                {s.name}
              </Link>
            );
          })}
          {hidden > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-[13px] font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-800"
            >
              +{hidden} autre{hidden > 1 ? 's' : ''}
            </button>
          ) : null}
        </div>
      ) : null}

      <Link
        href={href()}
        prefetch={false}
        className="mt-auto inline-flex items-center gap-1.5 self-start pt-5 text-sm font-bold text-[#ec5a13] hover:gap-2.5"
      >
        Voir les annonces <ArrowRight className="h-4 w-4 transition-all" />
      </Link>
    </article>
  );
}

export default function CategoriesListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TypeFilter>('all');

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const byType = filterCategoriesForType(categories, type === 'all' ? undefined : type);
    const q = fold(query.trim());
    if (!q) return byType;
    return byType.filter((c) => fold(c.name).includes(q) || fold(c.description).includes(q) || c.subcategories?.some((s) => fold(s.name).includes(q)));
  }, [categories, type, query]);

  const totalAds = categories.reduce((n, c) => n + countOf(c, 'all'), 0);
  const totalSubs = categories.reduce((n, c) => n + (c.subcategories?.length || 0), 0);
  const isService = type === 'service';

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
        <Header />
      </Suspense>

      {/* ── Bandeau ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-[#070b16] text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,#060a14_0%,#10172b_60%,#2a1307_100%)]" />
        <div className={cn('pointer-events-none absolute -right-24 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full', isService ? 'bg-[radial-gradient(closest-side,rgba(37,99,235,0.45),transparent)]' : 'bg-[radial-gradient(closest-side,rgba(236,90,19,0.45),transparent)]')} />
        <div className="container mx-auto max-w-7xl px-4 pb-10 pt-6 sm:pb-14 sm:pt-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-[13px] text-white/55">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/80">Catégories</span>
          </nav>

          <h1 className="mt-5 text-balance text-3xl font-black tracking-[-0.03em] text-white sm:text-5xl">
            Toutes les catégories
          </h1>
          <p className="mt-2 text-white/60 sm:text-lg">
            {loading
              ? 'Chargement…'
              : `${categories.length} catégories · ${totalSubs} sous-catégories · ${formatCompact(totalAds)} annonces en ligne`}
          </p>

          <div className="mt-7 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex flex-1 items-center rounded-2xl bg-white p-1.5 shadow-[0_24px_60px_-28px_rgba(236,90,19,0.6)]">
              <span className="sr-only">Rechercher une catégorie</span>
              <Search className="pointer-events-none absolute left-5 h-5 w-5 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Coiffure, moto, plomberie…"
                className="h-11 w-full rounded-xl bg-transparent pl-11 pr-10 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              {query ? (
                <button type="button" onClick={() => setQuery('')} aria-label="Effacer" className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </label>

            <div role="tablist" aria-label="Type d'annonce" className="flex shrink-0 rounded-2xl border border-white/10 bg-white/[0.07] p-1 backdrop-blur">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={type === t.value}
                  onClick={() => setType(t.value)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:flex-none',
                    type === t.value ? (t.value === 'service' ? 'bg-blue-600 text-white' : 'bg-[#ec5a13] text-white') : 'text-white/70 hover:text-white'
                  )}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Grille ──────────────────────────────────────────────────────── */}
      <main className="container mx-auto max-w-7xl px-4 pb-20 pt-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 animate-pulse rounded-2xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-1/2 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((__, j) => <div key={j} className="h-8 w-24 animate-pulse rounded-full bg-gray-100" />)}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-white px-6 py-14 text-center">
            <p className="font-semibold text-gray-900">Les catégories n&apos;ont pas pu être chargées</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-[#ec5a13] px-5 py-2.5 text-sm font-bold text-white">Réessayer</button>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#ec5a13]"><Search className="h-7 w-7" /></span>
            <p className="mt-4 text-lg font-bold text-gray-900">Aucune catégorie pour « {query} »</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">Cherchez plutôt directement parmi les annonces.</p>
            <Link
              href={`/categories/tous?q=${encodeURIComponent(query)}`}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ec5a13] px-5 py-2.5 text-sm font-bold text-white"
            >
              <Search className="h-4 w-4" /> Rechercher « {query} » dans les annonces
            </Link>
          </div>
        ) : (
          <>
            {query ? (
              <p className="mb-4 text-sm text-gray-500">
                <strong className="font-bold text-gray-900">{visible.length}</strong> catégorie{visible.length > 1 ? 's' : ''} pour « {query} »
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((cat) => <CategoryCard key={cat._id} cat={cat} type={type} query={query} />)}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
