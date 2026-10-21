'use client';

// Liste des conversations — même présentation que l'app mobile (filtres, regroupement par période)
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Check, CheckCheck, CheckCircle2, Hourglass, Image as ImageIcon, LogIn, MessageCircle, Mic, Search,
  ShieldCheck, Tag, WifiOff, XCircle, Lock,
} from 'lucide-react';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { Conversation } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useQuickAuth } from '@/contexts/QuickAuthContext';
import { useSocket } from '@/hooks/useSocket';
import { getConversations } from '@/lib/api/messaging';
import { formatPrice, getInitials, sizedImage } from '@/lib/format';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'unread' | 'buying' | 'selling';

const fold = (v: unknown) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const DAY = 86400000;
const WEEKDAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function dayBucket(value?: string) {
  const d = new Date(value || 0);
  if (Number.isNaN(d.getTime())) return 'Plus ancien';
  const diff = (startOfDay(new Date()) - startOfDay(d)) / DAY;
  if (diff <= 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff < 7) return 'Cette semaine';
  if (diff < 31) return 'Ce mois-ci';
  return 'Plus ancien';
}

// « à l'instant », 14:05, Hier, lun., 2 juil., 2 juil. 2025
function smartTime(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  if (now.getTime() - d.getTime() < 60000) return "à l'instant";
  const diff = (startOfDay(now) - startOfDay(d)) / DAY;
  if (diff <= 0) return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (diff === 1) return 'Hier';
  if (diff < 7) return WEEKDAYS[d.getDay()];
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return d.getFullYear() === now.getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

function previewOf(last?: Conversation['lastMessage']) {
  if (!last) return { icon: null, text: 'Nouvelle conversation, dites bonjour !' };
  const content = String(last.content || '').replace(/^🎤\s*/, '');
  switch (last.type) {
    case 'audio': return { icon: Mic, text: 'Message vocal' };
    case 'image': return { icon: ImageIcon, text: content && !/^https?:/.test(content) ? content : 'Photo' };
    case 'offer': return { icon: Tag, text: content || 'Offre de prix' };
    default: return { icon: null, text: content || 'Message' };
  }
}

const DEAL: Record<string, { label: string; icon: typeof Check; cls: string }> = {
  pending_conclusion: { label: 'En attente', icon: Hourglass, cls: 'bg-amber-50 text-amber-700' },
  concluded: { label: 'Conclue', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700' },
  not_concluded: { label: 'Non conclue', icon: XCircle, cls: 'bg-red-50 text-red-600' },
};

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
        <Header />
      </Suspense>
      {children}
      <Footer />
    </div>
  );
}

function Band({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#060a14_0%,#10172b_60%,#2a1307_100%)]">
      <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(236,90,19,0.38),transparent)]" />
      <div className="container mx-auto max-w-4xl px-4 pb-6 pt-8 sm:pt-10">{children}</div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 animate-pulse rounded-full bg-gray-200" />
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-gray-100" />
      </div>
      <div className="hidden h-12 w-12 animate-pulse rounded-xl bg-gray-100 sm:block" />
    </div>
  );
}

export default function MessagesPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { openQuickAuth } = useQuickAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Socket.IO pour les mises à jour en temps réel
  const { isConnected, on, off, isUserOnline } = useSocket({
    enabled: !!token,
    token: token || undefined
  });

  // Charger les conversations initiales
  useEffect(() => {
    if (authLoading || !user || !token) return;

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
  }, [user, token, authLoading, reloadKey]);

  // Écouter les mises à jour en temps réel
  useEffect(() => {
    if (!isConnected) return;

    const handleConversationUpdate = (data: any) => {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === data.conversationId
            ? { ...conv, lastMessage: data.lastMessage || conv.lastMessage, unreadCount: typeof data.unreadCount === 'number' ? data.unreadCount : conv.unreadCount, status: data.status || conv.status, closedByOwner: typeof data.closedByOwner === 'boolean' ? data.closedByOwner : conv.closedByOwner, closedAt: data.closedAt || conv.closedAt || null, closedById: data.closedById || conv.closedById || null, deal: data.deal || conv.deal }
            : conv
        )
      );
    };

    const markLastMessage = (data: any, patch: (last: Conversation['lastMessage']) => Conversation['lastMessage']) => {
      const payloadConversationId = String(data?.conversationId || '');
      const payloadMessageId = String(data?.messageId || '');
      if (!payloadConversationId || !payloadMessageId) return;
      setConversations((prev) =>
        prev.map((conv) => {
          if (String(conv.id) !== payloadConversationId) return conv;
          const lastMessageId = String(conv?.lastMessage?.id || '');
          if (!lastMessageId || lastMessageId !== payloadMessageId) return conv;
          return { ...conv, lastMessage: patch(conv.lastMessage) };
        })
      );
    };

    const handleMessageDelivered = (data: any) =>
      markLastMessage(data, (last) => ({ ...last, delivered: true, deliveredAt: data?.deliveredAt || last?.deliveredAt }));
    const handleMessageRead = (data: any) =>
      markLastMessage(data, (last) => ({ ...last, delivered: true, read: true, readAt: data?.readAt || last?.readAt }));

    on('conversation:updated', handleConversationUpdate);
    on('message:delivered', handleMessageDelivered);
    on('message:read', handleMessageRead);

    return () => {
      off('conversation:updated', handleConversationUpdate);
      off('message:delivered', handleMessageDelivered);
      off('message:read', handleMessageRead);
    };
  }, [isConnected, on, off]);

  // Obtenir l'autre participant dans une conversation
  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return conversation.participants.seller;
    return conversation.participants.buyer.id === user.id ? conversation.participants.seller : conversation.participants.buyer;
  };
  const roleOf = (conv: Conversation) => (conv.participants?.buyer?.id === user?.id ? 'buyer' : 'seller');

  const counts = useMemo(() => ({
    all: conversations.length,
    unread: conversations.filter((c) => c.unreadCount > 0).length,
    buying: conversations.filter((c) => roleOf(c) === 'buyer').length,
    selling: conversations.filter((c) => roleOf(c) === 'seller').length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [conversations, user?.id]);
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // Filtre + recherche, plus récentes d'abord, regroupées par période
  const groups = useMemo(() => {
    const q = fold(searchQuery).trim();
    const visible = conversations
      .filter((conv) => {
        if (filter === 'unread' && !(conv.unreadCount > 0)) return false;
        if (filter === 'buying' && roleOf(conv) !== 'buyer') return false;
        if (filter === 'selling' && roleOf(conv) !== 'seller') return false;
        if (!q) return true;
        const peer = getOtherParticipant(conv) as { name?: string; businessName?: string };
        return fold(`${peer?.businessName || ''} ${peer?.name || ''} ${conv.item?.title || ''} ${conv.lastMessage?.content || ''}`).includes(q);
      })
      .sort((a, b) => new Date(b.lastMessage?.timestamp || b.updatedAt).getTime() - new Date(a.lastMessage?.timestamp || a.updatedAt).getTime());
    const out: { label: string; items: Conversation[] }[] = [];
    visible.forEach((conv) => {
      const label = dayBucket(conv.lastMessage?.timestamp || conv.updatedAt);
      if (out[out.length - 1]?.label !== label) out.push({ label, items: [] });
      out[out.length - 1].items.push(conv);
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, filter, searchQuery, user?.id]);

  // ─── Visiteur non connecté ────────────────────────────────────────────────
  if (!authLoading && (!user || !token)) {
    return (
      <PageShell>
        <Band>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Messages</h1>
          <p className="mt-1 text-sm text-white/60">Discutez avec les vendeurs et les acheteurs, sans donner votre numéro.</p>
        </Band>
        <div className="container mx-auto max-w-4xl px-4 pb-16 pt-8">
          <div className="mx-auto max-w-xl rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] sm:p-10">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[linear-gradient(135deg,#ff8a4c,#ec5a13)] text-white shadow-[0_18px_40px_-14px_rgba(236,90,19,0.8)]">
              <MessageCircle className="h-10 w-10" />
            </span>
            <h2 className="mt-6 text-2xl font-black tracking-tight text-gray-900">Vos conversations vous attendent</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-gray-500">Connectez-vous pour écrire aux annonceurs et suivre vos achats et vos ventes.</p>
            <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-gray-700">
              {[
                { icon: Lock, text: 'Votre numéro de téléphone reste privé' },
                { icon: Mic, text: 'Messages écrits et vocaux, en direct' },
                { icon: CheckCheck, text: 'Suivez vos achats et vos ventes au même endroit' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
                  <Icon className="h-4 w-4 shrink-0 text-[#ec5a13]" /> {text}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => openQuickAuth('/messages')}
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-[#ec5a13] px-6 text-[15px] font-bold text-white shadow-[0_14px_30px_-12px_rgba(236,90,19,0.75)] transition hover:bg-[#d44f11]"
            >
              <LogIn className="h-5 w-5" /> Se connecter
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  const busy = authLoading || loading;
  const FILTERS: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'Toutes', count: counts.all },
    { value: 'unread', label: 'Non lues', count: counts.unread },
    { value: 'buying', label: 'Mes achats', count: counts.buying },
    { value: 'selling', label: 'Mes ventes', count: counts.selling },
  ];

  return (
    <PageShell>
      <Band>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Messages</h1>
            <p className="mt-1 text-sm text-white/60">
              {busy ? 'Chargement…' : error ? 'Messagerie indisponible pour le moment' : totalUnread > 0 ? `${totalUnread} message${totalUnread > 1 ? 's' : ''} non lu${totalUnread > 1 ? 's' : ''}` : 'Vous êtes à jour'}
            </p>
          </div>
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1', isConnected ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/30' : 'bg-white/5 text-white/50 ring-white/10')}>
            <span className={cn('h-2 w-2 rounded-full', isConnected ? 'animate-pulse bg-emerald-400' : 'bg-white/40')} />
            {isConnected ? 'En direct' : 'Connexion…'}
          </span>
        </div>

        <label className="relative mt-6 block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un nom, une annonce, un message"
            className="h-12 w-full rounded-full bg-white/10 pl-11 pr-4 text-[15px] text-white outline-none ring-1 ring-white/15 placeholder:text-white/45 focus:bg-white/15 focus:ring-white/30"
          />
        </label>

        <div role="tablist" aria-label="Filtrer les conversations" className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.value)}
                className={cn('inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition', active ? 'bg-white text-gray-900' : 'bg-white/10 text-white/75 hover:bg-white/15 hover:text-white')}
              >
                {f.label}
                {f.count > 0 ? (
                  <span className={cn('rounded-full px-1.5 text-xs', active ? (f.value === 'unread' ? 'bg-[#ec5a13] text-white' : 'bg-gray-100 text-gray-600') : f.value === 'unread' ? 'bg-[#ec5a13] text-white' : 'bg-white/15')}>
                    {f.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Band>

      <div className="container mx-auto max-w-4xl px-4 pb-16 pt-6">
        {busy ? (
          <div className="divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-100 bg-white">
            {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500"><WifiOff className="h-7 w-7" /></span>
            <p className="mt-4 text-lg font-black text-gray-900">Impossible de charger vos messages</p>
            <p className="mt-1 text-sm text-gray-500">Vérifiez votre connexion internet puis réessayez.</p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="mt-5 inline-flex h-11 items-center rounded-full bg-[#ec5a13] px-5 text-sm font-bold text-white transition hover:bg-[#d44f11]">
              Réessayer
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ec5a13]"><MessageCircle className="h-8 w-8" /></span>
            {conversations.length === 0 ? (
              <>
                <p className="mt-5 text-xl font-black tracking-tight text-gray-900">Pas encore de conversation</p>
                <p className="mx-auto mt-1.5 max-w-sm text-[15px] text-gray-500">Une annonce vous intéresse ? Écrivez à l&apos;annonceur depuis sa page : la discussion apparaîtra ici.</p>
                <Link href="/categories/tous" className="mt-6 inline-flex h-11 items-center rounded-full bg-[#ec5a13] px-5 text-sm font-bold text-white transition hover:bg-[#d44f11]">
                  Explorer les annonces
                </Link>
              </>
            ) : (
              <>
                <p className="mt-5 text-lg font-black text-gray-900">
                  {searchQuery ? 'Aucun résultat' : filter === 'unread' ? 'Tout est lu' : filter === 'buying' ? 'Aucun achat en cours' : 'Aucune vente en cours'}
                </p>
                <p className="mt-1 text-sm text-gray-500">{searchQuery ? 'Essayez avec un autre mot.' : 'Les conversations correspondantes apparaîtront ici.'}</p>
                <button type="button" onClick={() => { setSearchQuery(''); setFilter('all'); }} className="mt-4 text-sm font-bold text-[#ec5a13] hover:underline">
                  Voir toutes les conversations
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.label}>
                <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">{group.label}</h2>
                <ul className="divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
                  {group.items.map((conversation) => {
                    const peer = getOtherParticipant(conversation) as { id: string; name: string; avatar?: string; businessName?: string; verified?: boolean };
                    const peerName = peer.businessName || peer.name || 'Utilisateur';
                    const unread = conversation.unreadCount > 0;
                    const mine = conversation.lastMessage?.senderId === user?.id;
                    const preview = previewOf(conversation.lastMessage);
                    const PreviewIcon = preview.icon;
                    const deal = DEAL[conversation.deal?.status || ''];
                    const online = isUserOnline(peer.id);
                    const isBuyer = roleOf(conversation) === 'buyer';

                    return (
                      <li key={conversation.id}>
                        <Link
                          href={`/messages/${conversation.id}`}
                          className={cn('group flex items-center gap-3 px-4 py-3.5 transition hover:bg-gray-50 sm:gap-4 sm:px-5', unread && 'bg-[#fff8f4] hover:bg-[#fff1e8]')}
                        >
                          {/* Avatar */}
                          <span className="relative shrink-0">
                            {peer.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={sizedImage(peer.avatar, 96)} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                            ) : (
                              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ff8a4c,#ec5a13)] text-base font-black text-white">{getInitials(peerName)}</span>
                            )}
                            {online ? <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500" title="En ligne" /> : null}
                          </span>

                          {/* Texte */}
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className={cn('truncate text-[15px] text-gray-900', unread ? 'font-black' : 'font-bold')}>{peerName}</span>
                              {peer.verified ? <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" aria-label="Vérifié" /> : null}
                              <span className={cn('ml-auto shrink-0 text-xs', unread ? 'font-bold text-[#ec5a13]' : 'text-gray-400')}>
                                {smartTime(conversation.lastMessage?.timestamp || conversation.updatedAt)}
                              </span>
                            </span>

                            {conversation.item ? (
                              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                                <span className={cn('shrink-0 rounded px-1.5 py-px text-[10px] font-bold uppercase tracking-wide', isBuyer ? 'bg-blue-50 text-blue-600' : 'bg-[#fff1e8] text-[#c2410c]')}>
                                  {isBuyer ? 'Achat' : 'Vente'}
                                </span>
                                <span className="truncate">{conversation.item.title}</span>
                              </span>
                            ) : null}

                            <span className="mt-1 flex items-center gap-1.5">
                              {mine ? (
                                conversation.lastMessage.read ? (
                                  <CheckCheck className="h-4 w-4 shrink-0 text-[#ec5a13]" aria-label="Lu" />
                                ) : conversation.lastMessage.delivered ? (
                                  <CheckCheck className="h-4 w-4 shrink-0 text-gray-400" aria-label="Distribué" />
                                ) : (
                                  <Check className="h-4 w-4 shrink-0 text-gray-400" aria-label="Envoyé" />
                                )
                              ) : null}
                              {PreviewIcon ? <PreviewIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" /> : null}
                              <span className={cn('truncate text-sm', unread ? 'font-semibold text-gray-900' : 'text-gray-500')}>
                                {mine ? <span className="text-gray-400">Vous : </span> : null}
                                {preview.text}
                              </span>
                              {unread ? (
                                <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#ec5a13] px-1.5 text-[11px] font-black text-white">
                                  {conversation.unreadCount}
                                </span>
                              ) : null}
                            </span>

                            {deal || conversation.closedByOwner ? (
                              <span className="mt-1.5 flex flex-wrap gap-1.5">
                                {deal ? (
                                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold', deal.cls)}>
                                    <deal.icon className="h-3 w-3" /> {deal.label}
                                  </span>
                                ) : null}
                                {conversation.closedByOwner ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">
                                    <Lock className="h-3 w-3" /> Clôturée
                                  </span>
                                ) : null}
                              </span>
                            ) : null}
                          </span>

                          {/* Annonce */}
                          {conversation.item ? (
                            <span className="hidden shrink-0 text-right sm:block">
                              {conversation.item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={sizedImage(conversation.item.image, 96)} alt="" className="ml-auto h-12 w-12 rounded-xl object-cover" />
                              ) : null}
                              <span className="mt-1 block max-w-[96px] truncate text-[11px] font-bold text-gray-700">{formatPrice(conversation.item.price)}</span>
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            <p className="flex items-center justify-center gap-2 pt-2 text-center text-xs text-gray-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Ne payez jamais à l&apos;avance et ne partagez pas d&apos;informations bancaires par message.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
