'use client';

// Page annonce — même ambiance « nuit et braise » que l'accueil et même contenu que l'écran mobile
import { useState, use, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { ListingCard } from '@/components/home/ListingCard';
import { Rail, SectionHeader } from '@/components/home/Rail';
import { ItemGallery } from '@/components/item/ItemGallery';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Item } from '@/types/index';
import { getProductById, getProducts } from '@/lib/api/products';
import { createOrGetConversation } from '@/lib/api/messaging';
import { getProductReviews, getReviewStats, markReviewHelpful, checkReviewEligibility, createReview, type Review, type ReviewStats } from '@/lib/api/reviews';
import type { CardItem } from '@/lib/api/home';
import { useAuth } from '@/hooks/useAuth';
import { useQuickAuth } from '@/contexts/QuickAuthContext';
import {
  Star,
  MapPin,
  Clock,
  Share2,
  MessageCircle,
  ShieldCheck,
  Truck,
  Package,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  BadgeCheck,
  Facebook,
  Instagram,
  Globe,
  CalendarDays,
  MapPinned,
  Store,
  Loader2,
  ThumbsUp,
  Sparkles,
  Lock,
  ArrowLeft,
  Boxes,
  Pencil,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { ReportButton } from '@/components/ReportButton';
import { formatRelativeDate, cn } from '@/lib/utils';
import { formatPrice, hasPrice, getInitials, cityOf, formatCompact, sizedImage } from '@/lib/format';

const CONDITION_LABEL: Record<string, string> = { new: 'Neuf', used: 'Occasion', refurbished: 'Reconditionné' };
const RATING_LABEL = ['', 'Très déçu', 'Déçu', 'Correct', 'Bien', 'Excellent'];

// « 3j » (format de l'API) → « il y a 3 jours »
const postedAgo = (raw?: string) => {
  const m = String(raw || '').match(/^(\d+)\s*(m|h|j)$/);
  if (!m) return raw ? `il y a ${raw}` : 'récemment';
  const n = Number(m[1]);
  if (m[2] === 'm') return n < 2 ? "à l'instant" : `il y a ${n} min`;
  if (m[2] === 'h') return `il y a ${n} h`;
  if (n === 0) return "aujourd'hui";
  if (n === 1) return 'hier';
  if (n < 7) return `il y a ${n} jours`;
  if (n < 30) return `il y a ${Math.floor(n / 7)} sem.`;
  return `il y a ${Math.floor(n / 30)} mois`;
};

// ['lundi', …, 'samedi'] → « Lun – Sam » ; les 7 jours → « Tous les jours »
const WEEK = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const formatDays = (days?: string[]) => {
  if (!days?.length) return 'Sur rendez-vous';
  const idx = days.map((d) => WEEK.indexOf(d.toLowerCase().trim()));
  if (idx.some((i) => i < 0)) return days.join(', ');
  const sorted = [...new Set(idx)].sort((a, b) => a - b);
  if (sorted.length === 7) return 'Tous les jours';
  const short = (i: number) => WEEK[i].charAt(0).toUpperCase() + WEEK[i].slice(1, 3);
  const consecutive = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
  if (consecutive && sorted.length > 2) return `${short(sorted[0])} – ${short(sorted[sorted.length - 1])}`;
  return sorted.map(short).join(', ');
};

function Stars({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(className, i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200')} />
      ))}
    </span>
  );
}

function Tile({ icon, label, value, sub, tone = 'orange' }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: 'orange' | 'blue' | 'green' | 'gray' }) {
  const tones = {
    orange: 'bg-[#fff1e8] text-[#ec5a13]',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    gray: 'bg-gray-100 text-gray-500',
  };
  return (
    <div className="flex flex-col items-start gap-2.5 rounded-2xl border border-gray-100 bg-white p-3.5 sm:flex-row sm:gap-3">
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tones[tone])}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-gray-900 [overflow-wrap:anywhere] sm:text-[15px]">{value}</p>
        {sub ? <p className="mt-0.5 text-xs leading-snug text-gray-500">{sub}</p> : null}
      </div>
    </div>
  );
}

function Panel({ title, children, className, id }: { title?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] sm:p-6', className)}>
      {title ? <h2 className="mb-4 text-lg font-black tracking-tight text-gray-900">{title}</h2> : null}
      {children}
    </section>
  );
}

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

function DetailSkeleton() {
  return (
    <PageShell>
      <div className="bg-[linear-gradient(135deg,#060a14_0%,#10172b_60%,#2a1307_100%)] pb-40 pt-6">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="h-4 w-64 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
      <div className="container mx-auto -mt-36 max-w-7xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="aspect-[4/3] animate-pulse rounded-3xl bg-gray-300/70" />
          <div className="space-y-4 rounded-3xl bg-white p-6">
            <div className="h-5 w-24 animate-pulse rounded-full bg-gray-200" />
            <div className="h-8 w-4/5 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-10 w-1/2 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-12 animate-pulse rounded-2xl bg-gray-200" />
            <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user, token } = useAuth();
  const { openQuickAuth } = useQuickAuth();
  const reviewFormRef = useRef<HTMLDivElement>(null);

  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedItems, setRelatedItems] = useState<CardItem[]>([]);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [reviewEligible, setReviewEligible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [descOpen, setDescOpen] = useState(false);

  // Charger le produit depuis l'API
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getProductById(id);
        setItem(response.data);
      } catch (err: any) {
        console.error('❌ Erreur chargement produit:', err);
        setError(err.message || 'Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Vérifier l'éligibilité à laisser un avis (seulement si connecté)
  useEffect(() => {
    const checkEligibility = async () => {
      if (!item?.id || !user) {
        setReviewEligible(false);
        return;
      }

      try {
        const response = await checkReviewEligibility(String(item.id));
        setReviewEligible(response?.eligible || false);
      } catch (error) {
        console.error('❌ Erreur vérification éligibilité:', error);
        setReviewEligible(false);
      }
    };

    checkEligibility();
  }, [item?.id, user]);

  useEffect(() => {
    if (!reviewEligible) return;

    const shouldScroll = new URLSearchParams(window.location.search).get('scrollToReviewForm');
    if (!shouldScroll) return;

    const timer = window.setTimeout(() => {
      reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);

    return () => window.clearTimeout(timer);
  }, [reviewEligible]);

  // Charger les avis depuis l'API
  useEffect(() => {
    const fetchReviews = async () => {
      if (!item) return;

      setLoadingReviews(true);
      try {
        const [reviewsResponse, statsResponse] = await Promise.all([
          getProductReviews(String(item.id), 1, 10),
          getReviewStats(String(item.id))
        ]);

        setAllReviews(reviewsResponse.data);
        setReviewStats(statsResponse.data);
      } catch (err) {
        console.error('❌ Erreur chargement avis:', err);
        setAllReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [item]);

  // Annonces de la même catégorie (filtre par slug : le nom affiché ne correspond pas au filtre de l'API)
  const relatedKey = item ? `${item.id}|${item.categorySlug || item.categoryId || ''}|${item.type}` : '';
  useEffect(() => {
    if (!item) return;
    const category = item.categorySlug || item.categoryId;
    if (!category) {
      setRelatedItems([]);
      return;
    }
    let cancelled = false;
    getProducts({ category, type: item.type, limit: 13, status: 'active', view: 'card' })
      .then((response) => {
        if (cancelled) return;
        const filtered = (response.data as unknown as CardItem[]).filter((p) => String(p.id) !== String(item.id)).slice(0, 12);
        setRelatedItems(filtered);
      })
      .catch((err) => {
        console.error('❌ Erreur chargement produits similaires:', err);
        if (!cancelled) setRelatedItems([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedKey]);

  // Recharger les avis après soumission
  const handleReviewSubmitted = async () => {
    if (!item) return;

    try {
      const [reviewsResponse, statsResponse] = await Promise.all([
        getProductReviews(String(item.id), 1, 10),
        getReviewStats(String(item.id))
      ]);

      setAllReviews(reviewsResponse.data);
      setReviewStats(statsResponse.data);

      // Recharger aussi le produit pour mettre à jour le rating
      const productResponse = await getProductById(id);
      setItem(productResponse.data);
    } catch (err) {
      console.error('❌ Erreur rechargement avis:', err);
    }
  };

  // Marquer un avis comme utile
  const handleMarkHelpful = async (reviewId: string) => {
    if (!user || !token) {
      openQuickAuth(`/items/${id}`);
      return;
    }
    try {
      await markReviewHelpful(reviewId);
      const reviewsResponse = await getProductReviews(String(item!.id), 1, 10);
      setAllReviews(reviewsResponse.data);
    } catch (err) {
      console.error('❌ Erreur marquage avis utile:', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0 || submittingReview || !item) return;
    try {
      setSubmittingReview(true);
      setReviewError(null);
      await createReview({ productId: String(item.id), rating: reviewRating, comment: reviewComment.trim() });
      setReviewSuccess(true);
      setReviewRating(0);
      setReviewComment('');
      setReviewEligible(false);
      await handleReviewSubmitted();
    } catch (err: any) {
      setReviewError(err.message || 'Erreur lors de la publication');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  // Erreur ou produit non trouvé
  if (error || !item) {
    return (
      <PageShell>
        <div className="container mx-auto flex max-w-7xl justify-center px-4 py-20">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-[0_20px_50px_-30px_rgba(15,23,42,0.4)]">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ec5a13]">
              <AlertCircle className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-2xl font-black tracking-tight text-gray-900">
              {error ? 'Annonce indisponible' : 'Annonce introuvable'}
            </h1>
            <p className="mt-2 text-[15px] text-gray-500">
              {error ? "Nous n'avons pas pu charger cette annonce. Vérifiez votre connexion et réessayez." : "Elle a peut-être été vendue ou retirée par l'annonceur."}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button type="button" onClick={() => router.back()} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 px-5 text-sm font-bold text-gray-700 transition hover:border-gray-300">
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <Link href="/categories/tous" className="inline-flex h-11 items-center justify-center rounded-full bg-[#ec5a13] px-5 text-sm font-bold text-white transition hover:bg-[#d44f11]">
                Voir les annonces
              </Link>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  const isService = item.type === 'service';
  const reviews = allReviews;
  const seller = item.seller;
  const isOwnProduct = user?.id === seller.id;
  const isActive = item.status === 'active';
  const images = (item.images?.length ? item.images : [item.mainImage]).filter(Boolean);
  const priceLabel = formatPrice(item.price);
  const categoryHref = item.categorySlug ? `/categories/${item.categorySlug}` : '/categories-list';
  const accent = isService
    ? { text: 'text-blue-600', bg: 'bg-blue-600 hover:bg-blue-700', ring: 'shadow-[0_14px_30px_-12px_rgba(37,99,235,0.7)]', soft: 'bg-blue-50 text-blue-700' }
    : { text: 'text-[#ec5a13]', bg: 'bg-[#ec5a13] hover:bg-[#d44f11]', ring: 'shadow-[0_14px_30px_-12px_rgba(236,90,19,0.75)]', soft: 'bg-[#fff1e8] text-[#c2410c]' };
  const specs = Object.entries(item.specifications || {}).filter(([k, v]) => k && v);
  const description = item.description || '';
  const longDescription = description.length > 520;
  const showReviews = reviews.length > 0 || reviewEligible || loadingReviews || reviewSuccess;
  const contactDisabled = !isActive || creatingConversation || isOwnProduct;
  const statusNote = {
    sold: 'Cette annonce a été marquée comme vendue.',
    expired: "Cette annonce n'est plus disponible.",
    pending: 'Cette annonce est en attente de validation.',
  }[item.status as 'sold' | 'expired' | 'pending'];

  // Contact uniquement via la messagerie TakTak (le numéro reste privé)
  const handleContact = async () => {
    if (isOwnProduct || !isActive) return;
    if (!user || !token) {
      openQuickAuth(`/items/${id}`);
      return;
    }
    try {
      setCreatingConversation(true);
      const response = await createOrGetConversation({ sellerId: seller.id, productId: String(item.id) });
      router.push(`/messages/${response.data.id}`);
    } catch (err: any) {
      console.error('❌ Erreur création conversation:', err);
      toast.error(err.response?.data?.message || 'Impossible de créer la conversation. Veuillez réessayer.');
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href.split('?')[0];
    const data = { title: item.title, text: `${item.title} — ${priceLabel} sur TakTak`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié');
    } catch {
      // Partage annulé par l'utilisateur
    }
  };

  const contactLabel = isOwnProduct ? "C'est votre annonce" : !isActive ? 'Annonce indisponible' : isService ? 'Contacter le prestataire' : 'Contacter le vendeur';

  const ContactButton = ({ className, short }: { className?: string; short?: boolean }) => (
    <button
      type="button"
      onClick={handleContact}
      disabled={contactDisabled}
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-bold text-white transition active:scale-[0.98]',
        accent.bg,
        accent.ring,
        'disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none disabled:active:scale-100',
        className
      )}
    >
      {creatingConversation ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
      {short && !contactDisabled ? 'Envoyer un message' : contactLabel}
    </button>
  );

  // Tuiles d'information (mêmes rubriques que l'app mobile)
  const tiles: React.ReactNode[] = [];
  tiles.push(
    <Tile
      key="cat"
      tone={isService ? 'blue' : 'orange'}
      icon={<CategoryIcon item={{ slug: item.categorySlug }} size={24} />}
      label="Catégorie"
      value={<Link href={categoryHref} className="hover:underline">{item.category}</Link>}
      sub={item.subcategory}
    />
  );
  if (!isService && item.condition) {
    tiles.push(<Tile key="cond" tone={item.condition === 'new' ? 'green' : 'gray'} icon={<Sparkles className="h-5 w-5" />} label="État" value={CONDITION_LABEL[item.condition] || item.condition} />);
  }
  if (!isService && item.quantity) {
    tiles.push(<Tile key="qty" tone="gray" icon={<Boxes className="h-5 w-5" />} label="Quantité" value={item.quantity} />);
  }
  if (!isService && item.delivery) {
    tiles.push(
      <Tile
        key="deliv"
        tone={item.delivery.available ? 'green' : 'gray'}
        icon={<Truck className="h-5 w-5" />}
        label="Livraison"
        value={item.delivery.available ? (item.delivery.cost ? `Oui · ${item.delivery.cost}` : 'Disponible') : 'Retrait sur place'}
        sub={item.delivery.available && item.delivery.areas?.length ? item.delivery.areas.join(', ') : undefined}
      />
    );
  }
  if (isService && item.availability && (item.availability.days?.length || item.availability.openingTime)) {
    const hours = item.availability.openingTime && item.availability.closingTime
      ? `${item.availability.openingTime} – ${item.availability.closingTime}`
      : item.availability.openingTime || item.availability.closingTime;
    tiles.push(
      <Tile key="avail" tone="blue" icon={<CalendarDays className="h-5 w-5" />} label="Disponibilité" value={formatDays(item.availability.days)} sub={hours || undefined} />
    );
  }
  if (isService && item.serviceArea?.length) {
    tiles.push(<Tile key="area" tone="blue" icon={<MapPinned className="h-5 w-5" />} label="Zone d'intervention" value={item.serviceArea.join(', ')} />);
  }
  tiles.push(<Tile key="loc" tone="gray" icon={<MapPin className="h-5 w-5" />} label="Localisation" value={cityOf(item.location)} sub={item.location !== cityOf(item.location) ? item.location : undefined} />);
  tiles.push(<Tile key="date" tone="gray" icon={<Clock className="h-5 w-5" />} label="Publiée" value={postedAgo(item.postedTime)} sub={`${formatCompact(item.views)} vue${item.views > 1 ? 's' : ''}`} />);

  return (
    <PageShell>
      {/* Bandeau sombre : fil d'Ariane, la galerie et le résumé le chevauchent */}
      <div className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#060a14_0%,#10172b_60%,#2a1307_100%)] pb-40 pt-5 sm:pt-6">
        <div
          className={cn(
            'pointer-events-none absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full',
            isService ? 'bg-[radial-gradient(closest-side,rgba(37,99,235,0.35),transparent)]' : 'bg-[radial-gradient(closest-side,rgba(236,90,19,0.35),transparent)]'
          )}
        />
        <div className="container mx-auto max-w-7xl px-4">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 overflow-hidden text-[13px] text-white/55">
            <button type="button" onClick={() => router.back()} aria-label="Retour" className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Link href="/" className="shrink-0 transition hover:text-white">Accueil</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <Link href={`/categories/tous?type=${item.type}`} className="shrink-0 transition hover:text-white">{isService ? 'Services' : 'Produits'}</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <Link href={categoryHref} className="truncate transition hover:text-white">{item.category}</Link>
            {item.subcategory ? (
              <>
                <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 opacity-60 sm:block" />
                <span className="hidden truncate text-white/80 sm:inline">{item.subcategory}</span>
              </>
            ) : null}
          </nav>
        </div>
      </div>

      <div className="container mx-auto -mt-36 max-w-7xl px-4 pb-28 lg:pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          {/* Galerie */}
          <div className="min-w-0">
            <ItemGallery
              images={images}
              title={item.title}
              overlay={
                <>
                  <div className="flex flex-wrap gap-1.5">
                    <span className={cn('rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm', isService ? 'bg-blue-600' : 'bg-[#ec5a13]')}>
                      {isService ? 'Service' : 'Produit'}
                    </span>
                    {item.promoted || item.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5" /> À la une
                      </span>
                    ) : null}
                  </div>
                  <span className="pointer-events-auto">
                    <FavoriteButton productId={String(item.id)} size="md" />
                  </span>
                </>
              }
            />
          </div>

          {/* Résumé + vendeur (colonne collante sur ordinateur) */}
          <aside className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] sm:p-6">
                {statusNote ? (
                  <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {statusNote}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-1.5">
                  {!isService && item.condition ? (
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', item.condition === 'new' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
                      {CONDITION_LABEL[item.condition] || item.condition}
                    </span>
                  ) : null}
                  {item.subcategory ? <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', accent.soft)}>{item.subcategory}</span> : null}
                </div>

                <h1 className="mt-3 text-[22px] font-black leading-tight tracking-tight text-gray-900 [overflow-wrap:anywhere] sm:text-[26px]">{item.title}</h1>

                <p className={cn('mt-3 text-3xl font-black tracking-tight', hasPrice(item.price) ? 'text-gray-900' : priceLabel === 'Gratuit' ? 'text-emerald-600' : 'text-gray-500')}>
                  {priceLabel}
                </p>

                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-gray-500">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{cityOf(item.location)}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{postedAgo(item.postedTime)}</span>
                  <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{formatCompact(item.views)}</span>
                </p>

                <div className="mt-5 hidden gap-2 lg:flex">
                  <ContactButton className="flex-1" />
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Partager l'annonce"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-2 lg:hidden">
                  <button type="button" onClick={handleShare} className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 px-4 text-sm font-semibold text-gray-700">
                    <Share2 className="h-4 w-4" /> Partager
                  </button>
                </div>

                {isOwnProduct ? (
                  <Link href="/mes-annonces" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#ec5a13] hover:underline">
                    <Pencil className="h-4 w-4" /> Gérer mes annonces
                  </Link>
                ) : (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                    <Lock className="h-3.5 w-3.5 text-emerald-600" />
                    Messagerie sécurisée : votre numéro reste privé.
                  </p>
                )}

                {/* Annonceur */}
                <div className="mt-5 border-t border-dashed border-gray-200 pt-5">
                  <Link href={`/seller/${seller.id}`} className="group flex items-center gap-3">
                    <span className="relative shrink-0">
                      {seller.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sizedImage(seller.avatar, 96)} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                      ) : (
                        <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black', accent.soft)}>{getInitials(seller.name)}</span>
                      )}
                      {seller.verified ? (
                        <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white fill-blue-500 text-white" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-gray-900 group-hover:underline">{seller.name}</span>
                      <span className="block text-xs text-gray-500">
                        {seller.verified ? 'Vérifié · ' : ''}Membre depuis {seller.memberSince}
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500" />
                  </Link>

                  <div className="mt-4 grid grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-gray-50 py-3 text-center">
                    <div>
                      <p className="text-base font-black text-gray-900">{seller.totalListings ?? 0}</p>
                      <p className="text-[11px] text-gray-500">annonce{(seller.totalListings ?? 0) > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="flex items-center justify-center gap-1 text-base font-black text-gray-900">
                        {seller.totalReviews > 0 ? (
                          <><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{Number(seller.rating).toFixed(1)}</>
                        ) : '—'}
                      </p>
                      <p className="text-[11px] text-gray-500">{seller.totalReviews > 0 ? `${seller.totalReviews} avis` : 'pas d’avis'}</p>
                    </div>
                    <div>
                      <p className="truncate px-1 text-base font-black text-gray-900">{seller.responseTime || '—'}</p>
                      <p className="text-[11px] text-gray-500">réponse</p>
                    </div>
                  </div>

                  {seller.bio ? <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-gray-600">{seller.bio}</p> : null}

                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href={`/seller/${seller.id}`}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 text-sm font-bold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      <Store className="h-4 w-4" /> Voir la boutique
                    </Link>
                    {seller.contactInfo?.facebook ? (
                      <a href={seller.contactInfo.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:text-[#1877f2]">
                        <Facebook className="h-4 w-4" />
                      </a>
                    ) : null}
                    {seller.contactInfo?.instagram ? (
                      <a href={seller.contactInfo.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:text-[#d62976]">
                        <Instagram className="h-4 w-4" />
                      </a>
                    ) : null}
                    {seller.contactInfo?.website ? (
                      <a href={seller.contactInfo.website} target="_blank" rel="noopener noreferrer" aria-label="Site web" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:text-gray-900">
                        <Globe className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Sécurité */}
              <div className="rounded-3xl border border-emerald-100 bg-[linear-gradient(160deg,#f0fdf6,#ffffff)] p-5">
                <p className="flex items-center gap-2 text-sm font-black text-emerald-900">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" /> Achetez en toute sérénité
                </p>
                <ul className="mt-3 space-y-2 text-[13px] leading-snug text-emerald-950/75">
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />Ne payez jamais à l&apos;avance.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />Rencontrez-vous dans un lieu public et vérifiez {isService ? 'la prestation' : "l'article"}.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />Échangez via la messagerie TakTak.</li>
                </ul>
              </div>

              {!isOwnProduct && (
                <div className="flex justify-center">
                  <ReportButton
                    productId={String(id)}
                    isAuthenticated={Boolean(user && token)}
                    onRequireAuth={() => openQuickAuth(`/items/${id}`)}
                  />
                </div>
              )}
            </div>
          </aside>

          {/* Détails */}
          <div className="min-w-0 space-y-6 lg:col-start-1">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-3">{tiles}</div>

            {description ? (
              <Panel title="Description">
                <div className={cn('relative', longDescription && !descOpen && 'max-h-60 overflow-hidden')}>
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-gray-700 [overflow-wrap:anywhere]">{description}</p>
                  {longDescription && !descOpen ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" /> : null}
                </div>
                {longDescription ? (
                  <button type="button" onClick={() => setDescOpen((v) => !v)} className={cn('mt-3 text-sm font-bold hover:underline', accent.text)}>
                    {descOpen ? 'Réduire' : 'Lire la suite'}
                  </button>
                ) : null}
              </Panel>
            ) : null}

            {specs.length ? (
              <Panel title={isService ? 'Détails de la prestation' : 'Caractéristiques'}>
                <dl className="grid gap-x-8 sm:grid-cols-2">
                  {specs.map(([key, value]) => (
                    <div key={key} className="flex items-baseline justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                      <dt className="text-sm text-gray-500">{key}</dt>
                      <dd className="text-right text-sm font-semibold text-gray-900 [overflow-wrap:anywhere]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            ) : null}

            {/* ── Avis ── */}
            {showReviews ? (
              <div ref={reviewFormRef} className="scroll-mt-24">
                <Panel
                  title={
                    <span className="flex items-center gap-2">
                      Avis
                      {item.totalReviews > 0 ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">{item.totalReviews}</span> : null}
                    </span>
                  }
                >
                  {reviews.length > 0 && reviewStats ? (
                    <div className="mb-6 flex flex-col gap-5 rounded-2xl bg-[#fafafa] p-5 sm:flex-row sm:items-center">
                      <div className="flex shrink-0 flex-col items-center sm:w-28">
                        <span className="text-5xl font-black leading-none text-gray-900">{Number(item.rating).toFixed(1)}</span>
                        <Stars value={Number(item.rating)} className="mt-2 h-4 w-4" />
                        <p className="mt-1 text-xs text-gray-500">{item.totalReviews} avis</p>
                      </div>
                      <div className="w-full flex-1 space-y-1.5">
                        {([5, 4, 3, 2, 1] as const).map((star) => {
                          const count = reviewStats.ratingDistribution[star] ?? 0;
                          const pct = item.totalReviews > 0 ? Math.round((count / item.totalReviews) * 100) : 0;
                          return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="w-3 text-right font-semibold text-gray-600">{star}</span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                                <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-9 text-right tabular-nums text-gray-500">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {reviewEligible && !reviewSuccess ? (
                    <form onSubmit={handleSubmitReview} className="mb-6 rounded-2xl border border-[#ec5a13]/20 bg-[linear-gradient(160deg,#fff7f2,#ffffff)] p-5">
                      <p className="text-sm font-black text-gray-900">Vous avez échangé avec {seller.name} ?</p>
                      <p className="text-xs text-gray-500">Votre avis aide toute la communauté.</p>
                      <div className="mt-4 flex items-center gap-1" onMouseLeave={() => setReviewHover(0)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setReviewHover(star)}
                            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                            className="rounded-lg p-0.5 transition hover:scale-110 active:scale-95"
                          >
                            <Star className={cn('h-8 w-8', star <= (reviewHover || reviewRating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200')} />
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-bold text-amber-600">{RATING_LABEL[reviewHover || reviewRating]}</span>
                      </div>
                      <Textarea
                        placeholder="Racontez votre expérience (facultatif)"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value.slice(0, 500))}
                        className="mt-4 min-h-[88px] resize-none rounded-xl border-gray-200 bg-white text-sm"
                        rows={3}
                      />
                      <div className="mt-1 text-right text-xs text-gray-400">{reviewComment.length}/500</div>
                      {reviewError ? (
                        <p className="mt-2 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
                          <AlertCircle className="h-4 w-4 shrink-0" /> {reviewError}
                        </p>
                      ) : null}
                      <button
                        type="submit"
                        disabled={reviewRating === 0 || submittingReview}
                        className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#ec5a13] px-6 text-sm font-bold text-white transition hover:bg-[#d44f11] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {submittingReview ? <><Loader2 className="h-4 w-4 animate-spin" />Publication…</> : 'Publier mon avis'}
                      </button>
                    </form>
                  ) : null}

                  {reviewSuccess ? (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-sm font-bold text-emerald-900">Merci pour votre avis !</p>
                        <p className="text-xs text-emerald-700">Il est maintenant visible par les autres membres.</p>
                      </div>
                    </div>
                  ) : null}

                  {loadingReviews ? (
                    <div className="space-y-4">
                      {[0, 1].map((i) => (
                        <div key={i} className="flex gap-3">
                          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-32 animate-pulse rounded-full bg-gray-200" />
                            <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {reviews.map((review) => (
                        <li key={review.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                          {review.userAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={sizedImage(review.userAvatar, 96)} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-xs font-black text-[#ec5a13]">
                              {getInitials(review.userName)}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                              <p className="text-sm font-bold text-gray-900">{review.userName}</p>
                              <span className="text-xs text-gray-400">{formatRelativeDate(review.date)}</span>
                            </div>
                            <Stars value={review.rating} className="mt-1 h-3.5 w-3.5" />
                            {review.comment ? <p className="mt-2 text-sm leading-relaxed text-gray-700 [overflow-wrap:anywhere]">{review.comment}</p> : null}
                            <button
                              type="button"
                              onClick={() => handleMarkHelpful(review.id)}
                              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 -ml-2 text-xs font-semibold text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                              {review.helpful > 0 ? `Utile · ${review.helpful}` : 'Utile'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : !reviewEligible && !reviewSuccess ? (
                    <p className="py-6 text-center text-sm text-gray-500">Aucun avis pour le moment.</p>
                  ) : null}
                </Panel>
              </div>
            ) : null}
          </div>
        </div>

        {/* Annonces de la même catégorie */}
        {relatedItems.length > 0 ? (
          <section className="mt-14">
            <SectionHeader
              title={`Plus de ${item.category}`}
              subtitle={isService ? 'Autres prestataires dans cette catégorie' : 'Autres annonces qui pourraient vous plaire'}
              href={`${categoryHref}${item.categorySlug ? `?type=${item.type}` : ''}`}
              accent={isService ? 'blue' : 'orange'}
            />
            <Rail label="Annonces similaires" itemClassName="w-[172px] sm:w-[200px] lg:w-[228px]">
              {relatedItems.map((p) => (
                <ListingCard key={p.id} item={p} imageWidth={228} />
              ))}
            </Rail>
          </section>
        ) : null}
      </div>

      {/* Barre d'action fixe (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-gray-500">{item.title}</p>
            <p className={cn('truncate text-lg font-black', priceLabel === 'Gratuit' ? 'text-emerald-600' : 'text-gray-900')}>{priceLabel}</p>
          </div>
          <ContactButton short className="shrink-0 px-4 text-sm" />
        </div>
      </div>
    </PageShell>
  );
}
