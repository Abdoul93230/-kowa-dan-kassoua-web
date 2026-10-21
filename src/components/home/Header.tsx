'use client';

import { Menu, X, MessageSquare, Heart, User, LogOut, Package, ShieldCheck, Plus, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getUnreadCount } from '@/lib/api/messaging';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useQuickAuth } from '@/contexts/QuickAuthContext';

export function Header() {
  return (
    <Suspense fallback={<header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm" />}>
      <HeaderContent />
    </Suspense>
  );
}

function HeaderContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { favorites } = useFavorites();
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token, isAuthenticated: isLoggedIn, logout } = useAuth();
  const { openQuickAuth } = useQuickAuth();
  const { isConnected, on, off } = useSocket({
    enabled: !!token,
    token: token || undefined
  });
  
  const urlType = searchParams?.get('type');
  
  // ─── Compteur de messages non lus ───────────────────────────────────────────
  // Chargé une fois (et à chaque reconnexion), puis tenu à jour par le serveur qui
  // pousse le total dans « unreadCount:changed ». Repli : un rechargement par minute
  // seulement si le temps réel est indisponible.
  const loadingRef = useRef(false);
  const loadUnreadCount = useCallback(async () => {
    if (!isLoggedIn || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const response = await getUnreadCount();
      setUnreadCount(Number(response.data?.unreadCount || 0));
    } catch {
      // le compteur garde sa dernière valeur
    } finally {
      loadingRef.current = false;
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return undefined;
    }
    loadUnreadCount();
    if (isConnected) return undefined;
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isConnected, loadUnreadCount]);

  useEffect(() => {
    if (!isConnected || !isLoggedIn) return undefined;
    const handleUnreadChanged = (payload?: { unreadCount?: number }) => {
      if (typeof payload?.unreadCount === 'number') setUnreadCount(payload.unreadCount);
      else loadUnreadCount(); // ancien serveur sans total dans l'événement
    };
    on('unreadCount:changed', handleUnreadChanged);
    return () => off('unreadCount:changed', handleUnreadChanged);
  }, [isConnected, isLoggedIn, loadUnreadCount, on, off]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  // Navigation vers une page protégée : ouvre QuickAuth si non connecté
  const handleProtectedNav = (path: string) => {
    setMobileMenuOpen(false);
    if (!isLoggedIn) {
      openQuickAuth(path);
      return;
    }
    router.push(path);
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

  const isProducts = pathname === '/categories/tous' && urlType === 'product';
  const isServices = pathname === '/categories/tous' && urlType === 'service';
  const NAV = [
    { label: 'Produits', path: '/categories/tous?type=product', active: isProducts },
    { label: 'Services', path: '/categories/tous?type=service', active: isServices },
    { label: 'Catégories', path: '/categories-list', active: pathname === '/categories-list' },
    ...(isLoggedIn ? [{ label: 'Mes annonces', path: '/mes-annonces', active: pathname === '/mes-annonces' }] : []),
  ];

  const countBadge = (n: number) =>
    n > 0 ? (
      <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ec5a13] px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
        {n > 99 ? '99+' : n}
      </span>
    ) : null;

  const iconBtn =
    'relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec5a13]';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-6 lg:gap-8">
            <button type="button" onClick={() => handleNavigation('/')} className="flex shrink-0 items-center" aria-label="TakTak, accueil">
              <Image src="/branding/flogo-removebg-preview.png" alt="TakTak" width={150} height={56} className="-my-3 h-[4.5rem] w-auto object-contain" priority />
            </button>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
              {NAV.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavigation(item.path)}
                  aria-current={item.active ? 'page' : undefined}
                  className={`rounded-full px-3.5 py-2 text-[14.5px] font-semibold transition ${
                    item.active ? 'bg-orange-50 text-[#ec5a13]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button type="button" onClick={() => handleProtectedNav('/favoris')} className={`${iconBtn} hidden md:flex`} aria-label="Favoris">
              <Heart className="h-5 w-5" />
              {isLoggedIn ? countBadge(favorites.length) : null}
            </button>
            <button type="button" onClick={() => handleProtectedNav('/messages')} className={`${iconBtn} hidden md:flex`} aria-label="Messages">
              <MessageSquare className="h-5 w-5" />
              {isLoggedIn ? countBadge(unreadCount) : null}
            </button>

            <button
              type="button"
              onClick={() => handleProtectedNav('/publish')}
              className="ml-1 hidden h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ec5a13] to-[#c2410c] px-4 text-[14px] font-bold text-white shadow-md shadow-orange-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec5a13] focus-visible:ring-offset-2 md:flex"
            >
              <Plus className="h-4 w-4" /> Publier
            </button>

            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ml-1 hidden items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-3 transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec5a13] md:flex"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-[#ec5a13] to-[#b3420e] text-xs font-bold text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[9rem] truncate text-sm font-semibold text-gray-900">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-2xl p-1.5">
                  <DropdownMenuLabel className="px-2.5 py-2">
                    <p className="truncate font-semibold text-gray-900">{user.name}</p>
                    <p className="truncate text-xs font-normal text-gray-500">{user.email || user.phone}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-xl" onClick={() => handleNavigation('/mes-annonces')}>
                    <Package className="mr-2 h-4 w-4" /> Mes annonces
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl" onClick={() => handleNavigation('/favoris')}>
                    <Heart className="mr-2 h-4 w-4" /> Favoris
                    {favorites.length > 0 && <span className="ml-auto text-xs font-bold text-[#ec5a13]">{favorites.length}</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl" onClick={() => handleNavigation('/messages')}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Messages
                    {unreadCount > 0 && <span className="ml-auto text-xs font-bold text-[#ec5a13]">{unreadCount}</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl" onClick={() => handleNavigation('/profile')}>
                    <User className="mr-2 h-4 w-4" /> Mon profil
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem className="rounded-xl" onClick={() => handleNavigation('/admin')}>
                      <ShieldCheck className="mr-2 h-4 w-4" /> Administration
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-red-600 focus:bg-red-50 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                onClick={() => openQuickAuth('/')}
                className="ml-1 hidden h-10 items-center rounded-full border border-gray-300 px-4 text-[14px] font-bold text-gray-900 transition hover:border-gray-900 md:flex"
              >
                Connexion
              </button>
            )}

            {/* Téléphone : messages + menu */}
            <button type="button" onClick={() => handleProtectedNav('/messages')} className={`${iconBtn} md:hidden`} aria-label="Messages">
              <MessageSquare className="h-5 w-5" />
              {isLoggedIn ? countBadge(unreadCount) : null}
            </button>
            <button
              type="button"
              className={`${iconBtn} md:hidden`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu téléphone */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-100 pb-5 pt-3 md:hidden">
            {isLoggedIn && user ? (
              <button
                type="button"
                onClick={() => handleNavigation('/profile')}
                className="mb-3 flex w-full items-center gap-3 rounded-2xl bg-gray-50 p-3 text-left"
              >
                <Avatar className="h-11 w-11">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-[#ec5a13] to-[#b3420e] font-bold text-white">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-gray-900">{user.name}</span>
                  <span className="block truncate text-xs text-gray-500">Voir mon profil</span>
                </span>
              </button>
            ) : null}

            <nav className="grid gap-1" aria-label="Menu">
              {NAV.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavigation(item.path)}
                  className={`rounded-xl px-3 py-3 text-left font-semibold transition ${item.active ? 'bg-orange-50 text-[#ec5a13]' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {item.label}
                </button>
              ))}
              <button type="button" onClick={() => handleProtectedNav('/favoris')} className="flex items-center justify-between rounded-xl px-3 py-3 text-left font-semibold text-gray-700 hover:bg-gray-50">
                <span className="flex items-center gap-2"><Heart className="h-4 w-4" /> Favoris</span>
                {isLoggedIn && favorites.length > 0 ? <span className="text-sm font-bold text-[#ec5a13]">{favorites.length}</span> : null}
              </button>
              {isLoggedIn && user?.role === 'admin' ? (
                <button type="button" onClick={() => handleNavigation('/admin')} className="flex items-center gap-2 rounded-xl px-3 py-3 text-left font-semibold text-gray-700 hover:bg-gray-50">
                  <ShieldCheck className="h-4 w-4" /> Administration
                </button>
              ) : null}
            </nav>

            <div className="mt-4 grid gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => handleProtectedNav('/publish')}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ec5a13] to-[#c2410c] font-bold text-white"
              >
                <Plus className="h-5 w-5" /> Publier une annonce
              </button>
              {isLoggedIn && user ? (
                <button type="button" onClick={handleLogout} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 font-semibold text-red-600">
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              ) : (
                <button type="button" onClick={() => openQuickAuth('/')} className="h-12 rounded-2xl border border-gray-300 font-bold text-gray-900">
                  Connexion
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
