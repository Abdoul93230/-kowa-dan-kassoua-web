'use client';

import {
  Smartphone,
  UtensilsCrossed,
  Home,
  Car,
  Shirt,
  Wrench,
  Laptop,
  Dumbbell,
  Baby,
  PawPrint,
  Book,
  Palette
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const categories = [
  { name: 'Électronique', icon: Smartphone, count: '2,453', color: 'bg-blue-100 text-blue-600' },
  { name: 'Alimentation', icon: UtensilsCrossed, count: '1,834', color: 'bg-orange-100 text-orange-600' },
  { name: 'Immobilier', icon: Home, count: '987', color: 'bg-green-100 text-green-600' },
  { name: 'Automobile', icon: Car, count: '1,256', color: 'bg-red-100 text-red-600' },
  { name: 'Mode & Beauté', icon: Shirt, count: '3,421', color: 'bg-pink-100 text-pink-600' },
  { name: 'Services à domicile', icon: Wrench, count: '1,643', color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Informatique', icon: Laptop, count: '2,178', color: 'bg-slate-100 text-slate-600' },
  { name: 'Sport & Loisirs', icon: Dumbbell, count: '1,532', color: 'bg-amber-100 text-amber-600' },
  { name: 'Enfants & Bébés', icon: Baby, count: '1,089', color: 'bg-purple-100 text-purple-600' },
  { name: 'Animaux', icon: PawPrint, count: '876', color: 'bg-teal-100 text-teal-600' },
  { name: 'Livres & Média', icon: Book, count: '1,234', color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Art & Collection', icon: Palette, count: '654', color: 'bg-rose-100 text-rose-600' },
];

export function CategoriesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Explorez par catégorie
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Découvrez des milliers de produits et services organisés dans des catégories pour faciliter votre recherche
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card
              key={category.name}
              className="group cursor-pointer border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="p-6 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500">{category.count} offres</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-4">
            Voir toutes les catégories
          </button>
        </div>
      </div>
    </section>
  );
}
