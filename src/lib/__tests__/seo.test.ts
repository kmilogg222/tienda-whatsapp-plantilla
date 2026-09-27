import { describe, expect, it } from 'vitest';
import { evaluate, parse } from 'groq-js';
import type { Category, Product } from '@/types/catalog';
import { buildSitemap, catalogMetadata, pageMetadata, rootMetadata, siteDescription, siteTitle } from '@/lib/catalog/seo';
import { CATEGORIES_QUERY, PRODUCTS_QUERY } from '@/lib/sanity/queries';
import { toCategory, toProduct, type RawCategory, type RawProduct } from '@/lib/sanity/mappers';
import { normalizeSettings } from '@/lib/settings';
import { demoCategories, demoProducts } from '@/lib/demo/catalog';
import { buildDemoDocuments, demoImageFiles, demoProductId } from '@/lib/demo/sanityDocuments';

const SITE = 'https://mitienda.test';
const settings = normalizeSettings({ storeName: 'Tienda Rosa', tagline: 'Maquillaje original', locale: 'es-CO' });
const withOgImage = normalizeSettings({
  storeName: 'Tienda Rosa',
  ogImage: { url: 'https://cdn.sanity.io/images/p/d/portada-2000x1500.jpg', alt: 'Portada', focalPoint: { x: 0.5, y: 0.2 } },
});

describe('metadatos generales', () => {
  it('título y descripción salen del panel (eslogan o texto editable)', () => {
    expect(siteTitle(settings)).toBe('Tienda Rosa | Pedidos Directos por WhatsApp');
    expect(siteDescription(settings)).toBe('Maquillaje original');
    const custom = normalizeSettings({ labels: { seoTitleSuffix: 'Belleza', seoDescription: 'Todo para ti' } });
    expect(siteTitle(custom)).toBe('Mi tienda | Belleza');
    expect(siteDescription(custom)).toBe('Todo para ti');
  });

  it('el layout define la dirección base, idioma y nombre de la tienda', () => {
    const meta = rootMetadata(settings, SITE);
    expect(meta.metadataBase?.toString()).toBe(`${SITE}/`);
    expect(meta.openGraph).toMatchObject({ siteName: 'Tienda Rosa', locale: 'es_CO', type: 'website' });
    expect(meta.verification).toBeUndefined();
  });

  it('usa la imagen para compartir recortada a 1200×630', () => {
    const images = pageMetadata(withOgImage, SITE).openGraph?.images as { url: string; width: number; height: number }[];
    expect(images).toHaveLength(1);
    const url = new URL(images[0].url);
    expect([url.searchParams.get('w'), url.searchParams.get('h'), url.searchParams.get('fp-y')]).toEqual(['1200', '630', '0.200']);
    expect(pageMetadata(withOgImage, SITE).twitter).toMatchObject({ card: 'summary_large_image' });
    // Sin imagen: vista previa solo con texto
    expect(pageMetadata(settings, SITE).openGraph?.images).toEqual([]);
    expect(pageMetadata(settings, SITE).twitter).toMatchObject({ card: 'summary' });
  });

  it('agrega la verificación de Google solo si está configurada', () => {
    const verified = normalizeSettings({ googleSiteVerification: 'abcDEF123_-xyz' });
    expect(rootMetadata(verified, SITE).verification).toEqual({ google: 'abcDEF123_-xyz' });
  });

  it('catálogo: título y dirección canónica de la categoría elegida', () => {
    const category = demoCategories.find((c) => c.slug === 'maquillaje')!;
    const meta = catalogMetadata(settings, SITE, demoCategories, 'maquillaje');
    expect(meta.title).toBe(`${category.name} | Tienda Rosa`);
    expect(meta.alternates?.canonical).toBe('/productos?categoria=maquillaje');
    // Categoría desconocida o sin categoría: el catálogo completo
    for (const slug of ['no-existe', undefined]) {
      const all = catalogMetadata(settings, SITE, demoCategories, slug);
      expect(all.title).toBe('Todos los Productos | Tienda Rosa');
      expect(all.alternates?.canonical).toBe('/productos');
    }
  });
});

describe('mapa del sitio', () => {
  const urls = (entries: ReturnType<typeof buildSitemap>) => entries.map((e) => e.url);

  it('incluye portada, catálogo, categorías con productos y fichas', () => {
    const sitemap = buildSitemap(SITE, demoProducts, demoCategories);
    const withProducts = demoCategories.filter((c) => demoProducts.some((p) => p.category === c.slug));
    expect(urls(sitemap).slice(0, 2)).toEqual([SITE, `${SITE}/productos`]);
    expect(urls(sitemap)).toHaveLength(2 + withProducts.length + demoProducts.length);
    expect(urls(sitemap)).toContain(`${SITE}/productos?categoria=maquillaje`);
    expect(urls(sitemap)).toContain(`${SITE}/producto/labial-mate-larga-duracion`);
  });

  it('omite categorías sin productos a la venta', () => {
    const empty: Category = { _id: 'c-x', name: 'Vacía', slug: 'vacia' };
    expect(urls(buildSitemap(SITE, demoProducts, [...demoCategories, empty]))).not.toContain(
      `${SITE}/productos?categoria=vacia`
    );
  });

  it('sin fechas (productos de ejemplo) no inventa una', () => {
    expect(buildSitemap(SITE, demoProducts, demoCategories).every((e) => e.lastModified === undefined)).toBe(true);
  });

  it('usa la última edición real de cada página', () => {
    const products: Product[] = [
      { ...demoProducts[0], category: 'labios', updatedAt: '2026-05-01T10:00:00Z' },
      { ...demoProducts[1], category: 'labios', updatedAt: '2026-07-15T10:00:00Z' },
    ];
    const categories: Category[] = [{ _id: 'c1', name: 'Labios', slug: 'labios', updatedAt: '2026-06-01T00:00:00Z' }];
    const byUrl = new Map(buildSitemap(SITE, products, categories).map((e) => [e.url, e.lastModified]));
    expect(byUrl.get(SITE)).toEqual(new Date('2026-07-15T10:00:00Z'));
    expect(byUrl.get(`${SITE}/productos?categoria=labios`)).toEqual(new Date('2026-07-15T10:00:00Z'));
    expect(byUrl.get(`${SITE}/producto/${products[0].slug}`)).toEqual(new Date('2026-05-01T10:00:00Z'));
  });

  it('con Sanity: trae la fecha real y deja fuera los productos ocultos', async () => {
    const project = { projectId: 'abc123', dataset: 'production' };
    const assets = Object.fromEntries(demoImageFiles().map((file) => [file, `image-${file}-800x1000-webp`]));
    const hiddenId = demoProductId('base-liquida-cobertura-media');
    const dataset = buildDemoDocuments(assets).map((doc) => {
      const d = doc as { _id: string };
      return { ...d, _updatedAt: '2026-09-01T12:00:00Z', ...(d._id === hiddenId ? { hidden: true } : {}) };
    });
    const run = async <T,>(query: string) => (await (await evaluate(parse(query), { dataset })).get()) as T;

    const products = (await run<RawProduct[]>(PRODUCTS_QUERY)).map((p) => toProduct(p, project));
    const categories = (await run<RawCategory[]>(CATEGORIES_QUERY)).map((c) => toCategory(c, project));
    expect(products[0].updatedAt).toBe('2026-09-01T12:00:00Z');
    expect(categories[0].updatedAt).toBe('2026-09-01T12:00:00Z');

    const sitemap = buildSitemap(SITE, products, categories);
    expect(urls(sitemap)).not.toContain(`${SITE}/producto/base-liquida-cobertura-media`);
    expect(sitemap.every((e) => e.lastModified instanceof Date)).toBe(true);
  });
});
