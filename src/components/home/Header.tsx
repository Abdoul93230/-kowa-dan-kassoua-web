'use client';

import { Menu, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const urlType = searchParams?.get('type');

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 md:gap-8">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavigation('/')}
            >
              <ShoppingBag className="h-8 w-8 text-[#ec5a13]" />
              <span className="text-2xl font-bold text-gray-900">MarketHub</span>
            </div>

            <Button 
              onClick={() => handleNavigation('/publish')}
              className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white hidden md:inline-flex"
            >
              Publier une annonce
            </Button>

            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => handleNavigation('/categories/tous?type=product')}
                className="relative text-gray-600 hover:text-[#ec5a13] font-medium transition-colors pb-1"
              >
                Produits
                {pathname === '/categories/tous' && urlType === 'product' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ec5a13]"></span>
                )}
              </button>
              <button 
                onClick={() => handleNavigation('/categories/tous?type=service')}
                className="relative text-gray-600 hover:text-[#ec5a13] font-medium transition-colors pb-1"
              >
                Services
                {pathname === '/categories/tous' && urlType === 'service' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ec5a13]"></span>
                )}
              </button>
              <button 
                onClick={() => handleNavigation('/categories-list')}
                className="relative text-gray-600 hover:text-[#ec5a13] font-medium transition-colors pb-1"
              >
                Catégories
                {pathname === '/categories-list' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ec5a13]"></span>
                )}
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
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
                className={`text-left font-medium transition-colors py-2 border-l-4 pl-3 ${
                  pathname === '/categories/tous' && urlType === 'product'
                    ? 'text-[#ec5a13] border-[#ec5a13] bg-[#ffe9de]/30'
                    : 'text-gray-600 border-transparent hover:text-[#ec5a13]'
                }`}
              >
                Produits
              </button>
              <button 
                onClick={() => handleNavigation('/categories/tous?type=service')}
                className={`text-left font-medium transition-colors py-2 border-l-4 pl-3 ${
                  pathname === '/categories/tous' && urlType === 'service'
                    ? 'text-[#ec5a13] border-[#ec5a13] bg-[#ffe9de]/30'
                    : 'text-gray-600 border-transparent hover:text-[#ec5a13]'
                }`}
              >
                Services
              </button>
              <button 
                onClick={() => handleNavigation('/categories-list')}
                className={`text-left font-medium transition-colors py-2 border-l-4 pl-3 ${
                  pathname === '/categories-list'
                    ? 'text-[#ec5a13] border-[#ec5a13] bg-[#ffe9de]/30'
                    : 'text-gray-600 border-transparent hover:text-[#ec5a13]'
                }`}
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
