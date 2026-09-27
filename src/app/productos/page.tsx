import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCatalogData, getStoreSettings } from '@/lib/sanity.client';
import { catalogMetadata } from '@/lib/catalog/seo';
import { getSiteUrl } from '@/lib/site';
import { CatalogView } from '@/components/catalog/CatalogView';
import Loading from './loading';

// Render dinámico: lo publicado en Sanity se ve al recargar
export const dynamic = 'force-dynamic';

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Título y dirección canónica del catálogo o de la categoría elegida (?categoria=…). */
export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const [query, settings, { categories }] = await Promise.all([searchParams, getStoreSettings(), getCatalogData()]);
  const categoria = typeof query.categoria === 'string' ? query.categoria : undefined;
  return catalogMetadata(settings, getSiteUrl(), categories, categoria);
}

/**
 * Catálogo completo. Los filtros viven en la dirección (?categoria=, ?marca=, ?q=…)
 * y los lee el propio catálogo con useSearchParams (por eso va dentro de Suspense).
 */
export default async function CatalogPage() {
  const [{ products, categories, status }, settings] = await Promise.all([getCatalogData(), getStoreSettings()]);

  return (
    <Suspense fallback={<Loading />}>
      <CatalogView products={products} categories={categories} settings={settings} status={status} />
    </Suspense>
  );
}
