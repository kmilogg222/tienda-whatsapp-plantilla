import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEMO_BRANDS, DEMO_CATEGORIES, DEMO_PRODUCTS } from '@/lib/demo/data';
import { demoCategories, demoHomePage, demoProducts, demoStoreSettings } from '@/lib/demo/catalog';
import {
  DEMO_ID_PREFIX,
  SINGLETON_IDS,
  buildDemoDocuments,
  buildDemoHomePage,
  buildDemoSettings,
  demoImageFiles,
} from '@/lib/demo/sanityDocuments';

const assets = Object.fromEntries(demoImageFiles().map((file) => [file, `image-${file}-800x1000-webp`]));

/** Recorre un objeto y devuelve todas las referencias que contiene. */
function collectRefs(value: unknown, found: { _ref: string; _weak?: boolean }[] = []) {
  if (Array.isArray(value)) value.forEach((item) => collectRefs(item, found));
  else if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (record._type === 'reference') found.push(record as { _ref: string; _weak?: boolean });
    Object.values(record).forEach((item) => collectRefs(item, found));
  }
  return found;
}

/** Devuelve las claves _key de cada arreglo (deben ser únicas dentro del arreglo). */
function arraysWithKeys(value: unknown, out: string[][] = []) {
  if (Array.isArray(value)) {
    if (value.some((item) => item && typeof item === 'object')) {
      out.push(value.map((item) => (item as { _key?: string })?._key ?? ''));
    }
    value.forEach((item) => arraysWithKeys(item, out));
  } else if (value && typeof value === 'object') Object.values(value).forEach((item) => arraysWithKeys(item, out));
  return out;
}

describe('datos de la tienda de ejemplo', () => {
  it('tiene 5 categorías, 4 marcas y al menos 12 productos', () => {
    expect(DEMO_CATEGORIES).toHaveLength(5);
    expect(DEMO_BRANDS).toHaveLength(4);
    expect(DEMO_PRODUCTS.length).toBeGreaterThanOrEqual(12);
  });

  it('cada producto usa una categoría y una marca existentes', () => {
    const categories = new Set(DEMO_CATEGORIES.map((c) => c.id));
    const brands = new Set(DEMO_BRANDS.map((b) => b.id));
    for (const product of DEMO_PRODUCTS) {
      expect(categories.has(product.category), product.id).toBe(true);
      expect(brands.has(product.brand), product.id).toBe(true);
    }
  });

  it('los identificadores son únicos', () => {
    const ids = DEMO_PRODUCTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todas las imágenes existen en public/demo', () => {
    for (const file of demoImageFiles()) {
      expect(existsSync(join(process.cwd(), 'public', 'demo', `${file}.webp`)), file).toBe(true);
    }
  });

  it('incluye productos con tonos, información extra, ofertas y uno agotado', () => {
    expect(DEMO_PRODUCTS.some((p) => p.variants?.some((v) => v.color))).toBe(true);
    expect(DEMO_PRODUCTS.some((p) => (p.infoSections?.length ?? 0) > 0)).toBe(true);
    expect(DEMO_PRODUCTS.some((p) => p.originalPrice && p.originalPrice > p.price)).toBe(true);
    expect(DEMO_PRODUCTS.some((p) => !p.inStock)).toBe(true);
  });
});

describe('documentos para Sanity', () => {
  const docs = buildDemoDocuments(assets);

  it('todos los _id empiezan con el prefijo de ejemplo (sin puntos, para que sean públicos)', () => {
    for (const doc of docs) {
      expect(doc._id.startsWith(DEMO_ID_PREFIX), doc._id).toBe(true);
      expect(doc._id).not.toContain('.');
    }
  });

  it('las referencias entre documentos de ejemplo son débiles y apuntan a documentos que existen', () => {
    const ids = new Set(docs.map((doc) => doc._id));
    const refs = collectRefs(docs).filter((r) => !r._ref.startsWith('image-'));
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) {
      expect(ref._weak, ref._ref).toBe(true);
      expect(ids.has(ref._ref), ref._ref).toBe(true);
    }
  });

  it('las fotos apuntan a los assets subidos', () => {
    const imageRefs = collectRefs(docs).filter((r) => r._ref.startsWith('image-'));
    const uploaded = new Set(Object.values(assets));
    for (const ref of imageRefs) expect(uploaded.has(ref._ref), ref._ref).toBe(true);
  });

  it('las claves _key son únicas dentro de cada lista', () => {
    const allDocs = [...docs, buildDemoHomePage(assets), buildDemoSettings()];
    for (const keys of allDocs.flatMap((doc) => arraysWithKeys(doc))) {
      expect(keys.every(Boolean), JSON.stringify(keys)).toBe(true);
      expect(new Set(keys).size, JSON.stringify(keys)).toBe(keys.length);
    }
  });

  it('el orden manual sigue el orden de la lista', () => {
    const products = docs.filter((doc) => doc._type === 'product').map((doc) => doc.orderRank as string);
    expect([...products].sort()).toEqual(products);
  });

  it('configuración y portada usan los ID fijos y la configuración no trae número de WhatsApp', () => {
    const settings = buildDemoSettings();
    expect(settings._id).toBe(SINGLETON_IDS.storeSettings);
    expect(settings).not.toHaveProperty('whatsappNumber');
    expect(buildDemoHomePage(assets)._id).toBe(SINGLETON_IDS.homePage);
  });

  it('falla con un mensaje claro si falta subir una foto', () => {
    expect(() => buildDemoDocuments({})).toThrow(/Falta subir la imagen/);
  });
});

describe('modo demostración (web sin Sanity)', () => {
  it('la configuración demo es de belleza y está completa', () => {
    expect(demoStoreSettings.storeName).toBe('Glow Studio');
    expect(demoStoreSettings.palette).toBe('blush-nude');
    expect(demoStoreSettings.whatsappNumber).toMatch(/^\d+$/);
    expect(demoStoreSettings.trustBadges).toHaveLength(3);
  });

  it('productos y categorías usan fotos locales', () => {
    expect(demoProducts.every((p) => p.images[0]?.url.startsWith('/demo/'))).toBe(true);
    expect(demoCategories.every((c) => c.image?.url.startsWith('/demo/'))).toBe(true);
  });

  it('la portada demo tiene todas las secciones', () => {
    expect(demoHomePage.sections.map((s) => s.type)).toEqual(
      expect.arrayContaining(['heroBanner', 'productShelf', 'categoryGrid', 'brandStrip', 'infoBlocks', 'textBanner', 'socialCta'])
    );
  });
});
