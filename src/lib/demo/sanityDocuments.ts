/**
 * Convierte la tienda de ejemplo en documentos de Sanity para el botón
 * "Cargar tienda de ejemplo" de "Primeros pasos".
 *
 * Reglas para poder borrarla después sin tocar lo de la dueña:
 *  - Categorías, marcas y productos llevan un _id que empieza por "demo-".
 *  - Las fotos se suben con source.name = DEMO_ASSET_SOURCE.
 *  - Las referencias entre documentos de ejemplo son "débiles" (_weak) para
 *    que se puedan borrar en cualquier orden.
 *  - Configuración y Portada son únicas: solo se crean si no existen.
 */
import { LexoRank } from 'lexorank';
import { DEMO_BRANDS, DEMO_CATEGORIES, DEMO_HOME, DEMO_PRODUCTS, DEMO_SETTINGS, DemoImage } from './data';

export const DEMO_ID_PREFIX = 'demo-';
export const DEMO_ASSET_SOURCE = 'catalogo-demo';

import { SINGLETON_IDS } from '../../sanity/singletons';

export { SINGLETON_IDS };

export const demoCategoryId = (id: string) => `${DEMO_ID_PREFIX}category-${id}`;
export const demoBrandId = (id: string) => `${DEMO_ID_PREFIX}brand-${id}`;
export const demoProductId = (id: string) => `${DEMO_ID_PREFIX}product-${id}`;

/** Todas las imágenes que usa la tienda de ejemplo (sin repetir). */
export function demoImageFiles(): DemoImage[] {
  const files = new Set<DemoImage>();
  DEMO_CATEGORIES.forEach((c) => files.add(c.image));
  DEMO_BRANDS.forEach((b) => files.add(b.logo));
  DEMO_PRODUCTS.forEach((p) => {
    p.images.forEach((file) => files.add(file));
    p.variants?.forEach((v) => v.image && files.add(v.image));
  });
  DEMO_HOME.forEach((section) => {
    if (section.type === 'heroBanner') section.slides.forEach((s) => (files.add(s.image), files.add(s.mobileImage)));
    if (section.type === 'textBanner') files.add(section.image);
  });
  return [...files];
}

type AssetIds = Record<DemoImage, string>;
type Doc = { _id: string; _type: string; [field: string]: unknown };

const ref = (_ref: string) => ({ _type: 'reference', _ref, _weak: true });

function imageField(file: DemoImage, assets: AssetIds, extra: Record<string, unknown> = {}) {
  const assetId = assets[file];
  if (!assetId) throw new Error(`Falta subir la imagen de ejemplo "${file}"`);
  return { _type: 'image', asset: { _type: 'reference', _ref: assetId }, ...extra };
}

/** Rangos de orden consecutivos (mismo formato que el plugin de orden por arrastre). */
function ranks(count: number): string[] {
  const result: string[] = [];
  let rank = LexoRank.min();
  for (let i = 0; i < count; i++) {
    rank = rank.genNext().genNext();
    result.push(rank.toString());
  }
  return result;
}

const slug = (current: string) => ({ _type: 'slug', current });

/** Categorías, marcas y productos de ejemplo. */
export function buildDemoDocuments(assets: AssetIds): Doc[] {
  const categoryRanks = ranks(DEMO_CATEGORIES.length);
  const brandRanks = ranks(DEMO_BRANDS.length);
  const productRanks = ranks(DEMO_PRODUCTS.length);

  const categories: Doc[] = DEMO_CATEGORIES.map((c, i) => ({
    _id: demoCategoryId(c.id),
    _type: 'category',
    name: c.name,
    slug: slug(c.id),
    icon: c.icon,
    image: imageField(c.image, assets),
    description: c.description,
    orderRank: categoryRanks[i],
  }));

  const brands: Doc[] = DEMO_BRANDS.map((b, i) => ({
    _id: demoBrandId(b.id),
    _type: 'brand',
    name: b.name,
    slug: slug(b.id),
    logo: imageField(b.logo, assets),
    description: b.description,
    orderRank: brandRanks[i],
  }));

  const products: Doc[] = DEMO_PRODUCTS.map((p, i) => ({
    _id: demoProductId(p.id),
    _type: 'product',
    name: p.name,
    slug: slug(p.id),
    price: p.price,
    ...(p.originalPrice ? { originalPrice: p.originalPrice } : {}),
    sku: p.sku,
    category: ref(demoCategoryId(p.category)),
    brand: ref(demoBrandId(p.brand)),
    ...(p.badge ? { badge: p.badge } : {}),
    tags: p.tags,
    images: p.images.map((file, j) => imageField(file, assets, { _key: `foto${j}` })),
    shortDescription: p.shortDescription,
    description: p.description,
    features: p.features,
    inStock: p.inStock,
    hidden: false,
    ...(p.variantLabel ? { variantLabel: p.variantLabel } : {}),
    variants: (p.variants ?? []).map((v, j) => ({
      _type: 'productVariant',
      _key: `opcion${j}`,
      name: v.name,
      ...(v.color ? { color: v.color } : {}),
      ...(v.image ? { image: imageField(v.image, assets) } : {}),
      ...(v.price !== undefined ? { price: v.price } : {}),
      ...(v.originalPrice !== undefined ? { originalPrice: v.originalPrice } : {}),
      ...(v.sku ? { sku: v.sku } : {}),
      available: v.available !== false,
    })),
    infoSections: (p.infoSections ?? []).map((s, j) => ({ _type: 'infoSection', _key: `info${j}`, ...s })),
    orderRank: productRanks[i],
  }));

  return [...categories, ...brands, ...products];
}

/** Configuración de ejemplo (sin número de WhatsApp: lo escribe la dueña). */
export function buildDemoSettings(): Doc {
  return {
    _id: SINGLETON_IDS.storeSettings,
    _type: 'storeSettings',
    ...DEMO_SETTINGS,
    cardOptions: { ...DEMO_SETTINGS.cardOptions },
    enabledFilters: [...DEMO_SETTINGS.enabledFilters],
    trustBadges: DEMO_SETTINGS.trustBadges.map((badge, i) => ({ _type: 'trustBadge', _key: `sello${i}`, ...badge })),
  };
}

/** Portada de ejemplo. */
export function buildDemoHomePage(assets: AssetIds): Doc {
  const link = (linkType: string, field: string, id: string) => ({ _type: 'linkTarget', linkType, [field]: ref(id) });

  const sections = DEMO_HOME.map((section, i) => {
    const base = { _key: `seccion${i}`, _type: section.type };
    switch (section.type) {
      case 'heroBanner':
        return {
          ...base,
          autoplay: true,
          slides: section.slides.map((s, j) => ({
            _type: 'heroSlide',
            _key: `diapositiva${j}`,
            image: imageField(s.image, assets, { alt: s.title }),
            mobileImage: imageField(s.mobileImage, assets, { alt: s.title }),
            title: s.title,
            subtitle: s.subtitle,
            buttonText: s.buttonText,
            link: link('category', 'category', demoCategoryId(s.category)),
          })),
        };
      case 'productShelf':
        return { ...base, title: section.title, source: section.source, limit: section.limit };
      case 'categoryGrid':
        return { ...base, title: section.title, style: section.style };
      case 'brandStrip':
        return { ...base, title: section.title };
      case 'infoBlocks':
        return {
          ...base,
          title: section.title,
          items: section.items.map((item, j) => ({ _type: 'infoBlock', _key: `bloque${j}`, ...item })),
        };
      case 'textBanner':
        return {
          ...base,
          title: section.title,
          text: section.text,
          image: imageField(section.image, assets, { alt: section.title }),
          buttonText: section.buttonText,
          link: link('product', 'product', demoProductId(section.product)),
        };
      case 'socialCta':
        return { ...base, title: section.title, text: section.text };
    }
  });

  return { _id: SINGLETON_IDS.homePage, _type: 'homePage', sections };
}
