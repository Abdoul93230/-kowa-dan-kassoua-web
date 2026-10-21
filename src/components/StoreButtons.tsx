// Boutons « App Store » et « Google Play »
import { APP_LINKS } from '@/lib/appLinks';
import { cn } from '@/lib/utils';

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M16.37 12.67c-.03-2.6 2.13-3.86 2.22-3.92-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.82 0-2.06-.92-3.39-.9-1.74.03-3.35 1.02-4.25 2.58-1.82 3.15-.46 7.8 1.3 10.36.87 1.25 1.9 2.65 3.24 2.6 1.31-.05 1.8-.84 3.38-.84 1.57 0 2.02.84 3.39.81 1.4-.02 2.29-1.27 3.14-2.53.99-1.45 1.4-2.86 1.42-2.93-.03-.01-2.73-1.05-2.76-4.13zM13.79 5.03c.71-.87 1.2-2.07 1.07-3.27-1.03.04-2.29.69-3.03 1.55-.66.77-1.25 2-1.09 3.18 1.15.09 2.33-.58 3.05-1.46z" />
    </svg>
  );
}

function PlayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path fill="#00d7fe" d="M3.6 1.8 13.3 11.5 3.6 21.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1z" />
      <path fill="#ffce00" d="M16.6 14.8 13.3 11.5l3.3-3.3 3.9 2.2c1.1.6 1.1 1.6 0 2.2z" />
      <path fill="#ff3a44" d="M16.6 14.8 13.3 11.5 3.6 21.2c.4.2.9.2 1.4-.1z" />
      <path fill="#00f076" d="M16.6 8.2 5 1.9c-.5-.3-1-.3-1.4-.1l9.7 9.7z" />
    </svg>
  );
}

type Size = 'sm' | 'md';

function StoreButton({ store, size = 'md', className }: { store: 'ios' | 'android'; size?: Size; className?: string }) {
  const ios = store === 'ios';
  return (
    <a
      href={ios ? APP_LINKS.ios : APP_LINKS.android}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-black text-white transition',
        'hover:-translate-y-0.5 hover:border-white/30 hover:shadow-lg hover:shadow-black/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a4c] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        size === 'sm' ? 'h-9 px-3' : 'h-12 px-4',
        className
      )}
      aria-label={ios ? "Télécharger TakTak sur l'App Store" : 'Télécharger TakTak sur Google Play'}
    >
      {ios ? (
        <AppleLogo className={size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'} />
      ) : (
        <PlayLogo className={size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'} />
      )}
      <span className="flex flex-col items-start leading-none">
        <span className={cn('font-medium text-white/70', size === 'sm' ? 'text-[8.5px]' : 'text-[10px]')}>
          {ios ? 'Télécharger sur' : 'Disponible sur'}
        </span>
        <span className={cn('font-semibold tracking-tight', size === 'sm' ? 'text-[13px]' : 'text-[16px]')}>
          {ios ? 'App Store' : 'Google Play'}
        </span>
      </span>
    </a>
  );
}

export function StoreButtons({ size = 'md', className }: { size?: Size; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2.5', className)}>
      <StoreButton store="android" size={size} />
      <StoreButton store="ios" size={size} />
    </div>
  );
}
