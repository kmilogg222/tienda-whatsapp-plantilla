/**
 * Datos de ejemplo convertidos al modelo de la web (modo demostración, sin Sanity).
 */
import type { Brand, CatalogImage, Category, HomePage, HomeSection, Product, StoreSettings } from '@/types/catalog';
import { normalizeSettings } from '../settings';
import {
  DEMO_BRANDS,
  DEMO_CATEGORIES,
  DEMO_HOME,
  DEMO_PRODUCTS,
  DEMO_SETTINGS,
  DEMO_WHATSAPP_NUMBER,
  DemoImage,
  demoImageUrl,
} from './data';

const image = (file: DemoImage, alt: string): CatalogImage => ({ url: demoImageUrl(file), alt });

export const demoStoreSettings: StoreSettings = normalizeSettings({
  ...DEMO_SETTINGS,
  cardOptions: { ...DEMO_SETTINGS.cardOptions },
  enabledFilters: [...DEMO_SETTINGS.enabledFilters],
  trustBadges: DEMO_SETTINGS.trustBadges.map((badge) => ({ ...badge })),
  whatsappNumber: DEMO_WHATSAPP_NUMBER,
});

export const demoCategories: Category[] = DEMO_CATEGORIES.map((category) => ({
  _id: `demo-category-${category.id}`,
  name: category.name,
  slug: category.id,
  icon: category.icon,
  image: image(category.image, category.name),
  description: category.description,
}));

export const demoBrands: Brand[] = DEMO_BRANDS.map((brand) => ({
  _id: `demo-brand-${brand.id}`,
  name: brand.name,
  slug: brand.id,
  logo: image(brand.logo, brand.name),
  description: brand.description,
}));

const categoryName = (id: string) => DEMO_CATEGORIES.find((c) => c.id === id)?.name;
const brandName = (id: string) => DEMO_BRANDS.find((b) => b.id === id)?.name;

/** Todos los productos de ejemplo (incluidos los agotados). */
export const demoProducts: Product[] = DEMO_PRODUCTS.map((product) => ({
  _id: `demo-product-${product.id}`,
  name: product.name,
  slug: product.id,
  price: product.price,
  ...(product.originalPrice ? { originalPrice: product.originalPrice } : {}),
  sku: product.sku,
  category: product.category,
  categoryName: categoryName(product.category),
  brand: product.brand,
  brandName: brandName(product.brand),
  images: product.images.map((file) => image(file, product.name)),
  description: product.description,
  shortDescription: product.shortDescription,
  features: product.features,
  tags: product.tags,
  inStock: product.inStock,
  ...(product.badge ? { badge: product.badge } : {}),
  ...(product.variantLabel ? { variantLabel: product.variantLabel } : {}),
  variants: (product.variants ?? []).map((variant, index) => ({
    key: `${product.id}-opcion-${index}`,
    name: variant.name,
    available: variant.available !== false,
    ...(variant.color ? { color: variant.color } : {}),
    ...(variant.image ? { image: image(variant.image, `${product.name} - ${variant.name}`) } : {}),
    ...(variant.price !== undefined ? { price: variant.price } : {}),
    ...(variant.originalPrice !== undefined ? { originalPrice: variant.originalPrice } : {}),
    ...(variant.sku ? { sku: variant.sku } : {}),
  })),
  infoSections: product.infoSections ?? [],
}));

export const demoHomePage: HomePage = {
  sections: DEMO_HOME.map((section, index): HomeSection => {
    const key = `demo-seccion-${index}`;
    switch (section.type) {
      case 'heroBanner':
        return {
          type: 'heroBanner',
          key,
          autoplay: true,
          slides: section.slides.map((slide, i) => ({
            key: `${key}-${i}`,
            image: image(slide.image, slide.title),
            mobileImage: image(slide.mobileImage, slide.title),
            title: slide.title,
            subtitle: slide.subtitle,
            buttonText: slide.buttonText,
            link: { type: 'category', categorySlug: slide.category },
          })),
        };
      case 'productShelf':
        // Los productos los elige getHomePage() (respeta "Productos agotados" de la configuración)
        return {
          type: 'productShelf',
          key,
          title: section.title,
          source: section.source,
          productIds: [],
          limit: section.limit,
          products: [],
        };
      case 'categoryGrid':
        return { type: 'categoryGrid', key, title: section.title, style: section.style };
      case 'brandStrip':
        return { type: 'brandStrip', key, title: section.title };
      case 'infoBlocks':
        return {
          type: 'infoBlocks',
          key,
          title: section.title,
          items: section.items.map((item, i) => ({ key: `${key}-${i}`, ...item })),
        };
      case 'textBanner':
        return {
          type: 'textBanner',
          key,
          title: section.title,
          text: section.text,
          image: image(section.image, section.title),
          buttonText: section.buttonText,
          link: { type: 'product', productSlug: section.product },
        };
      case 'socialCta':
        return { type: 'socialCta', key, title: section.title, text: section.text };
    }
  }),
};
