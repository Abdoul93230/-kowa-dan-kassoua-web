'use client';

import { ShoppingBag, Target, Eye, Heart, Users, TrendingUp, Shield, Award } from 'lucide-react';
import Link from 'next/link';

export default function QuiSommesNousPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-300 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <ShoppingBag className="h-16 w-16" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Qui sommes-nous ?
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              MarketHub est une plateforme qui connecte vendeurs et acheteurs 
              dans différents secteurs, facilitant les échanges commerciaux de manière simple et sécurisée.
            </p>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Valeurs */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="bg-orange-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Target className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Faciliter le commerce en ligne en offrant une plateforme simple et accessible, 
              permettant aux vendeurs de développer leur activité et aux acheteurs 
              de trouver les produits dont ils ont besoin.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              Créer une marketplace fiable et innovante, reconnue pour son engagement 
              envers ses utilisateurs et construire un écosystème commercial dynamique.
            </p>
          </div>

          {/* Valeurs */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
            <p className="text-gray-600 leading-relaxed">
              Transparence, confiance et innovation. Nous plaçons nos utilisateurs 
              au cœur de nos décisions et travaillons pour améliorer leur expérience.
            </p>
          </div>
        </div>

        {/* Notre Histoire */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Notre Histoire</h2>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                MarketHub est né d'une vision simple : faciliter les échanges commerciaux 
                en créant une plateforme digitale accessible à tous. Nous avons créé une solution 
                qui combine simplicité d'utilisation et fonctionnalités pratiques.
              </p>
              <p>
                Notre équipe travaille pour construire une plateforme qui répond aux besoins 
                des vendeurs et des acheteurs. Que vous soyez un particulier, un artisan ou une 
                entreprise, MarketHub vous offre les outils pour vendre et acheter facilement.
              </p>
              <p>
                Nous pensons que le commerce doit être transparent et équitable. C'est pourquoi 
                nous avons mis en place des outils de communication sécurisés et un support client 
                pour faciliter vos transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Ce qui nous différencie */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Ce qui nous différencie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="bg-orange-50 rounded-xl p-4">
                  <Shield className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sécurité & Confiance</h3>
                <p className="text-gray-600">
                  Système de vérification, messagerie sécurisée et évaluations 
                  pour faciliter vos transactions.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 rounded-xl p-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Communauté Active</h3>
                <p className="text-gray-600">
                  Une communauté de vendeurs et d'acheteurs qui partagent leurs expériences.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="bg-green-100 rounded-xl p-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Outils Pratiques</h3>
                <p className="text-gray-600">
                  Interface simple, recherche efficace et outils pour améliorer 
                  la visibilité de vos annonces.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="bg-purple-100 rounded-xl p-4">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Support Disponible</h3>
                <p className="text-gray-600">
                  Une équipe disponible pour vous accompagner et répondre à vos questions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-300 rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Rejoignez MarketHub</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Commencez à vendre ou acheter sur notre plateforme.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-white text-orange-500 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Créer un compte
            </Link>
            <Link 
              href="/comment-ca-marche" 
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-colors border-2 border-white/30"
            >
              Comment ça marche
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
