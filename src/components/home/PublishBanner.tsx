'use client';

// Appel à la publication — même message que dans l'application mobile
import { useRouter } from 'next/navigation';
import { Camera, Gift, MessageCircle, Plus, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuickAuth } from '@/contexts/QuickAuthContext';
import { formatCompact } from '@/lib/format';

const STEPS = [
  { icon: Camera, title: 'Prenez vos photos', text: 'Depuis votre téléphone ou votre ordinateur' },
  { icon: Tag, title: 'Fixez votre prix', text: 'Ou publiez gratuitement à 0 F' },
  { icon: MessageCircle, title: 'Recevez des messages', text: 'Sans jamais partager votre numéro' },
];

export function PublishBanner({ totalUsers }: { totalUsers?: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const { openQuickAuth } = useQuickAuth();

  const publish = () => {
    if (!user) openQuickAuth('/publish');
    else router.push('/publish');
  };

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#111827] px-5 py-8 text-white sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(236,90,19,0.4),transparent)]" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(255,168,123,0.14),transparent)]" />

      <div className="grid gap-7 sm:gap-9 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffa87b]/15 px-3 py-1 text-xs font-bold tracking-wide text-[#ffa87b]">
            <Gift className="h-3.5 w-3.5" /> 100 % gratuit · sans commission
          </span>
          <h2 className="mt-4 text-balance text-white text-3xl font-black leading-tight tracking-[-0.03em] sm:text-4xl">
            Vous avez quelque chose à vendre ?
          </h2>
          <p className="mt-3 max-w-md text-white/65">
            {totalUsers && totalUsers > 0
              ? `${formatCompact(totalUsers)} membres cherchent déjà près de chez vous. Votre annonce est en ligne en 2 minutes.`
              : 'Touchez des acheteurs près de chez vous. Votre annonce est en ligne en 2 minutes.'}
          </p>
          <button
            type="button"
            onClick={publish}
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ec5a13] to-[#b3420e] px-6 text-[15px] font-bold shadow-lg shadow-orange-900/40 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a4c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]"
          >
            <Plus className="h-5 w-5" /> Publier une annonce
          </button>
        </div>

        <ol className="grid gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-1 xl:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3 sm:block sm:p-4">
              <span className="absolute right-4 top-3 hidden text-xs font-black text-white/25 sm:block">0{i + 1}</span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffa87b] to-[#ec5a13]">
                <Icon className="h-5 w-5 text-white" />
              </span>
              <span className="min-w-0">
                <p className="font-bold sm:mt-3">{title}</p>
                <p className="mt-0.5 text-sm text-white/55">{text}</p>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
