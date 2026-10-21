'use client';

// Catégories — icônes 3D comme dans l'application mobile.
// Téléphone : une rangée qui défile · Ordinateur : une grille complète.
import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { HomeCategory } from '@/lib/api/home';
import { formatCompact } from '@/lib/format';
import { cn } from '@/lib/utils';

const countOf = (cat: HomeCategory) => cat.totalCount ?? (cat.productsCount || 0) + (cat.servicesCount || 0);

export function CategoryRail({ categories, city }: { categories: HomeCategory[]; city?: string }) {
  if (!categories.length) return null;
  const qs = city && city !== 'all' ? `?location=${encodeURIComponent(city)}` : '';

  return (
    <div
      role="list"
      aria-label="Catégories"
      className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 pt-1 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-3 lg:overflow-visible lg:px-0"
    >
      {categories.map((cat) => {
        const count = countOf(cat);
        return (
          <Link
            key={cat._id}
            role="listitem"
            href={`/categories/${cat.slug}${qs}`}
            prefetch={false}
            className={cn(
              'group relative flex w-[96px] shrink-0 flex-col items-center gap-2 rounded-3xl p-2 text-center transition',
              'lg:w-auto lg:items-start lg:gap-3 lg:border lg:border-gray-100 lg:bg-white lg:p-4 lg:text-left',
              'lg:shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)] lg:hover:-translate-y-1 lg:hover:border-orange-200 lg:hover:shadow-[0_22px_40px_-24px_rgba(236,90,19,0.45)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec5a13]'
            )}
          >
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border border-orange-100 bg-gradient-to-br from-white to-orange-50 transition group-hover:scale-105 lg:h-14 lg:w-14 lg:rounded-2xl">
              <CategoryIcon item={cat} size={44} className="lg:!h-9 lg:!w-9" />
            </span>
            <span className="min-w-0">
              <span className="line-clamp-1 text-[13px] font-semibold text-gray-900 lg:text-[15px] lg:font-bold">{cat.name}</span>
              <span className="hidden text-[13px] text-gray-500 lg:block">
                {count ? `${formatCompact(count)} annonce${count > 1 ? 's' : ''}` : 'Bientôt des annonces'}
              </span>
            </span>
            {count ? (
              <span className="absolute right-3 top-1.5 min-w-[22px] rounded-full bg-gray-900 px-1.5 py-0.5 text-[10px] font-extrabold text-white lg:hidden">
                {formatCompact(count)}
              </span>
            ) : null}
          </Link>
        );
      })}

      <Link
        role="listitem"
        href="/categories-list"
        prefetch={false}
        className="group flex w-[96px] shrink-0 flex-col items-center gap-2 rounded-3xl p-2 text-center transition lg:w-auto lg:items-start lg:justify-between lg:gap-3 lg:bg-gradient-to-br lg:from-[#ec5a13] lg:to-[#b3420e] lg:p-4 lg:text-left lg:text-white lg:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec5a13]"
      >
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-gradient-to-br from-[#ec5a13] to-[#b3420e] text-white lg:h-14 lg:w-14 lg:rounded-2xl lg:bg-white/15 lg:bg-none">
          <LayoutGrid className="h-7 w-7" />
        </span>
        <span className="flex items-center gap-1 text-[13px] font-bold text-gray-900 lg:text-[15px] lg:text-white">
          Toutes <ArrowRight className="hidden h-4 w-4 transition group-hover:translate-x-0.5 lg:block" />
        </span>
      </Link>
    </div>
  );
}
