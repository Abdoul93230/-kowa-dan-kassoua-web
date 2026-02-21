# Système de Favoris - Documentation

## Vue d'ensemble

Le système de favoris permet aux utilisateurs connectés de sauvegarder leurs produits préférés pour y accéder rapidement plus tard. Il utilise une architecture optimiste (Optimistic UI) pour fournir un retour instantané à l'utilisateur.

## Architecture

### Backend

#### Modèle: Favorite.js
- **Path**: `backend/src/models/Favorite.js`
- **Schema**:
  - `user` (ObjectId ref User) - Utilisateur qui a ajouté le favori
  - `product` (ObjectId ref Product) - Produit favorisé
  - `timestamps` - Date de création et modification
- **Index**: Compound unique index sur `{ user: 1, product: 1 }` pour éviter les doublons

#### Controller: favorite.controller.js
- **Path**: `backend/src/controllers/favorite.controller.js`
- **Méthodes**:
  - `addFavorite(req, res)` - POST /api/favorites/:productId
    - Valide que le produit existe
    - Vérifie les doublons
    - Crée le favori
    - Incrémente le compteur `product.favorites`
  
  - `removeFavorite(req, res)` - DELETE /api/favorites/:productId
    - Trouve et supprime le favori
    - Décrémente le compteur `product.favorites`
  
  - `getMyFavorites(req, res)` - GET /api/favorites
    - Retourne une liste paginée (20 par page)
    - Popule les données du produit et du vendeur
    - Transforme en format Item (compatible frontend)
  
  - `checkFavorite(req, res)` - GET /api/favorites/check/:productId
    - Retourne un booléen indiquant si le produit est favorisé
  
  - `getFavoriteIds(req, res)` - GET /api/favorites/ids
    - Retourne un tableau de product IDs favorisés
    - Utilisé pour charger l'état initial

#### Routes: favorite.routes.js
- **Path**: `backend/src/routes/favorite.routes.js`
- **Protection**: Toutes les routes nécessitent l'authentification (middleware `protect`)

### Frontend

#### API Library: favorites.ts
- **Path**: `frontend-web/src/lib/api/favorites.ts`
- **Fonctions**:
  - `addFavorite(productId)` - Ajoute un produit aux favoris
  - `removeFavorite(productId)` - Retire un produit des favoris
  - `getMyFavorites(page, limit)` - Liste paginée des favoris
  - `getFavoriteIds()` - Tableau d'IDs des favoris (chargement initial)
  - `checkFavorite(productId)` - Vérifie si un produit est favorisé
  - `toggleFavorite(productId, isFavorite)` - Smart wrapper (ajoute ou retire)

#### Context: FavoritesContext.tsx
- **Path**: `frontend-web/src/contexts/FavoritesContext.tsx`
- **Fonctionnalités**:
  - État global pour tous les composants
  - Chargement auto au login (via `useAuth`)
  - Nettoyage auto au logout
  - Optimistic updates avec rollback sur erreur
  - Hook `useFavorites()` pour consommation facile

**Utilisation**:
```tsx
import { useFavorites } from '@/contexts/FavoritesContext';

function MyComponent() {
  const { favorites, isFavorite, toggleFavorite, loading } = useFavorites();
  
  const handleToggle = async () => {
    try {
      await toggleFavorite('product-id-123');
    } catch (error) {
      console.error('Erreur toggle favori:', error);
    }
  };
  
  return (
    <div>
      {isFavorite('product-id-123') ? 'En favoris ❤️' : 'Non favorisé'}
    </div>
  );
}
```

#### Hook: useFavorites.ts
- **Path**: `frontend-web/src/hooks/useFavorites.ts`
- **Note**: Ce fichier est maintenant un simple alias qui ré-export le hook du contexte
- **Raison**: Éviter la duplication de logique, centraliser dans FavoritesContext

#### Composant: FavoriteButton.tsx
- **Path**: `frontend-web/src/components/ui/FavoriteButton.tsx`
- **Props**:
  - `productId` (string, required) - ID du produit
  - `size` ('sm' | 'md' | 'lg') - Taille du bouton (défaut: 'md')
  - `className` (string) - Classes CSS additionnelles
  - `showToast` (boolean) - Afficher des toasts (pas implémenté pour l'instant)

**Variantes de taille**:
- `sm`: 8x8, icône 4x4
- `md`: 10x10, icône 5x5
- `lg`: 12x12, icône 6x6

**Fonctionnalités**:
- ❤️ Icône cœur avec animation de remplissage
- 🔴 Rouge quand favorisé, gris sinon
- ⚡ Mise à jour optimiste (instantanée)
- 🚫 Désactivé pendant l'appel API
- 🔐 Redirige vers login si non connecté
- 🎨 Animation de pulsation et scale au hover
- ♿ Accessible (aria-label)

**Utilisation**:
```tsx
import { FavoriteButton } from '@/components/ui/FavoriteButton';

// Petit bouton
<FavoriteButton productId={item.id} size="sm" />

// Moyen (défaut)
<FavoriteButton productId={item.id} />

// Grand
<FavoriteButton productId={item.id} size="lg" />

// Avec classes custom
<FavoriteButton 
  productId={item.id} 
  className="absolute top-2 right-2"
/>
```

## Intégrations

### 1. ItemCard (Categories Page)
- **Fichier**: `frontend-web/src/components/CategoryPage/ItemCard.tsx`
- **Emplacement**: Haut-droit de l'image, visible au hover
- **Taille**: `sm`
- **Important**: `onClick={(e) => e.stopPropagation()` pour éviter d'ouvrir la page produit

### 2. Item Detail Page
- **Fichier**: `frontend-web/src/app/items/[id]/page.tsx`
- **Emplacement**: Haut-droit de la galerie d'images
- **Taille**: `md`
- **Avec**: Bouton Share à côté

### 3. HeroProductCarousel
- **Fichier**: `frontend-web/src/components/home/HeroProductCarousel.tsx`
- **Emplacement**: Haut-droit des cards du carousel
- **Taille**: `sm`
- **Important**: `onClick={(e) => e.preventDefault()` car les cards sont des `<Link>`

### 4. Page Favoris
- **Fichier**: `frontend-web/src/app/favoris/page.tsx`
- **Route**: `/favoris`
- **Fonctionnalités**:
  - Liste paginée des favoris (20 par page)
  - Toggle vue grille/liste
  - État vide avec CTA vers les annonces
  - Redirection auto vers login si non connecté
  - Gestion des erreurs

## Patterns de Design

### Optimistic UI Updates
Le système utilise des mises à jour optimistes pour une meilleure UX:

1. **Mise à jour immédiate** de l'UI (ajout/retrait du Set)
2. **Appel API** en arrière-plan
3. **Rollback** si l'API échoue
4. **Notification** à l'utilisateur en cas d'erreur

```typescript
// Exemple simplifié
const toggleFavorite = async (productId: string) => {
  const wasFavorite = favorites.has(productId);
  
  // 1. Update optimiste
  setFavorites(prev => {
    const newSet = new Set(prev);
    wasFavorite ? newSet.delete(productId) : newSet.add(productId);
    return newSet;
  });
  
  try {
    // 2. Appel API
    await toggleFavoriteAPI(productId, wasFavorite);
  } catch (error) {
    // 3. Rollback si erreur
    setFavorites(prev => {
      const newSet = new Set(prev);
      wasFavorite ? newSet.add(productId) : newSet.delete(productId);
      return newSet;
    });
    throw error;
  }
};
```

### Protection contre les double-clics
Un Set de `toggling` empêche les clics multiples pendant l'appel API:

```typescript
const [toggling, setToggling] = useState<Set<string>>(new Set());

const toggleFavorite = async (productId: string) => {
  if (toggling.has(productId)) return; // Déjà en cours
  
  setToggling(prev => new Set(prev).add(productId));
  
  try {
    await apiCall();
  } finally {
    setToggling(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  }
};
```

### Set<string> pour performance
Utilisation de `Set<string>` plutôt que `string[]` pour des lookups O(1):

```typescript
// ❌ Lent: O(n)
const isFavorite = favorites.includes(productId);

// ✅ Rapide: O(1)
const isFavorite = favorites.has(productId);
```

## Workflows

### 1. Utilisateur ajoute un favori
```
User clique FavoriteButton
  → FavoriteButton.handleClick()
  → Vérifie authentification
  → useFavorites().toggleFavorite(productId)
  → Optimistic update (cœur devient rouge)
  → API: POST /api/favorites/:productId
  → Backend: Favorite.create() + Product.incrementFavorites()
  → Success: Rien à faire (déjà mis à jour)
  → Error: Rollback (cœur redevient gris)
```

### 2. Chargement initial au login
```
User se connecte
  → useAuth() met à jour user
  → FavoritesContext useEffect([user]) déclenché
  → API: GET /api/favorites/ids
  → Backend: Favorite.find({ user }).distinct('product')
  → Retourne: ['id1', 'id2', 'id3']
  → setFavorites(new Set(['id1', 'id2', 'id3']))
  → Tous les FavoriteButton se mettent à jour
```

### 3. Page Favoris
```
User visite /favoris
  → Page vérifie authentification (useAuth)
  → API: GET /api/favorites?page=1&limit=20
  → Backend: Favorite.find().populate('product seller')
  → Transforme en format Item
  → Affiche grille de ItemCard
  → Click sur ItemCard → Page produit
  → Click sur FavoriteButton → Retire du favori → Recharge la liste
```

## Sécurité

- ✅ **Routes protégées** - Toutes les routes API nécessitent l'authentification (`protect` middleware)
- ✅ **Validation utilisateur** - Utilise `req.user._id` du token JWT
- ✅ **Index unique** - Empêche les doublons au niveau DB
- ✅ **Validation produit** - Vérifie que le produit existe avant création
- ✅ **User isolation** - Chaque user ne voit que ses propres favoris

## Performance

- ⚡ **Set lookups** - O(1) au lieu de O(n)
- ⚡ **Optimistic updates** - UI instantanée
- ⚡ **Pagination** - 20 items par page
- ⚡ **Index DB** - Compound index pour requêtes rapides
- 💾 **État global** - Un seul chargement pour toute l'app

## Testing

### Test manuel
1. **Non connecté**:
   - Click FavoriteButton → Redirect vers login ✅
   
2. **Connecté**:
   - Click FavoriteButton → Cœur devient rouge ✅
   - Click à nouveau → Cœur devient gris ✅
   - Recharge page → État persiste ✅
   
3. **Page /favoris**:
   - Visite en étant connecté → Liste affichée ✅
   - Aucun favori → Message + CTA ✅
   - Retire un favori → Disparaît de la liste ✅
   - Pagination si > 20 items ✅

4. **Erreurs réseau**:
   - Simule erreur API → Rollback UI ✅
   - Console log erreur ✅

## Améliorations futures

- 📊 Statistiques de favoris (trending, most favorited)
- 🔔 Notifications quand favori change de prix
- 📱 Badge avec nombre de favoris dans Header
- 🏷️ Collections/Dossiers de favoris (organiser)
- 🔗 Partager liste de favoris (URL publique)
- 📧 Email digest des nouveaux favoris similaires
- 🎨 Toast notifications (succès/erreur)
- ♻️ Undo/Redo pour retirer un favori

## Dépannage

### Favoris ne se chargent pas
- Vérifier que l'utilisateur est connecté (`useAuth().user`)
- Vérifier console pour erreurs API
- Vérifier token JWT valide
- Vérifier backend route enregistrée dans `server.js`

### Cœur ne se remplit pas
- Vérifier console pour erreurs
- Vérifier que `FavoritesProvider` entoure l'app
- Vérifier `productId` passé comme string
- Vérifier que le produit existe

### Rollback ne fonctionne pas
- Vérifier try/catch dans `toggleFavorite`
- Vérifier que l'erreur API est bien throwée
- Console log pour debug

### Page /favoris redirige login
- Normal si non connecté
- Vérifier paramètre `?redirect=/favoris` présent
- Vérifier que login redirige après succès

## Fichiers créés/modifiés

### Backend (NOUVEAU)
- ✨ `backend/src/models/Favorite.js`
- ✨ `backend/src/controllers/favorite.controller.js`
- ✨ `backend/src/routes/favorite.routes.js`
- ✏️ `backend/src/server.js` (ajout route favorites)

### Frontend (NOUVEAU)
- ✨ `frontend-web/src/lib/api/favorites.ts`
- ✨ `frontend-web/src/hooks/useFavorites.ts` (alias)
- ✨ `frontend-web/src/contexts/FavoritesContext.tsx`
- ✨ `frontend-web/src/components/ui/FavoriteButton.tsx`
- ✨ `frontend-web/src/app/favoris/page.tsx`
- ✨ `frontend-web/docs/FAVORIS.md` (ce fichier)

### Frontend (MODIFIÉ)
- ✏️ `frontend-web/src/app/layout.tsx` (wrap FavoritesProvider)
- ✏️ `frontend-web/src/components/CategoryPage/ItemCard.tsx` (3 boutons)
- ✏️ `frontend-web/src/app/items/[id]/page.tsx` (bouton détail)
- ✏️ `frontend-web/src/components/home/HeroProductCarousel.tsx` (bouton carousel)
