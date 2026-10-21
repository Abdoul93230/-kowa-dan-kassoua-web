import { HomeView } from '@/components/home/HomeView';
import { fetchHomeServer } from '@/lib/api/home';

// Page rendue côté serveur et réutilisée 60 s : affichage immédiat, bon référencement
export const revalidate = 60;

export default async function Home() {
  const data = await fetchHomeServer();
  return <HomeView initial={data} />;
}
