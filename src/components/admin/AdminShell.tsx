'use client';

// Cadre commun de l'espace admin : accès réservé, menu, rappel du mot de passe temporaire.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flag, KeyRound, Loader2, ShieldAlert, Users } from 'lucide-react';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { useAuthGuard } from '@/hooks/useAuth';

const NAV = [
  { href: '/admin/signalements', label: 'Signalements', icon: Flag },
  { href: '/admin/equipe', label: 'Équipe admin', icon: Users },
  { href: '/profile', label: 'Mon mot de passe', icon: KeyRound },
];

export function AdminShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const { user, loading } = useAuthGuard();
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {loading || !user ? (
          <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#ec5a13]" /></div>
        ) : !isAdmin ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="font-semibold text-gray-900">Accès réservé</p>
            <p className="text-sm text-gray-500">Cet espace est réservé aux administrateurs TakTak.</p>
          </div>
        ) : (
          <>
            {user.needsPasswordChange && (
              <Link href="/profile" className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                <KeyRound className="h-5 w-5 flex-shrink-0" />
                <span><strong>Mot de passe temporaire.</strong> Choisissez votre propre mot de passe avant de continuer.</span>
              </Link>
            )}

            <nav className="mb-6 flex gap-2 overflow-x-auto" aria-label="Administration">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
            </div>
            {children}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
