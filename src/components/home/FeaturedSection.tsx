'use client';

import { Star, MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const featuredProducts = [
  {
    id: 1,
    title: 'iPhone 14 Pro Max 256GB',
    price: '850 000 FCFA',
    location: 'Dakar, Sénégal',
    image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Électronique',
    type: 'product',
    rating: 4.8,
    seller: 'Tech Store Pro',
    promoted: true,
    postedTime: '2h',
  },
  {
    id: 2,
    title: 'Réparation & Maintenance Informatique',
    price: 'À partir de 15 000 FCFA',
    location: 'Abidjan, Côte d\'Ivoire',
    image: 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Services',
    type: 'service',
    rating: 4.9,
    seller: 'IT Solutions',
    promoted: false,
    postedTime: '5h',
  },
  {
    id: 3,
    title: 'Appartement 3 pièces meublé',
    price: '250 000 FCFA/mois',
    location: 'Lomé, Togo',
    image: 'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Immobilier',
    type: 'product',
    rating: 4.6,
    seller: 'ImmoPlus',
    promoted: true,
    postedTime: '1j',
  },
  {
    id: 4,
    title: 'Service de Plomberie 24/7',
    price: 'À partir de 20 000 FCFA',
    location: 'Cotonou, Bénin',
    image: 'https://images.pexels.com/photos/8961186/pexels-photo-8961186.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Services à domicile',
    type: 'service',
    rating: 4.7,
    seller: 'Pro Plomberie',
    promoted: false,
    postedTime: '3h',
  },
  {
    id: 5,
    title: 'Toyota Corolla 2020',
    price: '8 500 000 FCFA',
    location: 'Ouagadougou, Burkina Faso',
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Automobile',
    type: 'product',
    rating: 4.5,
    seller: 'Auto Prestige',
    promoted: false,
    postedTime: '6h',
  },
  {
    id: 6,
    title: 'Cours particuliers Mathématiques',
    price: '12 000 FCFA/heure',
    location: 'Niamey, Niger',
    image: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Éducation',
    type: 'service',
    rating: 4.9,
    seller: 'Éducation Plus',
    promoted: true,
    postedTime: '4h',
  },
];

export function FeaturedSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Offres populaires et promotions
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Découvrez notre sélection des meilleures offres du moment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((item) => (
            <Card
              key={item.id}
              className="group cursor-pointer overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-56 overflow-hidden bg-slate-200">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {item.promoted && (
                  <Badge className="absolute top-3 left-3 bg-emerald-600 hover:bg-emerald-700">
                    En vedette
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="absolute top-3 right-3 bg-white/90 text-slate-900"
                >
                  {item.category}
                </Badge>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-lg text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
                  {item.title}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-slate-700">{item.rating}</span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <span className="text-sm text-slate-600">{item.seller}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{item.location}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{item.price}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>Il y a {item.postedTime}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg">
            Voir toutes les offres
          </button>
        </div>
      </div>
    </section>
  );
}
