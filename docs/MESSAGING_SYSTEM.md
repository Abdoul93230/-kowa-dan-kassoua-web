# Système de Messagerie MarketHub

## Vue d'ensemble

Le système de messagerie de MarketHub permet aux acheteurs de communiquer directement avec les vendeurs pour discuter des produits et services. Il offre une expérience utilisateur fluide avec des conversations en temps réel, des notifications de messages non lus et une interface intuitive.

## Architecture

### Structure des fichiers

```
src/
├── app/
│   ├── messages/
│   │   ├── page.tsx                 # Liste des conversations
│   │   └── [id]/
│   │       └── page.tsx             # Vue détaillée d'une conversation
│   └── items/[id]/page.tsx          # Bouton "Message" sur les produits
│
├── components/
│   └── home/
│       └── Header.tsx               # Badge messages non lus dans le header
│
├── lib/
│   └── mockData.ts                  # Données mock pour conversations et messages
│
└── types/
    └── index.ts                     # Types TypeScript (Message, Conversation)
```

### Types de données

#### Message
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'offer';
  attachments?: string[];
  offerDetails?: {
    itemId: number;
    itemTitle: string;
    itemImage: string;
    price: string;
  };
}
```

#### Conversation
```typescript
interface Conversation {
  id: string;
  participants: {
    buyer: {
      id: string;
      name: string;
      avatar?: string;
    };
    seller: Seller;
  };
  item?: {
    id: number;
    title: string;
    image: string;
    price: string;
  };
  lastMessage: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
}
```

## Fonctionnalités

### 1. Liste des conversations (`/messages`)
- **Affichage** : Liste de toutes les conversations actives
- **Recherche** : Filtrage par nom du vendeur ou titre du produit
- **Badges** : Indicateur du nombre de messages non lus
- **Aperçu** : Dernier message et informations du produit concerné
- **Navigation** : Clic sur une conversation pour ouvrir le chat complet

### 2. Chat détaillé (`/messages/[id]`)
- **Messages en temps réel** : Affichage des messages avec horodatage
- **Indicateur de lecture** : Double coche pour les messages lus
- **Saisie de message** : Zone de texte avec support multi-lignes (Shift+Entrée)
- **Indicateur "En train d'écrire"** : Animation lors de la réponse du vendeur
- **Informations du produit** : Carte affichant le produit concerné
- **Actions rapides** : Boutons pour appeler le vendeur ou voir son profil

### 3. Intégration dans l'application

#### Header
- **Badge de notification** : Affiche le nombre total de messages non lus
- **Icône Messages** : Accès rapide à la messagerie
- **Menu mobile** : Lien vers les messages avec badge

#### Page produit
- **Bouton "Message"** : Ouvre une conversation avec le vendeur
- **Détection intelligente** : Récupère la conversation existante ou en crée une nouvelle
- **Contexte du produit** : La conversation inclut automatiquement les détails du produit

## UX/UI Design

### Design System

#### Couleurs
- **Primary** : `#ec5a13` (orange) - Actions principales
- **Secondary** : `#ffe9de` (orange clair) - Arrière-plans
- **Success** : Vert - Statut vérifié
- **Gray** : Différentes nuances pour le texte et les bordures

#### Composants
- **Cards** : Bordures arrondies avec ombres légères
- **Badges** : Indicateurs de notification
- **Avatars** : Photos de profil avec badge de vérification
- **Buttons** : Couleurs cohérentes avec le reste de l'application

### Responsive Design
- **Mobile** : Interface adaptée avec menu pliant
- **Tablet/Desktop** : Vue élargie avec plus d'informations visibles
- **Touch-friendly** : Zones de clic optimisées pour mobile

### Animations
- **Smooth scroll** : Défilement automatique vers le dernier message
- **Bounce animation** : Indicateur "En train d'écrire"
- **Hover effects** : Feedback visuel sur les interactions
- **Transitions** : Changements d'état fluides

## Expérience utilisateur

### Points forts
1. **Simplicité** : Interface claire et intuitive
2. **Feedback visuel** : Statuts de lecture et notifications
3. **Contexte** : Informations du produit toujours visibles
4. **Rapidité** : Navigation fluide entre les conversations
5. **Accessibilité** : Contrastes et tailles de police adaptés

### Sécurité et bonnes pratiques
- **Conseils intégrés** : Messages de prudence pour les transactions
- **Pas d'informations sensibles** : Avertissement contre le partage de données bancaires
- **Rendez-vous publics** : Recommandation de lieux sûrs pour les échanges

## Intégration future avec un backend

### API à créer

#### Conversations
```typescript
// GET /api/conversations
// Récupérer toutes les conversations de l'utilisateur
GET /api/conversations

// GET /api/conversations/:id
// Récupérer une conversation spécifique
GET /api/conversations/:id

// POST /api/conversations
// Créer une nouvelle conversation
POST /api/conversations
Body: {
  sellerId: string,
  itemId: number,
  message: string
}
```

#### Messages
```typescript
// GET /api/conversations/:id/messages
// Récupérer les messages d'une conversation
GET /api/conversations/:id/messages?page=1&limit=50

// POST /api/conversations/:id/messages
// Envoyer un nouveau message
POST /api/conversations/:id/messages
Body: {
  content: string,
  type: 'text' | 'image'
}

// PATCH /api/messages/:id/read
// Marquer un message comme lu
PATCH /api/messages/:id/read
```

### WebSocket pour temps réel
```typescript
// Connexion WebSocket
ws://your-domain.com/ws/conversations/:id

// Événements
{
  type: 'new_message',
  data: Message
}

{
  type: 'user_typing',
  data: { userId: string }
}

{
  type: 'message_read',
  data: { messageId: string }
}
```

### Notifications push
- Notifications navigateur pour nouveaux messages
- Notifications mobile via service workers
- Sons de notification optionnels

## Améliorations futures

### Fonctionnalités additionnelles
1. **Pièces jointes** : Envoi d'images et de documents
2. **Messages vocaux** : Enregistrement et lecture audio
3. **Offres directes** : Proposer un prix directement dans le chat
4. **Emojis** : Sélecteur d'émojis pour enrichir les messages
5. **Archivage** : Archiver les conversations terminées
6. **Blocage** : Bloquer des utilisateurs indésirables
7. **Signalement** : Signaler des comportements inappropriés

### Performance
1. **Pagination** : Chargement progressif des messages
2. **Lazy loading** : Chargement à la demande des conversations
3. **Mise en cache** : Stockage local des conversations récentes
4. **Optimisation images** : Compression automatique des pièces jointes

### Analytics
1. **Taux de réponse** : Mesurer la réactivité des vendeurs
2. **Temps de réponse moyen** : Statistiques de performance
3. **Conversions** : Suivi des ventes générées via messages
4. **Satisfaction** : Collecte de feedback sur l'expérience de messagerie

## Support et maintenance

### Tests recommandés
- Tests unitaires sur les fonctions de filtrage et tri
- Tests d'intégration sur les flux de messagerie
- Tests E2E sur les parcours utilisateur complets
- Tests de performance sur le chargement des conversations

### Monitoring
- Surveiller les erreurs de chargement des messages
- Tracker les temps de latence
- Analyser les taux d'engagement
- Suivre les abandons de conversation

## Conclusion

Le système de messagerie de MarketHub offre une solution complète et bien conçue pour faciliter la communication entre acheteurs et vendeurs. L'architecture modulaire permet une évolution facile et l'intégration future avec un backend temps réel sera transparente grâce à la structure bien définie des types et des composants.
