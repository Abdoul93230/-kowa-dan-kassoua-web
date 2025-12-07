'use client';

import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { categories, sellers } from '../../../lib/mockData';
import { mockItems } from '../../../lib/mockData'; // Pour simuler l'ajout
import {
  Package,
  Briefcase,
  Upload,
  X,
  MapPin,
  DollarSign,
  FileText,
  Tag,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
  type: 'product' | 'service';
  title: string;
  category: string;
  subcategory: string;
  price: string;
  negotiable: boolean;
  location: string;
  description: string;
  condition: 'new' | 'used' | '';
  brand: string;
  tags: string[];
  images: string[];
  delivery?: {
    available: boolean;
    cost: string;
    areas: string[];
    estimatedTime: string;
  };
  availability?: {
    days: string[];
    hours: string;
  };
  serviceArea?: string[];
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerWhatsapp: string;
}

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export function PublishForm() {
  const sellerId = 'seller_001'; // TODO: Remplacez par useAuth() en production
  const sellerData = sellers[sellerId];

  const initialFormData: FormData = {
    type: 'product',
    title: '',
    category: '',
    subcategory: '',
    price: '',
    negotiable: false,
    location: sellerData?.location || '',
    description: '',
    condition: '',
    brand: '',
    tags: [],
    images: [],
    delivery: {
      available: false,
      cost: '',
      areas: [],
      estimatedTime: '',
    },
    availability: {
      days: [],
      hours: '',
    },
    serviceArea: [],
    sellerName: sellerData?.name || '',
    sellerPhone: sellerData?.contactInfo.phone || '',
    sellerEmail: sellerData?.contactInfo.email || '',
    sellerWhatsapp: sellerData?.contactInfo.whatsapp || '',
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentTag, setCurrentTag] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [currentDeliveryArea, setCurrentDeliveryArea] = useState('');
  const [currentServiceArea, setCurrentServiceArea] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save draft
  useEffect(() => {
    const saved = localStorage.getItem('publishDraft');
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData(parsed);
      // Restaurer étape si draft complet
      if (parsed.sellerName && parsed.sellerPhone) setCurrentStep(3);
      else if (parsed.description) setCurrentStep(2);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('publishDraft', JSON.stringify(formData));
  }, [formData]);

  const selectedCategory = categories.find(cat => cat.slug === formData.category);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.type) newErrors.type = 'Choisissez un type';
      if (!formData.title.trim()) newErrors.title = 'Titre obligatoire';
      if (!formData.category) newErrors.category = 'Catégorie requise';
      if (formData.type === 'product' && !formData.condition) newErrors.condition = 'État requis';
    }

    if (step === 2) {
      if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Prix valide requis';
      if (!formData.location.trim()) newErrors.location = 'Localisation requise';
      if (!formData.description.trim() || formData.description.length < 30) newErrors.description = 'Description trop courte (min 30 caractères)';
      if (formData.images.length === 0) newErrors.images = 'Ajoutez au moins 1 image';
      if (formData.type === 'service' && formData.availability?.days.length === 0) newErrors.availability = 'Sélectionnez vos jours';
      if (formData.type === 'service' && !formData.availability?.hours) newErrors.hours = 'Indiquez vos horaires';
    }

    if (step === 3) {
      if (!formData.sellerName.trim()) newErrors.sellerName = 'Nom requis';
      if (!formData.sellerPhone.trim()) newErrors.sellerPhone = 'Téléphone requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (i: number) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, idx) => idx !== i) });
  };

  const isValidImageUrl = (url: string) => {
    try {
      new URL(url);
      return /\.(jpeg|jpg|gif|png|webp)/i.test(url);
    } catch {
      return false;
    }
  };

  const handleAddImage = () => {
    if (currentImageUrl.trim() && formData.images.length < 5 && isValidImageUrl(currentImageUrl)) {
      setFormData({ ...formData, images: [...formData.images, currentImageUrl.trim()] });
      setCurrentImageUrl('');
      setErrors({ ...errors, images: '' });
    } else if (currentImageUrl) {
      setErrors({ ...errors, images: 'URL image invalide' });
    }
  };

  const handleRemoveImage = (i: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) });
  };

  const handleAddArea = (type: 'delivery' | 'service') => {
    const value = type === 'delivery' ? currentDeliveryArea : currentServiceArea;
    const setter = type === 'delivery' ? setCurrentDeliveryArea : setCurrentServiceArea;

    if (value.trim()) {
      if (type === 'delivery') {
        setFormData({
          ...formData,
          delivery: { ...formData.delivery!, areas: [...(formData.delivery?.areas || []), value.trim()] },
        });
      } else {
        setFormData({ ...formData, serviceArea: [...(formData.serviceArea || []), value.trim()] });
      }
      setter('');
    }
  };

  const handleRemoveArea = (type: 'delivery' | 'service', i: number) => {
    if (type === 'delivery') {
      setFormData({
        ...formData,
        delivery: { ...formData.delivery!, areas: formData.delivery!.areas.filter((_, idx) => idx !== i) },
      });
    } else {
      setFormData({ ...formData, serviceArea: formData.serviceArea!.filter((_, idx) => idx !== i) });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) {
      const newItem: any = {
        id: Date.now(),
        title: formData.title,
        price: formData.negotiable ? `${formData.price} FCFA (négociable)` : `${formData.price} FCFA`,
        negotiable: formData.negotiable,
        location: formData.location,
        images: formData.images,
        mainImage: formData.images[0] || '',
        category: selectedCategory?.name || '',
        subcategory: formData.subcategory
  ? selectedCategory?.subcategories?.find(
      (s) => s.slug === formData.subcategory
    )?.name || ''
  : '',

        type: formData.type,
        description: formData.description,
        condition: formData.condition,
        brand: formData.brand,
        tags: formData.tags,
        seller: sellerData,
        sellerId,
        views: 0,
        favorites: 0,
        rating: 0,
        totalReviews: 0,
        promoted: false,
        featured: false,
        postedTime: 'Maintenant',
        postedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        delivery: formData.delivery?.available ? formData.delivery : undefined,
        availability: formData.type === 'service' ? formData.availability : undefined,
      };

      // Simulation ajout
      const catKey = formData.category as keyof typeof mockItems;
      if (mockItems[catKey]) {
        (mockItems[catKey] as any[]).unshift(newItem);
      }

      localStorage.removeItem('publishDraft');
      alert('✅ Annonce publiée avec succès ! Vous pouvez la voir dans la catégorie correspondante.');
      console.log('Nouvelle annonce:', newItem);

      // Reset
      setFormData(initialFormData);
      setCurrentStep(1);
      setErrors({});
    }
  };

  const renderPreview = () => (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="font-bold text-lg mb-2">{formData.title || 'Titre...'}</h3>
      {formData.images[0] && (
        <img src={formData.images[0]} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-3" />
      )}
      <p className="text-2xl font-bold text-emerald-600 mb-2">
        {formData.price ? `${formData.price} FCFA` : 'Prix...'} {formData.negotiable && '(négociable)'}
      </p>
      <p className="text-sm text-slate-600 mb-3">{formData.description.slice(0, 120)}...</p>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <MapPin className="h-4 w-4" />
        {formData.location || 'Localisation...'}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map(step => (
            <Tooltip key={step}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => validateStep(currentStep) && setCurrentStep(step)}
                  disabled={step > currentStep + 1}
                  className="flex items-center flex-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                        currentStep >= step
                          ? 'bg-emerald-600 text-white scale-110'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {currentStep > step ? <CheckCircle2 className="h-6 w-6" /> : step}
                    </div>
                    <span
                      className={`font-medium hidden sm:block ${
                        currentStep >= step ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {step === 1 && 'Type & Catégorie'}
                      {step === 2 && 'Détails'}
                      {step === 3 && 'Contact'}
                    </span>
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-6 transition-all ${
                        currentStep > step ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {step === 1 && 'Informations de base'}
                {step === 2 && 'Description, prix, photos...'}
                {step === 3 && 'Vos coordonnées (pré-remplies)'}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* ÉTAPE 1 */}
          {currentStep === 1 && (
            <Card className="p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-8">Informations de base</h2>

              {/* Type */}
              <div className="mb-8">
                <Label className="text-lg mb-4 block">Type d'annonce *</Label>
                <div className="grid grid-cols-2 gap-6">
                  {(['product', 'service'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`p-8 rounded-xl border-2 transition-all ${
                        formData.type === t
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {t === 'product' ? (
                        <Package className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
                      ) : (
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
                      )}
                      <p className="font-semibold text-lg">
                        {t === 'product' ? 'Produit' : 'Service'}
                      </p>
                    </button>
                  ))}
                </div>
                {errors.type && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.type}</p>}
              </div>

              {/* Titre */}
              <div className="mb-6">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  placeholder="Ex: iPhone 14 Pro Max 256GB comme neuf"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="mt-2 text-lg"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.title}</p>}
              </div>

              {/* Catégorie & Sous-catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label>Catégorie *</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v, subcategory: '' })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name} ({cat.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.category}</p>}
                </div>

                {selectedCategory?.subcategories && (
                  <div>
                    <Label>Sous-catégorie</Label>
                    <Select value={formData.subcategory} onValueChange={v => setFormData({ ...formData, subcategory: v })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Optionnel" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory.subcategories.map(sub => (
                          <SelectItem key={sub.id} value={sub.slug}>
                            {sub.name} ({sub.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Produit seulement */}
              <AnimatePresence>
                {formData.type === 'product' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div>
                      <Label>État *</Label>
                      <Select value={formData.condition} onValueChange={(v: 'new' | 'used') => setFormData({ ...formData, condition: v })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Neuf ou occasion ?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Neuf</SelectItem>
                          <SelectItem value="used">Occasion</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.condition && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.condition}</p>}
                    </div>
                    <div>
                      <Label>Marque</Label>
                      <Input
                        placeholder="Apple, Samsung..."
                        value={formData.brand}
                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end mt-10">
                <Button type="button" size="lg" onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                  Suivant <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card>
          )}

          {/* ÉTAPE 2 */}
          {currentStep === 2 && (
            <Card className="p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-8">Détails complets</h2>

              {/* Prix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label>Prix (FCFA) *</Label>
                  <Input
                    type="number"
                    placeholder="850000"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="mt-2 text-lg"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.price}</p>}
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Switch
                      checked={formData.negotiable}
                      onCheckedChange={v => setFormData({ ...formData, negotiable: v })}
                    />
                    <span className="font-medium">Prix négociable</span>
                  </label>
                </div>
              </div>

              {/* Localisation */}
              <div className="mb-6">
                <Label>Localisation *</Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Plateau, Dakar"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="pl-10"
                  />
                </div>
                {errors.location && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.location}</p>}
              </div>

              {/* Description */}
              <div className="mb-6">
                <Label>Description *</Label>
                <Textarea
                  placeholder="Décrivez en détail..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-40 mt-2"
                />
                <p className="text-sm text-slate-500 mt-1">{formData.description.length} caractères</p>
                {errors.description && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.description}</p>}
              </div>

              {/* Images */}
              <div className="mb-6">
                <Label>Photos (max 5) *</Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={currentImageUrl}
                    onChange={e => setCurrentImageUrl(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                  />
                  <Button type="button" onClick={handleAddImage}><Upload className="h-5 w-5" /></Button>
                </div>
                {errors.images && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.images}</p>}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-4 mt-4">
                    {formData.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-full h-32 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="mb-6">
                <Label>Tags (max 5)</Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    placeholder="iPhone, Comme neuf..."
                    value={currentTag}
                    onChange={e => setCurrentTag(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag} disabled={formData.tags.length >= 5}>
                    <Tag className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(i)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Livraison (Produit) */}
              <AnimatePresence>
                {formData.type === 'product' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-6 bg-slate-50 rounded-lg"
                  >
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <Switch
                        checked={formData.delivery?.available}
                        onCheckedChange={v => setFormData({ ...formData, delivery: { ...formData.delivery!, available: v } })}
                      />
                      <span className="font-medium text-lg">Livraison disponible</span>
                    </label>
                    {formData.delivery?.available && (
                      <div className="space-y-4 mt-4">
                        <Input
                          placeholder="Coût (ex: 5000 FCFA)"
                          value={formData.delivery.cost}
                          onChange={e => setFormData({ ...formData, delivery: { ...formData.delivery!, cost: e.target.value } })}
                        />
                        <Input
                          placeholder="Délai estimé (ex: 24-48h)"
                          value={formData.delivery.estimatedTime}
                          onChange={e => setFormData({ ...formData, delivery: { ...formData.delivery!, estimatedTime: e.target.value } })}
                        />
                        <div>
                          <Label>Zones couvertes</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Dakar, Thiès..."
                              value={currentDeliveryArea}
                              onChange={e => setCurrentDeliveryArea(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddArea('delivery'))}
                            />
                            <Button type="button" onClick={() => handleAddArea('delivery')}>+</Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.delivery.areas.map((area, i) => (
                              <Badge key={i} variant="outline">
                                {area} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveArea('delivery', i)} />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Disponibilités (Service) */}
              <AnimatePresence>
                {formData.type === 'service' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 space-y-6"
                  >
                    <div>
                      <Label className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" /> Jours disponibles *
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        {daysOfWeek.map(day => (
                          <label key={day} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={formData.availability?.days.includes(day)}
                              onCheckedChange={checked => {
                                const days = checked
                                  ? [...formData.availability!.days, day]
                                  : formData.availability!.days.filter(d => d !== day);
                                setFormData({ ...formData, availability: { ...formData.availability!, days } });
                              }}
                            />
                            <span>{day}</span>
                          </label>
                        ))}
                      </div>
                      {errors.availability && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.availability}</p>}
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Clock className="h-5 w-5" /> Horaires *
                      </Label>
                      <Input
                        placeholder="Ex: 8h - 19h"
                        value={formData.availability?.hours || ''}
                        onChange={e => setFormData({ ...formData, availability: { ...formData.availability!, hours: e.target.value } })}
                        className="mt-2 max-w-md"
                      />
                      {errors.hours && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.hours}</p>}
                    </div>

                    <div>
                      <Label>Zones d'intervention</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Dakar, Pikine..."
                          value={currentServiceArea}
                          onChange={e => setCurrentServiceArea(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddArea('service'))}
                        />
                        <Button type="button" onClick={() => handleAddArea('service')}>+</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.serviceArea?.map((area, i) => (
                          <Badge key={i} variant="outline">
                            {area} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveArea('service', i)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between mt-10">
                <Button type="button" variant="outline" size="lg" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-5 w-5" /> Retour
                </Button>
                <Button type="button" size="lg" onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                  Suivant <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card>
          )}

          {/* ÉTAPE 3 */}
          {currentStep === 3 && (
            <Card className="p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Vos coordonnées</h2>
              <p className="text-slate-600 mb-8">Pré-remplies avec votre profil. Vous pouvez les modifier.</p>

              <div className="space-y-6 max-w-2xl">
                <div>
                  <Label>Nom / Entreprise *</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="Tech Store Pro"
                      value={formData.sellerName}
                      onChange={e => setFormData({ ...formData, sellerName: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  {errors.sellerName && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.sellerName}</p>}
                </div>

                <div>
                  <Label>Téléphone *</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="+221 77 123 45 67"
                      value={formData.sellerPhone}
                      onChange={e => setFormData({ ...formData, sellerPhone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  {errors.sellerPhone && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {errors.sellerPhone}</p>}
                </div>

                <div>
                  <Label>WhatsApp</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="+221 77 123 45 67"
                      value={formData.sellerWhatsapp}
                      onChange={e => setFormData({ ...formData, sellerWhatsapp: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="contact@exemple.sn"
                      value={formData.sellerEmail}
                      onChange={e => setFormData({ ...formData, sellerEmail: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-10">
                <p className="font-semibold text-blue-900">🔒 Vos données sont protégées</p>
                <p className="text-sm text-blue-700 mt-1">
                  Elles ne sont visibles que par les acheteurs intéressés et jamais partagées.
                </p>
              </div>

              <div className="flex justify-between items-center mt-10">
                <Button type="button" variant="outline" size="lg" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-5 w-5" /> Retour
                </Button>

                <div className="flex gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="lg">
                        <Eye className="mr-2 h-5 w-5" /> Aperçu
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96">{renderPreview()}</PopoverContent>
                  </Popover>

                  <Button type="submit" size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="mr-2 h-6 w-6" /> Publier l'annonce
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </form>
  );
}