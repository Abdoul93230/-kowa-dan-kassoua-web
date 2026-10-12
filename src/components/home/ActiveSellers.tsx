'use client';

// Vendeurs actifs — avatars façon « stories », anneau orange s'ils ont publié dans les 24 h
import Link from 'next/link';
import type { HomeSeller } from '@/lib/api/home';
import { getInitials, sizedImage } from '@/lib/format';
import { cn } from '@/lib/utils';

export function ActiveSellers({ sellers }: { sellers: HomeSeller[] }) {
  if (!sellers.length) return null;
  return (
    <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 pt-1" role="list" aria-label="Vendeurs actifs">
      {sellers.map((seller) => {
        const name = seller.businessName || seller.name;
        return (
          <Link
            key={seller._id}
            href={`/seller/${seller._id}`}
            prefetch={false}
            role="listitem"
            className="group flex w-[76px] shrink-0 flex-col items-center gap-1.5 text-center focus-visible:outline-none"
          >
            <span
              className={cn(
                'rounded-full p-[3px] transition group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-[#ec5a13]',
                seller.isOnline ? 'bg-gradient-to-tr from-amber-400 via-[#ec5a13] to-[#b3420e]' : 'bg-gray-200'
              )}
            >
              <span className="block rounded-full bg-white p-[2px]">
                {seller.avatar ? (
                  <img
                    src={sizedImage(seller.avatar, 128)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ec5a13] to-[#b3420e] text-lg font-extrabold text-white">
                    {getInitials(name)}
                  </span>
                )}
              </span>
            </span>
            <span className="line-clamp-1 w-full text-[12.5px] font-semibold text-gray-900">{name}</span>
            <span className="-mt-1 text-[11px] text-gray-500">
              {seller.productCount} annonce{seller.productCount > 1 ? 's' : ''}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
