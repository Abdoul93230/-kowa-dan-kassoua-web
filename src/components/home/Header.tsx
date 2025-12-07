'use client';

import { Menu, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavigation('/')}
            >
              <ShoppingBag className="h-8 w-8 text-[#ec5a13]" />
              <span className="text-2xl font-bold text-gray-900">MarketHub</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => handleNavigation('/categories/tous?type=product')}
                className="text-gray-600 hover:text-[#ec5a13] font-medium transition-colors"
              >
                Produits
              </button>
              <button 
                onClick={() => handleNavigation('/categories/tous?type=service')}
                className="text-gray-600 hover:text-[#ec5a13] font-medium transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => handleNavigation('/categories-list')}
                className="text-gray-600 hover:text-[#ec5a13] font-medium transition-colors"
              >
                Catégories
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={() => handleNavigation('/publish')}
              className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white hidden md:inline-flex"
            >
              Publier une annonce
            </Button>
            <Button 
              onClick={() => handleNavigation('/login')}
              variant="outline" 
              className="border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de] hidden md:inline-flex"
            >
              Connexion
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <button 
                onClick={() => handleNavigation('/categories/tous?type=product')}
                className="text-left text-gray-600 hover:text-[#ec5a13] font-medium transition-colors py-2"
              >
                Produits
              </button>
              <button 
                onClick={() => handleNavigation('/categories/tous?type=service')}
                className="text-left text-gray-600 hover:text-[#ec5a13] font-medium transition-colors py-2"
              >
                Services
              </button>
              <button 
                onClick={() => handleNavigation('/categories-list')}
                className="text-left text-gray-600 hover:text-[#ec5a13] font-medium transition-colors py-2"
              >
                Catégories
              </button>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => handleNavigation('/publish')}
                  className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white w-full"
                >
                  Publier une annonce
                </Button>
                <Button 
                  onClick={() => handleNavigation('/login')}
                  variant="outline" 
                  className="border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de] w-full"
                >
                  Connexion
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
