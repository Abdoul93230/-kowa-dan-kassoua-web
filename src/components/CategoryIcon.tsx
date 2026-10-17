// Icône de catégorie / sous-catégorie : illustration 3D réaliste (public/category-icons),
// à défaut l'emoji. L'icône est retrouvée dans cet ordre :
//   1. emoji enregistré en base (champ `icon`)
//   2. slug de la catégorie (ou 'categorie/sous-categorie')
//   3. ancien nom d'icône Lucide encore présent en base
import { CATEGORY_EMOJI_BY_SLUG, LUCIDE_TO_EMOJI, EMOJI_IMAGES } from '@/lib/categoryIcons.data';

type IconItem = { slug?: string; icon?: string | null } | null | undefined;

const isEmoji = (v?: string | null): v is string => !!v && !/^[A-Za-z0-9-]+$/.test(v);

export function categoryEmoji(item: IconItem, parentSlug?: string): string {
  if (!item) return '📦';
  if (isEmoji(item.icon)) return item.icon;
  return (
    (parentSlug && CATEGORY_EMOJI_BY_SLUG[`${parentSlug}/${item.slug}`]) ||
    (!parentSlug && item.slug && CATEGORY_EMOJI_BY_SLUG[item.slug]) ||
    (item.icon && LUCIDE_TO_EMOJI[item.icon]) ||
    '📦'
  );
}

export function CategoryIcon({
  item,
  parentSlug,
  size = 28,
  className = '',
}: {
  item: IconItem;
  parentSlug?: string;
  size?: number;
  className?: string;
}) {
  const emoji = categoryEmoji(item, parentSlug);
  const src = EMOJI_IMAGES[emoji];
  if (src) {
    // Petites images statiques déjà optimisées (PNG 256 px) : pas besoin de next/image
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" draggable={false} className={`select-none object-contain ${className}`} style={{ width: size, height: size }} />;
  }
  return (
    <span aria-hidden className={className} style={{ fontSize: size * 0.82, lineHeight: `${size}px` }}>
      {emoji}
    </span>
  );
}
