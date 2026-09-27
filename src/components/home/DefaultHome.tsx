import React from 'react';
import Link from 'next/link';
import type { Category, Product, StoreSettings } from '@/types/catalog';
import { CATALOG_PATH, catalogHref } from '@/lib/links';
import { sortNewest } from '@/lib/home';
import { ProductCard } from '../ProductCard';
import { CategoryGrid } from './CategoryGrid';
import { SectionHeading } from './SectionHeading';

interface DefaultHomeProps {
  settings: StoreSettings;
  products: Product[];
  categories: Category[];
}

/**
 * Portada automática: se muestra mientras la dueña no agregue secciones en
 * Portada → Secciones. Nombre y eslogan, categorías y los productos más recientes.
 */
export const DefaultHome: React.FC<DefaultHomeProps> = ({ settings, products, categories }) => {
  const { labels } = settings;
  const newest = sortNewest(products).slice(0, settings.pageSize);

  return (
    <>
      <section className="home-intro" aria-labelledby="home-intro-title">
        <div className="container home-intro-inner">
          <h1 id="home-intro-title" className="home-intro-title">
            {settings.storeName}
          </h1>
          {settings.tagline && <p className="home-intro-text">{settings.tagline}</p>}
          <Link href={CATALOG_PATH} className="btn-primary">
            {labels.homeHeroButton}
          </Link>
        </div>
      </section>

      <CategoryGrid id="categorias" title={labels.homeCategoriesTitle} style="circles" categories={categories} />

      <section className="home-section container" aria-labelledby="seccion-novedades">
        <SectionHeading
          id="seccion-novedades"
          title={labels.homeNewArrivalsTitle}
          action={{ href: catalogHref({ orden: 'newest' }), label: labels.viewAllLink }}
        />
        <div className="products-grid">
          {newest.map((product, index) => (
            <ProductCard key={product._id} product={product} settings={settings} priority={index < 2} withIds={false} />
          ))}
        </div>
      </section>
    </>
  );
};
