'use client';

// Carte d'annonce — rails et grilles de l'accueil (même présentation que l'app mobile)
import Link from 'next/link';
import { memo } from 'react';
import { MapPin, Package, Wrench, Zap } from 'lucide-react';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import type { CardItem } from '@/lib/api/home';
import { cityOf, formatPrice, hasPrice, imageSrcSet, productImage, sizedImage, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

const CONDITION_LABEL: Record<string, string> = { new: 'Neuf', refurbished: 'Reconditionné' };

interface ListingCardProps {
  item: CardItem;
  /** Largeur affichée approximative (px) : sert à charger l'image à la bonne taille */
  imageWidth?: number;
  priority?: boolean;
  className?: string;
}

function ListingCardBase({ item, imageWidth = 280, priority = false, className }: ListingCardProps) {
  const isService = item.type === 'service';
  const image = productImage(item);
  const badge = isService ? 'Service' : item.condition ? CONDITION_LABEL[item.condition] : undefined;
  const priceOk = hasPrice(item.price);

  return (
    <Link
      href={`/items/${item.id}`}
      // Pas de préchargement automatique : une page d'accueil affiche des dizaines de cartes
      prefetch={false}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white',
        'shadow-[0_8px_24px_-16px_rgba(15,23,42,0.28)] transition duration-300',
        'hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.35)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec5a13] focus-visible:ring-offset-2',
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-orange-50">
        {image ? (
          <img
            src={sizedImage(image, imageWidth)}
            srcSet={imageSrcSet(image, imageWidth)}
            alt={item.title}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-orange-300">
            {isService ? <Wrench className="h-9 w-9" /> : <Package className="h-9 w-9" />}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/30 to-transparent" />

        {badge ? (
          <span
            className={cn(
              'absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white',
              isService ? 'bg-blue-600' : 'bg-gray-900/80 backdrop-blur-sm'
            )}
          >
            {badge}
          </span>
        ) : null}

        {item.promoted || item.featured ? (
          <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#ec5a13] text-white shadow" title="À la une">
            <Zap className="h-3.5 w-3.5" />
          </span>
        ) : null}

        <div className="absolute right-2 top-2">
          <FavoriteButton productId={item.id} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p
          className={cn(
            'truncate text-[15px] font-extrabold tracking-tight',
            priceOk ? (isService ? 'text-blue-600' : 'text-[#ec5a13]') : 'text-gray-500'
          )}
        >
          {formatPrice(item.price)}
        </p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-[13.5px] font-medium leading-5 text-gray-900">
          {item.title}
        </h3>
        <div className="mt-2 flex items-center gap-1 text-[12px] text-gray-500">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{cityOf(item.location)}</span>
          <span className="mx-0.5 h-0.5 w-0.5 shrink-0 rounded-full bg-gray-400" />
          <span className="shrink-0" suppressHydrationWarning>{timeAgo(item.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export const ListingCard = memo(ListingCardBase);
