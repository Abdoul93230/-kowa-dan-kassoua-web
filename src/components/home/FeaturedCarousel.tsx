'use client';

// « À la une » — grandes cartes photo. Défilement automatique en aller-retour
// (jusqu'au bout, puis retour au début), comme dans l'application mobile.
// Pause au survol, au focus clavier et quand l'onglet n'est pas visible.
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, MapPin, TrendingUp, Zap } from 'lucide-react';
import type { CardItem } from '@/lib/api/home';
import { cityOf, formatPrice, imageSrcSet, productImage, sizedImage } from '@/lib/format';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 4500;

export function FeaturedCarousel({ items, tone = 'light' }: { items: CardItem[]; tone?: 'light' | 'dark' }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, align: 'start', containScroll: 'keepSnaps' });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const paused = useRef(false);
  const direction = useRef<1 | -1>(1);
  const dark = tone === 'dark';

  useEffect(() => {
    if (!embla) return undefined;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    const onInit = () => { setSnaps(embla.scrollSnapList()); onSelect(); };
    onInit();
    embla.on('select', onSelect);
    embla.on('reInit', onInit);
    return () => {
      embla.off('select', onSelect);
      embla.off('reInit', onInit);
    };
  }, [embla]);

  // Aller-retour : on change de sens en arrivant à une extrémité
  useEffect(() => {
    if (!embla || items.length < 2) return undefined;
    const timer = setInterval(() => {
      if (paused.current || document.visibilityState !== 'visible') return;
      if (direction.current === 1 && !embla.canScrollNext()) direction.current = -1;
      else if (direction.current === -1 && !embla.canScrollPrev()) direction.current = 1;
      if (direction.current === 1) embla.scrollNext(); else embla.scrollPrev();
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [embla, items.length]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  if (!items.length) return null;

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="Annonces à la une"
      className="relative"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      onFocusCapture={() => { paused.current = true; }}
      onBlurCapture={() => { paused.current = false; }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
      }}
    >
      <div ref={emblaRef} className="overflow-hidden rounded-[1.75rem]">
        <div className="-ml-3 flex touch-pan-y">
          {items.map((item, i) => {
            const isService = item.type === 'service';
            const image = productImage(item);
            return (
              <div key={item.id} className="min-w-0 shrink-0 grow-0 basis-[90%] pl-3">
                <Link
                  href={`/items/${item.id}`}
                  prefetch={false}
                  className={cn(
                    'group relative block aspect-[5/4] overflow-hidden rounded-[1.75rem] bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a4c]',
                    dark && 'ring-1 ring-white/10'
                  )}
                >
                  {image ? (
                    <img
                      src={sizedImage(image, 720)}
                      srcSet={imageSrcSet(image, 720)}
                      alt={item.title}
                      // Première image prioritaire : c'est le plus grand visuel de la page
                      loading={i === 0 ? 'eager' : 'lazy'}
                      fetchPriority={i === 0 ? 'high' : 'auto'}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/95 via-[#0b1220]/25 to-transparent" />

                  <div className="absolute left-4 top-4 flex gap-2">
                    <span className={cn('flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white shadow', isService ? 'bg-blue-600' : 'bg-[#ec5a13]')}>
                      {item.promoted || item.featured ? <Zap className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                      {item.promoted || item.featured ? 'À la une' : 'Populaire'}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white sm:text-xl">{item.title}</h3>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="truncate text-xl font-black tracking-tight text-[#ffb48a] sm:text-2xl">{formatPrice(item.price)}</p>
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur">
                        <MapPin className="h-3 w-3" /> {cityOf(item.location)}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {snaps.length > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex gap-1.5" role="tablist" aria-label="Choisir une annonce">
            {snaps.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === selected}
                aria-label={`Annonce ${i + 1}`}
                onClick={() => embla?.scrollTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === selected ? 'w-7 bg-[#ec5a13]' : cn('w-1.5', dark ? 'bg-white/25 hover:bg-white/45' : 'bg-gray-300 hover:bg-gray-400')
                )}
              />
            ))}
          </div>
          <div className="hidden gap-2 md:flex">
            {[{ fn: prev, Icon: ChevronLeft, label: 'Annonce précédente' }, { fn: next, Icon: ChevronRight, label: 'Annonce suivante' }].map(({ fn, Icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={fn}
                aria-label={label}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition',
                  dark ? 'border border-white/15 bg-white/[0.06] text-white hover:bg-white/15' : 'border border-gray-200 bg-white text-gray-800 shadow-sm hover:text-[#ec5a13]'
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
