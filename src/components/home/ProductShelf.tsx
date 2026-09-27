import React from 'react';
import type { HomeSection, StoreSettings } from '@/types/catalog';
import { shelfViewAllHref } from '@/lib/home';
import { ProductCard } from '../ProductCard';
import { HorizontalScroller } from './HorizontalScroller';
import { SectionHeading } from './SectionHeading';

/** Ancho de cada tarjeta del estante (ver .shelf-item en home.css). */
const SHELF_IMAGE_SIZES = '(max-width: 680px) 45vw, (max-width: 1024px) 30vw, 290px';

interface ProductShelfProps {
  section: Extract<HomeSection, { type: 'productShelf' }>;
  settings: StoreSettings;
}

/** Estante de productos: fila deslizable de tarjetas con "Ver todo". Sin productos no se muestra. */
export const ProductShelf: React.FC<ProductShelfProps> = ({ section, settings }) => {
  if (section.products.length === 0) return null;
  const headingId = `seccion-${section.key}`;

  return (
    <section className="home-section container" aria-labelledby={section.title ? headingId : undefined}>
      <SectionHeading
        id={headingId}
        title={section.title}
        action={{ href: shelfViewAllHref(section), label: settings.labels.viewAllLink }}
      />
      <HorizontalScroller className="shelf-track" label={section.title || undefined}>
        {section.products.map((product) => (
          <li key={product._id} className="shelf-item">
            <ProductCard product={product} settings={settings} imageSizes={SHELF_IMAGE_SIZES} withIds={false} />
          </li>
        ))}
      </HorizontalScroller>
    </section>
  );
};
