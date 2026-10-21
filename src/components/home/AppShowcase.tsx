// Section « L'application » : un téléphone qui montre les vraies annonces du moment,
// les avantages de l'app et les liens vers les stores.
import { BellRing, Camera, MessageCircle, MapPin } from 'lucide-react';
import Image from 'next/image';
import { StoreButtons } from '@/components/StoreButtons';
import type { CardItem } from '@/lib/api/home';
import { cityOf, formatPrice, productImage, sizedImage } from '@/lib/format';

const PERKS = [
  { icon: Camera, title: 'Publiez en une photo', text: "Prenez l'article en photo, fixez le prix : c'est en ligne." },
  { icon: MessageCircle, title: 'Messages et vocaux', text: 'Discutez et négociez sans partager votre numéro.' },
  { icon: BellRing, title: 'Alertes en direct', text: 'Soyez prévenu dès qu’un acheteur vous écrit.' },
];

function PhonePreview({ items }: { items: CardItem[] }) {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[290px]">
      {/* Halo derrière l'appareil */}
      <div className="absolute inset-x-6 top-16 -z-10 h-3/4 rounded-full bg-[#ec5a13]/40 blur-3xl" />
      <div className="rounded-[2.6rem] border border-white/15 bg-[#0b0f19] p-2.5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
        <div className="relative overflow-hidden rounded-[2.1rem] bg-[#f6f7fb]" style={{ aspectRatio: '9 / 19' }}>
          {/* Encoche */}
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0b0f19]" />
          {/* En-tête de l'app */}
          <div className="bg-[linear-gradient(160deg,#fff5ef,#f6f7fb)] px-4 pb-3 pt-10">
            <Image src="/branding/flogo-removebg-preview.png" alt="" width={84} height={32} className="h-7 w-auto object-contain" />
            <p className="mt-2 text-[10px] font-semibold text-gray-500">Bonjour 👋</p>
            <p className="text-[15px] font-black leading-tight tracking-tight text-gray-900">Bienvenue sur TakTak</p>
            <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-2 text-[10px] text-gray-400 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-gray-300" /> Rechercher une annonce…
            </div>
          </div>
          {/* Annonces réelles */}
          <div className="grid grid-cols-2 gap-2 px-3 pt-1">
            {items.slice(0, 6).map((item) => {
              const image = productImage(item);
              return (
                <div key={item.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                  <div className="aspect-square bg-orange-50">
                    {image ? <img src={sizedImage(image, 140)} alt="" loading="lazy" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="p-1.5">
                    <p className={`truncate text-[10px] font-extrabold ${item.type === 'service' ? 'text-blue-600' : 'text-[#ec5a13]'}`}>{formatPrice(item.price)}</p>
                    <p className="truncate text-[9px] text-gray-700">{item.title}</p>
                    <p className="mt-0.5 flex items-center gap-0.5 truncate text-[8px] text-gray-400">
                      <MapPin className="h-2 w-2" /> {cityOf(item.location)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f6f7fb] to-transparent" />
        </div>
      </div>
    </div>
  );
}

export function AppShowcase({ items }: { items: CardItem[] }) {
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#060a14_0%,#10172b_60%,#2a1307_100%)] px-6 py-12 text-white sm:px-12 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-1/3 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.25),transparent)]" />
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ffa87b]">L&apos;application TakTak</p>
          <h2 className="mt-3 text-balance text-white text-3xl font-black leading-tight tracking-[-0.03em] sm:text-[2.6rem]">
            Votre marché, toujours dans votre poche.
          </h2>
          <p className="mt-4 max-w-lg text-white/65">
            Les mêmes annonces, votre compte et vos conversations, sur Android et iPhone.
          </p>

          <ul className="mt-8 grid gap-5">
            {PERKS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                  <Icon className="h-5 w-5 text-[#ff8a4c]" />
                </span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="text-sm text-white/60">{text}</span>
                </span>
              </li>
            ))}
          </ul>

          <StoreButtons className="mt-9" />
        </div>

        {items.length ? <PhonePreview items={items} /> : null}
      </div>
    </section>
  );
}
