/**
 * Listas cerradas de opciones del panel. Única fuente de verdad: las usan
 * los esquemas de Sanity (listas desplegables) y normalizeSettings()
 * (para descartar valores desconocidos).
 */

import { PALETTE_DEFINITIONS, type PaletteId } from './theme/palettes';

export interface Option<T extends string = string> {
  value: T;
  title: string;
}

const values = <T extends string>(options: readonly Option<T>[]) => options.map((o) => o.value);

/* ---------- Íconos (nombres de lucide-react en kebab-case) ---------- */

/** Íconos para categorías: útiles en belleza y en tiendas en general. */
export const CATEGORY_ICONS = [
  { value: 'sparkles', title: '✨ Destellos' },
  { value: 'heart', title: '❤️ Corazón' },
  { value: 'droplet', title: '💧 Gota (sérum, aceites)' },
  { value: 'palette', title: '🎨 Paleta (maquillaje)' },
  { value: 'scissors', title: '✂️ Tijeras (cabello)' },
  { value: 'flower-2', title: '🌸 Flor (fragancias)' },
  { value: 'sun', title: '☀️ Sol (protección solar)' },
  { value: 'moon', title: '🌙 Luna (rutina de noche)' },
  { value: 'gem', title: '💎 Gema (accesorios)' },
  { value: 'brush', title: '🖌️ Brocha' },
  { value: 'spray-can', title: '🧴 Spray' },
  { value: 'bath', title: '🛁 Baño y cuerpo' },
  { value: 'baby', title: '👶 Bebés' },
  { value: 'shirt', title: '👕 Ropa' },
  { value: 'gift', title: '🎁 Regalos y kits' },
  { value: 'star', title: '⭐ Estrella' },
  { value: 'leaf', title: '🌿 Hoja (natural)' },
  { value: 'smile', title: '😊 Carita feliz' },
  { value: 'shopping-bag', title: '🛍️ Bolsa de compras' },
  { value: 'tag', title: '🏷️ Etiqueta' },
] as const satisfies readonly Option[];

/** Íconos para sellos de confianza, franja superior y bloques informativos. */
export const SERVICE_ICONS = [
  { value: 'truck', title: '🚚 Camión (envíos)' },
  { value: 'package', title: '📦 Paquete' },
  { value: 'credit-card', title: '💳 Tarjeta (pagos)' },
  { value: 'banknote', title: '💵 Billete (pago contra entrega)' },
  { value: 'shield-check', title: '🛡️ Escudo (garantía)' },
  { value: 'badge-check', title: '✅ Sello verificado (original)' },
  { value: 'rotate-ccw', title: '🔄 Flecha (cambios y devoluciones)' },
  { value: 'clock', title: '⏰ Reloj (horario)' },
  { value: 'map-pin', title: '📍 Ubicación' },
  { value: 'phone', title: '📞 Teléfono' },
  { value: 'message-circle', title: '💬 Mensaje' },
  { value: 'flame', title: '🔥 Fuego (ofertas)' },
] as const satisfies readonly Option[];

export const ALL_ICONS = [...SERVICE_ICONS, ...CATEGORY_ICONS] as const;

export type CategoryIcon = (typeof CATEGORY_ICONS)[number]['value'];
export type IconName = (typeof ALL_ICONS)[number]['value'];

export const DEFAULT_CATEGORY_ICON: CategoryIcon = 'tag';

/**
 * Convierte un nombre de ícono (incluidos valores antiguos como "ShoppingBag")
 * a uno de la lista. Devuelve `fallback` si no se reconoce.
 */
export function normalizeIconName<T extends IconName>(
  raw: string | null | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  if (!raw) return fallback;
  const kebab = raw
    .trim()
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
  return (allowed as readonly string[]).includes(kebab) ? (kebab as T) : fallback;
}

/* ---------- Apariencia ---------- */

/** Paletas: se definen (con sus colores) en theme/palettes.ts. */
export const PALETTES: readonly Option<PaletteId>[] = PALETTE_DEFINITIONS.map(({ value, title }) => ({ value, title }));
export type { PaletteId };

export const BACKGROUND_TONES = [
  { value: 'light', title: 'Claro (blanco)' },
  { value: 'cream', title: 'Crema (cálido)' },
  { value: 'dark', title: 'Oscuro' },
] as const satisfies readonly Option[];
export type BackgroundTone = (typeof BACKGROUND_TONES)[number]['value'];

export const FONT_PAIRINGS = [
  { value: 'elegante', title: 'Elegante (Playfair Display + Inter)' },
  { value: 'delicada', title: 'Delicada (Cormorant Garamond + Jost)' },
  { value: 'moderna', title: 'Moderna (Poppins)' },
  { value: 'clasica', title: 'Clásica (DM Serif Display + DM Sans)' },
  { value: 'limpia', title: 'Limpia (Outfit + Inter)' },
] as const satisfies readonly Option[];
export type FontPairingId = (typeof FONT_PAIRINGS)[number]['value'];

export const CORNER_STYLES = [
  { value: 'square', title: 'Rectas' },
  { value: 'soft', title: 'Suaves' },
  { value: 'rounded', title: 'Redondeadas' },
] as const satisfies readonly Option[];
export type CornerStyle = (typeof CORNER_STYLES)[number]['value'];

export const BUTTON_STYLES = [
  { value: 'pill', title: 'Píldora (muy redondeados)' },
  { value: 'rounded', title: 'Redondeados' },
  { value: 'square', title: 'Rectos' },
] as const satisfies readonly Option[];
export type ButtonStyle = (typeof BUTTON_STYLES)[number]['value'];

export const IMAGE_RATIOS = [
  { value: '1:1', title: 'Cuadrada (1:1)' },
  { value: '4:5', title: 'Vertical (4:5) — recomendada para belleza' },
  { value: '3:4', title: 'Vertical alta (3:4)' },
] as const satisfies readonly Option[];
export type ImageRatio = (typeof IMAGE_RATIOS)[number]['value'];

export const MOBILE_COLUMNS = [
  { value: '1', title: '1 producto por fila' },
  { value: '2', title: '2 productos por fila' },
] as const satisfies readonly Option[];

/* ---------- Pedidos y catálogo ---------- */

export const OUT_OF_STOCK_BEHAVIORS = [
  { value: 'show', title: 'Mostrarlos como "Agotado"' },
  { value: 'hide', title: 'Ocultarlos del catálogo' },
] as const satisfies readonly Option[];
export type OutOfStockBehavior = (typeof OUT_OF_STOCK_BEHAVIORS)[number]['value'];

export const CATALOG_FILTERS = [
  { value: 'brand', title: 'Marca' },
  { value: 'price', title: 'Rango de precio' },
  { value: 'offers', title: 'Solo ofertas' },
  { value: 'tags', title: 'Etiquetas (ej. vegano, piel grasa)' },
  { value: 'availability', title: 'Solo disponibles' },
] as const satisfies readonly Option[];
export type CatalogFilter = (typeof CATALOG_FILTERS)[number]['value'];

export const SORT_OPTIONS = [
  { value: 'featured', title: 'Destacados (tu orden manual)' },
  { value: 'newest', title: 'Novedades' },
  { value: 'price-asc', title: 'Precio: menor a mayor' },
  { value: 'price-desc', title: 'Precio: mayor a menor' },
  { value: 'name-asc', title: 'Nombre: A a la Z' },
  { value: 'discount', title: 'Mayor descuento' },
] as const satisfies readonly Option[];
export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export const PRODUCT_BADGES = [
  { value: 'Nuevo', title: 'Nuevo' },
  { value: 'Oferta', title: 'Oferta' },
  { value: 'Destacado', title: 'Destacado' },
  { value: 'Popular', title: 'Más popular' },
] as const satisfies readonly Option[];
export type ProductBadge = (typeof PRODUCT_BADGES)[number]['value'];

/* ---------- Portada ---------- */

export const SHELF_SOURCES = [
  { value: 'newest', title: 'Novedades (los más recientes)' },
  { value: 'offers', title: 'Ofertas (con precio antes)' },
  { value: 'badge', title: 'Productos con una insignia' },
  { value: 'category', title: 'Una categoría' },
  { value: 'brand', title: 'Una marca' },
  { value: 'manual', title: 'Elegidos a mano' },
] as const satisfies readonly Option[];
export type ShelfSource = (typeof SHELF_SOURCES)[number]['value'];

export const LINK_TYPES = [
  { value: 'category', title: 'Una categoría' },
  { value: 'brand', title: 'Una marca' },
  { value: 'product', title: 'Un producto' },
  { value: 'catalog', title: 'Todo el catálogo' },
  { value: 'url', title: 'Otra dirección web' },
] as const satisfies readonly Option[];
export type LinkType = (typeof LINK_TYPES)[number]['value'];

export const CATEGORY_GRID_STYLES = [
  { value: 'circles', title: 'Círculos con foto' },
  { value: 'cards', title: 'Tarjetas' },
] as const satisfies readonly Option[];
export type CategoryGridStyle = (typeof CATEGORY_GRID_STYLES)[number]['value'];

export const optionValues = {
  categoryIcons: values(CATEGORY_ICONS),
  allIcons: values(ALL_ICONS),
  palettes: values(PALETTES),
  backgroundTones: values(BACKGROUND_TONES),
  fontPairings: values(FONT_PAIRINGS),
  cornerStyles: values(CORNER_STYLES),
  buttonStyles: values(BUTTON_STYLES),
  imageRatios: values(IMAGE_RATIOS),
  outOfStockBehaviors: values(OUT_OF_STOCK_BEHAVIORS),
  catalogFilters: values(CATALOG_FILTERS),
  sortOptions: values(SORT_OPTIONS),
};

/** Lista para `options.list` de Sanity (copia mutable). */
export const toSanityList = (options: readonly Option[]) => options.map(({ value, title }) => ({ value, title }));
