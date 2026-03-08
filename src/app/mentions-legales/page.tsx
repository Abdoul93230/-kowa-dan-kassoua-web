'use client';

import { Scale, Building, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-300 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Scale className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mentions légales
            </h1>
            <p className="text-lg text-white/90">
              Informations légales et éditoriales
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Éditeur du site */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-orange-50 rounded-lg p-3">
                <Building className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Éditeur du site</h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-900">Raison sociale :</span> MarketHub
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Forme juridique :</span> Société en cours de constitution
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Siège social :</span> Dakar, Sénégal
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Email :</span> contact@markethub.com
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Téléphone :</span> +221 77 123 45 67
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Directeur de publication */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Directeur de publication</h2>
            <div className="space-y-3 text-gray-600">
              <p>
                Le directeur de la publication est le représentant légal de MarketHub.
              </p>
            </div>
          </div>

          {/* Hébergement */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Hébergement</h2>
            <div className="space-y-3 text-gray-600">
              <p>
                <span className="font-semibold text-gray-900">Hébergeur :</span> À définir
              </p>
              <p className="text-sm text-gray-500">
                Les coordonnées de l'hébergeur seront mises à jour dès la mise en production du site.
              </p>
            </div>
          </div>

          {/* Propriété intellectuelle */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Propriété intellectuelle</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                L'ensemble du contenu de ce site (textes, images, logos, vidéos, structure) est la propriété 
                de MarketHub, sauf mention contraire.
              </p>
              <p>
                Toute reproduction, distribution, modification, adaptation, retransmission ou publication de 
                ces différents éléments est strictement interdite sans l'accord écrit de MarketHub.
              </p>
              <p>
                Les marques et logos présents sur le site sont déposés par MarketHub ou éventuellement par 
                des partenaires. Toute reproduction non autorisée de ces marques constitue une contrefaçon.
              </p>
            </div>
          </div>

          {/* Données personnelles */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Protection des données personnelles</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                MarketHub s'engage à protéger la vie privée de ses utilisateurs conformément à la 
                réglementation en vigueur.
              </p>
              <p>
                Les informations collectées lors de votre inscription sont destinées à l'usage interne 
                de MarketHub et ne seront en aucun cas cédées à des tiers sans votre consentement.
              </p>
              <p>
                Pour en savoir plus sur la gestion de vos données personnelles, consultez notre{' '}
                <Link href="/confidentialite" className="text-orange-500 hover:underline font-semibold">
                  Politique de confidentialité
                </Link>.
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Utilisation des cookies</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Le site MarketHub utilise des cookies pour améliorer l'expérience utilisateur et analyser 
                le trafic du site.
              </p>
              <p>
                Un cookie est un petit fichier texte stocké sur votre appareil lors de la visite d'un site web. 
                Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités 
                du site pourraient ne pas fonctionner correctement.
              </p>
            </div>
          </div>

          {/* Responsabilité */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation de responsabilité</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                MarketHub s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées 
                sur le site. Toutefois, des erreurs ou omissions peuvent survenir.
              </p>
              <p>
                MarketHub ne saurait être tenu responsable :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Des dommages directs ou indirects causés au matériel de l'utilisateur</li>
                <li>De l'indisponibilité temporaire ou totale du site</li>
                <li>De l'utilisation frauduleuse du site par des tiers</li>
                <li>Du contenu des annonces publiées par les utilisateurs</li>
                <li>Des transactions effectuées entre utilisateurs</li>
              </ul>
            </div>
          </div>

          {/* Droit applicable */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Droit applicable et juridiction</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Les présentes mentions légales sont régies par le droit sénégalais. En cas de litige, 
                les tribunaux sénégalais seront seuls compétents.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-300 rounded-2xl shadow-lg p-8 text-white">
            <div className="text-center">
              <Mail className="h-10 w-10 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Des questions sur les mentions légales ?</h2>
              <p className="text-white/90 mb-6">
                Contactez-nous pour plus d'informations
              </p>
              <a 
                href="mailto:contact@markethub.com"
                className="inline-block bg-white text-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
