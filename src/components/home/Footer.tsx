// Pied de page — même ambiance « nuit et braise » que l'accueil
import Image from 'next/image';
import Link from 'next/link';
import { Mail, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { StoreButtons } from '@/components/StoreButtons';

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@taktak-ne.com';

const COLUMNS = [
  {
    title: 'Explorer',
    links: [
      { label: 'Produits', href: '/categories/tous?type=product' },
      { label: 'Services', href: '/categories/tous?type=service' },
      { label: 'Toutes les catégories', href: '/categories-list' },
      { label: 'Publier une annonce', href: '/publish' },
    ],
  },
  {
    title: 'TakTak',
    links: [
      { label: 'Qui sommes-nous', href: '/qui-sommes-nous' },
      { label: 'Comment ça marche', href: '/comment-ca-marche' },
      { label: "Centre d'aide", href: '/centre-aide' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: "Conditions d'utilisation", href: '/conditions-utilisation' },
      { label: 'Confidentialité', href: '/confidentialite' },
      { label: 'Mentions légales', href: '/mentions-legales' },
      { label: 'Supprimer mon compte', href: '/delete-account' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#070b16] text-white/70">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(160deg,#070b16_0%,#0d1324_60%,#1d0f08_100%)]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(236,90,19,0.28),transparent)]" />

      <div className="container mx-auto max-w-7xl px-4 pb-8 pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
          {/* Marque */}
          <div className="max-w-sm">
            <Link href="/" aria-label="TakTak, accueil" className="inline-block">
              <Image src="/branding/flogo-removebg-preview.png" alt="TakTak" width={150} height={56} className="-my-5 h-24 w-auto object-contain" />
            </Link>
            <p className="mt-4 text-[15px] leading-relaxed text-white/60">
              La place de marché du Niger : achetez, vendez et trouvez des services près de chez vous, gratuitement.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#ff8a4c]" /> Membres vérifiés et avis réels
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 text-[#ff8a4c]" /> Messagerie sécurisée, numéro privé
              </li>
            </ul>
            <StoreButtons size="sm" className="mt-6" />
          </div>

          {/* Liens */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-[1fr_1fr_1fr_1.35fr]">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-white/40">{col.title}</p>
                <ul className="space-y-2.5 text-[14.5px]">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="transition hover:text-white">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-white/40">Contact</p>
              <ul className="space-y-3 text-[14.5px]">
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-start gap-2 transition [overflow-wrap:anywhere] hover:text-white">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#ff8a4c]" /> {CONTACT_EMAIL}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ff8a4c]" /> Niamey, Niger
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[13px] text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} TakTak. Tous droits réservés.</p>
          <p>Fait avec soin à Niamey, au Niger</p>
        </div>
      </div>
    </footer>
  );
}
