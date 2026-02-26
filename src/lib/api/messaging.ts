import { api } from './auth';

// Types
export interface Conversation {
  id: string;
  participants: {
    buyer: {
      id: string;
      name: string;
      avatar?: string;
    };
    seller: {
      id: string;
      name: string;
      avatar?: string;
      location?: string;
      rating?: number;
      totalReviews?: number;
      verified?: boolean;
    };
  };
  item?: {
    id: string;
    title: string;
    image: string;
    price: string;
  };
  lastMessage: {
    content: string;
    senderId: string;
    senderName: string;
    timestamp: string;
    read: boolean;
    type: string;
  };
  unreadCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
  readAt?: string;
  type: 'text' | 'image' | 'offer' | 'deleted';
  attachments?: string[];
  offerDetails?: {
    itemId: string;
    itemTitle: string;
    itemImage: string;
    price: string;
  };
}

// ===============================================
// CONVERSATIONS
// ===============================================

/**
 * Récupérer toutes les conversations de l'utilisateur
 */
export const getConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

/**
 * Récupérer une conversation spécifique
 */
export const getConversationById = async (conversationId: string) => {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data;
};

/**
 * Créer ou récupérer une conversation
 */
export const createOrGetConversation = async (data: {
  sellerId: string;
  productId?: string;
}) => {
  const response = await api.post('/conversations', data);
  return response.data;
};

/**
 * Marquer une conversation comme lue
 */
export const markConversationAsRead = async (conversationId: string) => {
  const response = await api.put(`/conversations/${conversationId}/read`);
  return response.data;
};

/**
 * Archiver une conversation
 */
export const archiveConversation = async (conversationId: string) => {
  const response = await api.delete(`/conversations/${conversationId}`);
  return response.data;
};

/**
 * Obtenir le nombre total de messages non lus
 */
export const getUnreadCount = async () => {
  const response = await api.get('/conversations/unread/count');
  return response.data;
};

// ===============================================
// MESSAGES
// ===============================================

/**
 * Récupérer les messages d'une conversation
 */
export const getMessages = async (
  conversationId: string,
  page: number = 1,
  limit: number = 50
) => {
  const response = await api.get(`/messages/${conversationId}`, {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Envoyer un message
 */
export const sendMessage = async (data: {
  conversationId: string;
  content: string;
  type?: string;
  attachments?: string[];
  offerDetails?: any;
}) => {
  const response = await api.post('/messages', data);
  return response.data;
};

/**
 * Marquer un message comme lu
 */
export const markMessageAsRead = async (messageId: string) => {
  const response = await api.put(`/messages/${messageId}/read`);
  return response.data;
};

/**
 * Supprimer un message
 */
export const deleteMessage = async (messageId: string) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

/**
 * Rechercher dans les messages d'une conversation
 */
export const searchMessages = async (conversationId: string, query: string) => {
  const response = await api.get(`/messages/search/${conversationId}`, {
    params: { query }
  });
  return response.data;
};

/**
 * Envoyer un message vocal
 */
export const sendVoiceMessage = async (conversationId: string, audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice-message.webm');
  formData.append('conversationId', conversationId);

  const response = await api.post('/messages/voice', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
