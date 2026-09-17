'use client';

import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Shield, CheckCircle2, Loader2, LogIn, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import * as authApi from '@/lib/api/auth';
import { useQuickAuth } from '@/contexts/QuickAuthContext';

export default function DeleteAccountPage() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmText, setConfirmText] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { openQuickAuth } = useQuickAuth();

  useEffect(() => {
    const loadUser = () => {
      try {
        if (authApi.isAuthenticated()) {
          const currentUser = authApi.getCurrentUser();
          setUser({ id: currentUser?.id || '', name: currentUser?.name || '' });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Re-vérifier l'authentification après une connexion via QuickAuthModal
    window.addEventListener('auth:changed', loadUser);
    return () => window.removeEventListener('auth:changed', loadUser);
  }, []);

  const handleDelete = async () => {
    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }
    if (confirmText !== 'SUPPRIMER') {
      toast.error('Veuillez taper SUPPRIMER pour confirmer');
      return;
    }

    setDeleting(true);
    try {
      await authApi.deleteAccount();
      // Nettoyer le stockage local
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:changed'));

      toast.success('Votre compte a été supprimé définitivement');
      setUser(null);
      setConfirmStep(false);
      setConfirmText('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression du compte');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-300 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Trash2 className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Supprimer mon compte</h1>
            <p className="text-lg text-white/90">
              Supprimez votre compte TakTak et toutes vos données personnelles
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">

          {/* Chargement */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Loader2 className="h-10 w-10 text-orange-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Chargement...</p>
            </div>
          )}

          {/* Non connecté */}
          {!loading && !user && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="bg-orange-50 rounded-full p-4 w-fit mx-auto mb-6">
                <LogIn className="h-10 w-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Vous n&apos;êtes pas connecté</h2>
              <p className="text-gray-600 leading-relaxed mb-2">
                Pour supprimer votre compte, vous devez d&apos;abord vous connecter.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Vous pouvez également demander la suppression à notre support si vous avez perdu
                l&apos;accès à votre compte :{' '}
                <a href="mailto:support@taktak-ne.com" className="text-orange-500 hover:underline font-semibold">
                  support@taktak-ne.com
                </a>
              </p>
              <button
                onClick={() => openQuickAuth('/delete-account')}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow transition"
              >
                <LogIn className="h-5 w-5" />
                Se connecter
              </button>
            </div>
          )}

          {/* Connecté : formulaire de suppression */}
          {!loading && user && (
            <>
              {/* Avertissement */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 rounded-lg p-3 flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <p className="font-bold text-gray-900 mb-2">Attention : cette action est irréversible</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Toutes vos annonces seront supprimées</li>
                      <li>Toutes vos conversations et messages seront effacés</li>
                      <li>Vos favoris et avis seront supprimés</li>
                      <li>Cette action <span className="font-semibold">ne peut pas être annulée</span></li>
                    </ul>
                    <Link
                      href="/delete-account-details"
                      className="inline-flex items-center gap-1 text-orange-500 hover:underline font-semibold mt-3"
                    >
                      <FileText className="h-4 w-4" />
                      Voir les détails sur la suppression des données
                    </Link>
                  </div>
                </div>
              </div>

              {/* Carte de suppression */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-red-50 rounded-lg p-3 flex-shrink-0">
                    <Shield className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Compte concerné</h2>
                    <p className="text-gray-600">
                      Connecté en tant que <span className="font-semibold text-gray-900">{user.name}</span>
                    </p>
                  </div>
                </div>

                {!confirmStep ? (
                  <>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600">
                      <p className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        La suppression est <span className="font-semibold">immédiate et définitive</span>.
                        Toutes vos données personnelles sont effacées de nos serveurs conformément
                        à notre politique de confidentialité.
                      </p>
                    </div>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl shadow transition"
                    >
                      <Trash2 className="h-5 w-5" />
                      Je souhaite supprimer mon compte
                    </button>
                  </>
                ) : (
                  <>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                      <p className="text-sm text-red-700 font-semibold mb-3">
                        Dernière étape : tapez{' '}
                        <span className="bg-red-100 px-2 py-0.5 rounded font-mono">SUPPRIMER</span> dans
                        le champ ci-dessous pour confirmer.
                      </p>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Tapez SUPPRIMER"
                        className="w-full border border-red-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                        disabled={deleting}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => { setConfirmStep(false); setConfirmText(''); }}
                        className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition"
                        disabled={deleting}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleting || confirmText !== 'SUPPRIMER'}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow transition"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Suppression...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-5 w-5" />
                            Confirmer la suppression
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Lien retour */}
          <div className="text-center mt-8">
            <Link href="/" className="text-gray-500 hover:text-orange-500 text-sm">
              ← Retour à l&apos;accueil
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}