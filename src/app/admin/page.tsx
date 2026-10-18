import { redirect } from 'next/navigation';

// L'espace admin s'ouvre sur les signalements
export default function AdminHome() {
  redirect('/admin/signalements');
}
