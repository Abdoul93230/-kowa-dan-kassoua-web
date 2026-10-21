'use client';

// Espace compte : aperçu, modification du profil et sécurité — même ambiance que le reste du site
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useQuickAuth } from '@/contexts/QuickAuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { updateProfile, changePassword } from '@/lib/api/auth';
import { getProducts } from '@/lib/api/products';
import { getUnreadCount } from '@/lib/api/messaging';
import { cityOf, getInitials, sizedImage } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  User, MapPin, Mail, Lock, Eye, EyeOff, Save, LogOut, Camera, AlertCircle, CheckCircle2, Loader2,
  Building2, ChevronRight, Package, MessageCircle, Heart, Store, Plus, ShieldCheck, LayoutGrid,
  UserPen, KeyRound, Trash2, Phone, Check, LogIn, ChevronDown,
} from 'lucide-react';

const CITIES = [
  'Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua',
  'Dosso', 'Diffa', 'Tillabéri', "Birni-N'Konni", 'Arlit', 'Gaya', 'Tessaoua',
];

const COUNTRIES = [
  { code: 'NE', name: 'Niger',         dialCode: '+227', flag: '🇳🇪', pattern: [2, 2, 2, 2] },
  { code: 'SN', name: 'Sénégal',       dialCode: '+221', flag: '🇸🇳', pattern: [2, 3, 2, 2] },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮', pattern: [2, 2, 2, 2] },
  { code: 'BF', name: 'Burkina Faso',  dialCode: '+226', flag: '🇧🇫', pattern: [2, 2, 2, 2] },
  { code: 'ML', name: 'Mali',          dialCode: '+223', flag: '🇲🇱', pattern: [2, 2, 2, 2] },
  { code: 'TG', name: 'Togo',          dialCode: '+228', flag: '🇹🇬', pattern: [2, 2, 2, 2] },
  { code: 'BJ', name: 'Bénin',         dialCode: '+229', flag: '🇧🇯', pattern: [2, 2, 2, 2] },
];

function formatWaDisplay(digits: string, pattern: number[]) {
  let result = '';
  let i = 0;
  for (const len of pattern) {
    const chunk = digits.slice(i, i + len);
    if (!chunk) break;
    result += (result ? ' ' : '') + chunk;
    i += len;
  }
  return result;
}

type Tab = 'overview' | 'edit' | 'security';
const TABS: { key: Tab; label: string; icon: typeof User }[] = [
  { key: 'overview', label: 'Aperçu', icon: LayoutGrid },
  { key: 'edit', label: 'Modifier le profil', icon: UserPen },
  { key: 'security', label: 'Sécurité', icon: KeyRound },
];

const inputCls = 'w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-[15px] outline-none transition focus:border-[#ec5a13] focus:ring-4 focus:ring-[#ec5a13]/10';

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
        <Header />
      </Suspense>
      {children}
      <Footer />
    </div>
  );
}

function Band({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative isolate h-40 overflow-hidden bg-[linear-gradient(135deg,#060a14_0%,#10172b_60%,#2a1307_100%)] sm:h-44">
      <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(236,90,19,0.38),transparent)]" />
      <div className="container mx-auto max-w-6xl px-4 pt-7">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { openQuickAuth } = useQuickAuth();
  const { favorites } = useFavorites();

  const [tab, setTab] = useState<Tab>('overview');

  // ── Chiffres de l'aperçu ───────────────────────────────────────────────────
  const [listingCounts, setListingCounts] = useState<{ all: number; product: number; service: number } | null>(null);
  const [unread, setUnread] = useState<number | null>(null);

  // ── Champs édition profil ──────────────────────────────────────────────────
  const [editName,         setEditName]         = useState('');
  const [editEmail,        setEditEmail]        = useState('');
  const [editLocation,     setEditLocation]     = useState('');
  const [editDescription,  setEditDescription]  = useState('');
  const [editBusinessType, setEditBusinessType] = useState<'individual' | 'professional'>('individual');
  const [editBusinessName, setEditBusinessName] = useState('');
  const [waDigits,         setWaDigits]         = useState('');
  const [waCountry,        setWaCountry]        = useState(COUNTRIES[0]);
  const [showWaPicker,     setShowWaPicker]     = useState(false);
  const [initialWa,        setInitialWa]        = useState('');
  const [savingProfile,    setSavingProfile]    = useState(false);
  const [profileMsg,       setProfileMsg]       = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Champs sécurité ────────────────────────────────────────────────────────
  const [currentPwd,       setCurrentPwd]       = useState('');
  const [newPwd,           setNewPwd]           = useState('');
  const [confirmPwd,       setConfirmPwd]       = useState('');
  const [showCurPwd,       setShowCurPwd]       = useState(false);
  const [showNewPwd,       setShowNewPwd]       = useState(false);
  const [showConPwd,       setShowConPwd]       = useState(false);
  const [savingPwd,        setSavingPwd]        = useState(false);
  const [pwdMsg,           setPwdMsg]           = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [editAvatarUri, setEditAvatarUri] = useState<string | null>(null);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Onglet demandé dans l'adresse (?tab=edit|security)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t === 'edit' || t === 'security') setTab(t);
  }, []);

  // Pré-remplir les champs quand user charge
  const resetForm = () => {
    if (!user) return;
    setEditName(user.name || '');
    setEditAvatarUri(user.avatar || null);
    setEditAvatarFile(null);
    setEditEmail(user.email || '');
    setEditLocation(user.location || '');
    setEditDescription(user.description || '');
    setEditBusinessType(user.businessType || 'individual');
    setEditBusinessName(user.businessName || '');
    const raw = user.whatsapp || '';
    if (raw) {
      const m = COUNTRIES.find(c => raw.startsWith(c.dialCode));
      const digits = (m ? raw.replace(m.dialCode, '') : raw).replace(/\D/g, '');
      if (m) setWaCountry(m);
      setWaDigits(digits);
      setInitialWa(digits ? `${(m || waCountry).dialCode} ${digits}` : '');
    } else {
      setWaDigits('');
      setInitialWa('');
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(resetForm, [user]);

  // Compteurs (annonces en ligne, messages non lus)
  useEffect(() => {
    if (!user?.id) return;
    getProducts({ seller: user.id, limit: 1, status: 'active', view: 'card', facets: 'type' })
      .then((res) => setListingCounts(res.facets || { all: res.pagination?.total || 0, product: 0, service: 0 }))
      .catch(() => setListingCounts(null));
    getUnreadCount()
      .then((res) => setUnread(Number(res.data?.unreadCount || 0)))
      .catch(() => setUnread(null));
  }, [user?.id]);

  const goTab = (t: Tab) => {
    setTab(t);
    setProfileMsg(null);
    setPwdMsg(null);
    const url = new URL(window.location.href);
    if (t === 'overview') url.searchParams.delete('tab');
    else url.searchParams.set('tab', t);
    window.history.replaceState(null, '', url.toString());
    const top = contentRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < 80) contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (authLoading) {
    return (
      <PageShell>
        <Band />
        <div className="container mx-auto -mt-24 max-w-6xl px-4 pb-16">
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="relative h-80 animate-pulse rounded-3xl bg-white" />
            <div className="relative h-96 animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Visiteur non connecté ──────────────────────────────────────────────────
  if (!user) {
    return (
      <PageShell>
        <Band />
        <div className="container mx-auto -mt-20 max-w-6xl px-4 pb-16">
          <div className="relative mx-auto max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)]">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ec5a13]">
              <User className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-2xl font-black tracking-tight text-gray-900">Votre espace TakTak</h1>
            <p className="mt-2 text-[15px] text-gray-500">Connectez-vous pour gérer votre profil, vos annonces et vos messages.</p>
            <button
              type="button"
              onClick={() => openQuickAuth('/profile')}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#ec5a13] px-6 text-[15px] font-bold text-white shadow-[0_14px_30px_-12px_rgba(236,90,19,0.75)] transition hover:bg-[#d44f11]"
            >
              <LogIn className="h-5 w-5" /> Se connecter
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditAvatarFile(file);
    setEditAvatarUri(URL.createObjectURL(file));
    e.target.value = '';
    if (tab !== 'edit') goTab('edit');
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editName.trim()) { setProfileMsg({ type: 'err', text: 'Le nom est requis' }); return; }
    setSavingProfile(true); setProfileMsg(null);
    try {
      const fullWA = waDigits.trim() ? `${waCountry.dialCode} ${waDigits.trim()}` : undefined;
      const res = await updateProfile({
        name: editName.trim(),
        email: editEmail.trim() || undefined,
        location: editLocation.trim() || undefined,
        description: editDescription.trim() || undefined,
        businessType: editBusinessType,
        businessName: editBusinessType === 'professional' ? editBusinessName.trim() || undefined : undefined,
        whatsapp: fullWA,
        avatarFile: editAvatarFile,
      });
      if (res.success) {
        setEditAvatarFile(null);
        if (res.data?.user?.avatar) setEditAvatarUri(res.data.user.avatar);
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data?.user }));
        window.dispatchEvent(new Event('auth:changed'));
        setProfileMsg({ type: 'ok', text: 'Profil mis à jour.' });
      }
    } catch (e: any) {
      setProfileMsg({ type: 'err', text: e.message || 'Erreur lors de la mise à jour' });
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newPwd.length < 6)       { setPwdMsg({ type: 'err', text: 'Minimum 6 caractères' }); return; }
    if (newPwd !== confirmPwd)   { setPwdMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas' }); return; }
    if (!user.needsPasswordChange && !currentPwd) {
      setPwdMsg({ type: 'err', text: 'Entrez votre mot de passe actuel' }); return;
    }
    setSavingPwd(true); setPwdMsg(null);
    try {
      const res = await changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      if (res.success) {
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        // Mettre à jour le localStorage pour que la bannière disparaisse sans reconnexion
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.needsPasswordChange = false;
          localStorage.setItem('user', JSON.stringify(parsed));
          window.dispatchEvent(new Event('auth:changed'));
        }
        setPwdMsg({ type: 'ok', text: 'Mot de passe mis à jour.' });
      }
    } catch (e: any) {
      setPwdMsg({ type: 'err', text: e.message || 'Erreur lors du changement' });
    } finally { setSavingPwd(false); }
  };

  const handleLogout = async () => {
    await logout();
    window.dispatchEvent(new Event('auth:changed'));
    router.push('/');
  };

  // ── Dérivés ────────────────────────────────────────────────────────────────
  const displayName = (user.businessType === 'professional' && user.businessName) || user.name;
  const avatar = editAvatarUri || user.avatar || null;
  const avatarSrc = avatar && !avatar.startsWith('blob:') ? sizedImage(avatar, 192) : avatar;
  const formDirty =
    !!editAvatarFile ||
    editName !== (user.name || '') ||
    editEmail !== (user.email || '') ||
    editLocation !== (user.location || '') ||
    editDescription !== (user.description || '') ||
    editBusinessType !== (user.businessType || 'individual') ||
    editBusinessName !== (user.businessName || '') ||
    (waDigits ? `${waCountry.dialCode} ${waDigits}` : '') !== initialWa;

  const checklist = [
    { done: !!user.avatar, label: 'Ajouter une photo', tab: 'edit' as Tab },
    { done: !!user.location, label: 'Indiquer votre ville', tab: 'edit' as Tab },
    { done: !!user.description, label: 'Écrire une courte présentation', tab: 'edit' as Tab },
    { done: !!user.email, label: 'Renseigner un email (récupération du compte)', tab: 'edit' as Tab },
    { done: !user.needsPasswordChange, label: 'Choisir votre mot de passe', tab: 'security' as Tab },
  ];
  const completion = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  const pwdStrength = newPwd.length === 0 ? 0 : newPwd.length < 6 ? 1 : newPwd.length < 10 ? 2 : newPwd.length < 14 ? 3 : 4;
  const pwdColors   = ['', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500'];
  const pwdLabels   = ['', 'Trop court', 'Moyen', 'Fort', 'Très fort'];

  const shortcuts = [
    { href: '/mes-annonces', icon: Package, label: 'Mes annonces', sub: listingCounts ? `${listingCounts.all} en ligne` : 'Gérer vos publications' },
    { href: '/messages', icon: MessageCircle, label: 'Messages', sub: unread ? `${unread} non lu${unread > 1 ? 's' : ''}` : 'Vos conversations', badge: unread || 0 },
    { href: '/favoris', icon: Heart, label: 'Favoris', sub: `${favorites.length} annonce${favorites.length > 1 ? 's' : ''}` },
    { href: `/seller/${user.id}`, icon: Store, label: 'Ma boutique', sub: 'Ce que voient les visiteurs' },
  ];

  return (
    <PageShell>
      <Band>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Mon compte</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">Bonjour, {user.name.split(' ')[0]} 👋</h1>
      </Band>

      <div className="container mx-auto -mt-20 max-w-6xl px-4 pb-16 sm:-mt-16">
        {user.needsPasswordChange ? (
          <div className="relative mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 sm:flex-row sm:items-center">
            <KeyRound className="hidden h-5 w-5 shrink-0 text-amber-700 sm:block" />
            <p className="flex-1 text-sm font-semibold text-amber-900">
              Vous utilisez un mot de passe temporaire. Choisissez le vôtre pour sécuriser votre compte.
            </p>
            <button type="button" onClick={() => goTab('security')} className="h-9 shrink-0 self-start rounded-full bg-amber-900 px-4 text-xs font-bold text-white transition hover:bg-black sm:self-auto">
              Le changer maintenant
            </button>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* ── Colonne identité ── */}
          <aside className="relative space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)]">
              <div className="relative mx-auto h-28 w-28">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSrc} alt={user.name} className="h-28 w-28 rounded-3xl object-cover ring-4 ring-white shadow-lg" />
                ) : (
                  <span className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#ff8a4c,#ec5a13)] text-3xl font-black text-white shadow-lg">
                    {getInitials(user.name)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Changer la photo de profil"
                  className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#0b1020] text-white ring-4 ring-white transition hover:bg-[#ec5a13]"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
              </div>

              <p className="mt-4 text-xl font-black leading-tight text-gray-900 [overflow-wrap:anywhere]">{displayName}</p>
              {displayName !== user.name ? <p className="text-sm text-gray-500">{user.name}</p> : null}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', user.businessType === 'professional' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600')}>
                  {user.businessType === 'professional' ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  {user.businessType === 'professional' ? 'Professionnel' : 'Particulier'}
                </span>
                {user.location ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                    <MapPin className="h-3.5 w-3.5" />{cityOf(user.location)}
                  </span>
                ) : null}
              </div>

              <Link href="/publish" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#ec5a13] text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(236,90,19,0.8)] transition hover:bg-[#d44f11]">
                <Plus className="h-4 w-4" /> Publier une annonce
              </Link>
            </div>

            <nav aria-label="Rubriques du compte" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-3xl lg:border lg:border-gray-100 lg:bg-white lg:p-2 lg:px-2">
              {TABS.map(({ key, label, icon: Icon }) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => goTab(key)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-bold transition lg:rounded-2xl lg:py-3',
                      active ? 'bg-[#0b1020] text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:text-gray-900 lg:bg-transparent lg:ring-0 lg:hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {key === 'security' && user.needsPasswordChange ? <span className="h-2 w-2 rounded-full bg-amber-500" /> : null}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 lg:flex"
              >
                <LogOut className="h-4 w-4" /> Se déconnecter
              </button>
            </nav>
          </aside>

          {/* ── Contenu ── */}
          <div ref={contentRef} className="relative min-w-0 scroll-mt-24 space-y-6">
            {tab === 'overview' ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                  {shortcuts.map(({ href, icon: Icon, label, sub, badge }) => (
                    <Link
                      key={href}
                      href={href}
                      className="group relative flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.4)] sm:p-5"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ec5a13]">
                        <Icon className="h-5 w-5" />
                      </span>
                      {badge ? (
                        <span className="absolute right-4 top-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ec5a13] px-1.5 text-xs font-black text-white">{badge}</span>
                      ) : null}
                      <span>
                        <span className="block text-[15px] font-black text-gray-900">{label}</span>
                        <span className="block text-xs text-gray-500">{sub}</span>
                      </span>
                    </Link>
                  ))}
                </div>

                {completion < 100 ? (
                  <section className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-black tracking-tight text-gray-900">Complétez votre profil</h2>
                        <p className="text-sm text-gray-500">Un profil complet inspire confiance et reçoit plus de messages.</p>
                      </div>
                      <span className="shrink-0 text-2xl font-black text-[#ec5a13]">{completion}%</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#ff8a4c,#ec5a13)] transition-all duration-700" style={{ width: `${completion}%` }} />
                    </div>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {checklist.map((c) => (
                        <li key={c.label}>
                          <button
                            type="button"
                            disabled={c.done}
                            onClick={() => goTab(c.tab)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm transition',
                              c.done ? 'bg-emerald-50/60 text-gray-400 line-through' : 'bg-gray-50 font-semibold text-gray-800 hover:bg-[#fff1e8]'
                            )}
                          >
                            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full', c.done ? 'bg-emerald-500 text-white' : 'border-2 border-gray-300')}>
                              {c.done ? <Check className="h-3.5 w-3.5" /> : null}
                            </span>
                            <span className="flex-1">{c.label}</span>
                            {!c.done ? <ChevronRight className="h-4 w-4 text-gray-400" /> : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <section className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-black tracking-tight text-gray-900">Mes informations</h2>
                    <button type="button" onClick={() => goTab('edit')} className="text-sm font-bold text-[#ec5a13] hover:underline">Modifier</button>
                  </div>
                  <dl className="mt-4 divide-y divide-gray-100">
                    <InfoRow icon={<User className="h-4 w-4" />} label="Nom" value={user.name} />
                    <InfoRow icon={<Phone className="h-4 w-4" />} label="Téléphone (connexion)" value={user.phone} hint="Privé" />
                    <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} hint="Privé" />
                    <InfoRow icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" value={user.whatsapp} hint="Privé" />
                    <InfoRow icon={<MapPin className="h-4 w-4" />} label="Ville" value={user.location} />
                    <InfoRow icon={<UserPen className="h-4 w-4" />} label="Présentation" value={user.description} multiline />
                  </dl>
                  <p className="mt-4 flex items-start gap-2 rounded-2xl bg-emerald-50 px-3.5 py-3 text-xs text-emerald-900">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    Votre téléphone, votre email et votre WhatsApp ne sont jamais affichés publiquement : les acheteurs vous écrivent via la messagerie TakTak.
                  </p>
                </section>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={handleLogout} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 text-sm font-bold text-red-600 transition hover:bg-red-50 lg:hidden">
                    <LogOut className="h-4 w-4" /> Se déconnecter
                  </button>
                  <Link href="/delete-account" className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 transition hover:text-red-600 sm:ml-auto">
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer mon compte
                  </Link>
                </div>
              </>
            ) : null}

            {tab === 'edit' ? (
              <form onSubmit={handleSaveProfile} className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-7">
                <h2 className="text-xl font-black tracking-tight text-gray-900">Modifier le profil</h2>
                <p className="mt-1 text-sm text-gray-500">Ces informations apparaissent sur votre boutique et vos annonces (sauf les coordonnées privées).</p>

                {/* Photo */}
                <div className="mt-6 flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarSrc} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ff8a4c,#ec5a13)] text-xl font-black text-white">{getInitials(editName || user.name)}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900">Photo de profil</p>
                    <p className="text-xs text-gray-500">{editAvatarFile ? 'Nouvelle photo : enregistrez pour la publier.' : 'JPG, PNG ou WebP. Un visage ou un logo net.'}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="h-9 rounded-full bg-white px-4 text-xs font-bold text-gray-800 ring-1 ring-gray-200 transition hover:ring-gray-300">
                      {avatar ? 'Changer' : 'Ajouter'}
                    </button>
                    {editAvatarFile ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (editAvatarUri) URL.revokeObjectURL(editAvatarUri);
                          setEditAvatarFile(null);
                          setEditAvatarUri(user.avatar || null);
                        }}
                        className="h-9 rounded-full px-3 text-xs font-bold text-gray-500 transition hover:text-red-600"
                      >
                        Annuler
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Nom complet">
                    <input className={inputCls} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Votre nom complet" autoComplete="name" />
                  </Field>

                  <Field label="Ville">
                    <div className="relative">
                      <select className={cn(inputCls, 'appearance-none pr-10', !editLocation && 'text-gray-400')} value={editLocation} onChange={e => setEditLocation(e.target.value)}>
                        <option value="">Sélectionner une ville</option>
                        {[...new Set([...(editLocation && !CITIES.includes(editLocation) ? [editLocation] : []), ...CITIES])].map(city => (
                          <option key={city} value={city} className="text-gray-900">{city}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </Field>

                  <Field label="Email" hint="Privé · sert à récupérer votre compte">
                    <input type="email" className={inputCls} value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="votre@email.com" autoComplete="email" />
                  </Field>

                  <Field label="WhatsApp" hint="Privé · jamais affiché sur vos annonces">
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowWaPicker(v => !v)}
                          className="flex h-12 items-center gap-1.5 whitespace-nowrap rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm font-semibold transition hover:bg-gray-100"
                        >
                          <span className="text-lg">{waCountry.flag}</span>
                          <span className="text-gray-700">{waCountry.dialCode}</span>
                        </button>
                        {showWaPicker && (
                          <div className="absolute left-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                            {COUNTRIES.map(c => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => { setWaCountry(c); setWaDigits(''); setShowWaPicker(false); }}
                                className={cn('flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-gray-50', waCountry.code === c.code ? 'bg-[#fff1e8] font-semibold text-[#ec5a13]' : 'text-gray-700')}
                              >
                                <span className="text-lg">{c.flag}</span>
                                <span className="flex-1 text-left">{c.name}</span>
                                <span className="text-xs text-gray-400">{c.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        className={cn(inputCls, 'min-w-0 flex-1')}
                        placeholder={waCountry.pattern.map(n => '0'.repeat(n)).join(' ')}
                        value={formatWaDisplay(waDigits, waCountry.pattern)}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '');
                          const maxLen = waCountry.pattern.reduce((a, b) => a + b, 0);
                          setWaDigits(digits.slice(0, maxLen));
                        }}
                      />
                    </div>
                  </Field>

                  <Field label="Type de compte" className="sm:col-span-2">
                    <div className="grid grid-cols-2 gap-2">
                      {(['individual', 'professional'] as const).map(t => {
                        const active = editBusinessType === t;
                        const Icon = t === 'individual' ? User : Building2;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setEditBusinessType(t)}
                            className={cn(
                              'flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition',
                              active ? 'border-[#ec5a13] bg-[#fff7f2]' : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-[#ec5a13]' : 'text-gray-400')} />
                            <span>
                              <span className={cn('block text-sm font-bold', active ? 'text-gray-900' : 'text-gray-600')}>{t === 'individual' ? 'Particulier' : 'Professionnel'}</span>
                              <span className="hidden text-xs text-gray-500 sm:block">{t === 'individual' ? 'Je vends de temps en temps' : 'Boutique, entreprise, artisan'}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  {editBusinessType === 'professional' && (
                    <Field label="Nom de la boutique / entreprise" className="sm:col-span-2">
                      <input className={inputCls} value={editBusinessName} onChange={e => setEditBusinessName(e.target.value)} placeholder="Affiché à la place de votre nom" />
                    </Field>
                  )}

                  <Field label="Présentation" hint={`${editDescription.length}/500`} className="sm:col-span-2">
                    <textarea
                      rows={4}
                      maxLength={500}
                      className={cn(inputCls, 'h-auto resize-none py-3 leading-relaxed')}
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      placeholder="Ce que vous vendez, vos horaires, votre quartier…"
                    />
                  </Field>
                </div>

                {profileMsg && <div className="mt-5"><Msg type={profileMsg.type} text={profileMsg.text} /></div>}

                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setProfileMsg(null); }}
                    disabled={!formDirty || savingProfile}
                    className="h-12 rounded-full px-5 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                  >
                    Annuler les modifications
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile || !formDirty}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ec5a13] px-6 text-[15px] font-bold text-white shadow-[0_14px_30px_-14px_rgba(236,90,19,0.8)] transition hover:bg-[#d44f11] disabled:opacity-50 disabled:shadow-none"
                  >
                    {savingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-4 w-4" />}
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : null}

            {tab === 'security' ? (
              <form onSubmit={handleChangePassword} className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-7">
                <h2 className="text-xl font-black tracking-tight text-gray-900">Sécurité et connexion</h2>
                <p className="mt-1 text-sm text-gray-500">Vous vous connectez avec le numéro <span className="font-semibold text-gray-800">{user.phone}</span>.</p>

                <div className="mt-6 max-w-md space-y-5">
                  {!user.needsPasswordChange && (
                    <Field label="Mot de passe actuel">
                      <PwdInput value={currentPwd} onChange={setCurrentPwd} show={showCurPwd} onToggle={() => setShowCurPwd(v => !v)} autoComplete="current-password" />
                    </Field>
                  )}

                  <Field label="Nouveau mot de passe">
                    <PwdInput value={newPwd} onChange={setNewPwd} show={showNewPwd} onToggle={() => setShowNewPwd(v => !v)} placeholder="6 caractères minimum" autoComplete="new-password" />
                    {newPwd.length > 0 && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex flex-1 gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-all', i <= pwdStrength ? pwdColors[pwdStrength] : 'bg-gray-200')} />
                          ))}
                        </div>
                        <span className={cn('text-xs font-bold', ['', 'text-red-500', 'text-orange-500', 'text-amber-600', 'text-emerald-600'][pwdStrength])}>{pwdLabels[pwdStrength]}</span>
                      </div>
                    )}
                  </Field>

                  <Field label="Confirmer le nouveau mot de passe">
                    <PwdInput
                      value={confirmPwd}
                      onChange={setConfirmPwd}
                      show={showConPwd}
                      onToggle={() => setShowConPwd(v => !v)}
                      autoComplete="new-password"
                      tone={confirmPwd ? (confirmPwd === newPwd ? 'ok' : 'err') : undefined}
                    />
                    {confirmPwd.length > 0 && confirmPwd !== newPwd ? (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">Les deux mots de passe ne correspondent pas.</p>
                    ) : null}
                  </Field>

                  {pwdMsg && <Msg type={pwdMsg.type} text={pwdMsg.text} />}

                  <button
                    type="submit"
                    disabled={savingPwd || !newPwd || !confirmPwd}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0b1020] text-[15px] font-bold text-white transition hover:bg-black disabled:opacity-40"
                  >
                    {savingPwd ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Mettre à jour le mot de passe
                  </button>
                </div>

                <div className="mt-8 grid gap-3 border-t border-gray-100 pt-6 sm:grid-cols-2">
                  <button type="button" onClick={handleLogout} className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3.5 text-left transition hover:bg-gray-100">
                    <LogOut className="h-5 w-5 text-gray-500" />
                    <span>
                      <span className="block text-sm font-bold text-gray-900">Se déconnecter</span>
                      <span className="block text-xs text-gray-500">Fermer la session sur cet appareil</span>
                    </span>
                  </button>
                  <Link href="/delete-account" className="flex items-center gap-3 rounded-2xl bg-red-50/60 px-4 py-3.5 transition hover:bg-red-50">
                    <Trash2 className="h-5 w-5 text-red-500" />
                    <span>
                      <span className="block text-sm font-bold text-red-700">Supprimer mon compte</span>
                      <span className="block text-xs text-red-600/70">Effacer définitivement vos données</span>
                    </span>
                  </Link>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ── Petits composants locaux ──────────────────────────────────────────────────

function InfoRow({ icon, label, value, hint, multiline }: { icon: React.ReactNode; label: string; value?: string; hint?: string; multiline?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          {label}
          {hint ? <span className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-1.5 py-px text-[10px] font-bold text-gray-500"><Lock className="h-2.5 w-2.5" />{hint}</span> : null}
        </dt>
        <dd className={cn('mt-0.5 text-sm font-semibold [overflow-wrap:anywhere]', value ? 'text-gray-800' : 'font-normal italic text-gray-400', multiline && 'whitespace-pre-line')}>
          {value || 'Non renseigné'}
        </dd>
      </div>
    </div>
  );
}

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <label className="text-sm font-bold text-gray-800">{label}</label>
        {hint ? <span className="text-xs text-gray-400">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function PwdInput({ value, onChange, show, onToggle, placeholder = '••••••••', autoComplete, tone }: {
  value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder?: string; autoComplete?: string; tone?: 'ok' | 'err';
}) {
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type={show ? 'text' : 'password'}
        className={cn(inputCls, 'pl-11 pr-12', tone === 'ok' && 'border-emerald-400 focus:border-emerald-500', tone === 'err' && 'border-red-300 focus:border-red-400')}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button type="button" onClick={onToggle} aria-label={show ? 'Masquer' : 'Afficher'} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Msg({ type, text }: { type: 'ok' | 'err'; text: string }) {
  return (
    <div role="status" className={cn('flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold', type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>
      {type === 'ok' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      {text}
    </div>
  );
}
