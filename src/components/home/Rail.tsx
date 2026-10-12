'use client';

// Rail horizontal (défilement tactile + flèches sur ordinateur) et en-tête de section
import Link from 'next/link';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = 'Voir tout',
  accent = 'orange',
}: {
  title: ReactNode;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  accent?: 'orange' | 'blue';
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          prefetch={false}
          className={cn(
            'group inline-flex shrink-0 items-center gap-1 text-sm font-bold',
            accent === 'blue' ? 'text-blue-600' : 'text-[#ec5a13]'
          )}
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function Rail({ children, label, itemClassName }: { children: ReactNode[]; label: string; itemClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return undefined;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, children]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        role="list"
        aria-label={label}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:gap-4"
      >
        {children.map((child, i) => (
          <div key={i} role="listitem" className={cn('shrink-0 snap-start', itemClassName)}>
            {child}
          </div>
        ))}
      </div>

      {/* Flèches (ordinateur) */}
      {!edges.start ? (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Précédent"
          className="absolute -left-3 top-[38%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition hover:text-[#ec5a13] md:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : null}
      {!edges.end ? (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Suivant"
          className="absolute -right-3 top-[38%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition hover:text-[#ec5a13] md:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
