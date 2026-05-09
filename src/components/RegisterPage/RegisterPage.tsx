'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { register, sendOTP, verifyOTP, isAuthenticated } from '@/lib/api/auth';
import {
  Eye, EyeOff, Loader2, Camera, MapPin, Check,
} from 'lucide-react';

// ── Données pays ──────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'NE', name: 'Niger',         dialCode: '+227', flag: '🇳🇪', nationalLength: 8,  phoneGroups: [2,2,2,2],   sample: '90 12 34 56' },
  { code: 'SN', name: 'Sénégal',       dialCode: '+221', flag: '🇸🇳', nationalLength: 9,  phoneGroups: [2,3,2,2],   sample: '77 123 45 67' },
  { code: 'ML', name: 'Mali',          dialCode: '+223', flag: '🇲🇱', nationalLength: 8,  phoneGroups: [2,2,2,2],   sample: '60 12 34 56' },
  { code: 'BF', name: 'Burkina Faso',  dialCode: '+226', flag: '🇧🇫', nationalLength: 8,  phoneGroups: [2,2,2,2],   sample: '70 12 34 56' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮', nationalLength: 10, phoneGroups: [2,2,2,2,2], sample: '07 12 34 56 78' },
  { code: 'BJ', name: 'Bénin',         dialCode: '+229', flag: '🇧🇯', nationalLength: 8,  phoneGroups: [2,2,2,2],   sample: '90 12 34 56' },
  { code: 'TG', name: 'Togo',          dialCode: '+228', flag: '🇹🇬', nationalLength: 8,  phoneGroups: [2,2,2,2],   sample: '90 12 34 56' },
];

const NIGER_CITIES = [
  'Niamey','Zinder','Maradi','Agadez','Tahoua',
  'Dosso','Tillabéri','Diffa','Arlit',"Birni N'Konni",'Gaya','Tessaoua',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const onlyDigits = (v: string) => v.replace(/\D/g, '').replace(/^0+/, '');

const fmtNational = (country: typeof COUNTRIES[0], digits: string) => {
  let result = '';
  let i = 0;
  for (const len of country.phoneGroups) {
    const chunk = digits.slice(i, i + len);
    if (!chunk) break;
    result += (result ? ' ' : '') + chunk;
    i += len;
  }
  return result;
};

const pwdScore = (p: string) => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 6)         s++;
  if (p.length >= 10)        s++;
  if (/[A-Z]/.test(p))       s++;
  if (/[0-9]/.test(p))       s++;
  if (/[@$!%*?&]/.test(p))   s++;
  return s;
};

// ── Étapes phase 1 ────────────────────────────────────────────────────────────
const STEPS1 = [
  { id: 'name',            icon: '👋', label: 'Comment vous appelez-vous ?',  hint: 'Votre nom complet' },
  { id: 'country',         icon: '🌍', label: 'Votre pays ?',                 hint: 'Sélectionnez votre pays' },
  { id: 'phone',           icon: '📱', label: 'Votre numéro de téléphone ?',  hint: 'Numéro principal' },
  { id: 'whatsapp',        icon: '💬', label: 'Votre WhatsApp ?',              hint: 'Optionnel — même numéro par défaut' },
  { id: 'email',           icon: '✉️', label: 'Votre email ?',                hint: 'Optionnel' },
  { id: 'password',        icon: '🔒', label: 'Choisissez un mot de passe',   hint: 'Minimum 6 caractères' },
  { id: 'confirmPassword', icon: '✅', label: 'Confirmez votre mot de passe', hint: 'Retapez votre mot de passe' },
];

// ── Étapes phase 2 ────────────────────────────────────────────────────────────
const STEPS2_ALL = [
  { id: 'businessType', icon: '🏪', label: 'Quel type de compte ?',    hint: 'Particulier ou professionnel', always: true },
  { id: 'businessName', icon: '🏷️', label: "Nom de votre activité ?",  hint: 'Uniquement pour les professionnels', always: false },
  { id: 'description',  icon: '✍️', label: 'Décrivez votre activité',  hint: 'Optionnel', always: false },
  { id: 'location',     icon: '📍', label: 'Où êtes-vous situé ?',      hint: 'Votre ville', always: true },
  { id: 'avatar',       icon: '🤳', label: 'Une photo de profil ?',     hint: 'Optionnel — rassurez vos acheteurs', always: true },
];

// ── Composant principal ───────────────────────────────────────────────────────
type Phase = 'step1' | 'otp' | 'step2';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => { if (isAuthenticated()) router.push('/'); }, []);

  // ── Phase courante ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('step1');

  // ── Phase 1 ─────────────────────────────────────────────────────────────────
  const [idx1,       setIdx1]       = useState(0);
  const [country,    setCountry]    = useState(COUNTRIES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [showPwd,    setShowPwd]    = useState(false);
  const [showCPwd,   setShowCPwd]   = useState(false);
  const [form1, setForm1] = useState({
    name: '', phoneDigits: '', waDigits: '', email: '', password: '', confirmPassword: '',
  });
  const [err1, setErr1] = useState('');

  // ── OTP ─────────────────────────────────────────────────────────────────────
  const [otp,        setOtp]        = useState(['','','','','','']);
  const [devOtp,     setDevOtp]     = useState('');
  const [otpCooldown,setOtpCooldown]= useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [errOtp,     setErrOtp]     = useState('');
  const otpRefs = useRef<(HTMLInputElement|null)[]>([]);

  // OTP countdown
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  // ── Phase 2 ─────────────────────────────────────────────────────────────────
  const [idx2,         setIdx2]         = useState(0);
  const [businessType, setBusinessType] = useState<'individual'|'professional'>('individual');
  const [businessName, setBusinessName] = useState('');
  const [description,  setDescription]  = useState('');
  const [location,     setLocation]     = useState('');
  const [customLoc,    setCustomLoc]    = useState(false);
  const [avatarUri,    setAvatarUri]    = useState<string|null>(null);
  const [showCityModal,setShowCityModal]= useState(false);
  const [err2,         setErr2]         = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const steps2 = STEPS2_ALL.filter(s => s.always || businessType === 'professional');
  const step2  = steps2[idx2];

  // ── Données accumulées (step1 → otp → step2) ─────────────────────────────
  const apiPhone   = `${country.dialCode} ${form1.phoneDigits}`;
  const apiWa      = form1.waDigits ? `${country.dialCode} ${form1.waDigits}` : apiPhone;
  const fmtDisplay = `${country.dialCode} ${fmtNational(country, form1.phoneDigits)}`;

  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 1 — validation & navigation
  // ─────────────────────────────────────────────────────────────────────────────
  const validateStep1 = (): string => {
    const s = STEPS1[idx1];
    switch (s.id) {
      case 'name':
        if (!form1.name.trim() || form1.name.trim().length < 2) return 'Minimum 2 caractères requis';
        break;
      case 'phone': {
        const d = form1.phoneDigits;
        if (!d || d.length !== country.nationalLength) return `Exactement ${country.nationalLength} chiffres pour ${country.name}`;
        if (/^(\d)\1+$/.test(d)) return 'Numéro invalide';
        break;
      }
      case 'whatsapp': {
        if (form1.waDigits && form1.waDigits.length !== country.nationalLength) return `Exactement ${country.nationalLength} chiffres pour ${country.name}`;
        if (form1.waDigits && /^(\d)\1+$/.test(form1.waDigits)) return 'Numéro invalide';
        break;
      }
      case 'email':
        if (form1.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form1.email)) return 'Email invalide';
        break;
      case 'password':
        if (!form1.password || form1.password.length < 6) return 'Minimum 6 caractères';
        break;
      case 'confirmPassword':
        if (form1.password !== form1.confirmPassword) return 'Les mots de passe ne correspondent pas';
        break;
    }
    return '';
  };

  const goNext1 = async () => {
    const e = validateStep1();
    if (e) { setErr1(e); return; }
    setErr1('');

    // Auto-fill whatsapp si vide quand on quitte phone
    if (STEPS1[idx1].id === 'phone' && !form1.waDigits) {
      setForm1(p => ({ ...p, waDigits: p.phoneDigits }));
    }

    if (idx1 < STEPS1.length - 1) {
      setIdx1(i => i + 1);
    } else {
      // Dernier step phase 1 → envoyer OTP
      await handleSendOTP();
    }
  };

  const handleSendOTP = async () => {
    setOtpLoading(true); setErr1('');
    try {
      const res = await sendOTP(apiPhone);
      const devCode = res.devOTP || res.data?.devOTP;
      if (devCode) setDevOtp(String(devCode));
      setOtpCooldown(res.data?.cooldownSeconds || 60);
      setPhase('otp');
    } catch (e: any) {
      setErr1(e.message || "Erreur lors de l'envoi du code");
    } finally {
      setOtpLoading(false);
    }
  };

  const goPrev1 = () => {
    setErr1('');
    if (idx1 > 0) setIdx1(i => i - 1);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE OTP
  // ─────────────────────────────────────────────────────────────────────────────
  const handleOtpChange = (i: number, val: string) => {
    const d = val.replace(/\D/g,'').slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) otpRefs.current[i+1]?.focus();
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i-1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (text.length === 6) {
      setOtp(text.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) { setErrOtp('Entrez les 6 chiffres'); return; }
    setOtpLoading(true); setErrOtp('');
    try {
      await verifyOTP(apiPhone, code);
      setPhase('step2');
    } catch (e: any) {
      setErrOtp(e.message || 'Code incorrect ou expiré');
    } finally {
      setOtpLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 2 — validation & navigation
  // ─────────────────────────────────────────────────────────────────────────────
  const validateStep2 = (): string => {
    switch (step2.id) {
      case 'businessName':
        if (!businessName.trim()) return "Le nom de votre activité est requis";
        break;
      case 'location':
        if (!location.trim()) return 'Veuillez sélectionner votre ville';
        break;
    }
    return '';
  };

  const goNext2 = async () => {
    const e = validateStep2();
    if (e) { setErr2(e); return; }
    setErr2('');
    if (idx2 < steps2.length - 1) {
      setIdx2(i => i + 1);
    } else {
      await handleSubmit();
    }
  };

  const goPrev2 = () => {
    setErr2('');
    if (idx2 > 0) setIdx2(i => i - 1);
    else setPhase('otp');
  };

  const handleSubmit = async () => {
    setSubmitting(true); setErr2('');
    try {
      await register({
        name:         form1.name.trim(),
        phone:        apiPhone,
        whatsapp:     apiWa,
        email:        form1.email.trim() || undefined,
        password:     form1.password,
        businessType,
        businessName: businessType === 'professional' ? businessName.trim() : form1.name.trim(),
        description:  description.trim() || undefined,
        location:     location.trim(),
        avatar:       avatarUri,
      });
      window.dispatchEvent(new Event('auth:changed'));
      router.push('/');
    } catch (e: any) {
      setErr2(e.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SOUS-COMPOSANTS RÉUTILISABLES
  // ─────────────────────────────────────────────────────────────────────────────

  // Header ardoise
  const Header = ({ segments, activeIdx, total }: { segments: number; activeIdx: number; total: number }) => (
    <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] px-5 pt-5 pb-4 border-b-2 border-[#ec5a13]">
      {/* Logo + lien connexion */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => phase === 'step1' ? (idx1 > 0 ? goPrev1() : router.push('/')) : phase === 'otp' ? setPhase('step1') : goPrev2()}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-[#ec5a13] to-[#d94f0f] rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">K</span>
          </div>
          <span className="text-white font-black text-base">Kowa</span>
        </div>
        <button onClick={() => router.push('/login')} className="text-xs font-semibold text-white/70 border border-white/20 px-3 py-1.5 rounded-lg">
          Connexion
        </button>
      </div>
      {/* Barres segmentées */}
      <div className="flex gap-1 mb-2">
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
            i < activeIdx ? 'bg-[#ec5a13]' : i === activeIdx ? 'bg-amber-400' : 'bg-white/15'
          }`} />
        ))}
      </div>
      <span className="text-[11px] font-semibold text-white/40">{activeIdx + 1} / {total}</span>
    </div>
  );

  // Bouton footer
  const Footer = ({ onPress, label, loading, disabled }: { onPress: () => void; label: string; loading?: boolean; disabled?: boolean }) => (
    <div className="px-5 pb-6 pt-4 bg-white border-t border-gray-100">
      <button
        onClick={onPress}
        disabled={loading || disabled}
        className="w-full h-14 bg-gradient-to-r from-[#ec5a13] to-[#d94f0f] text-white font-black text-[15px] rounded-2xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : label}
      </button>
    </div>
  );

  // Erreur inline
  const ErrBox = ({ msg }: { msg: string }) => msg ? (
    <div className="mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">
      ⚠ {msg}
    </div>
  ) : null;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER PHASE 1
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === 'step1') {
    const step = STEPS1[idx1];
    const score = pwdScore(form1.password);
    const scoreColors = ['','bg-red-400','bg-orange-400','bg-yellow-400','bg-green-400','bg-green-500'];
    const scoreLabels = ['','Faible','Moyen','Bon','Fort','Très fort 💪'];

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header segments={STEPS1.length} activeIdx={idx1} total={STEPS1.length} />

        <div className="flex-1 overflow-y-auto px-5 pt-8 pb-4">
          {/* Question */}
          <div className="mb-8">
            <span className="text-5xl">{step.icon}</span>
            <h2 className="mt-4 text-[26px] font-black text-gray-900 leading-tight">{step.label}</h2>
            <p className="mt-1 text-sm text-gray-400">{step.hint}</p>
          </div>

          {/* Input selon step */}
          {step.id === 'name' && (
            <input
              autoFocus
              className="w-full text-xl font-bold text-gray-900 border-b-[3px] border-[#ec5a13] bg-transparent pb-3 outline-none placeholder:font-normal placeholder:text-gray-300"
              placeholder="Ex: Amadou Diallo"
              value={form1.name}
              onChange={e => { setErr1(''); setForm1(p => ({ ...p, name: e.target.value })); }}
              onKeyDown={e => e.key === 'Enter' && goNext1()}
            />
          )}

          {step.id === 'country' && (
            <>
              <button
                onClick={() => setShowPicker(true)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 bg-white"
              >
                <span className="text-3xl">{country.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">{country.name}</p>
                  <p className="text-sm text-gray-400">{country.dialCode}</p>
                </div>
                <span className="text-gray-400">▾</span>
              </button>
              {/* Modal pays */}
              {showPicker && (
                <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowPicker(false)}>
                  <div className="w-full bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mt-3 mb-2" />
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                      <span className="font-black text-gray-900 text-lg">Choisir un pays</span>
                      <button onClick={() => setShowPicker(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">✕</button>
                    </div>
                    {COUNTRIES.map(c => (
                      <button key={c.code} onClick={() => { setCountry(c); setShowPicker(false); setErr1(''); setForm1(p => ({ ...p, phoneDigits: '', waDigits: '' })); }}
                        className={`w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 ${country.code === c.code ? 'bg-orange-50' : ''}`}>
                        <span className="text-2xl">{c.flag}</span>
                        <span className={`flex-1 text-left font-semibold ${country.code === c.code ? 'text-[#ec5a13]' : 'text-gray-800'}`}>{c.name}</span>
                        <span className="text-gray-400 text-sm">{c.dialCode}</span>
                        {country.code === c.code && <span className="text-[#ec5a13] font-black">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {(step.id === 'phone' || step.id === 'whatsapp') && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <span className="text-lg">{country.flag}</span>
                <span className="font-bold text-gray-700 text-sm">{country.dialCode}</span>
              </div>
              <input
                autoFocus
                inputMode="numeric"
                className="flex-1 text-xl font-bold text-gray-900 border-b-[3px] border-[#ec5a13] bg-transparent pb-3 outline-none placeholder:font-normal placeholder:text-gray-300"
                placeholder={step.id === 'phone' ? country.sample : `${country.sample} (optionnel)`}
                value={step.id === 'phone'
                  ? fmtNational(country, form1.phoneDigits)
                  : fmtNational(country, form1.waDigits)}
                onChange={e => {
                  const digits = onlyDigits(e.target.value).slice(0, country.nationalLength);
                  setErr1('');
                  if (step.id === 'phone') setForm1(p => ({ ...p, phoneDigits: digits }));
                  else setForm1(p => ({ ...p, waDigits: digits }));
                }}
                onKeyDown={e => e.key === 'Enter' && goNext1()}
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {(step.id === 'phone' ? form1.phoneDigits : form1.waDigits).length}/{country.nationalLength}
              </span>
            </div>
          )}

          {step.id === 'email' && (
            <input
              autoFocus
              type="email"
              className="w-full text-xl font-bold text-gray-900 border-b-[3px] border-[#ec5a13] bg-transparent pb-3 outline-none placeholder:font-normal placeholder:text-gray-300"
              placeholder="exemple@email.com (optionnel)"
              value={form1.email}
              onChange={e => { setErr1(''); setForm1(p => ({ ...p, email: e.target.value })); }}
              onKeyDown={e => e.key === 'Enter' && goNext1()}
            />
          )}

          {step.id === 'password' && (
            <div>
              <div className="relative">
                <input
                  autoFocus
                  type={showPwd ? 'text' : 'password'}
                  className="w-full text-xl font-bold text-gray-900 border-b-[3px] border-[#ec5a13] bg-transparent pb-3 pr-10 outline-none placeholder:font-normal placeholder:text-gray-300"
                  placeholder="Minimum 6 caractères"
                  value={form1.password}
                  onChange={e => { setErr1(''); setForm1(p => ({ ...p, password: e.target.value })); }}
                  onKeyDown={e => e.key === 'Enter' && goNext1()}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-0 top-2 text-gray-400">
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form1.password.length > 0 && (
                <>
                  <div className="flex gap-1 mt-4">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= score ? scoreColors[score] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-bold mt-1 ${['','text-red-500','text-orange-500','text-yellow-600','text-green-500','text-green-600'][score]}`}>
                    {scoreLabels[score]}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      { ok: form1.password.length >= 6, txt: '6 car. min' },
                      { ok: /[A-Z]/.test(form1.password), txt: 'Majuscule' },
                      { ok: /[0-9]/.test(form1.password), txt: 'Chiffre' },
                      { ok: /[@$!%*?&]/.test(form1.password), txt: 'Spécial' },
                    ].map((c, i) => (
                      <span key={i} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${c.ok ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {c.ok ? '✓' : '○'} {c.txt}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {step.id === 'confirmPassword' && (
            <div>
              <div className="relative">
                <input
                  autoFocus
                  type={showCPwd ? 'text' : 'password'}
                  className={`w-full text-xl font-bold border-b-[3px] bg-transparent pb-3 pr-10 outline-none placeholder:font-normal placeholder:text-gray-300 ${
                    form1.confirmPassword && form1.confirmPassword !== form1.password ? 'border-red-400 text-red-600' :
                    form1.confirmPassword && form1.confirmPassword === form1.password ? 'border-green-500 text-gray-900' :
                    'border-[#ec5a13] text-gray-900'
                  }`}
                  placeholder="Retapez votre mot de passe"
                  value={form1.confirmPassword}
                  onChange={e => { setErr1(''); setForm1(p => ({ ...p, confirmPassword: e.target.value })); }}
                  onKeyDown={e => e.key === 'Enter' && goNext1()}
                />
                <button type="button" onClick={() => setShowCPwd(v => !v)} className="absolute right-0 top-2 text-gray-400">
                  {showCPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form1.confirmPassword.length > 0 && (
                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                  form1.password === form1.confirmPassword ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {form1.password === form1.confirmPassword ? '✓ Identiques' : '✕ Différents'}
                </div>
              )}
            </div>
          )}

          <ErrBox msg={err1} />
        </div>

        <Footer onPress={goNext1} label={idx1 < STEPS1.length - 1 ? 'Continuer →' : '✓ Envoyer le code'} loading={otpLoading} />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER OTP
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === 'otp') {
    const codeComplete = otp.every(d => d !== '');
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header simple */}
        <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] px-5 pt-5 pb-5 border-b-2 border-[#ec5a13]">
          <div className="flex items-center justify-between">
            <button onClick={() => setPhase('step1')} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg">←</button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-[#ec5a13] to-[#d94f0f] rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">K</span>
              </div>
              <span className="text-white font-black text-base">Kowa</span>
            </div>
            <div className="w-9" />
          </div>
        </div>

        <div className="flex-1 px-5 pt-10 pb-4">
          {/* Hero */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ec5a13] to-[#d94f0f] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">💬</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900">Vérifiez votre numéro</h2>
            <p className="mt-2 text-sm text-gray-500">Code envoyé au <span className="font-bold text-gray-800">{fmtDisplay}</span></p>
          </div>

          {/* Badge dev OTP */}
          {devOtp && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-yellow-300 mb-6">
              <span className="text-2xl">🔧</span>
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Mode développement</p>
                <p className="text-2xl font-black text-[#ec5a13] tracking-[0.3em]">{devOtp}</p>
              </div>
            </div>
          )}

          {/* 6 cases OTP */}
          <div className="flex gap-2 justify-center mb-4" onPaste={handleOtpPaste}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={el => { otpRefs.current[i] = el; }}
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKey(i, e)}
                className={`w-12 h-14 text-center text-2xl font-black rounded-xl border-2 outline-none transition-all ${
                  d ? 'border-[#ec5a13] bg-orange-50 text-[#ec5a13]' : 'border-gray-200 bg-white text-gray-900'
                } focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20`}
              />
            ))}
          </div>

          {errOtp && <div className="text-center text-sm text-red-600 font-semibold mb-4">⚠ {errOtp}</div>}

          {/* Renvoyer */}
          <div className="text-center">
            <button
              onClick={handleSendOTP}
              disabled={otpLoading || otpCooldown > 0}
              className="text-sm text-[#ec5a13] font-semibold disabled:opacity-40"
            >
              {otpCooldown > 0 ? `Renvoyer dans ${otpCooldown}s` : 'Renvoyer le code'}
            </button>
          </div>
        </div>

        <Footer onPress={handleVerifyOTP} label="Vérifier →" loading={otpLoading} disabled={!codeComplete} />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER PHASE 2
  // ─────────────────────────────────────────────────────────────────────────────
  const isLastStep2 = idx2 === steps2.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header segments={steps2.length} activeIdx={idx2} total={steps2.length} />

      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-4">
        {/* Question */}
        <div className="mb-8">
          <span className="text-5xl">{step2.icon}</span>
          <h2 className="mt-4 text-[26px] font-black text-gray-900 leading-tight">{step2.label}</h2>
          <p className="mt-1 text-sm text-gray-400">{step2.hint}</p>
        </div>

        {/* businessType */}
        {step2.id === 'businessType' && (
          <div className="grid grid-cols-2 gap-3">
            {(['individual','professional'] as const).map(t => (
              <button key={t} onClick={() => setBusinessType(t)}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                  businessType === t ? 'border-[#ec5a13] bg-orange-50' : 'border-gray-200 bg-white'
                }`}>
                <span className="text-3xl">{t === 'individual' ? '👤' : '💼'}</span>
                <span className={`font-bold text-sm ${businessType === t ? 'text-[#ec5a13]' : 'text-gray-700'}`}>
                  {t === 'individual' ? 'Particulier' : 'Professionnel'}
                </span>
                <span className="text-xs text-gray-400 text-center leading-tight">
                  {t === 'individual' ? 'Vendre vos biens personnels' : 'Gérer votre activité commerciale'}
                </span>
                {businessType === t && (
                  <div className="w-6 h-6 rounded-full bg-[#ec5a13] flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* businessName */}
        {step2.id === 'businessName' && (
          <input
            autoFocus
            className="w-full text-xl font-bold text-gray-900 border-b-[3px] border-[#ec5a13] bg-transparent pb-3 outline-none placeholder:font-normal placeholder:text-gray-300"
            placeholder="Ex: Boutique Amadou"
            value={businessName}
            onChange={e => { setErr2(''); setBusinessName(e.target.value); }}
            onKeyDown={e => e.key === 'Enter' && goNext2()}
          />
        )}

        {/* description */}
        {step2.id === 'description' && (
          <div>
            <textarea
              autoFocus
              rows={4}
              className="w-full text-base font-semibold text-gray-900 rounded-2xl border-2 border-gray-200 focus:border-[#ec5a13] bg-white px-4 py-3 outline-none resize-none transition-all"
              placeholder="Décrivez votre activité, vos produits ou services…"
              value={description}
              onChange={e => { setErr2(''); setDescription(e.target.value); }}
            />
            <p className={`text-xs font-semibold mt-1.5 ${description.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
              {description.length} / 20 min {description.length >= 20 ? '✓' : ''}
            </p>
          </div>
        )}

        {/* location */}
        {step2.id === 'location' && (
          <div>
            {!customLoc ? (
              <>
                <button onClick={() => setShowCityModal(true)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-200 bg-white mb-2">
                  <span className="text-xl">📍</span>
                  <span className={`flex-1 text-left font-semibold ${location ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
                    {location || 'Sélectionner votre ville…'}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>
                <button onClick={() => setCustomLoc(true)} className="text-sm text-[#ec5a13] font-semibold">
                  ✎ Saisir manuellement
                </button>
              </>
            ) : (
              <div>
                <input
                  autoFocus
                  className="w-full text-xl font-bold text-gray-900 border-b-[3px] border-[#ec5a13] bg-transparent pb-3 outline-none placeholder:font-normal placeholder:text-gray-300"
                  placeholder="Entrez votre localisation"
                  value={location}
                  onChange={e => { setErr2(''); setLocation(e.target.value); }}
                />
                <button onClick={() => { setCustomLoc(false); setShowCityModal(true); }} className="mt-3 text-sm text-[#ec5a13] font-semibold">
                  ← Choisir dans la liste
                </button>
              </div>
            )}

            {/* Modal villes */}
            {showCityModal && (
              <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowCityModal(false)}>
                <div className="w-full bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mt-3 mb-2" />
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <span className="font-black text-gray-900 text-lg">Sélectionner votre ville</span>
                    <button onClick={() => setShowCityModal(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">✕</button>
                  </div>
                  {NIGER_CITIES.map(city => (
                    <button key={city} onClick={() => { setLocation(`${city}, Niger`); setCustomLoc(false); setShowCityModal(false); setErr2(''); }}
                      className={`w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50 ${location === `${city}, Niger` ? 'bg-orange-50' : ''}`}>
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className={`flex-1 text-left font-semibold ${location === `${city}, Niger` ? 'text-[#ec5a13]' : 'text-gray-800'}`}>{city}, Niger</span>
                      {location === `${city}, Niger` && <span className="text-[#ec5a13] font-black">✓</span>}
                    </button>
                  ))}
                  <button onClick={() => { setCustomLoc(true); setShowCityModal(false); }}
                    className="w-full flex items-center gap-3 px-5 py-4 text-amber-500 font-semibold">
                    <span className="text-lg">✏️</span> Autre ville…
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* avatar */}
        {step2.id === 'avatar' && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <button onClick={() => fileRef.current?.click()}
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center">
                {avatarUri
                  ? <img src={avatarUri} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-2"><Camera className="h-10 w-10 text-gray-300" /><span className="text-xs text-gray-400 font-semibold">Appuyer</span></div>}
              </button>
              <button onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#ec5a13] to-[#d94f0f] border-2 border-white flex items-center justify-center shadow">
                <span className="text-white text-sm">✏️</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setAvatarUri(reader.result as string);
                reader.readAsDataURL(file);
                e.target.value = '';
              }} />
            <p className={`text-sm font-semibold ${avatarUri ? 'text-green-600' : 'text-gray-400'}`}>
              {avatarUri ? '✓ Photo sélectionnée' : 'JPG ou PNG'}
            </p>
            {avatarUri && (
              <button onClick={() => setAvatarUri(null)} className="text-xs text-red-400 font-semibold">Supprimer et rechoisir</button>
            )}
          </div>
        )}

        <ErrBox msg={err2} />

        {/* Carte bénéfices à la dernière étape */}
        {isLastStep2 && (
          <div className="mt-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ec5a13] to-[#d94f0f] flex items-center justify-center">
                <span className="text-xl">🎉</span>
              </div>
              <span className="font-black text-gray-900">Vous êtes prêt à commencer !</span>
            </div>
            {['Publiez des annonces gratuitement','Accès à des milliers d\'acheteurs au Niger','Messagerie directe avec vos clients','Support client dédié'].map((b, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ec5a13]" />
                <span className="text-sm text-gray-500">{b}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer
        onPress={goNext2}
        label={isLastStep2 ? '🎉 Créer mon compte' : 'Continuer →'}
        loading={submitting}
        disabled={step2.id === 'location' && !location.trim()}
      />
    </div>
  );
}
