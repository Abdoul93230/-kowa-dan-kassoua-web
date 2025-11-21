'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '../../../components/home/Header';
import { Footer } from '../../../components/home/Footer';
import { mockItems, itemReviews, sellers } from '../../../../lib/mockData';
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
  StarHalf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ItemDetailPage() {
  const params = useParams();
  const itemId = parseInt(params?.id as string);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const allItems: Item[] = Object.values(mockItems).flat();
  const item = allItems.find(i => i.id === itemId);

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Article non trouvé</h1>
          <Button onClick={() => window.history.back()}>Retour</Button>
        </div>
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
    <div className="min-h-screen bg-slate-50">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <a href="/" className="hover:text-emerald-600 transition-colors">Accueil</a>
          <ChevronRight className="h-4 w-4" />
          <a href="/categories" className="hover:text-emerald-600 transition-colors">Catégories</a>
          <ChevronRight className="h-4 w-4" />
          <a href={`/categories/${item.category}`} className="hover:text-emerald-600 transition-colors">
            {item.category}
          </a>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900 font-medium truncate">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    <Badge
                      className={isService ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}
                    >
                      {isService ? <Briefcase className="h-3 w-3 mr-1" /> : <Package className="h-3 w-3 mr-1" />}
                      {isService ? 'Service' : 'Produit'}
                    </Badge>
                    {item.promoted && (
                      <Badge className="bg-emerald-600">En vedette</Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-3">{item.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Publié il y a {item.postedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{item.views} vues</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={isFavorite ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="mb-6">
                <div className="relative aspect-video bg-slate-200 rounded-lg overflow-hidden mb-4">
                  <img
                    src={item.images[selectedImage]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {item.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-video bg-slate-200 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-emerald-600' : 'border-transparent'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="specs">Caractéristiques</TabsTrigger>
                    <TabsTrigger value="reviews">Avis ({reviews.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="space-y-4 mt-6">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-3">Description</h3>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>
                    </div>

                    {!isService && item.condition && (
                      <div className="flex items-center gap-2 pt-4">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="font-medium">
                          État: {item.condition === 'new' ? 'Neuf' : 'Occasion'}
                        </span>
                      </div>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <div className="pt-4">
                        <h4 className="font-medium text-slate-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="specs" className="space-y-4 mt-6">
                    {item.specifications ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(item.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="font-medium text-slate-700">{key}</span>
                            <span className="text-slate-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600">Aucune caractéristique spécifiée</p>
                    )}

                    {isService && item.availability && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-2">Disponibilité</h4>
                        <p className="text-slate-700">
                          <span className="font-medium">Jours:</span> {item.availability.days.join(', ')}
                        </p>
                        <p className="text-slate-700">
                          <span className="font-medium">Horaires:</span> {item.availability.hours}
                        </p>
                      </div>
                    )}

                    {item.delivery && item.delivery.available && (
                      <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <TruckIcon className="h-5 w-5 text-emerald-600" />
                          Livraison disponible
                        </h4>
                        <p className="text-slate-700">
                          <span className="font-medium">Coût:</span> {item.delivery.cost}
                        </p>
                        <p className="text-slate-700">
                          <span className="font-medium">Zones:</span> {item.delivery.areas.join(', ')}
                        </p>
                        <p className="text-slate-700">
                          <span className="font-medium">Délai:</span> {item.delivery.estimatedTime}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4 mt-6">
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-slate-900">{item.rating}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(item.rating)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm text-slate-600 mt-1">
                              {item.totalReviews} avis
                            </div>
                          </div>
                        </div>

                        {reviews.map((review) => (
                          <Card key={review.id} className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={review.userAvatar} />
                                <AvatarFallback>
                                  {review.userName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="font-medium text-slate-900">{review.userName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-3 w-3 ${
                                              i < review.rating
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-slate-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs text-slate-500">{review.date}</span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-slate-700 text-sm">{review.comment}</p>
                                <button className="text-xs text-slate-500 hover:text-slate-700 mt-2">
                                  👍 Utile ({review.helpful})
                                </button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600 text-center py-8">Aucun avis pour le moment</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="p-6">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-emerald-600 mb-1">
                    {item.price}
                  </div>
                  {item.negotiable && (
                    <Badge variant="outline" className="text-xs">Prix négociable</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
                    <Phone className="h-5 w-5 mr-2" />
                    Appeler
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Mail className="h-5 w-5 mr-2" />
                    Envoyer un email
                  </Button>
                </div>

                {item.warranty && (
                  <div className="flex items-center gap-2 mt-6 p-3 bg-blue-50 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Garantie</p>
                      <p className="text-xs text-slate-600">{item.warranty}</p>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={seller.avatar} />
                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{seller.name}</h3>
                      {seller.verified && (
                        <BadgeCheck className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{seller.rating}</span>
                      <span className="text-sm text-slate-500">({seller.totalReviews} avis)</span>
                    </div>
                  </div>
                </div>

                {seller.bio && (
                  <p className="text-sm text-slate-600 mb-4">{seller.bio}</p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Membre depuis</span>
                    <span className="font-medium text-slate-900">{seller.memberSince}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Temps de réponse</span>
                    <span className="font-medium text-slate-900">{seller.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Taux de réponse</span>
                    <span className="font-medium text-slate-900">{seller.responseRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Annonces actives</span>
                    <span className="font-medium text-slate-900">{seller.totalListings}</span>
                  </div>
                </div>

                {seller.contactInfo && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="space-y-2">
                      {seller.contactInfo.website && (
                        <a
                          href={seller.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          <Globe className="h-4 w-4" />
                          {seller.contactInfo.website}
                        </a>
                      )}
                      {seller.contactInfo.facebook && (
                        <a
                          href={`https://facebook.com/${seller.contactInfo.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                        >
                          <Facebook className="h-4 w-4" />
                          {seller.contactInfo.facebook}
                        </a>
                      )}
                      {seller.contactInfo.instagram && (
                        <a
                          href={`https://instagram.com/${seller.contactInfo.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                        >
                          <Instagram className="h-4 w-4" />
                          {seller.contactInfo.instagram}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full mt-4">
                  <User className="h-4 w-4 mr-2" />
                  Voir le profil
                </Button>
              </Card>

              <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-amber-900 mb-1">
                      Conseils de sécurité
                    </h4>
                    <ul className="text-xs text-amber-800 space-y-1">
                      <li>• Rencontrez le vendeur en personne</li>
                      <li>• Vérifiez le produit avant de payer</li>
                      <li>• Ne payez jamais à l'avance</li>
                      <li>• Privilégiez les lieux publics</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {relatedItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Annonces similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((relatedItem) => (
                <Card
                  key={relatedItem.id}
                  className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all"
                  onClick={() => window.location.href = `/items/${relatedItem.id}`}
                >
                  <div className="relative h-48 bg-slate-200 overflow-hidden">
                    <img
                      src={relatedItem.mainImage}
                      alt={relatedItem.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                      {relatedItem.title}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{relatedItem.rating}</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-600">{relatedItem.price}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
