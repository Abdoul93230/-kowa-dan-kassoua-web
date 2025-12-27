'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../../components/home/Header';
import { Footer } from '../../../components/home/Footer';
import { mockItems, itemReviews } from '../../../../lib/mockData';
import { Item } from '../../../../types/index';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const itemId = parseInt(id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const allItems: Item[] = Object.values(mockItems).flat();
  const item = allItems.find(i => i.id === itemId);

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-white p-12 rounded-lg shadow-sm max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-[#ec5a13] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
            <p className="text-gray-600 mb-6">Cet article n'existe pas ou a été supprimé.</p>
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
  const reviews = itemReviews[item.id] || [];
  const seller = item.seller;

  const relatedItems = allItems
    .filter(i => i.category === item.category && i.id !== item.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Bandeau type produit/service */}
      <div className={`border-b-4 ${isService ? 'border-blue-600 bg-blue-100' : 'border-[#ec5a13] bg-[#ffe9de]'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isService ? (
                <>
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-blue-900 block">SERVICE PROFESSIONNEL</span>
                    <span className="text-sm text-blue-700">Prestation de service qualifiée</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-[#ec5a13] p-2 rounded-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-[#ec5a13] block">PRODUIT À VENDRE</span>
                    <span className="text-sm text-orange-700">Article en vente</span>
                  </div>
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
              <div className="relative bg-gray-100">
                <img
                  src={item.images[selectedImage]}
                  alt={item.title}
                  className="w-full h-[500px] object-contain"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className={`rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white ${isFavorite ? 'text-red-500' : ''}`}
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
                {item.promoted && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base px-4 py-2 shadow-lg">
                      ⭐ EN VEDETTE
                    </Badge>
                  </div>
                )}
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
            <Card className="p-6 border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{item.title}</h1>
                  
                  {/* Tags visibles */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag, idx) => (
                        <Badge key={idx} className={`${isService ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-orange-100 text-orange-700 border-orange-300'} text-sm px-3 py-1.5 border`}>
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge 
                      variant="outline" 
                      className="border-[#ec5a13] text-[#ec5a13] text-sm px-3 py-1"
                    >
                      {item.category}
                    </Badge>
                    {item.subcategory && (
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {item.subcategory}
                      </Badge>
                    )}
                    {!isService && item.condition && (
                      <Badge 
                        variant="outline"
                        className={`text-sm px-3 py-1 ${
                          item.condition === 'new' ? 'border-green-500 text-green-700' : 'border-amber-500 text-amber-700'
                        }`}
                      >
                        {item.condition === 'new' ? '🆕 Neuf' : '📦 Occasion'}
                      </Badge>
                    )}
                    {!isService && item.brand && (
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        <Award className="h-3 w-3 mr-1" />
                        {item.brand}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{item.views.toLocaleString()} vues</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Publié il y a {item.postedTime}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{item.location}</span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Prix */}
              <div className="bg-gradient-to-r from-[#ffe9de] to-white p-6 rounded-lg border-2 border-[#ec5a13] mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {isService ? 'Tarif' : 'Prix'} {item.negotiable && '(négociable)'}
                    </p>
                    <p className="text-4xl font-bold text-[#ec5a13]">{item.price}</p>
                    {isService && <p className="text-xs text-gray-500 mt-1">Tarif indicatif</p>}
                  </div>
                  {/* {item.negotiable && (
                    <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">
                      <Tag className="h-3 w-3 mr-1" />
                      Négociable
                    </Badge>
                  )} */}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-2 gap-3">
                <Button className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white py-6 text-lg">
                  <Phone className="h-5 w-5 mr-2" />
                  Appeler
                </Button>
                <Button variant="outline" className="border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de] py-6 text-lg">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Message
                </Button>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6 border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="h-6 w-6 text-[#ec5a13]" />
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>
            </Card>

            {/* Spécifications produit OU Détails service */}
            {isService ? (
              <Card className="p-8 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-lg">
                <div className="bg-blue-600 text-white p-4 rounded-lg mb-6 -mt-8 -mx-8">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded">
                      <Briefcase className="h-7 w-7" />
                    </div>
                    Détails du service professionnel
                  </h2>
                  <p className="text-blue-100 text-sm mt-1 ml-14">Prestation qualifiée avec engagement</p>
                </div>
                <div className="space-y-4">
                  {item.duration && (
                    <div className="flex items-start gap-4 bg-white p-4 rounded-lg border border-blue-200">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <CalendarDays className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Durée</p>
                        <p className="text-gray-700">{item.duration}</p>
                      </div>
                    </div>
                  )}
                  {item.availability && (
                    <div className="flex items-start gap-4 bg-white p-4 rounded-lg border border-blue-200">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Disponibilité</p>
                        <p className="text-gray-700">{item.availability.days.join(', ')}</p>
                        <p className="text-gray-600 text-sm">{item.availability.hours}</p>
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
              <Card className="p-6 border-[#ec5a13]/30 bg-[#ffe9de]/30 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="bg-[#ec5a13] p-2 rounded-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  Caractéristiques du produit
                </h2>
                <div className="space-y-4">
                  {item.quantity && (
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-[#ec5a13] mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Quantité disponible</p>
                        <p className="text-gray-700">{item.quantity} unité(s)</p>
                      </div>
                    </div>
                  )}
                  {item.warranty && (
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-[#ec5a13] mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Garantie</p>
                        <p className="text-gray-700">{item.warranty}</p>
                      </div>
                    </div>
                  )}
                  {item.returnPolicy && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#ec5a13] mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Politique de retour</p>
                        <p className="text-gray-700">{item.returnPolicy}</p>
                      </div>
                    </div>
                  )}
                  {item.delivery && (
                    <div className="flex items-start gap-3">
                      <TruckIcon className="h-5 w-5 text-[#ec5a13] mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Livraison</p>
                        <p className="text-gray-700">
                          {item.delivery.available ? `Disponible - ${item.delivery.cost}` : 'Non disponible'}
                        </p>
                        {item.delivery.available && (
                          <>
                            <p className="text-gray-600 text-sm">Zones: {item.delivery.areas.join(', ')}</p>
                            <p className="text-gray-600 text-sm">Délai: {item.delivery.estimatedTime}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
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
                </div>
              </Card>
            )}



            {/* Avis */}
            {reviews.length > 0 && (
              <Card className="p-6 border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
                    Avis clients
                  </h2>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-900">{item.rating}</span>
                      <div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
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
                </div>
                <div className="space-y-4">
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
              </Card>
            )}
          </div>

          {/* Sidebar vendeur */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="p-0 border-2 border-gray-200 shadow-lg overflow-hidden">
                {/* Header vendeur avec fond coloré */}
                <div className={`${isService ? 'bg-gradient-to-br from-blue-600 to-blue-500' : 'bg-gradient-to-br from-[#ec5a13] to-orange-600'} text-white p-6 text-center`}>
                  <Avatar className="w-24 h-24 mx-auto mb-3 border-4 border-white shadow-lg">
                    <AvatarImage src={seller.avatar} />
                    <AvatarFallback className="bg-white text-gray-900 text-3xl font-bold">
                      {seller.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-bold mb-2">{seller.name}</h3>
                  {seller.verified && (
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/40 border">
                      <BadgeCheck className="h-4 w-4 mr-1" />
                      Vendeur Vérifié
                    </Badge>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
                    <span className="text-xl font-bold">{seller.rating}</span>
                    <span className="text-white/80 text-sm">({seller.totalReviews} avis)</span>
                  </div>
                </div>
                
                {/* Corps de la carte */}
                <div className="p-6">

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Membre depuis</span>
                    <span className="font-semibold text-gray-900">{seller.memberSince}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Taux de réponse</span>
                    <span className="font-semibold text-gray-900">{seller.responseRate}%</span>
                  </div>
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
                  <Button className="w-full bg-[#ec5a13] hover:bg-[#d94f0f] text-white">
                    <Phone className="h-4 w-4 mr-2" />
                    {seller.contactInfo.phone}
                  </Button>
                  <Button variant="outline" className="w-full border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de]">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Envoyer un message
                  </Button>
                  {seller.contactInfo.whatsapp && (
                    <Button variant="outline" className="w-full border-green-500 text-green-700 hover:bg-green-50">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                  {seller.contactInfo.email && (
                    <Button variant="outline" className="w-full">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((relatedItem) => {
                const isRelatedService = relatedItem.type === 'service';
                const getDistance = (itemId: number) => {
                  const distances = [0.5, 1.2, 2.3, 3.5, 4.8, 5.1, 6.7, 8.2, 10.5];
                  return distances[itemId % distances.length];
                };
                const distance = getDistance(relatedItem.id);
                
                return (
                  <Card
                    key={relatedItem.id}
                    className="group cursor-pointer overflow-hidden border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] h-full bg-white p-0 gap-0"
                    onClick={() => router.push(`/items/${relatedItem.id}`)}
                  >
                    <div className="relative h-40 sm:h-44 md:h-48 lg:h-52 xl:h-56 overflow-hidden bg-gray-200">
                      <img
                        src={relatedItem.mainImage}
                        alt={relatedItem.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Badge de temps en haut à gauche */}
                      <Badge className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-white/90 backdrop-blur-sm text-gray-700 flex items-center gap-1 sm:gap-1.5 shadow-md text-xs px-2 py-1 rounded-lg border-0">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="font-medium">Il y a {relatedItem.postedTime}</span>
                      </Badge>
                    </div>
                    <div className="p-3">
                      {/* Icône + Titre */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm sm:text-base flex-shrink-0">
                          {isRelatedService ? '🔧' : '📦'}
                        </span>
                        <h3 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-[#ec5a13] transition-colors truncate flex-1">
                          {relatedItem.title}
                        </h3>
                      </div>

                      {/* Localité + Distance */}
                      <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-600">
                        <MapPin className="h-3 w-3 text-[#ec5a13] flex-shrink-0" />
                        <span className="truncate">{relatedItem.location}</span>
                        <span className="text-gray-400">•</span>
                        <span className="whitespace-nowrap">{distance.toFixed(1)} km</span>
                      </div>

                      {/* Prix */}
                      <div>
                        <p className="text-base sm:text-lg font-bold text-[#ec5a13]">{relatedItem.price.replace(/À partir de /gi, '')}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
