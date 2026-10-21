'use client';

// Bandeau du haut : promotion de l'application mobile (refermable, mémorisé 30 jours)
import { useEffect, useState } from 'react';
import { Smartphone, X } from 'lucide-react';
import { StoreButtons } from '@/components/StoreButtons';
import { APP_LINKS } from '@/lib/appLinks';

const STORAGE_KEY = 'taktak:app-bar-dismissed';
const HIDE_DAYS = 30;

export function AppPromoBar() {
  // Masqué au premier rendu (serveur) puis affiché si la personne ne l'a pas refermé
  const [visible, setVisible] = useState(false);
  const [store, setStore] = useState<'android' | 'ios'>('android');

  useEffect(() => {
    try {
      const at = Number(localStorage.getItem(STORAGE_KEY) || 0);
      if (!at || Date.now() - at > HIDE_DAYS * 86400000) setVisible(true);
    } catch {
      setVisible(true);
    }
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) setStore('ios');
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* navigation privée */ }
  };

  if (!visible) return null;

  return (
    <div className="relative overflow-hidden bg-[#0b1020] text-white">
      {/* Liseré braise, comme l'en-tête de l'application */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_140%_at_100%_0%,rgba(236,90,19,0.35),transparent_60%)]" />
      <div className="container relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <Smartphone className="h-4 w-4 text-[#ff8a4c]" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[13px] sm:text-sm">
          <strong className="font-semibold">TakTak dans votre poche</strong>
          <span className="hidden text-white/65 sm:inline"> — publiez en photo, discutez et recevez les alertes en direct.</span>
        </p>

        {/* Ordinateur : les deux stores · Téléphone : le store de l'appareil */}
        <StoreButtons size="sm" className="hidden md:flex" />
        <a
          href={store === 'ios' ? APP_LINKS.ios : APP_LINKS.android}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-[#ec5a13] px-3.5 py-1.5 text-[13px] font-bold text-white md:hidden"
        >
          Installer
        </a>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer le bandeau"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
