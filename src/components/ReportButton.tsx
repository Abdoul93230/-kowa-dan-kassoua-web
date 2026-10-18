'use client';

// Bouton « Signaler cette annonce » + fenêtre de choix du motif.
// Connexion requise : un visiteur est invité à se connecter d'abord.
import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { REPORT_REASONS, reportProduct, type ReportReason } from '@/lib/api/reports';

export function ReportButton({
  productId,
  isAuthenticated,
  onRequireAuth,
}: {
  productId: string;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);

  const start = () => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    setReason('');
    setDetails('');
    setOpen(true);
  };

  const submit = async () => {
    if (!reason || sending) return;
    setSending(true);
    try {
      const res = await reportProduct(productId, reason, details.trim());
      setOpen(false);
      toast.success(res.message || 'Merci ! Notre équipe va examiner cette annonce.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="mx-auto flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 transition hover:border-red-300 hover:text-red-600"
      >
        <Flag className="h-4 w-4" />
        Signaler cette annonce
      </button>

      <Dialog open={open} onOpenChange={(v) => !sending && setOpen(v)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Signaler l&apos;annonce</DialogTitle>
            <DialogDescription>Qu&apos;est-ce qui ne va pas ? Votre signalement reste anonyme pour l&apos;annonceur.</DialogDescription>
          </DialogHeader>

          <div role="radiogroup" aria-label="Motif du signalement" className="grid gap-2">
            {REPORT_REASONS.map((r) => {
              const active = reason === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setReason(r.value)}
                  className={`flex items-center justify-between rounded-xl border-[1.5px] px-4 py-3 text-left text-sm font-medium transition ${
                    active ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-800 hover:border-gray-300'
                  }`}
                >
                  {r.label}
                  <span className={`h-4 w-4 rounded-full border-2 ${active ? 'border-red-500 bg-red-500 shadow-[inset_0_0_0_2px_white]' : 'border-gray-300'}`} />
                </button>
              );
            })}
          </div>

          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value.slice(0, 500))}
            placeholder="Précisions (facultatif)"
            rows={3}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>Annuler</Button>
            <Button onClick={submit} disabled={!reason || sending} className="bg-red-600 text-white hover:bg-red-700">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Envoyer le signalement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
