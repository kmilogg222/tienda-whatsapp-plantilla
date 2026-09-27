import { optionValues, type SortOption } from '../contentOptions';
import type { CatalogFilters } from './filters';

/**
 * Filtros ⇄ dirección del catálogo. Así un filtro se puede compartir por
 * WhatsApp, sobrevive a recargar y el botón "atrás" lo deshace.
 *
 *   /productos?categoria=labios&marca=a&marca=b&etiqueta=vegano
 *             &min=20000&max=80000&oferta=1&disponible=1&orden=price-asc&q=rimel
 */
export const URL_KEYS = {
  q: 'q',
  category: 'categoria',
  brand: 'marca',
  tag: 'etiqueta',
  min: 'min',
  max: 'max',
  offers: 'oferta',
  available: 'disponible',
  sort: 'orden',
} as const;

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function getAll(params: ParamSource, key: string): string[] {
  const values =
    params instanceof URLSearchParams ? params.getAll(key) : ([] as string[]).concat(params[key] ?? []);
  // También se acepta "marca=a,b" (enlaces escritos a mano)
  return [...new Set(values.flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean))];
}

const getOne = (params: ParamSource, key: string) => getAll(params, key)[0];

function parsePrice(value: string | undefined): number | undefined {
  const digits = value?.replace(/[^\d.]/g, '');
  if (!digits) return undefined;
  const number = Number(digits);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : undefined;
}

const isFlag = (value: string | undefined) => value === '1' || value === 'true' || value === 'si';

/** Lee los filtros de la dirección. Valores raros se ignoran; nunca falla. */
export function parseFilters(params: ParamSource, defaultSort: SortOption = 'featured'): CatalogFilters {
  let minPrice = parsePrice(getOne(params, URL_KEYS.min));
  let maxPrice = parsePrice(getOne(params, URL_KEYS.max));
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }
  const sort = getOne(params, URL_KEYS.sort);

  const filters: CatalogFilters = {
    q: params instanceof URLSearchParams ? (params.get(URL_KEYS.q) ?? '').trim() : (getOne(params, URL_KEYS.q) ?? ''),
    category: getOne(params, URL_KEYS.category),
    brands: getAll(params, URL_KEYS.brand),
    tags: getAll(params, URL_KEYS.tag),
    minPrice,
    maxPrice,
    offers: isFlag(getOne(params, URL_KEYS.offers)),
    available: isFlag(getOne(params, URL_KEYS.available)),
    sort: (optionValues.sortOptions as readonly string[]).includes(sort ?? '') ? (sort as SortOption) : defaultSort,
  };
  return filters;
}

/** Dirección (sin "?") de unos filtros. Omite lo vacío y el orden inicial de la tienda. */
export function filtersToQuery(filters: CatalogFilters, defaultSort: SortOption = 'featured'): string {
  const params = new URLSearchParams();
  if (filters.category) params.set(URL_KEYS.category, filters.category);
  for (const brand of filters.brands ?? []) params.append(URL_KEYS.brand, brand);
  for (const tag of filters.tags ?? []) params.append(URL_KEYS.tag, tag);
  if (filters.minPrice !== undefined) params.set(URL_KEYS.min, String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set(URL_KEYS.max, String(filters.maxPrice));
  if (filters.offers) params.set(URL_KEYS.offers, '1');
  if (filters.available) params.set(URL_KEYS.available, '1');
  if (filters.sort && filters.sort !== defaultSort) params.set(URL_KEYS.sort, filters.sort);
  if (filters.q?.trim()) params.set(URL_KEYS.q, filters.q.trim());
  return params.toString();
}

/** Cuántos filtros hay elegidos (para el botón "Filtrar (n)"). No cuenta búsqueda, categoría ni orden. */
export function countActiveFilters(filters: CatalogFilters): number {
  return (
    (filters.brands?.length ?? 0) +
    (filters.tags?.length ?? 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.offers ? 1 : 0) +
    (filters.available ? 1 : 0)
  );
}

/** Clave estable de los filtros (sin el orden): cambia cuando cambia el resultado. */
export const filtersKey = (filters: CatalogFilters) => filtersToQuery({ ...filters, sort: undefined });
