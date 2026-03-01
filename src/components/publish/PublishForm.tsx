'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createProduct, updateProduct, filesToBase64 } from '@/lib/api/product';
import { getCurrentUser } from '@/lib/api/auth';
import { getCategories, Category as ApiCategory } from '@/lib/api/categories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  Loader2,
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
  images: File[];
  location: string;
  delivery: boolean;
  deliveryCost: string;
  deliveryAreas: string[];
  availability: {
    days: string[];
    openingTime: string;
    closingTime: string;
  };
  sellerName: string;
  sellerPhone: PhoneNumber;
  sellerWhatsapp: PhoneNumber;
  sellerEmail: string;
  quantity?: number;
  specifications: Record<string, string>;
  serviceArea: string[];
  promoted?: boolean;
  featured?: boolean;
}

export function PublishForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  
  // Récupérer l'utilisateur connecté
  const currentUser = getCurrentUser();
  
  // État pour les catégories dynamiques
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  // Extraire le numéro de téléphone pour le formulaire
  const parsePhone = (phone: string) => {
    const match = phone?.match(/(\+\d+)\s*(.+)/);
    return match ? { countryCode: match[1], number: match[2].replace(/\s/g, '') } : { countryCode: '+227', number: '' };
  };
  
  const [formData, setFormData] = useState<FormData>({
    type: 'product',
    title: '',
    category: '',
    subcategory: '',
    price: '',
    description: '',
    condition: '',
    images: [],
    location: currentUser?.location || '',
    delivery: false,
    deliveryCost: '',
    deliveryAreas: [],
    availability: {
      days: [],
      openingTime: '',
      closingTime: '',
    },
    sellerName: currentUser?.name || '',
    sellerPhone: parsePhone(currentUser?.phone || '+227'),
    sellerWhatsapp: parsePhone(currentUser?.whatsapp || currentUser?.phone || '+227'),
    sellerEmail: currentUser?.email || '',
    specifications: {},
    serviceArea: [],
    promoted: false,
    featured: false,
  });

  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]); // URLs des images existantes (mode édition)
  const [deletedImages, setDeletedImages] = useState<string[]>([]); // URLs des images supprimées
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDeliveryArea, setNewDeliveryArea] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  // Charger les données d'édition depuis localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      const editItemData = localStorage.getItem('editItem');
      if (editItemData) {
        try {
          const item = JSON.parse(editItemData);
          setEditMode(true);
          setEditItemId(editId);
          
          // Extraire les numéros de téléphone
          const parsePhone = (phone: string) => {
            const match = phone.match(/(\+\d+)\s*(.+)/);
            return match ? { countryCode: match[1], number: match[2] } : { countryCode: '+227', number: '' };
          };

          // Pré-remplir le formulaire
          setFormData({
            type: item.type,
            title: item.title,
            category: item.category,
            subcategory: item.subcategory || '',
            price: item.price.replace(/[^\d]/g, ''),
            description: item.description,
            condition: item.condition || '',
            location: item.location || '',
            images: [],
            delivery: item.delivery?.available || false,
            deliveryCost: item.delivery?.cost || '',
            deliveryAreas: item.delivery?.areas || [],
            availability: item.availability || { days: [], openingTime: '', closingTime: '' },
            sellerName: item.seller.name,
            sellerPhone: parsePhone(item.seller.contactInfo.phone),
            sellerWhatsapp: item.seller.contactInfo.whatsapp ? parsePhone(item.seller.contactInfo.whatsapp) : parsePhone(item.seller.contactInfo.phone),
            sellerEmail: item.seller.contactInfo.email || '',
            quantity: item.quantity ? parseInt(item.quantity) : undefined,
            specifications: item.specifications || {},
            serviceArea: item.serviceArea || [],
            promoted: item.promoted || false,
            featured: item.featured || false,
          });

          // Charger les images existantes
          if (item.images && item.images.length > 0) {
            setImagesPreviews(item.images);
            setOriginalImages(item.images); // Sauvegarder les URLs originales
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données d\'édition:', error);
        }
      }
    }
  }, []);

  // Charger les catégories depuis l'API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setCategoriesError('Impossible de charger les catégories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Trouver la catégorie et sous-catégorie sélectionnées
  const selectedCategory = categories.find(cat => cat._id === formData.category);
  const selectedSubcategory = selectedCategory?.subcategories.find(sub => sub.slug === formData.subcategory);
  
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
      // Description optionnelle, mais limitée à 150 mots
      if (formData.description.trim()) {
        const wordCount = formData.description.trim().split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount > 150) {
          newErrors.description = 'La description ne doit pas dépasser 150 mots';
        }
      }
      
      if (formData.type === 'product' && !formData.condition) {
        newErrors.condition = "Veuillez sélectionner l'état du produit";
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Vérifier combien d'images on peut encore ajouter
    const remainingSlots = 5 - imagesPreviews.length;
    const filesToProcess = Math.min(files.length, remainingSlots);
    
    if (files.length > remainingSlots) {
      alert(`Vous pouvez ajouter seulement ${remainingSlots} image(s) de plus (maximum 5 images)`);
    }
    
    const filesToAdd = Array.from(files).slice(0, filesToProcess);
    const newPreviews: string[] = [];
    const newImages: File[] = [];
    
    for (const file of filesToAdd) {
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(`L'image "${file.name}" dépasse 5MB et ne sera pas ajoutée`);
        continue;
      }
      
      // Créer le preview
      try {
        const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        newPreviews.push(preview);
        newImages.push(file);
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier:', error);
      }
    }
    
    // Mettre à jour les états en une seule fois
    if (newPreviews.length > 0) {
      setImagesPreviews([...imagesPreviews, ...newPreviews]);
      setFormData({ ...formData, images: [...formData.images, ...newImages] });
    }
    
    // Réinitialiser l'input
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = imagesPreviews[index];
    
    // Si c'est une URL (image existante sur Cloudinary), l'ajouter aux images supprimées
    if (typeof imageToRemove === 'string' && imageToRemove.startsWith('http')) {
      setDeletedImages([...deletedImages, imageToRemove]);
    }
    
    setImagesPreviews(imagesPreviews.filter((_, i) => i !== index));
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleImageReorder = (fromIndex: number, toIndex: number) => {
    const newPreviews = [...imagesPreviews];
    const newImages = [...formData.images];
    
    // Retirer l'élément de sa position actuelle
    const [movedPreview] = newPreviews.splice(fromIndex, 1);
    const [movedImage] = newImages.splice(fromIndex, 1);
    
    // Insérer à la nouvelle position
    newPreviews.splice(toIndex, 0, movedPreview);
    newImages.splice(toIndex, 0, movedImage);
    
    setImagesPreviews(newPreviews);
    setFormData({ ...formData, images: newImages });
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
      console.log('🚀 Début de la publication...');

      // 📸 Préparer les images selon le mode
      let productData: any;
      
      if (editMode && editItemId) {
        // MODE ÉDITION
        console.log('🔄 Mode édition - Traitement des images...');
        
        // Convertir uniquement les NOUVELLES images (Files) en base64
        let newImagesBase64: string[] = [];
        if (formData.images.length > 0) {
          console.log('📤 Conversion de', formData.images.length, 'nouvelles images en base64...');
          newImagesBase64 = await filesToBase64(formData.images);
          console.log('✅ Nouvelles images converties');
        }
        
        console.log('🗑️ Images à supprimer:', deletedImages.length);
        
        // Préparer les données pour l'API (mode édition)
        productData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory || '',
          type: formData.type,
          price: formData.price,
          location: formData.location || 'Non spécifié',
          condition: formData.condition as 'new' | 'used' | 'refurbished' | undefined,
          quantity: formData.quantity?.toString() || '1',
          newImages: newImagesBase64, // Nouvelles images à ajouter
          deleteImages: deletedImages, // Images à supprimer
          delivery: formData.delivery ? {
            available: formData.delivery,
            cost: formData.deliveryCost || '',
            areas: formData.deliveryAreas || [],
            estimatedTime: ''
          } : { available: false },
          availability: formData.availability,
          serviceArea: formData.serviceArea || [],
          specifications: formData.specifications || {},
        };
      } else {
        // MODE CRÉATION
        console.log('➕ Mode création - Conversion de toutes les images...');
        
        // Convertir TOUTES les images en base64
        let imagesBase64: string[] = [];
        if (formData.images.length > 0) {
          console.log('📤 Conversion de', formData.images.length, 'images en base64...');
          imagesBase64 = await filesToBase64(formData.images);
          console.log('✅ Images converties');
        }

        // Préparer les données pour l'API (mode création)
        productData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory || '',
          type: formData.type,
          price: formData.price,
          location: formData.location || 'Non spécifié',
          condition: formData.condition as 'new' | 'used' | 'refurbished' | undefined,
          quantity: formData.quantity?.toString() || '1',
          images: imagesBase64, // Toutes les images
          delivery: formData.delivery ? {
            available: formData.delivery,
            cost: formData.deliveryCost || '',
            areas: formData.deliveryAreas || [],
            estimatedTime: ''
          } : { available: false },
          availability: formData.availability,
          serviceArea: formData.serviceArea || [],
          specifications: formData.specifications || {},
          promoted: formData.promoted || false,
          featured: formData.featured || false
        };
      }
      
      console.log('📝 Données préparées:', productData);
      
      if (editMode && editItemId) {
        console.log('🔄 Mise à jour de l\'annonce:', editItemId);
        // Mode édition
        const response = await updateProduct(editItemId, productData);
        console.log('✅ Annonce mise à jour:', response.data);
        
        localStorage.removeItem('editItem');
        alert('✅ Annonce mise à jour avec succès!');
        router.push('/mes-annonces');
      } else {
        console.log('➕ Création d\'une nouvelle annonce...');
        // Mode création
        const response = await createProduct(productData);
        console.log('✅ Annonce créée:', response.data);
        
        alert('✅ Annonce publiée avec succès!');
        
        // Réinitialiser le formulaire
        setFormData({
          type: 'product',
          title: '',
          category: '',
          subcategory: '',
          price: '',
          description: '',
          condition: '',
          location: '',
          images: [],
          delivery: false,
          deliveryCost: '',
          deliveryAreas: [],
          availability: {
            days: [],
            openingTime: '',
            closingTime: '',
          },
          sellerName: currentUser?.name || '',
          sellerPhone: parsePhone(currentUser?.phone || '+227'),
          sellerWhatsapp: parsePhone(currentUser?.whatsapp || currentUser?.phone || '+227'),
          sellerEmail: currentUser?.email || '',
          specifications: {},
          serviceArea: [],
          promoted: false,
          featured: false,
        });
        setImagesPreviews([]);
        setCurrentStep(1);
        
        // Rediriger vers mes annonces
        router.push('/mes-annonces');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la publication:', error);
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la publication. Veuillez réessayer.';
      alert('❌ ' + errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.type && formData.title && formData.category;
  const isStep2Valid = formData.price && formData.description;
  const isStep3Valid = formData.sellerName && formData.sellerPhone.number;

  return (
    <form onSubmit={handleSubmit}>
      {/* Barre de progression - Version mobile simplifiée */}
      <div className="mb-6 md:mb-8">
        {/* Version mobile : Affichage compact */}
        <div className="block md:hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600">
              Étape {currentStep} sur 4
            </span>
            <span className="text-xs font-medium text-[#ec5a13]">
              {currentStep === 1 && 'Informations de base'}
              {currentStep === 2 && 'Détails'}
              {currentStep === 3 && 'Vos coordonnées'}
              {currentStep === 4 && 'Résumé'}
            </span>
          </div>
          {/* Barre de progression simple */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#ec5a13] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
          {/* Points indicateurs */}
          <div className="flex justify-between mt-3">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  currentStep >= step
                    ? 'bg-[#ec5a13] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Version desktop : Affichage détaillé */}
        <div className="hidden md:flex items-center justify-between">
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
        <Card className="p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
            Informations de base
          </h2>

          <div className="space-y-6">
            {/* Type d'annonce - Style Navbar */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Type d'annonce *
              </Label>
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'product' })}
                  className={`flex-1 items-center justify-center flex gap-1 md:gap-2 px-3 md:px-6 py-3 font-medium transition-all relative text-sm md:text-base ${
                    formData.type === 'product'
                      ? 'text-[#ec5a13]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg md:text-xl">📦</span>
                  <span>Produit</span>
                  {formData.type === 'product' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ec5a13]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'service' })}
                  className={`flex-1 items-center justify-center flex gap-1 md:gap-2 px-3 md:px-6 py-3 font-medium transition-all relative text-sm md:text-base ${
                    formData.type === 'service'
                      ? 'text-[#ec5a13]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg md:text-xl">🛠️</span>
                  <span>Service</span>
                  {formData.type === 'service' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ec5a13]" />
                  )}
                </button>
              </div>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>

            {/* Titre de l'annonce */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                Titre *
              </Label>
              <Input
                id="title"
                placeholder="Ex: iPhone 14 Pro Max 256GB ou Service de plomberie"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Soyez précis pour attirer les clients
              </p>
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* État - Items sélectionnables (pour produits seulement) */}
            {formData.type === 'product' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  État *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, condition: 'new' })}
                    className={`p-3 md:p-4 rounded-lg border-2 transition-all text-center ${
                      formData.condition === 'new'
                        ? 'border-[#ec5a13] bg-[#ffe9de] text-[#ec5a13]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="font-medium text-sm md:text-base">Neuf</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, condition: 'used' })}
                    className={`p-3 md:p-4 rounded-lg border-2 transition-all text-center ${
                      formData.condition === 'used'
                        ? 'border-[#ec5a13] bg-[#ffe9de] text-[#ec5a13]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="font-medium text-sm md:text-base">Occasion</span>
                  </button>
                </div>
                {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition}</p>}
              </div>
            )}

            {/* Quantité (pour produits seulement) */}
            {formData.type === 'product' && (
              <div>
                <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantité disponible
                </Label>
                <Input
                  id="quantity"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ex: 1, 5, 10..."
                  value={formData.quantity || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, quantity: value ? parseInt(value) : undefined });
                  }}
                  className="text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Indiquez combien d'unités sont disponibles
                </p>
              </div>
            )}

            {/* Catégorie - Chargement dynamique depuis l'API */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Que voulez-vous publier ? *
              </Label>
              
              {categoriesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="p-3 md:p-4 rounded-lg border-2 border-gray-200 flex flex-col items-center gap-1.5 md:gap-2 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : categoriesError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {categoriesError}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: category._id, subcategory: '' })}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 md:gap-2 hover:shadow-md ${
                        formData.category === category._id
                          ? 'border-[#ec5a13] bg-[#ffe9de] shadow-md'
                          : 'border-gray-200 hover:border-[#ec5a13]'
                      }`}
                    >
                      <span className="text-2xl md:text-3xl">{category.icon || '📦'}</span>
                      <span className={`text-xs md:text-sm font-medium text-center leading-tight ${
                        formData.category === category._id
                          ? 'text-[#ec5a13]'
                          : 'text-gray-700'
                      }`}>
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Sous-catégories - Affichage dynamique si une catégorie est sélectionnée */}
            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Type de {selectedCategory.name.toLowerCase()}
                </Label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                  {selectedCategory.subcategories.map((subcategory) => (
                    <button
                      key={subcategory._id}
                      type="button"
                      onClick={() => setFormData({ ...formData, subcategory: subcategory.slug })}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 md:gap-2 hover:shadow-md ${
                        formData.subcategory === subcategory.slug
                          ? 'border-[#ec5a13] bg-[#ffe9de] shadow-md'
                          : 'border-gray-200 hover:border-[#ec5a13]'
                      }`}
                    >
                      <span className="text-xl md:text-2xl">{subcategory.icon || '📄'}</span>
                      <span className={`text-xs md:text-sm font-medium text-center leading-tight ${
                        formData.subcategory === subcategory.slug
                          ? 'text-[#ec5a13]'
                          : 'text-gray-700'
                      }`}>
                        {subcategory.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="flex justify-end mt-4 md:mt-6">
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!isStep1Valid}
              className="bg-[#ec5a13] hover:bg-[#d94f0f] text-sm md:text-base w-full sm:w-auto"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Détails de l'annonce</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-2 block">
                  Prix en FCFA *
                </Label>
                <Input
                  id="price"
                  type="text"
                  placeholder="850 000"
                  value={formData.price ? formData.price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''}
                  onChange={(e) => {
                    // Retirer tous les caractères non numériques
                    const numericValue = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, price: numericValue });
                  }}
                  className="text-base"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre produit ou service en détail... (max 150 mots)"
                value={formData.description}
                onChange={(e) => {
                  const wordCount = e.target.value.trim().split(/\s+/).filter(word => word.length > 0).length;
                  if (wordCount <= 150 || e.target.value.length < formData.description.length) {
                    setFormData({ ...formData, description: e.target.value });
                  }
                }}
                className="min-h-32 text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.trim().split(/\s+/).filter(word => word.length > 0).length} / 150 mots
              </p>
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Sélection d'images - Système avec drag & drop et upload multiple */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Images - Max 5 *
              </Label>
              <p className="text-xs text-gray-500 mb-3">
                📸 Ajoutez jusqu'à 5 images • Glissez-déposez pour réorganiser • Upload multiple supporté
              </p>
              <div className="flex flex-wrap gap-3">
                {/* Afficher les images sélectionnées avec drag & drop */}
                {imagesPreviews.map((preview, index) => (
                  <div 
                    key={index} 
                    draggable
                    onDragStart={(e) => {
                      setDraggedImageIndex(index);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedImageIndex !== null && draggedImageIndex !== index) {
                        handleImageReorder(draggedImageIndex, index);
                      }
                      setDraggedImageIndex(null);
                    }}
                    onDragEnd={() => setDraggedImageIndex(null)}
                    className={`relative group w-24 h-24 sm:w-28 sm:h-28 cursor-move transition-all ${
                      draggedImageIndex === index ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                    }`}
                  >
                    <img
                      src={preview}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border-2 border-[#ec5a13]"
                    />
                    <div className="absolute top-1 left-1 z-10">
                      <Badge className="bg-[#ec5a13] text-white text-xs px-1.5 py-0.5">
                        {index + 1}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {/* Afficher le bouton d'upload seulement si moins de 5 images */}
                {imagesPreviews.length < 5 && (
                  <label className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#ec5a13] hover:bg-[#ffe9de]/30 transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Plus className="h-8 w-8 text-gray-400 group-hover:text-[#ec5a13] transition-colors" />
                    <span className="text-xs text-gray-500 mt-1 group-hover:text-[#ec5a13] text-center px-1">
                      Ajouter
                    </span>
                  </label>
                )}
              </div>
              {imagesPreviews.length > 0 && (
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
                  <span>{imagesPreviews.length} / 5 images ajoutées</span>
                  {imagesPreviews.length > 1 && (
                    <span className="text-[#ec5a13]">• Glissez pour réorganiser</span>
                  )}
                </p>
              )}
              {errors.images && <p className="text-red-500 text-xs mt-2">{errors.images}</p>}
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
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Horaire de disponibilité
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="openingTime" className="text-xs text-gray-600 mb-2 block">
                        Heure d'ouverture
                      </Label>
                      <Input
                        id="openingTime"
                        placeholder="Ex: 8h, 9h00, 8h30..."
                        value={formData.availability.openingTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          availability: {
                            ...formData.availability,
                            openingTime: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="closingTime" className="text-xs text-gray-600 mb-2 block">
                        Heure de fermeture
                      </Label>
                      <Input
                        id="closingTime"
                        placeholder="Ex: 17h, 18h00, 20h30..."
                        value={formData.availability.closingTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          availability: {
                            ...formData.availability,
                            closingTime: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Indiquez vos horaires de service (facultatif)
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Quartiers
                  </Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Ex: Plateau, Almadies..."
                      value={newServiceArea}
                      onChange={(e) => setNewServiceArea(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddServiceArea())}
                    />
                    <Button type="button" onClick={handleAddServiceArea} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Où intervenez-vous ? (facultatif)
                  </p>
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

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 md:mt-6">
            <Button type="button" onClick={handlePrevStep} variant="outline" className="w-full sm:w-auto text-sm md:text-base">
              Retour
            </Button>
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!isStep2Valid}
              className="bg-[#ec5a13] hover:bg-[#d94f0f] w-full sm:w-auto text-sm md:text-base"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 3 && (
        <Card className="p-4 md:p-6 mb-6">
          <div className="mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Vos coordonnées
            </h2>
            <p className="text-xs md:text-sm text-gray-600">
              Ces informations permettront aux acheteurs de vous contacter
            </p>
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
                  disabled
                  readOnly
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
                  disabled
                >
                  <SelectTrigger className="w-24 md:w-32 text-sm md:text-base">
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
                  disabled
                  readOnly
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
                  disabled
                >
                  <SelectTrigger className="w-24 md:w-32 text-sm md:text-base">
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
                  disabled
                  readOnly
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
                  disabled
                  readOnly
                />
              </div>
              {errors.sellerEmail && <p className="text-red-500 text-xs mt-1">{errors.sellerEmail}</p>}
            </div>

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

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 md:mt-6">
            <Button type="button" onClick={handlePrevStep} variant="outline" className="w-full sm:w-auto text-sm md:text-base">
              Retour
            </Button>
            <Button
              type="button"
              onClick={() => setCurrentStep(4)}
              disabled={!isStep3Valid}
              className="bg-[#ec5a13] hover:bg-[#d94f0f] w-full sm:w-auto text-sm md:text-base"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 4 && (
        <Card className="p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Résumé de votre annonce</h2>

          {/* Aperçu de la carte produit */}
          <div className="mb-4 md:mb-6">
            <h3 className="font-medium text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
              <Eye className="h-4 w-4" />
              Aperçu de l'annonce
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
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
                    <span className="truncate">{currentUser?.location || 'Niger'}</span>
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

          <div className="space-y-4 md:space-y-6">
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <h3 className="font-medium text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <FileText className="h-4 w-4" />
                Informations générales
              </h3>
              <div className="grid grid-cols-1 gap-2 md:gap-3 text-xs md:text-sm">
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
                  <span className="ml-2 font-medium">
                    {selectedCategory ? (
                      <>
                        {selectedCategory.name}
                        {selectedSubcategory && ` - ${selectedSubcategory.name}`}
                      </>
                    ) : 'Non spécifié'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Prix:</span>
                  <span className="ml-2 font-medium">{formData.price} FCFA</span>
                </div>
              </div>
            </div>

            {formData.type === 'product' && (
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <h3 className="font-medium text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                  <Package className="h-4 w-4" />
                  Détails du produit
                </h3>
                <div className="grid grid-cols-1 gap-2 md:gap-3 text-xs md:text-sm">
                  {formData.condition && (
                    <div>
                      <span className="text-gray-600">État:</span>
                      <span className="ml-2 font-medium">{formData.condition === 'new' ? 'Neuf' : 'Occasion'}</span>
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
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <h3 className="font-medium text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                  <Briefcase className="h-4 w-4" />
                  Détails du service
                </h3>
                <div className="grid grid-cols-1 gap-2 md:gap-3 text-xs md:text-sm">
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
                  {(formData.availability.openingTime || formData.availability.closingTime) && (
                    <div>
                      <span className="text-gray-600">Heures de disponibilité:</span>
                      <span className="ml-2 font-medium">
                        {formData.availability.openingTime && formData.availability.closingTime
                          ? `${formData.availability.openingTime} - ${formData.availability.closingTime}`
                          : formData.availability.openingTime || formData.availability.closingTime}
                      </span>
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

            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <h3 className="font-medium text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <User className="h-4 w-4" />
                Vos coordonnées
              </h3>
              <div className="grid grid-cols-1 gap-2 md:gap-3 text-xs md:text-sm">
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
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <h3 className="font-medium text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                  <Upload className="h-4 w-4" />
                  Images
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                  {imagesPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 md:h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#ffe9de] border border-[#ec5a13]/30 rounded-lg p-3 md:p-4">
              <div className="flex gap-2 md:gap-3">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-[#ec5a13] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-900 mb-1">
                    Vérifiez bien votre annonce
                  </p>
                  <p className="text-xs text-gray-700">
                    Une fois publiée, votre annonce sera visible par tous les utilisateurs. Assurez-vous que toutes les informations sont correctes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 md:mt-6">
            <Button type="button" onClick={handlePrevStep} variant="outline" className="w-full sm:w-auto text-sm md:text-base">
              Retour
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#ec5a13] hover:bg-[#d94f0f] w-full sm:w-auto text-sm md:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editItemId ? 'Mise à jour en cours...' : 'Publication en cours...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {editItemId ? 'Mettre à jour l\'annonce' : 'Publier l\'annonce'}
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </form>
  );
}

