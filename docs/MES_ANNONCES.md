# Page de Gestion des Annonces - Documentation

## Vue d'ensemble

La page **Mes Annonces** (`/mes-annonces`) permet aux utilisateurs de gérer leurs produits et services publiés avec des fonctionnalités complètes de modération.

## Fonctionnalités

### 1. Tableau de bord avec statistiques
- **Total d'annonces** publiées
- **Annonces actives** en ligne
- **Annonces en attente** de validation
- **Annonces vendues**
- **Total de vues** sur toutes les annonces
- **Total de favoris** reçus

### 2. Filtres et recherche
- **Recherche textuelle** dans les titres et descriptions
- **Filtre par statut** : Tous, Active, En attente, Vendu, Expiré
- **Filtre par type** : Tous, Produits, Services

### 3. Actions de modération

#### Pour chaque annonce :
- **Voir** : Ouvre la page détaillée de l'annonce
- **Modifier** : Redirige vers le formulaire de publication pré-rempli
- **Supprimer** : Suppression avec confirmation
- **Activer/Désactiver** : Basculer la visibilité
- **Promouvoir** : Mettre l'annonce en vedette
- **Statistiques** : Vues et favoris en temps réel

### 4. Affichage responsive
- **Desktop** : Liste détaillée avec toutes les informations
- **Mobile** : Version adaptée avec image verticale
- **Tablette** : Mise en page optimisée

## Architecture technique

### Fichiers créés

1. **`src/app/mes-annonces/page.tsx`**
   - Page principale de gestion des annonces
   - Affichage des statistiques
   - Liste filtrée et recherchable
   - Actions CRUD

2. **Modifications dans `src/components/publish/PublishForm.tsx`**
   - Support du mode édition
   - Chargement des données depuis localStorage
   - Pré-remplissage du formulaire
   - Mise à jour vs création

3. **Modifications dans `src/app/publish/page.tsx`**
   - Titre dynamique (Publier vs Modifier)
   - Détection du paramètre `?edit=ID`

4. **Modifications dans `src/components/home/Header.tsx`**
   - Ajout du lien "Mes Annonces"
   - Navigation desktop et mobile

### Flux de données

```
1. Liste des annonces (/mes-annonces)
   ↓
2. Clic sur "Modifier"
   ↓
3. Stockage dans localStorage
   ↓
4. Redirection vers /publish?edit=123
   ↓
5. Chargement des données
   ↓
6. Formulaire pré-rempli
   ↓
7. Soumission (mise à jour)
   ↓
8. Retour vers /mes-annonces
```

## Utilisation

### Accéder à la page
```typescript
// Via navigation
router.push('/mes-annonces');

// Via Header
Clic sur "Mes Annonces" dans le menu
```

### Modifier une annonce
```typescript
// 1. Clic sur "Modifier" dans la carte d'annonce
handleEdit(item);

// 2. Les données sont stockées
localStorage.setItem('editItem', JSON.stringify(item));

// 3. Redirection avec paramètre
router.push(`/publish?edit=${item.id}`);

// 4. Le formulaire se charge avec useEffect
useEffect(() => {
  const editItemData = localStorage.getItem('editItem');
  // Pré-remplissage du formulaire
}, []);
```

### Supprimer une annonce
```typescript
// 1. Clic sur "Supprimer"
handleDelete(itemId);

// 2. Dialog de confirmation
<AlertDialog open={deleteDialogOpen}>
  // Confirmation requise
</AlertDialog>

// 3. Suppression confirmée
confirmDelete();
// Appel API backend à implémenter
```

## Design System

### Couleurs utilisées
- **Primary** : `#ec5a13` (Orange principal)
- **Hover** : `#d94f0f` (Orange foncé)
- **Background** : `#ffe9de` (Orange clair)
- **Success** : Green-100/800 (Statut actif)
- **Warning** : Yellow-100/800 (En attente)
- **Info** : Blue-100/800 (Vendu, Services)
- **Error** : Red-100/600 (Suppression)

### Composants UI utilisés
- `Card` : Conteneurs de contenu
- `Button` : Actions principales
- `Badge` : Statuts et catégories
- `Input` : Champ de recherche
- `Select` : Filtres dropdown
- `AlertDialog` : Confirmation de suppression
- `DropdownMenu` : Menu d'actions

### Icônes Lucide
- `Package` : Produits
- `Briefcase` : Services
- `Edit2` : Modification
- `Trash2` : Suppression
- `Eye` : Vues/Consultation
- `Star` : Favoris/Promotion
- `CheckCircle2` : Statut actif
- `Clock` : En attente
- `XCircle` : Expiré

## États et badges

### Statuts d'annonce
```typescript
'active'   → Badge vert   → "Active"
'pending'  → Badge jaune  → "En attente"
'sold'     → Badge bleu   → "Vendu"
'expired'  → Badge gris   → "Expiré"
```

### Types d'annonce
```typescript
'product'  → Badge orange → "Produit"
'service'  → Badge bleu   → "Service"
```

## Responsive Breakpoints

```css
/* Mobile First */
default: < 640px
sm: 640px   /* Tablette portrait */
md: 768px   /* Tablette paysage */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

## Améliorations futures

### Phase 1 (Backend)
- [ ] Intégration API REST pour CRUD
- [ ] Authentification utilisateur réelle
- [ ] Gestion des permissions

### Phase 2 (Fonctionnalités)
- [ ] Upload d'images pendant l'édition
- [ ] Historique des modifications
- [ ] Duplication d'annonce
- [ ] Export CSV/PDF
- [ ] Statistiques avancées (graphiques)

### Phase 3 (UX)
- [ ] Tri personnalisé (date, vues, favoris)
- [ ] Actions en masse (sélection multiple)
- [ ] Aperçu avant publication
- [ ] Templates d'annonces
- [ ] Brouillons auto-sauvegardés

### Phase 4 (Performance)
- [ ] Pagination des résultats
- [ ] Lazy loading des images
- [ ] Cache des données
- [ ] Optimistic UI updates

## Tests recommandés

### Tests unitaires
```typescript
// Test du filtre de recherche
test('filtres annonces par titre', () => {
  // ...
});

// Test du changement de statut
test('bascule statut actif/inactif', () => {
  // ...
});
```

### Tests E2E
```typescript
// Cypress ou Playwright
describe('Gestion des annonces', () => {
  it('modifie une annonce existante', () => {
    // 1. Naviguer vers /mes-annonces
    // 2. Cliquer sur "Modifier"
    // 3. Vérifier pré-remplissage
    // 4. Modifier et soumettre
    // 5. Vérifier mise à jour
  });
});
```

## Support et Contact

Pour toute question ou amélioration, contactez l'équipe de développement.

---

**Version** : 1.0.0  
**Date** : Janvier 2026  
**Auteur** : Équipe MarketHub
