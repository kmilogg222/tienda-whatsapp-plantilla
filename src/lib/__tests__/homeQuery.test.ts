import { describe, expect, it } from 'vitest';
import { evaluate, parse } from 'groq-js';
import type { HomeSection, Product } from '@/types/catalog';
import { HOME_PAGE_QUERY, PRODUCTS_QUERY } from '@/lib/sanity/queries';
import { toHomePage, toProduct, type RawHomeSection, type RawProduct } from '@/lib/sanity/mappers';
import { pickShelfProducts } from '@/lib/home';
import {
  buildDemoDocuments,
  buildDemoHomePage,
  demoBrandId,
  demoCategoryId,
  demoImageFiles,
  demoProductId,
} from '@/lib/demo/sanityDocuments';

/**
 * Ejecuta la consulta real de la portada (GROQ) sobre los documentos de la
 * tienda de ejemplo, sin conexión, y compara los estantes con la regla que usa
 * el modo demostración (pickShelfProducts): ambas deben elegir lo mismo.
 */

const project = { projectId: 'abc123', dataset: 'production' };
const assets = Object.fromEntries(demoImageFiles().map((file) => [file, `image-${file}-800x1000-webp`]));
const ref = (id: string) => ({ _type: 'reference', _ref: id, _weak: true });

// Fechas de creación distintas y desordenadas respecto al orden manual
const products = buildDemoDocuments(assets).map((doc, i) => ({
  ...doc,
  _createdAt: new Date(Date.UTC(2026, 0, 1 + ((i * 7) % 31))).toISOString(),
}));

const shelves = [
  { _key: 'nuevos', _type: 'productShelf', title: 'Novedades', source: 'newest', limit: 5 },
  { _key: 'ofertas', _type: 'productShelf', title: 'Ofertas', source: 'offers', limit: 24 },
  { _key: 'insignia', _type: 'productShelf', title: 'Populares', source: 'badge', badge: 'Popular', limit: 24 },
  {
    _key: 'categoria',
    _type: 'productShelf',
    title: 'Maquillaje',
    source: 'category',
    category: ref(demoCategoryId('maquillaje')),
    limit: 3,
  },
  { _key: 'marca', _type: 'productShelf', title: 'Lumière', source: 'brand', brand: ref(demoBrandId('lumiere')), limit: 24 },
  {
    _key: 'manual',
    _type: 'productShelf',
    title: 'Elegidos',
    source: 'manual',
    products: ['perfume-floral-eau-de-parfum', 'no-existe', 'serum-vitamina-c'].map((id) => ({
      ...ref(demoProductId(id)),
      _key: id,
    })),
    limit: 24,
  },
  { _key: 'sin-fuente', _type: 'productShelf', title: 'Sin fuente', limit: 4 },
];

// Fotos simuladas para que las imágenes (asset->url) se resuelvan como en Sanity
const imageAssets = Object.entries(assets).map(([file, id]) => ({
  _id: id,
  _type: 'sanity.imageAsset',
  url: `https://cdn.sanity.io/images/abc123/production/${file}-800x1000.webp`,
  metadata: { dimensions: { width: 800, height: 1000 } },
}));

const homeDoc = { ...buildDemoHomePage(assets), sections: [...(buildDemoHomePage(assets).sections as object[]), ...shelves] };

async function run<T>(query: string, params: Record<string, unknown>, docs: object[]): Promise<T> {
  const result = await evaluate(parse(query, { params }), { dataset: docs, params });
  return (await result.get()) as T;
}

async function load(showSoldOut: boolean, docs: object[] = [...imageAssets, ...products, homeDoc]) {
  const raw = await run<{ sections: RawHomeSection[] } | null>(HOME_PAGE_QUERY, { showSoldOut }, docs);
  const home = toHomePage(raw, project);
  const all = (await run<RawProduct[]>(PRODUCTS_QUERY, {}, docs))
    .map((p) => toProduct(p, project))
    .filter((p) => showSoldOut || p.inStock);
  return { home, all };
}

type Shelf = Extract<HomeSection, { type: 'productShelf' }>;
const shelf = (sections: HomeSection[], key: string) =>
  sections.find((s): s is Shelf => s.type === 'productShelf' && s.key === key)!;
const ids = (list: Product[]) => list.map((p) => p._id);

describe('consulta de la portada (GROQ)', () => {
  it('la consulta es válida y conserva el orden de las secciones', async () => {
    const { home } = await load(true);
    expect(home.sections.map((s) => s.type)).toEqual([
      ...(buildDemoHomePage(assets).sections as { _type: string }[]).map((s) => s._type),
      ...shelves.map(() => 'productShelf'),
    ]);
  });

  it.each([true, false])('cada estante elige lo mismo que el modo demostración (agotados: %s)', async (showSoldOut) => {
    const { home, all } = await load(showSoldOut);
    for (const section of home.sections) {
      if (section.type !== 'productShelf') continue;
      expect(ids(section.products), section.key).toEqual(ids(pickShelfProducts(section, all)));
    }
  });

  it('respeta el límite, la fuente y el orden de cada estante', async () => {
    const { home } = await load(true);
    const newest = shelf(home.sections, 'nuevos').products;
    expect(newest).toHaveLength(5);
    const dates = newest.map((p) => p.createdAt ?? '');
    expect([...dates].sort().reverse()).toEqual(dates);

    expect(shelf(home.sections, 'ofertas').products.every((p) => p.originalPrice! > p.price)).toBe(true);
    expect(shelf(home.sections, 'insignia').products.every((p) => p.badge === 'Popular')).toBe(true);
    const makeup = shelf(home.sections, 'categoria').products;
    expect(makeup).toHaveLength(3);
    expect(makeup.every((p) => p.category === 'maquillaje')).toBe(true);
    expect(shelf(home.sections, 'marca').products.every((p) => p.brand === 'lumiere')).toBe(true);
    expect(shelf(home.sections, 'sin-fuente').products).toHaveLength(4);
  });

  it('novedades con la misma fecha (tienda de ejemplo cargada de una vez) siguen el orden manual', async () => {
    const sameDate = products.map((p) => ({ ...p, _createdAt: '2026-05-01T00:00:00Z' }));
    const { home, all } = await load(true, [...imageAssets, ...sameDate, homeDoc]);
    expect(ids(shelf(home.sections, 'nuevos').products)).toEqual(ids(all.slice(0, 5)));
  });

  it('los elegidos a mano salen en el orden del panel y se omiten los que ya no existen', async () => {
    const { home } = await load(true);
    expect(ids(shelf(home.sections, 'manual').products)).toEqual([
      demoProductId('perfume-floral-eau-de-parfum'),
      demoProductId('serum-vitamina-c'),
    ]);
  });

  it('nunca muestra productos ocultos ni, si así se configuró, agotados', async () => {
    const hiddenId = demoProductId('perfume-floral-eau-de-parfum');
    const docs = [...imageAssets, ...products.map((p) => (p._id === hiddenId ? { ...p, hidden: true } : p)), homeDoc];
    const { home } = await load(false, docs);
    for (const section of home.sections) {
      if (section.type !== 'productShelf') continue;
      expect(ids(section.products)).not.toContain(hiddenId);
      expect(section.products.every((p) => p.inStock)).toBe(true);
    }
  });

  it('sin documento de portada devuelve una portada vacía', async () => {
    const { home } = await load(true, products);
    expect(home.sections).toEqual([]);
  });
});
