'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showToast?: boolean;
}

export function FavoriteButton({ 
  productId, 
  size = 'md',
  className,
  showToast = true
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites();
  const [animating, setAnimating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Rediriger vers login si non connecté
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      setAnimating(true);
      await toggleFavorite(productId);
      
      // Reset animation après 300ms
      setTimeout(() => setAnimating(false), 300);
      
      // Toast optionnel
      if (showToast) {
        const message = isFavorite(productId) 
          ? 'Retiré des favoris' 
          : 'Ajouté aux favoris';
        // Vous pouvez ajouter un toast ici si vous avez un système de toast
        console.log(message);
      }
    } catch (error) {
      console.error('Erreur toggle favori:', error);
      setAnimating(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const favorite = isFavorite(productId);
  const loading = isToggling(productId);

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200',
        'bg-white/90 backdrop-blur-sm border-2 shadow-md hover:shadow-lg',
        favorite 
          ? 'border-red-500 hover:bg-red-50' 
          : 'border-gray-200 hover:border-[#ec5a13] hover:bg-orange-50',
        loading && 'opacity-50 cursor-not-allowed',
        animating && 'scale-110',
        sizeClasses[size],
        className
      )}
      aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart 
        className={cn(
          'transition-all duration-200',
          iconSizes[size],
          favorite 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-600 hover:text-[#ec5a13]',
          animating && 'animate-pulse'
        )} 
      />
    </button>
  );
}
