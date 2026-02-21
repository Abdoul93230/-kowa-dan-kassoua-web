'use client';

import { Suspense } from 'react';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MessageCircle,
  Handshake,
  Camera,
  FileText,
  Send,
  CheckCircle2,
  Users,
  Shield,
  Zap,
  Heart,
  TrendingUp,
  Globe,
  ArrowRight,
  ShoppingBag,
  Store,
  Star,
  Package
} from 'lucide-react';
import Link from 'next/link';

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <Header />
      </Suspense>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#ffe9de] via-orange-100 to-orange-200 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-[#ec5a13] text-white border-[#ec5a13] mb-6 text-sm px-4 py-2">
              Guide complet
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
              Comment ça marche ?
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Découvrez comment acheter et vendre en toute sécurité sur notre plateforme
            </p>
          </div>
        </div>
      </section>

      {/* À propos */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                À propos de notre plateforme
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Une marketplace locale qui connecte acheteurs et vendeurs pour faciliter les échanges de biens et services
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-6 border-2 border-gray-100 hover:border-[#ec5a13]/20 transition-all">
                <div className="bg-[#ffe9de] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-[#ec5a13]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Notre Mission</h3>
                <p className="text-gray-600">
                  Créer un espace de confiance où chacun peut acheter et vendre facilement, 
                  en toute sécurité, tout en favorisant l'économie locale et circulaire.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-100 hover:border-[#ec5a13]/20 transition-all">
                <div className="bg-[#ffe9de] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[#ec5a13]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Notre Vision</h3>
                <p className="text-gray-600">
                  Devenir la plateforme de référence pour les échanges locaux, 
                  en offrant une expérience simple, sécurisée et accessible à tous.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pour les Acheteurs */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full mb-4">
                <ShoppingBag className="h-5 w-5" />
                <span className="font-semibold">Pour les Acheteurs</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comment acheter en 3 étapes
              </h2>
              <p className="text-lg text-gray-600">
                Trouvez ce que vous cherchez rapidement et facilement
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Étape 1 */}
              <Card className="relative p-8 text-center border-2 border-blue-200 bg-white hover:shadow-xl transition-all">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  1
                </div>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Recherchez</h3>
                <p className="text-gray-600">
                  Parcourez les annonces par catégorie ou utilisez la recherche pour trouver 
                  exactement ce dont vous avez besoin.
                </p>
              </Card>

              {/* Étape 2 */}
              <Card className="relative p-8 text-center border-2 border-blue-200 bg-white hover:shadow-xl transition-all">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  2
                </div>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Contactez</h3>
                <p className="text-gray-600">
                  Discutez avec le vendeur via notre messagerie sécurisée pour poser vos questions 
                  et négocier les détails.
                </p>
              </Card>

              {/* Étape 3 */}
              <Card className="relative p-8 text-center border-2 border-blue-200 bg-white hover:shadow-xl transition-all">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  3
                </div>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                  <Handshake className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Finalisez</h3>
                <p className="text-gray-600">
                  Convenez d'un rendez-vous en lieu public, inspectez l'article et effectuez 
                  la transaction en toute sécurité.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pour les Vendeurs */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#ec5a13] text-white px-4 py-2 rounded-full mb-4">
                <Store className="h-5 w-5" />
                <span className="font-semibold">Pour les Vendeurs</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comment vendre en 3 étapes
              </h2>
              <p className="text-lg text-gray-600">
                Vendez vos articles rapidement et en toute simplicité
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Étape 1 */}
              <Card className="relative p-8 text-center border-2 border-orange-200 bg-white hover:shadow-xl transition-all">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#ec5a13] text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  1
                </div>
                <div className="bg-[#ffe9de] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                  <Camera className="h-8 w-8 text-[#ec5a13]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Photographiez</h3>
                <p className="text-gray-600">
                  Prenez des photos claires de votre article sous différents angles pour 
                  attirer les acheteurs.
                </p>
              </Card>

              {/* Étape 2 */}
              <Card className="relative p-8 text-center border-2 border-orange-200 bg-white hover:shadow-xl transition-all">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#ec5a13] text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  2
                </div>
                <div className="bg-[#ffe9de] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                  <FileText className="h-8 w-8 text-[#ec5a13]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Décrivez</h3>
                <p className="text-gray-600">
                  Rédigez une description détaillée avec le prix, l'état et toutes les 
                  informations importantes.
                </p>
              </Card>

              {/* Étape 3 */}
              <Card className="relative p-8 text-center border-2 border-orange-200 bg-white hover:shadow-xl transition-all">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#ec5a13] text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  3
                </div>
                <div className="bg-[#ffe9de] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                  <Send className="h-8 w-8 text-[#ec5a13]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Publiez</h3>
                <p className="text-gray-600">
                  Publiez votre annonce gratuitement et commencez à recevoir des messages 
                  d'acheteurs intéressés.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Pourquoi nous choisir ?
              </h2>
              <p className="text-lg text-gray-600">
                Des avantages qui font la différence
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center hover:shadow-lg transition-all border-2 border-gray-100 hover:border-[#ec5a13]/20">
                <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">100% Gratuit</h3>
                <p className="text-sm text-gray-600">
                  Aucun frais d'inscription ou de publication
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-all border-2 border-gray-100 hover:border-[#ec5a13]/20">
                <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Sécurisé</h3>
                <p className="text-sm text-gray-600">
                  Messagerie protégée et conseils de sécurité
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-all border-2 border-gray-100 hover:border-[#ec5a13]/20">
                <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Rapide</h3>
                <p className="text-sm text-gray-600">
                  Publication instantanée et recherche efficace
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-all border-2 border-gray-100 hover:border-[#ec5a13]/20">
                <div className="bg-pink-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-7 w-7 text-pink-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Simple</h3>
                <p className="text-sm text-gray-600">
                  Interface intuitive et facile à utiliser
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ils nous font confiance
              </h2>
              <p className="text-lg text-gray-300">
                Des milliers d'utilisateurs satisfaits
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-[#ec5a13] mb-2">10K+</div>
                <p className="text-gray-300">Utilisateurs actifs</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-[#ec5a13] mb-2">50K+</div>
                <p className="text-gray-300">Annonces publiées</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-[#ec5a13] mb-2">4.8/5</div>
                <p className="text-gray-300">Note moyenne</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-[#ec5a13] mb-2">98%</div>
                <p className="text-gray-300">Satisfaction client</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-br from-[#ffe9de] to-orange-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Prêt à commencer ?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Rejoignez notre communauté dès aujourd'hui et découvrez des milliers d'opportunités
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/publish">
                <Button
                  size="lg"
                  className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white text-lg px-8 py-6 h-auto font-semibold shadow-lg"
                >
                  <Package className="mr-2 h-5 w-5" />
                  Publier une annonce
                </Button>
              </Link>
              <Link href="/categories-list">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#ec5a13] text-[#ec5a13] hover:bg-[#ec5a13] hover:text-white text-lg px-8 py-6 h-auto font-semibold"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Parcourir les annonces
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
