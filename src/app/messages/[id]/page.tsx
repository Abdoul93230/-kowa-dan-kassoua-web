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
  Phone,
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
import { getMessages, getConversationById, markMessageAsRead as apiMarkMessageAsRead, markConversationAsRead, sendVoiceMessage } from '@/lib/api/messaging';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import VoiceRecorder from '@/components/VoiceRecorder';
import AudioPlayer from '@/components/AudioPlayer';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.id as string;
  const { user, token, loading: authLoading } = useAuth();
  const { isConnected, joinConversation, sendMessage: socketSendMessage, on, off, startTyping, stopTyping, markMessageAsRead: socketMarkAsRead } = useSocket({
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
            msg.id === messageId ? { ...msg, read: true } : msg
          )
        );
      }
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
    on('message:read', handleMessageRead);
    on('typing:start', handleTypingStart);
    on('typing:stop', handleTypingStop);

    return () => {
      off('message:new', handleNewMessage);
      off('message:read', handleMessageRead);
      off('typing:start', handleTypingStart);
      off('typing:stop', handleTypingStop);
    };
  }, [isConnected, conversationId, user, on, off, socketMarkAsRead]);

  useEffect(() => {
    // Scroll automatique vers le bas
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Hier ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'dd MMM HH:mm', { locale: fr });
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !conversation || !user) return;

    // Envoyer via Socket.IO
    socketSendMessage({
      conversationId: conversationId,
      content: message.trim(),
      type: 'text'
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
                     // Rediriger vers la page du vendeur si l'interlocuteur est le vendeur
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
                  {/* Badge vérifié seulement pour le seller */}
                  {otherParticipant.id === seller.id && seller.verified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCheck className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">
                    {otherParticipant.name}
                  </h2>
                  {/* Afficher rating et location seulement si c'est le seller */}
                  {otherParticipant.id === seller.id && (
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {seller.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {seller.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`tel:${seller.contactInfo.phone}`)}
                className="hover:bg-gray-100"
              >
                <Phone className="h-5 w-5 text-gray-700" />
              </Button>
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
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Carte du produit concerné */}
          {conversation.item && (
            <Card className="mb-4 p-4 bg-white shadow-md border-0 rounded-xl">
              {productDetails && productDetails.status !== 'active' && (
                <div className="mb-3 flex items-center gap-2 text-amber-800 bg-amber-100 p-2.5 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-xs font-medium">
                    {productDetails.status === 'sold' && 'Cette annonce a été vendue'}
                    {productDetails.status === 'expired' && 'Cette annonce n\'est plus disponible'}
                    {productDetails.status === 'pending' && 'Cette annonce est en attente de validation'}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4">
                <img
                  src={conversation.item.image}
                  alt={conversation.item.title}
                  className="w-16 h-16 object-cover rounded-lg shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">À propos de cette annonce</p>
                  <h3 className="font-semibold text-gray-900 truncate text-sm">
                    {conversation.item.title}
                  </h3>
                  <p className="text-base font-bold text-[#ec5a13] mt-1">
                    {conversation.item.price}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/items/${conversation.item?.id}`)}
                  className="flex-shrink-0 hover:bg-gray-100"
                >
                  <ExternalLink className="h-4 w-4 text-gray-700" />
                </Button>
              </div>
            </Card>
          )}

          {/* Messages */}
          <div className="space-y-1">
            {messages.map((msg, index) => {
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
              
              // Vérifier si le message précédent est du même expéditeur
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
              const isSameSenderAsPrev = prevMsg && prevMsg.senderId === msg.senderId;
              const isSameSenderAsNext = nextMsg && nextMsg.senderId === msg.senderId;
              
              // Déterminer le style de la bulle selon la position dans le groupe
              const isFirstInGroup = !isSameSenderAsPrev;
              const isLastInGroup = !isSameSenderAsNext;
              
              // Afficher l'avatar seulement pour le dernier message d'un groupe
              const showAvatar = !isCurrentUser && isLastInGroup;

              return (
                <div
                  key={msg.id}
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
                                <CheckCheck className="h-4 w-4 text-white" />
                              ) : (
                                <Check className="h-4 w-4 text-white/70" />
                              )}
                            </>
                          )}
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
