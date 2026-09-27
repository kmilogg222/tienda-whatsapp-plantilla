import type { Product, ProductVariant } from '@/types/catalog';
import { variantOffer } from './catalog/variants';

/**
 * Carrito ligero: vive en el navegador (localStorage) y se envía en un solo
 * mensaje de WhatsApp. No hay cuentas, pagos ni inventario.
 */

/** Unidades máximas de un mismo producto (igual que el selector de la ficha). */
export const MAX_ITEM_QUANTITY = 10;
/** Productos distintos que caben en el carrito. */
export const MAX_CART_LINES = 50;

export interface CartItem {
  productId: string;
  /** Opción elegida (tono, tamaño); sin opción si el producto no tiene */
  variantKey?: string;
  qty: number;
  /** Precio unitario al agregarlo: sirve para avisar si cambió */
  price: number;
}

export interface CustomerInfo {
  name?: string;
  city?: string;
  notes?: string;
}

/** Clave del carrito en el navegador: una por tienda (proyecto y dataset de Sanity). */
export function cartStorageKey(projectId: string | undefined, dataset: string | undefined): string {
  return `catalogo-carrito:${projectId || 'demo'}:${dataset || 'production'}`;
}

export const sameLine = (a: Pick<CartItem, 'productId' | 'variantKey'>, b: Pick<CartItem, 'productId' | 'variantKey'>) =>
  a.productId === b.productId && (a.variantKey ?? '') === (b.variantKey ?? '');

const clampQty = (qty: number) => Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.round(qty)));

/** Agrega unidades; si ya estaba (mismo producto y opción) suma, sin pasar del máximo. */
export function addItem(items: CartItem[], item: CartItem): CartItem[] {
  const existing = items.find((i) => sameLine(i, item));
  if (existing) {
    return items.map((i) => (i === existing ? { ...i, qty: clampQty(i.qty + item.qty), price: item.price } : i));
  }
  if (items.length >= MAX_CART_LINES) return items;
  return [...items, { ...item, qty: clampQty(item.qty) }];
}

/** Cambia la cantidad de una línea (0 o menos la quita). */
export function setItemQty(items: CartItem[], line: Pick<CartItem, 'productId' | 'variantKey'>, qty: number): CartItem[] {
  if (qty <= 0) return removeItem(items, line);
  return items.map((i) => (sameLine(i, line) ? { ...i, qty: clampQty(qty) } : i));
}

export const removeItem = (items: CartItem[], line: Pick<CartItem, 'productId' | 'variantKey'>) =>
  items.filter((i) => !sameLine(i, line));

export const cartCount = (items: CartItem[]) => items.reduce((sum, i) => sum + i.qty, 0);

/** Lee el carrito guardado. Datos dañados o de otra versión se descartan sin fallar. */
export function parseStoredCart(raw: string | null | undefined): CartItem[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  const list = Array.isArray(data) ? data : Array.isArray((data as { items?: unknown })?.items) ? (data as { items: unknown[] }).items : [];
  let items: CartItem[] = [];
  for (const entry of list) {
    const e = entry as Record<string, unknown>;
    if (typeof e?.productId !== 'string' || !e.productId) continue;
    const qty = typeof e.qty === 'number' && Number.isFinite(e.qty) ? e.qty : 1;
    const price = typeof e.price === 'number' && Number.isFinite(e.price) ? e.price : 0;
    items = addItem(items, {
      productId: e.productId,
      ...(typeof e.variantKey === 'string' && e.variantKey ? { variantKey: e.variantKey } : {}),
      qty,
      price,
    });
  }
  return items;
}

export const serializeCart = (items: CartItem[]) => JSON.stringify({ version: 1, items });

/* ---------- Carrito con los datos actuales de los productos ---------- */

export interface CartLine {
  item: CartItem;
  product: Product;
  variant?: ProductVariant;
  unitPrice: number;
  lineTotal: number;
  /** Se puede pedir (producto y opción disponibles) */
  available: boolean;
  /** El precio es distinto al que tenía cuando se agregó */
  priceChanged: boolean;
}

export interface ResolvedCart {
  lines: CartLine[];
  /** Ítems descartados: el producto o la opción ya no existe (o está oculto) */
  removed: CartItem[];
  /** Suma de las líneas disponibles */
  subtotal: number;
  /** Unidades disponibles */
  count: number;
}

/**
 * Cruza el carrito guardado con los productos actuales: precios y nombres
 * siempre frescos, descarta lo que ya no existe y marca lo agotado.
 */
export function resolveCart(items: CartItem[], products: Product[]): ResolvedCart {
  const byId = new Map(products.map((p) => [p._id, p]));
  const lines: CartLine[] = [];
  const removed: CartItem[] = [];
  for (const item of items) {
    const product = byId.get(item.productId);
    const variant = item.variantKey ? product?.variants.find((v) => v.key === item.variantKey) : undefined;
    // Sin producto, opción borrada, o producto que ahora tiene opciones y no se eligió ninguna
    const invalid = !product || (item.variantKey ? !variant : product.variants.length > 0);
    if (invalid) {
      removed.push(item);
      continue;
    }
    const offer = variantOffer(product, variant);
    lines.push({
      item,
      product,
      ...(variant ? { variant } : {}),
      unitPrice: offer.price,
      lineTotal: offer.price * item.qty,
      available: offer.available,
      priceChanged: item.price > 0 && item.price !== offer.price,
    });
  }
  const orderable = lines.filter((l) => l.available);
  return {
    lines,
    removed,
    subtotal: orderable.reduce((sum, l) => sum + l.lineTotal, 0),
    count: orderable.reduce((sum, l) => sum + l.item.qty, 0),
  };
}

/** Cuánto falta para el envío gratis (0 = ya lo tiene) y el avance 0–1. Sin monto configurado: null. */
export function freeShippingProgress(subtotal: number, threshold: number | undefined): { missing: number; ratio: number } | null {
  if (!threshold || threshold <= 0) return null;
  return { missing: Math.max(0, threshold - subtotal), ratio: Math.min(1, subtotal / threshold) };
}
