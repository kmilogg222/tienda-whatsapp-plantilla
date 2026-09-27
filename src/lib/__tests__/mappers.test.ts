import { describe, expect, it } from 'vitest';
import { toBrand, toCategory, toHomePage, toLinkTarget, toProduct } from '@/lib/sanity/mappers';

const project = { projectId: 'abc123', dataset: 'production' };
const asset = (id: string) => ({
  assetId: `image-${id}-800x1000-jpg`,
  url: `https://cdn.sanity.io/images/abc123/production/${id}-800x1000.jpg`,
});

describe('toProduct', () => {
  it('producto v1 (sin campos nuevos) funciona igual que antes', () => {
    const product = toProduct(
      { _id: 'p1', name: 'Labial', slug: 'labial', price: 45000, category: 'labios', images: [asset('a')], inStock: true },
      project
    );
    expect(product).toMatchObject({
      _id: 'p1',
      name: 'Labial',
      slug: 'labial',
      price: 45000,
      category: 'labios',
      description: '',
      tags: [],
      variants: [],
      infoSections: [],
    });
    expect(product.images[0].alt).toBe('Labial');
    expect(product.brand).toBeUndefined();
  });

  it('usa el texto alternativo escrito en el panel', () => {
    const product = toProduct({ _id: 'p1', name: 'Labial', images: [{ ...asset('a'), alt: 'Labial rojo abierto' }] }, project);
    expect(product.images[0].alt).toBe('Labial rojo abierto');
  });

  it('convierte marca, etiquetas, variantes e información', () => {
    const product = toProduct(
      {
        _id: 'p2',
        name: 'Labial Mate',
        slug: 'labial-mate',
        price: 45000,
        brand: 'maybelline',
        brandName: 'Maybelline',
        tags: ['vegano', '', null, 'larga duración'],
        badge: 'Nuevo',
        variantLabel: 'Tono',
        variants: [
          { _key: 'v1', name: 'Rojo Carmesí', color: '#B0263A', image: asset('rojo'), available: true },
          { _key: 'v2', name: 'Nude', color: 'beige', price: 52000, originalPrice: 60000, sku: 'LAB-N', available: false },
          { _key: 'v3', name: '' },
          null,
        ],
        infoSections: [
          { title: 'Modo de uso', body: 'Aplicar sobre labios secos.' },
          { title: 'Vacío', body: '' },
        ],
      },
      project
    );
    expect(product.brand).toBe('maybelline');
    expect(product.brandName).toBe('Maybelline');
    expect(product.tags).toEqual(['vegano', 'larga duración']);
    expect(product.badge).toBe('Nuevo');
    expect(product.variantLabel).toBe('Tono');
    expect(product.variants).toHaveLength(2);
    expect(product.variants[0]).toMatchObject({ key: 'v1', name: 'Rojo Carmesí', color: '#B0263A', available: true });
    expect(product.variants[0].image?.alt).toBe('Labial Mate - Rojo Carmesí');
    // color inválido se descarta; precio propio y agotada se conservan
    expect(product.variants[1]).toEqual({
      key: 'v2',
      name: 'Nude',
      price: 52000,
      originalPrice: 60000,
      sku: 'LAB-N',
      available: false,
    });
    expect(product.infoSections).toEqual([{ title: 'Modo de uso', body: 'Aplicar sobre labios secos.' }]);
  });

  it('descarta insignias desconocidas', () => {
    expect(toProduct({ _id: 'p3', badge: 'Inventada' }, project).badge).toBeUndefined();
  });
});

describe('toCategory y toBrand', () => {
  it('conserva íconos antiguos y convierte la foto', () => {
    const category = toCategory({ _id: 'c1', name: 'Audio', slug: 'audio', icon: 'Headphones', image: asset('c') }, project);
    expect(category.icon).toBe('Headphones');
    expect(category.image?.alt).toBe('Audio');
  });

  it('marca con logo', () => {
    const brand = toBrand({ _id: 'b1', name: 'Maybelline', slug: 'maybelline', logo: asset('logo') }, project);
    expect(brand).toMatchObject({ _id: 'b1', name: 'Maybelline', slug: 'maybelline' });
    expect(brand.logo?.url).toContain('logo');
  });
});

describe('toLinkTarget', () => {
  it('resuelve cada tipo de destino', () => {
    expect(toLinkTarget({ linkType: 'catalog' })).toEqual({ type: 'catalog' });
    expect(toLinkTarget({ linkType: 'brand', brandSlug: 'mac' })).toEqual({ type: 'brand', brandSlug: 'mac' });
    expect(toLinkTarget({ linkType: 'product', productSlug: 'labial' })).toEqual({ type: 'product', productSlug: 'labial' });
    expect(toLinkTarget({ linkType: 'url', url: 'https://instagram.com/x' })).toEqual({
      type: 'url',
      url: 'https://instagram.com/x',
    });
  });

  it('descarta destinos incompletos o desconocidos', () => {
    expect(toLinkTarget({ linkType: 'category' })).toBeUndefined();
    expect(toLinkTarget({ linkType: 'otro' })).toBeUndefined();
    expect(toLinkTarget(null)).toBeUndefined();
  });
});

describe('toHomePage', () => {
  it('sin documento devuelve una portada vacía', () => {
    expect(toHomePage(null, project)).toEqual({ sections: [] });
    expect(toHomePage({ sections: null }, project)).toEqual({ sections: [] });
  });

  it('convierte cada tipo de sección conservando el orden', () => {
    const home = toHomePage(
      {
        sections: [
          {
            _type: 'heroBanner',
            _key: 'h',
            slides: [
              { _key: 's1', image: asset('hero'), title: 'Nueva colección', buttonText: 'Ver', link: { linkType: 'catalog' } },
              { _key: 's2', title: 'Sin imagen' },
            ],
          },
          { _type: 'productShelf', _key: 'p', title: 'Novedades', source: 'newest', limit: 50 },
          { _type: 'productShelf', _key: 'm', title: 'Elegidos', source: 'manual', productIds: ['a', 'b'] },
          { _type: 'categoryGrid', _key: 'c', style: 'cards' },
          { _type: 'brandStrip', _key: 'b', title: 'Marcas' },
          { _type: 'infoBlocks', _key: 'i', items: [{ _key: 'x', icon: 'truck', title: 'Envíos' }, { _key: 'y', title: '' }] },
          { _type: 'textBanner', _key: 't', title: 'Kit', text: 'Promo', link: { linkType: 'brand', brandSlug: 'mac' } },
          { _type: 'socialCta', _key: 's', title: 'Síguenos' },
        ],
      },
      project
    );
    expect(home.sections.map((s) => s.type)).toEqual([
      'heroBanner',
      'productShelf',
      'productShelf',
      'categoryGrid',
      'brandStrip',
      'infoBlocks',
      'textBanner',
      'socialCta',
    ]);
    const [hero, shelf, manual, grid, , info, banner] = home.sections;
    expect(hero.type === 'heroBanner' && hero.slides).toHaveLength(1);
    expect(hero.type === 'heroBanner' && hero.autoplay).toBe(true);
    expect(shelf.type === 'productShelf' && shelf.limit).toBe(24);
    expect(manual.type === 'productShelf' && manual.productIds).toEqual(['a', 'b']);
    expect(grid.type === 'categoryGrid' && grid.style).toBe('cards');
    expect(info.type === 'infoBlocks' && info.items).toEqual([{ key: 'x', icon: 'truck', title: 'Envíos' }]);
    expect(banner.type === 'textBanner' && banner.link).toEqual({ type: 'brand', brandSlug: 'mac' });
  });

  it('descarta secciones vacías o de tipos desconocidos', () => {
    const home = toHomePage(
      {
        sections: [
          { _type: 'heroBanner', slides: [] },
          { _type: 'infoBlocks', items: [] },
          { _type: 'textBanner' },
          { _type: 'socialCta' },
          { _type: 'seccionInventada', title: 'x' },
          null,
        ],
      },
      project
    );
    expect(home.sections).toEqual([]);
  });

  it('un estante con fuente desconocida usa "novedades"', () => {
    const home = toHomePage({ sections: [{ _type: 'productShelf', title: 'X', source: 'raro' }] }, project);
    expect(home.sections[0]).toMatchObject({ type: 'productShelf', source: 'newest', limit: 8 });
  });
});
