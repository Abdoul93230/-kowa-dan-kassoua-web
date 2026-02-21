'use client';

import { Menu, ShoppingBag, X, MessageSquare, Heart, User, LogOut, Settings, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { mockConversations } from '@/lib/mockData';
import { isAuthenticated, getCurrentUser, logout } from '@/lib/api/auth';
import { useFavorites } from '@/contexts/FavoritesContext';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { favorites } = useFavorites();
  
  const urlType = searchParams?.get('type');
  
  // Vérifier l'état de connexion au chargement
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }
    };
    
    checkAuth();
    
    // Écouter les changements de storage (connexion/déconnexion dans un autre onglet)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);
  
  // Calculer le nombre de messages non lus
  const unreadCount = mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
    setMobileMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
              onClick={() => handleNavigation(isLoggedIn ? '/publish' : '/login')}
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
              {isLoggedIn && (
                <button 
                  onClick={() => handleNavigation('/mes-annonces')}
                  className="relative text-gray-600 hover:text-[#ec5a13] font-medium transition-colors pb-1"
                >
                  Mes Annonces
                  {pathname === '/mes-annonces' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ec5a13]"></span>
                  )}
                </button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Bouton Favoris */}
            <Button 
              onClick={() => handleNavigation(isLoggedIn ? '/favoris' : '/login')}
              variant="ghost"
              size="icon"
              className="relative hidden md:inline-flex hover:bg-[#ffe9de] hover:text-[#ec5a13]"
            >
              <Heart className="h-5 w-5" />
              {isLoggedIn && favorites.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-[#ec5a13] text-white text-xs">
                  {favorites.length}
                </Badge>
              )}
            </Button>
            
            {/* Bouton Messages */}
            <Button 
              onClick={() => handleNavigation(isLoggedIn ? '/messages' : '/login')}
              variant="ghost"
              size="icon"
              className="relative hidden md:inline-flex hover:bg-[#ffe9de] hover:text-[#ec5a13]"
            >
              <MessageSquare className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-[#ec5a13] text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            
            {/* Menu utilisateur ou bouton connexion */}
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center gap-2 hover:bg-[#ffe9de]">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-[#ec5a13] text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email || user.phone}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNavigation('/mes-annonces')}>
                    <Package className="mr-2 h-4 w-4" />
                    Mes annonces
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation('/favoris')}>
                    <Heart className="mr-2 h-4 w-4" />
                    Favoris
                    {favorites.length > 0 && (
                      <Badge className="ml-auto bg-[#ec5a13] text-white text-xs">
                        {favorites.length}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation('/messages')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                    {unreadCount > 0 && (
                      <Badge className="ml-auto bg-[#ec5a13] text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => handleNavigation('/login')}
                variant="outline" 
                className="border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de] hidden md:inline-flex"
              >
                Connexion
              </Button>
            )}
            
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
              {isLoggedIn && (
                <button 
                  onClick={() => handleNavigation('/mes-annonces')}
                  className={`text-left font-medium transition-colors py-2 border-l-4 pl-3 ${
                    pathname === '/mes-annonces'
                      ? 'text-[#ec5a13] border-[#ec5a13] bg-[#ffe9de]/30'
                      : 'text-gray-600 border-transparent hover:text-[#ec5a13]'
                  }`}
                >
                  Mes Annonces
                </button>
              )}
              <button 
                onClick={() => handleNavigation(isLoggedIn ? '/favoris' : '/login')}
                className={`text-left font-medium transition-colors py-2 border-l-4 pl-3 flex items-center justify-between ${
                  pathname === '/favoris'
                    ? 'text-[#ec5a13] border-[#ec5a13] bg-[#ffe9de]/30'
                    : 'text-gray-600 border-transparent hover:text-[#ec5a13]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Favoris
                </span>
                {isLoggedIn && favorites.length > 0 && (
                  <Badge className="bg-[#ec5a13] text-white">
                    {favorites.length}
                  </Badge>
                )}
              </button>
              <button 
                onClick={() => handleNavigation(isLoggedIn ? '/messages' : '/login')}
                className={`text-left font-medium transition-colors py-2 border-l-4 pl-3 flex items-center justify-between ${
                  pathname === '/messages'
                    ? 'text-[#ec5a13] border-[#ec5a13] bg-[#ffe9de]/30'
                    : 'text-gray-600 border-transparent hover:text-[#ec5a13]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </span>
                {unreadCount > 0 && (
                  <Badge className="bg-[#ec5a13] text-white">
                    {unreadCount}
                  </Badge>
                )}
              </button>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => handleNavigation(isLoggedIn ? '/publish' : '/login')}
                  className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white w-full"
                >
                  Publier une annonce
                </Button>
                
                {isLoggedIn && user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-[#ffe9de]/30 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-[#ec5a13] text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email || user.phone}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleNavigation('/profile')}
                      variant="outline" 
                      className="w-full"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Button>
                    <Button 
                      onClick={handleLogout}
                      variant="outline" 
                      className="border-red-600 text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => handleNavigation('/login')}
                    variant="outline" 
                    className="border-[#ec5a13] text-[#ec5a13] hover:bg-[#ffe9de] w-full"
                  >
                    Connexion
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
