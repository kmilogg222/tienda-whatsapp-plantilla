import { describe, expect, it } from 'vitest';
import type { Product, ProductVariant } from '@/types/catalog';
import {
  discountPercent,
  filterAndSortProducts,
  fromPrice,
  getFacets,
  isAvailable,
  normalizeText,
  priceRange,
} from '@/lib/catalog/filters';
import { demoProducts } from '@/lib/demo/catalog';

const variant = (name: string, extra: Partial<ProductVariant> = {}): ProductVariant => ({
  key: name,
  name,
  available: true,
  ...extra,
});

const product = (id: string, extra: Partial<Product> = {}): Product => ({
  _id: id,
  name: id,
  slug: id,
  price: 50000,
  category: 'maquillaje',
  categoryName: 'Maquillaje',
  images: [],
  description: '',
  tags: [],
  inStock: true,
  variants: [],
  infoSections: [],
  ...extra,
});

// Orden manual del panel: a, b, c, d, e, f
const catalog: Product[] = [
  product('a', {
    name: 'Rímel Volumen Extremo',
    brand: 'lumiere',
    brandName: 'Lumière',
    tags: ['A prueba de agua'],
    price: 39000,
    createdAt: '2026-01-10',
  }),
  product('b', {
    name: 'Labial Mate Rojo',
    brand: 'velvet',
    brandName: 'Velvet Studio',
    tags: ['vegano', 'larga duración'],
    price: 45000,
    originalPrice: 52000,
    sku: 'LAB-001',
    createdAt: '2026-03-01',
    variants: [variant('Carmesí', { color: '#a00' }), variant('Nude Rosado', { sku: 'LAB-002' })],
  }),
  product('c', {
    name: 'Sérum Vitamina C',
    category: 'cuidado-de-la-piel',
    categoryName: 'Cuidado de la piel',
    brand: 'botanica',
    brandName: 'Botánica Pura',
    tags: ['Vegano', 'antimanchas'],
    price: 89000,
    shortDescription: 'Ilumina y unifica el tono',
    createdAt: '2026-02-01',
  }),
  product('d', {
    name: 'Perfume Floral',
    category: 'fragancias',
    categoryName: 'Fragancias',
    brand: 'lumiere',
    brandName: 'Lumière',
    price: 165000,
    originalPrice: 189000,
    createdAt: '2026-02-01',
    variants: [
      variant('30 ml', { price: 110000, originalPrice: 125000 }),
      variant('50 ml'),
      variant('100 ml', { price: 220000, available: false }),
    ],
  }),
  product('e', { name: 'Body Mist Vainilla', category: 'fragancias', categoryName: 'Fragancias', price: 38000, inStock: false }),
  product('f', {
    name: 'Esmalte en Gel',
    category: 'unas',
    categoryName: 'Uñas',
    brand: 'velvet',
    brandName: 'Velvet Studio',
    price: 20000,
    variants: [variant('Rojo', { available: false }), variant('Rosa', { available: false })],
  }),
];

const ids = (list: Product[]) => list.map((p) => p._id);
const run = (filters: Parameters<typeof filterAndSortProducts>[1]) => ids(filterAndSortProducts(catalog, filters));

describe('búsqueda', () => {
  it('no distingue tildes ni mayúsculas: "rimel" encuentra "Rímel"', () => {
    expect(normalizeText('  RÍMEL  Ñandú ')).toBe('rimel  nandu');
    expect(run({ q: 'rimel' })).toEqual(['a']);
    expect(run({ q: 'SERUM' })).toEqual(['c']);
    expect(run({ q: 'lumiere' })).toEqual(['a', 'd']);
  });

  it('busca en marca, categoría, etiquetas, referencia, opciones y descripción corta', () => {
    expect(run({ q: 'velvet' })).toEqual(['b', 'f']);
    expect(run({ q: 'fragancias' })).toEqual(['d', 'e']);
    expect(run({ q: 'antimanchas' })).toEqual(['c']);
    expect(run({ q: 'lab-002' })).toEqual(['b']);
    expect(run({ q: 'carmesi' })).toEqual(['b']);
    expect(run({ q: 'unifica' })).toEqual(['c']);
  });

  it('todas las palabras deben aparecer (en cualquier campo)', () => {
    expect(run({ q: 'labial vegano' })).toEqual(['b']);
    expect(run({ q: 'labial serum' })).toEqual([]);
  });

  it('búsqueda vacía o con espacios no filtra', () => {
    expect(run({ q: '   ' })).toHaveLength(catalog.length);
    expect(run({})).toEqual(ids(catalog));
  });
});

describe('filtros', () => {
  it('categoría', () => {
    expect(run({ category: 'fragancias' })).toEqual(['d', 'e']);
  });

  it('marcas: cualquiera de las elegidas', () => {
    expect(run({ brands: ['lumiere'] })).toEqual(['a', 'd']);
    expect(run({ brands: ['lumiere', 'botanica'] })).toEqual(['a', 'c', 'd']);
    expect(run({ brands: [] })).toHaveLength(catalog.length);
  });

  it('etiquetas: cualquiera de las elegidas, sin importar tildes ni mayúsculas', () => {
    expect(run({ tags: ['vegano'] })).toEqual(['b', 'c']);
    expect(run({ tags: ['LARGA DURACION'] })).toEqual(['b']);
    expect(run({ tags: ['antimanchas', 'a prueba de agua'] })).toEqual(['a', 'c']);
  });

  it('solo ofertas: descuento del producto o de una opción disponible', () => {
    expect(run({ offers: true })).toEqual(['b', 'd']);
  });

  it('solo disponibles: excluye agotados y productos sin ninguna opción disponible', () => {
    expect(run({ available: true })).toEqual(['a', 'b', 'c', 'd']);
    expect(isAvailable(catalog[5])).toBe(false);
  });

  it('rango de precio sobre el precio "desde"', () => {
    expect(run({ minPrice: 40000, maxPrice: 100000 })).toEqual(['b', 'c']);
    expect(run({ maxPrice: 39000 })).toEqual(['a', 'e', 'f']);
    // El perfume cuesta "desde" 110.000 (su opción más barata disponible)
    expect(run({ minPrice: 100000, maxPrice: 120000 })).toEqual(['d']);
  });

  it('combinaciones de filtros', () => {
    expect(run({ brands: ['lumiere'], offers: true })).toEqual(['d']);
    expect(run({ category: 'maquillaje', tags: ['vegano'], q: 'rojo' })).toEqual(['b']);
    expect(run({ category: 'fragancias', available: true, maxPrice: 150000 })).toEqual(['d']);
    expect(run({ brands: ['velvet'], available: true, offers: true, q: 'labial' })).toEqual(['b']);
    expect(run({ category: 'unas', offers: true })).toEqual([]);
  });

  it('no modifica la lista original', () => {
    const copy = [...catalog];
    filterAndSortProducts(catalog, { sort: 'price-desc', q: 'a' });
    expect(catalog).toEqual(copy);
  });
});

describe('orden', () => {
  it('destacados respeta el orden manual', () => {
    expect(run({ sort: 'featured' })).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('precio usa el precio "desde" y es estable ante empates', () => {
    const tie = [product('x', { price: 10 }), product('y', { price: 5 }), product('z', { price: 10 })];
    expect(ids(filterAndSortProducts(tie, { sort: 'price-asc' }))).toEqual(['y', 'x', 'z']);
    expect(ids(filterAndSortProducts(tie, { sort: 'price-desc' }))).toEqual(['x', 'z', 'y']);
    expect(run({ sort: 'price-asc' })).toEqual(['f', 'e', 'a', 'b', 'c', 'd']);
  });

  it('novedades: más recientes primero; misma fecha o sin fecha conserva el orden manual', () => {
    expect(run({ sort: 'newest' })).toEqual(['b', 'c', 'd', 'a', 'e', 'f']);
  });

  it('nombre A-Z sin importar tildes', () => {
    expect(run({ sort: 'name-asc' })).toEqual(['e', 'f', 'b', 'd', 'a', 'c']);
  });

  it('mayor descuento', () => {
    // b: 13 %; d: 13 % (189→165 del producto) y 12 % (125→110 de una opción): empate, orden manual
    expect(run({ sort: 'discount' }).slice(0, 2)).toEqual(['b', 'd']);
  });

  it('un orden desconocido se trata como destacados', () => {
    expect(run({ sort: 'raro' as never })).toEqual(ids(catalog));
  });
});

describe('precio "desde" y descuento', () => {
  it('toma la opción disponible más barata; sin opciones, el precio del producto', () => {
    expect(priceRange(catalog[3])).toEqual({ min: 110000, max: 165000 });
    expect(fromPrice(catalog[0])).toBe(39000);
    // Todas las opciones agotadas: se usa el precio del producto
    expect(fromPrice(catalog[5])).toBe(20000);
  });

  it('descuento en porcentaje entero', () => {
    expect(discountPercent(catalog[1])).toBe(13);
    expect(discountPercent(catalog[0])).toBe(0);
    expect(discountPercent(product('p', { price: 100, originalPrice: 80 }))).toBe(0);
  });
});

describe('opciones de los filtros (conteo)', () => {
  it('cuenta con el resto de filtros activos y ordena alfabéticamente', () => {
    const facets = getFacets(catalog, { category: 'fragancias' });
    expect(facets.brands.map((b) => [b.label, b.count])).toEqual([['Lumière', 1]]);
    expect(facets.offersCount).toBe(1);
    expect(facets.availableCount).toBe(1);
  });

  it('el conteo de marcas ignora el propio filtro de marcas', () => {
    const facets = getFacets(catalog, { brands: ['lumiere'] });
    expect(Object.fromEntries(facets.brands.map((b) => [b.value, b.count]))).toEqual({
      botanica: 1,
      lumiere: 2,
      velvet: 2,
    });
  });

  it('etiquetas agrupadas sin importar mayúsculas; las elegidas se conservan aunque queden en 0', () => {
    const all = getFacets(catalog, {});
    expect(all.tags.find((t) => normalizeText(t.value) === 'vegano')?.count).toBe(2);
    const narrowed = getFacets(catalog, { q: 'perfume', tags: ['vegano'] });
    expect(narrowed.tags.map((t) => t.value)).toEqual(['vegano']);
  });

  it('precio mínimo y máximo del catálogo y si hay agotados', () => {
    const facets = getFacets(catalog, {});
    expect(facets.price).toEqual({ min: 20000, max: 110000 });
    expect(facets.hasUnavailable).toBe(true);
    expect(getFacets([], {}).price).toBeNull();
  });
});

describe('rendimiento', () => {
  it('300 productos: filtrar, ordenar y contar opciones es instantáneo', () => {
    const many = Array.from({ length: 300 }, (_, i) => {
      const base = demoProducts[i % demoProducts.length];
      return { ...base, _id: `${base._id}-${i}`, slug: `${base.slug}-${i}`, price: base.price + i };
    });
    const start = performance.now();
    for (const q of ['r', 'ri', 'rim', 'rime', 'rimel']) {
      filterAndSortProducts(many, { q, sort: 'price-asc', offers: false });
      getFacets(many, { q });
    }
    const perKeystroke = (performance.now() - start) / 5;
    const found = filterAndSortProducts(many, { q: 'rimel' });
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((p) => p.name.startsWith('Máscara'))).toBe(true);
    expect(perKeystroke).toBeLessThan(50);
  });
});
