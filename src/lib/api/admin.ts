import { api } from './auth';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  needsPasswordChange: boolean;
  createdAt: string;
}

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export const getAdmins = async () => {
  try {
    const res = await api.get('/admin/admins');
    return res.data as { success: boolean; data: AdminAccount[]; me: string };
  } catch (error) {
    throw new Error(errorMessage(error, 'Impossible de charger les administrateurs'));
  }
};

/** Invite un administrateur : ses accès lui sont envoyés par e-mail */
export const inviteAdmin = async (email: string, name: string) => {
  try {
    const res = await api.post('/admin/admins', { email, name });
    return res.data as { success: boolean; data: AdminAccount; message: string };
  } catch (error) {
    throw new Error(errorMessage(error, "Impossible de créer l'administrateur"));
  }
};

export const resetAdminPassword = async (id: string) => {
  try {
    const res = await api.post(`/admin/admins/${id}/reset-password`);
    return res.data as { success: boolean; message: string };
  } catch (error) {
    throw new Error(errorMessage(error, "Impossible d'envoyer un nouveau mot de passe"));
  }
};

export const revokeAdmin = async (id: string) => {
  try {
    const res = await api.delete(`/admin/admins/${id}`);
    return res.data as { success: boolean; message: string };
  } catch (error) {
    throw new Error(errorMessage(error, 'Impossible de retirer les droits'));
  }
};
