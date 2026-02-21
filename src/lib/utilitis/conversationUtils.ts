import { Conversation, Message } from '@/types';
import { mockConversations, mockMessages, sellers, mockItems } from '@/lib/mockData';

/**
 * Trouve une conversation existante entre un utilisateur et un vendeur pour un produit spécifique
 */
export function findConversation(
  sellerId: string,
  itemId?: number
): Conversation | undefined {
  if (itemId !== undefined) {
    // Rechercher une conversation sur ce produit spécifique avec ce vendeur
    return mockConversations.find(
      (conv) =>
        conv.participants.seller.id === sellerId &&
        conv.item?.id === itemId
    );
  } else {
    // Rechercher n'importe quelle conversation avec ce vendeur
    return mockConversations.find(
      (conv) => conv.participants.seller.id === sellerId
    );
  }
}

/**
 * Crée une nouvelle conversation (en production, cela ferait un appel API)
 * Pour le moment, retourne un objet conversation temporaire
 */
export function createConversation(
  sellerId: string,
  itemId: number,
  userId: string = 'user_current'
): Conversation {
  const seller = sellers[sellerId];
  
  // Trouver le produit dans tous les items
  let item = null;
  for (const category in mockItems) {
    const foundItem = mockItems[category].find((i: any) => i.id === itemId);
    if (foundItem) {
      item = foundItem;
      break;
    }
  }

  if (!seller) {
    throw new Error('Vendeur introuvable');
  }

  if (!item) {
    throw new Error('Produit introuvable');
  }

  // Générer un nouvel ID de conversation
  const newConversationId = `conv_${Date.now()}`;
  
  // Créer le premier message (de bienvenue)
  const welcomeMessage: Message = {
    id: `msg_welcome_${Date.now()}`,
    conversationId: newConversationId,
    senderId: sellerId,
    senderName: seller.name,
    senderAvatar: seller.avatar,
    content: 'Nouvelle conversation',
    timestamp: new Date().toISOString(),
    read: false,
    type: 'text'
  };

  const newConversation: Conversation = {
    id: newConversationId,
    participants: {
      buyer: {
        id: userId,
        name: 'Vous',
        avatar: undefined,
      },
      seller: seller,
    },
    item: {
      id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
      title: item.title,
      price: item.price,
      image: item.images[0],
    },
    lastMessage: welcomeMessage,
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
  };

  // Ajouter la conversation aux mock data (temporaire - en production, ce serait persisté)
  mockConversations.unshift(newConversation);
  
  // Initialiser un tableau de messages vide pour cette conversation
  mockMessages[newConversationId] = [];

  return newConversation;
}

/**
 * Obtient ou crée une conversation selon le contexte
 */
export function getOrCreateConversation(
  sellerId: string,
  itemId: number,
  userId: string = 'user_current'
): Conversation {
  // D'abord, chercher une conversation existante pour ce produit
  let conversation = findConversation(sellerId, itemId);
  
  if (!conversation) {
    // Si aucune conversation n'existe pour ce produit, en créer une nouvelle
    conversation = createConversation(sellerId, itemId, userId);
  }

  return conversation;
}

/**
 * Obtient toutes les conversations avec un vendeur spécifique
 */
export function getConversationsWithSeller(sellerId: string): Conversation[] {
  return mockConversations.filter(
    (conv) => conv.participants.seller.id === sellerId
  );
}

/**
 * Vérifie si une conversation existe déjà pour un vendeur et un produit
 */
export function hasConversation(sellerId: string, itemId: number): boolean {
  return !!findConversation(sellerId, itemId);
}

/**
 * Compte le nombre total de messages non lus
 */
export function getTotalUnreadCount(): number {
  return mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
}

/**
 * Marque tous les messages d'une conversation comme lus
 */
export function markConversationAsRead(conversationId: string): void {
  const conversation = mockConversations.find((c) => c.id === conversationId);
  if (conversation) {
    conversation.unreadCount = 0;
  }

  const messages = mockMessages[conversationId];
  if (messages) {
    messages.forEach((msg) => {
      if (msg.senderId !== 'user_current') {
        msg.read = true;
      }
    });
  }
}
