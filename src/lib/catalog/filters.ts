import type { Product, ProductVariant } from '@/types/catalog';
import type { SortOption } from '../contentOptions';

/**
 * Filtros del catálogo. Todos opcionales: un filtro vacío no restringe nada.
 * Pensado para catálogos de hasta ~500 productos (todo se filtra en el navegador).
 */
export interface CatalogFilters {
  /** Texto buscado (sin importar tildes ni mayúsculas) */
  q?: string;
  /** Slug de la categoría */
  category?: string;
  /** Slugs de marcas (cualquiera de ellas) */
  brands?: string[];
  /** Etiquetas (cualquiera de ellas) */
  tags?: string[];
  /** Rango de precio sobre el precio "desde" */
  minPrice?: number;
  maxPrice?: number;
  /** Solo productos con descuento */
  offers?: boolean;
  /** Solo productos disponibles */
  available?: boolean;
  sort?: SortOption;
}

/* ---------- Texto ---------- */

/** Minúsculas y sin tildes: "Rímel" → "rimel". La ñ se conserva como n (búsqueda tolerante). */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Palabras de la búsqueda, ya normalizadas. */
export function searchTerms(query: string | undefined): string[] {
  return query ? normalizeText(query).split(/\s+/).filter(Boolean) : [];
}

/** Texto en el que se busca: nombre, marca, categoría, etiquetas, referencias, opciones y descripción corta. */
function searchableText(product: Product): string {
  return normalizeText(
    [
      product.name,
      product.brandName,
      product.categoryName,
      product.sku,
      product.shortDescription,
      ...product.tags,
      ...product.variants.flatMap((v) => [v.name, v.sku]),
    ]
      .filter(Boolean)
      .join(' \n ')
  );
}

/** Cada palabra buscada debe aparecer en algún campo ("labial rojo" → ambas). */
export function matchesSearch(product: Product, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = searchableText(product);
  return terms.every((term) => haystack.includes(term));
}

/* ---------- Precio, descuento y disponibilidad ---------- */

/** Opciones que se pueden comprar; si no tiene opciones, ninguna. */
const availableVariants = (product: Product) => product.variants.filter((v) => v.available);

/**
 * Precios del producto teniendo en cuenta sus opciones disponibles.
 * `min` es el precio "desde" (el que se usa para filtrar y ordenar).
 */
export function priceRange(product: Product): { min: number; max: number } {
  const variants = availableVariants(product);
  if (variants.length === 0) return { min: product.price, max: product.price };
  const prices = variants.map((v) => v.price ?? product.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Precio "desde": el menor precio entre las opciones disponibles (o el del producto). */
export const fromPrice = (product: Product) => priceRange(product).min;

/**
 * Precio y precio "antes" de una opción (o del producto si no se pasa opción).
 * Una opción sin precio propio hereda el precio y el precio "antes" del producto.
 */
export function variantPrices(product: Product, variant?: ProductVariant): { price: number; originalPrice?: number } {
  if (!variant) return { price: product.price, originalPrice: product.originalPrice };
  return {
    price: variant.price ?? product.price,
    originalPrice: variant.originalPrice ?? (variant.price === undefined ? product.originalPrice : undefined),
  };
}

/** Descuento (0–100) entre un precio y su precio "antes". */
export const percentOff = (price: number, originalPrice?: number) =>
  originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

/** Mayor descuento (0–100) del producto o de alguna de sus opciones disponibles. */
export function discountPercent(product: Product): number {
  const pairs = [variantPrices(product), ...availableVariants(product).map((v) => variantPrices(product, v))];
  return Math.max(0, ...pairs.map(({ price, originalPrice }) => percentOff(price, originalPrice)));
}

export const isOnSale = (product: Product) => discountPercent(product) > 0;

/** Se puede pedir: marcado como disponible y, si tiene opciones, al menos una disponible. */
export const isAvailable = (product: Product) =>
  product.inStock && (product.variants.length === 0 || product.variants.some((v) => v.available));

/* ---------- Filtros ---------- */

type FilterKey = 'category' | 'brands' | 'tags' | 'price' | 'offers' | 'available' | 'q';

const sameTag = (a: string, b: string) => normalizeText(a) === normalizeText(b);

/** Aplica todos los filtros menos `skip` (para contar las opciones de ese filtro). */
function matches(product: Product, filters: CatalogFilters, terms: string[], skip?: FilterKey): boolean {
  if (skip !== 'category' && filters.category && product.category !== filters.category) return false;
  if (skip !== 'brands' && filters.brands?.length && !filters.brands.includes(product.brand ?? '')) return false;
  if (skip !== 'tags' && filters.tags?.length && !filters.tags.some((t) => product.tags.some((pt) => sameTag(pt, t))))
    return false;
  if (skip !== 'price' && (filters.minPrice !== undefined || filters.maxPrice !== undefined)) {
    const price = fromPrice(product);
    if (filters.minPrice !== undefined && price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
  }
  if (skip !== 'offers' && filters.offers && !isOnSale(product)) return false;
  if (skip !== 'available' && filters.available && !isAvailable(product)) return false;
  if (skip !== 'q' && !matchesSearch(product, terms)) return false;
  return true;
}

/* ---------- Orden ---------- */

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

/** Orden estable: ante empate se conserva el orden manual del panel (el de la lista recibida). */
function sortProducts(products: Product[], sort: SortOption): Product[] {
  const indexed = products.map((product, index) => ({ product, index }));
  const compare: Record<SortOption, (a: Product, b: Product) => number> = {
    featured: () => 0,
    newest: (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
    'price-asc': (a, b) => fromPrice(a) - fromPrice(b),
    'price-desc': (a, b) => fromPrice(b) - fromPrice(a),
    'name-asc': (a, b) => collator.compare(a.name, b.name),
    discount: (a, b) => discountPercent(b) - discountPercent(a),
  };
  const byOption = compare[sort] ?? compare.featured;
  return indexed
    .sort((a, b) => byOption(a.product, b.product) || a.index - b.index)
    .map(({ product }) => product);
}

/**
 * Filtra y ordena el catálogo. No modifica la lista recibida.
 * La lista debe venir en el orden manual del panel ("Destacados").
 */
export function filterAndSortProducts(products: Product[], filters: CatalogFilters): Product[] {
  const terms = searchTerms(filters.q);
  const filtered = products.filter((product) => matches(product, filters, terms));
  return sortProducts(filtered, filters.sort ?? 'featured');
}

/* ---------- Opciones de cada filtro (con conteo) ---------- */

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface CatalogFacets {
  brands: FacetOption[];
  tags: FacetOption[];
  /** Precios "desde" mínimo y máximo del catálogo */
  price: { min: number; max: number } | null;
  offersCount: number;
  availableCount: number;
  /** Hay productos agotados (si no, el filtro "Solo disponibles" no sirve) */
  hasUnavailable: boolean;
}

/**
 * Opciones de cada filtro con cuántos productos quedarían al elegirlas
 * (contando con el resto de filtros activos). Las opciones elegidas se
 * conservan aunque queden en 0, para poder quitarlas.
 */
export function getFacets(products: Product[], filters: CatalogFilters): CatalogFacets {
  const terms = searchTerms(filters.q);
  const pool = (skip: FilterKey) => products.filter((p) => matches(p, filters, terms, skip));

  const brandCounts = new Map<string, FacetOption>();
  for (const product of products) {
    if (product.brand && !brandCounts.has(product.brand)) {
      brandCounts.set(product.brand, { value: product.brand, label: product.brandName ?? product.brand, count: 0 });
    }
  }
  for (const product of pool('brands')) {
    if (product.brand) brandCounts.get(product.brand)!.count++;
  }

  const tagCounts = new Map<string, FacetOption>();
  for (const product of products) {
    for (const tag of product.tags) {
      const key = normalizeText(tag);
      if (key && !tagCounts.has(key)) tagCounts.set(key, { value: tag, label: tag, count: 0 });
    }
  }
  for (const product of pool('tags')) {
    for (const key of new Set(product.tags.map(normalizeText))) {
      const option = tagCounts.get(key);
      if (option) option.count++;
    }
  }

  const selectedBrands = new Set(filters.brands ?? []);
  const selectedTags = new Set((filters.tags ?? []).map(normalizeText));
  const keep = (option: FacetOption, selected: boolean) => option.count > 0 || selected;
  const byLabel = (a: FacetOption, b: FacetOption) => collator.compare(a.label, b.label);

  const prices = products.map(fromPrice);
  return {
    brands: [...brandCounts.values()].filter((o) => keep(o, selectedBrands.has(o.value))).sort(byLabel),
    tags: [...tagCounts.entries()]
      .filter(([key, o]) => keep(o, selectedTags.has(key)))
      .map(([, o]) => o)
      .sort(byLabel),
    price: prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
    offersCount: pool('offers').filter(isOnSale).length,
    availableCount: pool('available').filter(isAvailable).length,
    hasUnavailable: products.some((p) => !isAvailable(p)),
  };
}
