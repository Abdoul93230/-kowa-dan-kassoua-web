'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  MessageSquare,
  Search,
  ArrowLeft,
  ShoppingBag,
  CheckCheck,
  Clock,
  MoreVertical,
  Archive,
  Trash2,
  Loader2,
  WifiOff
} from 'lucide-react';
import { Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { getConversations } from '@/lib/api/messaging';

export default function MessagesPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Socket.IO pour les mises à jour en temps réel
  const { isConnected, on, off, isUserOnline } = useSocket({
    enabled: !!token,
    token: token || undefined
  });

  // Charger les conversations initiales
  useEffect(() => {
    // Attendre que l'authentification soit vérifiée
    if (authLoading) return;
    
    if (!user || !token) {
      router.push('/login');
      return;
    }

    const loadConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getConversations();
        setConversations(response.data);
      } catch (err: any) {
        console.error('❌ Erreur chargement conversations:', err);
        setError(err.response?.data?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user, token, router, authLoading]);

  // Écouter les mises à jour en temps réel
  useEffect(() => {
    if (!isConnected) return;

    const handleConversationUpdate = (data: any) => {
      console.log('📬 Conversation mise à jour:', data);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === data.conversationId
            ? { ...conv, lastMessage: data.lastMessage, unreadCount: data.unreadCount }
            : conv
        )
      );
    };

    on('conversation:updated', handleConversationUpdate);

    return () => {
      off('conversation:updated', handleConversationUpdate);
    };
  }, [isConnected, on, off]);

  // Obtenir l'autre participant dans une conversation
  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return conversation.participants.seller;
    
    // Si l'utilisateur actuel est le buyer, retourner le seller
    if (conversation.participants.buyer.id === user.id) {
      return conversation.participants.seller;
    }
    // Sinon, retourner le buyer
    return conversation.participants.buyer;
  };

  // Filtrer les conversations par recherche
  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = getOtherParticipant(conv);
    const participantName = otherParticipant.name.toLowerCase();
    const itemTitle = conv.item?.title.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return participantName.includes(query) || itemTitle.includes(query);
  });

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: fr 
      });
    } catch {
      return timestamp;
    }
  };

  const handleOpenConversation = (convId: string) => {
    router.push(`/messages/${convId}`);
  };

  const getTotalUnread = () => {
    return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  };

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center">
          <Loader2 className="h-12 w-12 text-[#ec5a13] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des conversations...</p>
        </Card>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <WifiOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#ec5a13] hover:bg-[#d94f0f]"
          >
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-[#ec5a13]" />
                <span className="text-xl font-bold text-gray-900">MarketHub</span>
              </div>
            </div>
            {/* Indicateur de connexion Socket */}
            {isConnected && (
              <Badge variant="outline" className="border-green-500 text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                En ligne
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* En-tête de la page */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-[#ec5a13]" />
                Messages
              </h1>
              <p className="text-gray-600 mt-1">
                {getTotalUnread() > 0
                  ? `Vous avez ${getTotalUnread()} message${getTotalUnread() > 1 ? 's' : ''} non lu${getTotalUnread() > 1 ? 's' : ''}`
                  : 'Toutes vos conversations'
                }
              </p>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des conversations */}
        {filteredConversations.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Aucune conversation trouvée' : 'Aucun message'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? 'Essayez avec d\'autres mots-clés'
                  : 'Commencez à explorer les annonces et contactez les vendeurs'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => router.push('/')}
                  className="bg-[#ec5a13] hover:bg-[#d94f0f]"
                >
                  Explorer les annonces
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isVerified = 'verified' in otherParticipant && (otherParticipant as any).verified;
              
              return (
              <Card
                key={conversation.id}
                className={`p-4 hover:shadow-md transition-all cursor-pointer border-2 ${
                  conversation.unreadCount > 0
                    ? 'border-[#ec5a13]/30 bg-[#ffe9de]/10'
                    : 'border-transparent'
                }`}
                onClick={() => handleOpenConversation(conversation.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar de l'interlocuteur */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-14 w-14">
                      {otherParticipant.avatar ? (
                        <img
                          src={otherParticipant.avatar}
                          alt={otherParticipant.name}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#ec5a13] to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                          {otherParticipant.name.charAt(0)}
                        </div>
                      )}
                    </Avatar>
                    {/* Indicateur de présence en ligne */}
                    <div 
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                        isUserOnline(otherParticipant.id)
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      }`}
                      title={isUserOnline(otherParticipant.id) ? 'En ligne' : 'Hors ligne'}
                    />
                  </div>

                  {/* Contenu de la conversation */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherParticipant.name}
                          </h3>
                          {isVerified && (
                            <span title="Vendeur vérifié">
                              <CheckCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                        {conversation.item && (
                          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3" />
                            {conversation.item.title}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-[#ec5a13] hover:bg-[#d94f0f] text-white">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Dernier message */}
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm flex-1 truncate ${
                          conversation.unreadCount > 0
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        {conversation.lastMessage.senderId === user?.id && (
                          <span className="text-gray-400 mr-1">Vous:</span>
                        )}
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.lastMessage.read &&
                        conversation.lastMessage.senderId === user?.id && (
                          <CheckCheck className="h-4 w-4 text-[#ec5a13] flex-shrink-0" />
                        )}
                    </div>

                    {/* Aperçu du produit */}
                    {conversation.item && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <img
                          src={conversation.item.image}
                          alt={conversation.item.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 truncate">
                            {conversation.item.title}
                          </p>
                          <p className="text-xs font-semibold text-[#ec5a13]">
                            {conversation.item.price}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
              );
            })}
          </div>
        )}

        {/* Aide rapide */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-[#ffe9de]/50 to-orange-50/50 border border-[#ec5a13]/20">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Conseils pour bien communiquer</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[#ec5a13] mt-0.5">•</span>
              <span>Soyez poli et respectueux dans vos échanges</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ec5a13] mt-0.5">•</span>
              <span>Posez des questions précises sur le produit ou service</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ec5a13] mt-0.5">•</span>
              <span>Convenez d'un lieu public pour les échanges en personne</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ec5a13] mt-0.5">•</span>
              <span>Ne partagez jamais d'informations bancaires par message</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
