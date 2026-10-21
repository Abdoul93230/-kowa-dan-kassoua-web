'use client';

// Boutique d'un vendeur — même présentation que l'écran mobile (identité, chiffres clés, onglets, grille infinie)
import { Suspense, useCallback, useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { ListingCard } from '@/components/home/ListingCard';
import { SellerQRCode } from '@/components/seller/SellerQRCode';
import { getSellerProfile } from '@/lib/api/auth';
import { getProducts } from '@/lib/api/products';
import type { CardItem } from '@/lib/api/home';
import { useAuth } from '@/hooks/useAuth';
import { cityOf, getInitials, sizedImage } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  CalendarDays,
  Facebook,
  Globe,
  Instagram,
  MapPin,
  Package,
  Pencil,
  Share2,
  ShieldCheck,
  Star,
  UserX,
  WifiOff,
} from 'lucide-react';

interface SellerProfile {
  id: string;
  name: string;
  businessName?: string;
  avatar?: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  memberSince: string;
  responseTime?: string;
  dealsConcluded?: number;
  location: string;
  bio?: string;
  contactInfo?: { website?: string; facebook?: string; instagram?: string };
  totalListings: number;
}

type Tab = 'all' | 'product' | 'service';
type Sort = '-createdAt' | 'price' | '-price' | '-views';

const PAGE_SIZE = 24;
const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'product', label: 'Produits' },
  { key: 'service', label: 'Services' },
];
const SORTS: { value: Sort; label: string }[] = [
  { value: '-createdAt', label: 'Plus récentes' },
  { value: '-views', label: 'Plus vues' },
  { value: 'price', label: 'Prix croissant' },
  { value: '-price', label: 'Prix décroissant' },
];

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
        <Header />
      </Suspense>
      {children}
      <Footer />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="aspect-square animate-pulse bg-gray-200" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-gray-200" />
        <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5';

export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sellerId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading');
  const [bioOpen, setBioOpen] = useState(false);

  const [tab, setTab] = useState<Tab>('all');
  const [sort, setSort] = useState<Sort>('-createdAt');
  const [counts, setCounts] = useState({ all: 0, product: 0, service: 0 });
  const [items, setItems] = useState<CardItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const requestId = useRef(0);
  const sentinel = useRef<HTMLDivElement>(null);
  const listTop = useRef<HTMLDivElement>(null);

  // ─── Profil ───────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await getSellerProfile(sellerId);
      setSeller(res.data || null);
      setStatus(res.data ? 'ready' : 'notfound');
    } catch (err: any) {
      setStatus(/introuvable|not found|404/i.test(String(err?.message)) ? 'notfound' : 'error');
    }
  }, [sellerId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ─── Annonces paginées (la dernière requête l'emporte) ────────────────────
  // La première page renvoie aussi les compteurs Tout / Produits / Services
  const loadItems = useCallback(
    async (pageToLoad: number) => {
      const reqId = ++requestId.current;
      if (pageToLoad > 1) setLoadingMore(true);
      try {
        const res = await getProducts({
          seller: sellerId,
          page: pageToLoad,
          limit: PAGE_SIZE,
          status: 'active',
          view: 'card',
          sort,
          ...(pageToLoad === 1 ? { facets: 'type' as const } : {}),
          ...(tab !== 'all' ? { type: tab } : {}),
        });
        if (reqId !== requestId.current) return;
        if (res.facets) setCounts({ all: res.facets.all || 0, product: res.facets.product || 0, service: res.facets.service || 0 });
        const list = (Array.isArray(res.data) ? res.data : []) as CardItem[];
        setItems((prev) => {
          if (pageToLoad === 1) return list;
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...list.filter((p) => !seen.has(p.id))];
        });
        setTotal(Number(res.pagination?.total ?? list.length));
        setPage(pageToLoad);
      } catch {
        if (reqId === requestId.current && pageToLoad === 1) setItems([]);
      } finally {
        if (reqId === requestId.current) {
          setListLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [sellerId, tab, sort]
  );

  useEffect(() => {
    setListLoading(true);
    loadItems(1);
  }, [loadItems]);

  const hasMore = items.length < total;

  // Défilement infini : la page suivante se charge bien avant d'atteindre le bas
  useEffect(() => {
    const el = sentinel.current;
    if (!el || listLoading || loadingMore || !hasMore) return undefined;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadItems(page + 1);
    }, { rootMargin: '1200px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [listLoading, loadingMore, hasMore, page, loadItems]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 1400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const changeTab = (t: Tab) => {
    if (t === tab) return;
    setTab(t);
    const top = listTop.current?.getBoundingClientRect().top;
    if (top !== undefined && top < 0) listTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ─── États globaux ─────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <PageShell>
        <div className="h-44 bg-[linear-gradient(135deg,#060a14_0%,#10172b_60%,#2a1307_100%)] sm:h-52" />
        <div className="container mx-auto -mt-20 max-w-7xl px-4 pb-16">
          <div className="relative rounded-3xl bg-white p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)]">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <div className="h-28 w-28 animate-pulse rounded-3xl bg-gray-200" />
              <div className="w-full flex-1 space-y-3">
                <div className="mx-auto h-7 w-56 animate-pulse rounded-xl bg-gray-200 sm:mx-0" />
                <div className="mx-auto h-4 w-40 animate-pulse rounded-full bg-gray-100 sm:mx-0" />
              </div>
            </div>
          </div>
          <div className={cn(GRID, 'mt-8')}>
            {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </PageShell>
    );
  }

  if (status !== 'ready' || !seller) {
    const notFound = status === 'notfound';
    return (
      <PageShell>
        <div className="container mx-auto flex max-w-7xl justify-center px-4 py-20">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-[0_20px_50px_-30px_rgba(15,23,42,0.4)]">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
              {notFound ? <UserX className="h-8 w-8" /> : <WifiOff className="h-8 w-8" />}
            </span>
            <h1 className="mt-5 text-2xl font-black tracking-tight text-gray-900">{notFound ? 'Vendeur introuvable' : 'Connexion impossible'}</h1>
            <p className="mt-2 text-[15px] text-gray-500">
              {notFound ? "Ce profil n'existe plus ou a été désactivé." : 'Vérifiez votre connexion internet puis réessayez.'}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              {notFound ? (
                <button type="button" onClick={() => router.back()} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 px-5 text-sm font-bold text-gray-700 transition hover:border-gray-300">
                  <ArrowLeft className="h-4 w-4" /> Retour
                </button>
              ) : (
                <button type="button" onClick={fetchProfile} className="inline-flex h-11 items-center justify-center rounded-full bg-[#ec5a13] px-5 text-sm font-bold text-white transition hover:bg-[#d44f11]">
                  Réessayer
                </button>
              )}
              <Link href="/categories/tous" className="inline-flex h-11 items-center justify-center rounded-full border border-gray-200 px-5 text-sm font-bold text-gray-700 transition hover:border-gray-300">
                Voir les annonces
              </Link>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  const name = seller.businessName || seller.name || 'Vendeur';
  const isMe = user?.id === seller.id;
  const rating = Number(seller.rating || 0);
  const reviews = Number(seller.totalReviews || 0);
  const bio = String(seller.bio || '').trim();
  const longBio = bio.length > 220;
  const links = seller.contactInfo || {};
  const listingCount = counts.all || seller.totalListings || 0;

  const shareProfile = async () => {
    const url = window.location.href.split('?')[0];
    const text = `Découvrez ${name} sur TakTak (${listingCount} annonce${listingCount > 1 ? 's' : ''})`;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Lien de la boutique copié');
    } catch {
      // Partage annulé
    }
  };

  const stats = [
    { value: String(listingCount), label: listingCount > 1 ? 'Annonces' : 'Annonce' },
    {
      value: reviews > 0 ? (
        <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{rating.toFixed(1)}</span>
      ) : '—',
      label: reviews > 0 ? `${reviews} avis` : "Pas d'avis",
    },
    { value: String(seller.dealsConcluded || 0), label: 'Ventes conclues' },
    { value: seller.responseTime || '—', label: 'Délai de réponse' },
  ];

  return (
    <PageShell>
      {/* Couverture */}
      <div className="relative isolate h-44 overflow-hidden bg-[linear-gradient(135deg,#060a14_0%,#10172b_60%,#2a1307_100%)] sm:h-52">
        <div className="pointer-events-none absolute -right-24 -top-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(236,90,19,0.4),transparent)]" />
        <div className="pointer-events-none absolute -bottom-40 left-10 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(255,168,123,0.16),transparent)]" />
        <div className="container mx-auto max-w-7xl px-4 pt-5">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-[13px] text-white/55">
            <button type="button" onClick={() => router.back()} aria-label="Retour" className="mr-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Link href="/" className="transition hover:text-white">Accueil</Link>
            <span className="opacity-60">/</span>
            <span className="truncate text-white/80">Boutique</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto -mt-24 max-w-7xl px-4 pb-16 sm:-mt-28">
        {/* Identité */}
        <section className="relative rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
              <span className="relative shrink-0">
                {seller.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sizedImage(seller.avatar, 192)} alt={name} className="h-28 w-28 rounded-3xl object-cover ring-4 ring-white shadow-lg sm:h-32 sm:w-32" />
                ) : (
                  <span className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#ff8a4c,#ec5a13)] text-3xl font-black text-white ring-4 ring-white shadow-lg sm:h-32 sm:w-32">
                    {getInitials(name)}
                  </span>
                )}
                {seller.verified ? (
                  <BadgeCheck className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-full bg-white fill-blue-500 text-white" aria-label="Vérifié" />
                ) : null}
              </span>

              <div className="min-w-0">
                <h1 className="text-2xl font-black leading-tight tracking-tight text-gray-900 [overflow-wrap:anywhere] sm:text-3xl">{name}</h1>
                {seller.businessName && seller.name && seller.businessName !== seller.name ? (
                  <p className="mt-0.5 text-sm text-gray-500">{seller.name}</p>
                ) : null}
                <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-gray-500 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{cityOf(seller.location)}</span>
                  {seller.memberSince ? (
                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Membre depuis {seller.memberSince}</span>
                  ) : null}
                </p>
                {seller.verified ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" /> Vendeur vérifié
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
              {isMe ? (
                <Link href="/profile" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ec5a13] px-5 text-sm font-bold text-white transition hover:bg-[#d44f11]">
                  <Pencil className="h-4 w-4" /> Modifier mon profil
                </Link>
              ) : null}
              <button type="button" onClick={shareProfile} className="inline-flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-bold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50">
                <Share2 className="h-4 w-4" /> Partager
              </button>
              <SellerQRCode sellerId={sellerId} sellerName={name} />
              {links.facebook ? (
                <a href={links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:text-[#1877f2]">
                  <Facebook className="h-4 w-4" />
                </a>
              ) : null}
              {links.instagram ? (
                <a href={links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:text-[#d62976]">
                  <Instagram className="h-4 w-4" />
                </a>
              ) : null}
              {links.website ? (
                <a href={links.website} target="_blank" rel="noopener noreferrer" aria-label="Site web" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:text-gray-900">
                  <Globe className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          {bio ? (
            <div className="mt-5 max-w-3xl">
              <p className={cn('whitespace-pre-line text-[15px] leading-relaxed text-gray-600 [overflow-wrap:anywhere]', longBio && !bioOpen && 'line-clamp-3')}>{bio}</p>
              {longBio ? (
                <button type="button" onClick={() => setBioOpen((v) => !v)} className="mt-1 text-sm font-bold text-[#ec5a13] hover:underline">
                  {bioOpen ? 'Voir moins' : 'Lire la suite'}
                </button>
              ) : null}
            </div>
          ) : null}

          <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl bg-gray-50 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  'px-4 py-4 text-center',
                  i % 2 === 1 && 'border-l border-gray-200/70',
                  i >= 2 && 'border-t border-gray-200/70 sm:border-t-0',
                  i === 2 && 'sm:border-l'
                )}
              >
                <dd className="truncate text-xl font-black text-gray-900">{s.value}</dd>
                <dt className="mt-0.5 text-xs text-gray-500">{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* Annonces */}
        <div ref={listTop} className="scroll-mt-20" />
        <div className="sticky top-16 z-20 -mx-4 mt-8 bg-[#f6f7fb]/90 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="Type d'annonces" className="inline-flex rounded-full border border-gray-200 bg-white p-1">
              {TABS.map((t) => {
                const active = tab === t.key;
                const count = counts[t.key];
                if (t.key !== 'all' && count === 0 && !active) return null;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => changeTab(t.key)}
                    className={cn(
                      'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition',
                      active ? (t.key === 'service' ? 'bg-blue-600 text-white' : 'bg-[#0b1020] text-white') : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {t.label}
                    <span className={cn('rounded-full px-1.5 text-xs', active ? 'bg-white/20' : 'bg-gray-100 text-gray-500')}>{count}</span>
                  </button>
                );
              })}
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-500">
              <span className="hidden sm:inline">Trier</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-11 rounded-full border border-gray-200 bg-white px-4 pr-8 text-sm font-semibold text-gray-800 outline-none focus:border-gray-400"
              >
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5">
          {listLoading ? (
            <div className={GRID}>
              {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Package className="h-7 w-7" />
              </span>
              <p className="mt-4 text-lg font-black text-gray-900">
                {tab === 'service' ? 'Aucun service' : tab === 'product' ? 'Aucun produit' : 'Aucune annonce'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {isMe ? 'Publiez votre première annonce : elle apparaîtra ici.' : "Ce vendeur n'a rien publié ici pour le moment."}
              </p>
              {isMe ? (
                <Link href="/publish" className="mt-5 inline-flex h-11 items-center rounded-full bg-[#ec5a13] px-5 text-sm font-bold text-white transition hover:bg-[#d44f11]">
                  Publier une annonce
                </Link>
              ) : null}
            </div>
          ) : (
            <>
              <div className={GRID}>
                {items.map((item, i) => (
                  <ListingCard key={item.id} item={item} imageWidth={260} priority={i < 5} />
                ))}
                {loadingMore ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={`s${i}`} />) : null}
              </div>
              <div ref={sentinel} aria-hidden className="h-px" />
              {!hasMore && items.length > PAGE_SIZE ? (
                <p className="mt-8 text-center text-sm text-gray-400">Vous avez vu toutes les annonces de {name}.</p>
              ) : null}
            </>
          )}
        </div>
      </div>

      {showTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Revenir en haut"
          className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#0b1020] text-white shadow-xl transition hover:bg-black animate-in fade-in zoom-in-90"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      ) : null}
    </PageShell>
  );
}
