'use client';

// ─── Socket.IO partagé ────────────────────────────────────────────────────────
// UNE seule connexion par onglet. Avant, chaque composant appelant useSocket()
// (en-tête, liste des messages, conversation…) ouvrait sa propre WebSocket :
// plusieurs connexions, authentifications et événements en double.
// L'API du hook est inchangée pour les composants.

import { useCallback, useEffect, useReducer, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket.IO se connecte à la racine du serveur, pas à /api
// On retire uniquement le suffixe "/api" (le domaine peut lui-même commencer par "api.")
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5001';
const RELEASE_DELAY_MS = 3000; // pas de coupure/reconnexion lors d'un simple changement de page

interface SharedSocket {
  token: string;
  socket: Socket;
  refs: number;
  connected: boolean;
  online: Set<string>;
  subscribers: Set<() => void>;
  releaseTimer: ReturnType<typeof setTimeout> | null;
}

let shared: SharedSocket | null = null;
const EMPTY_SET = new Set<string>();

const notify = (entry: SharedSocket) => entry.subscribers.forEach((fn) => fn());

function acquire(token: string): SharedSocket {
  if (shared && shared.token !== token) {
    // Nouveau jeton (renouvellement ou autre compte) : nouvelle connexion authentifiée
    shared.socket.disconnect();
    shared = null;
  }

  if (!shared) {
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity, // réseau instable : ne jamais abandonner
      randomizationFactor: 0.5,
    });

    const entry: SharedSocket = {
      token,
      socket,
      refs: 0,
      connected: false,
      online: new Set(),
      subscribers: new Set(),
      releaseTimer: null,
    };

    socket.on('connect', () => { entry.connected = true; notify(entry); });
    socket.on('disconnect', () => {
      entry.connected = false;
      entry.online = new Set();
      notify(entry);
    });
    socket.on('users:online', (data: { userIds?: string[] }) => {
      entry.online = new Set((data?.userIds || []).map(String));
      notify(entry);
    });
    socket.on('user:online', (data: { userId?: string }) => {
      if (!data?.userId) return;
      entry.online = new Set(entry.online).add(String(data.userId));
      notify(entry);
    });
    socket.on('user:offline', (data: { userId?: string }) => {
      if (!data?.userId) return;
      const next = new Set(entry.online);
      next.delete(String(data.userId));
      entry.online = next;
      notify(entry);
    });

    shared = entry;
  }

  if (shared.releaseTimer) {
    clearTimeout(shared.releaseTimer);
    shared.releaseTimer = null;
  }
  shared.refs += 1;
  return shared;
}

function release(entry: SharedSocket) {
  entry.refs -= 1;
  if (entry.refs > 0) return;
  entry.releaseTimer = setTimeout(() => {
    if (entry.refs > 0) return;
    entry.socket.disconnect();
    if (shared === entry) shared = null;
  }, RELEASE_DELAY_MS);
}

interface UseSocketOptions {
  enabled?: boolean;
  token?: string | null;
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

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { enabled = true, token } = options;
  const [entry, setEntry] = useState<SharedSocket | null>(null);
  const [, rerender] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    if (!enabled || !token) {
      setEntry(null);
      return undefined;
    }
    const current = acquire(token);
    current.subscribers.add(rerender);
    setEntry(current);
    return () => {
      current.subscribers.delete(rerender);
      release(current);
    };
  }, [enabled, token]);

  const isConnected = Boolean(entry?.connected);
  const onlineUsers = entry?.online || EMPTY_SET;

  const emit = useCallback((event: string, data?: any) => {
    if (entry?.socket.connected) entry.socket.emit(event, data);
  }, [entry]);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    entry?.socket.on(event, handler);
  }, [entry]);

  // La connexion est partagée : on ne retire QUE le handler fourni (jamais tous les écouteurs)
  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (entry && handler) entry.socket.off(event, handler);
  }, [entry]);

  const joinConversation = useCallback((conversationId: string) => {
    emit('conversation:join', { conversationId });
  }, [emit]);

  const leaveConversation = useCallback((conversationId: string) => {
    emit('conversation:leave', { conversationId });
  }, [emit]);

  const sendMessage = useCallback((data: Parameters<UseSocketReturn['sendMessage']>[0]) => {
    emit('message:send', data);
  }, [emit]);

  const markMessageAsRead = useCallback((messageId: string, conversationId: string) => {
    emit('message:read', { messageId, conversationId });
  }, [emit]);

  const startTyping = useCallback((conversationId: string, type: 'text' | 'recording' = 'text') => {
    emit('typing:start', { conversationId, type });
  }, [emit]);

  const stopTyping = useCallback((conversationId: string) => {
    emit('typing:stop', { conversationId });
  }, [emit]);

  const isUserOnline = useCallback((userId: string) => onlineUsers.has(String(userId)), [onlineUsers]);

  return {
    socket: entry?.socket || null,
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
    onlineUsers,
  };
}
