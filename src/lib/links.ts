import type { LinkTarget } from '@/types/catalog';

export interface ResolvedLink {
  href: string;
  /** Enlace a otro sitio: se abre en otra pestaña */
  external: boolean;
}

/** Id de la sección del catálogo (destino de la lupa y de "saltar" dentro de /productos). */
export const CATALOG_ANCHOR = 'catalogo';

/** Página del catálogo completo con buscador y filtros. */
export const CATALOG_PATH = '/productos';

/**
 * Dirección del catálogo con filtros en la URL (`?categoria=`, `?marca=`, `?oferta=1`, `?orden=`).
 * Los filtros vacíos se omiten.
 */
export function catalogHref(filters: { categoria?: string; marca?: string; oferta?: boolean; orden?: string } = {}): string {
  const params = new URLSearchParams();
  if (filters.categoria) params.set('categoria', filters.categoria);
  if (filters.marca) params.set('marca', filters.marca);
  if (filters.oferta) params.set('oferta', '1');
  if (filters.orden) params.set('orden', filters.orden);
  const query = params.toString();
  return query ? `${CATALOG_PATH}?${query}` : CATALOG_PATH;
}

/**
 * Convierte un destino elegido en el panel en una dirección de la tienda.
 * Devuelve `undefined` si al destino le falta el dato necesario.
 * Los filtros por categoría/marca viajan en la URL del catálogo (`/productos?categoria=`).
 */
export function resolveLink(target: LinkTarget | undefined): ResolvedLink | undefined {
  if (!target) return undefined;
  const internal = (href: string): ResolvedLink => ({ href, external: false });

  switch (target.type) {
    case 'category':
      return target.categorySlug ? internal(catalogHref({ categoria: target.categorySlug })) : undefined;
    case 'brand':
      return target.brandSlug ? internal(catalogHref({ marca: target.brandSlug })) : undefined;
    case 'product':
      return target.productSlug ? internal(`/producto/${encodeURIComponent(target.productSlug)}`) : undefined;
    case 'catalog':
      return internal(CATALOG_PATH);
    case 'url': {
      const url = target.url?.trim();
      if (!url) return undefined;
      if (url.startsWith('/')) return internal(url);
      return /^(https?:\/\/|mailto:|tel:)/i.test(url) ? { href: url, external: /^https?:/i.test(url) } : undefined;
    }
    default:
      return undefined;
  }
}

export type SocialNetwork = 'instagram' | 'tiktok' | 'facebook' | 'youtube';

export const SOCIAL_NETWORKS: { key: SocialNetwork; name: string; base: string }[] = [
  { key: 'instagram', name: 'Instagram', base: 'https://instagram.com/' },
  { key: 'tiktok', name: 'TikTok', base: 'https://tiktok.com/@' },
  { key: 'facebook', name: 'Facebook', base: 'https://facebook.com/' },
  { key: 'youtube', name: 'YouTube', base: 'https://youtube.com/@' },
];

/**
 * Enlace a una red social. Acepta el enlace completo (lo que pide el panel)
 * o solo el usuario ("mitienda" o "@mitienda"). Ignora valores no válidos.
 */
export function socialUrl(network: SocialNetwork, value: string | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^(www\.)?[a-z0-9-]+\.[a-z]{2,}\//i.test(raw)) return `https://${raw}`;
  const user = raw.replace(/^@/, '');
  if (!/^[\w.-]+$/.test(user)) return undefined;
  const base = SOCIAL_NETWORKS.find((n) => n.key === network)!.base;
  return `${base}${user}`;
}
