'use client';

import { HelpCircle, Search, MessageCircle, ShoppingBag, User, CreditCard, Shield, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CentreAidePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: User,
      title: 'Compte et inscription',
      color: 'blue',
      questions: [
        { q: 'Comment créer un compte ?', a: 'Cliquez sur "S\'inscrire" en haut de la page, remplissez le formulaire avec vos informations (nom, téléphone, email, mot de passe). Vous recevrez un code OTP par SMS pour valider votre compte.' },
        { q: 'J\'ai oublié mon mot de passe', a: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Entrez votre numéro de téléphone, vous recevrez un code par SMS pour réinitialiser votre mot de passe.' },
        { q: 'Comment modifier mes informations ?', a: 'Connectez-vous à votre compte, allez dans "Profil" et cliquez sur "Modifier". Vous pouvez changer votre nom, email, photo de profil et autres informations.' },
        { q: 'Comment supprimer mon compte ?', a: 'Contactez notre support via email ou téléphone pour demander la suppression de votre compte. Nous traiterons votre demande dans les 48 heures.' },
      ]
    },
    {
      icon: ShoppingBag,
      title: 'Publier une annonce',
      color: 'orange',
      questions: [
        { q: 'Comment publier une annonce ?', a: 'Connectez-vous, cliquez sur "Publier une annonce", remplissez le formulaire (titre, catégorie, prix, description), ajoutez des photos et publiez.' },
        { q: 'Combien de photos puis-je ajouter ?', a: 'Vous pouvez ajouter jusqu\'à 5 photos par annonce. Assurez-vous que les photos soient claires et montrent bien le produit.' },
        { q: 'Comment modifier mon annonce ?', a: 'Allez dans "Mes annonces", trouvez l\'annonce à modifier, cliquez sur "Modifier" et enregistrez vos changements.' },
        { q: 'Comment supprimer une annonce ?', a: 'Dans "Mes annonces", cliquez sur les trois points à côté de l\'annonce et sélectionnez "Supprimer".' },
        { q: 'Pourquoi mon annonce n\'apparaît pas ?', a: 'Votre annonce est peut-être en cours de vérification. Si elle ne s\'affiche pas après 24h, contactez le support.' },
      ]
    },
    {
      icon: MessageCircle,
      title: 'Messagerie et communication',
      color: 'green',
      questions: [
        { q: 'Comment contacter un vendeur ?', a: 'Sur la page de l\'annonce, cliquez sur "Contacter". Vous serez redirigé vers la messagerie pour discuter avec le vendeur.' },
        { q: 'Mes messages ne s\'envoient pas', a: 'Vérifiez votre connexion internet. Si le problème persiste, actualisez la page ou reconnectez-vous.' },
        { q: 'Comment bloquer un utilisateur ?', a: 'Dans la conversation, cliquez sur le nom de l\'utilisateur puis sur "Bloquer". Vous ne recevrez plus de messages de cette personne.' },
        { q: 'Comment signaler un comportement abusif ?', a: 'Dans la conversation ou sur l\'annonce, cliquez sur "Signaler" et expliquez le problème. Notre équipe examinera le signalement.' },
      ]
    },
    {
      icon: CreditCard,
      title: 'Paiement et transactions',
      color: 'purple',
      questions: [
        { q: 'Comment se passe le paiement ?', a: 'Le paiement se fait directement entre acheteur et vendeur. MarketHub ne gère pas les transactions financières.' },
        { q: 'Quels sont les modes de paiement ?', a: 'Les modes de paiement sont convenus entre acheteur et vendeur (espèces, mobile money, virement, etc.).' },
        { q: 'La publication d\'annonces est-elle payante ?', a: 'Non, la publication d\'annonces est gratuite sur MarketHub.' },
        { q: 'Y a-t-il des frais cachés ?', a: 'Non, notre plateforme est entièrement gratuite pour les utilisateurs.' },
      ]
    },
    {
      icon: Shield,
      title: 'Sécurité et confiance',
      color: 'red',
      questions: [
        { q: 'Comment éviter les arnaques ?', a: 'Ne payez jamais avant d\'avoir vu le produit. Privilégiez les rencontres en lieu public. Utilisez uniquement la messagerie de MarketHub.' },
        { q: 'Comment vérifier un vendeur ?', a: 'Consultez les évaluations et avis laissés par d\'autres acheteurs. Un vendeur avec de bonnes notes est généralement fiable.' },
        { q: 'Que faire en cas de litige ?', a: 'Essayez d\'abord de résoudre le problème directement avec l\'autre partie. Si cela échoue, contactez notre support avec les détails.' },
        { q: 'Comment signaler une annonce suspecte ?', a: 'Sur la page de l\'annonce, cliquez sur "Signaler" et indiquez le problème. Nous examinerons l\'annonce rapidement.' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-300 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <HelpCircle className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Centre d'aide
            </h1>
            <p className="text-lg text-white/90 mb-8">
              Trouvez des réponses à vos questions
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          {categories.map((category, idx) => {
            const Icon = category.icon;
            const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
              blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
              orange: { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-200' },
              green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
              purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
              red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
            };
            const colors = colorClasses[category.color];

            return (
              <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b">
                  <div className="flex items-center gap-4">
                    <div className={`${colors.bg} rounded-xl p-3`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {category.questions.map((item, qIdx) => (
                      <details key={qIdx} className="group">
                        <summary className="flex items-start justify-between cursor-pointer list-none p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
                          <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="px-4 pb-4 pt-2">
                          <p className="text-gray-600 leading-relaxed">{item.a}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="max-w-5xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-orange-400 to-orange-300 rounded-2xl shadow-lg p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Vous ne trouvez pas votre réponse ?</h2>
              <p className="text-white/90 text-lg">
                Notre équipe est là pour vous aider
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Mail className="h-8 w-8 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Par email</h3>
                <p className="text-white/80 mb-3">Réponse sous 24h</p>
                <a href="mailto:contact@markethub.com" className="text-white underline">
                  contact@markethub.com
                </a>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Phone className="h-8 w-8 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Par téléphone</h3>
                <p className="text-white/80 mb-3">Lundi - Vendredi : 9h - 18h</p>
                <a href="tel:+221771234567" className="text-white underline">
                  +221 77 123 45 67
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
