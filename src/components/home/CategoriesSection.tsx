'use client';

import { useState, useEffect } from 'react';
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
  Palette,
  Briefcase,
  Gamepad2,
  HardHat,
  Package
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { getCategories, Category } from '@/lib/api/categories';

// Map des icônes Lucide par nom
const iconMap: Record<string, any> = {
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
  Palette,
  Briefcase,
  Gamepad2,
  HardHat,
  Package
};

export function CategoriesSection() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        // Prendre les 6 premières catégories pour l'affichage sur la page d'accueil
        setCategories(response.data.slice(0, 6));
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-5">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Explorez par catégorie
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 max-w-5xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-2 animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mb-1.5"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded mb-0.5"></div>
                  <div className="h-2 w-12 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-5">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Explorez par catégorie
          </h2>
         
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon || 'Package'] || Package;
            
            return (
              <Link href={`/categories/${category.slug}`} key={category._id}>
                <Card className="group cursor-pointer border-gray-200 hover:border-[#ec5a13] card-leboncoin">
                  <div className="p-2 flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full ${category.color || 'bg-gray-100 text-gray-600'} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-0.5 group-hover:text-[#ec5a13] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-[10px] text-gray-600">
                      {category.totalCount.toLocaleString()} offres
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-7">
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
