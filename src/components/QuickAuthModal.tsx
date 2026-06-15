'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, Eye, EyeOff, Loader2, Phone, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuickAuth } from '@/contexts/QuickAuthContext';
import { useAuth } from '@/hooks/useAuth';
import { checkPhone, sendOTP, verifyOTP, quickRegister, login as apiLogin } from '@/lib/api/auth';

// ── Pays ────────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: 'NE', name: 'Niger',         dialCode: '+227', flag: '🇳🇪', length: 8,  pattern: [2,2,2,2],   sample: '90 12 34 56' },
  { code: 'SN', name: 'Sénégal',       dialCode: '+221', flag: '🇸🇳', length: 9,  pattern: [2,3,2,2],   sample: '77 123 45 67' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮', length: 10, pattern: [2,2,2,2,2], sample: '07 12 34 56 78' },
  { code: 'BF', name: 'Burkina Faso',  dialCode: '+226', flag: '🇧🇫', length: 8,  pattern: [2,2,2,2],   sample: '70 12 34 56' },
  { code: 'ML', name: 'Mali',          dialCode: '+223', flag: '🇲🇱', length: 8,  pattern: [2,2,2,2],   sample: '60 12 34 56' },
  { code: 'TG', name: 'Togo',          dialCode: '+228', flag: '🇹🇬', length: 8,  pattern: [2,2,2,2],   sample: '90 12 34 56' },
  { code: 'BJ', name: 'Bénin',         dialCode: '+229', flag: '🇧🇯', length: 8,  pattern: [2,2,2,2],   sample: '90 12 34 56' },
];

const STEPS = { PHONE: 'phone', LOGIN: 'login', REGISTER: 'register', OTP: 'otp' } as const;
type Step = typeof STEPS[keyof typeof STEPS];

const LABELS: Record<string, string> = {
  '': '', '1': 'Très déçu', '2': 'Déçu', '3': 'Correct', '4': 'Bien', '5': 'Excellent !'
};

function onlyDigits(v: string) { return v.replace(/\D/g, ''); }

// Formate les chiffres bruts selon le pattern du pays  ex: [2,2,2,2] → "90 12 34 56"
function formatPhone(digits: string, pattern: number[]): string {
  let pos = 0;
  const parts: string[] = [];
  for (const len of pattern) {
    const chunk = digits.slice(pos, pos + len);
    if (!chunk) break;
    parts.push(chunk);
    pos += len;
  }
  return parts.join(' ');
}

// ── Composant principal ──────────────────────────────────────────────────────

export default function QuickAuthModal() {
  const router = useRouter();
  const { isOpen, returnTo, sessionExpired, closeQuickAuth, triggerSuccess } = useQuickAuth();

  const [step, setStep] = useState<Step>(STEPS.PHONE);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [devTempPwd, setDevTempPwd] = useState('');
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);
  // rawDigits : chiffres bruts
  // apiPhone : format stocké en DB → "+227 90123456" (indicatif + espace + chiffres sans espaces)
  // fmtPhone : affichage UI → "+227 90 12 34 56" (avec espaces de groupement)
  const rawDigits = onlyDigits(phone);
  const apiPhone = `${country.dialCode} ${rawDigits}`;
  const fmtPhone = `${country.dialCode} ${formatPhone(rawDigits, country.pattern)}`;

  // Reset au closing
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(STEPS.PHONE);
        setPhone(''); setPassword(''); setName('');
        setOtp(['', '', '', '', '', '']);
        setError(''); setShowPwd(false); setDevOtp(''); setDevTempPwd('');
      }, 300);
    }
  }, [isOpen]);

  // Countdown renvoi OTP
  useEffect(() => {
    if (otpResendCooldown <= 0) return;
    const t = setTimeout(() => setOtpResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [otpResendCooldown]);

  // Scroll l'erreur en vue
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [error]);

  // Empêcher le scroll du body
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Fermeture par Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeQuickAuth(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeQuickAuth]);

  // ── Navigation après succès ──────────────────────────────────────────────

  const handleSuccess = useCallback(() => {
    // Notifie tous les useAuth() de l'onglet de relire le localStorage
    window.dispatchEvent(new Event('auth:changed'));
    triggerSuccess();
    if (returnTo) {
      if (returnTo.startsWith('/')) router.push(returnTo);
      else router.push(`/${returnTo}`);
    }
  }, [triggerSuccess, returnTo, router]);

  // ── Étape 1 : vérifier le numéro ────────────────────────────────────────

  const handleCheckPhone = async () => {
    if (rawDigits.length !== country.length) {
      setError(`Numéro invalide — exactement ${country.length} chiffres attendus (ex: ${country.sample})`);
      return;
    }
    setLoading(true); setError('');
    try {
      const res = await checkPhone(apiPhone);
      if (res.data?.exists) setStep(STEPS.LOGIN);
      else setStep(STEPS.REGISTER);
    } catch (e: any) {
      setError(e.message || 'Erreur de vérification');
    } finally {
      setLoading(false);
    }
  };

  // ── Étape 2a : login ────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (!password) { setError('Mot de passe requis'); return; }
    setLoading(true); setError('');
    try {
      await apiLogin({ loginType: 'phone', phone: apiPhone, password });
      handleSuccess();
    } catch (e: any) {
      setError(e.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  // ── Étape 2b : register → envoyer OTP ──────────────────────────────────

  const handleSendOTP = async () => {
    if (name.trim().length < 2) { setError('Nom trop court (2 caractères min.)'); return; }
    setLoading(true); setError('');
    try {
      const res = await sendOTP(apiPhone);
      setDevOtp(res.devOTP || res.data?.devOTP || '');
      setOtpResendCooldown(60);
      setStep(STEPS.OTP);
    } catch (e: any) {
      setError(e.message || "Erreur d'envoi du code");
    } finally {
      setLoading(false);
    }
  };

  // ── Étape 3 : vérifier OTP + quickRegister ──────────────────────────────

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Code incomplet'); return; }
    setLoading(true); setError('');
    try {
      await verifyOTP(apiPhone, code);
      const reg = await quickRegister({ name: name.trim(), phone: apiPhone });
      if (reg.success && reg.data?.tokens) {
        localStorage.setItem('accessToken', reg.data.tokens.accessToken);
        localStorage.setItem('refreshToken', reg.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(reg.data.user));
      }
      if (reg.devTempPassword) {
        setDevTempPwd(String(reg.devTempPassword));
      } else {
        handleSuccess();
      }
    } catch (e: any) {
      setError(e.message || 'Code incorrect');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input ────────────────────────────────────────────────────────────

  const handleOtpChange = (index: number, value: string) => {
    const digit = onlyDigits(value).slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError('');
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = onlyDigits(e.clipboardData.getData('text')).slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (otpResendCooldown > 0) return;
    setLoading(true); setError('');
    try {
      const res = await sendOTP(apiPhone);
      setDevOtp(res.devOTP || res.data?.devOTP || '');
      setOtpResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (e: any) {
      setError(e.message || "Erreur d'envoi");
    } finally {
      setLoading(false);
    }
  };

  // ── Back ────────────────────────────────────────────────────────────────

  const handleBack = () => {
    setError('');
    if (step === STEPS.LOGIN || step === STEPS.REGISTER) setStep(STEPS.PHONE);
    else if (step === STEPS.OTP) setStep(STEPS.REGISTER);
    else closeQuickAuth();
  };

  // ── Titres ───────────────────────────────────────────────────────────────

  const stepMeta = {
    [STEPS.PHONE]:    { icon: '📱', title: 'Votre numéro',    sub: 'Connexion ou inscription en quelques secondes' },
    [STEPS.LOGIN]:    { icon: '🔐', title: 'Bon retour ! 👋', sub: 'Votre mot de passe pour continuer' },
    [STEPS.REGISTER]: { icon: '✨', title: 'Bienvenue !',     sub: "Créons votre profil express" },
    [STEPS.OTP]:      { icon: '📬', title: 'Code de vérif.', sub: `Code envoyé au ${fmtPhone}` },
  };
  const meta = stepMeta[step];
  const stepNum = { [STEPS.PHONE]: 1, [STEPS.LOGIN]: 2, [STEPS.REGISTER]: 2, [STEPS.OTP]: 3 }[step];
  const totalSteps = step === STEPS.LOGIN ? 2 : 3;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeQuickAuth}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

        {/* ── Barre de handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-gray-200" />
        </div>

        {/* ── Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>

          {/* Indicateur d'étapes */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < stepNum ? 'bg-[#ec5a13] w-6' : 'bg-gray-200 w-4'
                }`}
              />
            ))}
          </div>

          <button
            onClick={closeQuickAuth}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* ── Corps scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {sessionExpired && (
            <div className="mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <span>Votre session a expiré. Reconnectez-vous pour continuer.</span>
            </div>
          )}

          {/* Hero */}
          <div className="text-center mb-6">
            <span className="text-4xl">{meta.icon}</span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{meta.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{meta.sub}</p>
          </div>

          {/* ── ÉTAPE PHONE */}
          {step === STEPS.PHONE && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Numéro de téléphone
                </label>
                <div className="flex gap-2">
                  {/* Sélecteur pays */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryPicker((v) => !v)}
                      className="flex items-center gap-1.5 h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-gray-700">{country.dialCode}</span>
                      <span className="text-gray-400 text-xs">▾</span>
                    </button>
                    {showCountryPicker && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => { setCountry(c); setPhone(''); setShowCountryPicker(false); setError(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${country.code === c.code ? 'bg-orange-50 text-[#ec5a13] font-semibold' : 'text-gray-700'}`}
                          >
                            <span className="text-lg">{c.flag}</span>
                            <span className="flex-1 text-left">{c.name}</span>
                            <span className="text-gray-400">{c.dialCode}</span>
                            {country.code === c.code && <span className="text-[#ec5a13] font-bold">✓</span>}
                          </button>

                        ))}
                      </div>
                    )}
                  </div>
                  {/* Saisie numéro */}
                  <input
                    type="tel"
                    inputMode="numeric"
                    className="flex-1 h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm transition-all tracking-wide"
                    placeholder={country.sample}
                    value={formatPhone(rawDigits, country.pattern)}
                    onChange={(e) => {
                      const d = onlyDigits(e.target.value).slice(0, country.length);
                      setPhone(d);
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckPhone()}
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-400">ex: {country.sample}</p>
                  <p className={`text-xs font-medium ${rawDigits.length === country.length ? 'text-green-600' : 'text-gray-400'}`}>
                    {rawDigits.length}/{country.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE LOGIN */}
          {step === STEPS.LOGIN && (
            <div className="space-y-4">
              {/* Numéro (lecture seule) */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm font-medium text-gray-700 flex-1">{fmtPhone}</span>
                <button onClick={() => setStep(STEPS.PHONE)} className="text-xs text-[#ec5a13] font-semibold hover:underline">
                  Modifier
                </button>
              </div>
              {/* Mot de passe */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => { closeQuickAuth(); router.push('/passwordreset'); }}
                className="text-xs text-[#ec5a13] hover:underline font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          {/* ── ÉTAPE REGISTER */}
          {step === STEPS.REGISTER && (
            <div className="space-y-4">
              {/* Numéro (lecture seule) */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm font-medium text-gray-700 flex-1">{fmtPhone}</span>
                <button onClick={() => setStep(STEPS.PHONE)} className="text-xs text-[#ec5a13] font-semibold hover:underline">
                  Modifier
                </button>
              </div>
              {/* Nom */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm transition-all"
                    placeholder="Ex: Amadou Diallo"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    autoCapitalize="words"
                    autoFocus
                  />
                </div>
              </div>
              {/* Info */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-100">
                <span className="text-base flex-shrink-0">🔒</span>
                <p className="text-xs text-orange-800 leading-relaxed">
                  Un code de vérification sera envoyé à votre numéro. Un mot de passe temporaire sera généré — vous pourrez le modifier ensuite.
                </p>
              </div>
            </div>
          )}

          {/* ── ÉTAPE OTP */}
          {step === STEPS.OTP && (
            <div className="space-y-6">

              {/* Badge mot de passe temporaire (après quickRegister) */}
              {devTempPwd && (
                <div className="flex flex-col gap-3 px-4 py-4 rounded-2xl bg-amber-50 border border-yellow-300">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔑</span>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Mot de passe temporaire</p>
                      <p className="text-2xl font-black text-[#ec5a13] tracking-[0.2em]">{devTempPwd}</p>
                    </div>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Notez ce mot de passe — vous en aurez besoin pour vous connecter. Vous pouvez le modifier dans votre profil.
                  </p>
                  <button
                    onClick={handleSuccess}
                    className="w-full h-10 bg-[#ec5a13] text-white font-bold rounded-xl text-sm"
                  >
                    J'ai noté, continuer →
                  </button>
                </div>
              )}

              {/* Badge dev OTP */}
              {devOtp && !devTempPwd && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-yellow-300">
                  <span className="text-2xl">🔧</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Mode développement</p>
                    <p className="text-2xl font-black text-[#ec5a13] tracking-[0.3em]">{devOtp}</p>
                  </div>
                </div>
              )}

              {/* Cases OTP + renvoi — masqués quand mot de passe temp affiché */}
              {!devTempPwd && (
                <>
                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
                          digit
                            ? 'border-[#ec5a13] bg-orange-50 text-[#ec5a13]'
                            : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-[#ec5a13] focus:bg-white'
                        }`}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                  {/* Renvoi */}
                  <div className="text-center">
                    {otpResendCooldown > 0 ? (
                      <p className="text-sm text-gray-500">
                        Renvoyer dans <span className="font-semibold text-[#ec5a13]">{otpResendCooldown}s</span>
                      </p>
                    ) : (
                      <button
                        onClick={handleResendOTP}
                        className="text-sm text-[#ec5a13] font-semibold hover:underline"
                      >
                        Renvoyer le code
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Bannière erreur — toujours visible */}
          {error && (
            <div
              ref={errorRef}
              className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="flex-1 text-sm font-medium text-red-700">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 flex-shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

        </div>

        {/* ── Footer bouton — masqué si mot de passe temporaire affiché (badge a son propre bouton) */}
        {!devTempPwd && (
          <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
            <Button
              onClick={
                step === STEPS.PHONE ? handleCheckPhone :
                step === STEPS.LOGIN ? handleLogin :
                step === STEPS.REGISTER ? handleSendOTP :
                handleVerifyOTP
              }
              disabled={
                loading ||
                (step === STEPS.PHONE && rawDigits.length !== country.length)
              }
              className="w-full h-12 bg-[#ec5a13] hover:bg-[#d94f0f] text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 text-[15px]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {step === STEPS.PHONE && 'Continuer →'}
                  {step === STEPS.LOGIN && 'Se connecter →'}
                  {step === STEPS.REGISTER && 'Vérifier mon numéro →'}
                  {step === STEPS.OTP && 'Confirmer →'}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
