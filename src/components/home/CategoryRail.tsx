'use client';

// Catégories — tuiles icône sur une ligne défilante (comme l'app mobile)
import Link from 'next/link';
import {
  Baby, Book, Briefcase, Car, Dumbbell, Gamepad2, HardHat, Home, LayoutGrid, Laptop, MoreHorizontal,
  Package, Palette, PawPrint, Shirt, Smartphone, UtensilsCrossed, Wrench, type LucideIcon,
} from 'lucide-react';
import type { HomeCategory } from '@/lib/api/home';
import { formatCompact } from '@/lib/format';

const ICONS: Record<string, LucideIcon> = {
  Smartphone, UtensilsCrossed, Home, Car, Shirt, Wrench, Laptop, Dumbbell, Baby, PawPrint,
  Book, Palette, Briefcase, Gamepad2, HardHat, Package, MoreHorizontal,
};

function Tile({ href, label, count, Icon, highlight = false }: { href: string; label: string; count?: number; Icon: LucideIcon; highlight?: boolean }) {
  return (
    <Link href={href} prefetch={false} className="group flex w-[84px] flex-col items-center gap-2 text-center focus-visible:outline-none">
      <span
        className={
          highlight
            ? 'relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#ec5a13] to-[#b3420e] text-white shadow-lg shadow-orange-500/25 transition group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-[#ec5a13] group-focus-visible:ring-offset-2'
            : 'relative flex h-16 w-16 items-center justify-center rounded-[22px] border border-orange-100 bg-orange-50 text-[#ec5a13] transition group-hover:-translate-y-0.5 group-hover:border-orange-200 group-hover:bg-orange-100 group-focus-visible:ring-2 group-focus-visible:ring-[#ec5a13] group-focus-visible:ring-offset-2'
        }
      >
        <Icon className="h-6 w-6" />
        {count ? (
          <span className="absolute -right-1.5 -top-1.5 min-w-[22px] rounded-full bg-gray-900 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
            {formatCompact(count)}
          </span>
        ) : null}
      </span>
      <span className="line-clamp-1 w-full text-[12.5px] font-semibold text-gray-800">{label}</span>
    </Link>
  );
}

export function CategoryRail({ categories }: { categories: HomeCategory[] }) {
  if (!categories.length) return null;
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-2" role="list" aria-label="Catégories">
      <div role="listitem"><Tile href="/categories-list" label="Toutes" Icon={LayoutGrid} highlight /></div>
      {categories.map((cat) => (
        <div role="listitem" key={cat._id}>
          <Tile
            href={`/categories/${cat.slug}`}
            label={cat.name}
            count={cat.totalCount ?? (cat.productsCount || 0) + (cat.servicesCount || 0)}
            Icon={ICONS[cat.icon || ''] || Package}
          />
        </div>
      ))}
    </div>
  );
}
