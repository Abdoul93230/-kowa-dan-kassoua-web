'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useQuickAuth } from '@/contexts/QuickAuthContext';
import { updateProfile, changePassword } from '@/lib/api/auth';
import {
  User, Phone, MapPin, Mail, Lock, Eye, EyeOff,
  Edit2, Save, X, LogOut, Camera,
  AlertCircle, CheckCircle2, Loader2, Building2,
} from 'lucide-react';
import Link from 'next/link';

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

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

type Panel = 'edit' | 'security' | null;

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout } = useAuth();
  const { openQuickAuth } = useQuickAuth();

  const [panel, setPanel] = useState<Panel>(null);

  // ── Champs édition profil ──────────────────────────────────────────────────
  const [editName,         setEditName]         = useState('');
  const [editEmail,        setEditEmail]        = useState('');
  const [editLocation,     setEditLocation]     = useState('');
  const [editDescription,  setEditDescription]  = useState('');
  const [editBusinessType, setEditBusinessType] = useState<'individual' | 'professional'>('individual');
  const [editBusinessName, setEditBusinessName] = useState('');
  const [waDigits,         setWaDigits]         = useState('');
  const [waCountry,        setWaCountry]        = useState(COUNTRIES[0]);
  const [showCityPicker,   setShowCityPicker]   = useState(false);
  const [showWaPicker,     setShowWaPicker]     = useState(false);
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
  const panelRef = useRef<HTMLDivElement>(null);

  // Pré-remplir les champs quand user charge
  useEffect(() => {
    if (!user) return;
    setEditName(user.name || '');
    setEditAvatarUri(user.avatar || null);
    setEditEmail(user.email || '');
    setEditLocation(user.location || '');
    setEditDescription((user as any).description || '');
    setEditBusinessType((user as any).businessType || 'individual');
    setEditBusinessName((user as any).businessName || '');
    const raw = (user as any).whatsapp || '';
    if (raw) {
      const m = COUNTRIES.find(c => raw.startsWith(c.dialCode));
      if (m) {
        setWaCountry(m);
        setWaDigits(raw.replace(m.dialCode, '').trim().replace(/\s/g, ''));
      } else {
        setWaDigits(raw.replace(/\s/g, ''));
      }
    }
  }, [user]);

  // Scroll vers le panel quand il s'ouvre
  useEffect(() => {
    if (panel) setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [panel]);

  // ── Garde auth ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) openQuickAuth('/profile');
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#ec5a13]" />
      </div>
    );
  }

  if (!user) return null;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditAvatarFile(file);
    setEditAvatarUri(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSaveProfile = async () => {
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
        setProfileMsg({ type: 'ok', text: 'Profil mis à jour avec succès !' });
        setTimeout(() => { setProfileMsg(null); setPanel(null); }, 2000);
      }
    } catch (e: any) {
      setProfileMsg({ type: 'err', text: e.message || 'Erreur lors de la mise à jour' });
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (newPwd.length < 6)       { setPwdMsg({ type: 'err', text: 'Minimum 6 caractères' }); return; }
    if (newPwd !== confirmPwd)   { setPwdMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas' }); return; }
    if (!(user as any).needsPasswordChange && !currentPwd) {
      setPwdMsg({ type: 'err', text: 'Entrez votre mot de passe actuel' }); return;
    }
    setSavingPwd(true); setPwdMsg(null);
    try {
      const res = await changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      if (res.success) {
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        setPwdMsg({ type: 'ok', text: 'Mot de passe mis à jour !' });
        setTimeout(() => { setPwdMsg(null); setPanel(null); }, 2000);
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

  // ── Force mot de passe ─────────────────────────────────────────────────────
  const pwdStrength = newPwd.length === 0 ? 0 : newPwd.length < 6 ? 1 : newPwd.length < 10 ? 2 : newPwd.length < 14 ? 3 : 4;
  const pwdColors   = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  const pwdLabels   = ['', 'Trop court', 'Moyen', 'Fort', 'Très fort'];

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
        <Header />
      </Suspense>

      {/* Bannière MDP temporaire */}
      {(user as any).needsPasswordChange && (
        <div className="bg-orange-100 border-b border-orange-300 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-orange-800 flex-1">
            🔒 Personnalisez votre mot de passe pour sécuriser votre compte.
          </p>
          <button
            onClick={() => setPanel('security')}
            className="text-xs font-bold text-white bg-[#ec5a13] px-3 py-1.5 rounded-lg whitespace-nowrap"
          >
            Mettre à jour
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 flex-1 max-w-2xl">

        {/* ── Carte profil ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
          {/* Bandeau header orange */}
          <div className="h-24 bg-gradient-to-r from-[#ec5a13] to-[#d94f0f]" />

          {/* Avatar + nom */}
          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end justify-between mb-4">
              <div className="relative">
                {(panel === 'edit' ? editAvatarUri : null) || user.avatar ? (
                  <img
                    src={(panel === 'edit' ? editAvatarUri : null) || user.avatar!}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-[#ec5a13] to-[#d94f0f] flex items-center justify-center shadow-md">
                    <span className="text-3xl font-black text-white">{getInitials(user.name)}</span>
                  </div>
                )}
                {/* Bouton caméra sur l'avatar quand panel édition ouvert */}
                {panel === 'edit' && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#ec5a13] border-2 border-white flex items-center justify-center shadow-md hover:bg-[#d94f0f] transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </button>
                )}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                  <span className="text-white text-[9px] font-black">✓✓</span>
                </div>
              </div>
              <button
                onClick={() => setPanel(panel === 'edit' ? null : 'edit')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-[#ec5a13] text-[#ec5a13] font-bold text-sm hover:bg-orange-50 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Éditer
              </button>
            </div>

            <h1 className="text-xl font-black text-gray-900">{user.name}</h1>
            {user.email && <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>}

            {/* Infos */}
            <div className="mt-4 space-y-2.5">
              {user.phone && (
                <InfoRow icon={<Phone className="h-4 w-4" />} label="Téléphone" value={user.phone} />
              )}
              {user.location && (
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Ville" value={user.location} />
              )}
              {(user as any).businessType && (
                <InfoRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="Type de compte"
                  value={(user as any).businessType === 'professional' ? 'Professionnel' : 'Particulier'}
                />
              )}
              {(user as any).description && (
                <InfoRow icon={<User className="h-4 w-4" />} label="Bio" value={(user as any).description} />
              )}
            </div>
          </div>
        </div>

        {/* ── Menu items ── */}
        <div className="space-y-2 mb-5">
          <MenuItem icon="🔐" label="Sécurité et connexion" sub="Changer votre mot de passe"
            onClick={() => setPanel(panel === 'security' ? null : 'security')}
            active={panel === 'security'}
          />
          <Link href="/mes-annonces">
            <MenuItem icon="📦" label="Mes annonces" sub="Gérer vos publications" />
          </Link>
          <Link href="/messages">
            <MenuItem icon="💬" label="Messages" sub="Voir vos conversations" />
          </Link>
        </div>

        {/* ── Panel édition / sécurité ── */}
        {panel && (
          <div ref={panelRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
            {/* Header panel */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900">
                {panel === 'edit' ? '✏️  Éditer le profil' : '🔐  Sécurité et connexion'}
              </h2>
              <button onClick={() => setPanel(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* ── ÉDITER PROFIL ── */}
              {panel === 'edit' && (
                <>
                  {/* ── Photo de profil ── */}
                  <Field label="Photo de profil">
                    <div
                      className="relative w-full h-44 rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#ec5a13] transition-colors group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {editAvatarUri ? (
                        <img src={editAvatarUri} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                          <Camera className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                      {/* Overlay au hover */}
                      <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-bold flex items-center gap-2">
                          <Camera className="h-4 w-4" /> Changer la photo
                        </span>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {editAvatarFile && (
                      <button
                        type="button"
                        onClick={() => {
                          if (editAvatarUri) URL.revokeObjectURL(editAvatarUri);
                          setEditAvatarFile(null);
                          setEditAvatarUri(user.avatar || null);
                        }}
                        className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ✕ Annuler le changement
                      </button>
                    )}
                  </Field>

                  <Field label="Nom complet">
                    <input
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm transition-all"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Votre nom complet"
                    />
                  </Field>

                  <Field label="Adresse email">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm transition-all"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        placeholder="votre@email.com"
                      />
                    </div>
                  </Field>

                  <Field label="Ville">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCityPicker(v => !v)}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-left flex items-center gap-2 hover:border-[#ec5a13] transition-colors"
                      >
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className={editLocation ? 'text-gray-900' : 'text-gray-400'}>
                          {editLocation || 'Sélectionner une ville'}
                        </span>
                        <span className="ml-auto text-gray-400 text-xs">▾</span>
                      </button>
                      {showCityPicker && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-20 max-h-52 overflow-y-auto">
                          {CITIES.map(city => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => { setEditLocation(city); setShowCityPicker(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left ${editLocation === city ? 'bg-orange-50 text-[#ec5a13] font-semibold' : 'text-gray-700'}`}
                            >
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              {city}
                              {editLocation === city && <span className="ml-auto text-[#ec5a13] font-bold">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Field>

                  <Field label="Numéro WhatsApp">
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowWaPicker(v => !v)}
                          className="flex items-center gap-1.5 h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          <span className="text-lg">{waCountry.flag}</span>
                          <span className="text-gray-700">{waCountry.dialCode}</span>
                          <span className="text-gray-400 text-xs">▾</span>
                        </button>
                        {showWaPicker && (
                          <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                            {COUNTRIES.map(c => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => { setWaCountry(c); setWaDigits(''); setShowWaPicker(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${waCountry.code === c.code ? 'bg-orange-50 text-[#ec5a13] font-semibold' : 'text-gray-700'}`}
                              >
                                <span className="text-lg">{c.flag}</span>
                                <span className="flex-1 text-left">{c.name}</span>
                                <span className="text-gray-400 text-xs">{c.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="tel"
                          inputMode="numeric"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm transition-all"
                          placeholder={waCountry.pattern.map(n => '0'.repeat(n)).join(' ')}
                          value={formatWaDisplay(waDigits, waCountry.pattern)}
                          onChange={e => {
                            const digits = e.target.value.replace(/\D/g, '');
                            const maxLen = waCountry.pattern.reduce((a, b) => a + b, 0);
                            setWaDigits(digits.slice(0, maxLen));
                          }}
                        />
                        {waDigits && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            {waDigits.length}/{waCountry.pattern.reduce((a, b) => a + b, 0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Field>

                  <Field label="Type de compte">
                    <div className="grid grid-cols-2 gap-2">
                      {(['individual', 'professional'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setEditBusinessType(t)}
                          className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                            editBusinessType === t
                              ? 'border-[#ec5a13] bg-orange-50 text-[#ec5a13]'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {t === 'individual' ? '👤  Particulier' : '🏢  Professionnel'}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {editBusinessType === 'professional' && (
                    <Field label="Nom de l'entreprise">
                      <input
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm transition-all"
                        value={editBusinessName}
                        onChange={e => setEditBusinessName(e.target.value)}
                        placeholder="Nom de votre boutique / entreprise"
                      />
                    </Field>
                  )}

                  <Field label="Description / Bio">
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm resize-none transition-all"
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      placeholder="Parlez-nous de vous..."
                    />
                  </Field>

                  {profileMsg && (
                    <Msg type={profileMsg.type} text={profileMsg.text} />
                  )}

                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="w-full h-12 bg-gradient-to-r from-[#ec5a13] to-[#d94f0f] text-white font-bold rounded-xl shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-[15px]"
                  >
                    {savingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4" /> Enregistrer les modifications</>}
                  </button>
                </>
              )}

              {/* ── SÉCURITÉ ── */}
              {panel === 'security' && (
                <>
                  <div className="flex items-start gap-4 px-4 py-3 rounded-xl bg-orange-50 border border-orange-100">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Changer le mot de passe</p>
                      <p className="text-xs text-gray-500 mt-0.5">Utilisez un mot de passe fort et unique.</p>
                    </div>
                  </div>

                  {!(user as any).needsPasswordChange && (
                    <Field label="Mot de passe actuel">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showCurPwd ? 'text' : 'password'}
                          className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm transition-all"
                          value={currentPwd}
                          onChange={e => setCurrentPwd(e.target.value)}
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowCurPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showCurPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>
                  )}

                  <Field label="Nouveau mot de passe">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm transition-all"
                        value={newPwd}
                        onChange={e => setNewPwd(e.target.value)}
                        placeholder="Minimum 6 caractères"
                      />
                      <button type="button" onClick={() => setShowNewPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {newPwd.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwdStrength ? pwdColors[pwdStrength] : 'bg-gray-200'}`} />
                          ))}
                        </div>
                        <p className={`text-xs font-semibold ${['','text-red-500','text-orange-500','text-yellow-600','text-green-600'][pwdStrength]}`}>
                          {pwdLabels[pwdStrength]}
                        </p>
                      </div>
                    )}
                  </Field>

                  <Field label="Confirmer le nouveau mot de passe">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showConPwd ? 'text' : 'password'}
                        className={`w-full h-11 pl-10 pr-10 rounded-xl border-2 outline-none text-sm transition-all ${
                          confirmPwd && confirmPwd !== newPwd
                            ? 'border-red-300 bg-red-50'
                            : confirmPwd && confirmPwd === newPwd
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20'
                        }`}
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowConPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPwd.length > 0 && (
                      <p className={`text-xs font-semibold mt-1.5 ${newPwd === confirmPwd ? 'text-green-600' : 'text-red-500'}`}>
                        {newPwd === confirmPwd ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                      </p>
                    )}
                  </Field>

                  {pwdMsg && <Msg type={pwdMsg.type} text={pwdMsg.text} />}

                  <button
                    onClick={handleChangePassword}
                    disabled={savingPwd || !newPwd || !confirmPwd}
                    className="w-full h-12 bg-gradient-to-r from-[#ec5a13] to-[#d94f0f] text-white font-bold rounded-xl shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-[15px]"
                  >
                    {savingPwd ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Lock className="h-4 w-4" /> Mettre à jour le mot de passe</>}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Déconnexion ── */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-red-100 hover:bg-red-50 transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
            <LogOut className="h-4 w-4 text-red-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-red-600">Se déconnecter</p>
            <p className="text-xs text-gray-400 mt-0.5">Fermer votre session sur cet appareil</p>
          </div>
          <span className="text-red-400 text-lg group-hover:translate-x-0.5 transition-transform">›</span>
        </button>

      </div>

      <Footer />
    </div>
  );
}

// ── Petits composants locaux ──────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-[#ec5a13]">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, sub, onClick, active }: {
  icon: string; label: string; sub: string; onClick?: () => void; active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all text-left ${
        active ? 'bg-orange-50 border-[#ec5a13]' : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
      <span className="text-2xl w-8 text-center">{icon}</span>
      <div className="flex-1">
        <p className={`text-sm font-bold ${active ? 'text-[#ec5a13]' : 'text-gray-900'}`}>{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <span className={`text-lg ${active ? 'text-[#ec5a13]' : 'text-gray-300'}`}>›</span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</label>
      {children}
    </div>
  );
}

function Msg({ type, text }: { type: 'ok' | 'err'; text: string }) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${
      type === 'ok' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
    }`}>
      {type === 'ok'
        ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
      {text}
    </div>
  );
}
