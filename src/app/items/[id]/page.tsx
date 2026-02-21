'use client';

import { useState, use, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '../../../components/home/Header';
import { Footer } from '../../../components/home/Footer';
import { SimilarItemsCarousel } from '../../../components/home/SimilarItemsCarousel';
import { itemReviews } from '@/lib/mockData';
import { Item } from '@/types/index';
import { getOrCreateConversation } from '@/lib/utilitis/conversationUtils';
import { getProductById, getProducts } from '@/lib/api/products';
import {
  Star,
  MapPin,
  Clock,
  Heart,
  Share2,
  Phone,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import ReviewForm from '@/components/ReviewForm';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [selectedImage, setSelectedImage] = useState(0);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);

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

  // Charger les avis (mockData + localStorage)
  useEffect(() => {
    if (!item) return;

    const itemId = item.id;
    const mockReviews = (itemReviews as any)[itemId] || [];
    const localStorageKey = `reviews_${itemId}`;
    const storedReviews = localStorage.getItem(localStorageKey);
    const localReviews = storedReviews ? JSON.parse(storedReviews) : [];
    
    // Combiner les avis : localStorage en premier (plus récents)
    setAllReviews([...localReviews, ...mockReviews]);
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
  const handleReviewSubmitted = () => {
    if (!item) return;

    const itemId = item.id;
    const mockReviews = (itemReviews as any)[itemId] || [];
    const localStorageKey = `reviews_${itemId}`;
    const storedReviews = localStorage.getItem(localStorageKey);
    const localReviews = storedReviews ? JSON.parse(storedReviews) : [];
    setAllReviews([...localReviews, ...mockReviews]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
          <Header />
        </Suspense>
        <div className="container mx-auto px-4 py-16">
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
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
          <Header />
        </Suspense>
        <div className="container mx-auto px-4 py-16 text-center">
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
                    <p className="text-lg sm:text-xl font-bold text-[#ec5a13] whitespace-nowrap flex-shrink-0">{item.price}</p>
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
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button 
                  className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => window.open(`tel:${seller.contactInfo.phone}`)}
                  disabled={item.status !== 'active'}
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Appeler</span>
                  <span className="sm:hidden">Appel</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de] py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    // Obtenir ou créer une conversation pour ce vendeur et ce produit
                    const conversation = getOrCreateConversation(seller.id, Number(item.id));
                    router.push(`/messages/${conversation.id}`);
                  }}
                  disabled={item.status !== 'active'}
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
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
                                  <p className="text-xs text-gray-600">Délai: {item.delivery.estimatedTime}</p>
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



            {/* Avis */}
            <Card className="p-3 sm:p-4 md:p-6 border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 fill-amber-400" />
                  Avis clients
                </h2>
                <div className="flex items-center gap-3">
                  {reviews.length > 0 && (
                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">{item.rating}</span>
                        <div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                                  i < Math.floor(item.rating)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">{item.totalReviews} avis</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <ReviewForm itemId={typeof item.id === 'string' ? parseInt(item.id) : item.id} onReviewSubmitted={handleReviewSubmitted} />
                </div>
              </div>
                
              {/* Indicateur de scroll pour mobile */}
              {reviews.length > 0 && (
                <>
                  <div className="md:hidden flex items-center justify-between mb-3 px-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span>Glissez pour voir plus</span>
                      <ChevronRight className="h-3 w-3 animate-pulse" />
                    </p>
                    <div className="flex gap-1">
                      {reviews.slice(0, 3).map((_, idx) => (
                        <div key={idx} className="h-1.5 w-1.5 rounded-full bg-gray-300"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Carousel sur mobile, liste sur desktop */}
                  <div className="md:space-y-4">
                  {/* Version mobile : Carousel avec gradient indicateur */}
                  <div className="relative md:hidden">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-3 px-3 snap-x snap-mandatory">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="flex-shrink-0 w-[85vw] sm:w-[70vw] snap-start">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-3">
                              <Avatar className="flex-shrink-0">
                                <AvatarImage src={review.userAvatar} />
                                <AvatarFallback>{review.userName[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2 gap-2">
                                  <p className="font-semibold text-sm text-gray-900 truncate">{review.userName}</p>
                                  <div className="flex items-center gap-0.5 flex-shrink-0">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 mb-2 line-clamp-3">{review.comment}</p>
                                <p className="text-xs text-gray-500">{review.date}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Gradient indicateur sur le bord droit */}
                    <div className="absolute top-0 right-0 bottom-2 w-12 bg-gradient-to-l from-white via-white/50 to-transparent pointer-events-none"></div>
                  </div>

                  {/* Version desktop : Liste */}
                  <div className="hidden md:block space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={review.userAvatar} />
                            <AvatarFallback>{review.userName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-gray-900">{review.userName}</p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                            <p className="text-sm text-gray-500">{review.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </>
              )}
              
              {/* Message si aucun avis */}
              {reviews.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Aucun avis pour le moment</p>
                  <ReviewForm itemId={typeof item.id === 'string' ? parseInt(item.id) : item.id} onReviewSubmitted={handleReviewSubmitted} />
                </div>
              )}
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
                    <span className="text-lg sm:text-xl font-bold text-gray-900">{seller.rating}</span>
                    <span className="text-gray-600 text-xs sm:text-sm">({seller.totalReviews} avis)</span>
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
                  <Button 
                    className={`w-full ${isService ? 'bg-blue-100 hover:bg-blue-200 text-blue-900 border-2 border-blue-600' : 'bg-[#ffe9de] hover:bg-orange-100 text-[#ec5a13] border-2 border-[#ec5a13]'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={item.status !== 'active'}
                    onClick={() => item.status === 'active' && window.open(`tel:${seller.contactInfo.phone}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {seller.contactInfo.phone}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={item.status !== 'active'}
                    onClick={() => {
                      if (item.status === 'active') {
                        const conversation = getOrCreateConversation(seller.id, Number(item.id));
                        router.push(`/messages/${conversation.id}`);
                      }
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Envoyer un message
                  </Button>
                  {seller.contactInfo.whatsapp && (
                    <Button 
                      variant="outline" 
                      className="w-full border-green-500 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.status !== 'active'}
                      onClick={() => item.status === 'active' && window.open(`https://wa.me/${seller.contactInfo.whatsapp}`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                  {seller.contactInfo.email && (
                    <Button 
                      variant="outline" 
                      className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.status !== 'active'}
                      onClick={() => item.status === 'active' && window.open(`mailto:${seller.contactInfo.email}`)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  )}
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
