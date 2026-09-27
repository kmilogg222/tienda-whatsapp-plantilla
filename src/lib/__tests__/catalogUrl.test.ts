import { describe, expect, it } from 'vitest';
import { countActiveFilters, filtersKey, filtersToQuery, parseFilters } from '@/lib/catalog/urlState';
import { catalogHref } from '@/lib/links';

const parse = (query: string, defaultSort?: Parameters<typeof parseFilters>[1]) =>
  parseFilters(new URLSearchParams(query), defaultSort);

describe('filtros en la dirección', () => {
  it('lee todos los filtros', () => {
    expect(
      parse('categoria=labios&marca=a&marca=b&etiqueta=vegano&min=20000&max=80000&oferta=1&disponible=1&orden=price-asc&q=rimel')
    ).toEqual({
      q: 'rimel',
      category: 'labios',
      brands: ['a', 'b'],
      tags: ['vegano'],
      minPrice: 20000,
      maxPrice: 80000,
      offers: true,
      available: true,
      sort: 'price-asc',
    });
  });

  it('sin filtros: todo vacío y el orden inicial de la tienda', () => {
    expect(parse('', 'newest')).toMatchObject({ q: '', brands: [], tags: [], offers: false, available: false, sort: 'newest' });
  });

  it('acepta marcas separadas por coma y quita repetidas', () => {
    expect(parse('marca=a,b&marca=a').brands).toEqual(['a', 'b']);
  });

  it('ignora valores raros sin fallar', () => {
    const filters = parse('min=abc&max=-5&orden=inventado&oferta=quizas');
    expect(filters.minPrice).toBeUndefined();
    expect(filters.maxPrice).toBe(5);
    expect(filters.sort).toBe('featured');
    expect(filters.offers).toBe(false);
  });

  it('si el mínimo es mayor que el máximo los intercambia', () => {
    expect(parse('min=90000&max=10000')).toMatchObject({ minPrice: 10000, maxPrice: 90000 });
  });

  it('también lee el objeto searchParams de la página', () => {
    expect(parseFilters({ marca: ['a', 'b'], categoria: 'labios', q: ' hola ' })).toMatchObject({
      brands: ['a', 'b'],
      category: 'labios',
      q: 'hola',
    });
  });

  it('ida y vuelta: escribir y leer da los mismos filtros', () => {
    const filters = parse('categoria=labios&marca=a&etiqueta=piel+grasa&min=1&oferta=1&orden=discount&q=rojo mate');
    expect(parse(filtersToQuery(filters))).toEqual(filters);
  });

  it('la dirección omite lo vacío y el orden inicial', () => {
    expect(filtersToQuery({ sort: 'featured', brands: [], q: '  ' })).toBe('');
    expect(filtersToQuery({ sort: 'newest' }, 'newest')).toBe('');
    expect(filtersToQuery({ sort: 'featured' }, 'newest')).toBe('orden=featured');
  });

  it('los enlaces de la portada se leen como filtros', () => {
    const read = (href: string) => parse(href.split('?')[1] ?? '');
    expect(read(catalogHref({ oferta: true }))).toMatchObject({ offers: true });
    expect(read(catalogHref({ orden: 'newest' }))).toMatchObject({ sort: 'newest' });
    expect(read(catalogHref({ marca: 'lumiere' }))).toMatchObject({ brands: ['lumiere'] });
  });

  it('cuenta los filtros elegidos (sin búsqueda, categoría ni orden)', () => {
    expect(countActiveFilters(parse('categoria=x&q=y&orden=newest'))).toBe(0);
    expect(countActiveFilters(parse('marca=a&marca=b&etiqueta=c&min=1&max=2&oferta=1&disponible=1'))).toBe(6);
  });

  it('la clave de filtros no cambia al cambiar el orden', () => {
    expect(filtersKey(parse('marca=a&orden=newest'))).toBe(filtersKey(parse('marca=a&orden=price-asc')));
    expect(filtersKey(parse('marca=a'))).not.toBe(filtersKey(parse('marca=b')));
  });
});
