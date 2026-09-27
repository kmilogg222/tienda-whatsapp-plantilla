import type {
  BackgroundTone,
  ButtonStyle,
  CatalogFilter,
  CategoryGridStyle,
  CornerStyle,
  FontPairingId,
  IconName,
  ImageRatio,
  LinkType,
  OutOfStockBehavior,
  PaletteId,
  ProductBadge,
  ShelfSource,
  SortOption,
} from '@/lib/contentOptions';
import type { StoreLabels } from '@/lib/labels';

/** Imagen lista para mostrar (URL ya recortada según el editor de Sanity). */
export interface CatalogImage {
  url: string;
  alt: string;
  /** Miniatura borrosa en base64 para mostrar mientras carga */
  lqip?: string;
  width?: number;
  height?: number;
  /** Punto focal (0-1) elegido en Sanity; se usa como object-position */
  focalPoint?: { x: number; y: number };
}

/** Opción de un producto (tono, tamaño, aroma…). */
export interface ProductVariant {
  /** Identificador estable dentro del producto (el _key de Sanity) */
  key: string;
  name: string;
  /** Color de muestra en hex (#RRGGBB) */
  color?: string;
  image?: CatalogImage;
  /** Precio propio; si falta se usa el del producto */
  price?: number;
  originalPrice?: number;
  sku?: string;
  available: boolean;
}

/** Sección desplegable de la ficha (Modo de uso, Ingredientes…). */
export interface InfoSection {
  title: string;
  body: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  category: string; // Slug de la categoría
  categoryName?: string; // Nombre legible
  brand?: string; // Slug de la marca
  brandName?: string;
  images: CatalogImage[];
  description: string;
  shortDescription?: string;
  features?: string[];
  tags: string[];
  inStock: boolean;
  badge?: ProductBadge;
  /** Cómo se llaman las opciones. Ej.: Tono */
  variantLabel?: string;
  variants: ProductVariant[];
  infoSections: InfoSection[];
  /** Fecha de creación en Sanity (ISO); ordena "Novedades". Los productos de ejemplo no la tienen */
  createdAt?: string;
  /** Última edición en Sanity (ISO); fecha del mapa del sitio */
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string; // Nombre del ícono (ver CATEGORY_ICONS)
  image?: CatalogImage;
  description?: string;
  productCount?: number;
  /** Última edición en Sanity (ISO) */
  updatedAt?: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: CatalogImage;
  description?: string;
}

/** Destino de un botón ya resuelto a slugs. */
export interface LinkTarget {
  type: LinkType;
  categorySlug?: string;
  brandSlug?: string;
  productSlug?: string;
  url?: string;
}

export interface TrustBadge {
  icon: IconName;
  text: string;
}

export interface CardOptions {
  showBrand: boolean;
  showCategory: boolean;
  showQuickOrder: boolean;
}

export interface Announcement {
  enabled: boolean;
  text: string;
  icon: IconName;
  link?: LinkTarget;
}

/**
 * Configuración de la tienda ya normalizada (ver normalizeSettings):
 * los campos de interfaz nunca vienen vacíos.
 */
export interface StoreSettings {
  // General
  storeName: string;
  tagline: string;
  /** Idioma/país para formatear precios, ej. es-CO */
  locale: string;
  /** Código ISO de la moneda, ej. COP */
  currencyCode: string;
  /** Símbolo que reemplaza al de la moneda (opcional) */
  currencySymbol?: string;
  /** Mostrar centavos. Sin definir: solo si el precio los tiene */
  showDecimals?: boolean;

  // Marca
  logo?: string;
  favicon?: string;
  ogImage?: CatalogImage;

  // Apariencia
  palette: PaletteId;
  /** Color de marca en hex; si existe, la paleta se genera a partir de él */
  brandColor?: string;
  backgroundTone: BackgroundTone;
  fontPairing: FontPairingId;
  cornerStyle: CornerStyle;
  buttonStyle: ButtonStyle;
  imageRatio: ImageRatio;
  mobileColumns: 1 | 2;
  cardOptions: CardOptions;

  // Textos
  labels: StoreLabels;

  // WhatsApp y pedidos
  whatsappNumber: string; // Formato internacional sin símbolos: ej. '573001234567'
  /** Saludo con el que empieza el mensaje */
  defaultMessage: string;
  /** Línea final del mensaje */
  messageClosing: string;
  cartEnabled: boolean;
  askCustomerName: boolean;
  askCustomerCity: boolean;
  askNotes: boolean;
  freeShippingThreshold?: number;
  outOfStockBehavior: OutOfStockBehavior;

  // Catálogo y filtros
  enabledFilters: CatalogFilter[];
  defaultSort: SortOption;
  pageSize: number;

  // Confianza
  trustBadges: TrustBadge[];

  // Redes y contacto
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
  contactEmail?: string;
  address?: string;
  openingHours?: string;

  // Franja superior
  announcement: Announcement;

  // Google y estadísticas (vacíos = no se carga nada)
  /** ID de medición de Google Analytics 4, ej. G-ABC123XYZ */
  googleAnalyticsId?: string;
  /** Identificador del píxel de Meta (solo números) */
  metaPixelId?: string;
  /** Código de verificación de Google Search Console */
  googleSiteVerification?: string;
}

/* ---------- Portada ---------- */

export interface HeroSlide {
  key: string;
  image?: CatalogImage;
  mobileImage?: CatalogImage;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  link?: LinkTarget;
}

export type HomeSection =
  | { type: 'heroBanner'; key: string; slides: HeroSlide[]; autoplay: boolean }
  | {
      type: 'productShelf';
      key: string;
      title: string;
      source: ShelfSource;
      badge?: ProductBadge;
      categorySlug?: string;
      brandSlug?: string;
      productIds: string[];
      limit: number;
      /** Productos ya elegidos para el estante (máximo `limit`), en el orden en que se muestran */
      products: Product[];
    }
  | { type: 'categoryGrid'; key: string; title?: string; style: CategoryGridStyle }
  | { type: 'brandStrip'; key: string; title?: string }
  | {
      type: 'infoBlocks';
      key: string;
      title?: string;
      items: { key: string; icon: IconName; title: string; text?: string }[];
    }
  | {
      type: 'textBanner';
      key: string;
      title: string;
      text?: string;
      image?: CatalogImage;
      buttonText?: string;
      link?: LinkTarget;
    }
  | { type: 'socialCta'; key: string; title: string; text?: string };

export type HomeSectionType = HomeSection['type'];

export interface HomePage {
  sections: HomeSection[];
}

/** Estado del catálogo en modo real (con Sanity configurado). */
export type CatalogStatus = 'ok' | 'empty' | 'error';
