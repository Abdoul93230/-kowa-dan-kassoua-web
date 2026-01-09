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
import { categories } from '../../../lib/mockData';
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
  Phone,
  Mail,
  User,
  Clock,
  Calendar,
  Shield,
  Star,
  Info,
  AlertCircle,
  Plus,
  Globe,
  Edit2,
  Save,
  Trash2,
  Eye,
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
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
];

// Villes principales du Niger
const nigerCities = [
  'Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua', 'Dosso', 
  'Tillabéri', 'Diffa', 'Arlit', 'Birni N\'Konni', 'Gaya', 'Tessaoua'
];

// Simuler un vendeur connecté
const connectedSeller = {
  name: 'Ali Tech Solutions',
  phone: '+227 87727272',
  whatsapp: '+227 87727272',
  email: 'contact@alitech.ne',
  location: 'Niamey, Niger'
};

interface PhoneNumber {
  countryCode: string;
  number: string;
}

interface FormData {
  type: 'product' | 'service';
  title: string;
  category: string;
  subcategory: string;
  price: string;
  description: string;
  condition: 'new' | 'used' | '';
  brand: string;
  tags: string[];
  images: File[];
  delivery: boolean;
  deliveryCost: string;
  deliveryAreas: string[];
  availability: {
    days: string[];
    hours: string;
  };
  sellerName: string;
  sellerPhone: PhoneNumber;
  sellerWhatsapp: PhoneNumber;
  sellerEmail: string;
  quantity?: number;
  warranty?: string;
  returnPolicy?: string;
  specifications: Record<string, string>;
  duration?: string;
  serviceArea: string[];
  promoted?: boolean;
  featured?: boolean;
}

export function PublishForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    type: 'product',
    title: '',
    category: '',
    subcategory: '',
    price: '',
    description: '',
    condition: '',
    brand: '',
    tags: [],
    images: [],
    delivery: false,
    deliveryCost: '',
    deliveryAreas: [],
    availability: {
      days: [],
      hours: '',
    },
    sellerName: connectedSeller.name,
    sellerPhone: {
      countryCode: '+227',
      number: '87727272'
    },
    sellerWhatsapp: {
      countryCode: '+227',
      number: '87727272'
    },
    sellerEmail: connectedSeller.email,
    quantity: 1,
    warranty: '',
    returnPolicy: '',
    specifications: {},
    duration: '',
    serviceArea: [],
    promoted: false,
    featured: false,
  });

  const [currentTag, setCurrentTag] = useState('');
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editContactInfo, setEditContactInfo] = useState(false);
  const [newDeliveryArea, setNewDeliveryArea] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  const selectedCategory = categories.find(cat => cat.slug === formData.category);
  const daysOptions = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const formatPhoneNumber = (phone: PhoneNumber): string => {
    return `${phone.countryCode} ${phone.number}`;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.type) newErrors.type = 'Veuillez sélectionner un type';
      if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
      if (formData.title.length < 5) newErrors.title = 'Le titre doit contenir au moins 5 caractères';
      if (!formData.category) newErrors.category = 'Veuillez sélectionner une catégorie';
    } else if (step === 2) {
      if (!formData.price.trim()) newErrors.price = 'Le prix est requis';
      if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
        newErrors.price = 'Veuillez entrer un prix valide';
      }
      if (!formData.description.trim()) newErrors.description = 'La description est requise';
      if (formData.description.length < 20) {
        newErrors.description = 'La description doit contenir au moins 20 caractères';
      }
      
      if (formData.type === 'product' && !formData.condition) {
        newErrors.condition = "Veuillez sélectionner l'état du produit";
      }
      
      if (formData.type === 'service' && !formData.availability.days.length) {
        newErrors.availabilityDays = 'Veuillez sélectionner au moins un jour de disponibilité';
      }
      
      if (formData.type === 'service' && !formData.availability.hours.trim()) {
        newErrors.availabilityHours = 'Veuillez spécifier les heures de disponibilité';
      }
    } else if (step === 3) {
      if (!formData.sellerName.trim()) newErrors.sellerName = 'Votre nom est requis';
      if (!formData.sellerPhone.number.trim()) newErrors.sellerPhone = 'Votre numéro de téléphone est requis';
      
      // Validation basique du numéro de téléphone
      if (formData.sellerPhone.number.length < 7) {
        newErrors.sellerPhone = 'Veuillez entrer un numéro de téléphone valide';
      }
      
      if (formData.sellerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sellerEmail)) {
        newErrors.sellerEmail = 'Veuillez entrer une adresse email valide';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()],
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      alert('Vous pouvez ajouter maximum 5 images');
      return;
    }
    
    // Créer les previews
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setImagesPreviews([...imagesPreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const handleRemoveImage = (index: number) => {
    setImagesPreviews(imagesPreviews.filter((_, i) => i !== index));
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleAddDeliveryArea = () => {
    if (newDeliveryArea.trim() && !formData.deliveryAreas.includes(newDeliveryArea.trim())) {
      setFormData({
        ...formData,
        deliveryAreas: [...formData.deliveryAreas, newDeliveryArea.trim()],
      });
      setNewDeliveryArea('');
    }
  };

  const handleRemoveDeliveryArea = (area: string) => {
    setFormData({
      ...formData,
      deliveryAreas: formData.deliveryAreas.filter(a => a !== area),
    });
  };

  const handleAddServiceArea = () => {
    if (newServiceArea.trim() && !formData.serviceArea.includes(newServiceArea.trim())) {
      setFormData({
        ...formData,
        serviceArea: [...formData.serviceArea, newServiceArea.trim()],
      });
      setNewServiceArea('');
    }
  };

  const handleRemoveServiceArea = (area: string) => {
    setFormData({
      ...formData,
      serviceArea: formData.serviceArea.filter(a => a !== area),
    });
  };

  const handleToggleAvailabilityDay = (day: string) => {
    if (formData.availability.days.includes(day)) {
      setFormData({
        ...formData,
        availability: {
          ...formData.availability,
          days: formData.availability.days.filter(d => d !== day),
        },
      });
    } else {
      setFormData({
        ...formData,
        availability: {
          ...formData.availability,
          days: [...formData.availability.days, day],
        },
      });
    }
  };

  const handleToggleAllDays = () => {
    if (formData.availability.days.length === daysOptions.length) {
      // Désélectionner tous
      setFormData({
        ...formData,
        availability: {
          ...formData.availability,
          days: [],
        },
      });
    } else {
      // Sélectionner tous
      setFormData({
        ...formData,
        availability: {
          ...formData.availability,
          days: [...daysOptions],
        },
      });
    }
  };

  const handleAddSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specKey.trim()]: specValue.trim(),
        },
      });
      setSpecKey('');
      setSpecValue('');
    }
  };

  const handleRemoveSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({
      ...formData,
      specifications: newSpecs,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Données du formulaire:', formData);
      alert('Annonce publiée avec succès! (Pour le moment, les données sont dans la console)');
      
      // Réinitialiser le formulaire après soumission réussie
      // setFormData({...initialState});
      // setCurrentStep(1);
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      alert('Une erreur est survenue lors de la publication. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.type && formData.title && formData.category;
  const isStep2Valid = formData.price && formData.description;
  const isStep3Valid = formData.sellerName && formData.sellerPhone.number;

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step
                      ? 'bg-[#ec5a13] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step === 1 && 'Informations de base'}
                  {step === 2 && 'Détails'}
                  {step === 3 && 'Vos coordonnées'}
                  {step === 4 && 'Résumé'}
                </span>
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentStep > step ? 'bg-[#ec5a13]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Que souhaitez-vous publier ?
          </h2>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Type d'annonce *
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'product' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'product'
                      ? 'border-[#ec5a13] bg-[#ffe9de]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Package
                    className={`h-8 w-8 mx-auto mb-2 ${
                      formData.type === 'product' ? 'text-[#ec5a13]' : 'text-gray-400'
                    }`}
                  />
                  <p
                    className={`font-medium ${
                      formData.type === 'product' ? 'text-[#ec5a13]' : 'text-gray-700'
                    }`}
                  >
                    Produit
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'service' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'service'
                      ? 'border-[#ec5a13] bg-[#ffe9de]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Briefcase
                    className={`h-8 w-8 mx-auto mb-2 ${
                      formData.type === 'service' ? 'text-[#ec5a13]' : 'text-gray-400'
                    }`}
                  />
                  <p
                    className={`font-medium ${
                      formData.type === 'service' ? 'text-[#ec5a13]' : 'text-gray-700'
                    }`}
                  >
                    Service
                  </p>
                </button>
              </div>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>

            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                Titre de l'annonce *
              </Label>
              <Input
                id="title"
                placeholder="Ex: iPhone 14 Pro Max 256GB ou Service de plomberie"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Soyez précis pour attirer plus d'acheteurs
              </p>
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">
                  Catégorie *
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              {selectedCategory?.subcategories && (
                <div>
                  <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700 mb-2 block">
                    Sous-catégorie
                  </Label>
                  <Select value={formData.subcategory} onValueChange={(value) => setFormData({ ...formData, subcategory: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une sous-catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory.subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.slug}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {formData.type === 'product' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition" className="text-sm font-medium text-gray-700 mb-2 block">
                    État *
                  </Label>
                  <Select value={formData.condition} onValueChange={(value: 'new' | 'used') => setFormData({ ...formData, condition: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez l'état" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Neuf</SelectItem>
                      <SelectItem value="used">Occasion</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition}</p>}
                </div>

                <div>
                  <Label htmlFor="brand" className="text-sm font-medium text-gray-700 mb-2 block">
                    Marque
                  </Label>
                  <Input
                    id="brand"
                    placeholder="Ex: Apple, Samsung, Toyota..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 mb-2 block">
                    Quantité
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
            )}

            {formData.type === 'service' && (
              <div>
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700 mb-2 block">
                  Durée estimée du service
                </Label>
                <Input
                  id="duration"
                  placeholder="Ex: 2 heures, 1 jour, Selon besoin..."
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!isStep1Valid}
              className="bg-[#ec5a13] hover:bg-[#d94f0f]"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Détails de l'annonce</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-2 block">
                  Prix (FCFA) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Ex: 850000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="text-base"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre produit ou service en détail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-32 text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} caractères
              </p>
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Images - Max 5
              </Label>
              <div className="mb-3">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                  disabled={formData.images.length >= 5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, WEBP - Max 2MB par image
                </p>
              </div>
              {imagesPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imagesPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Tags - Max 5</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Ajoutez un tag"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="outline"
                  disabled={formData.tags.length >= 5}
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {formData.type === 'product' && (
              <>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <Switch
                      checked={formData.delivery}
                      onCheckedChange={(checked) => setFormData({ ...formData, delivery: checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">Livraison disponible</span>
                  </label>
                  {formData.delivery && (
                    <div className="space-y-3 pl-7">
                      <Input
                        placeholder="Coût de livraison (FCFA)"
                        value={formData.deliveryCost}
                        onChange={(e) => setFormData({ ...formData, deliveryCost: e.target.value })}
                      />
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Zones de livraison
                        </Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Ajoutez une zone de livraison"
                            value={newDeliveryArea}
                            onChange={(e) => setNewDeliveryArea(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDeliveryArea())}
                          />
                          <Button type="button" onClick={handleAddDeliveryArea} variant="outline" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {formData.deliveryAreas.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.deliveryAreas.map((area) => (
                              <Badge
                                key={area}
                                variant="default"
                                className="gap-1 cursor-pointer hover:bg-red-100"
                                onClick={() => handleRemoveDeliveryArea(area)}
                              >
                                {area}
                                <X className="h-3 w-3" />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="warranty" className="text-sm font-medium text-gray-700 mb-2 block">
                    Garantie
                  </Label>
                  <Input
                    id="warranty"
                    placeholder="Ex: 6 mois, 1 an, Non applicable..."
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="returnPolicy" className="text-sm font-medium text-gray-700 mb-2 block">
                    Politique de retour
                  </Label>
                  <Input
                    id="returnPolicy"
                    placeholder="Ex: Retour sous 7 jours, Pas de retour..."
                    value={formData.returnPolicy}
                    onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Spécifications
                  </Label>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                        <div className="flex-1">
                          <span className="font-medium text-sm text-gray-700">{key}:</span>
                          <span className="ml-2 text-sm text-gray-600">{value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecification(key)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Caractéristique"
                        value={specKey}
                        onChange={(e) => setSpecKey(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Valeur"
                        value={specValue}
                        onChange={(e) => setSpecValue(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddSpecification} className="bg-[#ec5a13] hover:bg-[#d94f0f]">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {formData.type === 'service' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Jours de disponibilité *
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleToggleAllDays}
                      className="text-xs"
                    >
                      {formData.availability.days.length === daysOptions.length ? 'Désélectionner tous' : 'Sélectionner tous'}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {daysOptions.map((day) => (
                      <Badge
                        key={day}
                        variant={formData.availability.days.includes(day) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleToggleAvailabilityDay(day)}
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                  {errors.availabilityDays && <p className="text-red-500 text-xs mt-1">{errors.availabilityDays}</p>}
                </div>

                <div>
                  <Label htmlFor="availabilityHours" className="text-sm font-medium text-gray-700 mb-2 block">
                    Heures de disponibilité *
                  </Label>
                  <Input
                    id="availabilityHours"
                    placeholder="Ex: 9h - 17h, 24h/24, Sur rendez-vous..."
                    value={formData.availability.hours}
                    onChange={(e) => setFormData({
                      ...formData,
                      availability: {
                        ...formData.availability,
                        hours: e.target.value
                      }
                    })}
                  />
                  {errors.availabilityHours && <p className="text-red-500 text-xs mt-1">{errors.availabilityHours}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Zone d'intervention
                  </Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Ajoutez une zone d'intervention"
                      value={newServiceArea}
                      onChange={(e) => setNewServiceArea(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddServiceArea())}
                    />
                    <Button type="button" onClick={handleAddServiceArea} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.serviceArea.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.serviceArea.map((area) => (
                        <Badge
                          key={area}
                          variant="default"
                          className="gap-1 cursor-pointer hover:bg-red-100"
                          onClick={() => handleRemoveServiceArea(area)}
                        >
                          {area}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <Button type="button" onClick={handlePrevStep} variant="outline">
              Retour
            </Button>
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!isStep2Valid}
              className="bg-[#ec5a13] hover:bg-[#d94f0f]"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 3 && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Vos coordonnées
              </h2>
              <p className="text-sm text-gray-600">
                Ces informations permettront aux acheteurs de vous contacter
              </p>
            </div>
            {!editContactInfo && (
              <Button
                type="button"
                onClick={() => setEditContactInfo(true)}
                variant="outline"
                size="sm"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="sellerName" className="text-sm font-medium text-gray-700 mb-2 block">
                Votre nom ou nom de l'entreprise *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="sellerName"
                  placeholder="Ex: Tech Store Pro"
                  value={formData.sellerName}
                  onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                  className="pl-10 text-base"
                  disabled={!editContactInfo}
                />
              </div>
              {errors.sellerName && <p className="text-red-500 text-xs mt-1">{errors.sellerName}</p>}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Téléphone *
              </Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.sellerPhone.countryCode} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    sellerPhone: { ...formData.sellerPhone, countryCode: value }
                  })}
                  disabled={!editContactInfo}
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
                  value={formData.sellerPhone.number}
                  onChange={(e) => setFormData({
                    ...formData,
                    sellerPhone: { ...formData.sellerPhone, number: e.target.value }
                  })}
                  className="flex-1"
                  disabled={!editContactInfo}
                />
              </div>
              {errors.sellerPhone && <p className="text-red-500 text-xs mt-1">{errors.sellerPhone}</p>}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                WhatsApp (optionnel)
              </Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.sellerWhatsapp.countryCode} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    sellerWhatsapp: { ...formData.sellerWhatsapp, countryCode: value }
                  })}
                  disabled={!editContactInfo}
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
                  value={formData.sellerWhatsapp.number}
                  onChange={(e) => setFormData({
                    ...formData,
                    sellerWhatsapp: { ...formData.sellerWhatsapp, number: e.target.value }
                  })}
                  className="flex-1"
                  disabled={!editContactInfo}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sellerEmail" className="text-sm font-medium text-gray-700 mb-2 block">
                Email (optionnel)
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="sellerEmail"
                  type="email"
                  placeholder="contact@exemple.com"
                  value={formData.sellerEmail}
                  onChange={(e) => setFormData({ ...formData, sellerEmail: e.target.value })}
                  className="pl-10 text-base"
                  disabled={!editContactInfo}
                />
              </div>
              {errors.sellerEmail && <p className="text-red-500 text-xs mt-1">{errors.sellerEmail}</p>}
            </div>

            {editContactInfo && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setEditContactInfo(false)}
                  className="bg-[#ec5a13] hover:bg-[#d94f0f]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            )}

            <div className="bg-[#ffe9de] border border-[#ec5a13]/30 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#ec5a13] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Vos informations sont sécurisées
                  </p>
                  <p className="text-xs text-gray-700">
                    Nous ne partageons jamais vos données personnelles. Elles servent uniquement à vous mettre en contact avec les acheteurs intéressés.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button type="button" onClick={handlePrevStep} variant="outline">
              Retour
            </Button>
            <Button
              type="button"
              onClick={() => setCurrentStep(4)}
              disabled={!isStep3Valid}
              className="bg-[#ec5a13] hover:bg-[#d94f0f]"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 4 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé de votre annonce</h2>

          {/* Aperçu de la carte produit */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Aperçu de l'annonce
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Voici comment votre annonce apparaîtra sur la page d'accueil
            </p>
            
            {/* Card Preview - Style exact du HeroProductCarousel */}
            <div className="max-w-[340px] mx-auto md:mx-0">
              <Card className="group overflow-hidden border-gray-200 hover:shadow-2xl transition-all duration-300 h-full bg-white p-0 gap-0">
                <div className="relative h-44 overflow-hidden bg-gray-200">
                  {imagesPreviews.length > 0 ? (
                    <img
                      src={imagesPreviews[0]}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  {/* Badge de temps en haut à gauche */}
                  <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 flex items-center gap-1.5 shadow-md text-xs px-2 py-1 rounded-lg border-0">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-medium">Il y a quelques instants</span>
                  </Badge>
                </div>

                <div className="p-3 flex flex-col gap-2">
                  {/* Icône + Titre */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-base flex-shrink-0 w-5">
                      {formData.type === 'service' ? '🛠️' : '📦'}
                    </span>
                    <h3 className="font-semibold text-base text-gray-900 truncate flex-1">
                      {formData.title || 'Titre de l\'annonce'}
                    </h3>
                  </div>

                  {/* Localité + Distance */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <div className="w-5 flex-shrink-0 flex items-center justify-center">
                      <MapPin className="h-3.5 w-3.5 text-[#ec5a13]" />
                    </div>
                    <span className="truncate">{connectedSeller.location}</span>
                    <span className="text-gray-400">•</span>
                    <span className="whitespace-nowrap">0.5 km</span>
                  </div>

                  {/* Prix */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 flex-shrink-0"></div>
                    <p className="text-sm font-semibold text-[#ec5a13]">
                      {formData.price ? `${parseInt(formData.price).toLocaleString()} FCFA` : '0 FCFA'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">{formData.type === 'product' ? 'Produit' : 'Service'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Titre:</span>
                  <span className="ml-2 font-medium">{formData.title}</span>
                </div>
                <div>
                  <span className="text-gray-600">Catégorie:</span>
                  <span className="ml-2 font-medium">{selectedCategory?.name}</span>
                </div>
                {formData.subcategory && (
                  <div>
                    <span className="text-gray-600">Sous-catégorie:</span>
                    <span className="ml-2 font-medium">
                      {selectedCategory?.subcategories?.find(sub => sub.slug === formData.subcategory)?.name}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Prix:</span>
                  <span className="ml-2 font-medium">{formData.price} FCFA</span>
                </div>
              </div>
            </div>

            {formData.type === 'product' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Détails du produit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {formData.condition && (
                    <div>
                      <span className="text-gray-600">État:</span>
                      <span className="ml-2 font-medium">{formData.condition === 'new' ? 'Neuf' : 'Occasion'}</span>
                    </div>
                  )}
                  {formData.brand && (
                    <div>
                      <span className="text-gray-600">Marque:</span>
                      <span className="ml-2 font-medium">{formData.brand}</span>
                    </div>
                  )}
                  {formData.quantity && (
                    <div>
                      <span className="text-gray-600">Quantité:</span>
                      <span className="ml-2 font-medium">{formData.quantity}</span>
                    </div>
                  )}
                  {formData.warranty && (
                    <div>
                      <span className="text-gray-600">Garantie:</span>
                      <span className="ml-2 font-medium">{formData.warranty}</span>
                    </div>
                  )}
                  {formData.returnPolicy && (
                    <div>
                      <span className="text-gray-600">Politique de retour:</span>
                      <span className="ml-2 font-medium">{formData.returnPolicy}</span>
                    </div>
                  )}
                  {formData.delivery && (
                    <>
                      <div>
                        <span className="text-gray-600">Livraison:</span>
                        <span className="ml-2 font-medium">Disponible</span>
                      </div>
                      {formData.deliveryCost && (
                        <div>
                          <span className="text-gray-600">Coût de livraison:</span>
                          <span className="ml-2 font-medium">{formData.deliveryCost} FCFA</span>
                        </div>
                      )}
                      {formData.deliveryAreas.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Zones de livraison:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formData.deliveryAreas.map((area) => (
                              <Badge key={area} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {Object.keys(formData.specifications).length > 0 && (
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">Spécifications:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                      {Object.entries(formData.specifications).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium">{key}:</span>
                          <span className="ml-1">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {formData.type === 'service' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Détails du service
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {formData.duration && (
                    <div>
                      <span className="text-gray-600">Durée:</span>
                      <span className="ml-2 font-medium">{formData.duration}</span>
                    </div>
                  )}
                  {formData.availability.days.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Jours de disponibilité:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.availability.days.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {formData.availability.hours && (
                    <div>
                      <span className="text-gray-600">Heures de disponibilité:</span>
                      <span className="ml-2 font-medium">{formData.availability.hours}</span>
                    </div>
                  )}
                  {formData.serviceArea.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Zone d'intervention:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.serviceArea.map((area) => (
                          <Badge key={area} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Vos coordonnées
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Nom:</span>
                  <span className="ml-2 font-medium">{formData.sellerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Téléphone:</span>
                  <span className="ml-2 font-medium">{formatPhoneNumber(formData.sellerPhone)}</span>
                </div>
                {formData.sellerWhatsapp.number && (
                  <div>
                    <span className="text-gray-600">WhatsApp:</span>
                    <span className="ml-2 font-medium">{formatPhoneNumber(formData.sellerWhatsapp)}</span>
                  </div>
                )}
                {formData.sellerEmail && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{formData.sellerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {imagesPreviews.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Images
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {imagesPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.tags.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#ffe9de] border border-[#ec5a13]/30 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-[#ec5a13] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Vérifiez bien votre annonce
                  </p>
                  <p className="text-xs text-gray-700">
                    Une fois publiée, votre annonce sera visible par tous les utilisateurs. Assurez-vous que toutes les informations sont correctes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button type="button" onClick={handlePrevStep} variant="outline">
              Retour
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#ec5a13] hover:bg-[#d94f0f]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publication en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Publier l'annonce
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </form>
  );
}

