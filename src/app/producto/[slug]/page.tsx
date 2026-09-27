import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts, getStoreSettings } from '@/lib/sanity.client';
import { formatPrice } from '@/lib/format';
import { getSiteUrl } from '@/lib/site';
import { priceRange } from '@/lib/catalog/filters';
import { productPath, selectedVariant, variantFromParams, variantOffer } from '@/lib/catalog/variants';
import { absoluteUrl, ogImage, openGraphBase, productJsonLd, serializeJsonLd } from '@/lib/catalog/seo';
import { Product, StoreSettings } from '@/types/catalog';
import { Header, Footer, StoreStatusMessage } from '@/components';
import { ProductDetail, ProductDetailFromUrl, RelatedProducts } from '@/components/product';

type SearchParams = Record<string, string | string[] | undefined>;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

// Render dinámico: lo publicado en Sanity se ve al recargar.
// Sin loading.tsx a propósito: un producto inexistente debe responder 404.
export const dynamic = 'force-dynamic';

/**
 * Producto por slug; `undefined` si Sanity no respondió (distinto de `null` = no existe).
 * Con "Productos agotados → Ocultarlos", un agotado tampoco existe en su ficha (404).
 */
async function loadProduct(slug: string, settings: StoreSettings): Promise<Product | null | undefined> {
  try {
    const product = await getProductBySlug(slug);
    return product && settings.outOfStockBehavior === 'hide' && !product.inStock ? null : product;
  } catch {
    return undefined;
  }
}

/**
 * Metadatos para buscadores y para la vista previa al compartir (WhatsApp, Facebook, X).
 * Con ?tono=… se usan el precio y la foto de ese tono.
 */
export async function generateMetadata({ params, searchParams }: ProductPageProps): Promise<Metadata> {
  const [{ slug }, query, settings] = await Promise.all([params, searchParams, getStoreSettings()]);
  const product = await loadProduct(slug, settings);

  if (!product) {
    return { title: `${settings.labels.notFoundTitle} | ${settings.storeName}` };
  }

  const siteUrl = getSiteUrl();
  const variant = variantFromParams(product, query);
  const range = priceRange(product);
  const priceText = variant
    ? formatPrice(variantOffer(product, variant).price, settings)
    : range.min !== range.max
      ? `${settings.labels.priceFrom} ${formatPrice(range.min, settings)}`
      : formatPrice(range.min, settings);
  const name = variant ? `${product.name} (${variant.name})` : product.name;

  const title = `${name} - ${priceText} | ${settings.storeName}`;
  const description = product.shortDescription || product.description.slice(0, 160) || product.name;
  const image = variant?.image ?? product.images[0];
  const og = image ? ogImage(image, siteUrl) : undefined;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(productPath(product), siteUrl) },
    openGraph: {
      ...openGraphBase(settings),
      title,
      description,
      url: absoluteUrl(productPath(product, variant), siteUrl),
      images: og ? [og] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: og ? [og.url] : [],
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }: ProductPageProps) {
  const [{ slug }, query, settings] = await Promise.all([params, searchParams, getStoreSettings()]);
  const product = await loadProduct(slug, settings);

  if (product === null) {
    notFound();
  }

  const relatedProducts = product ? await getRelatedProducts(product).catch(() => []) : [];

  return (
    <>
      {/* Sin botón flotante de WhatsApp: la ficha ya tiene su botón de pedido */}
      <Header settings={settings} />

      <main id="main-content">
        {product ? (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd(product, settings, getSiteUrl())) }}
            />
            {/* La opción elegida vive en la dirección (useSearchParams → Suspense) */}
            <Suspense
              fallback={
                <ProductDetail product={product} settings={settings} variant={selectedVariant(product, query)} />
              }
            >
              <ProductDetailFromUrl product={product} settings={settings} />
            </Suspense>
            <div className="container">
              <RelatedProducts products={relatedProducts} settings={settings} />
            </div>
          </>
        ) : (
          <div className="container">
            <StoreStatusMessage status="error" labels={settings.labels} />
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </>
  );
}
