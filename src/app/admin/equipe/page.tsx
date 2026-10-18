'use client';

// Équipe d'administration : inviter un admin (accès envoyés par e-mail),
// lui renvoyer un mot de passe, ou lui retirer ses droits.
import { useCallback, useEffect, useState } from 'react';
import { KeyRound, Loader2, Mail, UserMinus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { AdminShell } from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { getAdmins, inviteAdmin, resetAdminPassword, revokeAdmin, type AdminAccount } from '@/lib/api/admin';

export default function AdminTeamPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [me, setMe] = useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [inviting, setInviting] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await getAdmins();
      setAdmins(res.data);
      setMe(res.me);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') load();
  }, [user, load]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || inviting) return;
    setInviting(true);
    try {
      const res = await inviteAdmin(email.trim(), name.trim());
      toast.success(res.message);
      setEmail('');
      setName('');
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setInviting(false);
    }
  };

  const resend = async (a: AdminAccount) => {
    setBusy(a.id);
    try {
      toast.success((await resetAdminPassword(a.id)).message);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const revoke = async (a: AdminAccount) => {
    setBusy(a.id);
    try {
      toast.success((await revokeAdmin(a.id)).message);
      setAdmins((prev) => prev.filter((x) => x.id !== a.id));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
      setConfirmRevoke(null);
    }
  };

  return (
    <AdminShell title="Équipe admin" subtitle="Les accès sont envoyés par e-mail. Chaque administrateur choisit son mot de passe à la première connexion.">
      <form onSubmit={invite} className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
          <UserPlus className="h-5 w-5 text-[#ec5a13]" /> Inviter un administrateur
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="admin-email" className="mb-1.5 block text-sm">Adresse e-mail</Label>
            <Input id="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@exemple.com" />
          </div>
          <div>
            <Label htmlFor="admin-name" className="mb-1.5 block text-sm">Nom <span className="font-normal text-gray-500">(facultatif)</span></Label>
            <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom Nom" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500">Un mot de passe temporaire sera envoyé à cette adresse.</p>
          <Button type="submit" disabled={inviting || !email.trim()} className="bg-[#ec5a13] text-white hover:bg-[#d94f0f]">
            {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Mail className="mr-1.5 h-4 w-4" /> Envoyer l&apos;invitation</>}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-[#ec5a13]" /></div>
      ) : (
        <ul className="grid gap-3">
          {admins.map((a) => {
            const isMe = a.id === me;
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                  {(a.name || a.email).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {a.name} {isMe && <span className="ml-1 text-xs font-medium text-gray-500">(vous)</span>}
                  </p>
                  <p className="truncate text-sm text-gray-500">{a.email}</p>
                </div>
                {a.needsPasswordChange && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Invitation en attente</span>
                )}
                {!isMe && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={busy === a.id} onClick={() => resend(a)}>
                      <KeyRound className="mr-1.5 h-4 w-4" /> Nouveau mot de passe
                    </Button>
                    {confirmRevoke === a.id ? (
                      <Button size="sm" disabled={busy === a.id} onClick={() => revoke(a)} className="bg-red-600 text-white hover:bg-red-700">
                        Confirmer le retrait
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled={busy === a.id} onClick={() => setConfirmRevoke(a.id)} className="text-red-600 hover:text-red-700">
                        <UserMinus className="mr-1.5 h-4 w-4" /> Retirer
                      </Button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
