import type { HomeSection, Product } from '@/types/catalog';
import { catalogHref } from './links';

type ShelfSection = Extract<HomeSection, { type: 'productShelf' }>;
/** Configuración de un estante (sin sus productos). */
export type ShelfConfig = Omit<ShelfSection, 'products'>;

/** Máximo de productos que puede tener un estante (igual que en el panel). */
export const MAX_SHELF_PRODUCTS = 24;

const isOffer = (product: Product) => product.originalPrice !== undefined && product.originalPrice > product.price;

/**
 * Productos de un estante a partir de la lista completa (ya en el orden manual del panel).
 * Se usa en el modo demostración y en la portada automática; con Sanity, los estantes
 * de la portada los resuelve la misma regla dentro de la consulta (HOME_PAGE_QUERY).
 */
export function pickShelfProducts(shelf: ShelfConfig, products: Product[]): Product[] {
  let picked: Product[];
  switch (shelf.source) {
    case 'offers':
      picked = products.filter(isOffer);
      break;
    case 'badge':
      picked = shelf.badge ? products.filter((p) => p.badge === shelf.badge) : [];
      break;
    case 'category':
      picked = shelf.categorySlug ? products.filter((p) => p.category === shelf.categorySlug) : [];
      break;
    case 'brand':
      picked = shelf.brandSlug ? products.filter((p) => p.brand === shelf.brandSlug) : [];
      break;
    case 'manual':
      picked = orderByIds(products, shelf.productIds);
      break;
    default:
      picked = sortNewest(products);
  }
  return picked.slice(0, shelf.limit);
}

/**
 * Más recientes primero. Con la misma fecha o sin fecha (modo demostración) se conserva
 * el orden recibido, que es el orden manual del panel (igual que en HOME_PAGE_QUERY).
 */
export function sortNewest(products: Product[]): Product[] {
  return [...products].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

/** Productos con esos ids, en el orden de la lista (los que ya no existen se omiten). */
export function orderByIds(products: Product[], ids: string[]): Product[] {
  const byId = new Map(products.map((p) => [p._id, p]));
  return [...new Set(ids)].map((id) => byId.get(id)).filter((p) => p !== undefined);
}

/**
 * Enlace "Ver todo" de un estante: el catálogo con el filtro equivalente.
 * Ofertas y novedades usan los filtros de la URL del catálogo; para insignias y
 * productos elegidos a mano no hay filtro equivalente y se abre el catálogo completo.
 */
export function shelfViewAllHref(shelf: ShelfConfig): string {
  switch (shelf.source) {
    case 'category':
      return catalogHref({ categoria: shelf.categorySlug });
    case 'brand':
      return catalogHref({ marca: shelf.brandSlug });
    case 'offers':
      return catalogHref({ oferta: true });
    case 'newest':
      return catalogHref({ orden: 'newest' });
    default:
      return catalogHref();
  }
}
