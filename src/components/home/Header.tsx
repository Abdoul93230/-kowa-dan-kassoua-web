'use client';

import { Search, Menu, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold text-slate-900">MarketHub</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium transition-colors">
                Produits
              </a>
              <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium transition-colors">
                Services
              </a>
              <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium transition-colors">
                Catégories
              </a>
              <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium transition-colors">
                À propos
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center relative max-w-md">
              <Search className="absolute left-3 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher produits ou services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 bg-slate-50 border-slate-200 focus:border-emerald-500"
              />
            </div>

            <Button variant="outline" className="hidden md:inline-flex border-slate-200 hover:border-emerald-600 hover:text-emerald-600">
              Connexion
            </Button>
            <Button className="hidden md:inline-flex bg-emerald-600 hover:bg-emerald-700">
              Publier une annonce
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="lg:hidden pb-4">
          <div className="flex items-center relative">
            <Search className="absolute left-3 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-slate-50 border-slate-200"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
