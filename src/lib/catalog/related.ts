import type { Product } from '@/types/catalog';

/** Productos relacionados que se muestran debajo de la ficha. */
export const RELATED_LIMIT = 4;

/**
 * Relacionados: primero los de la misma categoría y luego los de la misma
 * marca, sin repetir, sin el producto actual y solo los disponibles.
 * La lista de candidatos debe venir en el orden manual del panel.
 */
export function pickRelatedProducts(product: Product, candidates: Product[], limit = RELATED_LIMIT): Product[] {
  const pool = candidates.filter((p) => p._id !== product._id && p.inStock);
  const sameCategory = product.category ? pool.filter((p) => p.category === product.category) : [];
  const sameBrand = product.brand ? pool.filter((p) => p.brand === product.brand) : [];
  const unique = new Map<string, Product>();
  for (const p of [...sameCategory, ...sameBrand]) if (!unique.has(p._id)) unique.set(p._id, p);
  return [...unique.values()].slice(0, limit);
}
