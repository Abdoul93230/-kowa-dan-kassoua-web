// ─── Formatage partagé (prix, dates, villes, images) ─────────────────────────
// Mêmes règles que l'app mobile, pour un affichage identique sur les deux plateformes.

const groupThousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const formatPrice = (price: unknown): string => {
  const digits = String(price ?? '').replace(/[^\d]/g, '');
  const n = Number(digits);
  if (!digits || !Number.isFinite(n) || n < 0) return 'Prix à discuter';
  if (n === 0) return 'Gratuit'; // annonce publiée à 0 F
  return `${groupThousands(n)} FCFA`;
};

// Un vrai montant (ni « Gratuit » ni « Prix à discuter »)
export const hasPrice = (price: unknown) => Number(String(price ?? '').replace(/[^\d]/g, '')) > 0;

export const formatCompact = (num: unknown): string => {
  const n = Number(num) || 0;
  if (n < 1000) return String(n);
  if (n < 10000) return `${(Math.floor(n / 100) / 10).toString().replace('.', ',')}k`;
  return `${Math.floor(n / 1000)}k`;
};

export const cityOf = (location?: string | null) => {
  if (!location) return 'Niger';
  return String(location).split(',')[0].trim() || 'Niger';
};

export const timeAgo = (dateValue?: string | Date | null): string => {
  if (!dateValue) return 'Récent';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Récent';
  const mins = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} j`;
  return `${Math.floor(days / 7)} sem`;
};

export const getInitials = (name?: string | null) => {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : String(name).substring(0, 2).toUpperCase();
};

export const itemId = (item: { id?: string; _id?: string } | null | undefined) => String(item?.id || item?._id || '');

// ─── Images à la bonne taille (Cloudinary redimensionne à la volée) ──────────
// Une carte de 260 px n'a pas besoin de l'image de 800 px. Paliers fixes pour que
// chaque variante soit générée une fois puis servie depuis le cache du CDN.
const CLOUDINARY_UPLOAD = '/image/upload/';
const WIDTH_STEPS = [96, 192, 320, 480, 720, 1080, 1440];

const stepFor = (w: number) => WIDTH_STEPS.find((s) => s >= w) || WIDTH_STEPS[WIDTH_STEPS.length - 1];

export const sizedImage = (url?: string | null, width?: number): string | undefined => {
  if (!url) return undefined;
  if (!width || !url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_UPLOAD)) return url;
  return url.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}c_limit,w_${stepFor(width)},f_auto,q_auto/`);
};

// srcSet 1x / 2x pour les écrans haute densité
export const imageSrcSet = (url?: string | null, width?: number): string | undefined => {
  if (!url || !width || !url.includes('res.cloudinary.com')) return undefined;
  return `${sizedImage(url, width)} 1x, ${sizedImage(url, width * 2)} 2x`;
};

export const productImage = (item: { mainImage?: string; images?: string[] } | null | undefined) =>
  item?.mainImage || item?.images?.[0] || undefined;
