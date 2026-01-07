// app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Store,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  Star,
  Clock,
  MessageSquare,
  Globe,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Zap,
  Users,
  TrendingUp
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

// Villes principales du Niger
const nigerCities = [
  'Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua', 'Dosso', 
  'Tillabéri', 'Diffa', 'Arlit', 'Birni N\'Konni', 'Gaya', 'Tessaoua'
];

interface PhoneNumber {
  countryCode: string;
  number: string;
}

interface FormData {
  // Étape 1: Informations de base
  name: string;
  phone: PhoneNumber;
  whatsapp: PhoneNumber;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Étape 2: Profil vendeur
  businessType: 'individual' | 'professional';
  businessName: string;
  description: string;
  location: string;
  categories: string[];
  
  // Étape 3: Préférences
  notifications: {
    sms: boolean;
    email: boolean;
    promotions: boolean;
  };
  language: string;
  avatar: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: {
      countryCode: '+227',
      number: ''
    },
    whatsapp: {
      countryCode: '+227',
      number: ''
    },
    email: '',
    password: '',
    confirmPassword: '',
    businessType: 'individual',
    businessName: '',
    description: '',
    location: '',
    categories: [],
    notifications: {
      sms: true,
      email: false,
      promotions: false
    },
    language: 'fr',
    avatar: ''
  });

  const [avatarPreview, setAvatarPreview] = useState('');

  // Validation par étape
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
      if (formData.name.length < 2) newErrors.name = 'Le nom doit contenir au moins 2 caractères';
      
      if (!formData.phone.number.trim()) newErrors.phone = 'Le numéro de téléphone est requis';
      if (formData.phone.number.length < 7) newErrors.phone = 'Numéro de téléphone invalide';
      
      if (!formData.password) newErrors.password = 'Le mot de passe est requis';
      if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
      
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
    } else if (step === 2) {
      if (!formData.businessName.trim()) newErrors.businessName = 'Le nom est requis';
      if (!formData.description.trim()) newErrors.description = 'La description est requise';
      if (formData.description.length < 20) newErrors.description = 'Décrivez votre activité en au moins 20 caractères';
      if (!formData.location) newErrors.location = 'La localisation est requise';
      if (formData.categories.length === 0) newErrors.categories = 'Sélectionnez au moins une catégorie';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        // Simuler l'envoi du code de vérification
        setIsVerifying(true);
        setTimeout(() => {
          setIsVerifying(false);
          setCurrentStep(2.5); // Étape de vérification
        }, 1500);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2.5) {
      setCurrentStep(1);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode === '123456') { // Code de test
      setCurrentStep(2);
      setSuccessMessage('Numéro vérifié avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrors({ verification: 'Code incorrect. Essayez 123456 pour le test.' });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryToggle = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c !== category)
      });
    } else if (formData.categories.length < 3) {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setIsLoading(true);
    
    try {
      // Simuler l'inscription
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Données d\'inscription:', formData);
      
      // Rediriger vers le tableau de bord ou la page de publication
      router.push('/dashboard?welcome=true');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phone: PhoneNumber): string => {
    return `${phone.countryCode} ${phone.number}`;
  };

  const businessCategories = [
    'Électronique', 'Alimentation', 'Immobilier', 'Automobile', 
    'Mode & Beauté', 'Services à domicile', 'Éducation', 'Santé',
    'Tourisme', 'Artisanat', 'Autre'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffe9de]/30 via-white to-orange-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#ec5a13] rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">MarketHub</span>
            </div>
            <div className="text-sm text-gray-600">
              Déjà un compte ? 
              <a href="/login" className="ml-1 text-[#ec5a13] hover:text-[#d94f0f] font-medium">
                Se connecter
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step || (currentStep === 2.5 && step === 2)
                      ? 'bg-[#ec5a13] text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step === 1 && <User className="h-5 w-5" />}
                  {step === 2 && <Store className="h-5 w-5" />}
                  {step === 3 && <CheckCircle2 className="h-5 w-5" />}
                </div>
                <span
                  className={`ml-3 text-sm font-medium ${
                    currentStep >= step || (currentStep === 2.5 && step === 2)
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  {step === 1 && 'Compte'}
                  {step === 2 && 'Profil'}
                  {step === 3 && 'Finalisation'}
                </span>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-6 w-20 ${
                      currentStep > step || (currentStep === 2.5 && step === 1)
                        ? 'bg-[#ec5a13]'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Étape 1: Informations de base */}
        {currentStep === 1 && (
          <Card className="p-8 shadow-xl border-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#ffe9de] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-[#ec5a13]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Créez votre compte
              </h2>
              <p className="text-gray-600">
                Rejoignez des milliers de vendeurs et commencez à vendre dès aujourd'hui
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                  Nom complet *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="Ex: Ali Traoré"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 text-base"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Numéro de téléphone *
                </Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.phone.countryCode} 
                    onValueChange={(value) => setFormData({
                      ...formData,
                      phone: { ...formData.phone, countryCode: value }
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
                    value={formData.phone.number}
                    onChange={(e) => setFormData({
                      ...formData,
                      phone: { ...formData.phone, number: e.target.value }
                    })}
                    className="flex-1"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  WhatsApp (optionnel)
                </Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.whatsapp.countryCode} 
                    onValueChange={(value) => setFormData({
                      ...formData,
                      whatsapp: { ...formData.whatsapp, countryCode: value }
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
                    value={formData.whatsapp.number}
                    onChange={(e) => setFormData({
                      ...formData,
                      whatsapp: { ...formData.whatsapp, number: e.target.value }
                    })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email (optionnel)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 text-base"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  Mot de passe *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10"
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

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                  Confirmer le mot de passe *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="bg-[#ffe9de] border border-[#ec5a13]/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-[#ec5a13] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#ec5a13] mb-1">
                      Sécurité garantie
                    </p>
                    <p className="text-xs text-gray-700">
                      Vos données sont protégées par un chiffrement de bout en bout. 
                      Nous ne partageons jamais vos informations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button
                onClick={handleNextStep}
                disabled={isVerifying}
                className="bg-[#ec5a13] hover:bg-[#d94f0f] px-8"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi du code...
                  </>
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Étape de vérification */}
        {currentStep === 2.5 && (
          <Card className="p-8 shadow-xl border-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#ffe9de] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-[#ec5a13]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Vérifiez votre numéro
              </h2>
              <p className="text-gray-600">
                Nous avons envoyé un code de vérification à {formatPhoneNumber(formData.phone)}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="code" className="text-sm font-medium text-gray-700 mb-2 block">
                  Code de vérification
                </Label>
                <Input
                  id="code"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                {errors.verification && <p className="text-red-500 text-xs mt-1">{errors.verification}</p>}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-[#ec5a13] hover:text-[#d94f0f]"
                >
                  Renvoyer le code
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevStep}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button
                onClick={handleVerifyCode}
                className="bg-[#ec5a13] hover:bg-[#d94f0f] px-8"
              >
                Vérifier
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Étape 2: Profil vendeur */}
        {currentStep === 2 && (
          <Card className="p-8 shadow-xl border-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#ffe9de] rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-8 w-8 text-[#ec5a13]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Votre profil vendeur
              </h2>
              <p className="text-gray-600">
                Présentez votre activité pour attirer plus de clients
              </p>
              {successMessage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {successMessage}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Type de vendeur
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, businessType: 'individual' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.businessType === 'individual'
                        ? 'border-emerald-600 bg-[#ffe9de]/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User
                      className={`h-8 w-8 mx-auto mb-2 ${
                        formData.businessType === 'individual' ? 'text-[#ec5a13]' : 'text-gray-400'
                      }`}
                    />
                    <p
                      className={`font-medium ${
                        formData.businessType === 'individual' ? 'text-[#d94f0f]' : 'text-gray-700'
                      }`}
                    >
                      Particulier
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, businessType: 'professional' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.businessType === 'professional'
                        ? 'border-emerald-600 bg-[#ffe9de]/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Briefcase
                      className={`h-8 w-8 mx-auto mb-2 ${
                        formData.businessType === 'professional' ? 'text-[#ec5a13]' : 'text-gray-400'
                      }`}
                    />
                    <p
                      className={`font-medium ${
                        formData.businessType === 'professional' ? 'text-[#d94f0f]' : 'text-gray-700'
                      }`}
                    >
                      Professionnel
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="businessName" className="text-sm font-medium text-gray-700 mb-2 block">
                  Nom de votre activité *
                </Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="businessName"
                    placeholder="Ex: Ali Tech Solutions"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="pl-10 text-base"
                  />
                </div>
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                  Description de votre activité *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez ce que vous proposez, votre expérience, ce qui vous rend unique..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-24 text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} caractères
                </p>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
                  Localisation *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Sélectionnez votre ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerCities.map((city) => (
                        <SelectItem key={city} value={`${city}, Niger`}>
                          {city}, Niger
                        </SelectItem>
                      ))}
                      <SelectItem value="Autre">Autre...</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.location === 'Autre' && (
                    <Input
                      placeholder="Entrez votre localisation"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-2"
                    />
                  )}
                </div>
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Catégories (max 3)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {businessCategories.map((category) => (
                    <Badge
                      key={category}
                      variant={formData.categories.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Photo de profil (optionnel)
                </Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('avatar')?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Choisir une photo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG - Max 2MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevStep}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button
                onClick={handleNextStep}
                className="bg-[#ec5a13] hover:bg-[#d94f0f] px-8"
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Étape 3: Finalisation */}
        {currentStep === 3 && (
          <Card className="p-8 shadow-xl border-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Préférences
              </h2>
              <p className="text-gray-600">
                Personnalisez votre expérience
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Notifications
                </Label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Notifications SMS</p>
                        <p className="text-xs text-gray-500">Recevoir des alertes par SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.notifications.sms}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, sms: checked }
                      })}
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Notifications Email</p>
                        <p className="text-xs text-gray-500">Recevoir des mises à jour par email</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.notifications.email}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, email: checked }
                      })}
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Promotions</p>
                        <p className="text-xs text-gray-500">Offres spéciales et nouveautés</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.notifications.promotions}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, promotions: checked }
                      })}
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="language" className="text-sm font-medium text-gray-700 mb-2 block">
                  Langue préférée
                </Label>
                <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="ha">Haoussa</SelectItem>
 <SelectItem value="dz">Djerma</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ec5a13] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Vous êtes prêt à commencer !
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[#ec5a13]" />
                        <span>Publiez illimité d'annonces</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[#ec5a13]" />
                        <span>Accès à des milliers d'acheteurs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[#ec5a13]" />
                        <span>Outils de promotion intégrés</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[#ec5a13]" />
                        <span>Support client dédié</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevStep}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#ec5a13] hover:bg-[#d94f0f] px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  <>
                    Créer mon compte
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
