// components/auth/PasswordReset.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Shield,
  Clock,
  Send,
  Key,
  Smartphone,
  Timer
} from 'lucide-react';

// Liste des pays avec leurs indicatifs
const countries = [
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', flag: '🇨🇮' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲' },
];

interface PhoneNumber {
  countryCode: string;
  number: string;
}

interface ResetData {
  resetType: 'email' | 'phone';
  email: string;
  phone: PhoneNumber;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordResetProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  showHeader?: boolean;
}

export default function PasswordReset({ onCancel, onSuccess, showHeader = true }: PasswordResetProps) {
  const [currentStep, setCurrentStep] = useState<'identify' | 'verify' | 'reset' | 'success'>('identify');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);
  
  const [resetData, setResetData] = useState<ResetData>({
    resetType: 'email',
    email: '',
    phone: {
      countryCode: '+227',
      number: ''
    },
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Timer pour le renvoi du code
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Timer pour le blocage
  useEffect(() => {
    if (blockTimeLeft > 0) {
      const timer = setTimeout(() => setBlockTimeLeft(blockTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (blockTimeLeft === 0 && isBlocked) {
      setIsBlocked(false);
      setAttempts(0);
    }
  }, [blockTimeLeft, isBlocked]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: PhoneNumber): boolean => {
    return phone.number.length >= 7;
  };

  const validatePassword = (password: string): boolean => {
    // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSendCode = async () => {
    const newErrors: Record<string, string> = {};
    
    if (resetData.resetType === 'email') {
      if (!resetData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!validateEmail(resetData.email)) {
        newErrors.email = 'Email invalide';
      }
    } else {
      if (!validatePhone(resetData.phone)) {
        newErrors.phone = 'Numéro de téléphone invalide';
      }
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    if (isBlocked) {
      setErrors({ blocked: `Trop de tentatives. Réessayez dans ${formatTime(blockTimeLeft)}` });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simuler l'envoi du code
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulation de vérification (remplacer par votre API)
      const isValidUser = resetData.resetType === 'email' 
        ? resetData.email === 'test@example.com' 
        : resetData.phone.number === '87727272';
      
      if (!isValidUser) {
        setAttempts(attempts + 1);
        if (attempts + 1 >= 3) {
          setIsBlocked(true);
          setBlockTimeLeft(300); // 5 minutes de blocage
          setErrors({ blocked: 'Trop de tentatives. Compte bloqué pour 5 minutes.' });
        } else {
          setErrors({ 
            notFound: resetData.resetType === 'email' 
              ? 'Email non trouvé. Essayez test@example.com pour le test.' 
              : 'Numéro non trouvé. Essayez 87727272 pour le test.' 
          });
        }
      } else {
        setCurrentStep('verify');
        setResendTimer(60); // 60 secondes avant de pouvoir renvoyer
        setSuccessMessage(`Code envoyé à ${resetData.resetType === 'email' ? resetData.email : `${resetData.phone.countryCode} ${resetData.phone.number}`}`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resetData.verificationCode.trim()) {
      setErrors({ code: 'Le code est requis' });
      return;
    }
    
    if (resetData.verificationCode !== '123456') {
      setAttempts(attempts + 1);
      if (attempts + 1 >= 3) {
        setIsBlocked(true);
        setBlockTimeLeft(300);
        setErrors({ blocked: 'Trop de tentatives. Compte bloqué pour 5 minutes.' });
      } else {
        setErrors({ code: 'Code incorrect. Essayez 123456 pour le test.' });
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep('reset');
      setAttempts(0);
    } catch (error) {
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResendTimer(60);
      setSuccessMessage('Code renvoyé avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ resend: 'Erreur lors du renvoi du code.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!validatePassword(resetData.newPassword)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre';
    }
    
    if (resetData.newPassword !== resetData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep('success');
      setSuccessMessage('Mot de passe réinitialisé avec succès !');
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } catch (error) {
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    
    const labels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return { strength, label: labels[strength], color: colors[strength] };
  };

  const passwordStrength = getPasswordStrength(resetData.newPassword);

  if (currentStep === 'success') {
    return (
      <Card className="p-8 shadow-xl border-0 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Mot de passe réinitialisé !
          </h2>
          <p className="text-slate-600 mb-6">
            Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-green-900">Conseils de sécurité</p>
                <ul className="text-xs text-green-700 mt-1 space-y-1">
                  <li>• Utilisez un mot de passe unique</li>
                  <li>• Ne le partagez avec personne</li>
                  <li>• Changez-le régulièrement</li>
                </ul>
              </div>
            </div>
          </div>
          <Button
            onClick={onSuccess}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Se connecter maintenant
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-xl border-0 max-w-md mx-auto">
      {showHeader && (
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {currentStep === 'identify' && 'Réinitialiser le mot de passe'}
            {currentStep === 'verify' && 'Vérification'}
            {currentStep === 'reset' && 'Nouveau mot de passe'}
          </h2>
          <p className="text-slate-600">
            {currentStep === 'identify' && 'Choisissez comment recevoir votre code de réinitialisation'}
            {currentStep === 'verify' && 'Entrez le code que nous vous avons envoyé'}
            {currentStep === 'reset' && 'Choisissez votre nouveau mot de passe sécurisé'}
          </p>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-8">
        {['identify', 'verify', 'reset'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                (currentStep === step) || 
                (currentStep === 'verify' && step === 'identify') ||
                (currentStep === 'reset' && step !== 'identify')
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {step === 'identify' && <Mail className="h-4 w-4" />}
              {step === 'verify' && <Smartphone className="h-4 w-4" />}
              {step === 'reset' && <Lock className="h-4 w-4" />}
            </div>
            {index < 2 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  (currentStep === 'verify' && index === 0) ||
                  (currentStep === 'reset' && index < 2)
                    ? 'bg-emerald-600'
                    : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {errors.blocked && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errors.blocked}
        </div>
      )}

      {/* Étape 1: Identification */}
      {currentStep === 'identify' && (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">
              Comment souhaitez-vous recevoir le code ?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResetData({ ...resetData, resetType: 'email' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  resetData.resetType === 'email'
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Mail
                  className={`h-6 w-6 mx-auto mb-2 ${
                    resetData.resetType === 'email' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    resetData.resetType === 'email' ? 'text-emerald-700' : 'text-slate-700'
                  }`}
                >
                  Email
                </p>
              </button>
              <button
                type="button"
                onClick={() => setResetData({ ...resetData, resetType: 'phone' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  resetData.resetType === 'phone'
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Phone
                  className={`h-6 w-6 mx-auto mb-2 ${
                    resetData.resetType === 'phone' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    resetData.resetType === 'phone' ? 'text-emerald-700' : 'text-slate-700'
                  }`}
                >
                  SMS
                </p>
              </button>
            </div>
          </div>

          {resetData.resetType === 'email' ? (
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-2 block">
                Adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@exemple.com"
                  value={resetData.email}
                  onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                  className="pl-10"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              {errors.notFound && <p className="text-red-500 text-xs mt-1">{errors.notFound}</p>}
            </div>
          ) : (
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Numéro de téléphone
              </Label>
              <div className="flex gap-2">
                <Select 
                  value={resetData.phone.countryCode} 
                  onValueChange={(value) => setResetData({
                    ...resetData,
                    phone: { ...resetData.phone, countryCode: value }
                  })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.dialCode}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.dialCode}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="87727272"
                  value={resetData.phone.number}
                  onChange={(e) => setResetData({
                    ...resetData,
                    phone: { ...resetData.phone, number: e.target.value }
                  })}
                  className="flex-1"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              {errors.notFound && <p className="text-red-500 text-xs mt-1">{errors.notFound}</p>}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Sécurité garantie
                </p>
                <p className="text-xs text-blue-700">
                  Le code expirera après 10 minutes pour votre sécurité.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            )}
            <Button
              onClick={handleSendCode}
              disabled={isLoading || isBlocked}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Envoyer le code
                  <Send className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Étape 2: Vérification */}
      {currentStep === 'verify' && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="code" className="text-sm font-medium text-slate-700 mb-2 block">
              Code de vérification
            </Label>
            <Input
              id="code"
              placeholder="123456"
              value={resetData.verificationCode}
              onChange={(e) => setResetData({ ...resetData, verificationCode: e.target.value })}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
            />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendTimer > 0 || isLoading}
              className="text-sm text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {resendTimer > 0 ? (
                <span className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Renvoyer dans {formatTime(resendTimer)}
                </span>
              ) : (
                'Renvoyer le code'
              )}
            </button>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('identify')}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button
              onClick={handleVerifyCode}
              disabled={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  Vérifier
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Étape 3: Nouveau mot de passe */}
      {currentStep === 'reset' && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700 mb-2 block">
              Nouveau mot de passe
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={resetData.newPassword}
                onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Indicateur de force du mot de passe */}
            {resetData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">Force du mot de passe</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.color.replace('bg-', 'text-')
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            
            {/* Critères du mot de passe */}
            <div className="mt-3 space-y-1">
              <p className="text-xs text-slate-600 mb-2">Le mot de passe doit contenir :</p>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  resetData.newPassword.length >= 8 ? 'bg-green-100' : 'bg-slate-100'
                }`}>
                  {resetData.newPassword.length >= 8 && (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  )}
                </div>
                <span className="text-xs text-slate-600">Au moins 8 caractères</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  /[A-Z]/.test(resetData.newPassword) ? 'bg-green-100' : 'bg-slate-100'
                }`}>
                  {/[A-Z]/.test(resetData.newPassword) && (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  )}
                </div>
                <span className="text-xs text-slate-600">1 majuscule</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  /[a-z]/.test(resetData.newPassword) ? 'bg-green-100' : 'bg-slate-100'
                }`}>
                  {/[a-z]/.test(resetData.newPassword) && (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  )}
                </div>
                <span className="text-xs text-slate-600">1 minuscule</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  /\d/.test(resetData.newPassword) ? 'bg-green-100' : 'bg-slate-100'
                }`}>
                  {/\d/.test(resetData.newPassword) && (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  )}
                </div>
                <span className="text-xs text-slate-600">1 chiffre</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 mb-2 block">
              Confirmer le mot de passe
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={resetData.confirmPassword}
                onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Important
                </p>
                <p className="text-xs text-amber-700">
                  Choisissez un mot de passe fort que vous n'utilisez nulle part ailleurs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('verify')}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                <>
                  Réinitialiser
                  <RefreshCw className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}