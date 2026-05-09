'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Send,
  Info,
  Image as ImageIcon,
  Smile,
  CheckCheck,
  Check,
  MoreVertical,
  MapPin,
  Star,
  ShoppingBag,
  ExternalLink,
  AlertCircle,
  Loader2,
  WifiOff,
  Mic
} from 'lucide-react';
import { Message, Conversation, Item } from '@/types';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getProductById } from '@/lib/api/products';
import { getMessages, getConversationById, markMessageAsRead as apiMarkMessageAsRead, markConversationAsRead, sendVoiceMessage, updateConversationDeal, closeConversationByOwner, reopenConversationByOwner } from '@/lib/api/messaging';
import { checkReviewEligibility } from '@/lib/api/reviews';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import VoiceRecorder from '@/components/VoiceRecorder';
import AudioPlayer from '@/components/AudioPlayer';
import { formatPriceFCFA } from '@/lib/utils';


export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.id as string;
  const { user, token, loading: authLoading } = useAuth();
  const { isConnected, joinConversation, sendMessage: socketSendMessage, on, off, startTyping, stopTyping, markMessageAsRead: socketMarkAsRead, isUserOnline } = useSocket({
    enabled: !!token,
    token: token || undefined
  });
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [productDetails, setProductDetails] = useState<Item | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [dealActionLoading, setDealActionLoading] = useState(false);
  const [ownerClosureLoading, setOwnerClosureLoading] = useState(false);
  const [optimisticDealStatus, setOptimisticDealStatus] = useState<Conversation['deal'] extends { status: infer S } ? S | null : string | null>(null);
  const [reviewEligible, setReviewEligible] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Charger la conversation et les messages
  useEffect(() => {
    // Attendre que l'authentification soit vérifiée
    if (authLoading) return;
    
    if (!token || !user) {
      router.push('/login');
      return;
    }

    const loadConversation = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les détails de la conversation
        const convResponse = await getConversationById(conversationId);
        setConversation(convResponse.data);

        // Charger les messages
        const messagesResponse = await getMessages(conversationId);
        setMessages(messagesResponse.data);
        setCurrentPage(1);
        setHasMoreMessages(Boolean(messagesResponse.pagination?.hasMore));

        // Scroll instantané vers le bas après chargement initial
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 100);

        // Marquer tous les messages de cette conversation comme lus
        try {
          await markConversationAsRead(conversationId);
        } catch (err) {
          console.error('❌ Erreur marquage conversation comme lue:', err);
        }

        // Charger les détails du produit si disponible
        if (convResponse.data.product) {
          try {
            const productResponse = await getProductById(String(convResponse.data.product._id || convResponse.data.product));
            setProductDetails(productResponse.data);
          } catch (err) {
            console.error('❌ Erreur chargement produit:', err);
          }
        }

        // Rejoindre la room Socket.IO
        if (isConnected) {
          joinConversation(conversationId);
        }
      } catch (err: any) {
        console.error('❌ Erreur chargement conversation:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement de la conversation');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, token, user, router, isConnected, joinConversation, authLoading]);

  // Rejoindre la conversation quand Socket.IO se connecte
  useEffect(() => {
    if (isConnected && conversationId) {
      joinConversation(conversationId);
    }
  }, [isConnected, conversationId, joinConversation]);

  // Écouter les événements Socket.IO
  useEffect(() => {
    if (!isConnected) return;

    // Nouveau message reçu
    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.conversationId === conversationId) {
        setMessages((prev) => {
          // Éviter les doublons
          if (prev.some(m => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });

        // Marquer comme lu si l'utilisateur n'est pas l'expéditeur
        if (newMessage.senderId !== user?.id) {
          socketMarkAsRead(newMessage.id, conversationId);
        }
      }
    };

    // Message marqué comme lu
    const handleMessageRead = ({ conversationId: readConvId, messageId }: { conversationId: string; messageId: string }) => {
      // Ne mettre à jour que si c'est la bonne conversation
      if (readConvId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, delivered: true, read: true } : msg
          )
        );
      }
    };

    const handleMessageDelivered = ({
      conversationId: deliveredConvId,
      messageId,
      deliveredAt,
    }: {
      conversationId: string;
      messageId: string;
      deliveredAt?: string;
    }) => {
      if (deliveredConvId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, delivered: true, deliveredAt: deliveredAt || msg.deliveredAt }
              : msg
          )
        );
      }
    };

    const handleConversationUpdate = (data: any) => {
      if (String(data?.conversationId || '') !== String(conversationId)) return;
      setConversation((prev) => (prev ? {
        ...prev,
        lastMessage: data.lastMessage || prev.lastMessage,
        unreadCount: typeof data.unreadCount === 'number' ? data.unreadCount : prev.unreadCount,
        status: data.status || prev.status,
        closedByOwner: typeof data.closedByOwner === 'boolean' ? data.closedByOwner : prev.closedByOwner,
        closedAt: data.closedAt !== undefined ? data.closedAt : prev.closedAt,
        closedById: data.closedById !== undefined ? data.closedById : prev.closedById,
        deal: data.deal || prev.deal,
      } : prev));
    };

    // Utilisateur en train d'écrire
    const handleTypingStart = ({ userId, userName }: { userId: string; userName: string; conversationId: string }) => {
      const currentUserId = String(user?.id || '').trim();
      const typingUserId = String(userId || '').trim();
      
      if (typingUserId !== currentUserId) {
        setTypingUsers((prev) => new Set(prev).add(userName));
      }
    };

    // Utilisateur a arrêté d'écrire
    const handleTypingStop = ({ userId, userName }: { userId: string; userName: string; conversationId: string }) => {
      const currentUserId = String(user?.id || '').trim();
      const typingUserId = String(userId || '').trim();
      
      if (typingUserId !== currentUserId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userName);
          return newSet;
        });
      }
    };

    on('message:new', handleNewMessage);
    on('message:delivered', handleMessageDelivered);
    on('message:read', handleMessageRead);
    on('typing:start', handleTypingStart);
    on('typing:stop', handleTypingStop);
    on('conversation:updated', handleConversationUpdate);

    return () => {
      off('message:new', handleNewMessage);
      off('message:delivered', handleMessageDelivered);
      off('message:read', handleMessageRead);
      off('typing:start', handleTypingStart);
      off('typing:stop', handleTypingStop);
      off('conversation:updated', handleConversationUpdate);
    };
  }, [isConnected, conversationId, user, on, off, socketMarkAsRead]);

  useEffect(() => {
    // Scroll automatique vers le bas
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!optimisticDealStatus) return;
    const serverStatus = conversation?.deal?.status || 'open';
    if (serverStatus === optimisticDealStatus) {
      setOptimisticDealStatus(null);
    }
  }, [conversation?.deal?.status, optimisticDealStatus]);

  useEffect(() => {
    const checkEligibility = async () => {
      const productId = conversation?.item?.id ? String(conversation.item.id) : '';

      if (!conversation?.closedByOwner || !productId) {
        setReviewEligible(false);
        return;
      }

      try {
        const response = await checkReviewEligibility(productId);
        setReviewEligible(Boolean(response?.eligible));
      } catch (error) {
        console.error('❌ Erreur vérification éligibilité avis conversation:', error);
        setReviewEligible(false);
      }
    };

    checkEligibility();
  }, [conversation?.closedByOwner, conversation?.item]);

  const loadOlderMessages = async () => {
    if (loadingOlder || !hasMoreMessages || !conversationId) return;
    const scrollEl = messagesScrollRef.current;
    const prevScrollHeight = scrollEl?.scrollHeight ?? 0;
    try {
      setLoadingOlder(true);
      const nextPage = currentPage + 1;
      const response = await getMessages(conversationId, nextPage);
      const older: Message[] = response?.data || [];
      if (older.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const unique = older.filter((m) => !existingIds.has(m.id));
          return [...unique, ...prev];
        });
        setCurrentPage(nextPage);
        setHasMoreMessages(Boolean(response?.pagination?.hasMore));
        // Maintenir la position de scroll après ajout en tête
        requestAnimationFrame(() => {
          if (scrollEl) {
            scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight;
          }
        });
      } else {
        setHasMoreMessages(false);
      }
    } catch {
      // silently ignore
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop < 80 && hasMoreMessages && !loadingOlder) {
      loadOlderMessages();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const formatDateSeparator = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return 'Hier';
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !conversation || !user) return;

    // Envoyer via Socket.IO
    socketSendMessage({
      conversationId: conversationId,
      content: message.trim(),
      type: 'text',
      postClosure: Boolean(conversation.closedByOwner),
    });
    
    // Vider le champ de saisie
    setMessage('');
    
    // Arrêter l'indicateur de saisie
    stopTyping(conversationId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleSendVoice = async (audioBlob: Blob) => {
    if (!conversation || !user) return;

    try {
      console.log('📤 Envoi message vocal...', audioBlob.size, 'bytes');
      await sendVoiceMessage(conversationId, audioBlob);
      console.log('✅ Message vocal envoyé avec succès');
      stopTyping(conversationId);
      setIsRecordingVoice(false);
    } catch (error) {
      console.error('❌ Erreur envoi message vocal:', error);
      alert('Erreur lors de l\'envoi du message vocal');
    }
  };

  const handleCancelVoice = () => {
    stopTyping(conversationId);
    setIsRecordingVoice(false);
  };

  const toggleVoiceMode = () => {
    setIsRecordingVoice(!isRecordingVoice);
  };

  const handleStartRecording = () => {
    startTyping(conversationId);
  };

  const handleStopRecording = () => {
    stopTyping(conversationId);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Envoyer l'indicateur "en train d'écrire"
    if (e.target.value.trim() && isConnected) {
      startTyping(conversationId);
      
      // Arrêter l'indicateur après 3 secondes d'inactivité
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversationId);
      }, 3000);
    } else if (!e.target.value.trim() && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      stopTyping(conversationId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#ec5a13] mx-auto mb-3" />
          <p className="text-gray-600">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/messages')} variant="outline">
              Retour aux messages
            </Button>
            <Button onClick={() => window.location.reload()} className="bg-[#ec5a13] hover:bg-[#d94f0f]">
              Réessayer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Conversation introuvable</p>
          <Button onClick={() => router.push('/messages')}>
            Retour aux messages
          </Button>
        </div>
      </div>
    );
  }

  const seller = conversation.participants.seller;
  const buyer = conversation.participants.buyer;
  
  // Déterminer qui est l'autre participant (celui qui n'est pas l'utilisateur actuel)
  const currentUserId = String(user?.id || '').trim();
  const otherParticipant = currentUserId === seller.id ? buyer : seller;
  const peerIsOnline = isUserOnline(String(otherParticipant?.id || ''));
  const isConversationSeller = currentUserId === seller.id;
  const isOwnerClosureActive = Boolean(conversation.closedByOwner);
  const dealStatus = optimisticDealStatus || conversation.deal?.status || 'open';
  const dealRequestedBy = conversation.deal?.requestedBy ? String(conversation.deal.requestedBy) : '';
  const isDealRequester = Boolean(dealRequestedBy && dealRequestedBy === currentUserId);
  const dealLabel = conversation.deal?.status === 'pending_conclusion'
    ? 'En attente de confirmation'
    : conversation.deal?.status === 'concluded'
      ? 'Affaire conclue'
      : conversation.deal?.status === 'not_concluded'
        ? 'Non conclue'
        : 'Aucune clôture';

  const applyDealTransition = (currentDeal: Conversation['deal'] | undefined, action: 'request' | 'confirm' | 'reject' | 'reopen') => {
    const now = new Date().toISOString();
    const safeDeal = currentDeal || { status: 'open' as const };

    if (action === 'request') {
      return {
        ...safeDeal,
        status: 'pending_conclusion' as const,
        requestedBy: currentUserId || safeDeal.requestedBy || null,
        requestedAt: now,
      };
    }

    if (action === 'confirm') {
      return {
        ...safeDeal,
        status: 'concluded' as const,
        resolvedBy: currentUserId || safeDeal.resolvedBy || null,
        resolvedAt: now,
      };
    }

    if (action === 'reject') {
      return {
        ...safeDeal,
        status: 'not_concluded' as const,
        resolvedBy: currentUserId || safeDeal.resolvedBy || null,
        resolvedAt: now,
      };
    }

    return {
      status: 'open' as const,
      requestedBy: null,
      requestedAt: null,
      resolvedBy: null,
      resolvedAt: null,
      note: '',
    };
  };

  const handleDealAction = async (action: 'request' | 'confirm' | 'reject' | 'reopen') => {
    if (!conversationId || dealActionLoading) return;

    const previousConversation = conversation;
    const optimisticDeal = applyDealTransition(conversation?.deal, action);

    // Mise à jour optimiste pour un feedback instantané dans l'UI
    setOptimisticDealStatus(optimisticDeal.status);
    setConversation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        deal: applyDealTransition(prev.deal, action),
      };
    });

    try {
      setDealActionLoading(true);
      const response = await updateConversationDeal(conversationId, action);
      const updatedConversation = response?.data?.id ? response.data : response?.id ? response : null;

      if (updatedConversation) {
        setConversation(updatedConversation as Conversation);
      } else {
        const refreshed = await getConversationById(conversationId);
        if (refreshed?.data) {
          setConversation(refreshed.data);
        }
      }
    } catch (err: any) {
      setOptimisticDealStatus(null);
      setConversation(previousConversation);
      setError(err?.response?.data?.message || 'Impossible de mettre à jour le statut de l\'affaire');
    } finally {
      setDealActionLoading(false);
    }
  };

  const handleOwnerClosureAction = async () => {
    if (!conversationId || ownerClosureLoading || !isConversationSeller) return;

    const previousConversation = conversation;

    try {
      setOwnerClosureLoading(true);
      const response = isOwnerClosureActive
        ? await reopenConversationByOwner(conversationId)
        : await closeConversationByOwner(conversationId);

      const updatedConversation = response?.data?.id ? response.data : response?.id ? response : null;

      if (updatedConversation) {
        setConversation(updatedConversation as Conversation);
      } else {
        const refreshed = await getConversationById(conversationId);
        if (refreshed?.data) {
          setConversation(refreshed.data);
        }
      }
    } catch (err: any) {
      setConversation(previousConversation);
      setError(err?.response?.data?.message || 'Impossible de mettre à jour la clôture de la discussion');
    } finally {
      setOwnerClosureLoading(false);
    }
  };

  const handleOpenReview = () => {
    const productId = conversation?.item?.id ? String(conversation.item.id) : '';
    if (!productId) return;
    router.push(`/items/${productId}?scrollToReviewForm=1`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header de la conversation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex-shrink-0 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </Button>
              
              {/* Info interlocuteur */}
              <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-gray-100 rounded-lg p-2 -m-2 transition-colors"
                   onClick={() => {
                     if (otherParticipant.id === seller.id) {
                       router.push(`/seller/${seller.id}`);
                     }
                   }}>
                <div className="relative flex-shrink-0">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    {otherParticipant.avatar ? (
                      <img src={otherParticipant.avatar} alt={otherParticipant.name} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#ec5a13] to-orange-600 flex items-center justify-center text-white font-bold">
                        {otherParticipant.name.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  {/* Dot statut en ligne sur l'avatar */}
                  <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${peerIsOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h2 className="font-semibold text-gray-900 truncate">
                      {otherParticipant.name}
                    </h2>
                    {otherParticipant.id === seller.id && seller.verified && (
                      <CheckCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  {/* Statut en ligne sous le nom */}
                  <p className={`text-xs font-medium ${peerIsOnline ? 'text-green-600' : 'text-gray-400'}`}>
                    {isConnected ? (peerIsOnline ? 'En ligne' : 'Hors ligne') : 'Connexion…'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/seller/${seller.id}`)}
                className="hover:bg-gray-100"
              >
                <Info className="h-5 w-5 text-gray-700" />
              </Button>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            {/* Badge unique — état le plus pertinent */}
            {isOwnerClosureActive ? (
              <Badge variant="outline" className="border-slate-400 text-slate-600 text-xs">
                🔒 Discussion clôturée
              </Badge>
            ) : dealStatus === 'concluded' ? (
              <Badge variant="outline" className="border-emerald-500 text-emerald-700 text-xs">
                ✓ Affaire conclue
              </Badge>
            ) : dealStatus === 'not_concluded' ? (
              <Badge variant="outline" className="border-slate-400 text-slate-600 text-xs">
                Affaire non conclue
              </Badge>
            ) : dealStatus === 'pending_conclusion' ? (
              <Badge variant="outline" className="border-orange-400 text-orange-700 text-xs">
                ⏳ Clôture en attente
              </Badge>
            ) : (
              <span className="text-xs text-gray-400">Discussion en cours</span>
            )}

            {/* Bouton vendeur */}
            {isConversationSeller ? (
              <Button
                onClick={handleOwnerClosureAction}
                disabled={ownerClosureLoading}
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-shrink-0"
              >
                {ownerClosureLoading ? '…' : isOwnerClosureActive ? 'Réouvrir' : 'Clôturer'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Carte produit fixe — hors de la zone scrollable */}
      {conversation.item && (
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 py-2.5 max-w-4xl">
            <div className="flex items-center gap-3">
              <img
                src={conversation.item.image}
                alt={conversation.item.title}
                className="w-12 h-12 object-cover rounded-lg shadow-sm flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">À propos de</p>
                <h3 className="font-semibold text-gray-900 truncate text-sm leading-tight">
                  {conversation.item.title}
                </h3>
                <p className="text-sm font-bold text-[#ec5a13]">
                  {formatPriceFCFA(conversation.item.price)}
                </p>
              </div>
              {productDetails && productDetails.status !== 'active' && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full flex-shrink-0">
                  {productDetails.status === 'sold' ? 'Vendu' : productDetails.status === 'expired' ? 'Expiré' : 'En attente'}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { if (conversation.item?.id) router.push(`/items/${conversation.item.id}`); }}
                className="flex-shrink-0 hover:bg-gray-100 h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Zone des messages */}
      <div
        ref={messagesScrollRef}
        className="flex-1 overflow-y-auto bg-gray-50"
        onScroll={handleMessagesScroll}
      >
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Bouton/indicateur charger plus anciens */}
          {loadingOlder && (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-[#ec5a13]" />
              <span>Chargement des messages plus anciens…</span>
            </div>
          )}
          {!loadingOlder && hasMoreMessages && (
            <button
              onClick={loadOlderMessages}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-[#ec5a13] hover:bg-orange-50 rounded-lg transition-colors mb-2"
            >
              <span>↑ Messages plus anciens</span>
            </button>
          )}

          {reviewEligible && conversation.closedByOwner && (
            <Card className="mb-4 p-4 border-emerald-200 bg-emerald-50 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-emerald-900">📝 Donnez votre avis</p>
                  <p className="text-sm text-emerald-800">
                    La discussion est clôturée. Vous pouvez maintenant laisser un avis sur cet article.
                  </p>
                </div>
                <Button onClick={handleOpenReview} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Aller au formulaire
                </Button>
              </div>
            </Card>
          )}

          {/* Messages */}
          <div className="space-y-1">
            {messages.map((msg, index) => {
              if (msg.type === 'system' || msg.systemId) {
                return (
                  <div key={msg.id} className="w-full flex justify-center py-2">
                    <div className="max-w-[85%] rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 text-center">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              }

              // Comparaison stricte pour déterminer si c'est l'utilisateur actuel
              // On compare à la fois avec l'ID de l'utilisateur et avec le nom
              const userIdStr = String(user?.id || '').trim();
              const msgSenderIdStr = String(msg.senderId || '').trim();
              const isCurrentUser = userIdStr === msgSenderIdStr || user?.name === msg.senderName;
              
              // Log de debug détaillé
              if (index === 0) {
                console.log('🔍 Debug positionnement MESSAGE:', {
                  userRaw: user,
                  userId: user?.id,
                  userIdStr,
                  userName: user?.name,
                  msgSenderId: msg.senderId,
                  msgSenderIdStr,
                  msgSenderName: msg.senderName,
                  comparison: `"${msgSenderIdStr}" === "${userIdStr}"`,
                  nameComparison: `"${user?.name}" === "${msg.senderName}"`,
                  isCurrentUser,
                  willBePositioned: isCurrentUser ? 'DROITE (orange)' : 'GAUCHE (blanc)'
                });
              }
              
              // Séparateur de date
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
              const msgDay = new Date(msg.timestamp).toDateString();
              const prevDay = prevMsg ? new Date(prevMsg.timestamp).toDateString() : null;
              const showDateSeparator = msgDay !== prevDay;
              const isSameSenderAsPrev = prevMsg && prevMsg.senderId === msg.senderId && msgDay === prevDay;
              const isSameSenderAsNext = nextMsg && nextMsg.senderId === msg.senderId;
              
              // Déterminer le style de la bulle selon la position dans le groupe
              const isFirstInGroup = !isSameSenderAsPrev;
              const isLastInGroup = !isSameSenderAsNext;
              
              // Afficher l'avatar seulement pour le dernier message d'un groupe
              const showAvatar = !isCurrentUser && isLastInGroup;

              return (
                <div key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap px-1">
                        {formatDateSeparator(msg.timestamp)}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                <div
                  className={`w-full flex items-end gap-2 ${
                    isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                  } ${!isLastInGroup ? 'mb-0.5' : 'mb-3'}`}
                >
                  {/* Avatar (seulement pour le dernier message d'un groupe) */}
                  <div className="flex-shrink-0 w-8">
                    {showAvatar ? (
                      <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt={msg.senderName} className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold">
                            {msg.senderName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </Avatar>
                    ) : !isCurrentUser ? (
                      <div className="w-8"></div>
                    ) : null}
                  </div>

                  {/* Bulle de message */}
                  <div
                    className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${
                      isCurrentUser ? 'items-end ml-auto' : 'items-start mr-auto'
                    }`}
                  >
                    {/* Nom de l'expéditeur (seulement pour le premier message d'un groupe reçu) */}
                    {!isCurrentUser && isFirstInGroup && (
                      <span className="text-xs text-gray-500 mb-1 px-3">
                        {msg.senderName}
                      </span>
                    )}
                    
                    {/* Message bubble avec les couleurs de l'app */}
                    <div className="relative group">
                      <div
                        className={`relative px-3 py-2 shadow-sm transition-shadow hover:shadow-md ${
                          isCurrentUser
                            ? 'bg-[#ec5a13] text-white' // Orange de l'app pour messages envoyés
                            : 'bg-white text-gray-900 border border-gray-200' // Blanc pour messages reçus
                        } ${
                          // Coins arrondis selon la position dans le groupe
                          isCurrentUser
                            ? isFirstInGroup && isLastInGroup
                              ? 'rounded-2xl rounded-br-md' // Message seul
                              : isFirstInGroup
                              ? 'rounded-2xl rounded-br-md rounded-tr-2xl' // Premier d'un groupe
                              : isLastInGroup
                              ? 'rounded-2xl rounded-br-md rounded-tr-md' // Dernier d'un groupe
                              : 'rounded-tr-md rounded-tl-2xl rounded-bl-2xl rounded-br-md' // Milieu d'un groupe
                            : isFirstInGroup && isLastInGroup
                              ? 'rounded-2xl rounded-bl-md' // Message seul
                              : isFirstInGroup
                              ? 'rounded-2xl rounded-bl-md rounded-tl-2xl' // Premier d'un groupe
                              : isLastInGroup
                              ? 'rounded-2xl rounded-bl-md rounded-tl-md' // Dernier d'un groupe
                              : 'rounded-tl-md rounded-tr-2xl rounded-br-2xl rounded-bl-md' // Milieu d'un groupe
                        }`}
                      >
                        {/* Contenu du message */}
                        {msg.type === 'audio' ? (
                          <AudioPlayer 
                            audioUrl={msg.attachments?.[0] || ''} 
                            isCurrentUser={isCurrentUser}
                          />
                        ) : (
                          <p className="text-[14px] leading-[19px] whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        )}
                        
                        {/* Heure et statut intégrés dans la bulle */}
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className={`text-[11px] ${isCurrentUser ? 'text-white/80' : 'text-gray-500'}`}>
                            {formatMessageTime(msg.timestamp)}
                          </span>
                          {isCurrentUser && (
                            <>
                              {msg.read ? (
                                /* Vu — ambre pâle, analogique de l'orange */
                                <CheckCheck className="h-[15px] w-[15px]" style={{ color: '#fde68a' }} />
                              ) : msg.delivered ? (
                                /* Livré — blanc plein */
                                <CheckCheck className="h-[15px] w-[15px] text-white/90" />
                              ) : (
                                /* Envoyé — blanc discret */
                                <Check className="h-[15px] w-[15px] text-white/45" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              );
            })}

            {/* Indicateur "En train d'écrire..." */}
            {typingUsers.size > 0 && (
              <div className="w-full flex items-end gap-2 mb-3">
                <div className="flex-shrink-0 w-8">
                  <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                    {otherParticipant.avatar ? (
                      <img src={otherParticipant.avatar} alt={otherParticipant.name} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold">
                        {otherParticipant.name.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-md px-5 py-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Zone de saisie */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 shadow-lg">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          {/* Indicateur de connexion */}
          {!isConnected && (
            <div className="mb-3 flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <WifiOff className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs font-medium">Connexion perdue. Reconnexion en cours...</p>
            </div>
          )}
          
          {/* Mode message vocal */}
          {isRecordingVoice ? (
            <VoiceRecorder
              onSendVoice={handleSendVoice}
              onCancel={handleCancelVoice}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
            />
          ) : (
            /* Mode message texte */
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-300 overflow-hidden hover:border-gray-400 focus-within:border-[#ec5a13] transition-colors">
                <Textarea
                  placeholder="Écrivez un message..."
                  value={message}
                  onChange={handleMessageChange}
                  onKeyPress={handleKeyPress}
                  className="min-h-[44px] max-h-[150px] resize-none border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 text-[15px] bg-transparent"
                  rows={1}
                  disabled={!isConnected}
                />
              </div>
              
              {/* Bouton micro */}
              <Button
                onClick={toggleVoiceMode}
                disabled={!isConnected}
                className="bg-gray-100 hover:bg-gray-200 h-11 w-11 rounded-full p-0 flex items-center justify-center shadow-md transition-all disabled:bg-gray-300 disabled:opacity-50"
                size="icon"
              >
                <Mic className="h-5 w-5 text-gray-700" />
              </Button>
              
              {/* Bouton envoi */}
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !isConnected}
                className="bg-[#ec5a13] hover:bg-[#d94f0f] h-11 w-11 rounded-full p-0 flex items-center justify-center shadow-md transition-all disabled:bg-gray-300 disabled:opacity-50"
                size="icon"
              >
                <Send className="h-5 w-5 text-white" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
