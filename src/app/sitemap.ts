import type { MetadataRoute } from 'next';
import { getCategories, getProducts } from '@/lib/sanity.client';
import { getSiteUrl } from '@/lib/site';
import { buildSitemap } from '@/lib/catalog/seo';

// Se arma en cada visita: lo publicado en Sanity aparece sin volver a desplegar
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Si Sanity falla, el mapa incluye al menos la portada y el catálogo
  const [products, categories] = await Promise.all([getProducts().catch(() => []), getCategories().catch(() => [])]);
  return buildSitemap(getSiteUrl(), products, categories);
}
