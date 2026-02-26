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
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getUnreadCount } from '@/lib/api/messaging';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { favorites } = useFavorites();
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token, isAuthenticated: isLoggedIn, logout } = useAuth();
  const { isConnected, on, off } = useSocket({
    enabled: !!token,
    token: token || undefined
  });
  
  const urlType = searchParams?.get('type');
  
  // Log de debug pour vérifier l'état d'authentification
  useEffect(() => {
    console.log('🔍 Header: État auth:', {
      hasUser: !!user,
      userId: user?.id,
      hasToken: !!token,
      isLoggedIn,
      unreadCount
    });
  }, [user, token, isLoggedIn, unreadCount]);
  
  // Charger le nombre de messages non lus depuis l'API
  const loadUnreadCount = useCallback(async () => {
    if (!isLoggedIn) {
      console.log('📊 Header: Non connecté, compteur = 0');
      setUnreadCount(0);
      return;
    }
    
    try {
      console.log('📊 Header: Chargement compteur messages...');
      const response = await getUnreadCount();
      console.log('📊 Header: Réponse API:', response);
      const count = response.data?.unreadCount || 0;
      console.log('📊 Header: Compteur chargé:', count);
      setUnreadCount(count);
    } catch (err) {
      console.error('❌ Erreur chargement compteur messages:', err);
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadUnreadCount();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  // Écouter les événements Socket.IO pour mettre à jour le compteur en temps réel
  useEffect(() => {
    if (!isConnected || !isLoggedIn) return;

    console.log('📡 Header: Écoute des événements Socket.IO pour compteur messages');

    // Nouveau message reçu → recharger le compteur
    const handleNewMessage = (message: any) => {
      console.log('📨 Header: Nouveau message reçu', message);
      // Ne compter que si le message n'est pas envoyé par l'utilisateur actuel
      const currentUserId = String(user?.id || '').trim();
      const messageSenderId = String(message.senderId || '').trim();
      console.log('📨 Header: Comparaison IDs:', { currentUserId, messageSenderId, isFromOther: messageSenderId !== currentUserId });
      
      if (messageSenderId !== currentUserId) {
        console.log('📨 Header: Message d\'un autre utilisateur, rechargement du compteur');
        loadUnreadCount();
      } else {
        console.log('📨 Header: Message envoyé par moi, pas de rechargement');
      }
    };

    // Conversation mise à jour → recharger le compteur
    const handleConversationUpdated = (data: any) => {
      console.log('🔄 Header: Conversation mise à jour', data);
      loadUnreadCount();
    };

    // Message marqué comme lu → recharger le compteur
    const handleMessageRead = () => {
      console.log('👁️ Header: Message marqué comme lu');
      loadUnreadCount();
    };

    // Compteur de non-lus a changé → recharger
    const handleUnreadCountChanged = () => {
      console.log('🔔 Header: Compteur de non-lus a changé');
      loadUnreadCount();
    };

    on('message:new', handleNewMessage);
    on('conversation:updated', handleConversationUpdated);
    on('message:read', handleMessageRead);
    on('unreadCount:changed', handleUnreadCountChanged);

    return () => {
      off('message:new', handleNewMessage);
      off('conversation:updated', handleConversationUpdated);
      off('message:read', handleMessageRead);
      off('unreadCount:changed', handleUnreadCountChanged);
    };
  }, [isConnected, isLoggedIn, user, loadUnreadCount, on, off]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
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
              {isLoggedIn && (
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
                {isLoggedIn && (
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
