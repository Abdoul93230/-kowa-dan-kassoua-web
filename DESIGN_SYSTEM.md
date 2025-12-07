# Charte Graphique - MarketHub (inspirée de Leboncoin)

## 🎨 Couleurs Principales

### Palette de base
- **Orange Principal** : `#ec5a13` - RGB(236, 90, 19) - HSL(20, 85%, 50%)
  - Utilisé pour les CTA principaux, liens importants, et éléments d'action
  
- **Orange Clair** : `#ffe9de` - RGB(255, 233, 222) - HSL(20, 100%, 94%)
  - Utilisé pour les arrière-plans doux, badges, et états hover

- **Gris de fond** : `#f0f2f5` - RGB(240, 242, 245) - HSL(216, 20%, 95%)
  - Utilisé pour les arrière-plans de sections et cartes

- **Blanc** : `#ffffff`
  - Utilisé pour les arrière-plans de cartes, modales, et contenus principaux

## 📁 Structure des fichiers

### Configuration du Design System
Tous les fichiers de configuration sont dans `/src/lib/design-system/`:

1. **colors.ts** : Palette de couleurs complète avec toutes les nuances
2. **typography.ts** : Polices, tailles, poids, et styles de texte prédéfinis
3. **index.ts** : Point d'entrée principal exportant spacing, shadows, borderRadius, etc.

### Configuration Tailwind
- **tailwind.config.ts** : Configuration personnalisée intégrant toutes les valeurs du design system

### Styles globaux
- **src/app/globals.css** : Variables CSS, styles de base, et classes utilitaires

## 🔤 Typographie

### Police
- Famille principale : **Noto Sans** (similaire à Leboncoin)
- Fallback : système par défaut (-apple-system, BlinkMacSystemFont, Segoe UI, etc.)

### Tailles
- **Très petit** : 12px (xs) - Labels, badges
- **Petit** : 14px (sm) - Texte secondaire
- **Base** : 16px - Texte principal
- **Moyen** : 18px (lg) - Texte important
- **Grand** : 20-24px (xl-2xl) - Sous-titres
- **Très grand** : 30-48px (3xl-5xl) - Titres principaux

### Poids
- Normal : 400
- Medium : 500
- Semibold : 600
- Bold : 700

## 🎯 Classes utilitaires personnalisées

### Boutons
```tsx
className="btn-primary"       // Bouton orange principal
className="btn-secondary"     // Bouton blanc avec bordure orange
className="btn-outline"       // Bouton avec bordure grise
```

### Cartes
```tsx
className="card-leboncoin"    // Carte avec ombre et hover effect
```

### Inputs
```tsx
className="input-leboncoin"   // Input avec focus orange
```

### Badges
```tsx
className="badge-orange"      // Badge orange
```

### Liens
```tsx
className="link-orange"       // Lien orange avec soulignement
```

### Prix
```tsx
className="text-price"        // Style pour afficher les prix
```

## 🎨 Usage des couleurs

### Dans les composants
```tsx
// Importation
import { colors } from '@/lib/design-system';

// Utilisation directe
<div style={{ color: colors.primary.orange }} />

// Avec Tailwind
<div className="bg-primary text-white" />
<div className="bg-orange-100 text-primary" />
<div className="bg-gray-100" />
```

### Variables CSS
```css
var(--primary-orange)
var(--primary-orange-light)
var(--primary-gray)
var(--text-primary)
var(--text-secondary)
```

## 📐 Espacements

Suivent la convention Tailwind standard :
- 1 = 4px
- 2 = 8px
- 3 = 12px
- 4 = 16px
- 6 = 24px
- 8 = 32px
- etc.

## 🔘 Rayons de bordure

- `sm` : 4px - Petits éléments
- `md` : 6px - Éléments moyens
- `lg` : 8px - Cartes, boutons
- `xl` : 12px - Grands conteneurs
- `full` : 9999px - Éléments circulaires

## 🌑 Ombres

- `shadow-sm` : Légère
- `shadow-card` : Pour les cartes (style Leboncoin)
- `shadow-hover` : Au survol
- `shadow-md` : Moyenne
- `shadow-lg` : Grande

## 📱 Breakpoints

- `sm` : 640px
- `md` : 768px
- `lg` : 1024px
- `xl` : 1280px
- `2xl` : 1536px

## ✅ Exemples d'utilisation

### Composant Header
```tsx
<header className="bg-white border-b border-gray-200 shadow-sm">
  <a className="text-text-secondary hover:text-primary">Lien</a>
  <Button className="btn-primary">Publier</Button>
</header>
```

### Composant Card
```tsx
<div className="card-leboncoin">
  <h3 className="text-text-primary font-semibold">Titre</h3>
  <p className="text-text-secondary">Description</p>
  <span className="text-price">99,99 €</span>
</div>
```

### Composant Hero
```tsx
<section className="bg-gradient-to-br from-orange-50 via-white">
  <h1 className="text-text-primary">
    Titre <span className="text-primary">en couleur</span>
  </h1>
  <Button className="btn-primary">Action</Button>
</section>
```

## 🔄 Migration

Pour appliquer la charte à d'autres composants :

1. Remplacer les couleurs Tailwind génériques par les couleurs personnalisées
   - `text-slate-900` → `text-text-primary`
   - `text-slate-600` → `text-text-secondary`
   - `text-emerald-600` → `text-primary`
   - `bg-slate-50` → `bg-gray-50`
   - etc.

2. Utiliser les classes utilitaires personnalisées
   - Boutons : `btn-primary`, `btn-secondary`, `btn-outline`
   - Cartes : `card-leboncoin`
   - Inputs : `input-leboncoin`

3. Importer et utiliser les constantes si besoin
   ```tsx
   import { colors, fonts } from '@/lib/design-system';
   ```

## 📝 Notes

- Les couleurs sont inspirées de la charte graphique de Leboncoin
- Le design system est modulaire et réutilisable
- Toutes les valeurs sont centralisées pour faciliter les modifications futures
- La configuration Tailwind utilise ces valeurs pour garantir la cohérence
