import { groq } from 'next-sanity';
import { RELATED_LIMIT } from '../catalog/related';

/** Proyección de una imagen de Sanity con lo necesario para recorte, punto focal, placeholder y alt. */
const IMAGE_PROJECTION = /* groq */ `{
  "assetId": asset->_id,
  "url": asset->url,
  "lqip": asset->metadata.lqip,
  "dimensions": asset->metadata.dimensions{width, height},
  crop,
  hotspot,
  alt
}`;

/** Destino de un botón con las referencias resueltas a slugs. */
const LINK_PROJECTION = /* groq */ `{
  linkType,
  "categorySlug": category->slug.current,
  "brandSlug": brand->slug.current,
  "productSlug": product->slug.current,
  url
}`;

/**
 * Orden manual del panel (arrastrar y soltar). Los documentos que aún no tienen
 * orden (creados antes de activarlo) van al final con el orden anterior.
 */
const MANUAL_ORDER = /* groq */ `coalesce(orderRank, "~") asc`;

/** Productos visibles: los marcados como "Ocultar de la tienda" nunca salen. */
const VISIBLE_PRODUCT = /* groq */ `_type == "product" && coalesce(hidden, false) == false`;

const PRODUCT_PROJECTION = /* groq */ `{
  _id,
  _createdAt,
  _updatedAt,
  name,
  "slug": slug.current,
  price,
  originalPrice,
  sku,
  "category": category->slug.current,
  "categoryName": category->name,
  "brand": brand->slug.current,
  "brandName": brand->name,
  "images": images[]${IMAGE_PROJECTION},
  shortDescription,
  description,
  features,
  tags,
  inStock,
  badge,
  variantLabel,
  variants[]{
    _key,
    name,
    color,
    "image": image${IMAGE_PROJECTION},
    price,
    originalPrice,
    sku,
    available
  },
  infoSections[]{title, body}
}`;

/** Todos los productos visibles; los agotados se filtran según la configuración (outOfStockBehavior). */
export const PRODUCTS_QUERY = groq`*[${VISIBLE_PRODUCT}] | order(${MANUAL_ORDER}, _createdAt desc) ${PRODUCT_PROJECTION}`;

export const PRODUCT_BY_SLUG_QUERY = groq`*[${VISIBLE_PRODUCT} && slug.current == $slug][0] ${PRODUCT_PROJECTION}`;

/** Productos del carrito (por id) con sus datos actuales; los ocultos o borrados no vuelven. */
export const PRODUCTS_BY_IDS_QUERY = groq`*[${VISIBLE_PRODUCT} && _id in $ids] ${PRODUCT_PROJECTION}`;

/** Candidatos a relacionados que se pueden pedir (sin el actual). */
const RELATED_CANDIDATE = /* groq */ `${VISIBLE_PRODUCT} && inStock == true && _id != $id`;

/**
 * Candidatos a productos relacionados: de la misma categoría y de la misma marca
 * (RELATED_LIMIT de cada uno). La web los combina con pickRelatedProducts (categoría primero).
 */
export const RELATED_PRODUCTS_QUERY = groq`{
  "sameCategory": *[${RELATED_CANDIDATE} && defined($category) && category->slug.current == $category]
    | order(${MANUAL_ORDER}, _createdAt desc) [0...${RELATED_LIMIT}] ${PRODUCT_PROJECTION},
  "sameBrand": *[${RELATED_CANDIDATE} && defined($brand) && brand->slug.current == $brand]
    | order(${MANUAL_ORDER}, _createdAt desc) [0...${RELATED_LIMIT}] ${PRODUCT_PROJECTION}
}`;

export const CATEGORIES_QUERY = groq`*[_type == "category"] | order(${MANUAL_ORDER}, name asc) {
  _id,
  _updatedAt,
  name,
  "slug": slug.current,
  icon,
  "image": image${IMAGE_PROJECTION},
  description
}`;

export const BRANDS_QUERY = groq`*[_type == "brand"] | order(${MANUAL_ORDER}, name asc) {
  _id,
  name,
  "slug": slug.current,
  "logo": logo${IMAGE_PROJECTION},
  description
}`;

/** Productos de un estante que se pueden mostrar ($showSoldOut: incluir agotados). */
const SHELF_PRODUCT = /* groq */ `${VISIBLE_PRODUCT} && ($showSoldOut || inStock == true)`;

/**
 * Productos de cada estante según su fuente, en la misma consulta de la portada.
 * Se traen hasta 24 (el máximo del panel) y la web recorta al límite de cada estante.
 * "Elegidos a mano" se ordena en la web según la lista del panel (productIds).
 */
const SHELF_PRODUCTS = /* groq */ `select(
  _type != "productShelf" => null,
  source == "manual" => *[${SHELF_PRODUCT} && _id in coalesce(^.products[]._ref, [])] ${PRODUCT_PROJECTION},
  source == "offers" => *[${SHELF_PRODUCT} && originalPrice > price] | order(${MANUAL_ORDER}, _createdAt desc) [0...24] ${PRODUCT_PROJECTION},
  source == "badge" => *[${SHELF_PRODUCT} && badge == ^.badge] | order(${MANUAL_ORDER}, _createdAt desc) [0...24] ${PRODUCT_PROJECTION},
  source == "category" => *[${SHELF_PRODUCT} && category._ref == ^.category._ref] | order(${MANUAL_ORDER}, _createdAt desc) [0...24] ${PRODUCT_PROJECTION},
  source == "brand" => *[${SHELF_PRODUCT} && brand._ref == ^.brand._ref] | order(${MANUAL_ORDER}, _createdAt desc) [0...24] ${PRODUCT_PROJECTION},
  *[${SHELF_PRODUCT}] | order(_createdAt desc, ${MANUAL_ORDER}) [0...24] ${PRODUCT_PROJECTION}
)`;

// Se ordena por fecha de creación para que, si hubiera varios documentos, siempre se use el mismo
export const HOME_PAGE_QUERY = groq`*[_type == "homePage"] | order(_createdAt asc) [0] {
  sections[]{
    _type,
    _key,
    title,
    text,
    slides[]{
      _key,
      "image": image${IMAGE_PROJECTION},
      "mobileImage": mobileImage${IMAGE_PROJECTION},
      title,
      subtitle,
      buttonText,
      "link": link${LINK_PROJECTION}
    },
    autoplay,
    source,
    badge,
    "categorySlug": category->slug.current,
    "brandSlug": brand->slug.current,
    "productIds": products[]._ref,
    "shelfProducts": ${SHELF_PRODUCTS},
    limit,
    style,
    items[]{_key, icon, title, text},
    "image": image${IMAGE_PROJECTION},
    buttonText,
    "link": link${LINK_PROJECTION}
  }
}`;

export const STORE_SETTINGS_QUERY = groq`*[_type == "storeSettings"] | order(_createdAt asc) [0] {
  storeName,
  tagline,
  locale,
  currencyCode,
  currencySymbol,
  showDecimals,
  "logo": logo.asset->url,
  "favicon": favicon.asset->url,
  "ogImage": ogImage${IMAGE_PROJECTION},
  palette,
  customColorHex,
  backgroundTone,
  fontPairing,
  cornerStyle,
  buttonStyle,
  imageRatio,
  mobileColumns,
  cardOptions,
  labels,
  whatsappNumber,
  defaultMessage,
  messageClosing,
  cartEnabled,
  askCustomerName,
  askCustomerCity,
  askNotes,
  freeShippingThreshold,
  outOfStockBehavior,
  enabledFilters,
  defaultSort,
  pageSize,
  trustBadges[]{icon, text},
  instagram,
  tiktok,
  facebook,
  youtube,
  contactEmail,
  address,
  openingHours,
  announcementEnabled,
  shippingNotice,
  announcementIcon,
  "announcementLink": announcementLink${LINK_PROJECTION},
  googleAnalyticsId,
  metaPixelId,
  googleSiteVerification,
  themePreset,
  primaryColor,
  themeMode,
  searchPlaceholder,
  whatsappCtaText,
  floatingWhatsAppTooltip,
  emptyStateText,
  footerText
}`;
