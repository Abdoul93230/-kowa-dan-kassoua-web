// app/login/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShoppingBag,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
  ArrowLeft,
  Smartphone,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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

interface LoginData {
  loginType: 'phone' | 'email';
  phone: PhoneNumber;
  email: string;
  password: string;
  rememberMe: boolean;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'new'>('request');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [loginData, setLoginData] = useState<LoginData>({
    loginType: 'phone',
    phone: {
      countryCode: '+227',
      number: ''
    },
    email: '',
    password: '',
    rememberMe: false
  });

  // Afficher le message de bienvenue si redirection depuis l'inscription
  useEffect(() => {
    if (searchParams?.get('welcome') === 'true') {
      setSuccessMessage('Compte créé avec succès ! Connectez-vous pour commencer.');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [searchParams]);

  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (loginData.loginType === 'phone') {
      if (!loginData.phone.number.trim()) {
        newErrors.phone = 'Le numéro de téléphone est requis';
      } else if (loginData.phone.number.length < 7) {
        newErrors.phone = 'Numéro de téléphone invalide';
      }
    } else {
      if (!loginData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
        newErrors.email = 'Email invalide';
      }
    }
    
    if (!loginData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLogin()) return;
    
    setIsLoading(true);
    
    try {
      // Simuler l'authentification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulation de vérification (remplacer par votre logique réelle)
      if (loginData.password === 'password123') {
        // Stocker la session si "remember me" est coché
        if (loginData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('user', JSON.stringify({
            name: 'Ali Traoré',
            phone: loginData.loginType === 'phone' 
              ? `${loginData.phone.countryCode} ${loginData.phone.number}`
              : null,
            email: loginData.loginType === 'email' ? loginData.email : null
          }));
        }
        
        router.push('/dashboard');
      } else {
        setErrors({ submit: 'Identifiants incorrects. Essayez password123 pour le test.' });
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (resetStep === 'request') {
      // Simuler l'envoi du code
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      setResetStep('verify');
      setSuccessMessage('Code de réinitialisation envoyé !');
    } else if (resetStep === 'verify') {
      if (verificationCode === '123456') {
        setResetStep('new');
        setSuccessMessage('Code vérifié !');
      } else {
        setErrors({ verification: 'Code incorrect. Essayez 123456 pour le test.' });
      }
    } else if (resetStep === 'new') {
      if (newPassword !== confirmNewPassword) {
        setErrors({ passwordMatch: 'Les mots de passe ne correspondent pas' });
        return;
      }
      if (newPassword.length < 6) {
        setErrors({ passwordLength: 'Le mot de passe doit contenir au moins 6 caractères' });
        return;
      }
      
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      
      setSuccessMessage('Mot de passe réinitialisé avec succès !');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetStep('request');
        setVerificationCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 2000);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      // Simuler la connexion sociale
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur connexion sociale:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phone: PhoneNumber): string => {
    return `${phone.countryCode} ${phone.number}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffe9de]/30 via-white to-orange-50/30 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <ShoppingBag className="h-8 w-8 text-[#ec5a13]" />
              <span className="text-2xl font-bold text-gray-900">MarketHub</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mt-20">
        {/* Message de succès */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Formulaire de connexion */}
        {!showForgotPassword ? (
          <Card className="p-8 shadow-xl border-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#ffe9de] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-[#ec5a13]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bienvenue de retour
              </h2>
              <p className="text-gray-600">
                Connectez-vous pour accéder à votre compte
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Type de connexion */}
              <div>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLoginData({ ...loginData, loginType: 'phone' })}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      loginData.loginType === 'phone'
                        ? 'bg-white shadow-sm text-[#ec5a13] font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone className="h-4 w-4 inline mr-2" />
                    Téléphone
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginData({ ...loginData, loginType: 'email' })}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      loginData.loginType === 'email'
                        ? 'bg-white shadow-sm text-[#ec5a13] font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </button>
                </div>
              </div>

              {/* Champ téléphone/email */}
              {loginData.loginType === 'phone' ? (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Numéro de téléphone
                  </Label>
                  <div className="flex gap-2">
                    <Select 
                      value={loginData.phone.countryCode} 
                      onValueChange={(value) => setLoginData({
                        ...loginData,
                        phone: { ...loginData.phone, countryCode: value }
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
                      value={loginData.phone.number}
                      onChange={(e) => setLoginData({
                        ...loginData,
                        phone: { ...loginData.phone, number: e.target.value }
                      })}
                      className="flex-1"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              ) : (
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@exemple.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              )}

              {/* Mot de passe */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    checked={loginData.rememberMe}
                    onCheckedChange={(checked) => setLoginData({ ...loginData, rememberMe: checked })}
                  />
                  <span className="text-sm text-gray-700">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#ec5a13] hover:text-[#d94f0f] font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Erreur de soumission */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Bouton de connexion */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ec5a13] hover:bg-[#d94f0f] py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Séparateur */}
            <div className="relative my-6">
              <Separator className="my-4" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                ou continuer avec
              </span>
            </div>

            {/* Connexion sociale */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                className="hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>

            {/* Lien vers l'inscription */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Pas encore de compte ? 
                <a href="/register" className="ml-1 text-[#ec5a13] hover:text-[#d94f0f] font-medium">
                  Créer un compte
                </a>
              </p>
            </div>

            {/* Connexion invité */}
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                <User className="h-4 w-4 mr-2" />
                Continuer en tant qu'invité
              </Button>
            </div>
          </Card>
        ) : (
          /* Formulaire de mot de passe oublié */
          <Card className="p-8 shadow-xl border-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#ffe9de] rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-[#ec5a13]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {resetStep === 'request' && 'Mot de passe oublié'}
                {resetStep === 'verify' && 'Vérification'}
                {resetStep === 'new' && 'Nouveau mot de passe'}
              </h2>
              <p className="text-gray-600">
                {resetStep === 'request' && 'Entrez votre email pour recevoir un code de réinitialisation'}
                {resetStep === 'verify' && 'Entrez le code envoyé à votre email'}
                {resetStep === 'new' && 'Choisissez votre nouveau mot de passe'}
              </p>
            </div>

            <div className="space-y-6">
              {resetStep === 'request' && (
                <div>
                  <Label htmlFor="resetEmail" className="text-sm font-medium text-gray-700 mb-2 block">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="contact@exemple.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {resetStep === 'verify' && (
                <div>
                  <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-700 mb-2 block">
                    Code de vérification
                  </Label>
                  <Input
                    id="verificationCode"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  {errors.verification && <p className="text-red-500 text-xs mt-1">{errors.verification}</p>}
                </div>
              )}

              {resetStep === 'new' && (
                <>
                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                      Nouveau mot de passe
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmNewPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmNewPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.passwordMatch && <p className="text-red-500 text-xs mt-1">{errors.passwordMatch}</p>}
                    {errors.passwordLength && <p className="text-red-500 text-xs mt-1">{errors.passwordLength}</p>}
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetStep('request');
                    setVerificationCode('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="flex-1 bg-[#ec5a13] hover:bg-[#d94f0f]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      {resetStep === 'request' && 'Envoyer le code'}
                      {resetStep === 'verify' && 'Vérifier'}
                      {resetStep === 'new' && 'Réinitialiser'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#ec5a13]" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
