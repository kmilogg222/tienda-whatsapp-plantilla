import type {
  Brand,
  Category,
  HeroSlide,
  HomePage,
  HomeSection,
  InfoSection,
  LinkTarget,
  Product,
  ProductVariant,
} from '@/types/catalog';
import {
  CATEGORY_GRID_STYLES,
  LINK_TYPES,
  PRODUCT_BADGES,
  SHELF_SOURCES,
  normalizeIconName,
  optionValues,
  type IconName,
  type ProductBadge,
} from '../contentOptions';
import { MAX_SHELF_PRODUCTS, orderByIds } from '../home';
import { RawSanityImage, toCatalogImage } from './images';

type Maybe<T> = T | null | undefined;
type Project = { projectId: string; dataset: string };

const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
const num = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;
const oneOf = <T extends string>(value: unknown, allowed: readonly { value: T }[]): T | undefined =>
  allowed.find((option) => option.value === value)?.value;

/** Imagen con texto alternativo opcional (el `alt` lo escribe la dueña en el panel). */
export type RawImageWithAlt = RawSanityImage & { alt?: Maybe<string> };

const image = (raw: Maybe<RawImageWithAlt>, fallbackAlt: string, project: Project) =>
  toCatalogImage(raw, text(raw?.alt) ?? fallbackAlt, project) ?? undefined;

/* ---------- Enlaces ---------- */

export interface RawLinkTarget {
  linkType?: Maybe<string>;
  categorySlug?: Maybe<string>;
  brandSlug?: Maybe<string>;
  productSlug?: Maybe<string>;
  url?: Maybe<string>;
}

/** Destino de un botón; `undefined` si le falta la referencia elegida. */
export function toLinkTarget(raw: Maybe<RawLinkTarget>): LinkTarget | undefined {
  const type = oneOf(raw?.linkType, LINK_TYPES);
  if (!raw || !type) return undefined;
  switch (type) {
    case 'catalog':
      return { type };
    case 'category':
      return text(raw.categorySlug) ? { type, categorySlug: text(raw.categorySlug) } : undefined;
    case 'brand':
      return text(raw.brandSlug) ? { type, brandSlug: text(raw.brandSlug) } : undefined;
    case 'product':
      return text(raw.productSlug) ? { type, productSlug: text(raw.productSlug) } : undefined;
    case 'url':
      return text(raw.url) ? { type, url: text(raw.url) } : undefined;
  }
}

/* ---------- Productos ---------- */

export interface RawVariant {
  _key?: Maybe<string>;
  name?: Maybe<string>;
  color?: Maybe<string>;
  image?: Maybe<RawImageWithAlt>;
  price?: Maybe<number>;
  originalPrice?: Maybe<number>;
  sku?: Maybe<string>;
  available?: Maybe<boolean>;
}

export interface RawProduct {
  _id: string;
  _createdAt?: Maybe<string>;
  _updatedAt?: Maybe<string>;
  name?: Maybe<string>;
  slug?: Maybe<string>;
  price?: Maybe<number>;
  originalPrice?: Maybe<number>;
  sku?: Maybe<string>;
  category?: Maybe<string>;
  categoryName?: Maybe<string>;
  brand?: Maybe<string>;
  brandName?: Maybe<string>;
  images?: Maybe<Maybe<RawImageWithAlt>[]>;
  description?: Maybe<string>;
  shortDescription?: Maybe<string>;
  features?: Maybe<Maybe<string>[]>;
  tags?: Maybe<Maybe<string>[]>;
  inStock?: Maybe<boolean>;
  badge?: Maybe<string>;
  variantLabel?: Maybe<string>;
  variants?: Maybe<Maybe<RawVariant>[]>;
  infoSections?: Maybe<Maybe<{ title?: Maybe<string>; body?: Maybe<string> }>[]>;
}

const HEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

function toVariant(raw: Maybe<RawVariant>, index: number, productName: string, project: Project): ProductVariant | null {
  const name = text(raw?.name);
  if (!raw || !name) return null;
  const variant: ProductVariant = {
    key: text(raw._key) ?? `opcion-${index}`,
    name,
    available: raw.available !== false,
  };
  const color = text(raw.color);
  if (color && HEX.test(color)) variant.color = color;
  const variantImage = image(raw.image, `${productName} - ${name}`, project);
  if (variantImage) variant.image = variantImage;
  const price = num(raw.price);
  if (price !== undefined) variant.price = price;
  const originalPrice = num(raw.originalPrice);
  if (originalPrice !== undefined) variant.originalPrice = originalPrice;
  const sku = text(raw.sku);
  if (sku) variant.sku = sku;
  return variant;
}

export function toProduct(raw: RawProduct, project: Project): Product {
  const name = text(raw.name) ?? 'Producto';
  const product: Product = {
    _id: raw._id,
    name,
    slug: text(raw.slug) ?? raw._id,
    price: num(raw.price) ?? 0,
    category: text(raw.category) ?? '',
    images: (raw.images ?? [])
      .map((img) => image(img, name, project))
      .filter((img) => img !== undefined),
    description: raw.description ?? '',
    tags: (raw.tags ?? []).map(text).filter((tag) => tag !== undefined),
    inStock: raw.inStock ?? true,
    variants: (raw.variants ?? [])
      .map((variant, index) => toVariant(variant, index, name, project))
      .filter((variant) => variant !== null),
    infoSections: (raw.infoSections ?? [])
      .map((section) => ({ title: text(section?.title), body: section?.body?.trim() }))
      .filter((section): section is InfoSection => Boolean(section.title && section.body)),
  };

  const optional: Partial<Product> = {
    originalPrice: num(raw.originalPrice),
    sku: text(raw.sku),
    categoryName: text(raw.categoryName),
    brand: text(raw.brand),
    brandName: text(raw.brandName),
    shortDescription: text(raw.shortDescription),
    features: raw.features ? raw.features.map(text).filter((f) => f !== undefined) : undefined,
    badge: oneOf<ProductBadge>(raw.badge, PRODUCT_BADGES),
    variantLabel: text(raw.variantLabel),
    createdAt: text(raw._createdAt),
    updatedAt: text(raw._updatedAt),
  };
  for (const [key, value] of Object.entries(optional)) {
    if (value !== undefined) (product as unknown as Record<string, unknown>)[key] = value;
  }
  return product;
}

/* ---------- Categorías y marcas ---------- */

export interface RawCategory {
  _id: string;
  _updatedAt?: Maybe<string>;
  name?: Maybe<string>;
  slug?: Maybe<string>;
  icon?: Maybe<string>;
  image?: Maybe<RawImageWithAlt>;
  description?: Maybe<string>;
}

export function toCategory(raw: RawCategory, project: Project): Category {
  const name = text(raw.name) ?? 'Categoría';
  const category: Category = { _id: raw._id, name, slug: text(raw.slug) ?? raw._id };
  // El ícono se pasa tal cual: valores antiguos (ej. "Headphones") se siguen mostrando
  const icon = text(raw.icon);
  if (icon) category.icon = icon;
  const categoryImage = image(raw.image, name, project);
  if (categoryImage) category.image = categoryImage;
  const description = text(raw.description);
  if (description) category.description = description;
  const updatedAt = text(raw._updatedAt);
  if (updatedAt) category.updatedAt = updatedAt;
  return category;
}

export interface RawBrand {
  _id: string;
  name?: Maybe<string>;
  slug?: Maybe<string>;
  logo?: Maybe<RawImageWithAlt>;
  description?: Maybe<string>;
}

export function toBrand(raw: RawBrand, project: Project): Brand {
  const name = text(raw.name) ?? 'Marca';
  const brand: Brand = { _id: raw._id, name, slug: text(raw.slug) ?? raw._id };
  const logo = image(raw.logo, name, project);
  if (logo) brand.logo = logo;
  const description = text(raw.description);
  if (description) brand.description = description;
  return brand;
}

/* ---------- Portada ---------- */

export interface RawHomeSection {
  _type?: Maybe<string>;
  _key?: Maybe<string>;
  title?: Maybe<string>;
  text?: Maybe<string>;
  // heroBanner
  slides?: Maybe<
    Maybe<{
      _key?: Maybe<string>;
      image?: Maybe<RawImageWithAlt>;
      mobileImage?: Maybe<RawImageWithAlt>;
      title?: Maybe<string>;
      subtitle?: Maybe<string>;
      buttonText?: Maybe<string>;
      link?: Maybe<RawLinkTarget>;
    }>[]
  >;
  autoplay?: Maybe<boolean>;
  // productShelf
  source?: Maybe<string>;
  badge?: Maybe<string>;
  categorySlug?: Maybe<string>;
  brandSlug?: Maybe<string>;
  productIds?: Maybe<Maybe<string>[]>;
  /** Productos del estante ya resueltos por la consulta (ver HOME_PAGE_QUERY) */
  shelfProducts?: Maybe<Maybe<RawProduct>[]>;
  limit?: Maybe<number>;
  // categoryGrid
  style?: Maybe<string>;
  // infoBlocks
  items?: Maybe<Maybe<{ _key?: Maybe<string>; icon?: Maybe<string>; title?: Maybe<string>; text?: Maybe<string> }>[]>;
  // textBanner
  image?: Maybe<RawImageWithAlt>;
  buttonText?: Maybe<string>;
  link?: Maybe<RawLinkTarget>;
}

function withOptional<T extends object>(base: T, optional: Record<string, unknown>): T {
  for (const [key, value] of Object.entries(optional)) {
    if (value !== undefined) (base as Record<string, unknown>)[key] = value;
  }
  return base;
}

function toHomeSection(raw: Maybe<RawHomeSection>, index: number, project: Project): HomeSection | null {
  if (!raw) return null;
  const key = text(raw._key) ?? `seccion-${index}`;
  const title = text(raw.title);

  switch (raw._type) {
    case 'heroBanner': {
      const slides = (raw.slides ?? [])
        .map((slide, i): HeroSlide | null => {
          const slideTitle = text(slide?.title);
          const desktop = image(slide?.image, slideTitle ?? '', project);
          if (!slide || !desktop) return null;
          return withOptional<HeroSlide>(
            { key: text(slide._key) ?? `diapositiva-${i}`, image: desktop },
            {
              mobileImage: image(slide.mobileImage, slideTitle ?? '', project),
              title: slideTitle,
              subtitle: text(slide.subtitle),
              buttonText: text(slide.buttonText),
              link: toLinkTarget(slide.link),
            }
          );
        })
        .filter((slide) => slide !== null);
      return slides.length > 0 ? { type: 'heroBanner', key, slides, autoplay: raw.autoplay !== false } : null;
    }
    case 'productShelf': {
      const source = oneOf(raw.source, SHELF_SOURCES) ?? 'newest';
      const productIds = (raw.productIds ?? []).map(text).filter((id) => id !== undefined);
      const limit = Math.min(MAX_SHELF_PRODUCTS, Math.max(1, Math.round(num(raw.limit) ?? 8)));
      const fetched = (raw.shelfProducts ?? [])
        .filter((product): product is RawProduct => !!product?._id)
        .map((product) => toProduct(product, project));
      // Los elegidos a mano se muestran en el orden de la lista del panel
      const products = (source === 'manual' ? orderByIds(fetched, productIds) : fetched).slice(0, limit);
      return withOptional<HomeSection>(
        { type: 'productShelf', key, title: title ?? '', source, productIds, limit, products },
        {
          badge: oneOf<ProductBadge>(raw.badge, PRODUCT_BADGES),
          categorySlug: text(raw.categorySlug),
          brandSlug: text(raw.brandSlug),
        }
      );
    }
    case 'categoryGrid':
      return withOptional<HomeSection>(
        { type: 'categoryGrid', key, style: oneOf(raw.style, CATEGORY_GRID_STYLES) ?? 'circles' },
        { title }
      );
    case 'brandStrip':
      return withOptional<HomeSection>({ type: 'brandStrip', key }, { title });
    case 'infoBlocks': {
      const items = (raw.items ?? [])
        .map((item, i) => {
          const itemTitle = text(item?.title);
          if (!item || !itemTitle) return null;
          return withOptional(
            {
              key: text(item._key) ?? `bloque-${i}`,
              icon: normalizeIconName<IconName>(item.icon, optionValues.allIcons, 'badge-check'),
              title: itemTitle,
            },
            { text: text(item.text) }
          ) as { key: string; icon: IconName; title: string; text?: string };
        })
        .filter((item) => item !== null);
      return items.length > 0 ? withOptional<HomeSection>({ type: 'infoBlocks', key, items }, { title }) : null;
    }
    case 'textBanner':
      return title
        ? withOptional<HomeSection>(
            { type: 'textBanner', key, title },
            {
              text: text(raw.text),
              image: image(raw.image, title, project),
              buttonText: text(raw.buttonText),
              link: toLinkTarget(raw.link),
            }
          )
        : null;
    case 'socialCta':
      return title ? withOptional<HomeSection>({ type: 'socialCta', key, title }, { text: text(raw.text) }) : null;
    default:
      return null;
  }
}

/** Portada normalizada: descarta secciones incompletas o de tipos desconocidos. */
export function toHomePage(raw: Maybe<{ sections?: Maybe<Maybe<RawHomeSection>[]> }>, project: Project): HomePage {
  return {
    sections: (raw?.sections ?? [])
      .map((section, index) => toHomeSection(section, index, project))
      .filter((section) => section !== null),
  };
}
