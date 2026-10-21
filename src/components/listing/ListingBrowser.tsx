'use client';

// Liste d'annonces : produits, services, catégorie ou recherche.
// L'adresse (URL) est la source de vérité : type, recherche, ville, sous-catégorie, tri et filtres
// y sont reflétés, donc une recherche se partage et le bouton « retour » fonctionne.
// Même langage visuel que l'accueil et l'application mobile.
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown, ChevronRight, Loader2, MapPin, Package, Search, SlidersHorizontal, Wrench, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CategoryIcon } from '@/components/CategoryIcon';
import { ListingCard } from '@/components/home/ListingCard';
import { getCategoryBySlug, type Category } from '@/lib/api/categories';
import { getLocations, getProducts } from '@/lib/api/products';
import type { CardItem } from '@/lib/api/home';
import { subcategoryAllows } from '@/lib/categoryTypes';
import { formatCompact } from '@/lib/format';
import { cn } from '@/lib/utils';

type TypeFilter = 'all' | 'product' | 'service';
const PAGE_SIZE = 24;

const SORTS = [
  { value: 'recent', label: 'Plus récentes', api: '-createdAt' },
  { value: 'price-asc', label: 'Prix croissant', api: 'price' },
  { value: 'price-desc', label: 'Prix décroissant', api: '-price' },
  { value: 'popular', label: 'Les plus vues', api: '-views' },
];
const CONDITIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'new', label: 'Neuf' },
  { value: 'refurbished', label: 'Reconditionné' },
  { value: 'used', label: 'Occasion' },
];
const TYPES: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'product', label: 'Produits' },
  { value: 'service', label: 'Services' },
];

const groupThousands = (v: string) => v.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="aspect-square animate-pulse bg-gray-100" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListingBrowser({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = searchParams ?? new URLSearchParams();

  // ── État lu depuis l'URL ────────────────────────────────────────────────
  const type = (params.get('type') as TypeFilter) || 'all';
  const q = params.get('q') || '';
  const city = params.get('location') || 'all';
  const sub = params.get('subcategory') || '';
  const sort = params.get('sort') || 'recent';
  const condition = params.get('condition') || 'all';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const isAll = slug === 'tous';

  const setParams = useCallback((patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === '' || v === 'all' || (k === 'sort' && v === 'recent')) next.delete(k);
      else next.set(k, v);
    });
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [params, pathname, router]);

  // ── Données ─────────────────────────────────────────────────────────────
  const [category, setCategory] = useState<Category | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [items, setItems] = useState<CardItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  useEffect(() => {
    getLocations().then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    if (isAll) { setCategory(null); return; }
    getCategoryBySlug(slug).then((res) => setCategory(res.data)).catch(() => setCategory(null));
  }, [slug, isAll]);

  const load = useCallback(async (pageToLoad: number) => {
    const id = ++requestId.current;
    if (pageToLoad === 1) setLoading(true); else setLoadingMore(true);
    setError('');
    try {
      const res = await getProducts({
        page: pageToLoad,
        limit: PAGE_SIZE,
        status: 'active',
        view: 'card',
        ...(isAll ? {} : { category: slug }),
        ...(sub ? { subcategory: sub } : {}),
        ...(type !== 'all' ? { type } : {}),
        ...(city !== 'all' ? { location: city } : {}),
        ...(condition !== 'all' && type !== 'service' ? { condition } : {}),
        ...(q.trim() ? { search: q.trim() } : {}),
        ...(minPrice ? { minPrice: Number(minPrice) } : {}),
        ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
        sort: (SORTS.find((s) => s.value === sort) || SORTS[0]).api,
      });
      if (id !== requestId.current) return; // une recherche plus récente a été lancée
      const data = (res.data || []) as CardItem[];
      setItems((prev) => (pageToLoad === 1 ? data : [...prev, ...data.filter((d) => !prev.some((p) => p.id === d.id))]));
      setTotal(res.pagination?.total ?? data.length);
      setPages(res.pagination?.pages ?? 1);
      setPage(pageToLoad);
    } catch (e) {
      if (id === requestId.current) setError((e as Error).message || 'Impossible de charger les annonces');
    } finally {
      if (id === requestId.current) { setLoading(false); setLoadingMore(false); }
    }
  }, [isAll, slug, sub, type, city, condition, q, minPrice, maxPrice, sort]);

  useEffect(() => { load(1); }, [load]);

  // ── Recherche (champ local, validée à l'envoi) ─────────────────────────
  const [query, setQuery] = useState(q);
  useEffect(() => { setQuery(q); }, [q]);

  // ── Panneau de filtres ──────────────────────────────────────────────────
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState({ condition, minPrice, maxPrice, city });
  useEffect(() => {
    if (filtersOpen) setDraft({ condition, minPrice, maxPrice, city });
  }, [filtersOpen, condition, minPrice, maxPrice, city]);

  const activeChips = [
    city !== 'all' && { key: 'location', label: city, icon: MapPin },
    condition !== 'all' && type !== 'service' && { key: 'condition', label: CONDITIONS.find((c) => c.value === condition)?.label || condition },
    (minPrice || maxPrice) && {
      key: 'price',
      label: minPrice && maxPrice ? `${groupThousands(minPrice)} – ${groupThousands(maxPrice)} F` : minPrice ? `Dès ${groupThousands(minPrice)} F` : `Jusqu'à ${groupThousands(maxPrice)} F`,
    },
  ].filter(Boolean) as { key: string; label: string; icon?: typeof MapPin }[];

  const clearChip = (key: string) => {
    if (key === 'price') setParams({ minPrice: null, maxPrice: null });
    else setParams({ [key]: null });
  };

  // ── Titres ──────────────────────────────────────────────────────────────
  const subcategories = useMemo(
    () => (category?.subcategories || []).filter((s) => subcategoryAllows(s, category?.slug, type === 'all' ? undefined : type)),
    [category, type]
  );
  const currentSub = category?.subcategories?.find((s) => s.slug === sub);
  const isService = type === 'service';
  const title = q
    ? `« ${q} »`
    : category
      ? (currentSub ? currentSub.name : category.name)
      : isAll ? (type === 'product' ? 'Produits' : type === 'service' ? 'Services' : 'Toutes les annonces') : '';
  const kicker = q ? 'Résultats de recherche' : category ? (currentSub ? category.name : 'Catégorie') : 'Parcourir';

  return (
    <>
      {/* ── Bandeau ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-[#070b16] text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,#060a14_0%,#10172b_60%,#2a1307_100%)]" />
        <div className={cn('pointer-events-none absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full', isService ? 'bg-[radial-gradient(closest-side,rgba(37,99,235,0.45),transparent)]' : 'bg-[radial-gradient(closest-side,rgba(236,90,19,0.45),transparent)]')} />
        <div className="container mx-auto max-w-7xl px-4 pb-8 pt-6 sm:pb-10 sm:pt-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-[13px] text-white/55">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/categories-list" className="hover:text-white">Catégories</Link>
            {category ? (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href={`/categories/${category.slug}`} className="truncate hover:text-white">{category.name}</Link>
              </>
            ) : null}
          </nav>

          <div className="mt-5 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] sm:h-16 sm:w-16">
              {category ? (
                <CategoryIcon item={currentSub || category} parentSlug={currentSub ? category.slug : undefined} size={40} />
              ) : isService ? (
                <Wrench className="h-7 w-7 text-[#93c5fd]" />
              ) : q ? (
                <Search className="h-7 w-7 text-[#ffa87b]" />
              ) : (
                <Package className="h-7 w-7 text-[#ffa87b]" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/50">{kicker}</p>
              {title ? <h1 className="truncate text-2xl font-black tracking-[-0.02em] text-white sm:text-4xl">{title}</h1> : <div className="my-1 h-8 w-48 animate-pulse rounded-lg bg-white/10 sm:h-10" />}
              <p className="mt-0.5 text-sm text-white/60">
                {loading ? 'Recherche des annonces…' : `${formatCompact(total)} annonce${total > 1 ? 's' : ''}${city !== 'all' ? ` à ${city}` : ''}`}
              </p>
            </div>
          </div>

          {/* Recherche */}
          <form
            role="search"
            onSubmit={(e) => { e.preventDefault(); setParams({ q: query.trim() || null }); }}
            className="mt-6 flex max-w-3xl items-center gap-2 rounded-2xl bg-white p-1.5 shadow-[0_24px_60px_-28px_rgba(236,90,19,0.6)]"
          >
            <label className="relative flex flex-1 items-center">
              <span className="sr-only">Rechercher</span>
              <Search className="pointer-events-none absolute left-3.5 h-5 w-5 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={category ? `Rechercher dans ${category.name}…` : 'Téléphone, moto, plombier…'}
                enterKeyHint="search"
                className="h-11 w-full rounded-xl bg-transparent pl-11 pr-2 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </label>
            {q ? (
              <button type="button" onClick={() => { setQuery(''); setParams({ q: null }); }} aria-label="Effacer la recherche" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <button type="submit" className={cn('flex h-11 items-center gap-2 rounded-xl px-4 font-bold text-white sm:px-5', isService ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#ec5a13] hover:bg-[#d44f11]')}>
              <Search className="h-4 w-4" /><span className="hidden sm:inline">Rechercher</span>
            </button>
          </form>
        </div>
      </section>

      {/* ── Barre d'outils (reste visible au défilement) ─────────────────── */}
      <div className="sticky top-16 z-30 border-b border-gray-200/70 bg-white/85 backdrop-blur-xl">
        <div className="container mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5">
          <div role="tablist" aria-label="Type d'annonce" className="flex shrink-0 rounded-xl bg-gray-100 p-1">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={type === t.value}
                onClick={() => setParams({ type: t.value, subcategory: null })}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-[13.5px] font-semibold transition sm:px-4',
                  type === t.value ? (t.value === 'service' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-900 shadow') : 'text-gray-500 hover:text-gray-900'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Select value={sort} onValueChange={(v) => setParams({ sort: v })}>
              <SelectTrigger className="h-10 gap-1.5 rounded-xl border-gray-200 bg-white px-3 text-[13.5px] font-semibold" aria-label="Trier">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <span className="hidden sm:inline">{SORTS.find((s) => s.value === sort)?.label}</span>
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl">
                {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="relative flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-[13.5px] font-semibold text-gray-900 transition hover:border-gray-300"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtres</span>
              {activeChips.length ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ec5a13] px-1 text-[11px] font-bold text-white">{activeChips.length}</span>
              ) : null}
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-7xl px-4 pb-16 pt-5">
        {/* Sous-catégories (adaptées au type choisi) */}
        {subcategories.length ? (
          <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1" role="list" aria-label="Sous-catégories">
            <button
              type="button"
              onClick={() => setParams({ subcategory: null })}
              className={cn('shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-semibold transition', !sub ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300')}
            >
              Toutes
            </button>
            {subcategories.map((s) => (
              <button
                key={s.slug}
                type="button"
                role="listitem"
                onClick={() => setParams({ subcategory: sub === s.slug ? null : s.slug })}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-[13.5px] font-semibold transition',
                  sub === s.slug ? 'border-[#ec5a13] bg-orange-50 text-[#c2410c]' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50">
                  <CategoryIcon item={s} parentSlug={category?.slug} size={20} />
                </span>
                {s.name}
              </button>
            ))}
          </div>
        ) : null}

        {/* Filtres actifs */}
        {activeChips.length ? (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {activeChips.map((c) => (
              <button key={c.key} type="button" onClick={() => clearChip(c.key)} className="flex items-center gap-1.5 rounded-full bg-orange-50 py-1.5 pl-3 pr-2 text-[13px] font-semibold text-[#c2410c] transition hover:bg-orange-100">
                {c.icon ? <c.icon className="h-3.5 w-3.5" /> : null}
                {c.label}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button type="button" onClick={() => setParams({ location: null, condition: null, minPrice: null, maxPrice: null })} className="text-[13px] font-semibold text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline">
              Tout effacer
            </button>
          </div>
        ) : null}

        {/* Résultats */}
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-white px-6 py-14 text-center">
            <p className="font-semibold text-gray-900">Les annonces n&apos;ont pas pu être chargées</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button type="button" onClick={() => load(1)} className="mt-5 rounded-xl bg-[#ec5a13] px-5 py-2.5 text-sm font-bold text-white">Réessayer</button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#ec5a13]"><Search className="h-7 w-7" /></span>
            <p className="mt-4 text-lg font-bold text-gray-900">Aucune annonce ne correspond</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">Essayez un autre mot, une autre ville ou retirez quelques filtres.</p>
            <button
              type="button"
              onClick={() => router.replace(`${pathname}${type !== 'all' ? `?type=${type}` : ''}`, { scroll: false })}
              className="mt-5 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-900 hover:border-gray-900"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {items.map((item, i) => <ListingCard key={item.id} item={item} imageWidth={300} priority={i < 4} />)}
            </div>
            {page < pages ? (
              <div className="mt-10 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => load(page + 1)}
                  disabled={loadingMore}
                  className="flex h-12 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-7 font-bold text-gray-900 shadow-sm transition hover:border-[#ec5a13] hover:text-[#ec5a13] disabled:opacity-60"
                >
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Voir plus d&apos;annonces
                </button>
                <p className="text-xs text-gray-500">{items.length} sur {formatCompact(total)}</p>
              </div>
            ) : null}
          </>
        )}
      </main>

      {/* ── Panneau des filtres ──────────────────────────────────────────── */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-gray-100 px-6 py-5">
            <SheetTitle className="text-xl font-black">Filtres</SheetTitle>
            <SheetDescription>Affinez les annonces affichées.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
            <div>
              <p className="mb-2.5 text-sm font-bold text-gray-900">Ville</p>
              <Select value={draft.city} onValueChange={(v) => setDraft((d) => ({ ...d, city: v }))}>
                <SelectTrigger className="h-12 w-full rounded-xl" aria-label="Ville">
                  <MapPin className="h-4 w-4 text-[#ec5a13]" />
                  <span className="truncate">{draft.city === 'all' ? 'Tout le Niger' : draft.city}</span>
                </SelectTrigger>
                <SelectContent className="max-h-80 rounded-xl">
                  <SelectItem value="all">Tout le Niger</SelectItem>
                  {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2.5 text-sm font-bold text-gray-900">Prix (FCFA)</p>
              <div className="flex items-center gap-2">
                {(['minPrice', 'maxPrice'] as const).map((k) => (
                  <input
                    key={k}
                    inputMode="numeric"
                    value={groupThousands(draft[k])}
                    onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value.replace(/\D/g, '') }))}
                    placeholder={k === 'minPrice' ? 'Minimum' : 'Maximum'}
                    aria-label={k === 'minPrice' ? 'Prix minimum' : 'Prix maximum'}
                    className="h-12 w-full rounded-xl border border-gray-200 px-4 text-[15px] focus:border-[#ec5a13] focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                ))}
              </div>
            </div>

            {type !== 'service' ? (
              <div>
                <p className="mb-2.5 text-sm font-bold text-gray-900">État</p>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, condition: c.value }))}
                      className={cn(
                        'rounded-xl border-[1.5px] px-3 py-2.5 text-sm font-semibold transition',
                        draft.condition === c.value ? 'border-[#ec5a13] bg-orange-50 text-[#c2410c]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <SheetFooter className="flex-row gap-2 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={() => setDraft({ condition: 'all', minPrice: '', maxPrice: '', city: 'all' })}
              className="h-12 flex-1 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-gray-900"
            >
              Effacer
            </button>
            <button
              type="button"
              onClick={() => {
                setParams({ location: draft.city, condition: draft.condition, minPrice: draft.minPrice || null, maxPrice: draft.maxPrice || null });
                setFiltersOpen(false);
              }}
              className="h-12 flex-[2] rounded-xl bg-[#ec5a13] font-bold text-white hover:bg-[#d44f11]"
            >
              Voir les annonces
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
