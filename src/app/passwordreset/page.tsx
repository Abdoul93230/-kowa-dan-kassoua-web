'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { forgotPassword, verifyResetCode, resetPassword } from '@/lib/api/auth';

// ── Pays (même liste que QuickAuthModal) ─────────────────────────────────────
const COUNTRIES = [
  { code: 'NE', name: 'Niger',         dialCode: '+227', flag: '🇳🇪', length: 8,  pattern: [2,2,2,2],   sample: '90 12 34 56' },
  { code: 'SN', name: 'Sénégal',       dialCode: '+221', flag: '🇸🇳', length: 9,  pattern: [2,3,2,2],   sample: '77 123 45 67' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮', length: 10, pattern: [2,2,2,2,2], sample: '07 12 34 56 78' },
  { code: 'BF', name: 'Burkina Faso',  dialCode: '+226', flag: '🇧🇫', length: 8,  pattern: [2,2,2,2],   sample: '70 12 34 56' },
  { code: 'ML', name: 'Mali',          dialCode: '+223', flag: '🇲🇱', length: 8,  pattern: [2,2,2,2],   sample: '60 12 34 56' },
  { code: 'TG', name: 'Togo',          dialCode: '+228', flag: '🇹🇬', length: 8,  pattern: [2,2,2,2],   sample: '90 12 34 56' },
  { code: 'BJ', name: 'Bénin',         dialCode: '+229', flag: '🇧🇯', length: 8,  pattern: [2,2,2,2],   sample: '90 12 34 56' },
];

function onlyDigits(v: string) { return v.replace(/\D/g, ''); }

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

type Step = 'identify' | 'verify' | 'reset' | 'success';
type RecoveryType = 'phone' | 'email';

export default function PasswordResetPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('identify');
  const [recoveryType, setRecoveryType] = useState<RecoveryType>('phone');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // identifier envoyé à l'API (format DB : "+227 90123456")
  const apiPhone = `${country.dialCode} ${phoneDigits}`;
  const identifier = recoveryType === 'phone' ? apiPhone : email.trim().toLowerCase();
  const rawFormatted = formatPhone(phoneDigits, country.pattern);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Étape 1 : envoyer code ────────────────────────────────────────────────
  const handleSend = async () => {
    if (recoveryType === 'phone') {
      if (phoneDigits.length !== country.length) {
        setError(`Numéro invalide — exactement ${country.length} chiffres attendus`);
        return;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Adresse email invalide');
        return;
      }
    }
    setLoading(true); setError('');
    try {
      const res = await forgotPassword(identifier);
      setDevCode(res.devCode || '');
      setResendCooldown(60);
      setStep('verify');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  // ── Étape 2 : vérifier OTP ────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Code incomplet'); return; }
    setLoading(true); setError('');
    try {
      await verifyResetCode(identifier, code);
      setStep('reset');
    } catch (e: any) {
      setError(e.message || 'Code incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true); setError('');
    try {
      const res = await forgotPassword(identifier);
      setDevCode(res.devCode || '');
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (e: any) {
      setError(e.message || 'Erreur lors du renvoi');
    } finally {
      setLoading(false);
    }
  };

  // ── Étape 3 : nouveau mot de passe ────────────────────────────────────────
  const handleReset = async () => {
    if (newPassword.length < 8) { setError('Minimum 8 caractères'); return; }
    if (!/[A-Z]/.test(newPassword)) { setError('Au moins 1 majuscule requise'); return; }
    if (!/\d/.test(newPassword)) { setError('Au moins 1 chiffre requis'); return; }
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true); setError('');
    try {
      await resetPassword(identifier, otp.join(''), newPassword);
      setStep('success');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP inputs ────────────────────────────────────────────────────────────
  const handleOtpChange = (i: number, val: string) => {
    const d = onlyDigits(val).slice(-1);
    const next = [...otp]; next[i] = d; setOtp(next); setError('');
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = onlyDigits(e.clipboardData.getData('text')).slice(0, 6);
    if (digits.length === 6) { setOtp(digits.split('')); otpRefs.current[5]?.focus(); }
  };

  // ── Strength mot de passe ─────────────────────────────────────────────────
  const pwdChecks = [
    { ok: newPassword.length >= 8,     label: '8 caractères min.' },
    { ok: /[A-Z]/.test(newPassword),   label: '1 majuscule' },
    { ok: /[a-z]/.test(newPassword),   label: '1 minuscule' },
    { ok: /\d/.test(newPassword),      label: '1 chiffre' },
  ];
  const pwdStrength = pwdChecks.filter(c => c.ok).length;
  const strengthColor = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][pwdStrength];

  const fmtDisplay = recoveryType === 'phone' ? `${country.dialCode} ${rawFormatted}` : email;

  const stepMeta: Record<Step, { icon: string; title: string; sub: string }> = {
    identify: { icon: '🔒', title: 'Mot de passe oublié ?',    sub: 'Choisissez email ou téléphone — nous vous enverrons un code.' },
    verify:   { icon: '📬', title: 'Code de vérification',     sub: `Code envoyé au ${fmtDisplay}` },
    reset:    { icon: '🔑', title: 'Nouveau mot de passe',     sub: 'Choisissez un mot de passe fort' },
    success:  { icon: '✅', title: 'Mot de passe mis à jour !', sub: 'Vous pouvez maintenant vous connecter.' },
  };
  const meta = stepMeta[step];

  const stepNum = { identify: 1, verify: 2, reset: 3, success: 3 }[step];
  const totalSteps = 3;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── Header gradient (même que QuickAuthModal) ── */}
      <header
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '3px solid #ec5a13' }}
      >
        <button
          onClick={() => step === 'identify' ? router.push('/') : setStep(step === 'verify' ? 'identify' : 'verify')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center">
          <Image
            src="/branding/flogo-removebg-preview.png"
            alt="TakTak"
            width={150}
            height={56}
            className="h-24 w-auto object-contain"
          />
        </div>
        {/* Indicateur étapes */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i < stepNum ? 'bg-[#ec5a13] w-6' : 'bg-white/20 w-4'}`}
            />
          ))}
        </div>
      </header>

      {/* ── Corps scrollable ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-5 py-8">

          {/* Hero */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ec5a13] to-[#d94f0f] flex items-center justify-center shadow-lg shadow-[#ec5a13]/30">
                <span className="text-4xl">{meta.icon}</span>
              </div>
              <div className="absolute -inset-2 rounded-[32px] border-2 border-[#ec5a13]/30 pointer-events-none" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 text-center tracking-tight">{meta.title}</h1>
            <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">{meta.sub}</p>
          </div>

          {/* ── ÉTAPE IDENTIFY ── */}
          {step === 'identify' && (
            <div className="space-y-5">
              {/* Tab switcher */}
              <div className="relative flex bg-gray-100 rounded-2xl p-1 border border-gray-200">
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow transition-all duration-200"
                  style={{ left: recoveryType === 'phone' ? '4px' : 'calc(50%)' }}
                />
                {(['phone', 'email'] as RecoveryType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => { setRecoveryType(type); setError(''); }}
                    className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors rounded-xl ${
                      recoveryType === type ? 'text-[#ec5a13]' : 'text-gray-500'
                    }`}
                  >
                    {type === 'phone' ? '📱 Téléphone' : '✉️ Email'}
                  </button>
                ))}
              </div>

              {/* Champ */}
              {recoveryType === 'phone' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Numéro de téléphone
                  </label>
                  <div className="flex gap-2">
                    {/* Sélecteur pays */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryPicker(v => !v)}
                        className="flex items-center gap-1.5 h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="text-gray-700">{country.dialCode}</span>
                        <span className="text-gray-400 text-xs">▾</span>
                      </button>
                      {showCountryPicker && (
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                          {COUNTRIES.map(c => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => { setCountry(c); setPhoneDigits(''); setShowCountryPicker(false); setError(''); }}
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
                    <input
                      type="tel"
                      inputMode="numeric"
                      className="flex-1 h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm tracking-wide transition-all"
                      placeholder={country.sample}
                      value={rawFormatted}
                      onChange={e => { setPhoneDigits(onlyDigits(e.target.value).slice(0, country.length)); setError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-gray-400">ex: {country.sample}</p>
                    <p className={`text-xs font-medium ${phoneDigits.length === country.length ? 'text-green-600' : 'text-gray-400'}`}>
                      {phoneDigits.length}/{country.length}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm transition-all"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    autoFocus
                  />
                </div>
              )}

              {/* Info box */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-100">
                <span className="text-base flex-shrink-0">🔒</span>
                <p className="text-xs text-orange-800 leading-relaxed">
                  Le code expirera après 10 minutes pour votre sécurité.
                </p>
              </div>
            </div>
          )}

          {/* ── ÉTAPE VERIFY ── */}
          {step === 'verify' && (
            <div className="space-y-6">
              {/* Numéro/email affiché */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-lg">{recoveryType === 'phone' ? country.flag : '✉️'}</span>
                <span className="text-sm font-medium text-gray-700 flex-1">{fmtDisplay}</span>
                <button onClick={() => setStep('identify')} className="text-xs text-[#ec5a13] font-semibold hover:underline">
                  Modifier
                </button>
              </div>

              {/* Badge dev */}
              {devCode && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-yellow-300">
                  <span className="text-2xl">🔧</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Mode développement</p>
                    <p className="text-2xl font-black text-[#ec5a13] tracking-[0.3em]">{devCode}</p>
                  </div>
                </div>
              )}

              {/* OTP 6 cases */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">
                  Code reçu
                </label>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
                        digit
                          ? 'border-[#ec5a13] bg-orange-50 text-[#ec5a13]'
                          : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-[#ec5a13] focus:bg-white'
                      }`}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Renvoi */}
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Renvoyer dans <span className="font-semibold text-[#ec5a13]">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-sm text-[#ec5a13] font-semibold hover:underline disabled:opacity-50"
                  >
                    Renvoyer le code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── ÉTAPE RESET ── */}
          {step === 'reset' && (
            <div className="space-y-5">
              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20 outline-none text-sm transition-all"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setError(''); }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Barre de force */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwdStrength ? strengthColor : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {pwdChecks.map(c => (
                        <div key={c.label} className="flex items-center gap-1.5">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${c.ok ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {c.ok && <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />}
                          </div>
                          <span className={`text-xs ${c.ok ? 'text-green-700' : 'text-gray-400'}`}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmer */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    className={`w-full h-11 px-4 pr-10 rounded-xl border-2 outline-none text-sm transition-all ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-red-300 focus:border-red-400 bg-red-50'
                        : confirmPassword && confirmPassword === newPassword
                        ? 'border-green-400 focus:border-green-500 bg-green-50'
                        : 'border-gray-200 focus:border-[#ec5a13] focus:ring-2 focus:ring-[#ec5a13]/20'
                    }`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SUCCÈS ── */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-50 border border-green-200">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-bold text-green-900">Mot de passe réinitialisé !</p>
                  <p className="text-xs text-green-700 mt-0.5">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => { window.dispatchEvent(new CustomEvent('quickauth:open', { detail: { returnTo: '/' } })); router.push('/'); }}
                  className="w-full h-12 bg-gradient-to-r from-[#ec5a13] to-[#d94f0f] text-white font-bold rounded-xl shadow-sm shadow-[#ec5a13]/30 text-[15px]"
                >
                  Se connecter →
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full h-11 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          )}

          {/* ── Bannière erreur ── */}
          {error && (
            <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <span className="text-red-500 flex-shrink-0">⚠️</span>
              <p className="flex-1 text-sm font-medium text-red-700">{error}</p>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold text-xs">✕</button>
            </div>
          )}

          {/* Lien retour connexion */}
          {step === 'identify' && (
            <p className="text-center text-xs text-gray-400 mt-6">
              Vous vous souvenez ?{' '}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('quickauth:open', { detail: { returnTo: window.location.pathname } }))}
                className="text-[#ec5a13] font-semibold hover:underline"
              >
                Se connecter
              </button>
            </p>
          )}
        </div>
      </div>

      {/* ── Footer bouton sticky ── */}
      {step !== 'success' && (
        <div className="px-5 pb-6 pt-3 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={step === 'identify' ? handleSend : step === 'verify' ? handleVerify : handleReset}
            disabled={
              loading ||
              (step === 'identify' && recoveryType === 'phone' && phoneDigits.length !== country.length) ||
              (step === 'verify' && otp.join('').length < 6)
            }
            className="w-full h-12 bg-gradient-to-r from-[#ec5a13] to-[#d94f0f] text-white font-bold rounded-xl shadow-sm shadow-[#ec5a13]/30 disabled:opacity-50 disabled:cursor-not-allowed text-[15px] flex items-center justify-center gap-2 transition-opacity"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {step === 'identify' && 'Envoyer le code →'}
                {step === 'verify' && 'Vérifier →'}
                {step === 'reset' && 'Réinitialiser mon mot de passe →'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
