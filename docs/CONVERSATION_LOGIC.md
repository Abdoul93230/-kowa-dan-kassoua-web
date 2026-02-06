# Logique de Gestion des Conversations

## Vue d'ensemble

Le système de messagerie gère intelligemment la création et la navigation des conversations entre acheteurs et vendeurs/prestataires, en tenant compte de plusieurs scénarios.

## Architecture

### Service de Gestion (`conversationUtils.ts`)

Le service `conversationUtils.ts` fournit les fonctions suivantes :

#### 1. `getOrCreateConversation(sellerId, itemId, userId)`
**Fonction principale** qui :
- Recherche une conversation existante entre l'utilisateur et le vendeur pour le produit spécifique
- Si une conversation existe, la retourne
- Sinon, crée une nouvelle conversation avec :
  - Un ID unique généré
  - Les informations du vendeur
  - Les détails du produit
  - Un message de bienvenue automatique

**Utilisation** :
```typescript
const conversation = getOrCreateConversation(seller.id, item.id);
router.push(`/messages/${conversation.id}`);
```

#### 2. `findConversation(sellerId, itemId?)`
Recherche une conversation spécifique :
- Si `itemId` est fourni : cherche une conversation sur ce produit avec ce vendeur
- Sinon : retourne n'importe quelle conversation avec ce vendeur

#### 3. `createConversation(sellerId, itemId, userId)`
Crée une nouvelle conversation avec :
- Génération d'un ID unique basé sur le timestamp
- Copie des informations du vendeur depuis `sellers`
- Copie des détails du produit depuis `mockItems`
- Initialisation d'un tableau de messages vide
- Ajout au début de `mockConversations` (plus récente en premier)

#### 4. Fonctions Utilitaires

```typescript
// Obtenir toutes les conversations avec un vendeur
getConversationsWithSeller(sellerId)

// Vérifier si une conversation existe
hasConversation(sellerId, itemId)

// Compter les messages non lus
getTotalUnreadCount()

// Marquer une conversation comme lue
markConversationAsRead(conversationId)
```

## Scénarios Gérés

### Scénario 1 : Première conversation sur un produit
**Situation** : L'utilisateur clique sur "Message" sur un produit pour la première fois

**Flux** :
1. Clic sur le bouton "Message" dans `items/[id]/page.tsx`
2. Appel de `getOrCreateConversation(seller.id, item.id)`
3. Aucune conversation trouvée
4. **Création automatique** d'une nouvelle conversation
5. Redirection vers `/messages/[newConversationId]`
6. Affichage d'un message de bienvenue automatique du vendeur

**Résultat** : Conversation créée instantanément, prête à l'emploi

### Scénario 2 : Conversation existante sur le même produit
**Situation** : L'utilisateur a déjà discuté avec le vendeur sur ce produit

**Flux** :
1. Clic sur "Message"
2. `getOrCreateConversation` trouve la conversation existante
3. Redirection vers la conversation existante
4. Historique des messages préservé

**Résultat** : Retour à la conversation en cours, continuité de la discussion

### Scénario 3 : Nouveau produit avec le même vendeur
**Situation** : L'utilisateur veut discuter d'un autre produit avec le même vendeur

**Flux** :
1. Clic sur "Message" sur le nouveau produit
2. `findConversation(sellerId, newItemId)` ne trouve pas de conversation pour ce produit
3. **Création d'une nouvelle conversation distincte** pour ce produit
4. L'utilisateur a maintenant **2 conversations** avec le même vendeur :
   - Une pour le produit A
   - Une pour le produit B

**Résultat** : Conversations séparées par produit, clarté des discussions

### Scénario 4 : Navigation dans la liste des messages
**Situation** : L'utilisateur consulte `/messages`

**Flux** :
1. Affichage de toutes les conversations triées par date
2. Badge avec le nombre de messages non lus
3. Clic sur une conversation → Redirection vers `/messages/[id]`
4. Marque automatiquement la conversation comme lue

## Fonctionnalités Clés

### 1. Message de Bienvenue Automatique
Quand une **nouvelle** conversation est créée :
```typescript
if (existingMessages.length === 0 && conv.item) {
  const welcomeMessage = {
    content: `Bonjour ! Je suis ${seller.name}. Je vois que vous êtes 
              intéressé(e) par "${item.title}". N'hésitez pas à me poser 
              vos questions, je serai ravi(e) de vous répondre ! 😊`
  };
}
```

### 2. Marquage Automatique Comme Lu
Lors de l'ouverture d'une conversation :
```typescript
markConversationAsRead(conversationId);
```
- Réinitialise `unreadCount` à 0
- Marque tous les messages du vendeur comme `read: true`

### 3. Badge de Notifications
Dans le Header :
```typescript
const unreadCount = getTotalUnreadCount();
// Affiche un badge rouge avec le nombre total
```

### 4. Distinction Produit/Vendeur
Chaque conversation est **unique par couple (vendeur, produit)** :
- Même vendeur + Produit A = Conversation 1
- Même vendeur + Produit B = Conversation 2
- Vendeur différent + Produit A = Conversation 3

## Intégration avec l'UI

### Bouton Message (Item Page)
```tsx
<Button onClick={() => {
  const conversation = getOrCreateConversation(seller.id, item.id);
  router.push(`/messages/${conversation.id}`);
}}>
  Message
</Button>
```

### Liste des Conversations (Messages Page)
```tsx
{filteredConversations.map((conv) => (
  <Card onClick={() => router.push(`/messages/${conv.id}`)}>
    <Avatar>{conv.participants.seller.avatar}</Avatar>
    <div>
      <h3>{conv.participants.seller.name}</h3>
      <p>{conv.item?.title}</p>
      <Badge>{conv.unreadCount}</Badge>
    </div>
  </Card>
))}
```

### Chat Interface
```tsx
// Affichage du produit concerné
{conversation.item && (
  <Card>
    <img src={conversation.item.image} />
    <h3>{conversation.item.title}</h3>
    <p>{conversation.item.price}</p>
  </Card>
)}

// Messages avec scrolling automatique
<div ref={messagesEndRef} />
```

## Gestion des États

### État des Conversations
```typescript
const [conversations, setConversations] = useState(mockConversations);
```
- Liste globale mise à jour en temps réel
- Nouvelles conversations ajoutées au début (`.unshift()`)

### État des Messages
```typescript
const [messages, setMessages] = useState<Message[]>([]);
```
- Chargés depuis `mockMessages[conversationId]`
- Mis à jour lors de l'envoi de nouveaux messages

### État de Lecture
```typescript
conversation.unreadCount // Nombre de messages non lus
message.read             // Boolean pour chaque message
```

## Migration vers Production

Pour passer en production avec un vrai backend :

### 1. Remplacer les Mock Data par des API Calls

**Creation de conversation** :
```typescript
// Au lieu de :
mockConversations.unshift(newConversation);

// Faire :
const response = await fetch('/api/conversations', {
  method: 'POST',
  body: JSON.stringify({ sellerId, itemId })
});
const newConversation = await response.json();
```

**Charger les conversations** :
```typescript
// Au lieu de :
const conversations = mockConversations;

// Faire :
const response = await fetch('/api/conversations');
const conversations = await response.json();
```

### 2. Implémenter WebSocket pour le Temps Réel

```typescript
// Connexion WebSocket
const ws = new WebSocket('wss://api.example.com/messages');

ws.onmessage = (event) => {
  const newMessage = JSON.parse(event.data);
  setMessages((prev) => [...prev, newMessage]);
};

// Envoyer un message
const sendMessage = (content) => {
  ws.send(JSON.stringify({
    conversationId,
    content,
    timestamp: new Date().toISOString()
  }));
};
```

### 3. Ajouter la Persistance

```typescript
// Backend (Node.js/Express)
app.post('/api/conversations', async (req, res) => {
  const { sellerId, itemId, userId } = req.body;
  
  // Vérifier si une conversation existe
  let conversation = await db.conversations.findOne({
    where: { sellerId, itemId, userId }
  });
  
  // Créer si nécessaire
  if (!conversation) {
    conversation = await db.conversations.create({
      sellerId,
      itemId,
      userId,
      createdAt: new Date()
    });
  }
  
  res.json(conversation);
});
```

### 4. Authentification

```typescript
// Middleware d'authentification
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  const user = verifyToken(token);
  req.userId = user.id;
  next();
};

// Routes protégées
app.get('/api/conversations', authenticate, async (req, res) => {
  const conversations = await db.conversations.findAll({
    where: { userId: req.userId }
  });
  res.json(conversations);
});
```

## Avantages de cette Architecture

✅ **Simplicité** : Un seul point d'entrée (`getOrCreateConversation`)  
✅ **Cohérence** : Logique centralisée dans `conversationUtils`  
✅ **Expérience Fluide** : Pas d'étape intermédiaire, création transparente  
✅ **Contexte Préservé** : Chaque conversation est liée à un produit spécifique  
✅ **Scalabilité** : Facile à migrer vers une API backend  
✅ **Maintenabilité** : Une seule source de vérité pour la logique métier  

## Tests Recommandés

1. **Test de création** : Cliquer sur "Message" sur un nouveau produit
2. **Test de réutilisation** : Cliquer à nouveau sur le même produit
3. **Test multi-produits** : Discuter de 2 produits différents avec le même vendeur
4. **Test de lecture** : Vérifier que les badges disparaissent après lecture
5. **Test de recherche** : Filtrer les conversations dans `/messages`
6. **Test de message de bienvenue** : Vérifier qu'il apparaît sur nouvelle conversation

## Résumé

Le système gère intelligemment **3 cas principaux** :
1. **Pas de conversation** → Création automatique + Message de bienvenue
2. **Conversation existante** → Réouverture avec historique
3. **Nouveau produit** → Nouvelle conversation distincte

Cette logique assure une expérience utilisateur fluide sans redirections inutiles ni formulaires complexes.
