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
import Link from "next/link";
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'Electronique', icon: Smartphone, count: '2,453', color: 'bg-blue-100 text-blue-600', slug: 'electronique' },
  { name: 'Alimentation', icon: UtensilsCrossed, count: '1,834', color: 'bg-orange-100 text-orange-600', slug: 'alimentation' },
  { name: 'Immobilier', icon: Home, count: '987', color: 'bg-green-100 text-green-600', slug: 'immobilier' },
  { name: 'Automobile', icon: Car, count: '1,256', color: 'bg-red-100 text-red-600', slug: 'vehicules' },
  { name: 'Mode & Beauté', icon: Shirt, count: '3,421', color: 'bg-pink-100 text-pink-600', slug: 'mode' },
  { name: 'Services à domicile', icon: Wrench, count: '1,643', color: 'bg-emerald-100 text-emerald-600', slug: 'services-domicile' },
  // { name: 'Informatique', icon: Laptop, count: '2,178', color: 'bg-slate-100 text-slate-600', slug: 'informatique' },
  // { name: 'Sport & Loisirs', icon: Dumbbell, count: '1,532', color: 'bg-amber-100 text-amber-600', slug: 'loisirs' },
  // { name: 'Enfants & Bébés', icon: Baby, count: '1,089', color: 'bg-purple-100 text-purple-600', slug: 'enfants' },
  // { name: 'Animaux', icon: PawPrint, count: '876', color: 'bg-teal-100 text-teal-600', slug: 'animaux' },
  // { name: 'Livres & Média', icon: Book, count: '1,234', color: 'bg-indigo-100 text-indigo-600', slug: 'livres' },
  // { name: 'Art & Collection', icon: Palette, count: '654', color: 'bg-rose-100 text-rose-600', slug: 'art' },
];

export function CategoriesSection() {
  const router = useRouter();

  return (
    <section className="py-5 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explorez par catégorie
          </h2>
         
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link href={`/categories/${category.slug}`} key={category.name}>
            <Card
              className="group cursor-pointer border-gray-200 hover:border-[#ec5a13] card-leboncoin"
            >
              <div className="p-2 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-[#ec5a13] transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-600">{category.count} offres</p>
              </div>
            </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link 
            href="/categories-list"
            className="link-orange text-lg font-medium inline-flex items-center gap-2 hover:gap-3 transition-all"
          >
            Voir toutes les catégories
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
