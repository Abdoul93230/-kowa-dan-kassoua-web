'use client';

import { Trash2, Shield, Database, Clock, Mail, AlertTriangle, CheckCircle2, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function DeleteAccountDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="bg-gradient-to-r from-orange-400 to-orange-300 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Trash2 className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Suppression de compte</h1>
            <p className="text-lg text-white/90">
              Informations détaillées sur la suppression de votre compte TakTak
            </p>
            <p className="text-sm text-white/80 mt-2">Dernière mise à jour : Septembre 2026</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-orange-100 rounded-lg p-3">
                <Shield className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre droit à la suppression</h2>
                <p className="text-gray-600 leading-relaxed">
                  Conformément à nos conditions d&apos;utilisation, à la politique de confidentialité et aux
                  exigences de Google Play et de l&apos;App Store, vous avez le droit de supprimer votre
                  compte TakTak et les données qui y sont associées, à tout moment et sans condition.
                </p>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                Vous pouvez supprimer votre compte de deux façons :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-gray-600 text-sm">
                <li>
                  Directement depuis l&apos;application, via{' '}
                  <span className="font-semibold text-gray-900">Profil &gt; Paramètres &gt; Supprimer mon compte</span>
                </li>
                <li>
                  Depuis notre page web :{' '}
                  <Link href="/delete-account" className="text-orange-500 hover:underline font-semibold">
                    taktak-ne.com/delete-account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Ce qui est supprimé */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-red-50 rounded-lg p-3">
                <Database className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Données supprimées définitivement</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Lorsque vous confirmez la suppression de votre compte, les données suivantes sont
              immédiatement et définitivement effacées de nos serveurs :
            </p>
            <ul className="space-y-3">
              {[
                'Votre profil : nom, numéro de téléphone, adresse email, photo de profil, informations business',
                'Toutes vos annonces (produits et services) ainsi que leurs photos',
                'Toutes vos conversations et messages (texte, images, audio)',
                'Tous vos favoris',
                'Tous vos avis et évaluations publiés',
                'Vos jetons de notification push (Firebase / Expo)',
                "Vos jetons d'authentification (JWT / refresh tokens)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Données conservées */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Données conservées temporairement</h2>
            </div>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Certaines données peuvent être conservées temporairement pour des raisons légales
                ou de sécurité :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <span className="font-semibold text-gray-900">Journaux techniques (logs) :</span> conservés
                  au maximum 90 jours pour détecter les abus et sécuriser la plateforme
                </li>
                <li>
                  <span className="font-semibold text-gray-900">Données liées à des litiges ou obligations légales :</span>{' '}
                  conservées le temps nécessaire pour répondre à une réquisition judiciaire ou réglementaire
                </li>
              </ul>
              <p className="text-sm">
                Ces données ne sont jamais utilisées à des fins commerciales et ne sont pas
                associées à votre compte supprimé.
              </p>
            </div>
          </div>

          {/* Délais */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Délai de traitement</h2>
            </div>
            <div className="space-y-3 text-gray-600 leading-relaxed">
              <p>
                <span className="font-semibold text-gray-900">Suppression immédiate :</span> lorsque vous
                confirmez la suppression depuis l&apos;application ou la page web, votre compte et vos
                données sont supprimés immédiatement de la base de données active.
              </p>
              <p>
                <span className="font-semibold text-gray-900">Demande par email :</span> si vous passez par
                notre support, votre demande est traitée dans un délai maximum de{' '}
                <span className="font-semibold text-gray-900">48 heures</span>.
              </p>
            </div>
          </div>

          {/* Avertissement */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 rounded-lg p-3 flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">⚠️ Cette action est irréversible</h2>
                <div className="space-y-2 text-gray-700 text-sm leading-relaxed">
                  <p>Avant de supprimer votre compte, veuillez noter :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>La suppression est <span className="font-semibold">définitive</span> : elle ne peut pas être annulée</li>
                    <li>Vos annonces actives seront retirées et ne pourront pas être récupérées</li>
                    <li>Vous ne pourrez plus discuter avec vos contacts existants</li>
                    <li>Si vous souhaitez revenir plus tard, vous devrez recréer un compte avec un numéro de téléphone</li>
                  </ul>
                  <p>
                    Si vous rencontrez un problème (harcèlement, erreur, piratage...), pensez plutôt à{' '}
                    <Link href="/centre-aide" className="text-orange-500 hover:underline font-semibold">
                      contacter notre support
                    </Link>{' '}
                    avant de supprimer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comment supprimer depuis le mobile */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-orange-50 rounded-lg p-3">
                <Smartphone className="h-6 w-6 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Supprimer depuis l&apos;application mobile</h2>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 leading-relaxed ml-4">
              <li>Ouvrez l&apos;application TakTak</li>
              <li>Allez dans votre <span className="font-semibold text-gray-900">Profil</span></li>
              <li>Appuyez sur <span className="font-semibold text-gray-900">Paramètres</span></li>
              <li>Sélectionnez <span className="font-semibold text-gray-900">Supprimer mon compte</span></li>
              <li>Confirmez votre choix (une double confirmation vous sera demandée)</li>
            </ol>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-300 rounded-2xl shadow-lg p-8 text-white">
            <div className="text-center">
              <Mail className="h-10 w-10 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Besoin d&apos;aide pour supprimer votre compte ?</h2>
              <p className="text-white/90 mb-6">
                Si vous avez perdu l&apos;accès à votre compte (numéro changé, mot de passe oublié...),
                notre support peut effectuer la suppression pour vous.
              </p>
              <div className="space-y-2">
                <p>
                  📧 Email :{' '}
                  <a href="mailto:support@taktak-ne.com" className="underline">support@taktak-ne.com</a>
                </p>
                <p>
                  📱 Téléphone :{' '}
                  <a href="tel:+22787727501" className="underline">+227 87 72 75 01</a>
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/delete-account"
                  className="inline-flex items-center gap-2 bg-white text-orange-500 font-semibold px-6 py-3 rounded-xl shadow hover:bg-orange-50 transition"
                >
                  <Trash2 className="h-5 w-5" />
                  Accéder à la page de suppression
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}