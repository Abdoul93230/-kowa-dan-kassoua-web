'use client';

// « À la une » — grandes cartes photo, défilement automatique (pause au survol / au focus)
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, MapPin, Zap } from 'lucide-react';
import type { CardItem } from '@/lib/api/home';
import { cityOf, formatPrice, imageSrcSet, productImage, sizedImage } from '@/lib/format';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 5000;

export function FeaturedCarousel({ items }: { items: CardItem[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: items.length > 2, align: 'start', skipSnaps: false });
  const [selected, setSelected] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (!embla) return undefined;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    onSelect();
    embla.on('select', onSelect);
    embla.on('reInit', onSelect);
    return () => {
      embla.off('select', onSelect);
      embla.off('reInit', onSelect);
    };
  }, [embla]);

  // Défilement automatique, suspendu au survol, au focus clavier ou quand l'onglet est caché
  useEffect(() => {
    if (!embla || items.length < 2) return undefined;
    const timer = setInterval(() => {
      if (!paused.current && document.visibilityState === 'visible') embla.scrollNext();
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
      <div ref={emblaRef} className="overflow-hidden rounded-3xl">
        <div className="-ml-4 flex touch-pan-y">
          {items.map((item, i) => {
            const isService = item.type === 'service';
            const image = productImage(item);
            return (
              <div key={item.id} className="min-w-0 shrink-0 grow-0 basis-[88%] pl-4 sm:basis-[62%] lg:basis-[45%]">
                <Link
                  href={`/items/${item.id}`}
                  prefetch={false}
                  className="group relative block aspect-[16/10] overflow-hidden rounded-3xl bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec5a13] focus-visible:ring-offset-2"
                >
                  {image ? (
                    <img
                      src={sizedImage(image, 720)}
                      srcSet={imageSrcSet(image, 720)}
                      alt={item.title}
                      // Première image : prioritaire (c'est le plus grand élément de la page)
                      loading={i === 0 ? 'eager' : 'lazy'}
                      fetchPriority={i === 0 ? 'high' : 'auto'}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute left-4 top-4 flex gap-2">
                    <span className={cn('rounded-full px-3 py-1 text-xs font-bold text-white', isService ? 'bg-blue-600' : 'bg-[#ec5a13]')}>
                      {isService ? 'Service' : 'Produit'}
                    </span>
                    {item.promoted || item.featured ? (
                      <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-amber-700">
                        <Zap className="h-3 w-3" /> À la une
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-2xl font-black tracking-tight text-white drop-shadow sm:text-[26px]">{formatPrice(item.price)}</p>
                    <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-white/95 sm:text-lg">{item.title}</h3>
                    <p className="mt-2 flex items-center gap-1 text-sm text-white/80">
                      <MapPin className="h-3.5 w-3.5" /> {cityOf(item.location)}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {items.length > 1 ? (
        <>
          <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Choisir une annonce">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === selected}
                aria-label={`Annonce ${i + 1}`}
                onClick={() => embla?.scrollTo(i)}
                className={cn('h-1.5 rounded-full transition-all duration-300', i === selected ? 'w-6 bg-[#ec5a13]' : 'w-1.5 bg-gray-300 hover:bg-gray-400')}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={prev}
            aria-label="Annonce précédente"
            className="absolute left-3 top-[45%] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur transition hover:bg-white md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Annonce suivante"
            className="absolute right-3 top-[45%] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur transition hover:bg-white md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}
    </section>
  );
}
