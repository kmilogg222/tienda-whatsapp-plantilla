import type { Metadata, MetadataRoute } from 'next';
import type { CatalogImage, Category, Product, ProductVariant, StoreSettings } from '@/types/catalog';
import { CATALOG_PATH, catalogHref } from '../links';
import { galleryImages, productPath, variantOffer } from './variants';

/** Tamaño de la vista previa al compartir (WhatsApp, Facebook, X). */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** Servicios de imágenes que recortan al vuelo (mismo criterio que imageLoader). */
const CROPPABLE_HOSTS = ['cdn.sanity.io', 'images.unsplash.com'];

/** Dirección completa: las rutas locales (/demo/…) se completan con la del sitio. */
export function absoluteUrl(url: string, siteUrl: string): string {
  return url.startsWith('/') ? `${siteUrl}${url}` : url;
}

/**
 * Foto para la vista previa al compartir: recortada a 1200×630 alrededor del
 * punto focal elegido en Sanity. Fotos de otros sitios se usan tal cual.
 */
export function ogImage(image: CatalogImage, siteUrl: string): { url: string; width?: number; height?: number; alt: string } {
  const absolute = absoluteUrl(image.url, siteUrl);
  let url: URL;
  try {
    url = new URL(absolute);
  } catch {
    return { url: absolute, alt: image.alt };
  }
  if (!CROPPABLE_HOSTS.includes(url.hostname)) {
    return { url: absolute, alt: image.alt, width: image.width, height: image.height };
  }
  url.searchParams.set('w', String(OG_IMAGE_SIZE.width));
  url.searchParams.set('h', String(OG_IMAGE_SIZE.height));
  url.searchParams.set('fit', 'crop');
  // JPG: lo entienden todas las apps de mensajería
  url.searchParams.set('fm', 'jpg');
  if (image.focalPoint) {
    url.searchParams.set('crop', 'focalpoint');
    url.searchParams.set('fp-x', image.focalPoint.x.toFixed(3));
    url.searchParams.set('fp-y', image.focalPoint.y.toFixed(3));
  }
  return { url: url.toString(), alt: image.alt, ...OG_IMAGE_SIZE };
}

const availability = (available: boolean) =>
  available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

/**
 * Datos estructurados de producto (JSON-LD de schema.org) para buscadores.
 * Con opciones, una oferta por opción con su precio, referencia y disponibilidad.
 */
export function productJsonLd(product: Product, settings: StoreSettings, siteUrl: string): Record<string, unknown> {
  const offer = (variant?: ProductVariant) => {
    const { price, sku, available } = variantOffer(product, variant);
    return {
      '@type': 'Offer',
      ...(variant ? { name: variant.name } : {}),
      url: absoluteUrl(productPath(product, variant), siteUrl),
      price,
      priceCurrency: settings.currencyCode,
      availability: availability(available),
      ...(sku ? { sku } : {}),
    };
  };

  const description = product.shortDescription || product.description;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url: absoluteUrl(productPath(product), siteUrl),
    ...(description ? { description } : {}),
    image: galleryImages(product).map((img) => absoluteUrl(img.url, siteUrl)),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.brandName ? { brand: { '@type': 'Brand', name: product.brandName } } : {}),
    ...(product.categoryName ? { category: product.categoryName } : {}),
    offers: product.variants.length > 0 ? product.variants.map(offer) : offer(),
  };
}

/** JSON listo para un <script type="application/ld+json"> (sin "<" que pueda cerrar la etiqueta). */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

/* ---------- Páginas generales (portada y catálogo) ---------- */

/** Ícono de pestaña por defecto (public/favicon.svg), hasta que se suba uno en Configuración → Marca. */
export const DEFAULT_FAVICON = '/favicon.svg';

/** Título de la tienda: "Mi tienda | Pedidos por WhatsApp" (editable en Textos). */
export const siteTitle = (settings: StoreSettings) => `${settings.storeName} | ${settings.labels.seoTitleSuffix}`;

/** Descripción para buscadores: el eslogan o, si está vacío, el texto editable. */
export const siteDescription = (settings: StoreSettings) => settings.tagline || settings.labels.seoDescription;

/** Datos comunes de la vista previa al compartir (nombre de la tienda e idioma, ej. es_CO). */
export const openGraphBase = (settings: StoreSettings) => ({
  siteName: settings.storeName,
  locale: settings.locale.replace('-', '_'),
  type: 'website' as const,
});

/**
 * Metadatos de una página general. La vista previa usa la "Imagen para
 * compartir" de Configuración → Marca (recortada a 1200×630 alrededor del punto focal).
 */
export function pageMetadata(
  settings: StoreSettings,
  siteUrl: string,
  page: { title?: string; description?: string; path?: string } = {}
): Metadata {
  const title = page.title ?? siteTitle(settings);
  const description = page.description ?? siteDescription(settings);
  const og = settings.ogImage ? ogImage(settings.ogImage, siteUrl) : undefined;
  return {
    title,
    description,
    ...(page.path ? { alternates: { canonical: page.path } } : {}),
    openGraph: {
      ...openGraphBase(settings),
      title,
      description,
      ...(page.path ? { url: page.path } : {}),
      images: og ? [og] : [],
    },
    twitter: {
      card: og ? 'summary_large_image' : 'summary',
      title,
      description,
      images: og ? [og.url] : [],
    },
  };
}

/**
 * Metadatos de toda la tienda (layout): dirección base para completar enlaces,
 * ícono, vista previa por defecto y verificación de Google Search Console.
 */
export function rootMetadata(settings: StoreSettings, siteUrl: string): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    applicationName: settings.storeName,
    ...pageMetadata(settings, siteUrl),
    // Sin ícono en el panel se usa uno neutro (evita que el navegador pida /favicon.ico y falle)
    icons: [{ rel: 'icon', url: settings.favicon ?? DEFAULT_FAVICON }],
    ...(settings.googleSiteVerification ? { verification: { google: settings.googleSiteVerification } } : {}),
  };
}

/**
 * Metadatos del catálogo. Con ?categoria=… el título y la dirección canónica
 * son los de esa categoría; los demás filtros (marca, búsqueda, orden) apuntan
 * al catálogo sin filtros para no repetir la misma página en Google.
 */
export function catalogMetadata(
  settings: StoreSettings,
  siteUrl: string,
  categories: Category[],
  categorySlug: string | undefined
): Metadata {
  const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined;
  if (!category) {
    return pageMetadata(settings, siteUrl, {
      title: `${settings.labels.allProductsTitle} | ${settings.storeName}`,
      path: CATALOG_PATH,
    });
  }
  return pageMetadata(settings, siteUrl, {
    title: `${category.name} | ${settings.storeName}`,
    description: category.description,
    path: catalogHref({ categoria: category.slug }),
  });
}

/* ---------- Mapa del sitio ---------- */

/** La fecha más reciente (ISO) de la lista, o `undefined` si ninguna es válida. */
function latest(dates: (string | undefined)[]): Date | undefined {
  const times = dates.map((d) => (d ? Date.parse(d) : NaN)).filter((t) => !Number.isNaN(t));
  return times.length > 0 ? new Date(Math.max(...times)) : undefined;
}

/**
 * Mapa del sitio para Google: portada, catálogo, categorías con productos a la
 * venta y fichas. Recibe los productos ya filtrados (sin ocultos y, si así se
 * configuró, sin agotados). La fecha es la última edición real en Sanity; los
 * productos de ejemplo no la tienen y se publican sin fecha.
 */
export function buildSitemap(siteUrl: string, products: Product[], categories: Category[]): MetadataRoute.Sitemap {
  const withDate = (date: Date | undefined) => (date ? { lastModified: date } : {});
  const storeDate = latest([...products.map((p) => p.updatedAt), ...categories.map((c) => c.updatedAt)]);

  const categoryUrls: MetadataRoute.Sitemap = categories.flatMap((category) => {
    const inCategory = products.filter((p) => p.category === category.slug);
    if (inCategory.length === 0) return [];
    return [
      {
        url: absoluteUrl(catalogHref({ categoria: category.slug }), siteUrl),
        ...withDate(latest([category.updatedAt, ...inCategory.map((p) => p.updatedAt)])),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
    ];
  });

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(productPath(product), siteUrl),
    ...withDate(latest([product.updatedAt])),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    { url: siteUrl, ...withDate(storeDate), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl(CATALOG_PATH, siteUrl), ...withDate(storeDate), changeFrequency: 'daily', priority: 0.9 },
    ...categoryUrls,
    ...productUrls,
  ];
}
