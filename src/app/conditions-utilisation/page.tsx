'use client';

import { FileText, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ConditionsUtilisationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-300 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <FileText className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Conditions d'utilisation
            </h1>
            <p className="text-lg text-white/90">
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
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue sur MarketHub</h2>
                <p className="text-gray-600 leading-relaxed">
                  En accédant à notre plateforme, vous acceptez de respecter les présentes conditions d'utilisation. 
                  Veuillez les lire attentivement avant d'utiliser nos services.
                </p>
              </div>
            </div>
          </div>

          {/* 1. Acceptation des conditions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptation des conditions</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                En utilisant MarketHub, vous acceptez d'être lié par ces conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
              </p>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications 
                seront effectives dès leur publication sur le site.
              </p>
            </div>
          </div>

          {/* 2. Inscription et compte */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Inscription et compte utilisateur</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Pour utiliser certaines fonctionnalités de MarketHub, vous devez créer un compte en fournissant 
                des informations exactes et à jour.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Vous êtes responsable de la confidentialité de votre mot de passe</li>
                <li>Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
                <li>Un utilisateur ne peut créer qu'un seul compte</li>
              </ul>
            </div>
          </div>

          {/* 3. Publication d'annonces */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Publication d'annonces</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p className="font-semibold text-gray-900">Vous vous engagez à :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Publier uniquement des annonces légales et conformes aux lois en vigueur</li>
                <li>Fournir des informations exactes et honnêtes sur les produits ou services proposés</li>
                <li>Ne pas publier de contenu offensant, diffamatoire ou inapproprié</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Ne pas publier d'annonces en double</li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  MarketHub se réserve le droit de supprimer toute annonce qui ne respecte pas ces conditions, 
                  sans préavis ni justification.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Transactions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Transactions entre utilisateurs</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                MarketHub est une plateforme de mise en relation. Les transactions sont effectuées directement 
                entre acheteurs et vendeurs.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>MarketHub n'est pas partie aux transactions entre utilisateurs</li>
                <li>Nous ne garantissons pas la qualité, la sécurité ou la légalité des articles proposés</li>
                <li>Les utilisateurs sont responsables du respect de leurs engagements</li>
                <li>Nous encourageons la communication via notre messagerie sécurisée</li>
              </ul>
            </div>
          </div>

          {/* 5. Comportement des utilisateurs */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Comportement des utilisateurs</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p className="font-semibold text-gray-900">Il est interdit de :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Harceler, menacer ou intimider d'autres utilisateurs</li>
                <li>Utiliser la plateforme à des fins frauduleuses ou illégales</li>
                <li>Tenter d'accéder aux comptes d'autres utilisateurs</li>
                <li>Utiliser des robots ou des scripts automatisés</li>
                <li>Publier des liens vers des sites malveillants</li>
                <li>Collecter des données d'autres utilisateurs sans autorisation</li>
              </ul>
            </div>
          </div>

          {/* 6. Propriété intellectuelle */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propriété intellectuelle</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Le contenu de MarketHub (logos, textes, graphiques, etc.) est protégé par les droits de 
                propriété intellectuelle. Vous ne pouvez pas copier, reproduire ou distribuer ce contenu 
                sans autorisation.
              </p>
              <p>
                En publiant du contenu sur MarketHub, vous nous accordez une licence pour afficher, 
                reproduire et distribuer ce contenu sur notre plateforme.
              </p>
            </div>
          </div>

          {/* 7. Limitation de responsabilité */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation de responsabilité</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                MarketHub est fourni "tel quel". Nous ne garantissons pas que la plateforme sera toujours 
                disponible ou exempte d'erreurs.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Nous ne sommes pas responsables des pertes ou dommages résultant de l'utilisation de la plateforme</li>
                <li>Nous ne sommes pas responsables du contenu publié par les utilisateurs</li>
                <li>Nous ne sommes pas responsables des transactions entre utilisateurs</li>
              </ul>
            </div>
          </div>

          {/* 8. Suspension et résiliation */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Suspension et résiliation</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Nous nous réservons le droit de suspendre ou de résilier votre compte si vous violez 
                ces conditions d'utilisation, sans préavis ni remboursement.
              </p>
              <p>
                Vous pouvez fermer votre compte à tout moment en nous contactant via notre support.
              </p>
            </div>
          </div>

          {/* 9. Contact */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Nous contacter</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter :
              </p>
              <ul className="list-none space-y-2 ml-4">
                <li>📧 Email : contact@markethub.com</li>
                <li>📱 Téléphone : +221 77 123 45 67</li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-300 rounded-2xl shadow-lg p-8 text-center text-white">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Besoin d'aide ?</h2>
            <p className="text-white/90 mb-6">
              Consultez notre centre d'aide pour plus d'informations
            </p>
            <Link 
              href="/centre-aide" 
              className="inline-block bg-white text-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Centre d'aide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
