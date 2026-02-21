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
  AlertCircle
} from 'lucide-react';
import { mockConversations, mockMessages } from '@/lib/mockData';
import { Message, Conversation, Item } from '@/types';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { markConversationAsRead } from '@/lib/utilitis/conversationUtils';
import { getProductById } from '@/lib/api/products';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.id as string;
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [productDetails, setProductDetails] = useState<Item | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Charger la conversation
    const conv = mockConversations.find((c) => c.id === conversationId);
    if (conv) {
      setConversation(conv);
      const existingMessages = mockMessages[conversationId] || [];
      
      // Si c'est une nouvelle conversation (pas de messages), ajouter un message de bienvenue
      if (existingMessages.length === 0 && conv.item) {
        const welcomeMessage: Message = {
          id: `msg_welcome_${Date.now()}`,
          conversationId: conversationId,
          senderId: conv.participants.seller.id,
          senderName: conv.participants.seller.name,
          senderAvatar: conv.participants.seller.avatar,
          content: `Bonjour ! Je suis ${conv.participants.seller.name}. Je vois que vous êtes intéressé(e) par "${conv.item.title}". N'hésitez pas à me poser vos questions, je serai ravi(e) de vous répondre ! 😊`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'text'
        };
        mockMessages[conversationId] = [welcomeMessage];
        setMessages([welcomeMessage]);
      } else {
        setMessages(existingMessages);
      }
      
      // Marquer la conversation comme lue
      markConversationAsRead(conversationId);

      // Charger les détails complets du produit si disponible
      if (conv.item) {
        const loadProduct = async () => {
          try {
            const response = await getProductById(String(conv.item!.id));
            setProductDetails(response.data);
          } catch (error) {
            console.error('❌ Erreur chargement produit:', error);
          }
        };
        loadProduct();
      }
    }
  }, [conversationId]);

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
    if (!message.trim() || !conversation) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId: conversationId,
      senderId: 'user_current',
      senderName: 'Vous',
      content: message,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simuler une réponse du vendeur après 2-3 secondes
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const sellerResponse: Message = {
        id: `msg_${Date.now() + 1}`,
        conversationId: conversationId,
        senderId: conversation.participants.seller.id,
        senderName: conversation.participants.seller.name,
        senderAvatar: conversation.participants.seller.avatar,
        content: 'Merci pour votre message ! Je vous réponds dans quelques instants.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text'
      };
      setMessages((prev) => [...prev, sellerResponse]);
    }, 2500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header de la conversation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              {/* Info vendeur */}
              <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                   onClick={() => router.push(`/seller/${seller.id}`)}>
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    {seller.avatar ? (
                      <img src={seller.avatar} alt={seller.name} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#ec5a13] to-orange-600 flex items-center justify-center text-white font-bold">
                        {seller.name.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  {seller.verified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCheck className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">
                    {seller.name}
                  </h2>
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
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${seller.contactInfo.phone}`)}
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/seller/${seller.id}`)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Carte du produit concerné */}
          {conversation.item && (
            <Card className="mb-6 p-4 bg-gradient-to-r from-[#ffe9de]/30 to-orange-50/30 border-[#ec5a13]/20">
              {productDetails && productDetails.status !== 'active' && (
                <div className="mb-3 flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
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
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 mb-1">À propos de cette annonce</p>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conversation.item.title}
                  </h3>
                  <p className="text-lg font-bold text-[#ec5a13]">
                    {conversation.item.price}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/items/${conversation.item?.id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === 'user_current';
              const showAvatar = !isCurrentUser && (
                index === 0 || messages[index - 1].senderId !== msg.senderId
              );

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-8">
                    {showAvatar && !isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt={msg.senderName} />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                            {msg.senderName.charAt(0)}
                          </div>
                        )}
                      </Avatar>
                    )}
                  </div>

                  {/* Bulle de message */}
                  <div
                    className={`max-w-[70%] ${
                      isCurrentUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isCurrentUser
                          ? 'bg-[#ec5a13] text-white rounded-br-none'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                    
                    {/* Heure et statut */}
                    <div
                      className={`flex items-center gap-1 mt-1 px-2 ${
                        isCurrentUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                      {isCurrentUser && (
                        <>
                          {msg.read ? (
                            <CheckCheck className="h-3 w-3 text-[#ec5a13]" />
                          ) : (
                            <Check className="h-3 w-3 text-gray-400" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Indicateur "En train d'écrire..." */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <Avatar className="h-8 w-8">
                  {seller.avatar ? (
                    <img src={seller.avatar} alt={seller.name} />
                  ) : (
                    <div className="w-full h-full bg-gray-300" />
                  )}
                </Avatar>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex gap-1">
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
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Textarea
                placeholder="Écrivez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[50px] max-h-[150px] resize-none"
                rows={1}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-[#ec5a13] hover:bg-[#d94f0f] h-[50px] px-6"
              size="lg"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Appuyez sur Entrée pour envoyer • Shift + Entrée pour une nouvelle ligne
          </p>
        </div>
      </div>
    </div>
  );
}
