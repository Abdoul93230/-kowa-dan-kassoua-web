import { api } from './auth';

export type ReportReason = 'nudity' | 'scam' | 'prohibited' | 'offensive' | 'misleading' | 'duplicate' | 'other';

// Motifs proposés (mêmes clés que le backend)
export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'nudity', label: 'Nudité ou contenu sexuel' },
  { value: 'scam', label: 'Arnaque ou fraude' },
  { value: 'prohibited', label: 'Produit ou service interdit' },
  { value: 'offensive', label: 'Contenu choquant ou haineux' },
  { value: 'misleading', label: 'Annonce trompeuse ou incohérente' },
  { value: 'duplicate', label: 'Doublon ou spam' },
  { value: 'other', label: 'Autre' },
];

export interface ReportedListing {
  product: { _id: string; title: string; mainImage?: string; price?: string; status: string; type?: string };
  seller: { _id: string; name?: string; phone?: string; email?: string } | null;
  reports: {
    id: string;
    reason: ReportReason;
    reasonLabel: string;
    details?: string;
    reporter: { name?: string; contact?: string } | null;
    createdAt: string;
  }[];
}

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

/** Signaler une annonce (connexion requise) */
export const reportProduct = async (productId: string, reason: ReportReason, details = '') => {
  try {
    const response = await api.post('/reports', { productId, reason, details });
    return response.data as { success: boolean; message?: string; alreadyReported?: boolean };
  } catch (error) {
    throw new Error(errorMessage(error, "Impossible d'envoyer le signalement"));
  }
};

/** Signalements regroupés par annonce (admin) */
export const getReports = async (status: 'open' | 'resolved' | 'dismissed' = 'open') => {
  try {
    const response = await api.get('/reports', { params: { status } });
    return response.data as { success: boolean; data: ReportedListing[]; hideThreshold: number };
  } catch (error) {
    throw new Error(errorMessage(error, 'Impossible de charger les signalements'));
  }
};

/** Décision d'un admin : retirer l'annonce ou rejeter ses signalements */
export const handleReports = async (productId: string, action: 'remove' | 'dismiss') => {
  try {
    const response = await api.patch(`/reports/product/${productId}`, { action });
    return response.data as { success: boolean; productStatus: string };
  } catch (error) {
    throw new Error(errorMessage(error, 'Action impossible'));
  }
};
