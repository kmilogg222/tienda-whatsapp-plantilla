import { cache } from 'react';
import { Brand, Category, CatalogStatus, HomePage, Product, StoreSettings } from '@/types/catalog';
import { demoBrands, demoCategories, demoHomePage, demoProducts, demoStoreSettings } from './demo/catalog';
import { DEFAULT_SETTINGS, normalizeSettings, RawStoreSettings } from './settings';
import { pickShelfProducts } from './home';
import { pickRelatedProducts } from './catalog/related';
import { client, dataset, projectId } from './sanity/client';
import {
  BRANDS_QUERY,
  CATEGORIES_QUERY,
  HOME_PAGE_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  PRODUCTS_BY_IDS_QUERY,
  PRODUCTS_QUERY,
  RELATED_PRODUCTS_QUERY,
  STORE_SETTINGS_QUERY,
} from './sanity/queries';
import { RawSanityImage, toCatalogImage } from './sanity/images';
import {
  RawBrand,
  RawCategory,
  RawHomeSection,
  RawProduct,
  toBrand,
  toCategory,
  toHomePage,
  toProduct as mapProduct,
} from './sanity/mappers';

// Se re-exporta para no romper los imports existentes de '@/lib/sanity.client'
export { apiVersion, client, dataset, isSanityConfigured, projectId, urlFor } from './sanity/client';

/**
 * Modo demostración: solo cuando NO hay credenciales de Sanity.
 * Con credenciales, nunca se muestran datos de ejemplo: si falla la consulta
 * se lanza el error para que la página muestre un aviso amable.
 */

const project = { projectId, dataset };
const toProduct = (raw: RawProduct) => mapProduct(raw, project);

async function fetchFromSanity<T>(label: string, query: string, params: Record<string, unknown> = {}): Promise<T> {
  try {
    return await client!.fetch<T>(query, params, { cache: 'no-store' });
  } catch (error) {
    console.error(`[catálogo] Error al consultar ${label} en Sanity:`, error);
    throw error;
  }
}

/**
 * Productos del catálogo. Los agotados se muestran (con su etiqueta) u
 * ocultan según Configuración → WhatsApp y pedidos → Productos agotados.
 * Se ejecuta una sola vez por petición (React cache).
 */
export const getProducts = cache(async (): Promise<Product[]> => {
  const [products, settings] = await Promise.all([
    client
      ? fetchFromSanity<RawProduct[] | null>('productos', PRODUCTS_QUERY).then((data) => (data ?? []).map(toProduct))
      : demoProducts,
    getStoreSettings(),
  ]);
  return settings.outOfStockBehavior === 'hide' ? products.filter((p) => p.inStock) : products;
});

/**
 * Detalle de un producto por su slug.
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!client) return demoProducts.find((p) => p.slug === slug) ?? null;
  const data = await fetchFromSanity<RawProduct | null>(`el producto "${slug}"`, PRODUCT_BY_SLUG_QUERY, { slug });
  return data ? toProduct(data) : null;
});

/**
 * Productos del carrito con sus datos actuales (precio, nombre, disponibilidad).
 * Los ocultos o borrados no vuelven: el carrito los descarta.
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  if (!client) return demoProducts.filter((p) => ids.includes(p._id));
  const data = await fetchFromSanity<RawProduct[] | null>('productos del carrito', PRODUCTS_BY_IDS_QUERY, { ids });
  return (data ?? []).map(toProduct);
}

/**
 * Productos relacionados: misma categoría y luego misma marca (máx. RELATED_LIMIT).
 */
export const getRelatedProducts = cache(async (product: Product): Promise<Product[]> => {
  if (!client) return pickRelatedProducts(product, demoProducts);
  if (!product.category && !product.brand) return [];
  const data = await fetchFromSanity<{ sameCategory?: RawProduct[] | null; sameBrand?: RawProduct[] | null } | null>(
    'productos relacionados',
    RELATED_PRODUCTS_QUERY,
    { id: product._id, category: product.category || null, brand: product.brand ?? null }
  );
  const candidates = [...(data?.sameCategory ?? []), ...(data?.sameBrand ?? [])].map(toProduct);
  return pickRelatedProducts(product, candidates);
});

/**
 * Todas las categorías.
 */
export const getCategories = cache(async (): Promise<Category[]> => {
  if (!client) return demoCategories;
  const data = await fetchFromSanity<RawCategory[] | null>('categorías', CATEGORIES_QUERY);
  return (data ?? []).map((raw) => toCategory(raw, project));
});

/**
 * Todas las marcas.
 */
export const getBrands = cache(async (): Promise<Brand[]> => {
  if (!client) return demoBrands;
  const data = await fetchFromSanity<RawBrand[] | null>('marcas', BRANDS_QUERY);
  return (data ?? []).map((raw) => toBrand(raw, project));
});

/**
 * Secciones de la portada, con los productos de cada estante ya elegidos
 * (una sola consulta). Sin documento: portada vacía (la web usa la portada automática).
 */
export const getHomePage = cache(async (): Promise<HomePage> => {
  if (!client) {
    const products = await getProducts();
    return {
      sections: demoHomePage.sections.map((section) =>
        section.type === 'productShelf' ? { ...section, products: pickShelfProducts(section, products) } : section
      ),
    };
  }
  const settings = await getStoreSettings();
  const data = await fetchFromSanity<{ sections?: RawHomeSection[] | null } | null>('la portada', HOME_PAGE_QUERY, {
    showSoldOut: settings.outOfStockBehavior !== 'hide',
  });
  return toHomePage(data, project);
});

type RawStoreSettingsResponse = Omit<RawStoreSettings, 'ogImage'> & { ogImage?: RawSanityImage | null };

/**
 * Configuración global de la tienda. Nunca lanza error: si Sanity falla
 * se usan valores neutros (nunca los de la demo).
 */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (!client) return demoStoreSettings;
  try {
    const data = await fetchFromSanity<RawStoreSettingsResponse | null>('la configuración', STORE_SETTINGS_QUERY);
    const ogImage = toCatalogImage(data?.ogImage, data?.storeName ?? '', project);
    return normalizeSettings({ ...data, ogImage });
  } catch {
    return DEFAULT_SETTINGS;
  }
});

/**
 * Productos + categorías para el catálogo, con el estado para mostrar
 * "tienda vacía" o "error" en lugar de datos ajenos.
 */
export async function getCatalogData(): Promise<{
  products: Product[];
  categories: Category[];
  status: CatalogStatus;
}> {
  const [productsResult, categoriesResult] = await Promise.allSettled([getProducts(), getCategories()]);
  if (productsResult.status === 'rejected') {
    return { products: [], categories: [], status: 'error' };
  }
  const products = productsResult.value;
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  return { products, categories, status: products.length > 0 ? 'ok' : 'empty' };
}
