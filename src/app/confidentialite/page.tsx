'use client';

import { Shield, Eye, Lock, Database, UserCheck, Settings } from 'lucide-react';
import Link from 'next/link';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-300 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Shield className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Politique de confidentialité
            </h1>
            <p className="text-lg text-white/90">
              Protection de vos données personnelles
            </p>
            <p className="text-sm text-white/80 mt-2">
              Dernière mise à jour : Mars 2026
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 rounded-lg p-3">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Notre engagement</h2>
                <p className="text-gray-600 leading-relaxed">
                  MarketHub s'engage à protéger vos données personnelles. Cette politique explique 
                  quelles informations nous collectons, comment nous les utilisons et vos droits concernant 
                  ces données.
                </p>
              </div>
            </div>
          </div>

          {/* 1. Données collectées */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-orange-50 rounded-lg p-3">
                <Database className="h-6 w-6 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">1. Données que nous collectons</h2>
            </div>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Lors de votre inscription :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nom et prénom</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse email</li>
                  <li>Mot de passe (crypté)</li>
                  <li>Photo de profil (optionnel)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Lors de l'utilisation du site :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Annonces publiées et leurs contenus</li>
                  <li>Messages échangés via la messagerie</li>
                  <li>Évaluations et avis laissés</li>
                  <li>Produits ajoutés aux favoris</li>
                  <li>Historique de navigation et recherches</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Données techniques :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresse IP</li>
                  <li>Type de navigateur et appareil</li>
                  <li>Système d'exploitation</li>
                  <li>Cookies et technologies similaires</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. Utilisation des données */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-green-100 rounded-lg p-3">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. Comment nous utilisons vos données</h2>
            </div>
            <div className="space-y-3 text-gray-600 leading-relaxed">
              <p>Nous utilisons vos données pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Permettre la publication et la consultation d'annonces</li>
                <li>Faciliter la communication entre acheteurs et vendeurs</li>
                <li>Améliorer nos services et l'expérience utilisateur</li>
                <li>Assurer la sécurité de la plateforme</li>
                <li>Vous envoyer des notifications importantes (validation de compte, messages, etc.)</li>
                <li>Analyser l'utilisation du site et optimiser ses performances</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </div>
          </div>

          {/* 3. Partage des données */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. Partage de vos données</h2>
            </div>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Vos données personnelles ne sont <span className="font-semibold text-gray-900">jamais vendues</span> à des tiers.
              </p>
              <p>Nous pouvons partager certaines informations dans les cas suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <span className="font-semibold text-gray-900">Avec les autres utilisateurs :</span> Votre nom, 
                  photo de profil et annonces sont visibles publiquement sur la plateforme
                </li>
                <li>
                  <span className="font-semibold text-gray-900">Prestataires de services :</span> Hébergement, 
                  analytics, services techniques nécessaires au fonctionnement du site
                </li>
                <li>
                  <span className="font-semibold text-gray-900">Obligations légales :</span> Si requis par la loi 
                  ou les autorités compétentes
                </li>
              </ul>
            </div>
          </div>

          {/* 4. Sécurité des données */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sécurité de vos données</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Nous mettons en œuvre des mesures de sécurité pour protéger vos données :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cryptage des mots de passe</li>
                <li>Connexions sécurisées (HTTPS)</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Surveillance et détection des activités suspectes</li>
                <li>Sauvegardes régulières</li>
              </ul>
              <p className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                ⚠️ Aucun système n'est totalement sécurisé. Nous vous recommandons d'utiliser un mot de passe 
                fort et de ne jamais le partager.
              </p>
            </div>
          </div>

          {/* 5. Conservation des données */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Durée de conservation</h2>
            <div className="space-y-3 text-gray-600 leading-relaxed">
              <p>Nous conservons vos données tant que votre compte est actif.</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <span className="font-semibold text-gray-900">Compte actif :</span> Données conservées 
                  indéfiniment ou jusqu'à suppression
                </li>
                <li>
                  <span className="font-semibold text-gray-900">Après suppression :</span> Certaines données 
                  peuvent être conservées pour des raisons légales ou de sécurité
                </li>
                <li>
                  <span className="font-semibold text-gray-900">Données de navigation :</span> Conservées 
                  pendant 13 mois maximum
                </li>
              </ul>
            </div>
          </div>

          {/* 6. Vos droits */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">6. Vos droits sur vos données</h2>
            </div>
            <div className="space-y-3 text-gray-600 leading-relaxed">
              <p>Vous disposez des droits suivants concernant vos données personnelles :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <span className="font-semibold text-gray-900">Droit d'accès :</span> Demander une copie de 
                  vos données
                </li>
                <li>
                  <span className="font-semibold text-gray-900">Droit de rectification :</span> Corriger des 
                  informations inexactes
                </li>
                <li>
                  <span className="font-semibold text-gray-900">Droit à l'effacement :</span> Demander la 
                  suppression de vos données
                </li>
                <li>
                  <span className="font-semibold text-gray-900">Droit d'opposition :</span> Vous opposer au 
                  traitement de vos données
                </li>
                <li>
                  <span className="font-semibold text-gray-900">Droit à la portabilité :</span> Recevoir vos 
                  données dans un format utilisable
                </li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à{' '}
                <a href="mailto:contact@markethub.com" className="text-orange-500 hover:underline font-semibold">
                  contact@markethub.com
                </a>
              </p>
            </div>
          </div>

          {/* 7. Cookies */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Utilisation des cookies</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>Le site utilise des cookies pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintenir votre session de connexion</li>
                <li>Mémoriser vos préférences</li>
                <li>Analyser le trafic et l'utilisation du site</li>
                <li>Améliorer l'expérience utilisateur</li>
              </ul>
              <p>
                Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités 
                pourraient ne pas fonctionner correctement.
              </p>
            </div>
          </div>

          {/* 8. Modifications */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications de cette politique</h2>
            <div className="space-y-3 text-gray-600 leading-relaxed">
              <p>
                Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications 
                seront publiées sur cette page avec une date de mise à jour.
              </p>
              <p>
                Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos 
                pratiques en matière de protection des données.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-300 rounded-2xl shadow-lg p-8 text-white">
            <div className="text-center">
              <Shield className="h-10 w-10 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Des questions sur vos données ?</h2>
              <p className="text-white/90 mb-6">
                Notre équipe est disponible pour répondre à toutes vos questions concernant 
                la protection de vos données personnelles.
              </p>
              <div className="space-y-2">
                <p>
                  📧 Email :{' '}
                  <a href="mailto:contact@markethub.com" className="underline">
                    contact@markethub.com
                  </a>
                </p>
                <p>
                  📱 Téléphone :{' '}
                  <a href="tel:+221771234567" className="underline">
                    +221 77 123 45 67
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
