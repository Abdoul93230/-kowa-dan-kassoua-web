'use client';

// Galerie de la page annonce : grande image (fond flouté de la photo elle-même,
// pour ne jamais rogner un produit), glisser au doigt, miniatures, plein écran.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, ImageOff, X } from 'lucide-react';
import { imageSrcSet, sizedImage } from '@/lib/format';
import { cn } from '@/lib/utils';

export function ItemGallery({ images, title, overlay }: { images: string[]; title: string; overlay?: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback((dir: 1 | -1) => setIndex((i) => (i + dir + count) % count), [count]);

  // Flèches du clavier (et Échap en plein écran)
  useEffect(() => {
    if (count < 2 && !zoom) return undefined;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return;
      if (e.key === 'ArrowLeft' && count > 1) go(-1);
      if (e.key === 'ArrowRight' && count > 1) go(1);
      if (e.key === 'Escape') setZoom(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count, go, zoom]);

  useEffect(() => {
    if (!zoom) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => {
      touchX.current = e.touches[0].clientX;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current === null || count < 2) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touchX.current = null;
    },
  };

  if (!count) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-3xl bg-gray-100 text-gray-400">
        <ImageOff className="h-10 w-10" />
        <span className="text-sm font-medium">Pas de photo</span>
      </div>
    );
  }

  const current = images[index];

  return (
    <div>
      <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#0b1020] shadow-[0_30px_60px_-30px_rgba(6,10,20,0.6)]" {...swipe}>
        {/* Fond : la même photo floutée, pour habiller les photos verticales */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sizedImage(current, 96)} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
        <button type="button" onClick={() => setZoom(true)} className="absolute inset-0 cursor-zoom-in" aria-label="Agrandir la photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current}
            src={sizedImage(current, 1080)}
            srcSet={imageSrcSet(current, 1080)}
            alt={`${title}${count > 1 ? ` — photo ${index + 1}` : ''}`}
            className="relative h-full w-full object-contain animate-in fade-in duration-300"
            fetchPriority={index === 0 ? 'high' : 'auto'}
          />
        </button>

        {overlay ? <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 sm:p-4">{overlay}</div> : null}

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Photo précédente"
              className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg backdrop-blur transition hover:bg-white sm:flex sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Photo suivante"
              className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg backdrop-blur transition hover:bg-white sm:flex sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            {/* Points (mobile) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden">
              {images.map((_, i) => (
                <span key={i} className={cn('h-1.5 rounded-full bg-white transition-all', i === index ? 'w-5' : 'w-1.5 opacity-50')} />
              ))}
            </div>
          </>
        ) : null}

        <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur sm:inline-flex">
          <Expand className="h-3.5 w-3.5" />
          {count > 1 ? `${index + 1} / ${count}` : 'Agrandir'}
        </span>
      </div>

      {count > 1 ? (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Voir la photo ${i + 1}`}
              aria-current={i === index}
              className={cn(
                'relative h-16 w-20 shrink-0 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-[#f6f7fb] transition sm:h-[72px] sm:w-24',
                i === index ? 'ring-[#ec5a13]' : 'ring-transparent opacity-70 hover:opacity-100'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sizedImage(img, 192)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {/* Plein écran */}
      {zoom ? (
        <div role="dialog" aria-modal="true" aria-label="Photos de l'annonce" className="fixed inset-0 z-[100] flex flex-col bg-[#05070d]/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm font-semibold text-white/70">{count > 1 ? `${index + 1} / ${count}` : ''}</span>
            <button type="button" onClick={() => setZoom(false)} aria-label="Fermer" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 sm:px-16" onClick={() => setZoom(false)} {...swipe}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current}
              src={sizedImage(current, 1440)}
              alt={title}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-lg object-contain animate-in zoom-in-95 duration-200"
            />
            {count > 1 ? (
              <>
                <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Photo précédente" className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:flex">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Photo suivante" className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:flex">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
