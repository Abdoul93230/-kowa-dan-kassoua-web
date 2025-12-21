import { Item, Category,Seller, Review } from '../types/index';

// Catégories avec sous-catégories
export const categories: Category[] = [
  {
    id: '1',
    name: 'Électronique',
    slug: 'electronique',
    icon: 'Smartphone',
    count: 2453,
    description: 'Smartphones, ordinateurs, accessoires et services informatiques',
    subcategories: [
      { id: '1-1', name: 'Téléphones', slug: 'telephones', count: 856 },
      { id: '1-2', name: 'Ordinateurs', slug: 'ordinateurs', count: 432 },
      { id: '1-3', name: 'Tablettes', slug: 'tablettes', count: 234 },
      { id: '1-4', name: 'Accessoires', slug: 'accessoires', count: 654 },
      { id: '1-5', name: 'Services IT', slug: 'services-it', count: 277 }
    ]
  },
  {
    id: '2',
    name: 'Alimentation',
    slug: 'alimentation',
    icon: 'UtensilsCrossed',
    count: 1834,
    description: 'Produits alimentaires, restaurants et services traiteur',
    subcategories: [
      { id: '2-1', name: 'Restaurants', slug: 'restaurants', count: 423 },
      { id: '2-2', name: 'Produits frais', slug: 'produits-frais', count: 567 },
      { id: '2-3', name: 'Traiteur', slug: 'traiteur', count: 234 },
      { id: '2-4', name: 'Pâtisserie', slug: 'patisserie', count: 312 },
      { id: '2-5', name: 'Épicerie', slug: 'epicerie', count: 298 }
    ]
  },
  {
    id: '3',
    name: 'Immobilier',
    slug: 'immobilier',
    icon: 'Home',
    count: 987,
    description: 'Vente, location et services immobiliers',
    subcategories: [
      { id: '3-1', name: 'Location appartements', slug: 'location-appartements', count: 345 },
      { id: '3-2', name: 'Vente maisons', slug: 'vente-maisons', count: 234 },
      { id: '3-3', name: 'Terrains', slug: 'terrains', count: 156 },
      { id: '3-4', name: 'Bureaux', slug: 'bureaux', count: 123 },
      { id: '3-5', name: 'Services', slug: 'services', count: 129 }
    ]
  },
  {
    id: '4',
    name: 'Automobile',
    slug: 'automobile',
    icon: 'Car',
    count: 1256,
    description: 'Véhicules, pièces détachées et services automobiles',
    subcategories: [
      { id: '4-1', name: 'Voitures', slug: 'voitures', count: 567 },
      { id: '4-2', name: 'Motos', slug: 'motos', count: 234 },
      { id: '4-3', name: 'Pièces détachées', slug: 'pieces', count: 289 },
      { id: '4-4', name: 'Services auto', slug: 'services-auto', count: 166 }
    ]
  },
  {
    id: '5',
    name: 'Mode & Beauté',
    slug: 'mode-beaute',
    icon: 'Shirt',
    count: 3421,
    description: 'Vêtements, accessoires et services de beauté',
    subcategories: [
      { id: '5-1', name: 'Vêtements femmes', slug: 'vetements-femmes', count: 1234 },
      { id: '5-2', name: 'Vêtements hommes', slug: 'vetements-hommes', count: 876 },
      { id: '5-3', name: 'Accessoires', slug: 'accessoires', count: 654 },
      { id: '5-4', name: 'Soins beauté', slug: 'soins-beaute', count: 432 },
      { id: '5-5', name: 'Coiffure', slug: 'coiffure', count: 225 }
    ]
  },
  {
    id: '6',
    name: 'Services à domicile',
    slug: 'services-domicile',
    icon: 'Wrench',
    count: 1643,
    description: 'Plomberie, électricité, ménage et autres services',
    subcategories: [
      { id: '6-1', name: 'Ménage', slug: 'menage', count: 345 },
      { id: '6-2', name: 'Plomberie', slug: 'plomberie', count: 234 },
      { id: '6-3', name: 'Électricité', slug: 'electricite', count: 198 },
      { id: '6-4', name: 'Jardinage', slug: 'jardinage', count: 167 },
      { id: '6-5', name: 'Autres services', slug: 'autres', count: 699 }
    ]
  }
];

// Base de données des vendeurs
export const sellers: Record<string, Seller> = {
  'seller_001': {
    id: 'seller_001',
    name: 'Tech Store Pro',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 4.8,
    totalReviews: 342,
    verified: true,
    memberSince: '2022-03',
    responseTime: '< 1h',
    responseRate: 98,
    location: 'Plateau, Dakar',
    bio: 'Spécialiste en électronique et gadgets technologiques. Garantie et SAV assurés.',
    contactInfo: {
      phone: '+221 77 123 45 67',
      whatsapp: '+221 77 123 45 67',
      email: 'contact@techstorepro.sn',
      website: 'www.techstorepro.sn',
      facebook: 'TechStorePro',
      instagram: '@techstorepro'
    },
    totalListings: 45,
    categories: ['Électronique', 'Informatique']
  },
  'seller_002': {
    id: 'seller_002',
    name: 'Fatou Diop',
    avatar: 'https://i.pravatar.cc/150?img=25',
    rating: 4.9,
    totalReviews: 567,
    verified: true,
    memberSince: '2021-06',
    responseTime: '< 2h',
    responseRate: 95,
    location: 'Médina, Dakar',
    bio: 'Restaurant traditionnel sénégalais. Cuisine familiale authentique depuis 15 ans.',
    contactInfo: {
      phone: '+221 76 234 56 78',
      whatsapp: '+221 76 234 56 78',
      email: 'chezfatou@gmail.com',
      facebook: 'ChezFatouDakar'
    },
    totalListings: 12,
    categories: ['Alimentation', 'Restaurant']
  },
  'seller_003': {
    id: 'seller_003',
    name: 'Immobilier Premium',
    avatar: 'https://i.pravatar.cc/150?img=33',
    rating: 4.7,
    totalReviews: 189,
    verified: true,
    memberSince: '2020-01',
    responseTime: '< 3h',
    responseRate: 92,
    location: 'Almadies, Dakar',
    bio: 'Agence immobilière certifiée. Location et vente de biens haut de gamme à Dakar.',
    contactInfo: {
      phone: '+221 77 345 67 89',
      whatsapp: '+221 77 345 67 89',
      email: 'info@immopremium.sn',
      website: 'www.immopremium.sn',
      instagram: '@immopremium'
    },
    totalListings: 67,
    categories: ['Immobilier']
  },
  'seller_004': {
    id: 'seller_004',
    name: 'Auto Premium Dakar',
    avatar: 'https://i.pravatar.cc/150?img=44',
    rating: 4.6,
    totalReviews: 234,
    verified: true,
    memberSince: '2021-09',
    responseTime: '< 2h',
    responseRate: 90,
    location: 'Grand Yoff, Dakar',
    bio: 'Vente de véhicules d\'occasion contrôlés. Garantie 6 mois, financement disponible.',
    contactInfo: {
      phone: '+221 77 456 78 90',
      whatsapp: '+221 77 456 78 90',
      email: 'sales@autopremium.sn',
      website: 'www.autopremium.sn'
    },
    totalListings: 28,
    categories: ['Automobile']
  },
  'seller_005': {
    id: 'seller_005',
    name: 'Beauty Touch',
    avatar: 'https://i.pravatar.cc/150?img=28',
    rating: 4.9,
    totalReviews: 412,
    verified: true,
    memberSince: '2022-02',
    responseTime: '< 1h',
    responseRate: 97,
    location: 'Sacré-Coeur, Dakar',
    bio: 'Coiffeuse professionnelle diplômée. Services à domicile ou en salon.',
    contactInfo: {
      phone: '+221 76 567 89 01',
      whatsapp: '+221 76 567 89 01',
      instagram: '@beautytouch_dkr'
    },
    totalListings: 8,
    categories: ['Mode & Beauté', 'Services']
  },
  'seller_006': {
    id: 'seller_006',
    name: 'Clean Home Services',
    avatar: 'https://i.pravatar.cc/150?img=15',
    rating: 4.8,
    totalReviews: 298,
    verified: true,
    memberSince: '2021-11',
    responseTime: '< 2h',
    responseRate: 94,
    location: 'Dakar, Sénégal',
    bio: 'Entreprise de nettoyage professionnel. Personnel qualifié et produits écologiques.',
    contactInfo: {
      phone: '+221 77 678 90 12',
      whatsapp: '+221 77 678 90 12',
      email: 'contact@cleanhome.sn',
      facebook: 'CleanHomeServicesDakar'
    },
    totalListings: 15,
    categories: ['Services à domicile']
  }
};

export const mockItems: Record<string, Item[]> = {
  electronique: [
    {
      id: 1,
      title: 'iPhone 14 Pro Max 256GB',
      price: '850 000 FCFA',
      negotiable: true,
      location: 'Plateau, Dakar',
      images: [
        'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      mainImage: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Électronique',
      subcategory: 'Téléphones',
      type: 'product',
      rating: 4.8,
      totalReviews: 24,
      seller: sellers['seller_001'],
      sellerId: 'seller_001',
      promoted: true,
      featured: true,
      postedTime: '2h',
      postedDate: '2025-11-20',
      description: 'iPhone 14 Pro Max en excellent état, 256GB de stockage, couleur noir spatial. Aucune rayure, batterie à 98% de santé. Facture et accessoires d\'origine inclus (câble, chargeur, écouteurs). Le téléphone a été acheté neuf il y a 6 mois et très peu utilisé. Garantie Apple restante de 6 mois transférable.',
      condition: 'used',
      brand: 'Apple',
      views: 1247,
      favorites: 89,
      quantity: 1,
      warranty: '6 mois garantie Apple',
      returnPolicy: 'Retour possible sous 48h si défaut constaté',
      delivery: {
        available: true,
        cost: '5 000 FCFA',
        areas: ['Dakar', 'Pikine', 'Guédiawaye'],
        estimatedTime: '24-48h'
      },
      specifications: {
        'Écran': '6.7" Super Retina XDR',
        'Processeur': 'A16 Bionic',
        'Stockage': '256GB',
        'RAM': '6GB',
        'Caméra': '48MP + 12MP + 12MP',
        'Batterie': '4323 mAh',
        'Système': 'iOS 17'
      },
      tags: ['iPhone', 'Apple', 'Smartphone', 'Pro Max', 'Comme neuf'],
      status: 'active'
    },
    {
      id: 2,
      title: 'Réparation & Maintenance Informatique',
      price: '15 000 FCFA',
      negotiable: true,
      location: 'Plateau, Dakar',
      images: [
        'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      mainImage: 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Électronique',
      subcategory: 'Services IT',
      type: 'service',
      rating: 4.9,
      totalReviews: 87,
      seller: sellers['seller_001'],
      sellerId: 'seller_001',
      promoted: false,
      featured: false,
      postedTime: '5h',
      postedDate: '2025-11-20',
      description: 'Service professionnel de réparation et maintenance pour tous types d\'ordinateurs (PC et Mac). Nos techniciens certifiés interviennent rapidement pour: installation de systèmes d\'exploitation, nettoyage de virus et malwares, remplacement de composants (disque dur, RAM, écran), mise à niveau, récupération de données, optimisation des performances. Diagnostic gratuit. Garantie 3 mois sur les réparations.',
      views: 456,
      favorites: 34,
      availability: {
        days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        hours: '8h - 19h'
      },
      serviceArea: ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'],
      duration: '1-3 heures selon panne',
      specifications: {
        'Intervention': 'À domicile ou en atelier',
        'Délai': 'Même jour pour urgences',
        'Garantie': '3 mois sur réparations',
        'Diagnostic': 'Gratuit'
      },
      tags: ['Réparation PC', 'Maintenance', 'Dépannage', 'Informatique', 'Technicien'],
      status: 'active'
    },
    {
      id: 3,
      title: 'MacBook Air M2 2023',
      price: '1 200 000 FCFA',
      negotiable: false,
      location: 'Plateau, Dakar',
      images: [
        'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      mainImage: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
      category: 'Électronique',
      subcategory: 'Ordinateurs',
      type: 'product',
      rating: 4.9,
      totalReviews: 15,
      seller: sellers['seller_001'],
      sellerId: 'seller_001',
      promoted: true,
      featured: true,
      postedDate: '2025-11-19',
      postedTime: '1j',
      description: 'MacBook Air M2 flambant neuf, encore sous garantie Apple. Couleur Minuit. Performance exceptionnelle avec la puce M2, idéal pour le travail professionnel, montage vidéo, design graphique. Autonomie jusqu\'à 18 heures. Emballage d\'origine non ouvert, tous les accessoires inclus.',
      condition: 'new',
      brand: 'Apple',
      views: 892,
      favorites: 67,
      quantity: 2,
      warranty: '1 an garantie Apple',
      returnPolicy: 'Retour sous 14 jours',
      delivery: {
        available: true,
        cost: 'Gratuit',
        areas: ['Tout Sénégal'],
        estimatedTime: '24-72h'
      },
      specifications: {
        'Écran': '13.6" Liquid Retina',
        'Processeur': 'Apple M2',
        'Stockage': '256GB SSD',
        'RAM': '8GB',
        'Poids': '1.24 kg',
        'Autonomie': 'Jusqu\'à 18h',
        'Système': 'macOS Sonoma'
      },
      tags: ['MacBook', 'Apple', 'M2', 'Neuf', 'Portable'],
      status: 'active'
    },
        {
      id: 7,
      title: 'Samsung Galaxy S23 Ultra 512GB',
      price: '720 000 FCFA',
      negotiable: true,
      location: 'Fann, Dakar',
      images: [
        'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
        'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg'
      ],
      mainImage: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
      category: 'Électronique',
      subcategory: 'Téléphones',
      type: 'product',
      rating: 4.7,
      totalReviews: 31,
      seller: sellers['seller_002'],
      sellerId: 'seller_002',
      promoted: true,
      featured: false,
      postedTime: '6h',
      postedDate: '2025-11-20',
      description: 'S23 Ultra 512GB vert, état impeccable. Écran AMOLED 120Hz, caméra 200MP, S-Pen inclus. Batterie 95%. Avec boîte, chargeur 45W et coque Spigen. Première main, acheté chez Baobab Tech.',
      condition: 'used',
      brand: 'Samsung',
      views: 1892,
      favorites: 112,
      quantity: 1,
      warranty: '3 mois boutique',
      delivery: { available: true, cost: '3 000 FCFA', areas: ['Dakar', 'Thiès'], estimatedTime: '24h' },
      specifications: {
        'Écran': '6.8" Dynamic AMOLED 2X',
        'Stockage': '512GB',
        'RAM': '12GB',
        'Caméra': '200MP principal',
        'Batterie': '5000 mAh'
      },
      tags: ['Samsung', 'S23 Ultra', '512GB', 'S-Pen', 'Haut de gamme'],
      status: 'active'
    },
    {
      id: 8,
      title: 'PlayStation 5 Slim + 2 manettes + FIFA 25',
      price: '485 000 FCFA',
      negotiable: true,
      location: 'Parcelles, Dakar',
      images: ['https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg'],
      mainImage: 'https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg',
      category: 'Électronique',
      subcategory: 'Consoles & Jeux',
      type: 'product',
      rating: 4.9,
      totalReviews: 42,
      seller: sellers['seller_003'],
      sellerId: 'seller_003',
      promoted: false,
      featured: true,
      postedTime: '12h',
      postedDate: '2025-11-19',
      description: 'PS5 Slim 1To avec lecteur disque + 2ème manette DualSense noire + FIFA 25 version physique. Très peu utilisée (moins de 50h de jeu). Avec tous les câbles et boîte d\'origine.',
      condition: 'used',
      brand: 'Sony',
      views: 3421,
      favorites: 298,
      quantity: 1,
      delivery: { available: true, cost: 'Gratuit à Dakar', areas: ['Dakar'], estimatedTime: 'Même jour' },
      specifications: {
        'Modèle': 'PS5 Slim (CFI-2000)',
        'Stockage': '1To SSD',
        'Jeu inclus': 'FIFA 25',
        'Manettes': '2 incluses'
      },
      tags: ['PS5', 'PlayStation 5', 'FIFA 25', 'Comme neuf'],
      status: 'active'
    },
    {
      id: 9,
      title: 'Montage PC Gamer RTX 4070 Ti + Ryzen 7',
      price: '1 650 000 FCFA',
      negotiable: false,
      location: 'Mermoz, Dakar',
      images: ['https://images.pexels.com/photos/7770011/pexels-photo-7770011.jpeg'],
      mainImage: 'https://images.pexels.com/photos/7770011/pexels-photo-7770011.jpeg',
      category: 'Électronique',
      subcategory: 'Ordinateurs',
      type: 'product',
      rating: 5.0,
      totalReviews: 19,
      seller: sellers['seller_004'],
      sellerId: 'seller_004',
      promoted: true,
      featured: true,
      postedTime: '1j',
      postedDate: '2025-11-19',
      description: 'PC Gamer haut de gamme monté sur mesure. Parfait 1440p/4K. RGB complet, watercooling AIO 360mm. Garantie 2 ans sur tous les composants.',
      condition: 'new',
      brand: 'Custom',
      views: 2678,
      favorites: 312,
      quantity: 1,
      warranty: '2 ans pièces et main d\'œuvre',
      specifications: {
        'Processeur': 'Ryzen 7 7800X3D',
        'Carte graphique': 'RTX 4070 Ti 12GB',
        'RAM': '32GB DDR5 6000MHz',
        'Stockage': '2To NVMe Gen4',
        'Boîtier': 'Lian Li O11 Dynamic'
      },
      tags: ['PC Gamer', 'RTX 4070 Ti', 'Ryzen', 'Haut de gamme', 'RGB'],
      status: 'active'
    }
  ],
  
  alimentation: [
    {
      id: 101,
      title: 'Restaurant Thiéboudienne traditionnelle',
      price: '2 500 FCFA',
      negotiable: false,
      location: 'Médina, Dakar',
      images: [
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      mainImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Alimentation',
      subcategory: 'Restaurants',
      type: 'service',
      rating: 4.9,
      totalReviews: 234,
      seller: sellers['seller_002'],
      sellerId: 'seller_002',
      promoted: true,
      featured: true,
      postedTime: '1h',
      postedDate: '2025-11-20',
      description: 'Thiéboudienne authentique préparée à la sénégalaise avec poisson frais, légumes du marché et riz de qualité. Recette familiale transmise depuis 3 générations. Grande portion servie avec poisson entier, légumes variés (manioc, chou, carotte, aubergine). Également disponible: Mafé, Yassa, Soupe Kandia. Livraison rapide dans tout Dakar. Service traiteur pour événements disponible.',
      views: 2341,
      favorites: 178,
      availability: {
        days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
        hours: '11h - 22h'
      },
      serviceArea: ['Dakar', 'Pikine', 'Guédiawaye'],
      delivery: {
        available: true,
        cost: '1 500 FCFA',
        areas: ['Dakar', 'Pikine', 'Guédiawaye'],
        estimatedTime: '45min - 1h'
      },
      specifications: {
        'Spécialité': 'Thiéboudienne rouge et blanc',
        'Livraison': 'Disponible',
        'Commande': 'Sur place ou par téléphone',
        'Paiement': 'Espèces, Wave, Orange Money'
      },
      tags: ['Thiéboudienne', 'Restaurant', 'Cuisine sénégalaise', 'Livraison', 'Halal'],
      status: 'active'
    },
    {
      id: 102,
      title: 'Pastels + Fataya (50 pièces)',
      price: '25 000 FCFA',
      negotiable: false,
      location: 'HLM, Dakar',
      images: ['https://images.pexels.com/photos/12773335/pexels-photo-12773335.jpeg?auto=compress&cs=tinysrgb&w=600'],
      mainImage: 'https://images.pexels.com/photos/12773335/pexels-photo-12773335.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Alimentation',
      subcategory: 'Traiteur & Snacks',
      type: 'product',
      rating: 4.9,
      totalReviews: 312,
      seller: sellers['seller_001'],
      sellerId: 'seller_001',
      promoted: true,
      featured: true,
      postedTime: '3h',
      postedDate: '2025-11-20',
      description: 'Pastels au thon/viande et fatayas croustillants. Préparés le jour même. Idéal baptême, mariage, réunion.',
      views: 2890,
      favorites: 421,
      delivery: { available: true, cost: '2 000 FCFA', estimatedTime: '1h',areas: ['Dakar', 'Pikine', 'Guédiawaye'], },
      tags: ['Pastels', 'Fataya', 'Traiteur', 'Livraison'],
      status: 'active'
    },
    {
      id: 103,
      title: 'Pâtisserie & Gâteaux sur commande',
      price: '25 000 FCFA',
      negotiable: true,
      location: 'Point E, Dakar',
      images: ['https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg'],
      mainImage: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
      category: 'Alimentation',
      subcategory: 'Pâtisserie',
      type: 'service',
      rating: 4.9,
      totalReviews: 189,
      seller: sellers['seller_005'],
      sellerId: 'seller_005',
      promoted: true,
      featured: true,
      postedTime: '3h',
      postedDate: '2025-11-20',
      description: 'Gâteaux d\'anniversaire, mariage, baptême personnalisés. Number cake, layer cake, drip cake, naked cake. Goûts: vanille, chocolat, red velvet, pistache, citron. Décoration en pâte à sucre ou fleurs fraîches.',
      views: 1567,
      favorites: 201,
      availability: { days: ['Tous les jours'], hours: '9h - 20h' },
      serviceArea: ['Dakar et banlieue'],
      delivery: { available: true, cost: '2 000 - 5 000 FCFA', areas: ['Dakar'], estimatedTime: '24-48h' },
      tags: ['Gâteau', 'Anniversaire', 'Mariage', 'Pâtisserie', 'Sur mesure'],
      status: 'active'
    },
    {
      id: 104,
      title: 'Dibiterie - Brochettes & Grillades',
      price: '1 500 FCFA la portion',
      negotiable: false,
      location: 'Colobane, Dakar',
      images: ['https://images.pexels.com/photos/4106485/pexels-photo-4106485.jpeg'],
      mainImage: 'https://images.pexels.com/photos/4106485/pexels-photo-4106485.jpeg',
      category: 'Alimentation',
      subcategory: 'Fast Food',
      type: 'service',
      rating: 4.8,
      totalReviews: 412,
      seller: sellers['seller_006'],
      sellerId: 'seller_006',
      promoted: false,
      featured: true,
      postedTime: '30min',
      postedDate: '2025-11-20',
      description: 'Meilleures brochettes de Dakar ! Bœuf, mouton, poulet, poisson braisé. Accompagné d\'oignons, moutarde, pain. Ouvert jusqu\'à 3h du matin.',
      views: 2891,
      favorites: 167,
      availability: { days: ['Tous les jours'], hours: '18h - 3h' },
      serviceArea: ['Dakar'],
      delivery: { available: true, cost: '1 000 FCFA', areas: ['Dakar centre'], estimatedTime: '30-45min' },
      tags: ['Dibiterie', 'Brochettes', 'Grillades', 'Nuit'],
      status: 'active'
    }
  ],
  
  immobilier: [
    {
      id: 201,
      title: 'Villa F4 moderne à louer',
      price: '450 000 FCFA/mois',
      negotiable: true,
      location: 'Almadies, Dakar',
      images: [
        'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      mainImage: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Immobilier',
      subcategory: 'Location appartements',
      type: 'product',
      rating: 4.8,
      totalReviews: 12,
      seller: sellers['seller_003'],
      sellerId: 'seller_003',
      promoted: true,
      featured: true,
      postedTime: '2h',
      postedDate: '2025-11-20',
      description: 'Magnifique villa moderne de 4 pièces dans le quartier résidentiel des Almadies. Entièrement meublée et équipée. Grande piscine privée, jardin entretenu, garage pour 2 véhicules. Quartier calme et sécurisé avec surveillance 24/7. Proche plages, restaurants, supermarchés et écoles internationales. Idéal pour expatriés ou familles. Bail minimum 1 an. Charges incluses (eau, entretien jardin et piscine).',
      condition: 'new',
      views: 1567,
      favorites: 145,
      specifications: {
        'Surface': '250 m²',
        'Chambres': '4',
        'Salles de bain': '3',
        'Salon': 'Double salon',
        'Cuisine': 'Équipée moderne',
        'Extérieur': 'Jardin + Piscine',
        'Parking': '2 places couvertes',
        'Climatisation': 'Toutes pièces',
        'Sécurité': '24/7 + Gardiennage'
      },
      tags: ['Villa', 'F4', 'Piscine', 'Almadies', 'Meublé', 'Expatriés'],
      status: 'active'
    },
    {
      id: 202,
      title: 'Appartement F3 meublé - Ngor',
      price: '350 000 FCFA/mois',
      negotiable: true,
      location: 'Ngor, Dakar',
      images: ['https://images.pexels.com/photos/584399/living-room-584399.jpeg'],
      mainImage: 'https://images.pexels.com/photos/584399/living-room-584399.jpeg',
      category: 'Immobilier',
      subcategory: 'Location appartements',
      type: 'product',
      rating: 4.7,
      totalReviews: 28,
      seller: sellers['seller_001'],
      sellerId: 'seller_001',
      promoted: true,
      featured: false,
      postedTime: '8h',
      postedDate: '2025-11-20',
      description: 'Bel appartement F3 entièrement meublé à 5min de la plage de Ngor. WiFi fibre, climatisation, TV Netflix, cuisine équipée. Idéal court ou long séjour.',
      condition: 'new',
      views: 2134,
      favorites: 189,
      specifications: {
        'Surface': '95 m²',
        'Chambres': '3',
        'Étage': '2ème',
        'Vue': 'Mer partielle',
        'WiFi': 'Fibre 100Mbps',
        'Durée min': '3 mois'
      },
      tags: ['Ngor', 'Meublé', 'Plage', 'F3', 'Court séjour'],
      status: 'active'
    },
    {
      id: 203,
      title: 'Terrain 300m² - Diamniadio (titre foncier)',
      price: '18 000 000 FCFA',
      negotiable: true,
      location: 'Diamniadio',
      images: ['https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg'],
      mainImage: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg',
      category: 'Immobilier',
      subcategory: 'Terrains',
      type: 'product',
      rating: 4.6,
      totalReviews: 9,
      seller: sellers['seller_003'],
      sellerId: 'seller_003',
      promoted: true,
      featured: true,
      postedTime: '1j',
      postedDate: '2025-11-19',
      description: 'Terrain bien placé à Diamniadio, zone en pleine expansion. Titre foncier individuel. Clôturé sur 2 côtés. Accès route bitumée.',
      views: 1876,
      favorites: 134,
      specifications: {
        'Superficie': '300 m²',
        'Type': 'Résidentiel',
        'Titre': 'Titre foncier',
        'Clôture': '2 côtés',
        'Accès': 'Route bitumée'
      },
      tags: ['Terrain', 'Diamniadio', 'TF', 'Investissement'],
      status: 'active'
    }
  ],
  
  automobile: [
    {
      id: 301,
      title: 'Toyota Corolla 2020',
      price: '9 500 000 FCFA',
      negotiable: true,
      location: 'Grand Yoff, Dakar',
      images: [
        'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      mainImage: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Automobile',
      subcategory: 'Voitures',
      type: 'product',
      rating: 4.7,
      totalReviews: 18,
      seller: sellers['seller_004'],
      sellerId: 'seller_004',
      promoted: true,
      featured: false,
      postedTime: '3h',
      postedDate: '2025-11-20',
      description: 'Toyota Corolla 2020 en excellent état, première main. Kilométrage: 45 000 km. Entretien régulier avec carnet à jour. Climatisation, vitres électriques, système audio Bluetooth, airbags, ABS. Véhicule dédouané, carte grise à jour. Intérieur impeccable, aucun accident. Essai possible sur rendez-vous. Financement disponible avec apport de 30%.',
      condition: 'used',
      brand: 'Toyota',
      views: 2145,
      favorites: 234,
      quantity: 1,
      warranty: '6 mois garage',
      specifications: {
        'Marque': 'Toyota',
        'Modèle': 'Corolla',
        'Année': '2020',
        'Kilométrage': '45 000 km',
        'Carburant': 'Essence',
        'Transmission': 'Automatique',
        'Couleur': 'Gris métallisé',
        'Cylindrée': '1.8L',
        'Portes': '4',
        'Places': '5',
        'État': 'Excellent'
      },
      tags: ['Toyota', 'Corolla', '2020', 'Automatique', 'Première main'],
      status: 'active'
    },
    {
      id: 302,
      title: 'Peugeot 3008 GT Line 2019',
      price: '14 500 000 FCFA',
      negotiable: true,
      location: 'Sicap Liberté',
      images: ['https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?auto=compress&cs=tinysrgb&w=600'],
      mainImage: 'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Automobile',
      subcategory: 'Voitures',
      type: 'product',
      rating: 4.8,
      totalReviews: 27,
      seller: sellers['seller_001'],
      sellerId: 'seller_001',
      promoted: true,
      featured: true,
      postedTime: '5h',
      postedDate: '2025-11-20',
      description: 'Peugeot 3008 GT Line full options, toit panoramique, caméra 360°, 42 000 km, première main.',
      condition: 'used',
      brand: 'Peugeot',
      views: 4321,
      favorites: 567,
      specifications: { 'Année': '2019', 'Kilométrage': '42 000 km', 'Carburant': 'Diesel', 'Boîte': 'Automatique' },
      tags: ['Peugeot', '3008', 'GT Line', 'Full options'],
      status: 'active'
    },
    {
      id: 303,
      title: 'Hyundai Tucson 2021 Limited',
      price: '16 800 000 FCFA',
      negotiable: true,
      location: 'Mermoz',
      images: ['https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=600'],
      mainImage: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Automobile',
      subcategory: 'Voitures',
      type: 'product',
      rating: 4.9,
      totalReviews: 14,
      seller: sellers['seller_003'],
      sellerId: 'seller_003',
      promoted: false,
      featured: true,
      postedTime: '1j',
      postedDate: '2025-11-19',
      description: 'Tucson Limited 2021 importé USA, 28 000 miles, cuir, toit ouvrant, garantie 3 mois garage.',
      condition: 'used',
      brand: 'Hyundai',
      views: 2987,
      favorites: 412,
      tags: ['Hyundai', 'Tucson', '2021', 'Import USA'],
      status: 'active'
    },
        {
      id: 304,
      title: 'Peugeot 3008 GT Line 2019',
      price: '14 800 000 FCFA',
      negotiable: true,
      location: 'Sicap Liberté, Dakar',
      images: ['https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg'],
      mainImage: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg',
      category: 'Automobile',
      subcategory: 'Voitures',
      type: 'product',
      rating: 4.8,
      totalReviews: 14,
      seller: sellers['seller_005'],
      sellerId: 'seller_005',
      promoted: true,
      featured: true,
      postedTime: '4h',
      postedDate: '2025-11-20',
      description: '3008 GT Line full options : toit panoramique, caméra 360°, siège chauffant/massage, hayon électrique. 62 000 km. Entretien Peugeot officiel.',
      condition: 'used',
      brand: 'Peugeot',
      views: 2987,
      favorites: 267,
      quantity: 1,
      warranty: '6 mois garage',
      specifications: {
        'Année': '2019',
        'Kilométrage': '62 000 km',
        'Carburant': 'Diesel',
        'Boîte': 'Automatique',
        'Toit': 'Panoramique ouvrant'
      },
      tags: ['Peugeot', '3008', 'GT Line', 'Full options', 'Diesel'],
      status: 'active'
    },
    {
      id: 305,
      title: 'Location voiture mariage & événements',
      price: '80 000 FCFA/jour',
      negotiable: true,
      location: 'Almadies, Dakar',
      images: ['https://images.pexels.com/photos/1164773/pexels-photo-1164773.jpeg'],
      mainImage: 'https://images.pexels.com/photos/1164773/pexels-photo-1164773.jpeg',
      category: 'Automobile',
      subcategory: 'Location véhicules',
      type: 'service',
      rating: 4.9,
      totalReviews: 67,
      seller: sellers['seller_002'],
      sellerId: 'seller_002',
      promoted: true,
      featured: false,
      postedTime: '5h',
      postedDate: '2025-11-20',
      description: 'Location voitures de prestige pour mariages : Mercedes Classe E, Range Rover, BMW Série 5 décapotable. Chauffeur expérimenté en costume. Décoration fleurs offerte.',
      views: 1345,
      favorites: 98,
      availability: { days: ['Tous les jours'], hours: '24h/24' },
      serviceArea: ['Dakar', 'Saly', 'Thiès'],
      duration: 'Journée ou weekend',
      tags: ['Mariage', 'Location voiture', 'Prestige', 'Chauffeur'],
      status: 'active'
    }
  ],
  
  'mode-beaute': [
    {
      id: 401,
      title: 'Coiffure et tressage à domicile',
      price: 'À partir de 10 000 FCFA',
      negotiable: true,
      location: 'Sacré-Coeur, Dakar',
      images: [
        'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      mainImage: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Mode & Beauté',
      subcategory: 'Coiffure',
      type: 'service',
      rating: 4.9,
      totalReviews: 167,
      seller: sellers['seller_005'],
      sellerId: 'seller_005',
      promoted: true,
      featured: true,
      postedTime: '2h',
      postedDate: '2025-11-20',
      description: 'Coiffeuse professionnelle diplômée avec 8 ans d\'expérience. Services à domicile ou au salon. Spécialités: tressage africain (Box braids, Twists, Cornrows), pose de mèches, perruques, tissages, lissage brésilien, coupe et coloration. Produits de qualité professionnelle. Réservation en ligne ou par WhatsApp. Forfaits mariages et événements disponibles.',
      views: 1876,
      favorites: 234,
      availability: {
        days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        hours: '9h - 20h'
      },
      serviceArea: ['Dakar', 'Pikine'],
      duration: '2-5 heures selon coiffure',
      specifications: {
        'Tressage': 'À partir de 10 000 FCFA',
        'Mèches': 'À partir de 15 000 FCFA',
        'Perruque': 'À partir de 12 000 FCFA',
        'Tissage': 'À partir de 20 000 FCFA',
        'Déplacement': '2 000 FCFA',
        'Paiement': 'Espèces, Mobile Money'
      },
      tags: ['Coiffure', 'Tressage', 'Mèches', 'À domicile', 'Professionnelle'],
      status: 'active'
    },
        {
      id: 402,
      title: 'Maquillage permanent & Microblading',
      price: 'À partir de 80 000 FCFA',
      negotiable: false,
      location: 'Les Almadies, Dakar',
      images: ['https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg'],
      mainImage: 'https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg',
      category: 'Mode & Beauté',
      subcategory: 'Esthétique',
      type: 'service',
      rating: 5.0,
      totalReviews: 84,
      seller: sellers['seller_004'],
      sellerId: 'seller_004',
      promoted: true,
      featured: true,
      postedTime: '7h',
      postedDate: '2025-11-20',
      description: 'Sourcils microblading, eyeliner permanent, lèvres full lips. Produits européens certifiés. Résultat naturel garanti. Retouche incluse après 6 semaines.',
      views: 2123,
      favorites: 289,
      availability: { days: ['Lundi', 'Mercredi', 'Vendredi', 'Samedi'], hours: '10h - 18h' },
      duration: '2-4 heures',
      tags: ['Microblading', 'Maquillage permanent', 'Sourcils', 'Lèvres'],
      status: 'active'
    }
  ],
  
  'services-domicile': [
    {
      id: 501,
      title: 'Femme de ménage professionnelle',
      price: '3 500 FCFA/heure',
      negotiable: true,
      location: 'Dakar, Sénégal',
      images: [
        'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      mainImage: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Services à domicile',
      subcategory: 'Ménage',
      type: 'service',
      rating: 4.8,
      totalReviews: 142,
      seller: sellers['seller_006'],
      sellerId: 'seller_006',
      promoted: true,
      featured: true,
      postedTime: '1h',
      postedDate: '2025-11-20',
      description: 'Entreprise de nettoyage professionnel avec personnel qualifié et formé. Services proposés: nettoyage complet de maison/appartement, repassage, lavage de vitres, nettoyage après travaux, entretien bureaux. Personnel vérifié avec références. Produits écologiques disponibles. Contrats ponctuels, hebdomadaires ou mensuels. Assurance responsabilité civile. Satisfaction garantie ou intervention gratuite.',
      views: 987,
      favorites: 98,
      availability: {
        days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        hours: '7h - 18h'
      },
      serviceArea: ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'],
      duration: 'Selon surface (min 3h)',
      specifications: {
        'Tarif horaire': '3 500 FCFA',
        'Forfait 4h': '12 000 FCFA',
        'Forfait journée': '20 000 FCFA',
        'Repassage': '+2 000 FCFA/heure',
        'Produits': 'Inclus ou fournis par client',
        'Personnel': 'Vérifié et formé'
      },
      tags: ['Ménage', 'Nettoyage', 'Professionnel', 'Entreprise', 'Fiable'],
      status: 'active'
    },
        {
      id: 502,
      title: 'Cours particuliers Maths/Physique - Domicile',
      price: '10 000 FCFA/heure',
      negotiable: true,
      location: 'Dakar & banlieue',
      images: ['https://images.pexels.com/photos/5428825/pexels-photo-5428825.jpeg'],
      mainImage: 'https://images.pexels.com/photos/5428825/pexels-photo-5428825.jpeg',
      category: 'Services à domicile',
      subcategory: 'Cours & Formation',
      type: 'service',
      rating: 4.9,
      totalReviews: 156,
      seller: sellers['seller_001'],
      sellerId: 'seller_001',
      promoted: true,
      featured: false,
      postedTime: '9h',
      postedDate: '2025-11-20',
      description: 'Professeur agrégé propose cours particuliers Maths & Physique-Chimie. Tous niveaux : collège, lycée (S, L, T), prépa, université. Méthodologie + exercices corrigés.',
      views: 987,
      favorites: 76,
      availability: { days: ['Lundi', 'Mardi', 'Jeudi', 'Vendredi', 'Samedi'], hours: '16h - 21h' },
      serviceArea: ['Dakar', 'Pikine', 'Guédiawaye'],
      duration: '1h30 à 2h par séance',
      tags: ['Cours', 'Mathématiques', 'Physique', 'Domicile', 'Lycée'],
      status: 'active'
    },
    {
      id: 503,
      title: 'Plombier professionnel 24h/24',
      price: 'À partir de 15 000 FCFA',
      negotiable: true,
      location: 'Tout Dakar',
      images: ['https://images.pexels.com/photos/5841622/pexels-photo-5841622.jpeg'],
      mainImage: 'https://images.pexels.com/photos/5841622/pexels-photo-5841622.jpeg',
      category: 'Services à domicile',
      subcategory: 'Plomberie',
      type: 'service',
      rating: 4.8,
      totalReviews: 203,
      seller: sellers['seller_006'],
      sellerId: 'seller_006',
      promoted: false,
      featured: true,
      postedTime: '2h',
      postedDate: '2025-11-20',
      description: 'Urgence plomberie 24h/24 : fuite d\'eau, débouchage canalisation, chasse d\'eau, robinetterie, chauffe-eau. Intervention rapide sous 1h.',
      views: 1654,
      favorites: 89,
      availability: { days: ['Tous les jours'], hours: '24h/24' },
      serviceArea: ['Dakar', 'Pikine', 'Rufisque', 'Thiès'],
      duration: '30min à 2h',
      tags: ['Plombier', 'Urgence', 'Fuite', 'Débouchage', '24h'],
      status: 'active'
    }
  ]
};

// Exemples de reviews pour les items
export const itemReviews: Record<number, Review[]> = {
  1: [ // iPhone 14 Pro Max
    {
      id: 'rev_001',
      userId: 'user_123',
      userName: 'Moussa Sarr',
      userAvatar: 'https://i.pravatar.cc/150?img=8',
      rating: 5,
      comment: 'Excellent téléphone comme décrit. Vendeur très professionnel et réactif. Je recommande!',
      date: '2025-11-18',
      helpful: 12
    },
    {
      id: 'rev_002',
      userId: 'user_456',
      userName: 'Aïssatou Diallo',
      userAvatar: 'https://i.pravatar.cc/150?img=20',
      rating: 5,
      comment: 'Transaction parfaite. Le téléphone est en excellent état, batterie neuve. Livraison rapide.',
      date: '2025-11-15',
      helpful: 8
    },
    {
      id: 'rev_003',
      userId: 'user_789',
      userName: 'Omar Ndiaye',
      userAvatar: 'https://i.pravatar.cc/150?img=11',
      rating: 4,
      comment: 'Bon produit mais prix un peu élevé. Sinon rien à redire sur l\'état.',
      date: '2025-11-10',
      helpful: 5
    }
  ],
  101: [ // Restaurant Thiéboudienne
    {
      id: 'rev_101',
      userId: 'user_234',
      userName: 'Fatima Ba',
      userAvatar: 'https://i.pravatar.cc/150?img=23',
      rating: 5,
      comment: 'Meilleur thiéboudienne de Dakar! Goût authentique comme chez ma grand-mère.',
      date: '2025-11-19',
      helpful: 45
    },
    {
      id: 'rev_102',
      userId: 'user_567',
      userName: 'Jean-Pierre Dupont',
      userAvatar: 'https://i.pravatar.cc/150?img=14',
      rating: 5,
      comment: 'Délicieux! Portions généreuses, livraison rapide. Je commande toutes les semaines.',
      date: '2025-11-17',
      helpful: 32
    }
  ],
  201: [ // Villa F4
    {
      id: 'rev_201',
      userId: 'user_345',
      userName: 'Sophie Martin',
      userAvatar: 'https://i.pravatar.cc/150?img=27',
      rating: 5,
      comment: 'Villa magnifique, quartier calme et sécurisé. Agence très professionnelle.',
      date: '2025-11-10',
      helpful: 23
    }
  ],
  301: [ // Toyota Corolla
    {
      id: 'rev_301',
      userId: 'user_678',
      userName: 'Amadou Sow',
      userAvatar: 'https://i.pravatar.cc/150?img=32',
      rating: 5,
      comment: 'Voiture en parfait état, exactement comme décrit. Bon vendeur, sérieux.',
      date: '2025-11-12',
      helpful: 18
    },
    {
      id: 'rev_302',
      userId: 'user_901',
      userName: 'Khadija Fall',
      userAvatar: 'https://i.pravatar.cc/150?img=29',
      rating: 4,
      comment: 'Bon véhicule, kilométrage vérifié. Petit défaut sur la climatisation mais réparé gratuitement.',
      date: '2025-11-08',
      helpful: 11
    }
  ],
  401: [ // Coiffure
    {
      id: 'rev_401',
      userId: 'user_111',
      userName: 'Marième Mbaye',
      userAvatar: 'https://i.pravatar.cc/150?img=24',
      rating: 5,
      comment: 'Coiffeuse au top! Tressage magnifique qui a tenu 3 semaines. Très professionnelle.',
      date: '2025-11-16',
      helpful: 34
    },
    {
      id: 'rev_402',
      userId: 'user_222',
      userName: 'Rokhaya Gueye',
      userAvatar: 'https://i.pravatar.cc/150?img=26',
      rating: 5,
      comment: 'Je ne vais plus que chez elle! Rapide, propre, résultat toujours parfait.',
      date: '2025-11-13',
      helpful: 28
    }
  ],
  501: [ // Ménage
    {
      id: 'rev_501',
      userId: 'user_333',
      userName: 'Pierre Leblanc',
      userAvatar: 'https://i.pravatar.cc/150?img=13',
      rating: 5,
      comment: 'Service impeccable. Personnel ponctuel et très efficace. Maison nickel!',
      date: '2025-11-18',
      helpful: 21
    },
    {
      id: 'rev_502',
      userId: 'user_444',
      userName: 'Ndeye Sène',
      userAvatar: 'https://i.pravatar.cc/150?img=31',
      rating: 5,
      comment: 'Excellente entreprise. Prix corrects, travail soigné. Je recommande vivement.',
      date: '2025-11-14',
      helpful: 16
    }
  ]
};


// Fonction utilitaire pour obtenir les items d'un vendeur
export const getItemsBySeller = (sellerId: string): Item[] => {
  const allItems: Item[] = [];
  Object.values(mockItems).forEach(categoryItems => {
    categoryItems.forEach(item => {
      if (item.sellerId === sellerId) {
        allItems.push(item);
      }
    });
  });
  return allItems;
};

// Fonction pour obtenir les statistiques d'un vendeur
export const getSellerStats = (sellerId: string) => {
  const items = getItemsBySeller(sellerId);
  const totalViews = items.reduce((sum, item) => sum + item.views, 0);
  const totalFavorites = items.reduce((sum, item) => sum + item.favorites, 0);
  const activeListings = items.filter(item => item.status === 'active').length;
  
  return {
    totalListings: items.length,
    activeListings,
    totalViews,
    totalFavorites,
    averageRating: sellers[sellerId]?.rating || 0,
    totalReviews: sellers[sellerId]?.totalReviews || 0
  };
};