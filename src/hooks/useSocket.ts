'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket.IO se connecte à la racine du serveur, pas à /api
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

interface UseSocketOptions {
  enabled?: boolean;
  token?: string | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: {
    conversationId: string;
    content: string;
    type?: string;
    attachments?: string[];
    offerDetails?: any;
    postClosure?: boolean;
  }) => void;
  markMessageAsRead: (messageId: string, conversationId: string) => void;
  startTyping: (conversationId: string, type?: 'text' | 'recording') => void;
  stopTyping: (conversationId: string) => void;
  isUserOnline: (userId: string) => boolean;
  onlineUsers: Set<string>;
}

/**
 * Hook personnalisé pour gérer la connexion Socket.IO
 * Gère la connexion, déconnexion et événements en temps réel
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { enabled = true, token, onConnect, onDisconnect, onError } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Utiliser des refs pour les callbacks pour éviter les re-renders
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);
  
  // Mettre à jour les refs quand les callbacks changent
  useEffect(() => {
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onConnect, onDisconnect, onError]);

  // Initialiser la connexion Socket
  useEffect(() => {
    if (!enabled || !token) {
      // Déconnecter si pas de token ou désactivé
      if (socketRef.current) {
        console.log('🔌 Déconnexion Socket.IO (pas de token ou désactivé)...');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    console.log('🔌 Initialisation connexion Socket.IO...');

    // Créer la connexion Socket.IO
    const socket = io(SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Événements de connexion
    socket.on('connect', () => {
      console.log('✅ Socket.IO connecté, ID:', socket.id);
      setIsConnected(true);
      onConnectRef.current?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO déconnecté:', reason);
      setIsConnected(false);
      setOnlineUsers(new Set()); // Réinitialiser la liste des utilisateurs en ligne
      onDisconnectRef.current?.();
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erreur connexion Socket.IO:', error.message);
      setIsConnected(false);
      onErrorRef.current?.(error);
    });

    socket.on('error', (error) => {
      console.error('❌ Erreur Socket.IO:', error);
      onErrorRef.current?.(error);
    });

    // Événements de présence en ligne
    socket.on('users:online', (data: { userIds: string[] }) => {
      console.log('📋 Liste utilisateurs en ligne reçue:', data.userIds.length, 'utilisateurs');
      setOnlineUsers(new Set(data.userIds));
    });

    socket.on('user:online', (data: { userId: string }) => {
      console.log('🟢 Utilisateur en ligne:', data.userId);
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    });

    socket.on('user:offline', (data: { userId: string }) => {
      console.log('⚪ Utilisateur hors ligne:', data.userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // Heartbeat pour maintenir la connexion
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000); // Toutes les 30 secondes

    // Cleanup
    return () => {
      console.log('🔌 Déconnexion Socket.IO (cleanup)...');
      clearInterval(heartbeatInterval);
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setOnlineUsers(new Set()); // Réinitialiser la liste des utilisateurs en ligne
    };
  }, [enabled, token]); // Seulement enabled et token comme dépendances

  // Fonction générique pour émettre des événements
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Socket non connecté, impossible d\'émettre:', event);
    }
  }, []);

  // Fonction pour s'abonner à des événements
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  // Fonction pour se désabonner d'événements
  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  // Rejoindre une conversation
  const joinConversation = useCallback((conversationId: string) => {
    emit('conversation:join', { conversationId });
  }, [emit]);

  // Quitter une conversation
  const leaveConversation = useCallback((conversationId: string) => {
    emit('conversation:leave', { conversationId });
  }, [emit]);

  // Envoyer un message
  const sendMessage = useCallback((data: {
    conversationId: string;
    content: string;
    type?: string;
    attachments?: string[];
    offerDetails?: any;
    postClosure?: boolean;
  }) => {
    emit('message:send', data);
  }, [emit]);

  // Marquer un message comme lu
  const markMessageAsRead = useCallback((messageId: string, conversationId: string) => {
    emit('message:read', { messageId, conversationId });
  }, [emit]);

  // Commencer à taper
  const startTyping = useCallback((conversationId: string, type: 'text' | 'recording' = 'text') => {
    emit('typing:start', { conversationId, type });
  }, [emit]);

  // Arrêter de taper
  const stopTyping = useCallback((conversationId: string) => {
    emit('typing:stop', { conversationId });
  }, [emit]);

  // Vérifier si un utilisateur est en ligne
  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessageAsRead,
    startTyping,
    stopTyping,
    isUserOnline,
    onlineUsers
  };
}
