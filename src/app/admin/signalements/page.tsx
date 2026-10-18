'use client';

// Espace admin : annonces signalées, regroupées par annonce (les plus signalées d'abord).
// Accès réservé au rôle « admin » (vérifié par le backend).
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ShieldCheck, Trash2, Undo2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { AdminShell } from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getReports, handleReports, type ReportedListing } from '@/lib/api/reports';
import { formatPriceFCFA } from '@/lib/utils';
import { sizedImage } from '@/lib/format';

type Tab = 'open' | 'resolved' | 'dismissed';
const TABS: { value: Tab; label: string }[] = [
  { value: 'open', label: 'À traiter' },
  { value: 'resolved', label: 'Annonces retirées' },
  { value: 'dismissed', label: 'Rejetés' },
];

const STATUS_LABEL: Record<string, string> = {
  active: 'En ligne',
  pending: 'Masquée (en attente)',
  expired: 'Retirée',
  sold: 'Vendue',
};

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('open');
  const [items, setItems] = useState<ReportedListing[]>([]);
  const [threshold, setThreshold] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getReports(tab);
      setItems(res.data || []);
      setThreshold(res.hideThreshold || 3);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (user?.role === 'admin') load();
  }, [user, load]);

  const decide = async (productId: string, action: 'remove' | 'dismiss') => {
    setBusy(productId);
    try {
      await handleReports(productId, action);
      setItems((prev) => prev.filter((i) => i.product._id !== productId));
      toast.success(action === 'remove' ? 'Annonce retirée' : 'Signalements rejetés, annonce rétablie');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell
      title="Signalements"
      subtitle={`Une annonce est masquée automatiquement après ${threshold} signalements, en attendant votre décision.`}
    >
        <div className="mb-6 flex gap-2 overflow-x-auto" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.value ? 'bg-[#ec5a13] text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#ec5a13]" /></div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-green-600" />
            <p className="font-semibold text-gray-900">Rien à signaler</p>
            <p className="text-sm text-gray-500">Aucune annonce dans cette liste.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map(({ product, seller, reports }) => (
              <article key={product._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex gap-4">
                  {product.mainImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sizedImage(product.mainImage, 96)} alt="" className="h-20 w-20 flex-shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-gray-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
                        {reports.length} signalement{reports.length > 1 ? 's' : ''}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                        {STATUS_LABEL[product.status] || product.status}
                      </span>
                    </div>
                    <h2 className="mt-1 truncate font-semibold text-gray-900">{product.title}</h2>
                    <p className="text-sm font-bold text-[#ec5a13]">{formatPriceFCFA(product.price || '0')}</p>
                    <p className="text-xs text-gray-500">
                      Vendeur : {seller?.name || '—'} {seller?.phone || seller?.email ? `· ${seller?.phone || seller?.email}` : ''}
                    </p>
                  </div>
                  <Link href={`/items/${product._id}`} target="_blank" className="self-start text-gray-400 hover:text-[#ec5a13]" aria-label="Voir l'annonce">
                    <ExternalLink className="h-5 w-5" />
                  </Link>
                </div>

                <ul className="mt-4 grid gap-2">
                  {reports.map((r) => (
                    <li key={r.id} className="rounded-xl bg-gray-50 px-3 py-2 text-sm">
                      <span className="font-semibold text-gray-900">{r.reasonLabel}</span>
                      <span className="text-gray-500"> · {r.reporter?.name || 'Utilisateur'} · {new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                      {r.details ? <p className="mt-1 text-gray-700">« {r.details} »</p> : null}
                    </li>
                  ))}
                </ul>

                {tab === 'open' && (
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button variant="outline" disabled={busy === product._id} onClick={() => decide(product._id, 'dismiss')}>
                      <Undo2 className="mr-1.5 h-4 w-4" /> Rejeter et rétablir
                    </Button>
                    <Button disabled={busy === product._id} onClick={() => decide(product._id, 'remove')} className="bg-red-600 text-white hover:bg-red-700">
                      {busy === product._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="mr-1.5 h-4 w-4" /> Retirer l&apos;annonce</>}
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
    </AdminShell>
  );
}
