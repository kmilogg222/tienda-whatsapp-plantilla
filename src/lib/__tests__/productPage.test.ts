import { describe, expect, it } from 'vitest';
import { evaluate, parse } from 'groq-js';
import type { Product, ProductVariant } from '@/types/catalog';
import {
  defaultVariant,
  findVariant,
  galleryImages,
  productPath,
  selectedVariant,
  slugify,
  variantFromParams,
  variantImageIndex,
  variantOffer,
  variantParamName,
} from '@/lib/catalog/variants';
import { pickRelatedProducts, RELATED_LIMIT } from '@/lib/catalog/related';
import { absoluteUrl, ogImage, productJsonLd, serializeJsonLd } from '@/lib/catalog/seo';
import { RELATED_PRODUCTS_QUERY, PRODUCT_BY_SLUG_QUERY } from '@/lib/sanity/queries';
import { toProduct, type RawProduct } from '@/lib/sanity/mappers';
import { normalizeSettings } from '@/lib/settings';
import { demoProducts } from '@/lib/demo/catalog';
import { buildDemoDocuments, demoImageFiles, demoProductId } from '@/lib/demo/sanityDocuments';

const SITE = 'https://mitienda.test';
const settings = normalizeSettings({ storeName: 'Tienda', whatsappNumber: '573001234567', currencyCode: 'COP' });

const variant = (patch: Partial<ProductVariant> & { name: string }): ProductVariant => ({
  key: slugify(patch.name),
  available: true,
  ...patch,
});

const lipstick: Product = {
  _id: 'p1',
  name: 'Labial Mate',
  slug: 'labial-mate',
  price: 45000,
  originalPrice: 52000,
  sku: 'LAB-01',
  category: 'labios',
  categoryName: 'Labios',
  brand: 'velvet',
  brandName: 'Velvet',
  images: [{ url: '/demo/labial.webp', alt: 'Labial' }],
  description: 'Descripción',
  tags: [],
  inStock: true,
  variantLabel: 'Tono',
  variants: [
    variant({ name: 'Vino', color: '#6E1A2D', available: false, image: { url: '/demo/vino.webp', alt: 'Vino' } }),
    variant({ name: 'Rojo Carmesí', color: '#B0263A', sku: 'LAB-01-RC', image: { url: '/demo/labial.webp', alt: 'Rojo' } }),
    variant({ name: 'Coral', price: 39000, image: { url: '/demo/coral.webp', alt: 'Coral' } }),
    variant({ name: 'Nude', price: 48000, originalPrice: 50000 }),
  ],
  infoSections: [],
};

describe('opciones en la dirección', () => {
  it('convierte nombres en texto apto para la dirección', () => {
    expect(slugify('Rojo Carmesí')).toBe('rojo-carmesi');
    expect(slugify('  Tamaño / 30 ml ')).toBe('tamano-30-ml');
    expect(slugify('¡!')).toBe('');
  });

  it('el parámetro sale del nombre de las opciones ("Tono" → tono)', () => {
    expect(variantParamName(lipstick)).toBe('tono');
    expect(variantParamName({ variantLabel: 'Tamaño' })).toBe('tamano');
    expect(variantParamName({})).toBe('opcion');
  });

  it('encuentra la opción sin importar tildes ni mayúsculas', () => {
    expect(findVariant(lipstick, 'rojo-carmesi')?.name).toBe('Rojo Carmesí');
    expect(findVariant(lipstick, 'Rojo Carmesí')?.name).toBe('Rojo Carmesí');
    expect(findVariant(lipstick, 'no-existe')).toBeUndefined();
    expect(findVariant(lipstick, '')).toBeUndefined();
  });

  it('preselecciona la primera disponible (o la primera si todas están agotadas)', () => {
    expect(defaultVariant(lipstick)?.name).toBe('Rojo Carmesí');
    const allSoldOut = { ...lipstick, variants: lipstick.variants.map((v) => ({ ...v, available: false })) };
    expect(defaultVariant(allSoldOut)?.name).toBe('Vino');
    expect(defaultVariant({ ...lipstick, variants: [] })).toBeUndefined();
  });

  it('lee la opción de la dirección; si no existe usa la preseleccionada', () => {
    expect(selectedVariant(lipstick, new URLSearchParams('tono=coral'))?.name).toBe('Coral');
    expect(selectedVariant(lipstick, { tono: ['nude', 'coral'] })?.name).toBe('Nude');
    // Un tono agotado pedido en la dirección se respeta (para preguntar por él)
    expect(selectedVariant(lipstick, { tono: 'vino' })?.name).toBe('Vino');
    expect(selectedVariant(lipstick, { tono: 'azul' })?.name).toBe('Rojo Carmesí');
    expect(variantFromParams(lipstick, {})).toBeUndefined();
  });

  it('acepta ?tono= y ?opcion= aunque las opciones se llamen distinto', () => {
    const serum = { ...lipstick, variantLabel: 'Tamaño' };
    expect(variantFromParams(serum, { tamano: 'coral' })?.name).toBe('Coral');
    expect(variantFromParams(serum, { tono: 'coral' })?.name).toBe('Coral');
    expect(variantFromParams(serum, { opcion: 'coral' })?.name).toBe('Coral');
  });

  it('arma la dirección de la ficha con la opción', () => {
    expect(productPath(lipstick)).toBe('/producto/labial-mate');
    expect(productPath(lipstick, lipstick.variants[1])).toBe('/producto/labial-mate?tono=rojo-carmesi');
  });
});

describe('precio, referencia y disponibilidad de la opción', () => {
  const [vino, rojo, coral, nude] = lipstick.variants;

  it('sin precio propio hereda precio y precio "antes" del producto', () => {
    expect(variantOffer(lipstick, rojo)).toEqual({
      price: 45000,
      originalPrice: 52000,
      discount: 13,
      sku: 'LAB-01-RC',
      available: true,
    });
  });

  it('con precio propio no hereda el precio "antes" ni la referencia vacía', () => {
    expect(variantOffer(lipstick, coral)).toEqual({ price: 39000, discount: 0, sku: 'LAB-01', available: true });
    expect(variantOffer(lipstick, nude)).toMatchObject({ price: 48000, originalPrice: 50000, discount: 4 });
  });

  it('una opción agotada o un producto agotado no se pueden pedir', () => {
    expect(variantOffer(lipstick, vino).available).toBe(false);
    expect(variantOffer({ ...lipstick, inStock: false }, rojo).available).toBe(false);
  });

  it('producto sin opciones: su propio precio y disponibilidad', () => {
    const simple = { ...lipstick, variants: [] };
    expect(variantOffer(simple)).toEqual({ price: 45000, originalPrice: 52000, discount: 13, sku: 'LAB-01', available: true });
    expect(variantOffer({ ...simple, originalPrice: 40000 })).toEqual({ price: 45000, discount: 0, sku: 'LAB-01', available: true });
  });
});

describe('galería', () => {
  it('agrega las fotos de las opciones sin repetir', () => {
    expect(galleryImages(lipstick).map((i) => i.url)).toEqual(['/demo/labial.webp', '/demo/vino.webp', '/demo/coral.webp']);
  });

  it('ubica la foto de cada opción', () => {
    const images = galleryImages(lipstick);
    expect(variantImageIndex(images, lipstick.variants[2])).toBe(2);
    expect(variantImageIndex(images, lipstick.variants[1])).toBe(0);
    expect(variantImageIndex(images, lipstick.variants[3])).toBe(-1);
    expect(variantImageIndex(images, undefined)).toBe(-1);
  });
});

describe('productos relacionados', () => {
  const make = (id: string, patch: Partial<Product>): Product => ({ ...lipstick, _id: id, slug: id, variants: [], ...patch });
  const candidates = [
    make('otra-marca', { category: 'ojos', brand: 'otra' }),
    make('misma-marca', { category: 'ojos' }),
    make('misma-cat-1', { brand: 'otra' }),
    make('agotado', { inStock: false }),
    lipstick,
    make('misma-cat-2', {}),
  ];

  it('primero la misma categoría, luego la misma marca; sin el actual ni agotados', () => {
    expect(pickRelatedProducts(lipstick, candidates).map((p) => p._id)).toEqual([
      'misma-cat-1',
      'misma-cat-2',
      'misma-marca',
    ]);
  });

  it('respeta el límite', () => {
    const many = Array.from({ length: 10 }, (_, i) => make(`p${i}`, {}));
    expect(pickRelatedProducts(lipstick, many)).toHaveLength(RELATED_LIMIT);
    expect(pickRelatedProducts(lipstick, many, 2)).toHaveLength(2);
  });

  it('sin categoría ni marca no hay relacionados', () => {
    expect(pickRelatedProducts({ ...lipstick, category: '', brand: undefined }, candidates)).toEqual([]);
  });
});

describe('consultas de la ficha (GROQ)', () => {
  const project = { projectId: 'abc123', dataset: 'production' };
  const assets = Object.fromEntries(demoImageFiles().map((file) => [file, `image-${file}-800x1000-webp`]));
  const docs = [
    ...buildDemoDocuments(assets),
    ...Object.entries(assets).map(([file, id]) => ({
      _id: id,
      _type: 'sanity.imageAsset',
      url: `https://cdn.sanity.io/images/abc123/production/${file}-800x1000.webp`,
    })),
  ];

  async function run<T>(query: string, params: Record<string, unknown>, dataset: object[] = docs): Promise<T> {
    const result = await evaluate(parse(query, { params }), { dataset, params });
    return (await result.get()) as T;
  }

  async function related(product: Product, dataset?: object[]) {
    const data = await run<{ sameCategory: RawProduct[]; sameBrand: RawProduct[] }>(
      RELATED_PRODUCTS_QUERY,
      { id: product._id, category: product.category || null, brand: product.brand ?? null },
      dataset
    );
    return pickRelatedProducts(product, [...data.sameCategory, ...data.sameBrand].map((p) => toProduct(p, project)));
  }

  it.each(demoProducts.map((p) => [p.slug, p] as const))(
    'relacionados de "%s": lo mismo que el modo demostración',
    async (slug, demo) => {
      const raw = await run<RawProduct>(PRODUCT_BY_SLUG_QUERY, { slug });
      const product = toProduct(raw, project);
      const expected = pickRelatedProducts(demo, demoProducts).map((p) => p.slug);
      expect((await related(product)).map((p) => p.slug)).toEqual(expected);
    }
  );

  it('los productos ocultos no tienen ficha ni salen como relacionados', async () => {
    const hiddenId = demoProductId('base-liquida-cobertura-media');
    const dataset = docs.map((d) => ((d as { _id: string })._id === hiddenId ? { ...d, hidden: true } : d));
    expect(await run(PRODUCT_BY_SLUG_QUERY, { slug: 'base-liquida-cobertura-media' }, dataset)).toBeNull();
    const raw = await run<RawProduct>(PRODUCT_BY_SLUG_QUERY, { slug: 'labial-mate-larga-duracion' }, dataset);
    const ids = (await related(toProduct(raw, project), dataset)).map((p) => p._id);
    expect(ids).not.toContain(hiddenId);
    expect(ids.length).toBeGreaterThan(0);
  });
});

describe('SEO de la ficha', () => {
  it('completa las rutas locales con la dirección del sitio', () => {
    expect(absoluteUrl('/demo/a.webp', SITE)).toBe(`${SITE}/demo/a.webp`);
    expect(absoluteUrl('https://cdn.sanity.io/x.jpg', SITE)).toBe('https://cdn.sanity.io/x.jpg');
  });

  it('recorta la foto de Sanity a 1200×630 alrededor del punto focal', () => {
    const og = ogImage(
      { url: 'https://cdn.sanity.io/images/p/d/abc-800x1000.jpg?rect=0,0,800,900', alt: 'Labial', focalPoint: { x: 0.3, y: 0.7 } },
      SITE
    );
    const url = new URL(og.url);
    expect(url.searchParams.get('rect')).toBe('0,0,800,900');
    expect(url.searchParams.get('w')).toBe('1200');
    expect(url.searchParams.get('h')).toBe('630');
    expect(url.searchParams.get('fit')).toBe('crop');
    expect(url.searchParams.get('crop')).toBe('focalpoint');
    expect(url.searchParams.get('fp-x')).toBe('0.300');
    expect(url.searchParams.get('fp-y')).toBe('0.700');
    expect(og).toMatchObject({ width: 1200, height: 630, alt: 'Labial' });
  });

  it('las fotos locales se usan tal cual (con dirección completa)', () => {
    expect(ogImage({ url: '/demo/a.webp', alt: 'A', width: 800, height: 1000 }, SITE)).toEqual({
      url: `${SITE}/demo/a.webp`,
      alt: 'A',
      width: 800,
      height: 1000,
    });
  });

  it('JSON-LD: una oferta por opción con precio, moneda y disponibilidad', () => {
    const data = productJsonLd(lipstick, settings, SITE) as {
      offers: { name: string; price: number; priceCurrency: string; availability: string; url: string; sku?: string }[];
      brand: unknown;
      image: string[];
    };
    expect(data).toMatchObject({ '@type': 'Product', name: 'Labial Mate', sku: 'LAB-01', category: 'Labios' });
    expect(data.brand).toEqual({ '@type': 'Brand', name: 'Velvet' });
    expect(data.image[0]).toBe(`${SITE}/demo/labial.webp`);
    expect(data.offers).toHaveLength(4);
    expect(data.offers[0]).toMatchObject({
      name: 'Vino',
      price: 45000,
      priceCurrency: 'COP',
      availability: 'https://schema.org/OutOfStock',
      url: `${SITE}/producto/labial-mate?tono=vino`,
    });
    expect(data.offers[2]).toMatchObject({ name: 'Coral', price: 39000, availability: 'https://schema.org/InStock' });
  });

  it('JSON-LD: producto sin opciones tiene una sola oferta', () => {
    const data = productJsonLd({ ...lipstick, variants: [], inStock: false, brandName: undefined }, settings, SITE);
    expect(data.brand).toBeUndefined();
    expect(data.offers).toMatchObject({ '@type': 'Offer', price: 45000, availability: 'https://schema.org/OutOfStock' });
  });

  it('el JSON no puede cerrar la etiqueta <script>', () => {
    expect(serializeJsonLd({ name: '</script><script>alert(1)</script>' })).not.toContain('<');
  });
});
