'use client';

// Conversation — même ambiance que le reste du site ; panneau latéral (annonce, affaire) sur ordinateur
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/home/Header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Send,
  CheckCheck,
  Check,
  MoreVertical,
  Star,
  ExternalLink,
  AlertCircle,
  Loader2,
  WifiOff,
  Mic,
  ShieldCheck,
  Store,
  Lock,
  Unlock,
  Handshake,
  Hourglass,
  CheckCircle2,
  XCircle,
  ChevronUp,
  X,
} from 'lucide-react';
import { Message, Conversation, Item } from '@/types';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatPrice, getInitials, sizedImage } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getProductById } from '@/lib/api/products';
import { getMessages, getConversationById, markMessageAsRead as apiMarkMessageAsRead, markConversationAsRead, sendVoiceMessage, updateConversationDeal, closeConversationByOwner, reopenConversationByOwner } from '@/lib/api/messaging';
import { checkReviewEligibility, createReview } from '@/lib/api/reviews';
import { useAuth } from '@/hooks/useAuth';
import { useQuickAuth } from '@/contexts/QuickAuthContext';
import { useSocket } from '@/hooks/useSocket';
import VoiceRecorder from '@/components/VoiceRecorder';
import AudioPlayer from '@/components/AudioPlayer';


function extractMongoId(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') {
    const m = value.match(/[a-fA-F0-9]{24}/);
    return m ? m[0] : value;
  }
  if (typeof value === 'object') {
    if (value._id) return extractMongoId(value._id);
    if (value.$oid) return String(value.$oid);
    if (typeof value.toString === 'function') {
      const s = value.toString();
      if (/^[a-fA-F0-9]{24}$/.test(s)) return s;
      const m = s.match(/[a-fA-F0-9]{24}/);
      if (m) return m[0];
    }
  }
  return String(value);
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.id as string;
  const { user, token, loading: authLoading } = useAuth();
  const { openQuickAuth } = useQuickAuth();
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
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // Charger la conversation et les messages
  useEffect(() => {
    // Attendre que l'authentification soit vérifiée
    if (authLoading) return;
    
    // Visiteur non connecté : la page affiche une invitation à se connecter
    if (!token || !user) {
      setLoading(false);
      return;
    }

    const loadConversation = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les détails de la conversation
        const convResponse = await getConversationById(conversationId);
        const convData = convResponse.data;
        setConversation(convData);

        // Vérifier l'éligibilité avis dès le chargement si la conversation est clôturée
        if (convData?.closedByOwner && convData?.item?.id) {
          checkReviewEligibility(extractMongoId(convData.item.id))
            .then((r) => setReviewEligible(Boolean(r?.eligible)))
            .catch(() => setReviewEligible(false));
        }

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
      setConversation((prev) => {
        if (!prev) return prev;
        const newClosed = typeof data.closedByOwner === 'boolean' ? data.closedByOwner : prev.closedByOwner;
        // Recharger l'éligibilité si la conversation vient d'être clôturée
        if (newClosed && !prev.closedByOwner && prev.item?.id) {
          checkReviewEligibility(extractMongoId(prev.item.id))
            .then((r) => setReviewEligible(Boolean(r?.eligible)))
            .catch(() => {});
        }
        if (!newClosed) setReviewEligible(false);
        return {
          ...prev,
          lastMessage: data.lastMessage || prev.lastMessage,
          unreadCount: typeof data.unreadCount === 'number' ? data.unreadCount : prev.unreadCount,
          status: data.status || prev.status,
          closedByOwner: newClosed,
          closedAt: data.closedAt !== undefined ? data.closedAt : prev.closedAt,
          closedById: data.closedById !== undefined ? data.closedById : prev.closedById,
          deal: data.deal || prev.deal,
        };
      });
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

  // Défilement vers le bas seulement quand un message arrive en fin de liste
  // (pas quand des messages plus anciens sont ajoutés en tête), et seulement si
  // l'utilisateur est déjà en bas ou si c'est son propre message
  const lastMessageId = messages[messages.length - 1]?.id;
  const lastMessageMine = String(messages[messages.length - 1]?.senderId || '') === String(user?.id || '');
  useEffect(() => {
    if (!lastMessageId) return;
    const el = messagesScrollRef.current;
    const nearBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 240;
    if (nearBottom || lastMessageMine) scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessageId]);

  useEffect(() => {
    if (typingUsers.size > 0) {
      const el = messagesScrollRef.current;
      if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 240) scrollToBottom();
    }
  }, [typingUsers.size]);

  useEffect(() => {
    if (!optimisticDealStatus) return;
    const serverStatus = conversation?.deal?.status || 'open';
    if (serverStatus === optimisticDealStatus) {
      setOptimisticDealStatus(null);
    }
  }, [conversation?.deal?.status, optimisticDealStatus]);

  useEffect(() => {
    const productId = extractMongoId(conversation?.item?.id);

    if (!productId) return;

    if (!conversation?.closedByOwner) {
      setReviewEligible(false);
      return;
    }

    let cancelled = false;
    checkReviewEligibility(productId).then((response) => {
      if (!cancelled) setReviewEligible(Boolean(response?.eligible));
    }).catch(() => {
      if (!cancelled) setReviewEligible(false);
    });

    return () => { cancelled = true; };
  }, [conversation?.closedByOwner, conversation?.item?.id]);

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
    if (composerRef.current) composerRef.current.style.height = 'auto';
    
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
      await sendVoiceMessage(conversationId, audioBlob);
      stopTyping(conversationId);
      setIsRecordingVoice(false);
    } catch (error) {
      console.error('❌ Erreur envoi message vocal:', error);
      toast.error("Le message vocal n'a pas pu être envoyé. Réessayez.");
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
    // Hauteur automatique (jusqu'à ~6 lignes)
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
    
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

  // États de chargement, visiteur, erreur
  if (authLoading || loading) {
    return (
      <ChatShell>
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-full bg-gray-200" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
        <div className="flex-1 space-y-3 bg-[#f6f7fb] px-4 py-6">
          {[60, 40, 70, 35, 55].map((w, i) => (
            <div key={i} className={cn('flex', i % 2 ? 'justify-end' : 'justify-start')}>
              <div className={cn('h-10 animate-pulse rounded-2xl', i % 2 ? 'bg-[#ec5a13]/20' : 'bg-white')} style={{ width: `${w}%`, maxWidth: 420 }} />
            </div>
          ))}
        </div>
      </ChatShell>
    );
  }

  if (!user || !token) {
    return (
      <ChatShell>
        <div className="flex flex-1 items-center justify-center bg-[#f6f7fb] p-6">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)]">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ec5a13]"><Lock className="h-8 w-8" /></span>
            <h1 className="mt-5 text-xl font-black tracking-tight text-gray-900">Conversation privée</h1>
            <p className="mt-2 text-[15px] text-gray-500">Connectez-vous pour lire et répondre à vos messages.</p>
            <button
              type="button"
              onClick={() => openQuickAuth(`/messages/${conversationId}`)}
              className="mt-6 inline-flex h-12 items-center rounded-full bg-[#ec5a13] px-6 text-[15px] font-bold text-white transition hover:bg-[#d44f11]"
            >
              Se connecter
            </button>
          </div>
        </div>
      </ChatShell>
    );
  }

  if (error || !conversation) {
    return (
      <ChatShell>
        <div className="flex flex-1 items-center justify-center bg-[#f6f7fb] p-6">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-500"><AlertCircle className="h-8 w-8" /></span>
            <h1 className="mt-5 text-xl font-black tracking-tight text-gray-900">{error ? 'Conversation indisponible' : 'Conversation introuvable'}</h1>
            <p className="mt-2 text-[15px] text-gray-500">{error || "Elle a peut-être été supprimée."}</p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Link href="/messages" className="inline-flex h-11 items-center justify-center rounded-full border border-gray-200 px-5 text-sm font-bold text-gray-700 transition hover:border-gray-300">
                Mes messages
              </Link>
              <button type="button" onClick={() => window.location.reload()} className="inline-flex h-11 items-center justify-center rounded-full bg-[#ec5a13] px-5 text-sm font-bold text-white transition hover:bg-[#d44f11]">
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </ChatShell>
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
      toast.error(err?.response?.data?.message || 'Impossible de mettre à jour le statut de l\'affaire');
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
      toast.error(err?.response?.data?.message || 'Impossible de mettre à jour la clôture de la discussion');
    } finally {
      setOwnerClosureLoading(false);
    }
  };

  const submitReview = async () => {
    if (reviewRating === 0 || submittingReview) return;
    const productId = extractMongoId(conversation?.item?.id);
    if (!productId) return;
    try {
      setSubmittingReview(true);
      await createReview({ productId, rating: reviewRating, comment: reviewComment.trim() });
      setReviewModalOpen(false);
      setReviewRating(0);
      setReviewComment('');
      setReviewEligible(false);
      toast.success('Merci pour votre avis !');
    } catch (err: any) {
      console.error('❌ Erreur publication avis:', err);
      toast.error(err?.message || "L'avis n'a pas pu être publié");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ─── Dérivés d'affichage ──────────────────────────────────────────────────
  const peer = otherParticipant as { id: string; name: string; avatar?: string; businessName?: string; verified?: boolean };
  const peerName = peer.businessName || peer.name || 'Utilisateur';
  const peerTyping = typingUsers.size > 0;
  const itemId = extractMongoId(conversation.item?.id);
  const itemStatus = productDetails && productDetails.status !== 'active'
    ? (productDetails.status === 'sold' ? 'Vendu' : productDetails.status === 'expired' ? 'Expiré' : 'En attente')
    : null;
  const myRoleLabel = isConversationSeller ? 'Vous vendez' : 'Vous achetez';

  // Bandeau « affaire » : ce que chacun peut faire selon l'état (mêmes règles que l'app)
  const dealBanner: null | { tone: 'wait' | 'ok' | 'ko'; title: string; text: string; actions: { label: string; onClick: () => void; primary?: boolean }[] } = (() => {
    if (dealStatus === 'pending_conclusion') {
      if (isDealRequester) {
        return { tone: 'wait', title: 'Affaire en attente de confirmation', text: `${peerName} doit confirmer que l'affaire est conclue.`, actions: [{ label: 'Annuler la demande', onClick: () => handleDealAction('reopen') }] };
      }
      if (!isConversationSeller) {
        return {
          tone: 'wait',
          title: 'Le vendeur indique que l\'affaire est conclue',
          text: 'Confirmez-vous avoir conclu cette affaire ?',
          actions: [
            { label: 'Non conclue', onClick: () => handleDealAction('reject') },
            { label: 'Oui, confirmer', onClick: () => handleDealAction('confirm'), primary: true },
          ],
        };
      }
      return { tone: 'wait', title: 'Affaire en attente de confirmation', text: 'En attente de la réponse de l\'acheteur.', actions: [] };
    }
    return null;
  })();

  const dealPill = dealStatus === 'concluded'
    ? { icon: CheckCircle2, label: 'Affaire conclue', cls: 'bg-emerald-50 text-emerald-700' }
    : dealStatus === 'not_concluded'
      ? { icon: XCircle, label: 'Non conclue', cls: 'bg-red-50 text-red-600' }
      : dealStatus === 'pending_conclusion'
        ? { icon: Hourglass, label: 'En attente', cls: 'bg-amber-50 text-amber-700' }
        : null;

  const userIdStr = String(user?.id || '').trim();

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <ChatShell>
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 gap-6 lg:px-4 lg:py-5">
        {/* ── Colonne conversation ── */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white lg:rounded-3xl lg:border lg:border-gray-100 lg:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
          {/* En-tête */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-2 py-2.5 sm:px-4">
            <button type="button" onClick={() => router.push('/messages')} aria-label="Retour aux messages" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Link href={otherParticipant.id === seller.id ? `/seller/${seller.id}` : '#'} onClick={(e) => { if (otherParticipant.id !== seller.id) e.preventDefault(); }} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-1 py-1 transition hover:bg-gray-50">
              <span className="relative shrink-0">
                {peer.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sizedImage(peer.avatar, 96)} alt="" className="h-11 w-11 rounded-2xl object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ff8a4c,#ec5a13)] text-sm font-black text-white">{getInitials(peerName)}</span>
                )}
                {peerIsOnline ? <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-500" /> : null}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[15px] font-black text-gray-900">{peerName}</span>
                  {peer.verified ? <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" aria-label="Vérifié" /> : null}
                </span>
                <span className={cn('block text-xs font-semibold', peerTyping ? 'text-[#ec5a13]' : peerIsOnline ? 'text-emerald-600' : 'text-gray-400')}>
                  {peerTyping ? 'écrit…' : !isConnected ? 'Connexion…' : peerIsOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </span>
            </Link>

            {dealPill ? (
              <span className={cn('hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold sm:inline-flex lg:hidden', dealPill.cls)}>
                <dealPill.icon className="h-3.5 w-3.5" /> {dealPill.label}
              </span>
            ) : null}
            {isOwnerClosureActive ? (
              <span className="hidden shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 sm:inline-flex lg:hidden">
                <Lock className="h-3.5 w-3.5" /> Clôturée
              </span>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Plus d'options" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-2xl p-1.5">
                {itemId ? (
                  <DropdownMenuItem className="rounded-xl" onClick={() => router.push(`/items/${itemId}`)}>
                    <ExternalLink className="h-4 w-4" /> Voir l&apos;annonce
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem className="rounded-xl" onClick={() => router.push(`/seller/${seller.id}`)}>
                  <Store className="h-4 w-4" /> {isConversationSeller ? 'Ma boutique' : 'Boutique du vendeur'}
                </DropdownMenuItem>
                {isConversationSeller && dealStatus === 'open' ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-xl" disabled={dealActionLoading} onClick={() => handleDealAction('request')}>
                      <Handshake className="h-4 w-4" /> Marquer l&apos;affaire comme conclue
                    </DropdownMenuItem>
                  </>
                ) : null}
                {isConversationSeller && (dealStatus === 'concluded' || dealStatus === 'not_concluded') ? (
                  <DropdownMenuItem className="rounded-xl" disabled={dealActionLoading} onClick={() => handleDealAction('reopen')}>
                    <Handshake className="h-4 w-4" /> Rouvrir l&apos;affaire
                  </DropdownMenuItem>
                ) : null}
                {isConversationSeller ? (
                  <DropdownMenuItem className="rounded-xl" disabled={ownerClosureLoading} onClick={handleOwnerClosureAction}>
                    {isOwnerClosureActive ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {isOwnerClosureActive ? 'Rouvrir la discussion' : 'Clôturer la discussion'}
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Annonce (mobile et tablette ; sur ordinateur elle est dans le panneau) */}
          {conversation.item ? (
            <Link href={itemId ? `/items/${itemId}` : '#'} className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5 transition hover:bg-gray-50 lg:hidden">
              {conversation.item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sizedImage(conversation.item.image, 96)} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
              ) : null}
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-gray-400">{myRoleLabel}</span>
                <span className="block truncate text-sm font-semibold text-gray-900">{conversation.item.title}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-black text-gray-900">{formatPrice(conversation.item.price)}</span>
                {itemStatus ? <span className="text-[11px] font-bold text-amber-700">{itemStatus}</span> : null}
              </span>
            </Link>
          ) : null}

          {/* Bandeau affaire à traiter */}
          {dealBanner ? (
            <div className="flex flex-col gap-3 border-b border-amber-100 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center">
              <Hourglass className="hidden h-5 w-5 shrink-0 text-amber-600 sm:block" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-amber-950">{dealBanner.title}</p>
                <p className="text-xs text-amber-800">{dealBanner.text}</p>
              </div>
              {dealBanner.actions.length ? (
                <div className="flex shrink-0 gap-2">
                  {dealBanner.actions.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      disabled={dealActionLoading}
                      onClick={a.onClick}
                      className={cn('h-9 rounded-full px-4 text-xs font-bold transition disabled:opacity-50', a.primary ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white text-gray-700 ring-1 ring-amber-200 hover:ring-amber-300')}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Invitation à laisser un avis */}
          {reviewEligible && conversation.closedByOwner && !reviewModalOpen ? (
            <button
              type="button"
              onClick={() => { setReviewRating(0); setReviewComment(''); setReviewModalOpen(true); }}
              className="flex items-center gap-3 border-b border-amber-100 bg-[linear-gradient(90deg,#fffbeb,#fff7f2)] px-4 py-3 text-left transition hover:brightness-[0.98]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-amber-950"><Star className="h-5 w-5 fill-current" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-gray-900">Donnez votre avis</span>
                <span className="block text-xs text-gray-600">La discussion est clôturée : notez cette annonce en 10 secondes.</span>
              </span>
              <span className="shrink-0 text-sm font-bold text-[#ec5a13]">Noter</span>
            </button>
          ) : null}

          {reviewModalOpen ? (
            <div className="border-b border-gray-100 bg-white px-4 py-4">
              <div className="mx-auto max-w-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-gray-900">Votre avis {conversation.item ? `sur « ${conversation.item.title} »` : ''}</p>
                  <button type="button" onClick={() => setReviewModalOpen(false)} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)} aria-label={`${star} étoile${star > 1 ? 's' : ''}`} className="p-0.5 transition hover:scale-110 active:scale-95">
                      <Star className={cn('h-8 w-8', reviewRating >= star ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200')} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-amber-600">{['', 'Très déçu', 'Déçu', 'Correct', 'Bien', 'Excellent'][reviewRating]}</span>
                </div>
                <textarea
                  placeholder="Racontez votre expérience (facultatif)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value.slice(0, 500))}
                  rows={2}
                  className="mt-3 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#ec5a13]"
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => setReviewModalOpen(false)} className="h-10 flex-1 rounded-full text-sm font-bold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50">Plus tard</button>
                  <button type="button" onClick={submitReview} disabled={reviewRating === 0 || submittingReview} className="inline-flex h-10 flex-[2] items-center justify-center rounded-full bg-[#ec5a13] text-sm font-bold text-white transition hover:bg-[#d44f11] disabled:opacity-40">
                    {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publier mon avis'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Messages */}
          <div ref={messagesScrollRef} onScroll={handleMessagesScroll} className="min-h-0 flex-1 overflow-y-auto bg-[#f6f7fb] lg:bg-[#fafafa]">
            <div className="mx-auto max-w-3xl px-3 py-5 sm:px-6">
              {loadingOlder ? (
                <div className="flex items-center justify-center gap-2 py-3 text-xs text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-[#ec5a13]" /> Messages plus anciens…
                </div>
              ) : hasMoreMessages ? (
                <button type="button" onClick={loadOlderMessages} className="mx-auto mb-2 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-600 ring-1 ring-gray-200 transition hover:text-gray-900">
                  <ChevronUp className="h-4 w-4" /> Messages plus anciens
                </button>
              ) : messages.length > 0 ? (
                <p className="mx-auto mb-4 flex max-w-sm items-center justify-center gap-1.5 rounded-2xl bg-white px-4 py-2.5 text-center text-[11px] text-gray-500 ring-1 ring-gray-100">
                  <Lock className="h-3 w-3 shrink-0 text-emerald-600" /> Messagerie TakTak : vos numéros restent privés.
                </p>
              ) : null}

              {messages.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl ring-1 ring-gray-100">👋</span>
                  <p className="mt-4 text-base font-black text-gray-900">Dites bonjour à {peerName}</p>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">Posez vos questions sur l&apos;annonce : disponibilité, état, lieu de rencontre…</p>
                </div>
              ) : null}

              {messages.map((msg, index) => {
                if (msg.type === 'system' || msg.systemId) {
                  return (
                    <div key={msg.id} className="flex justify-center py-2">
                      <p className="max-w-[85%] rounded-full bg-white px-4 py-1.5 text-center text-xs font-semibold text-gray-500 ring-1 ring-gray-200">{msg.content}</p>
                    </div>
                  );
                }

                const isCurrentUser = userIdStr === String(msg.senderId || '').trim();
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
                const msgDay = new Date(msg.timestamp).toDateString();
                const prevDay = prevMsg ? new Date(prevMsg.timestamp).toDateString() : null;
                const showDateSeparator = msgDay !== prevDay;
                const isFirstInGroup = !(prevMsg && prevMsg.senderId === msg.senderId && msgDay === prevDay && prevMsg.type !== 'system');
                const isLastInGroup = !(nextMsg && nextMsg.senderId === msg.senderId && new Date(nextMsg.timestamp).toDateString() === msgDay && nextMsg.type !== 'system');
                const showAvatar = !isCurrentUser && isLastInGroup;

                return (
                  <div key={msg.id}>
                    {showDateSeparator ? (
                      <div className="my-5 flex justify-center">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold capitalize text-gray-500 shadow-sm ring-1 ring-gray-100">{formatDateSeparator(msg.timestamp)}</span>
                      </div>
                    ) : null}
                    <div className={cn('flex items-end gap-2', isCurrentUser ? 'justify-end' : 'justify-start', isLastInGroup ? 'mb-3' : 'mb-0.5')}>
                      {!isCurrentUser ? (
                        <span className="w-8 shrink-0">
                          {showAvatar ? (
                            msg.senderAvatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={sizedImage(msg.senderAvatar, 64)} alt="" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-[11px] font-black text-gray-600">{getInitials(msg.senderName)}</span>
                            )
                          ) : null}
                        </span>
                      ) : null}
                      <div
                        className={cn(
                          'max-w-[78%] px-3.5 py-2 sm:max-w-[68%]',
                          isCurrentUser ? 'bg-[#ec5a13] text-white' : 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-gray-100',
                          'rounded-[20px]',
                          isCurrentUser
                            ? cn(!isFirstInGroup && 'rounded-tr-md', !isLastInGroup && 'rounded-br-md', isLastInGroup && 'rounded-br-md')
                            : cn(!isFirstInGroup && 'rounded-tl-md', !isLastInGroup && 'rounded-bl-md', isLastInGroup && 'rounded-bl-md'),
                          msg.postClosure && 'opacity-80'
                        )}
                      >
                        {msg.type === 'audio' ? (
                          <AudioPlayer audioUrl={msg.attachments?.[0] || ''} isCurrentUser={isCurrentUser} />
                        ) : (
                          <p className="whitespace-pre-wrap break-words text-[15px] leading-[21px]">{msg.content}</p>
                        )}
                        <span className={cn('mt-0.5 flex items-center justify-end gap-1 text-[11px]', isCurrentUser ? 'text-white/75' : 'text-gray-400')}>
                          {formatMessageTime(msg.timestamp)}
                          {isCurrentUser ? (
                            msg.read ? (
                              <CheckCheck className="h-[15px] w-[15px] text-amber-200" aria-label="Lu" />
                            ) : msg.delivered ? (
                              <CheckCheck className="h-[15px] w-[15px] text-white/90" aria-label="Distribué" />
                            ) : (
                              <Check className="h-[15px] w-[15px] text-white/50" aria-label="Envoyé" />
                            )
                          ) : null}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {peerTyping ? (
                <div className="mb-3 flex items-end gap-2">
                  <span className="w-8 shrink-0">
                    {peer.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sizedImage(peer.avatar, 64)} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-[11px] font-black text-gray-600">{getInitials(peerName)}</span>
                    )}
                  </span>
                  <div className="flex items-center gap-1.5 rounded-[20px] rounded-bl-md bg-white px-4 py-3.5 ring-1 ring-gray-100">
                    {[0, 150, 300].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Saisie */}
          <div className="border-t border-gray-100 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 sm:px-4">
            <div className="mx-auto max-w-3xl">
              {!isConnected ? (
                <p className="mb-2 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                  <WifiOff className="h-4 w-4 shrink-0" /> Connexion perdue, reconnexion en cours…
                </p>
              ) : null}
              {isOwnerClosureActive ? (
                <p className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  {isConversationSeller ? 'Vous avez clôturé cette discussion. Vos messages restent possibles.' : 'Le vendeur a clôturé cette discussion. Vous pouvez encore lui écrire.'}
                </p>
              ) : null}

              {isRecordingVoice ? (
                <VoiceRecorder onSendVoice={handleSendVoice} onCancel={handleCancelVoice} onStartRecording={handleStartRecording} onStopRecording={handleStopRecording} />
              ) : (
                <div className="flex items-end gap-2">
                  <textarea
                    ref={composerRef}
                    placeholder={isConnected ? 'Écrire un message…' : 'Reconnexion…'}
                    value={message}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyPress}
                    rows={1}
                    disabled={!isConnected}
                    className="max-h-40 min-h-[48px] flex-1 resize-none rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] leading-[22px] outline-none transition placeholder:text-gray-400 focus:border-[#ec5a13] focus:bg-white focus:ring-4 focus:ring-[#ec5a13]/10 disabled:opacity-60"
                  />
                  {message.trim() ? (
                    <button type="button" onClick={handleSendMessage} disabled={!isConnected} aria-label="Envoyer" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ec5a13] text-white shadow-[0_10px_24px_-10px_rgba(236,90,19,0.8)] transition hover:bg-[#d44f11] active:scale-95 disabled:opacity-50">
                      <Send className="h-5 w-5" />
                    </button>
                  ) : (
                    <button type="button" onClick={toggleVoiceMode} disabled={!isConnected} aria-label="Enregistrer un message vocal" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0b1020] text-white transition hover:bg-black active:scale-95 disabled:opacity-50">
                      <Mic className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
              <p className="mt-1.5 hidden text-[11px] text-gray-400 sm:block">Entrée pour envoyer · Maj + Entrée pour aller à la ligne</p>
            </div>
          </div>
        </section>

        {/* ── Panneau latéral (ordinateur) ── */}
        <aside className="hidden w-[320px] shrink-0 flex-col gap-4 overflow-y-auto lg:flex">
          {conversation.item ? (
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
              {conversation.item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sizedImage(conversation.item.image, 480)} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : null}
              <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{myRoleLabel}</p>
                <p className="mt-0.5 line-clamp-2 font-bold text-gray-900">{conversation.item.title}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-lg font-black text-gray-900">{formatPrice(conversation.item.price)}</p>
                  {itemStatus ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">{itemStatus}</span> : null}
                </div>
                {itemId ? (
                  <Link href={`/items/${itemId}`} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-gray-800 ring-1 ring-gray-200 transition hover:bg-gray-50">
                    <ExternalLink className="h-4 w-4" /> Voir l&apos;annonce
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Suivi de l'affaire */}
          <div className="rounded-3xl border border-gray-100 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-black text-gray-900"><Handshake className="h-4 w-4 text-[#ec5a13]" /> Suivi de l&apos;affaire</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {dealPill ? (
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', dealPill.cls)}><dealPill.icon className="h-3.5 w-3.5" /> {dealPill.label}</span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">En discussion</span>
              )}
              {isOwnerClosureActive ? <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600"><Lock className="h-3.5 w-3.5" /> Clôturée</span> : null}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              {dealStatus === 'open'
                ? isConversationSeller ? "Une fois la vente faite, marquez l'affaire comme conclue : l'acheteur confirmera." : "Le vendeur pourra marquer l'affaire comme conclue ; vous n'aurez qu'à confirmer."
                : dealStatus === 'pending_conclusion' ? 'En attente de confirmation.'
                  : dealStatus === 'concluded' ? 'Bravo ! Cette affaire compte dans les ventes conclues du vendeur.' : 'Cette affaire ne s\'est pas faite.'}
            </p>
            {isConversationSeller ? (
              <div className="mt-3 space-y-2">
                {dealStatus === 'open' ? (
                  <button type="button" disabled={dealActionLoading} onClick={() => handleDealAction('request')} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50">
                    <CheckCircle2 className="h-4 w-4" /> Marquer comme conclue
                  </button>
                ) : null}
                {dealStatus === 'concluded' || dealStatus === 'not_concluded' ? (
                  <button type="button" disabled={dealActionLoading} onClick={() => handleDealAction('reopen')} className="inline-flex h-10 w-full items-center justify-center rounded-full text-sm font-bold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:opacity-50">
                    Rouvrir l&apos;affaire
                  </button>
                ) : null}
                <button type="button" disabled={ownerClosureLoading} onClick={handleOwnerClosureAction} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:opacity-50">
                  {ownerClosureLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isOwnerClosureActive ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  {isOwnerClosureActive ? 'Rouvrir la discussion' : 'Clôturer la discussion'}
                </button>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-[linear-gradient(160deg,#f0fdf6,#ffffff)] p-4">
            <p className="flex items-center gap-2 text-sm font-black text-emerald-900"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Restez prudent</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-snug text-emerald-950/75">
              <li>• Ne payez jamais à l&apos;avance.</li>
              <li>• Rencontrez-vous dans un lieu public.</li>
              <li>• Ne partagez pas d&apos;informations bancaires.</li>
            </ul>
          </div>
        </aside>
      </div>
    </ChatShell>
  );
}

// Page plein écran : en-tête du site + zone de discussion qui occupe le reste de la hauteur
function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#f6f7fb]">
      <Suspense fallback={<div className="h-16 shrink-0 border-b border-gray-200 bg-white" />}>
        <Header />
      </Suspense>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
