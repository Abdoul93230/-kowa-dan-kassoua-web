'use client';

import { useState, use, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '../../../components/home/Header';
import { Footer } from '../../../components/home/Footer';
import { SimilarItemsCarousel } from '../../../components/home/SimilarItemsCarousel';
import { Item } from '@/types/index';
import { getProductById, getProducts } from '@/lib/api/products';
import { createOrGetConversation } from '@/lib/api/messaging';
import { getProductReviews, getReviewStats, markReviewHelpful, checkReviewEligibility, createReview, type Review, type ReviewStats } from '@/lib/api/reviews';
import { useAuth } from '@/hooks/useAuth';
import { useQuickAuth } from '@/contexts/QuickAuthContext';
import {
  Star,
  MapPin,
  Clock,
  Heart,
  Share2,
  MessageCircle,
  Mail,
  Shield,
  TruckIcon,
  Package,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  BadgeCheck,
  Facebook,
  Instagram,
  Globe,
  User,
  Award,
  Tag,
  Info,
  CalendarDays,
  MapPinned,
  Store,
  Loader2,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { formatRelativeDate, formatPriceFCFA } from '@/lib/utils';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user, token } = useAuth();
  const { openQuickAuth } = useQuickAuth();
  const reviewFormRef = useRef<HTMLDivElement>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [reviewEligible, setReviewEligible] = useState(false);
  const [checkingReviewEligibility, setCheckingReviewEligibility] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

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

  // Vérifier l'éligibilité à laisser un avis
  useEffect(() => {
    const checkEligibility = async () => {
      if (!item?.id) {
        setReviewEligible(false);
        return;
      }

      try {
        setCheckingReviewEligibility(true);
        const response = await checkReviewEligibility(String(item.id));
        setReviewEligible(response?.eligible || false);
      } catch (error) {
        console.error('❌ Erreur vérification éligibilité:', error);
        setReviewEligible(false);
      } finally {
        setCheckingReviewEligibility(false);
      }
    };

    checkEligibility();
  }, [item?.id]);

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

  // Charger les produits similaires depuis l'API
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!item) return;

      try {
        const response = await getProducts({
          category: item.category,
          limit: 5, // Récupérer 5 pour exclure le produit actuel
          status: 'active',
        });
        
        // Filtrer pour exclure le produit actuel et garder 4 items
        const filtered = response.data.filter(p => p.id !== item.id).slice(0, 4);
        setRelatedItems(filtered);
      } catch (err) {
        console.error('❌ Erreur chargement produits similaires:', err);
        setRelatedItems([]);
      }
    };

    fetchRelatedProducts();
  }, [item]);

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
    try {
      await markReviewHelpful(reviewId);
      // Recharger les avis pour voir le compteur mis à jour
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
          <Header />
        </Suspense>
        <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
          <Card className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-[#ec5a13] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement des détails...</p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Error ou produit non trouvé
  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
          <Header />
        </Suspense>
        <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
          <div className="bg-white p-12 rounded-lg shadow-sm max-w-md mx-auto border-red-200">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error ? 'Erreur de chargement' : 'Article non trouvé'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "Cet article n'existe pas ou a été supprimé."}
            </p>
            <Button 
              onClick={() => router.back()}
              className="bg-[#ec5a13] hover:bg-[#d94f0f]"
            >
              Retour
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isService = item.type === 'service';
  const reviews = allReviews;
  const seller = item.seller;
  const isOwnProduct = user?.id === seller.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <Header />
      </Suspense>

      {/* Bandeau type produit/service */}
      <div className={`border-b-4 ${isService ? 'border-blue-600 bg-blue-100' : 'border-[#ec5a13] bg-[#ffe9de]'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isService ? (
                <>
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <span className="text-2xl">🛠️</span>
                  </div>
                  <span className="text-xl font-bold text-blue-900">SERVICE PROFESSIONNEL</span>
                </>
              ) : (
                <>
                  <div className="bg-[#ec5a13] p-2 rounded-lg">
                    <span className="text-2xl">📦</span>
                  </div>
                  <span className="text-xl font-bold text-[#ec5a13]">PRODUIT À VENDRE</span>
                </>
              )}
            </div>
            {item.promoted && (
              <Badge className="bg-amber-500 text-white text-sm px-4 py-2">
                ⭐ EN VEDETTE
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Bandeau d'alerte si produit désactivé */}
      {item.status !== 'active' && (
        <div className="bg-amber-50 border-b-2 border-amber-400">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">
                  {item.status === 'sold' && 'Cette annonce a été marquée comme vendue'}
                  {item.status === 'expired' && 'Cette annonce n\'est plus disponible'}
                  {item.status === 'pending' && 'Cette annonce est en attente de validation'}
                </p>
                <p className="text-sm text-amber-700">
                  Vous pouvez encore consulter les détails, mais vous ne pourrez pas la contacter.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bandeau d'alerte si c'est votre propre produit */}
      {/* {isOwnProduct && (
        <div className="bg-blue-50 border-b-2 border-blue-400">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">
                  Ceci est votre propre annonce
                </p>
                <p className="text-sm text-blue-700">
                  Vous ne pouvez pas vous envoyer de message à vous-même. Pour gérer cette annonce, allez dans "Mes annonces".
                </p>
              </div>
            </div>
          </div>
        </div>
      )} */}

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-[#ec5a13] transition-colors">
            Accueil
          </button>
          <ChevronRight className="h-4 w-4" />
          <button onClick={() => router.push('/categories-list')} className="hover:text-[#ec5a13] transition-colors">
            Catégories
          </button>
          <ChevronRight className="h-4 w-4" />
          <button 
            onClick={() => router.push(`/categories/${item.category.toLowerCase()}`)} 
            className="hover:text-[#ec5a13] transition-colors"
          >
            {item.category}
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium truncate">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galerie d'images */}
            <Card className="overflow-hidden border-gray-200 shadow-sm">
              <div className="relative bg-gray-100 group">
                <img
                  src={item.images[selectedImage]}
                  alt={item.title}
                  className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] object-contain"
                />
                
                {/* Boutons de navigation carousel */}
                {item.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage === 0 ? item.images.length - 1 : selectedImage - 1)}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 rotate-180 text-gray-900" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(selectedImage === item.images.length - 1 ? 0 : selectedImage + 1)}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
                    </button>
                  </>
                )}
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <FavoriteButton productId={String(item.id)} size="md" />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-4 flex gap-2 overflow-x-auto bg-white">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-[#ec5a13]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`${item.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Titre et infos principales */}
            <Card className="p-3 sm:p-4 md:p-6 border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex-1">{item.title}</h1>
                    <p className="text-lg sm:text-xl font-bold text-[#ec5a13] whitespace-nowrap flex-shrink-0">{formatPriceFCFA(item.price)}</p>
                  </div>
                  {isService && <p className="text-xs text-gray-500 mb-3">Tarif indicatif</p>}
                  
                  {/* Condition du produit - Info primordiale */}
                  {!isService && item.condition && (
                    <div className="mb-3">
                      <div 
                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-sm sm:text-base ${
                          item.condition === 'new' 
                            ? 'bg-green-100 text-green-800 border-2 border-green-500' 
                            : 'bg-amber-100 text-amber-800 border-2 border-amber-500'
                        }`}
                      >
                        <span className="text-base sm:text-xl">{item.condition === 'new' ? '🆕' : '📦'}</span>
                        <span>{item.condition === 'new' ? 'État : NEUF' : 'État : OCCASION'}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
                    <Badge 
                      variant="outline" 
                      className="border-[#ec5a13] text-[#ec5a13] text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
                    >
                      {item.category}
                    </Badge>
                    {item.subcategory && (
                      <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1">
                        {item.subcategory}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{item.views.toLocaleString()} vues</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="whitespace-nowrap">Il y a {item.postedTime}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              <Separator className="my-3 sm:my-4" />

              {/* Actions rapides */}
              <div className="w-full">
                {/* <Button 
                  className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => window.open(`tel:${seller.contactInfo.phone}`)}
                  disabled={item.status !== 'active' || isOwnProduct}
                  title={isOwnProduct ? "Vous ne pouvez pas appeler votre propre annonce" : ""}
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Appeler</span>
                  <span className="sm:hidden">Appel</span>
                </Button> */}
                <Button 
                  variant="outline" 
                  className="w-full border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de] py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    if (isOwnProduct) {
                      alert('Vous ne pouvez pas vous envoyer de message à vous-même.');
                      return;
                    }
                    
                    if (!user || !token) {
                      // Ancien : router.push('/login');
                      openQuickAuth(`/items/${id}`);
                      return;
                    }

                    try {
                      setCreatingConversation(true);
                      // Créer ou récupérer la conversation via l'API
                      const response = await createOrGetConversation({
                        sellerId: seller.id,
                        productId: String(item.id)
                      });
                      router.push(`/messages/${response.data.id}`);
                    } catch (err: any) {
                      console.error('❌ Erreur création conversation:', err);
                      const errorMessage = err.response?.data?.message || 'Impossible de créer la conversation. Veuillez réessayer.';
                      alert(errorMessage);
                    } finally {
                      setCreatingConversation(false);
                    }
                  }}
                  disabled={item.status !== 'active' || creatingConversation || isOwnProduct}
                  title={isOwnProduct ? "Vous ne pouvez pas contacter votre propre annonce" : ""}
                >
                  {creatingConversation ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  )}
                  <span>Message</span>
                </Button>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-3 sm:p-4 md:p-6 border-gray-200 shadow-sm">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 sm:h-6 sm:w-6 text-[#ec5a13]" />
                Description
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>
            </Card>

            {/* Spécifications produit OU Détails service */}
            {isService ? (
              <Card className="p-3 sm:p-4 md:p-6 lg:p-8 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-lg">
                <div className="bg-blue-100 border-b-4 border-blue-600 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 -mt-3 sm:-mt-4 md:-mt-6 lg:-mt-8 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-blue-900">
                    <div className="bg-blue-600 p-1.5 sm:p-2 rounded">
                      <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                    </div>
                    <span className="text-sm sm:text-base md:text-xl lg:text-2xl">Détails du service professionnel</span>
                  </h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {/* {item.duration && (
                    <div className="flex items-start gap-2 sm:gap-3 md:gap-4 bg-white p-3 sm:p-4 rounded-lg border border-blue-200">
                      <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                        <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-gray-900">Durée</p>
                        <p className="text-sm sm:text-base text-gray-700">{item.duration}</p>
                      </div>
                    </div>
                  )} */}
                  {item.availability && (
                    <div className="flex items-start gap-4 bg-white p-4 rounded-lg border border-blue-200">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Disponibilité</p>
                        <p className="text-gray-700">{item.availability.days.join(', ')}</p>
                        {(item.availability.openingTime || item.availability.closingTime) && (
                          <p className="text-gray-600 text-sm">
                            {item.availability.openingTime && item.availability.closingTime
                              ? `${item.availability.openingTime} - ${item.availability.closingTime}`
                              : item.availability.openingTime || item.availability.closingTime}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {item.serviceArea && (
                    <div className="flex items-start gap-4 bg-white p-4 rounded-lg border border-blue-200">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <MapPinned className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Zone d'intervention</p>
                        <p className="text-gray-700">{item.serviceArea.join(', ')}</p>
                      </div>
                    </div>
                  )}
                  {item.specifications && Object.keys(item.specifications).length > 0 && (
                    <div className="border-t-2 border-blue-300 pt-6 mt-4">
                      <p className="font-bold text-blue-900 mb-4 text-lg">Détails supplémentaires</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(item.specifications).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-blue-200">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            <span className="text-gray-700"><strong>{key}:</strong> {value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-3 sm:p-4 md:p-6 border-[#ec5a13]/30 bg-[#ffe9de]/30 shadow-sm">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 sm:gap-3">
                  <div className="bg-[#ec5a13] p-1.5 sm:p-2 rounded-lg">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  Caractéristiques du produit
                </h2>
                
                {/* Tableau pour les 4 caractéristiques principales */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      {item.quantity && (
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium text-gray-900 w-1/2">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ec5a13] flex-shrink-0" />
                              <span>Quantité disponible</span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm text-gray-700 w-1/2">{item.quantity}</td>
                        </tr>
                      )}
                      {item.delivery && (
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 w-1/2">
                            <div className="flex items-center gap-2">
                              <TruckIcon className="h-4 w-4 text-[#ec5a13]" />
                              Livraison
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 w-1/2">
                            <div>
                              <p>{item.delivery.available ? `Disponible - ${item.delivery.cost}` : 'Non disponible'}</p>
                              {item.delivery.available && (
                                <>
                                  <p className="text-xs text-gray-600 mt-1">Zones: {item.delivery.areas.join(', ')}</p>
                                  {/* <p className="text-xs text-gray-600">Délai: {item.delivery.estimatedTime}</p> */}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Spécifications techniques */}
                {item.specifications && Object.keys(item.specifications).length > 0 && (
                  <div className="border-t border-[#ec5a13]/30 pt-4 mt-4">
                    <p className="font-semibold text-gray-900 mb-3">Spécifications techniques</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(item.specifications).map(([key, value]) => (
                        <div key={key} className="bg-white p-3 rounded-lg border border-[#ec5a13]/20">
                          <p className="text-sm text-gray-600">{key}</p>
                          <p className="font-medium text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}



            {/* ── Section Avis ───────────────────────────── */}
            <Card className="border-gray-200 shadow-sm overflow-hidden" ref={reviewFormRef}>

              {/* En-tête */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  Avis clients
                </h2>
              </div>

              <div className="p-6 space-y-8">

                {/* ── Bloc résumé + distribution ── */}
                {reviews.length > 0 && reviewStats && (
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-5 rounded-2xl bg-amber-50 border border-amber-100">
                    {/* Score global */}
                    <div className="flex flex-col items-center min-w-[96px]">
                      <span className="text-5xl font-extrabold text-gray-900 leading-none">
                        {Number(item.rating).toFixed(1)}
                      </span>
                      <div className="flex items-center gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i <= Math.round(item.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.totalReviews} avis</p>
                    </div>

                    {/* Barres de distribution */}
                    <div className="flex-1 w-full space-y-1.5">
                      {([5, 4, 3, 2, 1] as const).map((star) => {
                        const count = reviewStats.ratingDistribution[star] ?? 0;
                        const pct = item.totalReviews > 0 ? Math.round((count / item.totalReviews) * 100) : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-gray-600 text-right font-medium">{star}</span>
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-gray-500 text-right">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Formulaire avis ── */}
                {reviewEligible && !reviewSuccess && (
                  <div className="rounded-2xl border border-orange-200 overflow-hidden shadow-sm">
                    {/* Header produit */}
                    <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                      <img
                        src={item.mainImage || item.images?.[0]}
                        alt={item.title}
                        className="w-11 h-11 object-cover rounded-xl flex-shrink-0 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#ec5a13] font-bold uppercase tracking-widest mb-0.5">Votre avis sur</p>
                        <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{item.title}</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitReview} className="px-5 py-5 space-y-5 bg-white">
                      {/* Étoiles */}
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Quelle note donnez-vous ?</p>
                        <div className="flex justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setReviewHover(star)}
                              onMouseLeave={() => setReviewHover(0)}
                              className="text-[42px] transition-all duration-100 hover:scale-110 active:scale-95 leading-none focus:outline-none"
                              style={{ color: star <= (reviewHover || reviewRating) ? '#f59e0b' : '#e5e7eb' }}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <div className="h-5">
                          {reviewRating > 0 && (
                            <p className="text-sm font-semibold text-amber-500">
                              {['', 'Très déçu 😞', 'Déçu 😕', 'Correct 😐', 'Bien 😊', 'Excellent ! 🤩'][reviewRating]}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Commentaire */}
                      <div>
                        <Textarea
                          placeholder="Décrivez votre expérience (facultatif)"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value.slice(0, 500))}
                          className="resize-none text-sm min-h-[88px] border-gray-200 focus:border-[#ec5a13] focus:ring-[#ec5a13]"
                          rows={3}
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">{reviewComment.length}/500</p>
                      </div>

                      {reviewError && (
                        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          {reviewError}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={reviewRating === 0 || submittingReview}
                        className="w-full bg-[#ec5a13] hover:bg-[#d94f0f] text-white disabled:opacity-40 h-11 font-semibold rounded-xl shadow-sm"
                      >
                        {submittingReview
                          ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Publication…</>
                          : 'Publier mon avis'}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Succès */}
                {reviewSuccess && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800 text-sm">Merci pour votre avis !</p>
                      <p className="text-xs text-green-600">Il sera visible par les autres acheteurs.</p>
                    </div>
                  </div>
                )}

                {/* ── Chargement ── */}
                {loadingReviews && (
                  <div className="flex items-center justify-center gap-3 py-10 text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin text-[#ec5a13]" />
                    <span className="text-sm">Chargement des avis…</span>
                  </div>
                )}

                {/* ── Liste des avis ── */}
                {!loadingReviews && reviews.length > 0 && (
                  <div className="space-y-0 divide-y divide-gray-100">
                    {reviews.map((review) => (
                      <div key={review.id} className="py-5 first:pt-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-9 w-9 flex-shrink-0 border border-gray-100 shadow-sm">
                            <AvatarImage src={review.userAvatar || undefined} />
                            <AvatarFallback className="bg-orange-100 text-[#ec5a13] text-xs font-bold">
                              {review.userName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <p className="font-semibold text-sm text-gray-900">{review.userName}</p>
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-gray-700 leading-relaxed mb-2">{review.comment}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-400">{formatRelativeDate(review.date)}</p>
                              <button
                                onClick={() => handleMarkHelpful(review.id)}
                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#ec5a13] transition-colors"
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                                <span>{review.helpful > 0 ? `Utile (${review.helpful})` : 'Utile'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Aucun avis ── */}
                {!loadingReviews && reviews.length === 0 && !reviewEligible && (
                  <div className="text-center py-10">
                    <Star className="h-10 w-10 text-gray-200 fill-gray-200 mx-auto mb-3" />
                    <p className="font-semibold text-gray-500 mb-1">Aucun avis pour le moment</p>
                    <p className="text-sm text-gray-400">Soyez le premier à partager votre expérience</p>
                  </div>
                )}

              </div>
            </Card>
          </div>

          {/* Sidebar vendeur */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="p-0 border-2 border-gray-200 shadow-lg overflow-hidden">
                {/* Header vendeur avec fond coloré */}
                <div className={`${isService ? 'bg-blue-100 border-b-4 border-blue-600' : 'bg-[#ffe9de] border-b-4 border-[#ec5a13]'} p-4 sm:p-5 md:p-6 text-center`}>
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 sm:mb-3 border-3 sm:border-4 border-gray-300 shadow-lg">
                    <AvatarImage src={seller.avatar} />
                    <AvatarFallback className="bg-white text-gray-900 text-2xl sm:text-3xl font-bold">
                      {seller.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isService ? 'text-blue-900' : 'text-[#ec5a13]'}`}>{seller.name}</h3>
                  {seller.verified && (
                    <Badge className={`${isService ? 'bg-blue-200 text-blue-900 border-blue-400' : 'bg-orange-200 text-[#ec5a13] border-orange-400'} border text-xs sm:text-sm`}>
                      <BadgeCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                      Vendeur Vérifié
                    </Badge>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-lg sm:text-xl font-bold text-gray-900">{Number(item.rating).toFixed(1)}</span>
                    <span className="text-gray-600 text-xs sm:text-sm">({item.totalReviews} avis)</span>
                  </div>
                </div>
                
                {/* Corps de la carte */}
                <div className="p-3 sm:p-4 md:p-6">

                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Membre depuis</span>
                    <span className="font-semibold text-gray-900">{seller.memberSince}</span>
                  </div>
                  {/* <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Taux de réponse</span>
                    <span className="font-semibold text-gray-900">{seller.responseRate}%</span>
                  </div> */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Temps de réponse</span>
                    <span className="font-semibold text-gray-900">{seller.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Annonces actives</span>
                    <span className="font-semibold text-gray-900">{seller.totalListings}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Localisation</span>
                    <span className="font-semibold text-gray-900">{seller.location}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push(`/seller/${seller.id}`)}
                    className="w-full bg-gradient-to-r from-[#ec5a13] to-orange-600 hover:from-[#d94f0f] hover:to-orange-700 text-white shadow-md group"
                  >
                    <Store className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Voir toutes les annonces ({seller.totalListings})
                  </Button>
                  {/* <Button 
                    className={`w-full ${isService ? 'bg-blue-100 hover:bg-blue-200 text-blue-900 border-2 border-blue-600' : 'bg-[#ffe9de] hover:bg-orange-100 text-[#ec5a13] border-2 border-[#ec5a13]'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={item.status !== 'active' || isOwnProduct}
                    onClick={() => item.status === 'active' && !isOwnProduct && window.open(`tel:${seller.contactInfo.phone}`)}
                    title={isOwnProduct ? "Vous ne pouvez pas appeler votre propre annonce" : ""}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {seller.contactInfo.phone}
                  </Button> */}
                  <Button 
                    variant="outline" 
                    className="w-full border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={item.status !== 'active' || creatingConversation || isOwnProduct}
                    onClick={async () => {
                      if (isOwnProduct) {
                        alert('Vous ne pouvez pas vous envoyer de message à vous-même.');
                        return;
                      }
                      
                      if (!user || !token) {
                        // Ancien : router.push('/login');
                        openQuickAuth(`/items/${id}`);
                        return;
                      }

                      if (item.status === 'active') {
                        try {
                          setCreatingConversation(true);
                          const response = await createOrGetConversation({
                            sellerId: seller.id,
                            productId: String(item.id)
                          });
                          router.push(`/messages/${response.data.id}`);
                        } catch (err: any) {
                          console.error('❌ Erreur création conversation:', err);
                          const errorMessage = err.response?.data?.message || 'Impossible de créer la conversation. Veuillez réessayer.';
                          alert(errorMessage);
                        } finally {
                          setCreatingConversation(false);
                        }
                      }
                    }}
                    title={isOwnProduct ? "Vous ne pouvez pas contacter votre propre annonce" : ""}
                  >
                    {creatingConversation ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    Envoyer un message
                  </Button>
                  {/* {seller.contactInfo.whatsapp && (
                    <Button 
                      variant="outline" 
                      className="w-full border-green-500 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.status !== 'active' || isOwnProduct}
                      onClick={() => item.status === 'active' && !isOwnProduct && window.open(`https://wa.me/${seller.contactInfo.whatsapp}`)}
                      title={isOwnProduct ? "Vous ne pouvez pas contacter votre propre annonce" : ""}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )} */}
                  {/* {seller.contactInfo.email && (
                    <Button 
                      variant="outline" 
                      className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.status !== 'active' || isOwnProduct}
                      onClick={() => item.status === 'active' && !isOwnProduct && window.open(`mailto:${seller.contactInfo.email}`)}
                      title={isOwnProduct ? "Vous ne pouvez pas contacter votre propre annonce" : ""}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  )} */}
                </div>

                {seller.bio && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">À propos</p>
                      <p className="text-sm text-gray-700">{seller.bio}</p>
                    </div>
                  </>
                )}

                {(seller.contactInfo.facebook || seller.contactInfo.instagram || seller.contactInfo.website) && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex justify-center gap-3">
                      {seller.contactInfo.facebook && (
                        <a href={seller.contactInfo.facebook} target="_blank" rel="noopener noreferrer">
                          <Button size="icon" variant="outline" className="rounded-full">
                            <Facebook className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {seller.contactInfo.instagram && (
                        <a href={seller.contactInfo.instagram} target="_blank" rel="noopener noreferrer">
                          <Button size="icon" variant="outline" className="rounded-full">
                            <Instagram className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {seller.contactInfo.website && (
                        <a href={seller.contactInfo.website} target="_blank" rel="noopener noreferrer">
                          <Button size="icon" variant="outline" className="rounded-full">
                            <Globe className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </>
                )}
                </div>
              </Card>

              {/* Sécurité */}
              <Card className="p-4 border-gray-200 bg-amber-50/50 shadow-sm">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">Conseil de sécurité</p>
                    <p className="text-xs text-gray-700">
                      Ne payez jamais à l'avance. Rencontrez le vendeur en personne et vérifiez l'article avant tout paiement.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {relatedItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Annonces similaires</h2>
            <SimilarItemsCarousel relatedItems={relatedItems} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
