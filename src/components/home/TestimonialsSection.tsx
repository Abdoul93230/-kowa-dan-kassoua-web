'use client';

import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    id: 1,
    name: 'Amadou Diallo',
    role: 'Entrepreneur',
    location: 'Dakar, Sénégal',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    comment: 'MarketHub m\'a permis de développer mon activité de vente de produits électroniques. Interface simple et clients satisfaits. Je recommande vivement !',
  },
  {
    id: 2,
    name: 'Fatou Ndiaye',
    role: 'Prestataire de services',
    location: 'Abidjan, Côte d\'Ivoire',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    comment: 'Excellente plateforme pour promouvoir mes services de coiffure à domicile. J\'ai doublé ma clientèle en 3 mois. Merci MarketHub !',
  },
  {
    id: 3,
    name: 'Moussa Koné',
    role: 'Acheteur régulier',
    location: 'Bamako, Mali',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    comment: 'Je trouve toujours ce que je cherche sur MarketHub. Les transactions sont sécurisées et les vendeurs professionnels. Une vraie révolution !',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ce que nos utilisateurs disent
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Des milliers d'utilisateurs font confiance à MarketHub pour leurs achats et ventes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="relative p-6 border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-emerald-500"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-emerald-200" />

              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 border-2 border-emerald-100">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-slate-700 leading-relaxed mb-3">
                "{testimonial.comment}"
              </p>

              <p className="text-sm text-slate-500">{testimonial.location}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
