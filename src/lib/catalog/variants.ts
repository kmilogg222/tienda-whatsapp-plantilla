import type { CatalogImage, Product, ProductVariant } from '@/types/catalog';
import { normalizeText, percentOff, variantPrices } from './filters';

/**
 * Opciones de un producto (tonos, tamaños…) en la ficha: cuál está elegida,
 * cómo se escribe en la dirección y qué precio, referencia y foto le tocan.
 *
 *   /producto/labial-mate?tono=rojo-carmesi     (opciones llamadas "Tono")
 *   /producto/serum?tamano=15-ml                (opciones llamadas "Tamaño")
 */

/** Nombre del parámetro cuando el producto no dice cómo se llaman sus opciones. */
export const DEFAULT_VARIANT_PARAM = 'opcion';

/** Parámetros que también se aceptan al leer (enlaces escritos a mano o de antes de renombrar las opciones). */
const FALLBACK_PARAMS = ['tono', DEFAULT_VARIANT_PARAM];

/** Texto apto para la dirección: "Rojo Carmesí" → "rojo-carmesi". */
export function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Parámetro de la dirección para las opciones del producto: "Tono" → "tono". */
export function variantParamName(product: Pick<Product, 'variantLabel'>): string {
  return (product.variantLabel && slugify(product.variantLabel)) || DEFAULT_VARIANT_PARAM;
}

export const variantSlug = (variant: ProductVariant) => slugify(variant.name) || variant.key;

/** Opción con ese valor de la dirección (por nombre o, si no, por su clave interna). */
export function findVariant(product: Product, value: string | null | undefined): ProductVariant | undefined {
  const wanted = value ? slugify(value) : '';
  if (!wanted) return undefined;
  return product.variants.find((v) => variantSlug(v) === wanted) ?? product.variants.find((v) => v.key === value);
}

/** Opción preseleccionada: la primera disponible (o la primera, si todas están agotadas). */
export function defaultVariant(product: Product): ProductVariant | undefined {
  return product.variants.find((v) => v.available) ?? product.variants[0];
}

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function readParam(params: ParamSource, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/** Opción pedida en la dirección, si existe. */
export function variantFromParams(product: Product, params: ParamSource): ProductVariant | undefined {
  if (product.variants.length === 0) return undefined;
  const keys = [variantParamName(product), ...FALLBACK_PARAMS.filter((k) => k !== variantParamName(product))];
  for (const key of keys) {
    const variant = findVariant(product, readParam(params, key));
    if (variant) return variant;
  }
  return undefined;
}

/** Opción que muestra la ficha: la de la dirección o, si no hay, la preseleccionada. */
export const selectedVariant = (product: Product, params: ParamSource) =>
  variantFromParams(product, params) ?? defaultVariant(product);

/** Dirección de la ficha con la opción elegida (sin opción: la dirección simple). */
export function productPath(product: Product, variant?: ProductVariant): string {
  const path = `/producto/${product.slug}`;
  if (!variant) return path;
  return `${path}?${new URLSearchParams({ [variantParamName(product)]: variantSlug(variant) })}`;
}

export interface VariantOffer {
  price: number;
  /** Precio "antes", solo si es mayor que el precio */
  originalPrice?: number;
  /** Descuento 0–100 */
  discount: number;
  sku?: string;
  /** Se puede pedir: producto disponible y, si hay opción, la opción también */
  available: boolean;
}

/** Precio, precio "antes", referencia y disponibilidad de la opción elegida (o del producto). */
export function variantOffer(product: Product, variant?: ProductVariant): VariantOffer {
  const { price, originalPrice } = variantPrices(product, variant);
  const discount = percentOff(price, originalPrice);
  return {
    price,
    ...(discount > 0 ? { originalPrice } : {}),
    discount,
    sku: variant?.sku ?? product.sku,
    available: product.inStock && (variant ? variant.available : product.variants.length === 0 || product.variants.some((v) => v.available)),
  };
}

/** Fotos de la galería: las del producto y luego las de sus opciones (sin repetir). */
export function galleryImages(product: Product): CatalogImage[] {
  const images = [...product.images];
  for (const variant of product.variants) {
    if (variant.image && !images.some((img) => img.url === variant.image!.url)) images.push(variant.image);
  }
  return images;
}

/** Posición en la galería de la foto de una opción (o -1 si no tiene). */
export function variantImageIndex(images: CatalogImage[], variant?: ProductVariant): number {
  return variant?.image ? images.findIndex((img) => img.url === variant.image!.url) : -1;
}
