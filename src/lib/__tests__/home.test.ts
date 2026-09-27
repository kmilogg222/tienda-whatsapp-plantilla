import { describe, expect, it } from 'vitest';
import type { Product } from '@/types/catalog';
import { orderByIds, pickShelfProducts, shelfViewAllHref, sortNewest, type ShelfConfig } from '@/lib/home';

const product = (id: string, extra: Partial<Product> = {}): Product => ({
  _id: id,
  name: id,
  slug: id,
  price: 100,
  category: 'maquillaje',
  images: [],
  description: '',
  tags: [],
  inStock: true,
  variants: [],
  infoSections: [],
  ...extra,
});

const catalog = [
  product('a', { createdAt: '2026-01-01', brand: 'lumiere', badge: 'Nuevo' }),
  product('b', { createdAt: '2026-03-01', originalPrice: 150, category: 'cabello' }),
  product('c', { createdAt: '2026-02-01', brand: 'lumiere', originalPrice: 90 }),
  product('d', { createdAt: '2026-04-01', badge: 'Nuevo', category: 'cabello' }),
];

const shelf = (config: Partial<ShelfConfig>): ShelfConfig => ({
  type: 'productShelf',
  key: 'x',
  title: 'X',
  source: 'newest',
  productIds: [],
  limit: 8,
  ...config,
});

const ids = (list: Product[]) => list.map((p) => p._id);

describe('pickShelfProducts', () => {
  it('novedades: los más recientes primero, hasta el límite', () => {
    expect(ids(pickShelfProducts(shelf({ source: 'newest', limit: 3 }), catalog))).toEqual(['d', 'b', 'c']);
  });

  it('ofertas: solo con precio antes mayor al actual', () => {
    expect(ids(pickShelfProducts(shelf({ source: 'offers' }), catalog))).toEqual(['b']);
  });

  it('insignia, categoría y marca respetan el orden manual', () => {
    expect(ids(pickShelfProducts(shelf({ source: 'badge', badge: 'Nuevo' }), catalog))).toEqual(['a', 'd']);
    expect(ids(pickShelfProducts(shelf({ source: 'category', categorySlug: 'cabello' }), catalog))).toEqual(['b', 'd']);
    expect(ids(pickShelfProducts(shelf({ source: 'brand', brandSlug: 'lumiere' }), catalog))).toEqual(['a', 'c']);
  });

  it('sin la insignia, categoría o marca elegida el estante queda vacío', () => {
    expect(pickShelfProducts(shelf({ source: 'badge' }), catalog)).toEqual([]);
    expect(pickShelfProducts(shelf({ source: 'category' }), catalog)).toEqual([]);
    expect(pickShelfProducts(shelf({ source: 'brand', brandSlug: 'no-existe' }), catalog)).toEqual([]);
  });

  it('elegidos a mano: en el orden del panel, sin repetidos ni borrados', () => {
    expect(ids(pickShelfProducts(shelf({ source: 'manual', productIds: ['c', 'x', 'a', 'c'] }), catalog))).toEqual([
      'c',
      'a',
    ]);
    expect(pickShelfProducts(shelf({ source: 'manual', productIds: [] }), catalog)).toEqual([]);
  });

  it('sin productos no falla', () => {
    expect(pickShelfProducts(shelf({}), [])).toEqual([]);
  });
});

describe('sortNewest / orderByIds', () => {
  it('sin fechas (tienda de ejemplo) conserva el orden recibido', () => {
    const noDates = [product('x'), product('y'), product('z')];
    expect(ids(sortNewest(noDates))).toEqual(['x', 'y', 'z']);
  });

  it('no modifica la lista original', () => {
    const copy = [...catalog];
    sortNewest(catalog);
    orderByIds(catalog, ['d']);
    expect(catalog).toEqual(copy);
  });
});

describe('shelfViewAllHref', () => {
  it('lleva al catálogo con el filtro equivalente', () => {
    expect(shelfViewAllHref(shelf({ source: 'category', categorySlug: 'labios' }))).toBe('/productos?categoria=labios');
    expect(shelfViewAllHref(shelf({ source: 'brand', brandSlug: 'lumiere' }))).toBe('/productos?marca=lumiere');
    expect(shelfViewAllHref(shelf({ source: 'offers' }))).toBe('/productos?oferta=1');
    expect(shelfViewAllHref(shelf({ source: 'newest' }))).toBe('/productos?orden=newest');
    expect(shelfViewAllHref(shelf({ source: 'manual' }))).toBe('/productos');
    expect(shelfViewAllHref(shelf({ source: 'badge', badge: 'Nuevo' }))).toBe('/productos');
  });
});
